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
export const FAILED_EMAILS_PATH = path.join(__dirname, "failed-emails.json");

// ENV Constants
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const NOTION_API_KEY = process.env.NOTION_API_KEY;
export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
export const TNP_EMAILS = process.env.TNP_EMAILS.split(",");
export const NODE_ENV = process.env.NODE_ENV || development;

export const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
export const BASE_PROMPT = `
I have received the following email from my college regarding job offers from a company. Please extract the following information, if present, from this email:
	-	Company_Name (string) - Name of the company
	-	Job_Role (string) - Software Engineer, Data Scientist, etc.
  - offer_type (string) - Internship or Full Time
	-	Internship_Stipend (string) - Internship stipend
  - Internship_Duration (string) - Internship Duration
	-	Job_Location (string) - Location of the job
	-	No_of_students_who_got_offers (integer) - Number of students who got offers
	-	FTE_Expected_package (string) - expected salary or ctc package for FTE in lakhs  per annum after internship, the expected paackage can also be in range like 16-20 LPA
	-	FTE_Package (string) - package for FTE in lakhs per annum
  - Bond (string) - details of Bond if present

Return the information in JSON format.

Note:
1. If the offer is of internship than FTE_Expected_package should be present 
2. If the offer is of FTE than Internship_Stipend and Internship_Duration should not be present.
3. If the body of the email contains Internship duration or Internship Stipend that means the offer is Internship not full time.
4. If any of the property is not present then return empty string for that property.


Response should look like:

example Response 1:
{
  "Company_Name": "Google",
  "Job_Role": "Software Engineer",
  "offer_type": "Internship",
  "Internship_Stipend": 50000,
  "Internship_Duration": "6 months",
  "Job_Location": "Bangalore",
  "No_of_students_who_got_offers": 5,
  "CTC_Details": "10 LPA",
  "FTE_Expected_package": 16-20 LPA",
}

example Response 2:
{
  "Company_Name": "Atlassian",
  "Job_Role": "Data Analytics",
  "offer_type": "FTE",
  "Job_Location": "Bangalore",
  "No_of_students_who_got_offers": 5,
  "CTC_Details": "52 LPA",
  "FTE_Package": 16-20 LPA",
}

The Email is as follows:

`;

export const NOTION_DATABASE_COLUMNS = [
  "Company_Name",
  "Job_Role",
  "Internship_Stipend",
  "Internship_Duration",
  "Job_Location",
  "No_of_students_who_got_offers",
  "CTC_Details",
  "FTE_Expected_package",
  "FTE_Package",
  "Bond",
];
