import fs from "fs/promises";
import { FAILED_EMAILS_PATH } from "../constant.js";

// save the failed emails in failed-emails.json

const getFailedEmails = async () => {
  try {
    const data = await fs.readFile(FAILED_EMAILS_PATH, "utf8");
    if (data === "") return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading failed emails:", error);
    return [];
  }
};

export const markEmailAsFailed = async (email) => {
  try {
    const failedEmails = await getFailedEmails();
    failedEmails.push(email);
    await fs.writeFile(
      FAILED_EMAILS_PATH,
      JSON.stringify(failedEmails, null, 2)
    );
  } catch (error) {
    console.error("Error saving failed emails:", error);
  }
};
