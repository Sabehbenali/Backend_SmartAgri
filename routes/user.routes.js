var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');
const upload = require('../middleware/uploadfile');
const userMiddleware = require('../middleware/user.middleware');   // ← à ajouter

/* GET users listing. */
router.get('/getAllUsers' , userController.getAllUsers);
router.post('/addUser' , userController.addUser);
router.delete('/deletUser/:id' , userController.deletUser);
router.get('/getUserById/:id',userController.getUserById);
router.put('/updateUser/:id',userController.updateUser);

//  NOUVELLES ROUTES POUR MOT DE PASSE OUBLIÉ
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/login', userController.login);
router.post('/uploadProfileImage',userMiddleware,upload.single('profileImage'), userController.uploadProfileImage);

module.exports = router;