export const parseGeminiResponse = (response) => {
  response = response.replace("```json", "").replace("```", "");
  const parsedResponse = JSON.parse(response);
  return parsedResponse;
};
