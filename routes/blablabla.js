const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/UserController");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/checkuser", AuthController.checkUser);

module.exports = router;