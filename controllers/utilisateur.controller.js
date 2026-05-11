const Utilisateur = require('../models/utilisateur.model');
const Ferme = require('../models/ferme.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ========== INSCRIPTION (addUser) ==========
module.exports.addUser = async (req, res) => {
    console.log('📥 Requête reçue sur /users/addUser');
    console.log('📦 Body:', req.body);
    
    try {
        const { email, motDePasse, nom, prenom, telephone } = req.body;

        // Validation
        if (!email || !motDePasse || !nom) {
            console.log('❌ Validation échouée');
            return res.status(400).json({ 
                message: "Email, mot de passe et nom sont obligatoires" 
            });
        }

        // Vérifier email existant
        const existingUser = await Utilisateur.findOne({ email });
        if (existingUser) {
            console.log('❌ Email déjà utilisé');
            return res.status(409).json({ 
                message: "Cet email est déjà utilisé" 
            });
        }

        console.log('✅ Création de l\'utilisateur...');
        
        // Créer l'utilisateur (le mot de passe sera hashé par le middleware pre('save'))
        const newUser = new Utilisateur({
            email,
            motDePasseHash: motDePasse,  // Le middleware du modèle va le hasher
            nom,
            prenom: prenom || '',
            telephone: telephone || '',
            dateInscription: new Date()
        });
        await newUser.save();

        console.log('✅ Utilisateur créé:', newUser._id);

        // Créer une ferme par défaut
        const ferme = new Ferme({
            nom: '',
            localisation: '',
            idUtilisateur: newUser._id
        });
        await ferme.save();

        console.log('✅ Ferme créée:', ferme._id);

        // Générer le token
        const token = jwt.sign(
            { id: newUser._id, idFerme: ferme._id },
            process.env.JWT_SECRET || 'default_secret_key',
            { expiresIn: '7d' }
        );

        console.log('✅ Token généré');

        res.status(201).json({
            message: "Inscription réussie",
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                nom: newUser.nom,
                prenom: newUser.prenom,
                telephone: newUser.telephone
            },
            ferme: {
                id: ferme._id,
                nom: ferme.nom,
                localisation: ferme.localisation
            }
        });

        console.log('✅ Réponse envoyée avec succès');
        
    } catch (error) {
        console.error('❌ Erreur dans addUser:', error);
        res.status(500).json({ 
            message: "Erreur lors de l'inscription", 
            error: error.message 
        });
    }
};

// ========== CONNEXION (login) ==========
module.exports.login = async (req, res) => {
    console.log('📥 Requête login reçue');
    
    try {
        const { email, motDePasse } = req.body;

        if (!email || !motDePasse) {
            return res.status(400).json({ 
                message: "Email et mot de passe requis" 
            });
        }

        const user = await Utilisateur.findOne({ email });
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return res.status(401).json({ 
                message: "Email ou mot de passe incorrect" 
            });
        }

        console.log('✅ Utilisateur trouvé, vérification mot de passe...');
        
        const valid = await bcrypt.compare(motDePasse, user.motDePasseHash);
        if (!valid) {
            console.log('❌ Mot de passe incorrect');
            return res.status(401).json({ 
                message: "Email ou mot de passe incorrect" 
            });
        }

        console.log('✅ Mot de passe valide');

        const ferme = await Ferme.findOne({ idUtilisateur: user._id });
        const token = jwt.sign(
            { id: user._id, idFerme: ferme?._id },
            process.env.JWT_SECRET || 'default_secret_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: "Connexion réussie",
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

        console.log('✅ Login réussi');
        
    } catch (error) {
        console.error('❌ Erreur login:', error);
        res.status(500).json({ 
            message: "Erreur lors de la connexion", 
            error: error.message 
        });
    }
};

// ========== GET ALL USERS ==========
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await Utilisateur.find().select('-motDePasseHash');
        res.status(200).json({ message: "Utilisateurs récupérés", users });
    } catch (error) {
        res.status(500).json({ message: "Erreur", error: error.message });
    }
};

// ========== GET USER BY ID ==========
module.exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Utilisateur.findById(id).select('-motDePasseHash');
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ message: "Utilisateur trouvé", user });
    } catch (error) {
        res.status(500).json({ message: "Erreur", error: error.message });
    }
};

// ========== UPDATE USER ==========
module.exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, telephone } = req.body;
        const updatedUser = await Utilisateur.findByIdAndUpdate(
            id,
            { nom, prenom, telephone },
            { new: true }
        ).select('-motDePasseHash');
        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ message: "Utilisateur mis à jour", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Erreur", error: error.message });
    }
};

// ========== DELETE USER ==========
module.exports.deletUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await Utilisateur.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ message: "Utilisateur supprimé", user: deletedUser });
    } catch (error) {
        res.status(500).json({ message: "Erreur", error: error.message });
    }
};

// ========== FORGOT PASSWORD ==========
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

// ========== RESET PASSWORD ==========
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
        user.motDePasseHash = nouveauMotDePasse;  // Le middleware va le hasher
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========== UPLOAD PROFILE IMAGE ==========
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
            imageUrl,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========== LOGOUT ==========
module.exports.logout = (req, res) => {
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: "Déconnexion réussie" });
};