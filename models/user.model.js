const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    //user
    nom: String,
    prenom: String,
    email: { type: String, unique: true, required: true },
    motDePassHash: {
        type: String,
        required: true,
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
            'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.'
        ]
    },
    telephone: String,
    DateInscription: Date,
    resetPasswordToken: String,     // stockera le code temporaire
    resetPasswordExpires: Date,      // expiration du code
    profileImage: { type: String, default: '' }


}, { timestamps: true });//par deafut updated add,created add(date,temps)
//taamel manupilation avant le stockage de données au DB
userSchema.pre("save", async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        this.motDePassHash = await bcrypt.hash(this.motDePassHash, salt);//yhashi el password
    } catch (error) {
        next(error);

    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
