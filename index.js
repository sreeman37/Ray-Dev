import express from "express";
import nacl from "tweetnacl";
import dns from "dns/promises";
import os from "os";
import process from "process";
import expressPkg from "express/package.json" assert { type: "json" };

const app = express();
app.use(express.text({ type: "*/*" }));

function formatTime(ms) {
    let s = Math.floor(ms / 1000);
    let d = Math.floor(s / 86400);
    s %= 86400;
    let h = Math.floor(s / 3600);
    s %= 3600;
    let m = Math.floor(s / 60);
    return `${d}d ${h}h ${m}m`;
}

async function verifyRequest(req) {
    const signature = req.get("x-signature-ed25519");
    const timestamp = req.get("x-signature-timestamp");
    const body = req.body;

    return nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, "hex"),
        Buffer.from(process.env.PUBLIC_KEY, "hex")
    );
}

function getStats() {
    const cpu = os.cpus()[0].model;
    const cores = os.cpus().length;
    const totalRam = os.totalmem() / 1024 / 1024 / 1024;
    const usedRam = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;

    return (
`aero-1 @ web

Aero: ${usedRam.toFixed(2)}/${totalRam.toFixed(0)}GB
Node: ${process.version}
Express: v${expressPkg.version}
CPU: ${cpu} (${cores} cores)
RAM: ${totalRam.toFixed(0)}GB (${((usedRam / totalRam) * 100).toFixed(2)}%)
Uptime: ${formatTime(process.uptime() * 1000)}
`
    );
}

async function runDnsLookup(domain) {
    let results = [];

    const recordA = await dns.resolve(domain, "A").catch(() => null);
    if (recordA) results.push(`A: ${recordA.join(", ")}`);

    const recordAAAA = await dns.resolve(domain, "AAAA").catch(() => null);
    if (recordAAAA) results.push(`AAAA: ${recordAAAA.join(", ")}`);

    const cname = await dns.resolve(domain, "CNAME").catch(() => null);
    if (cname) results.push(`CNAME: ${cname.join(", ")}`);

    const mx = await dns.resolve(domain, "MX").catch(() => null);
    if (mx) {
        results.push(
            "MX:\n" + mx.map(m => `• ${m.exchange} (Priority ${m.priority})`).join("\n")
        );
    }

    const ns = await dns.resolve(domain, "NS").catch(() => null);
    if (ns) {
        results.push("NS:\n" + ns.map(n => `• ${n}`).join("\n"));
    }

    const txt = await dns.resolve(domain, "TXT").catch(() => null);
    if (txt) {
        results.push("TXT:\n" + txt.map(t => `• ${t.join("")}`).join("\n"));
    }

    if (!results.length) {
        results.push("No DNS records found.");
    }

    return results.join("\n\n");
}

app.post("/interactions", async (req, res) => {
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

        if (cmd === "stats") {
            return res.json({
                type: 4,
                data: {
                    content: "```" + getStats() + "```"
                }
            });
        }

        if (cmd === "dns") {
            const domain = body.data.options[0].value;
            const dnsData = await runDnsLookup(domain);

            return res.json({
                type: 4,
                data: {
                    content: "```\n" + dnsData + "\n```"
                }
            });
        }
    }

    res.json({
        type: 4,
        data: {
            content: "Unknown command."
        }
    });
});

app.get("/", (req, res) => {
    res.send("Aero Express Bot is running");
});

app.listen(3000, () => {
    console.log("Bot online on port 3000");
});
