const mongoose = require("mongoose");

const express = require("express");

// credentials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const connectDatabase = (app) => {
  mongoose
    .connect(
      `mongodb+srv://${dbUser}:${dbPassword}@cluster0.ljhja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    )
    .then(() => {
      app.listen(5000);
      console.log("Conectado ao banco");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectDatabase;
