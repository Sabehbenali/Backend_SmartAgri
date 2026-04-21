const usermodel = require('../models/user.model');

module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await usermodel.find();
        res.status(201).json({ message: "user function called", users });
    } catch (error) {
        res.status(500).json({ message: "error fatching users", error: error.message });

    }
}
module.exports.addUser = async (req, res) => {
    try {
        const { email, motDePassHash } = req.body;
        await newUser.save();
        res.status(200).json({ message: "user added succesfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "error adding user", error: error.message });

    }
}
module.exports.deletUser = async (req, res) => {
    try {
        const { id } = req.params;
        await usermodel.findByIdAndDelete(id);
        res.status(200).json({ message: "user deleted succesfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "error deleting user", error: error.message });
    }
}

module.exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usermodel.findById(id);
        if (!user) {
            return res.status(404).json({message:  "User not found"});
        }
        res.status(200).json({ message: "user found", user });
    } catch (error) {
         res.status(500).json({ message: "error fatchinf user", error: error.message });
    }
}

module.exports.updateUser = async(req, res) => {
    try {
        const {id} = req.params;
        const user = await usermodel.updateSearchIndex(id);
        if(!user){
            return res.status(404).json({message: "user not found"});
        }
        res.status(200).json({ message: "user updated succesfully", user});
    } catch (error) {
         res.status(500).json({ message: "error updating user", error: error.message });
        
    }
}