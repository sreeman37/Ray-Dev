module.exports = async (req, res) => {
    const userId = req.query.user_id;

    // Fake DB (in-memory)
    const verifiedUsers = globalThis.verifiedUsers || {};

    const isVerified = verifiedUsers[userId] === true;

    return res.json({
        metadata: {
            verified: isVerified ? 1 : 0
        }
    });
};