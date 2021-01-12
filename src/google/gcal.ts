import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";

export default class GCal {
  private calendar: calendar_v3.Calendar;

  constructor(oAuth2Client: OAuth2Client) {
    this.calendar = google.calendar({
      version: "v3",
      auth: oAuth2Client,
    });
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   */
  public async listEvents() {
    let response: any;
    try {
      response = await this.calendar.events.list({
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

  public async createEvent(event: calendar_v3.Schema$Event) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });
      console.log("Event created: %s", response.data.htmlLink);
    } catch (err) {
      console.log("There was an error contacting the Calendar service: " + err);
      return;
    }
  }
}
