module.exports = (req, res) => {
    const user = req.query.user_id;

    const verified = globalThis.users?.[user]?.verified ?? 0;

    res.json({
        metadata: { verified }
    });
};
