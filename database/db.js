const mongoose = require("mongoose");

const port = process.env.PORT;

// credentials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const connectDatabase = (app) => {
  mongoose
    .connect(
      `mongodb+srv://${dbUser}:${dbPassword}@cluster0.ljhja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // Aumente o timeout para 30 segundos
      }
    )
    .then(() => {
      app.listen(port);
      console.log("Conectado ao banco");
    })
    .catch((err) => {
      console.log("Deu erro e esta entrando aqui", err);
    });
};

module.exports = connectDatabase;
