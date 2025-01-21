const express = require("express");
const router = express.Router();

const authController = require("../controllers/jsadnkas");

router.get("/all-posts", authController.showAllPosts);

module.exports = router;
