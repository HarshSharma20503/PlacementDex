import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import path from "path";
import fs from "fs/promises";

const __dirname = path.resolve();

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const CREDENTIALS_PATH = path.join(__dirname, "oauth-credentials.json");
const TOKEN_PATH = path.join(__dirname, "oauth-token.json");

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

async function main() {
  try {
    const auth = await getAuth();
    const gmail = google.gmail({ version: "v1", auth });

    const messages = await searchEmails(gmail);

    for (const message of messages) {
      // Get email content
      const emailContent = await getEmailContent(gmail, message.id);
      if (!emailContent) continue;

      console.log("Email content: ", emailContent);

      return;

      // Parse with Gemini
      // const parsedData = await parseEmailWithGemini(emailContent.body);
      // if (!parsedData) continue;
      // Add to Notion
      // await addToNotion(parsedData);
      // console.log(`Processed email: ${emailContent.subject}`);
      // console.log("Processing email:", message.id);
    }
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
