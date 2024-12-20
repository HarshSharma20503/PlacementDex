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