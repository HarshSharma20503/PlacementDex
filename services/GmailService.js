import { google } from "googleapis";
import getAuth from "../utils/GoogleAuth.js";
import {
  getOldestMessageId,
  getLatestMessageId,
} from "../utils/ProcessedEmails.js";
import { NODE_ENV, TNP_EMAILS } from "../constant.js";

class GmailService {
  async initialize() {
    console.log("Initializing Gmail Service");
    this.auth = await getAuth();
    this.GMAIL = google.gmail({ version: "v1", auth: this.auth });
    console.log("Gmail Service Initialized");
  }

  constructor() {
    this.initialize();
  }

  async getEmailContent(messageId) {
    try {
      const message = await this.GMAIL.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const headers = message.data.payload.headers;
      const subject = headers.find((header) => header.name === "Subject").value;
      const date = headers.find((header) => header.name === "Date").value;

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
        date,
        body,
      };
    } catch (error) {
      console.error("Error fetching email content:", error);
      return null;
    }
  }

  async getCongratulatoryEmails(messages) {
    const filteredMessages = [];
    for (const message of messages) {
      const fullMessage = await this.GMAIL.users.messages.get({
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
  }

  async searchUnprocessedEmails() {
    console.log("Searching for unprocessed emails");

    const oldestMessageId = getOldestMessageId();

    console.log("Oldest Message ID: ", oldestMessageId);

    const query = `from:(${TNP_EMAILS.join(" OR ")}) ${
      oldestMessageId ? `before:${oldestMessageId}` : ""
    }`;

    const response = await this.GMAIL.users.messages.list({
      userId: "me",
      q: query,
      maxResults: NODE_ENV === "development" ? 20 : 100000,
    });

    const messages = response.data.messages || [];
    const filteredMessages = await this.getCongratulatoryEmails(messages);

    let email = [];

    for (const message of filteredMessages) {
      email.push(await this.getEmailContent(message.id));
    }

    return email;
  }

  async searchUnprocessedLatestEmails() {
    console.log("Searching for unprocessed latest emails");

    const latestMessageId = getLatestMessageId();

    const query = `from:(${TNP_EMAILS.join(" OR ")} ${
      latestMessageId ? `after:${latestMessageId}` : ""
    })`;

    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: NODE_ENV === "development" ? 2 : 100000,
    });

    const messages = response.data.messages || [];
    const filteredMessages = await this.getCongratulatoryEmails(messages);
    return filteredMessages;
  }
}

export default GmailService;
