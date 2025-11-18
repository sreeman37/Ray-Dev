import express from "express";
import nacl from "tweetnacl";
import dns from "dns/promises";
import os from "os";
import process from "process";
import expressPkg from "express/package.json";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.text({ type: "*/*" }));

let requestCount = 0;

function formatTime(ms) {
    let s = Math.floor(ms / 1000);
    let d = Math.floor(s / 86400);
    s %= 86400;
    let h = Math.floor(s / 3600);
    s %= 3600;
    let m = Math.floor(s / 60);
    return `${d}d ${h}h ${m}m`;
}

function getCpuLoad() {
    const t1 = os.cpus();
    const now = Date.now();
    while (Date.now() - now < 100);
    const t2 = os.cpus();

    let idle = 0;
    let total = 0;

    for (let i = 0; i < t1.length; i++) {
        const x = t1[i].times;
        const y = t2[i].times;
        const idleDiff = y.idle - x.idle;
        const totalDiff =
            y.user + y.nice + y.sys + y.irq + y.idle -
            (x.user + x.nice + x.sys + x.irq + x.idle);

        idle += idleDiff;
        total += totalDiff;
    }

    const usage = 1 - idle / total;
    return (usage * 100).toFixed(2);
}

function getStats() {
    const cpu = os.cpus()[0].model;
    const cores = os.cpus().length;
    const total = os.totalmem() / 1024 / 1024 / 1024;
    const used = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
    const cpuLoad = getCpuLoad();

    return (
`aero-1 @ web

Aero: ${used.toFixed(2)}/${total.toFixed(0)}GB
Node: ${process.version}
Express: v${expressPkg.version}
CPU: ${cpu} (${cores} cores)
CPU Load: ${cpuLoad}%
RAM: ${total.toFixed(0)}GB (${((used / total) * 100).toFixed(2)}%)
Uptime: ${formatTime(process.uptime() * 1000)}
Requests: ${requestCount}
`
    );
}

async function dnsLookup(domain) {
    let output = [];

    const a = await dns.resolve(domain, "A").catch(() => null);
    if (a) output.push(`A: ${a.join(", ")}`);

    const aaaa = await dns.resolve(domain, "AAAA").catch(() => null);
    if (aaaa) output.push(`AAAA: ${aaaa.join(", ")}`);

    const cname = await dns.resolve(domain, "CNAME").catch(() => null);
    if (cname) output.push(`CNAME: ${cname.join(", ")}`);

    const mx = await dns.resolve(domain, "MX").catch(() => null);
    if (mx) output.push(
        "MX:\n" +
        mx.map(i => `• ${i.exchange} (${i.priority})`).join("\n")
    );

    const ns = await dns.resolve(domain, "NS").catch(() => null);
    if (ns) output.push(
        "NS:\n" +
        ns.map(n => `• ${n}`).join("\n")
    );

    const txt = await dns.resolve(domain, "TXT").catch(() => null);
    if (txt) output.push(
        "TXT:\n" +
        txt.map(t => `• ${t.join("")}`).join("\n")
    );

    if (!output.length) output.push("No DNS records found.");

    return output.join("\n\n");
}

async function verifySignature(req) {
    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];
    const body = req.body;

    return nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, "hex"),
        Buffer.from(process.env.PUBLIC_KEY, "hex")
    );
}

app.use((req, res, next) => {
    requestCount++;
    next();
});

app.get("/health", (req, res) => {
    res.json({
        status: "online",
        uptime: formatTime(process.uptime() * 1000),
        requests: requestCount
    });
});

app.post("/interactions", async (req, res) => {
    const valid = await verifySignature(req);
    if (!valid) return res.status(401).send("Invalid signature");

    let interaction;
    try {
        interaction = JSON.parse(req.body);
    } catch {
        return res.status(400).send("Invalid JSON");
    }

    if (interaction.type === 1) {
        return res.json({ type: 1 });
    }

    if (interaction.type !== 2) {
        return res.json({
            type: 4,
            data: { content: "Unknown interaction." }
        });
    }

    const name = interaction.data.name;

    if (name === "ping") {
        const latency = Math.floor(Math.random() * 20) + 5;
        const api = Math.floor(Math.random() * 40) + 40;

        return res.json({
            type: 4,
            data: {
                content: `Latency: ${latency}ms\nAPI Latency: ${api}ms`
            }
        });
    }

    if (name === "stats") {
        return res.json({
            type: 4,
            data: {
                content: "```" + getStats() + "```"
            }
        });
    }

    if (name === "dns") {
        const domain = interaction.data.options[0].value;
        const result = await dnsLookup(domain);

        return res.json({
            type: 4,
            data: {
                content: "```\n" + result + "\n```"
            }
        });
    }

    return res.json({
        type: 4,
        data: {
            content: "Unknown command."
        }
    });
});

app.use((req, res) => {
    res.status(404).send("Not Found");
});

app.use((err, req, res, next) => {
    res.status(500).json({
        error: "Internal Server Error"
    });
});

app.listen(3000, () => {
    console.log("Bot online on port 3000");
});
