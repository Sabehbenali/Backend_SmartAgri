const usermodel = require('../models/user.model');
const crypto = require('crypto'); // pour générer le code aléatoire
const bcrypt = require('bcrypt'); // déjà utilisé
const Farm = require('../models/farm.model');
const jwt = require('jsonwebtoken');

// GET all users
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await usermodel.find();
        res.status(201).json({ message: "user function called", users });
    } catch (error) {
        res.status(500).json({ message: "error fetching users", error: error.message });
    }
}

// POST add user (inscription) - modifié pour accepter motDePasse en clair
module.exports.addUser = async (req, res) => {
    try {
        const { email, motDePasse, nom, prenom, telephone } = req.body;
        // Créer l'utilisateur
        const newUser = new usermodel({ 
            email, 
            motDePassHash: motDePasse, 
            nom, 
            prenom, 
            telephone,
            DateInscription: new Date()
        });
        await newUser.save();

        // Créer une ferme par défaut associée à l'utilisateur
        const farm = new Farm({
            nom: "Ma ferme",
            localisation: "Non renseigné",
            utilisateurId: newUser._id
        });
        await farm.save();

        // Générer un token JWT (pour connecter automatiquement après inscription)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: newUser._id, farmId: farm._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ 
            message: "Inscription réussie", 
            user: {
                id: newUser._id,
                email: newUser.email,
                nom: newUser.nom,
                prenom: newUser.prenom,
                telephone: newUser.telephone
            },
            farm,
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription", error: error.message });
    }
};

// DELETE user
module.exports.deletUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await usermodel.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "user not found" });
        }
        res.status(200).json({ message: "user deleted successfully", user: deletedUser });
    } catch (error) {
        res.status(500).json({ message: "error deleting user", error: error.message });
    }
}

// GET user by ID
module.exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usermodel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "user found", user });
    } catch (error) {
        res.status(500).json({ message: "error fetching user", error: error.message });
    }
}

// PUT update user (nom, prenom, telephone)
module.exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, telephone } = req.body;
        const updateUser = await usermodel.findByIdAndUpdate(id, { nom, prenom, telephone }, { new: true })
        if (!updateUser) {
            return res.status(404).json({ message: "user not found" });
        }
        res.status(200).json({ message: "user updated successfully", user: updateUser });
    } catch (error) {
        res.status(500).json({ message: "error updating user", error: error.message });
    }
}

// ========== NOUVELLES FONCTIONS POUR MOT DE PASSE OUBLIÉ ==========

// POST forgot-password : génère un code et l'envoie (ou le retourne pour test)
module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Aucun utilisateur avec cet email" });
        }
        // Générer un code à 6 chiffres (sécurisé)
        const code = crypto.randomInt(100000, 1000000).toString();//en prut utilisé ausii math.random() mais elle est pas securisé pour le code de reinitialisation
        // Expiration dans 15 minutes
        const expires = Date.now() + 15 * 60 * 1000;
        user.resetPasswordToken = code;
        user.resetPasswordExpires = expires;
        await user.save();
        // Pour les tests, on retourne le code (à remplacer par envoi d'email en production)
        res.status(200).json({ message: "Code de réinitialisation généré", code });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// POST reset-password : vérifie le code et met à jour le mot de passe
module.exports.resetPassword = async (req, res) => {
    try {
        const { code, nouveauMotDePasse } = req.body;
        const user = await usermodel.findOne({
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: "Code invalide ou expiré" });
        }
        // Mettre à jour le mot de passe (le pre-save le hachera)
        user.motDePassHash = nouveauMotDePasse;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//connexion login
 module.exports.login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;
        const user = await usermodel.findOne({ email });
        if (!user) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

        const bcrypt = require('bcrypt');
        const valid = await bcrypt.compare(motDePasse, user.motDePassHash);
        if (!valid) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

        const farm = await Farm.findOne({ utilisateurId: user._id });
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: user._id, farmId: farm?._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: "Connecté",
            token,
            user: {
                id: user._id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                telephone: user.telephone
            },
            farm
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
