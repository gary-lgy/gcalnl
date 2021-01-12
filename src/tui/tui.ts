import ansiEscapes from "ansi-escapes";
import readline from "readline";
import { ParsedEvent, parseEventWithTime } from "../parser";
import { formatDate, formatTime } from "./TimeFormatters";

/**
 * Print the event and returns the number of lines printed
 */
const printParsedEvent = (event: ParsedEvent | null): number => {
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

export const readTuiInput = (): Promise<ParsedEvent | null> => {
  if (!process.stdin.isTTY) {
    throw new Error("not tty");
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  let linesPrintedLastTime = 0;
  let currentInput = "";
  let currentParsedEvent: ParsedEvent | null = null;

  return new Promise<ParsedEvent | null>((resolve) => {
    // TODO: improve functionality and/or code readability with
    // https://github.com/chalk/chalk
    // https://github.com/cronvel/terminal-kit

    process.stdin.on("keypress", (str, info) => {
      if (!info) {
        return;
      }

      if (info.ctrl && info.name == "c") {
        process.exit(0);
      }

      if (info.name === "return") {
        // Move the cursor to after the output
        process.stdout.write(ansiEscapes.cursorDown(linesPrintedLastTime + 1));
        process.stdout.write(ansiEscapes.cursorTo(0));

        process.stdin.on("keypress", () => {});
        process.stdin.pause();

        resolve(currentParsedEvent);
        return;
      }

      // TODO: handle arrow keys properly
      if (
        info.name === "up" ||
        info.name === "down" ||
        info.name === "left" ||
        info.name === "right"
      ) {
        return;
      }

      // Update the input string
      if (info && info.name === "backspace") {
        currentInput = currentInput.substring(0, currentInput.length - 1);
      } else {
        currentInput += str;
      }

      // Update the parsed event
      currentParsedEvent = parseEventWithTime(currentInput);

      // move to the details section
      process.stdout.write("\n");

      // remove the details printed below
      process.stdout.write(ansiEscapes.eraseDown);

      // print the new details
      linesPrintedLastTime = printParsedEvent(currentParsedEvent);

      // move the cursor back to the end of the prompt line
      process.stdout.write(ansiEscapes.cursorUp(linesPrintedLastTime + 1));

      // update the prompt line with the current input
      process.stdout.write(ansiEscapes.cursorTo(0));
      process.stdout.write(currentInput);
      process.stdout.write(ansiEscapes.eraseEndLine);
    });
  });
};
