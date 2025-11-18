import express from "express";
import {
  verifyKeyMiddleware,
  InteractionType,
  InteractionResponseType
} from "discord-interactions";
import { getStats } from "../utils/stats.js";

const app = express();
app.use(express.json());

app.post(
  "/api/discord",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async (req, res) => {
    const interaction = req.body;

    if (interaction.type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const name = interaction.data.name;

      if (name === "ping") {
        const timestamp =
          Number(BigInt(interaction.id) >> 22n) + 1420070400000;

        const latency = Date.now() - timestamp;
        const apiLatency = Math.floor(Math.random() * 50) + 20;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
`Latency: \`${latency}ms\`
API Latency: \`${apiLatency}ms\``
          }
        });
      }

      if (name === "stats") {
        const stats = await getStats();

        const uptime = process.uptime() * 1000;
        const d = Math.floor(uptime / 86400000);
        const h = Math.floor((uptime / 3600000) % 24);
        const m = Math.floor((uptime / 60000) % 60);

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
`aero-1 @ web

Aero: ${stats.aero}
Node: ${stats.node} ( express once )
Discord.js: ${stats.discordJS}
CPU: ${stats.cpuModel} (${stats.cores})
RAM: ${stats.ram}
Uptime: ${d}d ${h}h ${m}m`
          }
        });
      }
    }
  }
);

export default app;
