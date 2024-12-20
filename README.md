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

   ```bash
   mkdir my-node-project
   cd my-node-project
   npm init
   ```

3. Install Dependencies

   ```bash
   npm install express
   ```

4. Write Your First Node.js Script (you can take help from the repo)

5. Run Your Application

   ```bash
   node index.js
   ```
   
### Learn how to use gemini api, send prompts and get the response in a particular format like json.

- Gemini API

1. Search Gemini API keys on google and then open google ai for developer.
2. Click on Get a Gemin
i API key in Google AI Studio.
3. Create an API key or copy from the existing Project.

<br>
<br>

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
