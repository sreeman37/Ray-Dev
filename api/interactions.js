import { REST, Routes, SlashCommandBuilder, InteractionType } from 'discord.js';

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows latency'),
];

(async () => {
  const rest = new REST({ version: '10' }).setToken(token);
  try {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands.map(c => c.toJSON()) }
    );
    console.log('Slash commands registered.');
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
})();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const interaction = req.body;

  if (interaction.type === InteractionType.ApplicationCommand && interaction.data.name === 'ping') {
    const latency = Date.now() - new Date(interaction.created_at).getTime();
    return res.status(200).json({
      type: 4,
      data: {
        content: `Latency: \`${latency}ms\``
      }
    });
  }

  return res.status(400).send('Unknown interaction');
}
