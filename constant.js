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
export const BASE_PROMPT =`
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
  `
