export const parseGeminiResponse = (response) => {
  response = response.replace("```json", "").replace("```", "");
  const parsedResponse = JSON.parse(response);
  return parsedResponse;
};

export const formatDateAccordingToGoogle = (date) => {
  return `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
};
