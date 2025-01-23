const express = require("express");
const path = require("path");

const router = express.Router();

// Rota para Política de Privacidade
router.get("/politica-de-privacidade", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "privacy-policy.html"));
});

module.exports = router;
