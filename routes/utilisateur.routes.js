var express = require('express');
var router = express.Router();
const userController = require('../controllers/utilisateur.controller');
const upload = require('../middleware/uploadfile');
const userMiddleware = require('../middleware/utilisateur.middleware');   // ← à ajouter

/* GET users listing. */
router.get('/getAllUsers' ,userMiddleware, userController.getAllUsers);
router.post('/addUser' ,userMiddleware,userController.addUser);
router.delete('/deletUser/:id' ,userMiddleware, userController.deletUser); 
router.get('/getUserById/:id',userMiddleware,userController.getUserById);
router.put('/updateUser/:id',userMiddleware,userController.updateUser);

//  NOUVELLES ROUTES POUR MOT DE PASSE OUBLIÉ
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/login', userController.login);
router.post('/uploadProfileImage',userMiddleware,upload.single('profileImage'), userController.uploadProfileImage);
router.post('/logout',userMiddleware,userController.logout);
module.exports = router;