import fetch from "node-fetch";

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [
  { name: "ping", description: "Show real-time ping" },
  { name: "stats", description: "Show system stats" }
];

await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/commands`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bot ${TOKEN}`,
  },
  body: JSON.stringify(commands),
});

console.log("Slash commands registered");