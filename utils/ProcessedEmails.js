import { PROCESSED_EMAILS_PATH } from "../constant.js";
import { readFileSync, writeFileSync } from "fs";

// Function to read and parse the processed-emails.json file
export async function getProcessedEmails() {
  try {
    const data = readFileSync(PROCESSED_EMAILS_PATH, "utf8");
    if (data === "") return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading processed emails:", error);
    return [];
  }
}

// Function to get the latest message ID from processed emails
export async function getLatestMessageId() {
  const emails = await getProcessedEmails();
  if (emails.length === 0) return null;

  return emails.reduce((latest, email) => {
    return new Date(email.date) > new Date(latest.date) ? email : latest;
  }, emails[0]).messageId;
}

// Function to get the oldest message ID from processed emails
export async function getOldestMessage() {
  const emails = await getProcessedEmails();

  if (emails.length === 0) return null;

  return emails.reduce((oldest, email) => {
    return new Date(email.date) < new Date(oldest.date) ? email : oldest;
  }, emails[0]);
}

export async function markEmailAsProcessed(email) {
  try {
    const emails = await getProcessedEmails();
    emails.push({
      id: email.id,
      date: email.date,
    });
    writeFileSync(PROCESSED_EMAILS_PATH, JSON.stringify(emails, null, 2));
  } catch (error) {
    console.error("Error saving processed emails:", error);
  }
}
