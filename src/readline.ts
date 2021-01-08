import readline from "readline";

const getInterface = (): readline.Interface => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
};

export const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = getInterface();
    rl.question(prompt, (response) => {
      rl.close();
      resolve(response);
    });
  });
};
