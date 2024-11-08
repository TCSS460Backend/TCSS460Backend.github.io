import express, { Request, Response, Router, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';

export interface Auth {
    email: string;
    password: string;
}

export interface AuthRequest extends Request {
    auth: Auth;
}

const isStringProvided = validationFunctions.isStringProvided;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;
const isValidPassword = validationFunctions.isValidPassword;

const changePasswordRouter: Router = express.Router();

const key = {
    secret: process.env.JSON_WEB_TOKEN,
};

/**
 * @api {patch} /change-password Request to change an existing user's password
 * @apiDescription Request to change a user's password to a provided new password
 *
 * @apiName PatchChangePassword
 * @apiGroup Auth
 *
 * @apiBody {String} email a users email
 * @apiBody {String} password a users password
 * @apiBody {String} new_password the desired new password
 *
 * @apiSuccess {String} accessToken JSON Web Token
 * @apiSuccess {String} message "Password Successfully Updated."
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information."
 * @apiError (400: Invalid Password) {String} message "Invalid new password  - please refer to documentation."
 * @apiError (404: User Not Found) {String} message "User not found."
 * @apiError (400: Invalid Credentials) {String} message "Credentials did not match."
 *
 */
changePasswordRouter.patch(
    '/change-password',
    (request: AuthRequest, response: Response, next: NextFunction) => {
        if (
            isStringProvided(request.body.email) &&
            isStringProvided(request.body.password) &&
            isStringProvided(request.body.new_password)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Missing required information.',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPassword(request.body.new_password)) {
            next();
        } else {
            response.status(400).send({
                message:
                    'Invalid new password  - please refer to documentation.',
            });
        }
    },
    (request: AuthRequest, response: Response) => {
        const theQuery = `SELECT salted_hash, salt, Account_Credential.account_id, account.email, account.firstname, account.account_role FROM Account_Credential
                      INNER JOIN Account ON
                      Account_Credential.account_id=Account.account_id 
                      WHERE Account.email=$1`;
        const values = [request.body.email];
        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: 'User not found.',
                    });
                    return;
                } else if (result.rowCount > 1) {
                    //log the error
                    console.error(
                        'DB Query error on sign in: too many results returned'
                    );
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
                    return;
                }
                //Retrieve the salt used to create the salted-hash provided from the DB
                const salt = result.rows[0].salt;
                //Retrieve the salted-hash password provided from the DB
                const storedSaltedHash = result.rows[0].salted_hash;
                //Generate a hash based on the stored salt and the provided password
                const providedSaltedHash = generateHash(
                    request.body.password,
                    salt
                );
                //Did our salted hash match their salted hash?
                if (storedSaltedHash === providedSaltedHash) {
                    //credentials match. get a new JWT
                    const accessToken = jwt.sign(
                        {
                            name: result.rows[0].firstname,
                            role: result.rows[0].account_role,
                            id: result.rows[0].account_id,
                        },
                        key.secret,
                        {
                            expiresIn: '14 days', // expires in 14 days
                        }
                    );

                    const newSalt = generateSalt(32);
                    const newHash = generateHash(
                        request.body.new_password,
                        newSalt
                    );
                    const accountId = result.rows[0].account_id;

                    const theNewQuery = `UPDATE Account_Credential
                            SET Salted_Hash = $1, salt = $2
                            WHERE Account_Credential.account_id = $3`;
                    const theNewValues = [newHash, newSalt, accountId];
                    pool.query(theNewQuery, theNewValues).catch((error) => {
                        //log the error
                        console.error('DB Query error on assign new password');
                        console.error(error);
                        response.status(500).send({
                            message:
                                'Server error, password not updated - contact support',
                        });
                    });
                    response.status(200).json({
                        accessToken,
                        message: 'Password Successfully Updated.',
                    });
                } else {
                    //credentials do not match
                    response.status(400).send({
                        message: 'Credentials did not match.',
                    });
                }
            })
            .catch((error) => {
                //log the error
                console.error('DB Query error on user retrieval');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            });
    }
);

export { changePasswordRouter };
