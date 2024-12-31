import UserModel from "../models/userModel";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        if(email == null || password == null) {
            res.status(400).send("Email and password are required");
            return;
        }
        const user = await UserModel.findOne({email});
        if(user) {
            res.status(400).send("User already exists");
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await UserModel.create({email, hashedPassword});
        res.status(200).send(newUser);
        return;
    } catch (error) {
        res.status(500).send(error);
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        if(email == null || password == null) {
            res.status(400).send("Email and password are required");
            return;
        }
        const user = await UserModel.findOne({email});
        if(user == null) {
            res.status(400).send("User does not exist");
            return;
        }
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) {
            res.status(400).send("Invalid password");
            return;
        }
        if(process.env.ACCESS_TOKEN_SECRET == null || process.env.JWT_EXPIRES_IN == null) {
            res.status(500).send("Internal server error");
            return;
        }
        const accesToken = await jwt.sign(
            {'_id': user._id}, 
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );
        res.status(200).send(accesToken);
    } catch (error) {
        res.status(500).send(error);
    }
};

const logout = async (req: Request, res: Response) => {
    console.log("logout");
    res.status(200).send("logout");
}

type payload = {
    _id: string
}

const autMiddleware = async (req: Request, res: Response, next: any) => {
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(' ')[1];
    if(token == null) {
        res.status(401).send("Unauthorized");
        return;
    }

    if(process.env.ACCESS_TOKEN_SECRET == null) {
        res.status(500).send("Internal server error");
        return;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if(err) {
            res.status(403).send("Forbidden");
            return;
        }
        req.params.userId = (payload as payload)._id;
        next();
    })
}

export default {
    register,
    login,
    logout,
    autMiddleware
};