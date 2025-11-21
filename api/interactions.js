import express from "express";
import { verifyKeyMiddleware, InteractionType, InteractionResponseType } from "discord-interactions";

const router = express.Router();

router.use(express.json());

router.post(
  "/api/discord",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const interaction = req.body;

    if (interaction.type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    // Keep endpoint minimal to keep the bot online, no other commands
    return res.send({ type: InteractionResponseType.PONG });
  }
);

export default router;
