const qs = require("querystring");

module.exports = async (req, res) => {
    let body = "";
    await new Promise(r => { req.on("data", c=> body+=c); req.on("end", r); });

    const data = qs.parse(body);

    if (data.username === "noriskdev" && data.password === "noriskdev") {

        if (!globalThis.users) globalThis.users = {};
        globalThis.users[data.user_id] = { verified: 1 };

        return res.send("<h1>✔ Verified! Go back to Discord.</h1>");
    }
    res.send("<h1 style='color:red'>❌ Invalid</h1>");
};
