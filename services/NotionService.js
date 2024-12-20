import {
  NOTION_API_KEY,
  NOTION_DATABASE_ID,
  NOTION_DATABASE_COLUMNS,
} from "../constant.js";
import { Client } from "@notionhq/client";

class NotionService {
  constructor() {
    this.client = new Client({ auth: NOTION_API_KEY });
  }

  async findExistingCompanyRecord(companyName) {
    const searchResponse = await this.client.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: {
        property: "Company_Name",
        rich_text: {
          equals: companyName,
        },
      },
    });
    return searchResponse.results;
  }

  async updateNoOfOffers(pageId, updatedOffers) {
    try {
      await this.client.pages.update({
        page_id: pageId,
        properties: {
          No_of_students_who_got_offers: {
            rich_text: [
              {
                text: {
                  content: updatedOffers.toString(),
                },
              },
            ],
          },
        },
      });
    } catch (error) {
      // console.error("Error updating notion entry:", error);
    }
  }

  async createCompanyEntry(parsedData) {
    try {
      const properties = {
        Company_Name: {
          title: [{ text: { content: parsedData.Company_Name } }],
        },
      };

      NOTION_DATABASE_COLUMNS.forEach((column) => {
        if (parsedData[column] && column !== "Company_Name") {
          properties[column] = {
            rich_text: [{ text: { content: parsedData[column].toString() } }],
          };
        }
      });

      const response = await this.client.pages.create({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: properties,
      });
    } catch (error) {
      console.error("Error creating notion entry:", error);
    }
  }

  async addToNotion(parsedData) {
    try {
      // Search for existing company name in the database
      const existingRecords = await this.findExistingCompanyRecord(
        parsedData.Company_Name
      );

      if (existingRecords.length > 0) {
        // Company already exists, update the number of offers
        const pageId = existingRecords[0].id;

        const currentOffers =
          existingRecords[0].properties.No_of_students_who_got_offers
            .rich_text[0].text.content || 0;

        const newOffers =
          parseInt(currentOffers) + parsedData.No_of_students_who_got_offers;

        this.updateNoOfOffers(pageId, newOffers);
      } else {
        await this.createCompanyEntry(parsedData);
      }
      return true;
    } catch (error) {
      console.error("Error adding to Notion:", error);
      return false;
    }
  }
}

export default NotionService;
