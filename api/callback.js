const fetch = require("node-fetch");
const querystring = require("querystring");

module.exports = async (req, res) => {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const code = url.searchParams.get("code");

    if (!code) {
        return res.status(400).send("Missing ?code parameter");
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = "https://aero-dev.vercel.app/api/callback";

    // 1. Exchange code for access token
    const tokenData = querystring.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: tokenData,
        headers: { 
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    const tokenJson = await tokenRes.json();

    if (!tokenJson.access_token) {
        return res.status(400).send("OAuth2 token exchange failed");
    }

    // 2. Get user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${tokenJson.access_token}`
        }
    });

    const user = await userRes.json();

    if (!user.id) {
        return res.status(400).send("Failed to fetch user");
    }

    // 3. Redirect to login page with user_id attached
    res.writeHead(302, {
        Location: `/api/login?user_id=${user.id}`
    });
    res.end();
};