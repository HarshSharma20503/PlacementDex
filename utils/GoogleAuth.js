import { authenticate } from "@google-cloud/local-auth";
import { CREDENTIALS_PATH, TOKEN_PATH, SCOPES } from "../constant.js";
import fs from "fs/promises";
import { google } from "googleapis";

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    console.log(err);
    return null;
  }
}

const getAuth = async () => {
  try {
    console.log("Getting Google Auth");
    let auth = await loadSavedCredentialsIfExist();
    if (auth) {
      return auth;
    }
    auth = await authenticate({
      keyfilePath: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
    if (auth.credentials) {
      await saveCredentials(auth);
    }
    return auth;
  } catch (error) {
    console.error("Error during authentication:", error);
    throw error;
  }
};

export default getAuth;
