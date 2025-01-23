//imports
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const connectDatabase = require("./database/db");

const authRoutes = require("./routes/AuthRoutes");
const postRoutes = require("./routes/PostRoutes");
const privacyPolicyRoutes = require("./routes/PrivacyPolicyRoutes");

// instance
const app = express();

// Config JSON response
app.use(express.json());

// Serve arquivos estáticos (como imagens, CSS, JS) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Solve CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/", privacyPolicyRoutes);
connectDatabase(app);


// 99644 1441
