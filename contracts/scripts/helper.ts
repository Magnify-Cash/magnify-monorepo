import * as readline from "readline";

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ask(questionText: any, defaultValue: any, isArray: boolean) {
  let array: any = [];
  const res = await new Promise((resolve, reject) => {
    readlineInterface.question(
      `>> ${questionText}[${defaultValue}]: `,
      (input: any) => {
        if (isArray) {
          array.push(input);
          readlineInterface.on("line", (line: any) => {
            if (line !== "end") {
              array.push(line);
            } else {
              resolve(array);
            }
          });
        } else {
          resolve(input);
        }
      }
    );
  });
  return res || defaultValue;
}

export async function defineDeployer() {
  return await ask("PK intended to be used for signing deployments", "", false);
}
