import { InteractionType, InteractionResponseType, verifyKeyMiddleware } from "discord-interactions";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  verifyKeyMiddleware(process.env.PUBLIC_KEY)(req, res, async () => {
    const interaction = req.body;

    if (interaction.type === InteractionType.PING) {
      return res.status(200).json({ type: InteractionResponseType.PONG });
    }

    if (
      interaction.type === InteractionType.APPLICATION_COMMAND &&
      interaction.data?.name === "ping"
    ) {
      const timestamp = Date.now();
      const latency = 0;
      const apiLatency = 0;

      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Latency: \`${latency}ms\`\nAPI Latency: \`${apiLatency}ms\``,
        },
      });
    }

    return res.status(200).end();
  });
}
