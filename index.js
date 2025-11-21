const express = require('express');
const { verifyKeyMiddleware } = require('discord-interactions');
const { handleInteraction } = require('./api/interactions');

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

const PUBLIC_KEY = process.env.PUBLIC_KEY;

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), handleInteraction);

app.get('/', (req, res) => {
  res.send('Discord Interactions Bot is running! 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
