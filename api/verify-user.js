const querystring = require("querystring");

module.exports = async (req, res) => {
    let body = "";

    await new Promise(resolve => {
        req.on("data", chunk => body += chunk);
        req.on("end", resolve);
    });

    const data = querystring.parse(body);

    const username = data.username;
    const password = data.password;
    const userId = data.user_id;

    if (!userId) {
        return res.status(400).send("Missing user_id");
    }

    // Hard-coded login
    if (username === "noriskdev" && password === "noriskdev") {
        
        // Save verified user
        if (!globalThis.verifiedUsers) globalThis.verifiedUsers = {};
        globalThis.verifiedUsers[userId] = true;

        return res.send(`
            <html><body style="font-family: Arial; background:#0f0f0f; color:white;">
                <h2>Verification Successful!</h2>
                <p>You may now return to Discord to receive your linked role.</p>
            </body></html>
        `);
    }

    return res.send(`
        <html><body style="font-family: Arial; background:#0f0f0f; color:red;">
            <h2>Invalid Username or Password</h2>
            <p>Please try again.</p>
        </body></html>
    `);
};