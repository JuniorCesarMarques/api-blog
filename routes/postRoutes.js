const express = require("express");
const router = express.Router();

const authController = require("../controllers/postsController");

router.get("/allPosts", authController.showAllPosts);

module.exports = router;
