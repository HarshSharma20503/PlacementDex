require("dotenv").config();
const { google } = require("googleapis");
const { Client } = require("@notionhq/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

// Credentials.json
// Permissions / scope -> code me galat ya fir permisson conosle me woh galat hai

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID; // Set your Database ID here

// Initialize Gemini (Google Generative AI)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gmail API setup
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

async function getGmailService() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH, // Ensure this path is correct
    scopes: SCOPES,
  });
  const client = await auth.getClient();
  return google.gmail({ version: "v1", auth: client });
}

async function searchEmails(gmail) {
  try {
    // Step 1: List all messages without any specific query (i.e., no filter)
    const response = await gmail.users.messages.list({
      userId: "me",
    });

    const messages = response.data.messages || [];

    // Step 2: Filter messages by checking the body content (optional, can skip this if you want all emails)
    const filteredMessages = [];
    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const body = msg.data.payload.parts
        .map((part) => part.body.data)
        .join("");

      filteredMessages.push(message);
    }

    return filteredMessages;
  } catch (error) {
    console.error("Error searching emails:", error);
    return [];
  }
}

async function getEmailContent(gmail, messageId) {
  try {
    const message = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const headers = message.data.payload.headers;
    const subject = headers.find((header) => header.name === "Subject").value;

    let body = "";
    if (message.data.payload.parts) {
      body = Buffer.from(
        message.data.payload.parts[0].body.data,
        "base64"
      ).toString();
    } else if (message.data.payload.body.data) {
      body = Buffer.from(message.data.payload.body.data, "base64").toString();
    }

    return { subject, body };
  } catch (error) {
    console.error("Error getting email content:", error);
    return null;
  }
}

async function parseEmailWithGemini(content) {
  const model = genAI.getGenerativeModel({ model: "gemini" });

  const prompt = `
    Extract the following information from this email about a job offer:
    - Company Name
    - Job Role
    - Internship Stipend
    - PPO Package (if mentioned)
    - Employment Type (Full-time/Part-time/Internship)
    - Salary (if different from PPO Package)
    - Job Location (Remote/On-site)
    - Equity/Stock Options (if applicable)
    - Bonuses
    - CGPA
    
    Return the information in JSON format.
    
    Email content:
    ${content}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error parsing with Gemini:", error);
    return null;
  }
}

async function addToNotion(parsedData) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        "Company Name": {
          title: [{ text: { content: parsedData.companyName } }],
        },
        "Job Role": {
          rich_text: [{ text: { content: parsedData.jobRole } }],
        },
        "Internship Stipend": {
          rich_text: [
            { text: { content: parsedData.internshipStipend.toString() } },
          ],
        },
        "PPO Package": {
          rich_text: [
            { text: { content: parsedData.ppoPackage || "Not mentioned" } },
          ],
        },
        "Employment Type": {
          rich_text: [
            { text: { content: parsedData.employmentType || "Not mentioned" } },
          ],
        },
        Salary: {
          rich_text: [
            { text: { content: parsedData.salary || "Not mentioned" } },
          ],
        },
        "Job Location": {
          rich_text: [
            { text: { content: parsedData.jobLocation || "Not mentioned" } },
          ],
        },
        "Equity/Stock Options": {
          rich_text: [
            {
              text: {
                content: parsedData.equityStockOptions || "Not mentioned",
              },
            },
          ],
        },
        Bonuses: {
          rich_text: [
            { text: { content: parsedData.bonuses || "Not mentioned" } },
          ],
        },
        CGPA: {
          rich_text: [
            { text: { content: parsedData.cgpa || "Not mentioned" } },
          ],
        },
      },
    });
    console.log("Page created:", response);
  } catch (error) {
    console.error("Error adding to Notion:", error);
  }
}

async function main() {
  try {
    // Initialize Gmail service
    const gmail = await getGmailService();

    console.log("Gmail service initialized!");
    // console.log(gmail.users);

    // Search for emails
    const messages = await searchEmails(gmail);

    for (const message of messages) {
      // Get email content
      const emailContent = await getEmailContent(gmail, message.id);
      if (!emailContent) continue;

      // Parse with Gemini
      const parsedData = await parseEmailWithGemini(emailContent.body);
      if (!parsedData) continue;

      // Add to Notion
      await addToNotion(parsedData);

      console.log(`Processed email: ${emailContent.subject}`);
    }

    // console.log("Processing completed!");
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

// Start the process
main();
