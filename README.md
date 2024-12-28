# PlacementDex

## Introduction 

The script automates the process of fetching job offer emails, extracting key information from them, and storing this information in a Notion database for easy access and visibility. This script automates the tedious process of manually extracting and organizing job offer details from emails, leveraging powerful llm to streamline the workflow and improve efficiency.


## Motivation

Junior students in college often seek information from their seniors about the current status of campus placements. To provide detailed and accurate information, seniors can use this script to automatically fetch data from emails sent by their college's TNP cells. This data can then be organized and stored in a publicly visible page or database. By doing so, seniors can ensure that juniors have easy access to up-to-date information about placement opportunities, helping them make informed decisions and stay prepared for their future careers.

## How to run this script

1. Git clone this repo
   
   ```bash
   git clone https://github.com/HarshSharma20503/PlacementDex
   ```

2. Install packages

   ```bash
   cd placementDex && npm install
   ```

3. Create .env file that contains everything that .env.example has :-
 
   **Note**:
   - TNP_EMAILS = `example1@gmail.com`, `example2@gmail.com`, `example3@gmail.com` (Put Emails of your TNP CELL from your college)
   - You would also require Google Credentials ( How can you get those credentials is given below).
     
5. Run Your Application after filling the required data.

   ```bash
   npm start
   ```

## How to get these Keys 
1. GEMINI_API_KEY
2. NOTION_API_KEY
3. NOTION_DATABASE_ID
4. GOOGLE Credentials

### Gemini API

1. Search Gemini API keys on google and then open google ai for developer.
2. Click on Get a Gemini API key in Google AI Studio.
3. Create API key

### Notion API keys

- (You can refer to this https://developers.notion.com/docs/create-a-notion-integration)
1. Search Notion API Keys on Google. Open the notion webpage.
2. Create your integration in Notion. (<https://www.notion.com/my-integrations>.)
3. Click + New integration.
4. Enter the integration name and select the associated workspace for the new integration.
5. API requests require an API secret to be successfully authenticated. Visit the Configuration tab to get your integration's API secret (or “Internal Integration Secret”).
6. Give your integration page permissions.
(Do the same as mentioned on the website)

### Notion Database ID keys
1. Login to your Notion Account.
2. Select the database.
3. Observe the link. The database ID is from www.notion.so/ to the question mark.

    For example: Here the database ID is 162a51b137f480a7trtew92244 from the link given below. 

   ```
      https://www.notion.so/162a51b137f480a7trtew92244?v=162a51brte
   ```

### How to get Google Credentials 
1. Please read from - https://support.google.com/cloud/answer/6158849?hl=en
2. Go to your Project Section then go to Credentials.
3. Please Enable Gmail API. (You can find Gmail Service in the Library section by searching 'Gmail' )
4. Select Create Credentials - OAuth Client ID - Select Application type as "Desktop APP".
5. Download the JSON file. Name it `oauth-credentials.json`. Save it in your PlacementDex Folder.
6. Go to OAuth Consent screen -> Production -> Select Publish APP.
7. In the same page put "your_email_id" under "Test Users".

---

## Create a table in notion with these attributes(columns)

This is required because in the script we have asked AI to fetch the following details into notion.
(You can change the prompt and then change the notion table's columns as per the requirement of given prompt) 

1. Company_Name
2. Job_Role
3. Internship_Stipend
4. Internship_Duration
5. Job_Location
6. No_of_students_who_got_offers
7. CTC_Details
8. FTE_Expected_package
9. FTE_Package
10. Bond

## How you can modify it?

Instead of using generic 'Training And Placement Cell (TNP)' emails, utilize your college's specific TNP cell email addresses. Identify a common keyword (in the subject or body) consistently used in their placement-related emails. Replace this keyword 'congratulations' within the prompt to extract the desired data into the Notion database.


### Work Flow of the Scrpit
![Work_Flow](Work_Flow.jpeg)


1. **Finds and Reads:** It searches your Gmail for emails with "congratulations" in body or subject of emails (customizable: You can use any other common text ) and extracts the full content.

2. **Extracts Key Details:** A smart AI (Gemini) reads the emails and pulls out important information like company name, job title, salary, location etc.

3. **Organizes in Notion:**  The script saves all this extracted information in a neat and organized database within your Notion account for easy access and sharing.




