const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const utilisateurSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    motDePasseHash: { type: String, required: true },
    prenom: String,
    nom: String,
    telephone: String,
    dateInscription: { type: Date, default: Date.now },
    profileImage: { type: String, default: '' },
    resetPasswordToken: String,      // ← AJOUTÉ pour forgot password
    resetPasswordExpires: Date        // ← AJOUTÉ pour forgot password
}, { timestamps: true });

// Middleware pour hasher le mot de passe automatiquement
utilisateurSchema.pre('save', async function () {  // ✅ Pas de next
    if (!this.isModified('motDePasseHash')) return;
    const salt = await bcrypt.genSalt(10);
    this.motDePasseHash = await bcrypt.hash(this.motDePasseHash, salt);
});  // ✅ Pas besoin de next() avec async

module.exports = mongoose.model('Utilisateur', utilisateurSchema);