const User = require("../models/User");

const bcrypt = require("bcrypt");

// helpers
const getUserByToken = require('../helpers/get-user-by-token')
const getToken = require('../helpers/get-token')
const createUserToken = require('../helpers/create-user-token')

module.exports = class {
  static async register(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    console.log("Rota funcionando corretamente")
    
    // Validations
    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório!" });
    }

    if (!email) {
      return res.status(422).json({ message: "O email é obrigatório!" });
    }

    if (!password) {
      return res.status(422).json({ message: "A senha é obrigatória!" });
    }

    if (!confirmPassword) {
      return res.status(422).json({ message: "Confirme sua senha" });
    }

    if (password !== confirmPassword) {
      return res.status(422).json({ message: "As senhas não correspondem!" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res
        .status(404)
        .json({ message: "Este e-mail já existe, utilize outro!" });
    }

    // Create password
    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();

      await createUserToken(newUser, req, res);

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Aconteceu um erro no servidor!" });
    }
  }

  static async checkUser(req, res) {
    let currentUser;

    console.log(req.headers.authorization);
    console.log("Esta batendo na rota")

    if(req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "nossosecret");

      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);

  }

  static async login(req, res) {
    const { email, password } = req.body;

    // Validations
    if (!email) {
      return res.status(422).json({ message: "Por favor digite seu e-mail!" });
    }

    if (!password) {
      return res.status(422).json({ message: "Por favor digite sua senha!" });
    }

    // Check if email exists
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "Usuario não cadastrado!" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(422).json({ message: "As senhas não conferem!" });
    }
  }
};
