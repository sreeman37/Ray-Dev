import { verifyKeyMiddleware, InteractionType, InteractionResponseType } from "discord-interactions";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  verifyKeyMiddleware(process.env.PUBLIC_KEY)(req, res, () => {
    const interaction = req.body;

    if (interaction.type === InteractionType.PING) {
      res.status(200).json({ type: InteractionResponseType.PONG });
      return;
    }

    res.status(200).end();
  });
}
