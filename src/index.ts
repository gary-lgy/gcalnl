import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import * as rl from "./readline";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

/**
 * Authorize the given OAuth2Client instance.
 */
async function authorize(oAuth2Client: OAuth2Client) {
  // Check if we have previously stored a token.
  try {
    const token = fs.readFileSync(TOKEN_PATH, "utf-8");
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    await getAccessToken(oAuth2Client);
  }
}

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
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    // Store the token to disk for later program executions
    try {
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log("Token stored to", TOKEN_PATH);
    } catch (err) {
      return console.error(err);
    }
  } catch (err) {
    return console.error("Error retrieving access token", err);
  }
}

/**
 * Lists the next 10 events on the user's primary calendar.
 */
async function listEvents(oAuth2Client: OAuth2Client) {
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  let response: any;
  try {
    response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });
  } catch (err) {
    return console.log("The API returned an error: " + err);
  }

  const events = response.data.items;
  if (events.length) {
    console.log("Upcoming 10 events:");
    events.forEach((event: any) => {
      const start = event.start.dateTime || event.start.date;
      console.log(`${start} - ${event.summary}`);
    });
  } else {
    console.log("No upcoming events found.");
  }
}

async function main() {
  let credentials: any;
  try {
    // Load client secrets from a local file.
    const content = fs.readFileSync("credentials.json", "utf-8");
    credentials = JSON.parse(content);
  } catch (err) {
    return console.log("Error loading client secret file:", err);
  }

  // Authorize a client with credentials, then call the Google Calendar API.
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  await authorize(oAuth2Client);
  await listEvents(oAuth2Client);
}

main().catch(console.error);
