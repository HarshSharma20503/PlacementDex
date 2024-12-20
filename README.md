# PlacementDex

## Steps to follow

- Learn how to create node projects.
- Email se fetch karna (if possible by search by query).
- Learn how to use gemini api, send prompts and get the response in a particular format like json.
- Learn notion sdk and how to insert a row in the database/table.

## Avinash Progress Report

### Learn how to create node projects
1. Install Node.js
2. Initialize a New Project
```
    mkdir my-node-project
    cd my-node-project
    npm init
```
3. Install Dependencies
```
npm install express
```
4. Write Your First Node.js Script (you can take help from the repo)

5. Run Your Application
```
node index.js
```


---
### Fetching the emails .
```
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import path from "path";
import fs from "fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();

const __dirname = path.resolve();

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const CREDENTIALS_PATH = path.join(__dirname, "oauth-credentials.json");
const TOKEN_PATH = path.join(__dirname, "oauth-token.json");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function searchEmails(gmail) {
  try {
    // First, get all messages
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "from:anurag.jptnp@gmail.com",
      maxResults: 30,
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
```


---
### Learn how to use gemini api, send prompts and get the response in a particular format like json.


- Gemini API
1. Search Gemini API keys on google and then open google ai for developer.
2. Click on Get a Gemini API key in Google AI Studio.
3. Create an API key or copy from the existing Project.

- Send Prompt
```
async function parseEmailWithGemini(email) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
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
    
    Email subject:
    ${email.subject}

    Email content:
    ${email.body}
  `;
```
<br>
<br>
 

 - Responce in particular format
 ```

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    // console.log("Response: ", response.text());

    // remove ```json from the start and ``` from the end of the response.text()

    const responseText = response
      .text()
      .replace("```json", "")
      .replace("```", "");

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error parsing with Gemini:", error);
    return null;
  }
}
```


### Use Notion for storing Data 
code 
```
async function addToNotion(parsedData) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        "Company_Name": {
          title: [{ text: { content: parsedData.Company_Name } }],
        },
        "Job_Role": {
          rich_text: [{ text: { content: parsedData.jobRole } }],
        },
        "Internship_Stipend": {
          rich_text: [
            { text: { content: parsedData.internshipStipend.toString() } },
          ],
        },
        "PPO_Package": {
          rich_text: [
            { text: { content: parsedData.ppoPackage || "Not mentioned" } },
          ],
        },
        "Employment_Type": {
          rich_text: [
            { text: { content: parsedData.employmentType || "Not mentioned" } },
          ],
        },
        "Base_Salary": {
          rich_text: [
            { text: { content: parsedData.salary || "Not mentioned" } },
          ],
        },
        "Job_Location": {
          rich_text: [
            { text: { content: parsedData.jobLocation || "Not mentioned" } },
          ],
        },
        "Stock_Options": {
          rich_text: [
            {
              text: {
                content: parsedData.equityStockOptions || "Not mentioned",
              },
            },
          ],
        },
        "Bonuses": {
          rich_text: [
            { text: { content: parsedData.bonuses || "Not mentioned" } },
          ],
        },
        "CGPA_Criteria": {
          rich_text: [
            { text: { content: parsedData.cgpa || "Not mentioned" } },
          ],
        },
      },
      "Date": {
        title: [{ text: { content: parsedData.Date } }],
      },
    });
    console.log("Page created:", response);
  } catch (error) {
    console.error("Error adding to Notion:", error);
  }
}
```

### 3 API Keys are Required 
1. GEMINI_API_KEY
2. NOTION_API_KEY
3. NOTION_DATABASE_ID



- Notion API keys
1. Search Notion API Keys on google.Open the notion webpage.
2. Click on view my Integration.
3. Click on add new integration.
4. Fill the required information and Save it.
5. You will get your Notion API keys.  
(internal integration token)

<br> 

- Notion Database API keys
1. Login to your Notion Account .
2. Select the database .
3. Observe the link.The Database id is from www.notion.so/ to the question mark ?

for example : Here the database id is 162a51b137f480a7trtew922 from the link given below. 

```
https://www.notion.so/162a51b137f480a7trtew922?v=162a51brte
```

<br>

 - Set Up Environment Variables
1. Create .env file to store all 3 API Keys


<br> 

### Create .gitignore file
It can contain these files 
1. credentials.json
2. .env
3. node_modules
4. oauth-credentials.json
5. oauth-token.json 



 












