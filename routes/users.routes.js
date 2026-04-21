var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controllers');

/* GET users listing. */
router.get('/getAllUsers' , userController.getAllUsers);
router.post('/addUser' , userController.addUser);
router.delete('/deletUser/:id' , userController.deletUser);
module.exports = router;
