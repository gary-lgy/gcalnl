import { add, formatISO, formatRFC3339 } from "date-fns";
import { calendar_v3, tasks_v1 } from "googleapis";
import { ParsedResult } from "../parser";

export const parsedResultToGCalEvent = (
  event: ParsedResult
): calendar_v3.Schema$Event => {
  const eventStart: calendar_v3.Schema$EventDateTime = {};
  const eventEnd: calendar_v3.Schema$EventDateTime = {};

  if (event.hasTime) {
    eventStart.dateTime = formatRFC3339(event.startDate);
    // if no end time specified, default to 1hr after start time
    const endDateTime =
      event.endDate ??
      add(event.startDate, {
        hours: 1,
      });
    eventEnd.dateTime = formatRFC3339(endDateTime);
  } else {
    // all-day event
    eventStart.date = formatISO(event.startDate, {
      representation: "date",
    });
    // if no end date is specified, assume same-day event
    // end date is exclusive, therefore we add 1 day to it
    const endDate = event.endDate ?? add(event.startDate, { days: 1 });
    eventEnd.date = formatISO(endDate, { representation: "date" });
  }

  return {
    summary: event.title,
    start: eventStart,
    end: eventEnd,
  };
};

export const parsedResultToGTask = (
  task: ParsedResult
): tasks_v1.Schema$Task => {
  // time is disregarded
  // https://developers.google.com/tasks/reference/rest/v1/tasks#Task
  return {
    title: task.title,
    due: formatRFC3339(task.startDate),
  };
};
