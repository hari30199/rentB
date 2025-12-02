const User = require('../../Models/User');
const { AdminLoginSchema, AdminRegisterSchema } = require('../../schemas/AdminSchema');
const Controller = require('../controller');
const Password = require('../Password');

class AdminLoginController extends Controller {

    constructor() {
        super();
        this.accessTokenValidity = '30d';
        this.refreshTokenValidity = '14d';
    }

    handleError = (err, res) => {
        res.status(500).json({ success: false, error: err.message });
    }

    createAdmin = async (req, res) => {
        const [payload, error] = await this.validate(req.body, AdminRegisterSchema);
        if (!payload) return res.status(400).json({ success: false, message: error });

        try {
            // Check if Admin already exists
            const adminExists = await User.checkUserExists({
                email: payload.email,
                phone: payload.phone
            });
            if (adminExists) return res.status(400).json({ success: false, message: 'Admin mobile or email already exists' });

            const password = new Password(payload.password);
            payload.password = password.encrypt();

            payload.isAdmin = true;
            const { fcmTokens } = payload;
            delete payload['fcmTokens'];

            const result = await User.addUser(payload);
            const token = await this.createJWT({ admin: { id: result.insertedId } }, process.env.JWT_SECRET_ADMIN, this.accessTokenValidity, 'HS256');
            if (!result.acknowledged) return res.status(500).json({ success: false, message: 'Admin not added' });

            if (fcmTokens) {
                // payload.fcmToken is an array hence, we use loop here
                fcmTokens.forEach(async (fcmToken) => {
                    await User.updateUserFcmToken(result.insertedId.toString(), fcmToken);
                });
            }

            return res.status(200).json({ success: true, message: 'Admin added', token, adminId: result.insertedId });

        } catch (err) {
            // Log and handle any error
            console.error(err);
            this.handleError(err, res);
        }

    }

    adminLogin = async (req, res) => {
        const [payload, error] = await this.validate(req.body, AdminLoginSchema);
        if (!payload) return res.status(400).json({ success: false, message: error });

        try {
            const query = {
                email: payload.email,
                password: payload.password
            }

            if (!payload.email) {
                delete query.email;
                query.phone = payload.phone;
            }

            const admin = await User.getAdminWithPhoneorEmail(query);
            if (!admin) return res.status(400).json({ success: false, message: 'Admin does not exists' });

            const password = new Password(admin.password);
            if (payload.password !== password.decrypt(admin.password)) return res.status(400).json({ success: false, message: 'You have entered Invalid Password' });

            const token = await this.createJWT({ admin: { id: admin._id } }, process.env.JWT_SECRET_ADMIN, this.accessTokenValidity, 'HS256');

            if (payload.fcmToken) {
                const adminDeviceImeiSet = new Set(admin.fcmTokens?.map(token => token.deviceImei) || []);
                const adminFcmTokensSet = new Set(admin.fcmTokens?.map(token => token.token) || []);

                if (!adminDeviceImeiSet.has(payload.fcmToken.deviceImei) || !adminFcmTokensSet.has(payload.fcmToken.token)) {
                    await User.updateUserFcmToken(admin._id, payload.fcmToken);
                }
            }

            const refreshToken = await this.createJWT({ admin: { id: admin._id } }, process.env.JWT_REFRESH_SECRET_ADMIN, this.refreshTokenValidity, 'HS256');
            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 14 * 24 * 60 * 60 * 1000 });

            return res.status(200).json({
                success: true, message: 'Admin Logged in', user: {
                    name: admin.name,
                    _id: admin._id,
                    role: admin.role,
                    token
                }
            });

        } catch (err) {
            // Log and handle any error
            console.error(err);
            this.handleError(err, res);
        }

    }
    
}

module.exports = AdminLoginController;