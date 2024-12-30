import UserModel from "../models/userModel";
import { Request, Response } from "express";

const register = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    if(email == null || password == null) {
        return res.status(400).send("Email and password are required");
    }
    try {
        const user = await UserModel.findOne({email});
        if(user) {
            return res.status(400).send("User already exists");
        }
        await UserModel.create({email, password});
        res.status(200).send("User created");
    } catch (error) {
        res.status(500).send(error);
    }
};

const login = async (req: Request, res: Response) => {
    console.log("login");
    res.status(200).send("login");
};

const logout = async (req: Request, res: Response) => {
    console.log("logout");
    res.status(200).send("logout");
}

export default {
    register,
    login,
    logout
};