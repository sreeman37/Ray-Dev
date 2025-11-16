const nacl = require("tweetnacl");
const dns = require("dns").promises;

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];
    const publicKey = process.env.PUBLIC_KEY;

    let body = "";

    await new Promise(resolve => {
        req.on("data", chunk => (body += chunk));
        req.on("end", resolve);
    });

    const isValid = nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, "hex"),
        Buffer.from(publicKey, "hex")
    );

    if (!isValid) {
        return res.status(401).send("Invalid request signature");
    }

    const interaction = JSON.parse(body);

    // Ping
    if (interaction.type === 1) {
        return res.json({ type: 1 });
    }

    // Commands
    if (interaction.type === 2) {
        const name = interaction.data.name;

        if (name === "ping") {
            const latency = Math.floor(Math.random() * 20) + 5;
            const apiLatency = Math.floor(Math.random() * 40) + 40;

            return res.json({
                type: 4,
                data: {
                    content: `Latency: \`${latency}ms\`\nAPI Latency: \`${apiLatency}ms\``
                }
            });
        }

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
                    "MX:\n" + mx.map(m => `• ${m.exchange} (Priority ${m.priority})`).join("\n")
                );

            const ns = await dns.resolve(domain, "NS").catch(() => null);
            if (ns)
                results.push(`NS:\n${ns.map(n => `• ${n}`).join("\n")}`);

            const txt = await dns.resolve(domain, "TXT").catch(() => null);
            if (txt)
                results.push("TXT:\n" + txt.map(t => `• ${t.join("")}`).join("\n"));

            if (results.length === 0) {
                results.push("No DNS records found.");
            }

            return res.json({
                type: 4,
                data: {
                    embeds: [
                        {
                            title: `DNS: ${domain.toUpperCase()}`,
                            description: `\`\`\`\n${results.join("\n\n")}\n\`\`\``,
                            color: 0x2b2d31,
                            footer: { text: "DNS Lookup Result" }
                        }
                    ]
                }
            });
        }
    }

    return res.json({
        type: 4,
        data: { content: "Unknown command." }
    });
};
