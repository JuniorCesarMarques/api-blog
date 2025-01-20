//imports
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDatabase = require("./database/db");

const authRoutes = require("./routes/authRoutes");

// instance
const app = express();

// Config JSON response
app.use(express.json());

// Solve CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware para lidar com preflight (opcional se cors está configurado corretamente)
app.options('*', cors());

app.use("/auth", authRoutes);

connectDatabase(app);

// Export the app as a serverless function
module.exports = (req, res) => {
  app(req, res);  // Chama o Express para lidar com a requisição e resposta
};

// 99644 1441
