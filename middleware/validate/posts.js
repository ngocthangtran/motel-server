const { Posts } = require("../../db");

const validatePostId = async (req, res, next) => {
    const postId = req.body.postId || req.params.postId;
    
    if (!postId) return res.send({ error: "postId is required" })
    const post = await Posts.findByPk(postId)
    if (!post) {
        return res
            .status(400)
            .send({ error: 'cannot find post with id ' + postId });
    }
    next();
}

module.exports = { validatePostId }