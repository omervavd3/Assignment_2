import express from "express";
const authRouter = express.Router();
import authController from "../controllers/authController";

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: Auth api
 */

/**
 * @swagger
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          description: Email of the user
 *        password:
 *          type: string
 *          description: Password of the user
 *      example:
 *        email: 'example@mail.com'
 *        password: '1234'
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    Tokens:     
 *      type: object
 *      required:
 *        - accessToken
 *        - refreshToken
 *      properties:
 *        accessToken:
 *          type: string
 *          description: JWT Access token
 *        refreshToken:
 *          type: string
 *          description: JWT Refresh token
 *      example:
 *        accessToken: 'aefefEWF'
 *        refreshToken: 'aefefEWF'
 */

authRouter
/**
 * @swagger
 * /auth/register:
 *  post:
 *    summary: Register a new user
 *    tags:
 *      - Auth
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:  
 *        description: User registered successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schemas/User'
 *      400:
 *         description: User already exists
 *      404:
 *         description: No email or password provided
 *      500:
 *        description: Internal server error
 */     
    .post("/register", authController.register)
/**
 * @swagger
 * /auth/login:
 *  post:
 *    summary: Login a user
 *    tags:
 *      - Auth
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: User logged in successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tokens'
 *      404:
 *          description: No email or password provided
 *      400:
 *          description: User does not exist
 *      402:
 *          description: Invalid password
 *      500:
 *          description: Internal server error 
 */
    .post("/login", authController.login)
/**
 * @swagger
 * /auth/logout:
 *  post:
 *    summary: Logout a user
 *    tags:
 *      - Auth
 *    description: Needs to provide refresh token
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: User logged out successfully
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal server error
 */ 
    .post("/logout",authController.logout)
/**
 * @swagger
 * /auth/refresh:
 *  post:
 *    summary: Returns new access token by submitting refresh token
 *    tags:
 *      - Auth
 *    description: Needs to provide refresh token
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: New access token generated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tokens'
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Invalid refresh token
 *      500:
 *        description: Internal server error
 */
    .post("/refresh", authController.refreshToken)


export default authRouter;