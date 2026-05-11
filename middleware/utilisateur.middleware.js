const jwt = require('jsonwebtoken');//creér & verfifier des Tockens

module.exports = (req, res, next) => {//On exporte une fonction middleware
    const token = req.headers.authorization?.split(' ')[1];//?.split(' ') : on découpe la chaîne en utilisant l'espace. Le premier élément est "Bearer", le second est le token.
    if (!token) return res.status(401).json({ message: "Accès non autorisé" });//Si aucun token n'est fourni, on renvoie une erreur 401 (Unauthorized) avec un message.
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // contient { id, farmId, ... }
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalide" });
    }
};