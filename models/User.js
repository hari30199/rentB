const Mongo = require('../Controllers/DB/Mongo')
const { ObjectId } = require('mongodb');

class User {
    constructor() {

    }

    static checkUserExists = async ({ email, phone }) => {
        let query = {};
        if (email && phone) {
            query = { $or: [{ email: email }, { phone: phone }] };
        } else if (email) {
            query = { email: email };
        } else if (phone) {
            query = { phone: phone };
        }
        const user = await Mongo.findOne('users', query);
        return user;
    }

    static checkUserExistsById = async (id) => {
        const user = await Mongo.findOne('users', { _id: new ObjectId(id) });
        return user;
    }

    static addUser = async (user) => {
        const result = await Mongo.insertOne('users', user);
        return result;
    }

    static getUserFromId = async (id) => {
        const user = await Mongo.findOne('users', { _id: new ObjectId(id) });
        return user;
    }

    static deleteUser() {

    }

    static updatePassword = async (id, password) => {
        id = new ObjectId(id);
        const result = await Mongo.updateOne('users', { _id: id }, { password: password });
        return result;
    }

    static getUserDetail = async (id) => {
        const result = await Mongo.findOne("users", { _id: new ObjectId(id) });
        return result;
    }


    static updateUserDetail = async (id, data) => {
        id = new ObjectId(id);
        const result = await Mongo.updateOne('users', { _id: id }, data);
        return result;
    }


    static getUserWithPhoneorEmail(payload) {
        if (payload.email) return Mongo.findOne('users', { email: payload.email });
        return Mongo.findOne('users', { phone: payload.phone });
    }

    static getUsers() {
        return [];
    }

    static createJWT = async () => {
        return 'token';
    }

    static login = async (id) => {
        const query = {
            _id: new ObjectId(id)
        }

        const updateQuery = {
            lastLogin: new Date().getTime()
        }
        await Mongo.updateOne('users', query, updateQuery);
        const token = await this.createJWT(id);
        return token;
    }

    // Search users Using Search String
    static searchUsers = async (query, projection) => {
        const result = await Mongo.findProjection('users', query, projection);
        return result;
    }

    /* Admin Func */
    static getAdminWithPhoneorEmail(payload) {
        if (payload.email) return Mongo.findOne('users', { email: payload.email, isAdmin: true });
        return Mongo.findOne('users', { phone: payload.phone, isAdmin: true });
    }

    static getAllUsers = async ( ) => {
        const result = await Mongo.findProjection( 'users', {}, { password: 0, fcmTokens: 0 } )
        return result
    }

}


module.exports = User;