import { EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends a formatted message to Discord
 * @param {string} message - The main message to send.
 * @param {string} item - The item's description.
 * @param {string} link - A link to the item.
 */
export const sendDiscordMessage = async (channel, title, description, item, link) => {
  try {
      // const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
      if (!channel) {
          console.error('Channel not found');
          return;
      }

      // Create a formatted message
      // const formattedMessage = `${message}\n**Item:** ${item}\n[View Item](${link})`;
      const embed = new EmbedBuilder()
      .setColor('#FF0000') // Set the color of the embed
      .setTitle(title) // The title of the embed
      .setDescription(description) // The body of the embed
      .addFields({
        name: 'Item',
        value: item,
        inline: true,
      }, {
        name: 'Link',
        value: `[View Item](${link})`,
        inline: true,
      })

      await channel.send({ content:'@everyone', embeds: [embed] });

  } catch (error) {
      console.error('Error sending message:', error);
  }
}

export const sendDiscordStartupMessage = async (channel, links) => {
  try {
    // const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    if (!channel) {
        console.error('Channel not found.');
        return;
    }
    await channel.send(`@everyone\nThe Popmart Restock Bot is currently running! 🚀`);
    // Create a colored embed message
    const embed = new EmbedBuilder()
      .setColor('#237feb') // Set the color of the embed
      .setTitle('These are the following links currently being tracked.') // The title of the embed
      .setDescription('Click on the links to view more details.');

      links.forEach((link, index) => {
        embed.addFields({
            name: `Link ${index + 1}`,
            value: `[Click here to view the link preview](${link})`,
            inline: false
        });
    });
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}