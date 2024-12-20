import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import path from "path";
import fs from "fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

const LAST_PROCESSED_DATE_PATH = path.join(
  __dirname,
  "last-processed-date.json"
);

dotenv.config();

const __dirname = path.resolve();

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function searchEmails(gmail) {
  try {
    const query = lastProcessedDate
      ? `from:anurag.jptnp@gmail.com after:${lastProcessedDate}`
      : "from:anurag.jptnp@gmail.com";

    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 10,
    });

    const messages = response.data.messages || [];
    const filteredMessages = [];

    for (const message of messages) {
      const fullMessage = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      let emailBody = "";
      if (fullMessage.data.payload.parts) {
        for (const part of fullMessage.data.payload.parts) {
          if (part.body.data) {
            const buff = Buffer.from(part.body.data, "base64");
            emailBody += buff.toString();
          }
        }
      } else if (fullMessage.data.payload.body.data) {
        const buff = Buffer.from(fullMessage.data.payload.body.data, "base64");
        emailBody += buff.toString();
      }

      if (emailBody.toLowerCase().includes("congratulations")) {
        filteredMessages.push(message);
      }
    }

    return filteredMessages;
  } catch (error) {
    console.error("Error searching emails:", error);
    return [];
  }

  try {
    // First, get all messages
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "from:anurag.jptnp@gmail.com",
      maxResults: 30,
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

async function parseEmailWithGemini(email) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Extract the following information from this email about a job offer:
    - Company_Name
    - Job_Role
    - Internship_Stipend
    - PPO_Package (if mentioned)
    - Employment_Type (Full-time/Part-time/Internship)
    - Base_Salary
    - Job_Location (Remote/On-site)
    - Equity_Stock_Options (if applicable)
    - Bonuses
    - CGPA_Criteria
    - Date
    
    
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
        Company_Name: {
          title: [{ text: { content: parsedData.Company_Name } }],
        },
        Job_Role: {
          rich_text: [{ text: { content: parsedData.jobRole } }],
        },
        Internship_Stipend: {
          rich_text: [
            { text: { content: parsedData.internshipStipend.toString() } },
          ],
        },
        PPO_Package: {
          rich_text: [
            { text: { content: parsedData.ppoPackage || "Not mentioned" } },
          ],
        },
        Employment_Type: {
          rich_text: [
            { text: { content: parsedData.employmentType || "Not mentioned" } },
          ],
        },
        Base_Salary: {
          rich_text: [
            { text: { content: parsedData.salary || "Not mentioned" } },
          ],
        },
        Job_Location: {
          rich_text: [
            { text: { content: parsedData.jobLocation || "Not mentioned" } },
          ],
        },
        Stock_Options: {
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
        CGPA_Criteria: {
          rich_text: [
            { text: { content: parsedData.cgpa || "Not mentioned" } },
          ],
        },
      },
      Date: {
        title: [{ text: { content: parsedData.Date } }],
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
  try {
    const auth = await getAuth();
    const gmail = google.gmail({ version: "v1", auth });

    const lastProcessedDate = await loadLastProcessedDate();

    const messages = await searchEmails(gmail, lastProcessedDate);

    let newLastProcessedDate = lastProcessedDate;

    for (const message of messages) {
      const emailContent = await getEmailContent(gmail, message.id);
      if (!emailContent) continue;

      console.log("Email Processing: ", emailContent.subject);

      const parsedData = await parseEmailWithGemini(emailContent);
      if (!parsedData) continue;

      console.log(parsedData);
      console.log(parsedData.Company_Name);

      await addToNotion(parsedData);

      newLastProcessedDate = emailContent.date;
    }

    if (newLastProcessedDate !== lastProcessedDate) {
      await saveLastProcessedDate(newLastProcessedDate);
    }
  } catch (error) {
    console.error("Error in main:", error);
  }
}

async function loadLastProcessedDate() {
  try {
    const content = await fs.readFile(LAST_PROCESSED_DATE_PATH, "utf-8");
    return JSON.parse(content).date;
  } catch (error) {
    return null;
  }
}

async function saveLastProcessedDate(date) {
  try {
    await fs.writeFile(
      LAST_PROCESSED_DATE_PATH,
      JSON.stringify({ date }, null, 2)
    );
  } catch (error) {
    console.error("Error saving last processed date:", error);
  }
}

main();
