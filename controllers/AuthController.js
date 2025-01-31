const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// helpers
const getUserByToken = require("../helpers/get-user-by-token");
const getToken = require("../helpers/get-token");
const createUserToken = require("../helpers/create-user-token");

// google auth
const { OAuth2Client } = require("google-auth-library");

// Substitua pelo seu CLIENT_ID do Google Cloud
const CLIENT_ID =
  "250624763798-fddhjadj6cq46bpo1qs5cee4pdbs7d1j.apps.googleusercontent.com";

// Inicialize o cliente OAuth2
const googleClient = new OAuth2Client(CLIENT_ID);

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

  //refatorar urgente!
  static async checkUser(req, res) {
    let currentUser = null; // Default: usuário não encontrado ou não autenticado
    let tokenType;
  
    console.log(req.headers)
    // Verifica os cabeçalhos para determinar o tipo de token
    if (req.headers.authorization && req.headers['tokentype']) {
      const token = getToken(req);
      tokenType = req.headers['tokentype']; // Pode ser 'google' ou 'jwt'
  
      
      if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
      } 
  
      try {
        if (tokenType === 'jwt') {
          console.log("Tratando como JWT...");
  
          try {
            const decoded = jwt.verify(token, "nossosecret");
  
            if (decoded && decoded.id && decoded.role) {
              currentUser = await User.findById(decoded.id);
  
              if (currentUser) {
                console.log("Usuário encontrado no banco de dados.");
                currentUser.password = undefined; // Remove a senha por segurança
              } else {
                console.log(
                  "Usuário não encontrado no banco de dados, mas mantendo o login ativo."
                );
                currentUser = {
                  message: "Usuário não encontrado, mantendo sessão ativa",
                };
              }
            } else {
              console.log("JWT inválido ou malformado.");
            }
          } catch (jwtError) {
            console.log("Falha ao verificar como JWT:", jwtError.message);
          }
  
        } else if (tokenType === 'google') {
          console.log("Tratando como token do Google...");
  
          try {
            const ticket = await googleClient.verifyIdToken({
              idToken: token,
              audience: CLIENT_ID, // Substitua com seu client ID
            });
  
            const payload = ticket.getPayload();
            if (payload && payload.sub && payload.email) {
              currentUser = await User.findOne({ email: payload.email });
  
              if (!currentUser) {
                console.log(
                  "Usuário do Google não encontrado, mas mantendo sessão ativa."
                );
                currentUser = {
                  message: "Usuário não encontrado, mantendo sessão ativa",
                };
              } else {
                console.log("Usuário do Google encontrado.");
                currentUser.password = undefined; // Remove a senha por segurança
              }
            } else {
              console.log("Token do Google inválido ou malformado.");
            }
          } catch (googleError) {
            console.log("Falha ao verificar token do Google:", googleError.message);
          }
  
        } else {
          return res.status(400).json({ message: "Tipo de token inválido" });
        }
  
        return res.status(200).json({ currentUser });
  
      } catch (error) {
        console.error("Erro no checkUser:", error.message);
        return res.status(401).json({ message: "Erro ao verificar token" });
      }
    } else {
      return res.status(400).json({ message: "Cabeçalhos de token ausentes" });
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
