import express from "express";
const authRouter = express.Router();
import authController from "../controllers/authController";

authRouter
    .post("/register", authController.register)
    .post("/login", authController.login)
    .post("/logout",authController.logout)
    .post("/refresh", authController.refreshToken)


export default authRouter;