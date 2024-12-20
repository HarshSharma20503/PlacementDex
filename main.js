import dotenv from "dotenv";
dotenv.config();
import GmailService from "./services/GmailService.js";
import inquirer from "inquirer";

const gmailService = new GmailService();

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
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((err) => {
    console.error(err);
  });
