import readline from "readline";
import validator from "validator";
import chalk from "chalk";
import { startScript } from "./script.js";
import { startScriptMulti } from "./script2.js";

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const start = () => {
  // Prompt the user for the script type
  rl.question(`${chalk.green("Please enter the script type (single/multi)")}: `, (type) => {
    if (type === "single") {
      startScript(rl);
    } else if (type === "multi") {
      startScriptMulti(rl);
    } else {
      console.log(`${chalk.red("[ERROR]")}: Please enter a valid script type`);
      rl.close();
    }
  });
}

start();