const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// helpers
const getUserByToken = require("../helpers/get-user-by-token");
const getToken = require("../helpers/get-token");
const createUserToken = require("../helpers/create-user-token");

module.exports = class {
  static async register(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    console.log("Rota funcionando corretamente");

    // Validations
    if (!name || name.length < 3) {
      return res.status(422).json({ message: "Insira um nome valido!" });
    }

    if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
      return res.status(422).json({ message: "Insira um email válido!" });
    }

    if (!password) {
      return res.status(422).json({ message: "A senha é obrigatória!" });
    }

    // Validando o comprimento mínimo e os critérios de segurança
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(422).json({
        message:
          "A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.",
      });
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
      role: "user",
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

    try {
      if (req.headers.authorization) {
        const token = getToken(req);
        const decoded = jwt.verify(token, "nossosecret");

        if (!decoded || !decoded.id || !decoded.role) {
          throw new Error("Token inválido ou malformado");
        }

        currentUser = await User.findById(decoded.id);

        if (!currentUser) {
          throw new Error("Usuário não encontrado");
        }

        currentUser.password = undefined;
      } else {
        currentUser = null;
      }

      res.status(200).json({ currentUser });
    } catch (error) {
      console.error("Erro no checkUser:", error.message);
      res.status(401).json({ message: error.message });
    }
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
      return res.status(422).json({ message: "Senha inválida!" });
    }

    await createUserToken(user, req, res);
  }
};
