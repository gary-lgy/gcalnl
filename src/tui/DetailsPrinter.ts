import { ParsedResult } from "../parser";
import { formatDate, formatTime } from "./TimeFormatters";
import { CalendarObject } from "./tui";

/**
 * Print the given object and returns the number of lines printed
 */
export const printCalendarObject = (parsedInput: CalendarObject): number => {
  switch (parsedInput.type) {
    case null: {
      process.stdout.write("Unknown input type. Try 'event' or 'task'\n");
      return 1;
    }
    case "task": {
      return printTaskDetails(parsedInput.body);
    }
    case "event": {
      return printEventDetails(parsedInput.body);
    }
  }
};

const printEventDetails = (event: ParsedResult | null) => {
  if (event === null) {
    process.stdout.write("Need more information...\n");
    return 1;
  }

  let linesPrinted = 0;

  process.stdout.write("Event\n");
  linesPrinted++;

  process.stdout.write(`Title: ${event.title}\n`);
  linesPrinted++;

  process.stdout.write(`Start date: ${formatDate(event.startDate)}\n`);
  linesPrinted++;

  if (event.hasTime) {
    process.stdout.write(`Start time: ${formatTime(event.startDate)}\n`);
    linesPrinted++;
  }

  if (event.endDate) {
    process.stdout.write(`End date: ${formatDate(event.endDate)}\n`);
    linesPrinted++;

    if (event.hasTime) {
      process.stdout.write(`End time: ${formatTime(event.endDate)}\n`);
      linesPrinted++;
    }
  }

  return linesPrinted;
};

const printTaskDetails = (task: ParsedResult | null) => {
  if (task === null) {
    process.stdout.write("Need more information...\n");
    return 1;
  }

  let linesPrinted = 0;

  process.stdout.write("Task\n");
  linesPrinted++;

  process.stdout.write(`Title: ${task.title}\n`);
  linesPrinted++;

  process.stdout.write(`Date: ${formatDate(task.startDate)}\n`);
  linesPrinted++;

  // Time is disregarded by Google API
  // https://developers.google.com/tasks/reference/rest/v1/tasks#Task

  // if (task.hasTime) {
  //   process.stdout.write(`Time: ${formatTime(task.startDate)}\n`);
  //   linesPrinted++;
  // }

  return linesPrinted;
};
