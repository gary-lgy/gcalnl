import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import * as rl from "./readline";

// Adapted based on example from
// https://developers.google.com/calendar/quickstart/nodejs

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

export const getOAuth2Client = async () => {
  // Load client secrets from a local file.
  const content = fs.readFileSync("credentials.json", "utf-8");
  const credentials = JSON.parse(content);

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  try {
    const token = fs.readFileSync(TOKEN_PATH, "utf-8");
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    await getAccessToken(oAuth2Client);
  }

  return oAuth2Client;
};

/**
 * Get and store new token after prompting for user authorization.
 */
async function getAccessToken(oAuth2Client: OAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const code = await rl.question("Enter the code from that page here: ");
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  // Store the token to disk for later program executions
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("Token stored to", TOKEN_PATH);
}
