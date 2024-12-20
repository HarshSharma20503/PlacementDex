import path from "path";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.resolve();

// File Paths
export const CREDENTIALS_PATH = path.join(__dirname, "oauth-credentials.json");
export const TOKEN_PATH = path.join(__dirname, "oauth-token.json");
export const PROCESSED_EMAILS_PATH = path.join(
  __dirname,
  "processed-emails.json"
);

// ENV Constants
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const NOTION_API_KEY = process.env.NOTION_API_KEY;
export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
export const TNP_EMAILS = process.env.TNP_EMAILS.split(",");
export const NODE_ENV = process.env.NODE_ENV || development;

export const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
