var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');

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

module.exports = router;