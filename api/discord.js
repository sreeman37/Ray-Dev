import express from "express";
import { verifyKeyMiddleware } from "discord-interactions";

const router = express.Router();

router.use(express.json());

router.post(
  "/api/discord",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    res.sendStatus(200);
  }
);

export default router;
