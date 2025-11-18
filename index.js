import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { handleInteraction } from "./api/interactions.js";

const app = express();
app.use(express.text({ type: "*/*" }));

app.post("/interactions", handleInteraction);

app.get("/", (req, res) => {
    res.send("Aero Express Bot is running");
});

app.listen(3000, () => {
    console.log("Bot online on port 3000");
});
