const jwt = require("jsonwebtoken");

// middleware to validate token
const checkToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) res.status(401).json({message: "Acesso negado!"});

    try {
        const verified = jwt.verify(token, "nossosecret");
        req.user = verified;
        next();
    } catch(err) {
        res.status(400).json({message: "Token inválido!"})
    }
}

module.exports = checkToken;