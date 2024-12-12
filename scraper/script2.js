import validator from "validator";
import chalk from "chalk";
import { checkStock } from "./scraper.js";
import { EmbedBuilder } from "discord.js";
import { sendDiscordStartupMessage } from "./discord.js";

const urls = [];

// Function to prompt for URLs
export const startScriptMulti = (rl) => {
  rl.question(`${chalk.green('Please enter the URL (or type "exit" to finish)')}: `, (url) => {
    if (url.toLowerCase() === 'exit') {
      if (urls.length === 0) {
        console.log(`${chalk.red('[ERROR]')}: No URLs provided. Exiting.`);
        rl.close();
        return;
      }
      // Prompt for the check interval
      rl.question(`${chalk.magenta('Please enter the stock check frequency in second(s)')}: `, async (interval) => {
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
          // await sendDiscordStartupMessage(urls)
          Promise.all(urls.map((url, index) => checkStock(url, checkIntervalMs, index, true)));
          rl.close();
        } else {
          console.log(`${chalk.red('[ERROR]')}: Please enter a valid check interval in seconds`);
          rl.close();
        }
      });
    } else if (validator.isURL(url)) {
      urls.push(url);
      startScriptMulti(rl); // Prompt for the next URL
    } else {
      console.log(`${chalk.red('[ERROR]')}: Please enter a valid URL`);
      startScriptMulti(rl); // Prompt for the URL again
    }
  });
};

export const startDiscordScriptMulti = async (channel, author) => {
  // Prompt the user for the URL
  await channel.send(`${chalk.green("Please enter one URL at a time and press Enter. When you are done, type 'done'.")}:`);

  const filter = (response) => response.author.id === author.id;

  try {
    const collectedUrl = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
    const url = collectedUrl.first().content;

    if (url.toLowerCase() === 'done') {
      // Prompt the user for the check interval
      await channel.send(`Please enter the stock check frequency in second(s):`);

      const collectedInterval = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
      const interval = collectedInterval.first().content;
      const checkIntervalMs = parseInt(interval, 10) * 1000; // Convert to milliseconds

      if (!isNaN(checkIntervalMs) && checkIntervalMs > 0) {
        await sendDiscordStartupMessage(channel, urls);
        Promise.all(urls.map((url, index) => checkStock(channel, url, checkIntervalMs, index, true, channel)));
      } else {
        await channel.send('Invalid interval. Please enter a valid number.');
      }
    } else if (validator.isURL(url)) {
      urls.push(url);
      startScriptMulti(channel, author); // Prompt for the next URL
    } else {
      await channel.send('Invalid URL. Please enter a valid URL.');
      startScriptMulti(channel, author); // Prompt for the URL again
    }
  } catch (error) {
    await channel.send('You did not respond in time. Please try again.');
  }
};