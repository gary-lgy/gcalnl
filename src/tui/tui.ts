import ansiEscapes from "ansi-escapes";
import readline from "readline";
import { ParsedResult, parseEventWithTime } from "../parser";
import { printCalendarObject } from "./DetailsPrinter";

export const INPUT_TYPE_EVENT = "event";
export const INPUT_TYPE_TASK = "task";

export type CalendarObjectType = "task" | "event";

export interface CalendarObject {
  type: CalendarObjectType | null;
  body: ParsedResult | null;
}

export const readTuiInput = (): Promise<CalendarObject> => {
  if (!process.stdin.isTTY) {
    throw new Error("not tty");
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  let linesPrintedLastTime = 0;
  let currentInput = "";
  let parsedInput: CalendarObject = { type: null, body: null };

  return new Promise<CalendarObject>((resolve) => {
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

        resolve(parsedInput);
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

      // Update the parsed result
      if (currentInput.startsWith(INPUT_TYPE_TASK)) {
        parsedInput.type = INPUT_TYPE_TASK;
        parsedInput.body = parseEventWithTime(
          currentInput.substring(INPUT_TYPE_TASK.length)
        );
      } else if (currentInput.startsWith(INPUT_TYPE_EVENT)) {
        parsedInput.type = INPUT_TYPE_EVENT;
        parsedInput.body = parseEventWithTime(
          currentInput.substring(INPUT_TYPE_EVENT.length)
        );
      } else {
        parsedInput.type = null;
        parsedInput.body = null;
      }

      // move to the details section
      process.stdout.write("\n");

      // remove the details printed below
      process.stdout.write(ansiEscapes.eraseDown);

      // print the new details
      linesPrintedLastTime = printCalendarObject(parsedInput);

      // move the cursor back to the end of the prompt line
      process.stdout.write(ansiEscapes.cursorUp(linesPrintedLastTime + 1));

      // update the prompt line with the current input
      process.stdout.write(ansiEscapes.cursorTo(0));
      process.stdout.write(currentInput);
      process.stdout.write(ansiEscapes.eraseEndLine);
    });
  });
};
