//imports
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDatabase = require("./database/db");

const authRoutes = require("./routes/AuthRoutes");
const postRoutes = require("./routes/PostRoutes");

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

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

connectDatabase(app);


// 99644 1441
