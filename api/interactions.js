const {
  InteractionType,
  InteractionResponseType,
} = require('discord-interactions');

async function handleInteraction(req, res) {
  const interaction = req.body;

  if (interaction.type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    if (interaction.data.name === 'ping') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Pong!',
          flags: 64,
        },
      });
    }
  }

  return res.status(400).send({ error: 'Unknown interaction' });
}

module.exports = { handleInteraction };
