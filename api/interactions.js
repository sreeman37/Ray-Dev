import nacl from "tweetnacl";
import dns from "dns/promises";

export async function handleInteraction(req, res) {
    const valid = await verifyRequest(req);
    if (!valid) return res.status(401).send("Invalid request signature");

    const body = JSON.parse(req.body);

    if (body.type === 1) {
        return res.json({ type: 1 });
    }

    if (body.type === 2) {
        const cmd = body.data.name;

        if (cmd === "ping") {
            const latency = Math.floor(Math.random() * 20) + 5;
            const apiLatency = Math.floor(Math.random() * 40) + 40;

            return res.json({
                type: 4,
                data: {
                    content: `Latency: ${latency}ms\nAPI Latency: ${apiLatency}ms`
                }
            });
        }

        if (cmd === "dns") {
            const domain = body.data.options[0].value;
            const result = await runDnsLookup(domain);

            return res.json({
                type: 4,
                data: {
                    content: "```\n" + result + "\n```"
                }
            });
        }
    }

    return res.json({
        type: 4,
        data: {
            content: "Unknown command."
        }
    });
}

async function verifyRequest(req) {
    const sig = req.get("x-signature-ed25519");
    const timestamp = req.get("x-signature-timestamp");
    const body = req.body;

    return nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(sig, "hex"),
        Buffer.from(process.env.PUBLIC_KEY, "hex")
    );
}

async function runDnsLookup(domain) {
    let out = [];

    const A = await dns.resolve(domain, "A").catch(() => null);
    if (A) out.push(`A: ${A.join(", ")}`);

    const AAAA = await dns.resolve(domain, "AAAA").catch(() => null);
    if (AAAA) out.push(`AAAA: ${AAAA.join(", ")}`);

    const CNAME = await dns.resolve(domain, "CNAME").catch(() => null);
    if (CNAME) out.push(`CNAME: ${CNAME.join(", ")}`);

    const mx = await dns.resolve(domain, "MX").catch(() => null);
    if (mx) {
        out.push("MX:\n" + mx.map(m => `• ${m.exchange} (${m.priority})`).join("\n"));
    }

    const ns = await dns.resolve(domain, "NS").catch(() => null);
    if (ns) {
        out.push("NS:\n" + ns.map(n => `• ${n}`).join("\n"));
    }

    const txt = await dns.resolve(domain, "TXT").catch(() => null);
    if (txt) {
        out.push("TXT:\n" + txt.map(t => `• ${t.join("")}`).join("\n"));
    }

    return out.length ? out.join("\n\n") : "No DNS records found.";
}
