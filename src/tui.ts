import { format } from "date-fns";
import readline from "readline";
import { parse, ParsedEvent } from "./parser";

// TODO: consider adding humanized date (e.g., 2 days later)
const formatDate = (date: Date) => {
  return format(date, "d MMM y");
};

const formatTime = (date: Date) => {
  return format(date, "HH:mm");
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

  read(): Promise<ParsedEvent | null> {
    this.linesPrintedLastTime = 0;
    this.currentInput = "";
    this.currentParsedEvent = null;

    return new Promise<ParsedEvent | null>((resolve) => {
      // TODO: use https://github.com/chalk/chalk and https://github.com/sindresorhus/ansi-escapes

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
        this.currentParsedEvent = parse(this.currentInput);

        // clear the lines printed previously
        if (this.linesPrintedLastTime > 0) {
          for (let i = 0; i < this.linesPrintedLastTime; i++) {
            readline.moveCursor(process.stdout, 0, 1);
            readline.clearLine(process.stdout, 0);
          }

          // go back to the line below the prompt
          for (let i = 0; i < this.linesPrintedLastTime - 1; i++) {
            readline.moveCursor(process.stdout, 0, -1);
          }

          // go to start of line
          readline.cursorTo(process.stdout, 0);
        } else {
          // move to the output section
          process.stdout.write("\n");
        }

        // Write the new output
        let linesPrinted = 0;

        if (this.currentParsedEvent == null) {
          process.stdout.write("Need more information...");
          process.stdout.write("\n");
          linesPrinted++;
        } else {
          process.stdout.write(`Title: ${this.currentParsedEvent.title}`);
          process.stdout.write("\n");
          process.stdout.write(
            `Start date: ${formatDate(this.currentParsedEvent.startDate)}`
          );
          process.stdout.write("\n");
          linesPrinted += 2;

          if (this.currentParsedEvent.hasTime) {
            process.stdout.write(
              `Start time: ${formatTime(this.currentParsedEvent.startDate)}`
            );
            process.stdout.write("\n");
            linesPrinted++;
          }
          if (this.currentParsedEvent.endDate) {
            process.stdout.write(
              `End date: ${formatDate(this.currentParsedEvent.endDate)}`
            );
            process.stdout.write("\n");
            linesPrinted++;
            if (this.currentParsedEvent.hasTime) {
              process.stdout.write(
                `End time: ${formatTime(this.currentParsedEvent.endDate)}`
              );
              process.stdout.write("\n");
              linesPrinted++;
            }
          }
        }

        // re-print the input on the prompt line
        for (let i = 0; i < linesPrinted + 1; i++) {
          readline.moveCursor(process.stdout, 0, -1);
        }
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(this.currentInput);
        readline.clearLine(process.stdout, 1);

        this.linesPrintedLastTime = linesPrinted;
      });
    });
  }
}
