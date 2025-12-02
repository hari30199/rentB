const Joi = require('joi');

const AdminRegisterSchema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
    password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})')).required(),
    role: Joi.string().valid("admin").required(),
});

const AdminLoginSchema = Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/),
    password: Joi.string().required(),
    fcmToken: Joi.object({
        deviceImei: Joi.string().min(15).max(20).required(),
        token: Joi.string().required()
    })
});

module.exports = { AdminRegisterSchema, AdminLoginSchema }