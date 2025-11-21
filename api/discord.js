const express = require('express');
const { REST, Routes, SlashCommandBuilder, InteractionType } = require('discord.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = '1441527706411073657';
const guildId = '1434615367031980157';

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows latency')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Refreshing slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );
    console.log('Slash commands registered.');
  } catch (error) {
    console.error(error);
  }
})();

app.use(express.json());

app.post('/interactions', (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.ApplicationCommand && interaction.data.name === 'ping') {
    const latency = Date.now() - new Date(interaction.created_at).getTime();

    return res.json({
      type: 4,
      data: {
        content: `Latency: \`${latency}ms\``
      }
    });
  }

  res.status(400).send('Unknown interaction');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
