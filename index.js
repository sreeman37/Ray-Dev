import { verifyKey } from "discord-interactions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const body = req.body ? JSON.stringify(req.body) : '';

  if (!signature || !timestamp) {
    res.status(401).send("Missing signature");
    return;
  }

  const rawBody = req.body && typeof req.body === "object" ? JSON.stringify(req.body) : req.body;

  const isValid = verifyKey(rawBody, signature, timestamp, process.env.PUBLIC_KEY);

  if (!isValid) {
    res.status(401).send("Bad signature");
    return;
  }

  const interaction = typeof req.body === "object" ? req.body : JSON.parse(rawBody);

  if (interaction && interaction.type === 1) {
    res.status(200).json({ type: 1 });
    return;
  }

  res.status(200).end();
}
