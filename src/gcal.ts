import { calendar_v3, google } from "googleapis";
import { getOAuth2Client } from "./gAuth";

export default class GCal {
  private calendar: calendar_v3.Calendar;

  private constructor(calendar: calendar_v3.Calendar) {
    this.calendar = calendar;
  }

  public static async getInstance() {
    const oAuth2Client = await getOAuth2Client();
    const calendar = google.calendar({
      version: "v3",
      auth: oAuth2Client,
    });
    return new GCal(calendar);
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
}
