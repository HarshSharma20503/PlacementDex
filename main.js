import dotenv from "dotenv";
dotenv.config();
import GmailService from "./services/GmailService.js";
import GeminiService from "./services/GeminiService.js";
import NotionService from "./services/NotionService.js";
import inquirer from "inquirer";
import { parseGeminiResponse } from "./utils/helper.js";
import { markEmailAsProcessed } from "./utils/ProcessedEmails.js";
import { markEmailAsFailed } from "./utils/FailedEmails.js";

const Options = {
  "Fetch Oldest Unprocessed Emails": 1,
  "Fetch Latest Unprocessed Emails": 2,
};

const getChoiceFromUser = async () => {
  const { Choice } = await inquirer.prompt([
    {
      type: "list",
      name: "Choice",
      message: "Choose an option:",
      choices: Object.keys(Options),
      // Center the menu using padding
      prefix: " ".repeat(process.stdout.columns / 4),
    },
  ]);
  return Choice;
};

async function main() {
  const gmailService = new GmailService();
  await gmailService.initialize();
  const geminiService = new GeminiService();
  const notionService = new NotionService();

  const choice = await getChoiceFromUser();
  console.log("Getting Gmail Service");

  let emails;
  if (choice === "Fetch Oldest Unprocessed Emails") {
    console.log("Fetching Oldest Unprocessed Emails");
    emails = await gmailService.searchUnprocessedEmails();
  } else {
    console.log("Fetching Latest Unprocessed Emails");
    emails = await gmailService.searchUnprocessedLatestEmails();
  }
  if (emails.length === 0) {
    console.log("No emails to process");
    return;
  }
  console.log("Parsing emails with Gemini");
  for (const email of emails) {
    const response = await geminiService.parseEmailWithGemini(email);
    const data = parseGeminiResponse(response.text());
    console.log("******************************************************");
    console.log("Company Name:", data.Company_Name);
    console.log("Adding to Notion");
    const success = await notionService.addToNotion(data);
    if (success) {
      await markEmailAsProcessed(email);
    } else {
      await markEmailAsFailed(email);
    }
    console.log("******************************************************");
  }
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((err) => {
    console.error(err);
  });
