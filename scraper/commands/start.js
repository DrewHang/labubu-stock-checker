import { SCRIPT_STATUS } from '../constants.js';
import { startDiscordScriptMulti } from '../script2.js';
import { startDiscordScript } from '../script.js';
import dotenv from 'dotenv';
dotenv.config();

export const execute = async (message) => {
  if (message.content === '!start' && !process.env.DISCORD_USER_ID_WHITELIST.split(',').includes(message.author.id)) {
    await message.channel.send('hahaha you do not have permission to start the script. 😂');
    return;
  }
  if (SCRIPT_STATUS === 'running' && message.content === '!start') {
    await message.channel.send('A script is already running. Please wait for it to finish.');
    return;
  }
  if (message.content === '!start' && process.env.DISCORD_USER_ID_WHITELIST.split(',').includes(message.author.id)) {
    await message.channel.send("Please enter the script type (single/multi):");

    const filter = (response) => response.author.id === message.author.id;

    try {
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
      const type = collected.first().content;

      if (type === 'single') {
        startDiscordScript(message.channel, message.author);
      } else if (type === 'multi') {
        startDiscordScriptMulti(message.channel, message.author);
      } else {
        await message.channel.send('Invalid script type. Please enter "single" or "multi".');
      }
    } catch (error) {
      await message.channel.send('You did not respond in time. Please try again.');
    }
  }
}