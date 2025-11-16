module.exports = (req, res) => {
    const user = req.query.user_id;

    res.send(`
    <html><body style="font-family:Arial;background:#111;color:#fff;">
        <h2>Login to Verify</h2>
        <form method="POST" action="/api/verify">
            <input type="hidden" name="user_id" value="${user}">
            Username:<br><input name="username"><br><br>
            Password:<br><input type="password" name="password"><br><br>
            <button type="submit">Verify</button>
        </form>
    </body></html>
    `);
};
