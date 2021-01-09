import { format } from "date-fns";
import readline from "readline";
import { parse } from "./parser";

// TODO: consider adding humanized date (e.g., 2 days later)
const formatDate = (date: Date) => {
  return format(date, "d MMM y");
};

const formatTime = (date: Date) => {
  return format(date, "HH:mm");
};

export default class Cli {
  protected linesPrintedLastTime: number = 0;
  protected currentInput: string = "";

  constructor() {
    if (!process.stdin.isTTY) {
      throw new Error("not tty");
    }
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
  }

  read() {
    // TODO: consider taking input through readline.question to enable readline keybindings
    process.stdin.on("keypress", (str, info) => {
      if (info && info.ctrl && info.name == "c") {
        process.exit(0);
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
      const parsedResult = parse(this.currentInput);
      let linesPrinted = 0;

      if (parsedResult == null) {
        process.stdout.write("Need more information...");
        process.stdout.write("\n");
        linesPrinted++;
      } else {
        process.stdout.write(`Title: ${parsedResult.title}`);
        process.stdout.write("\n");
        process.stdout.write(
          `Start date: ${formatDate(parsedResult.startDate)}`
        );
        process.stdout.write("\n");
        linesPrinted += 2;

        if (parsedResult.hasTime) {
          process.stdout.write(
            `Start time: ${formatTime(parsedResult.startDate)}`
          );
          process.stdout.write("\n");
          linesPrinted++;
        }
        if (parsedResult.endDate) {
          process.stdout.write(`End date: ${formatDate(parsedResult.endDate)}`);
          process.stdout.write("\n");
          linesPrinted++;
          if (parsedResult.hasTime) {
            process.stdout.write(
              `End time: ${formatTime(parsedResult.endDate)}`
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
  }
}
