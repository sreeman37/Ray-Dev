const fetch = require("node-fetch");
const qs = require("querystring");

module.exports = async (req, res) => {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const code = url.searchParams.get("code");

    if (!code) return res.status(400).send("Missing code");

    const token = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: qs.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.REDIRECT_URI
        })
    }).then(r => r.json());

    if (!token.access_token)
        return res.status(400).send("OAuth failed");

    const user = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${token.access_token}` }
    }).then(r => r.json());

    // redirect to login
    res.redirect(`/api/login?user_id=${user.id}`);
};
