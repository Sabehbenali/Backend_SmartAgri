const Utilisateur = require('../models/utilisateur.model');
const Ferme = require('../models/ferme.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// GET all users
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await Utilisateur.find();
        res.status(200).json({ message: "Utilisateurs récupérés", users });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération", error: error.message });
    }
};

// POST add user (inscription)
module.exports.addUser = async (req, res) => {
    try {
        const { email, motDePasse, nom, prenom, telephone } = req.body;
        const newUser = new Utilisateur({
            email,
            motDePasseHash: motDePasse,
            nom,
            prenom,
            telephone,
            dateInscription: new Date()
        });
        await newUser.save();

        // Créer une ferme par défaut associée (champs vides)
        const ferme = new Ferme({
            nom: '',
            localisation: '',
            idUtilisateur: newUser._id
        });
        await ferme.save();

        const token = jwt.sign(
            { id: newUser._id, idFerme: ferme._id },
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
            ferme,
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
        const deletedUser = await Utilisateur.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ message: "Utilisateur supprimé", user: deletedUser });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
};

// GET user by ID
module.exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Utilisateur.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ message: "Utilisateur trouvé", user });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la recherche", error: error.message });
    }
};

// PUT update user (nom, prenom, telephone)
module.exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, telephone } = req.body;
        const updatedUser = await Utilisateur.findByIdAndUpdate(
            id,
            { nom, prenom, telephone },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ message: "Utilisateur mis à jour", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};

// ========== MOT DE PASSE OUBLIÉ ==========
module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Utilisateur.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Aucun utilisateur avec cet email" });
        }
        const code = crypto.randomInt(100000, 1000000).toString();
        const expires = Date.now() + 15 * 60 * 1000;
        user.resetPasswordToken = code;
        user.resetPasswordExpires = expires;
        await user.save();
        res.status(200).json({ message: "Code de réinitialisation généré", code });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        const { code, nouveauMotDePasse } = req.body;
        const user = await Utilisateur.findOne({
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: "Code invalide ou expiré" });
        }
        user.motDePasseHash = nouveauMotDePasse;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========== CONNEXION ==========
module.exports.login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;
        const user = await Utilisateur.findOne({ email });
        if (!user) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

        const valid = await bcrypt.compare(motDePasse, user.motDePasseHash);
        if (!valid) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

        const ferme = await Ferme.findOne({ idUtilisateur: user._id });
        const token = jwt.sign(
            { id: user._id, idFerme: ferme?._id },
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
            ferme
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========== UPLOAD PHOTO DE PROFIL ==========
module.exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Aucune image sélectionnée" });
        }
        const imageUrl = `/images/${req.file.filename}`;
        const user = await Utilisateur.findByIdAndUpdate(
            req.user.id,
            { profileImage: imageUrl },
            { new: true }
        ).select('-motDePasseHash');
        res.status(200).json({
            message: "Photo de profil mise à jour",
            profileImage: imageUrl,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports.logout = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logout successful" });
};