const jwt = require('jsonwebtoken');

function checkAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Pega o token do header

  if (!token) {
    return res.status(401).json({ message: "Token necessário" });
  }

  try {
    const decoded = jwt.verify(token, "nossosecret"); // Verifica a assinatura

    // Se a role não for 'admin', retorna erro
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    req.user = decoded; // Passa as informações do usuário para a próxima função
    next(); // Permite que a requisição prossiga

  } catch (error) {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
}

module.exports = checkAdmin;
