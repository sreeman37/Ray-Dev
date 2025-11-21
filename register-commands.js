const fetch = require('node-fetch');

const commands = [
  {
    name: 'ping',
    description: 'Check if the bot is alive',
    type: 1,
  },
];

const TOKEN = process.env.DISCORD_TOKEN;
const APP_ID = process.env.DISCORD_APP_ID;

const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`;

fetch(url, {
  method: 'PUT',
  headers: {
    'Authorization': `Bot ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(commands),
})
  .then((res) => res.json())
  .then(console.log)
  .catch(console.error);
