import validator from "validator";
import chalk from "chalk";
import { checkStock } from "./scraper.js";
import { sendDiscordStartupMessage } from "./discord.js";

export const startScript = (rl) => {
  // Prompt the user for the URL
  rl.question(`${chalk.green("Please enter the URL")}: `, (url) => {
    if (validator.isURL(url) || url === "default") {
      // Prompt the user for the check interval
      rl.question(`${chalk.magenta("Please enter the stock check frequency in second(s)")}: `, async (interval) => {
        const checkIntervalMs = parseInt(interval, 10) * 1000; // Convert to milliseconds
        if (!isNaN(checkIntervalMs) && checkIntervalMs > 0) {
          console.log(
            chalk.blueBright(`
            ##################################################
            ####                                          ####
            ####         🚀 SCRIPT IS STARTING 🚀         ####
            ####                                          ####
            ##################################################
          `)
          );
          // await sendDiscordStartupMessage([url]);
          checkStock(url, checkIntervalMs);
          rl.close();
        } else {
          console.log(`${chalk.red("[ERROR]")}: Please enter a valid check interval in seconds`);
          rl.close();
        }
      });
    } else {
      console.log(`${chalk.red("[ERROR]")}: Please enter a valid URL`);
      rl.close();
    }
  });
};

export const startDiscordScript = async (channel, author) => {
  // Prompt the user for the URL
  await channel.send(`Please enter the URL:`);

  const filter = (response) => response.author.id === author.id;

  try {
    const collectedUrl = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
    const url = collectedUrl.first().content;

    if (validator.isURL(url) || url === "default") {
      // Prompt the user for the check interval
      await channel.send(`Please enter the stock check frequency in second(s)`);

      const collectedInterval = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
      const interval = collectedInterval.first().content;
      const checkIntervalMs = parseInt(interval, 10) * 1000; // Convert to milliseconds

      if (!isNaN(checkIntervalMs) && checkIntervalMs > 0) {
        checkStock(url, checkIntervalMs, null, false, channel);
        await sendDiscordStartupMessage(channel, [url]);
      } else {
        await channel.send('Invalid interval. Please enter a valid number.');
      }
    } else {
      await channel.send('Invalid URL. Please enter a valid URL.');
    }
  } catch (error) {
    await channel.send('You did not respond in time. Please try again.');
  }
};