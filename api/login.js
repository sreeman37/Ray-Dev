module.exports = async (req, res) => {
    res.setHeader("Content-Type", "text/html");

    return res.send(`
        <html>
        <head>
            <title>Account Verification</title>
        </head>
        <body style="font-family: Arial; background: #0f0f0f; color: white; padding: 20px;">
            <h2>Verify Your Account</h2>
            <form method="POST" action="/api/verify-user">
                <label>Username:</label><br>
                <input name="username" required /><br><br>
                <label>Password:</label><br>
                <input type="password" name="password" required /><br><br>

                <input type="hidden" name="user_id" value="${req.query.user_id || ''}" />

                <button type="submit">Verify</button>
            </form>
        </body>
        </html>
    `);
};