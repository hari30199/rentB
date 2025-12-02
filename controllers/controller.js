const { v4: uuidv4 } = require('uuid');
const { DatabaseInsertFailed, DatabaseDeleteFailed, DatabaseUpdateFailed } = require('../models/Exceptions');
const jwt = require('jsonwebtoken');
const { BSONError } = require('bson');

class Controller {

    constructor() {
        this.MAX_PAGINATION_LIMIT = 100;
    }

    createUniqueId = () => {
        return uuidv4();
    }

    validate = async (data, schema) => {
        try {
            const value = await schema.validateAsync(data);
            return [value, { success: true }];
        } catch (error) {
            return [null, { error: error.details[0].message, success: false }];
        }
    }

    createJWT = async (data, secret, expiry = undefined, alg = "HS256") => {
        try {
            const options = { algorithm: alg };
            if (expiry) {
                options.expiresIn = expiry;
            }
            const token = await jwt.sign(data, secret, options);
            return token;
        } catch (error) {
            return null;
        }
    }
    
    validateJWT = async (token, secret, alg = "HS256") => {
        try {
            const decoded = jwt.verify(token, secret, { algorithm: alg });
            return [decoded, { success: true }];
        } catch (error) {
            return [null, { error: error.message, success: false }];
        }
    }

    handleError = async (err, res) => {

        if (err instanceof DatabaseInsertFailed) {
            return res.status(400).json({
                error: err.message,
                success: false
            });
        }

        if (err instanceof DatabaseDeleteFailed) {
            return res.status(400).json({
                error: err.message,
                success: false
            });
        }

        if (err instanceof DatabaseUpdateFailed) {
            return res.status(400).json({
                error: err.message,
                success: false
            });
        }

        if (err instanceof BSONError) {
            return res.status(400).json({
                error: 'Invalid data',
                success: false
            });
        }
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }

}

module.exports = Controller;