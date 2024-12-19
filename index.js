import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import path from "path";
import fs from "fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();

const __dirname = path.resolve();

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const CREDENTIALS_PATH = path.join(__dirname, "oauth-credentials.json");
const TOKEN_PATH = path.join(__dirname, "oauth-token.json");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function searchEmails(gmail) {
  try {
    // First, get all messages
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "from:anurag.jptnp@gmail.com",
      maxResults: 10,
    });

    const messages = response.data.messages || [];
    const filteredMessages = [];

    // Step 2: Check each message's body for "congratulations"
    for (const message of messages) {
      const fullMessage = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      // Get the email body
      let emailBody = "";
      if (fullMessage.data.payload.parts) {
        // If the message has parts (usually for HTML and plain text)
        for (const part of fullMessage.data.payload.parts) {
          if (part.body.data) {
            const buff = Buffer.from(part.body.data, "base64");
            emailBody += buff.toString();
          }
        }
      } else if (fullMessage.data.payload.body.data) {
        // If the message is plain text only
        const buff = Buffer.from(fullMessage.data.payload.body.data, "base64");
        emailBody += buff.toString();
      }

      // Check if "congratulations" exists in the body (case insensitive)
      if (emailBody.toLowerCase().includes("congratulations")) {
        filteredMessages.push(message);
      }
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
    }

    return {
      id: message.data.id,
      subject,
      body,
    };
  } catch (error) {
    console.error("Error fetching email content:", error);
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

const getAuth = async () => {
  try {
    let auth = await loadSavedCredentialsIfExist();
    if (auth) {
      return auth;
    }
    auth = await authenticate({
      keyfilePath: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
    if (auth.credentials) {
      await saveCredentials(auth);
    }
    return auth;
  } catch (error) {
    console.error("Error during authentication:", error);
    throw error;
  }
};

async function parseEmailWithGemini(email) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Extract the following information from this email about a job offer:
    - Company_Name
    - Job_Role
    - Internship_Stipend
    - PPO_Package (if mentioned)
    - Employment_Type (Full-time/Part-time/Internship)
    - Salary (if different from PPO Package)
    - Job_Location (Remote/On-site)
    - Equity_Stock_Options (if applicable)
    - Bonuses
    - CGPA
    
    Return the information in JSON format.
    
    Email subject:
    ${email.subject}

    Email content:
    ${email.body}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    // console.log("Response: ", response.text());

    // remove ```json from the start and ``` from the end of the response.text()

    const responseText = response
      .text()
      .replace("```json", "")
      .replace("```", "");

    return JSON.parse(responseText);
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
          title: [{ text: { content: parsedData.Company_Name } }],
        },
        // "Job Role": {
        //   rich_text: [{ text: { content: parsedData.jobRole } }],
        // },
        // "Internship Stipend": {
        //   rich_text: [
        //     { text: { content: parsedData.internshipStipend.toString() } },
        //   ],
        // },
        // "PPO Package": {
        //   rich_text: [
        //     { text: { content: parsedData.ppoPackage || "Not mentioned" } },
        //   ],
        // },
        // "Employment Type": {
        //   rich_text: [
        //     { text: { content: parsedData.employmentType || "Not mentioned" } },
        //   ],
        // },
        // Salary: {
        //   rich_text: [
        //     { text: { content: parsedData.salary || "Not mentioned" } },
        //   ],
        // },
        // "Job Location": {
        //   rich_text: [
        //     { text: { content: parsedData.jobLocation || "Not mentioned" } },
        //   ],
        // },
        // "Equity/Stock Options": {
        //   rich_text: [
        //     {
        //       text: {
        //         content: parsedData.equityStockOptions || "Not mentioned",
        //       },
        //     },
        //   ],
        // },
        // Bonuses: {
        //   rich_text: [
        //     { text: { content: parsedData.bonuses || "Not mentioned" } },
        //   ],
        // },
        // CGPA: {
        //   rich_text: [
        //     { text: { content: parsedData.cgpa || "Not mentioned" } },
        //   ],
        // },
      },
    });
    console.log("Page created:", response);
  } catch (error) {
    console.error("Error adding to Notion:", error);
  }
}

async function main() {
  try {
    const auth = await getAuth();
    const gmail = google.gmail({ version: "v1", auth });

    const messages = await searchEmails(gmail);

    for (const message of messages) {
      // Get email content
      const emailContent = await getEmailContent(gmail, message.id);
      if (!emailContent) continue;

      console.log("Email Processing: ", emailContent.subject);

      // Parse with Gemini
      const parsedData = await parseEmailWithGemini(emailContent);
      if (!parsedData) continue;

      console.log(parsedData);
      console.log(parsedData.Company_Name);
      // Add to Notion
      await addToNotion(parsedData);
      // console.log(`Processed email: ${emailContent.subject}`);
      // console.log("Processing email:", message.id);
      return;
    }
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
