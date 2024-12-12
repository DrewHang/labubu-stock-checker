import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Replace 'YOUR_BOT_TOKEN' with your actual bot token
const BOT_TOKEN = process.env.BOT_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const commands = new Map();
// Load command files
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  const commandName = file.split('.')[0];
  commands.set(commandName, command);
}

// When the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Send a message to a specific channel
client.on('ready', () => {
    // Send bot is online message
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    if (!channel) {
        console.error('Channel not found.');
        return;
    }
    channel.send('🚀 Bot is online and ready to accept commands! Type `!start` to begin the script. 🚀');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.slice(1).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!commands.has(commandName)) return;

  try {
    await commands.get(commandName).execute(message, args);
  } catch (error) {
    console.error(error);
    await message.reply('There was an error executing that command.');
  }
});

async function shutdown() {
    try {
        const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID)
        if (channel) {
          await channel.send('Bot is disconnecting, goodbye! 👋');
        }
    } catch (error) {
        console.error('Failed to send disconnect message:', error);
    } finally {
        client.destroy(); // Disconnect the bot
    }
}

// Call shutdown on some event (like a manual stop)
process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down...');
    shutdown();
});


// Login to Discord
client.login(BOT_TOKEN);