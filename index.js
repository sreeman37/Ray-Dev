import express from "express";
import discordRoutes from "./api/discord.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(discordRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
