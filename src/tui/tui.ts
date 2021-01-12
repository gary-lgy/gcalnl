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

// clear the lines printed below the current line and move the cursor below the input line
const clearLinesBelow = (linesToClear: number) => {
  if (linesToClear > 0) {
    for (let i = 0; i < linesToClear; i++) {
      readline.moveCursor(process.stdout, 0, 1);
      readline.clearLine(process.stdout, 0);
    }

    // go back to the line below the prompt
    for (let i = 0; i < linesToClear - 1; i++) {
      readline.moveCursor(process.stdout, 0, -1);
    }

    // go to start of line
    readline.cursorTo(process.stdout, 0);
  } else {
    // move to the output section
    process.stdout.write("\n");
  }
};

export default class Tui {
  protected linesPrintedLastTime: number = 0;
  protected currentInput: string = "";
  protected currentParsedEvent: ParsedEvent | null = null;

  constructor() {
    if (!process.stdin.isTTY) {
      throw new Error("not tty");
    }
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
  }

  // TODO: refactor into function
  readTuiInput(): Promise<ParsedEvent | null> {
    this.linesPrintedLastTime = 0;
    this.currentInput = "";
    this.currentParsedEvent = null;

    return new Promise<ParsedEvent | null>((resolve) => {
      // TODO: improve functionality and/or code readability with
      // https://github.com/chalk/chalk
      // https://github.com/sindresorhus/ansi-escapes
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
          for (let i = 0; i < this.linesPrintedLastTime + 1; i++) {
            readline.moveCursor(process.stdin, 0, 1);
          }
          readline.cursorTo(process.stdin, 0);

          process.stdin.on("keypress", () => {});
          process.stdin.pause();

          resolve(this.currentParsedEvent);
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
          this.currentInput = this.currentInput.substring(
            0,
            this.currentInput.length - 1
          );
        } else {
          this.currentInput += str;
        }

        // Update the parsed event
        this.currentParsedEvent = parseEventWithTime(this.currentInput);

        clearLinesBelow(this.linesPrintedLastTime);

        this.linesPrintedLastTime = printParsedEvent(this.currentParsedEvent);

        // re-print the input on the prompt line
        for (let i = 0; i < this.linesPrintedLastTime + 1; i++) {
          readline.moveCursor(process.stdout, 0, -1);
        }
        readline.cursorTo(process.stdout, 0);

        process.stdout.write(this.currentInput);
        readline.clearLine(process.stdout, 1);
      });
    });
  }
}
