import { InteractionType, InteractionResponseType } from "discord-interactions";

router.post(
  "/api/discord",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async (req, res) => {
    if (req.body.type === InteractionType.PING) {
      return res.status(200).json({ type: InteractionResponseType.PONG });
    }

    if (
      req.body.type === InteractionType.APPLICATION_COMMAND &&
      req.body.data.name === "ping"
    ) {
      const latency = Date.now() - new Date(req.body.received_at || req.body.timestamp || Date.now()).getTime();

      const apiLatency = client.ws.ping;

      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Latency: \`${latency}ms\`\nAPI Latency: \`${apiLatency}ms\``,
        },
      });
    }

    return res.sendStatus(200);
  }
);
