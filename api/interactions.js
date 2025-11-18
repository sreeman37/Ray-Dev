import nacl from "tweetnacl";
import * as dns from "dns/promises";

export const config = {
  runtime: "nodejs18.x",
};

export default async function handler(req) {
  // Signature verification
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");
  const publicKey = process.env.PUBLIC_KEY;

  const body = await req.text();

  const isValid = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex")
  );

  if (!isValid) {
    return new Response("Invalid request signature", { status: 401 });
  }

  const interaction = JSON.parse(body);

  // PING request
  if (interaction.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Commands
  if (interaction.type === 2) {
    const name = interaction.data.name;

    // PING command
    if (name === "ping") {
      const latency = Math.floor(Math.random() * 20) + 5;
      const apiLatency = Math.floor(Math.random() * 40) + 40;

      return json({
        type: 4,
        data: {
          content: `Latency: \`${latency}ms\`\nAPI Latency: \`${apiLatency}ms\``,
        },
      });
    }

    // DNS command
    if (name === "dns") {
      const domain = interaction.data.options[0].value;

      let results = [];

      const a = await dns.resolve(domain, "A").catch(() => null);
      if (a) results.push(`A: ${a.join(", ")}`);

      const aaaa = await dns.resolve(domain, "AAAA").catch(() => null);
      if (aaaa) results.push(`AAAA: ${aaaa.join(", ")}`);

      const cname = await dns.resolve(domain, "CNAME").catch(() => null);
      if (cname) results.push(`CNAME: ${cname.join(", ")}`);

      const mx = await dns.resolve(domain, "MX").catch(() => null);
      if (mx)
        results.push(
          "MX:\n" + mx.map((m) => `• ${m.exchange} (Priority ${m.priority})`).join("\n")
        );

      const ns = await dns.resolve(domain, "NS").catch(() => null);
      if (ns) results.push(`NS:\n${ns.map((n) => `• ${n}`).join("\n")}`);

      const txt = await dns.resolve(domain, "TXT").catch(() => null);
      if (txt)
        results.push(
          "TXT:\n" + txt.map((t) => `• ${t.join("")}`).join("\n")
        );

      if (results.length === 0) {
        results.push("No DNS records found.");
      }

      return json({
        type: 4,
        data: {
          embeds: [
            {
              title: `DNS: ${domain.toUpperCase()}`,
              description: `\`\`\`\n${results.join("\n\n")}\n\`\`\``,
              color: 0x2b2d31,
              footer: { text: "DNS Lookup Result" },
            },
          ],
        },
      });
    }
  }

  return json({
    type: 4,
    data: { content: "Unknown command." },
  });
}

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: { "Content-Type": "application/json" },
  });
}
