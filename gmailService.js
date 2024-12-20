import { google } from "googleapis";

export class GmailService {
  constructor(auth) {
    this.gmail = google.gmail({ version: "v1", auth });
  }

  async listMessages(query = "", maxResults = 30) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: maxResults,
      });

      const messages = await Promise.all(
        response.data.messages.map((message) => this.getMessage(message.id))
      );

      return messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  async getMessage(messageId) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const message = response.data;
      const headers = message.payload.headers;

      return {
        id: message.id,
        threadId: message.threadId,
        subject: headers.find((header) => header.name === "Subject")?.value,
        from: headers.find((header) => header.name === "From")?.value,
        date: headers.find((header) => header.name === "Date")?.value,
        snippet: message.snippet,
      };
    } catch (error) {
      console.error("Error fetching message details:", error);
      throw error;
    }
  }
}
