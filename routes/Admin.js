const express = require('express');
const Router = express.Router();

const AdminLoginController = require('../controllers/Admin/LoginController');

const adminLoginController = new AdminLoginController();

// Admin Authentication
Router.post('/registerAdmin', adminLoginController.createAdmin)
Router.post('/adminLogin', adminLoginController.adminLogin)

module.exports = Router