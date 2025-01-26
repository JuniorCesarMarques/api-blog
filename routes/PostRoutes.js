const express = require("express");
const router = express.Router();

const PostController = require("../controllers/PostController");

// middlwares
const checkAdmin = require("../helpers/check-admin");

router.post("/create-post", checkAdmin, PostController.createPost);

module.exports = router;
