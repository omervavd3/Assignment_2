import UserModel from "../models/userModel";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        if(email == null || password == null) {
            res.status(404).send("Email and password are required");
            return;
        }
        const user = await UserModel.findOne({email});
        if(user) {
            res.status(400).send("User already exists");
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await UserModel.create({email, password:hashedPassword});
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
            res.status(404).send("Email and password are required");
            return;
        }
        const user = await UserModel.findOne({email});
        if(user == null) {
            res.status(400).send("User does not exist");
            return;
        }
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) {
            res.status(402).send("Invalid password");
            return;
        }
        if(process.env.ACCESS_TOKEN_SECRET == null || process.env.JWT_EXPIRES_IN == null) {
            res.status(500).send("Internal server error");
            return;
        }
        if(process.env.REFRESH_TOKEN_SECRET == null) {
            res.status(500).send("Internal server error");
            return;
        }
        const random = Math.random().toString();
        const accesToken = await jwt.sign(
            {   
                '_id': user._id,
                'random': random
            }, 
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );
        const refreshToken = await jwt.sign(
            {
                '_id': user._id,
                'random': random
            }, 
            process.env.REFRESH_TOKEN_SECRET
        )
        if(user.tokens == null) {
            user.tokens = [];
        }
        user.tokens.push(refreshToken);
        await user.save();
        res.status(200).send({accessToken: accesToken, refreshToken: refreshToken});
    } catch (error) {
        res.status(500).send(error);
    }
};

const logout = async (req: Request, res: Response) => {
    try {
        const authToken = req.headers['authorization'];
        const refreshToken = authToken && authToken.split(' ')[1];
        if(refreshToken == null) {
            res.status(401).send("Unauthorized");
            return;
        }
        if(process.env.REFRESH_TOKEN_SECRET == null) {
            res.status(500).send("Internal server error");
            return;
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err: jwt.VerifyErrors | null, payload:any) => {
            if(err) {
                res.status(403).send("Error");
                return;
            }
            const user = await UserModel.findById((payload as payload)._id);
            if(user == null) {
                res.status(403).send("User is null");
                return;
            }
            if(!user.tokens.includes(refreshToken)) {
                user.tokens = [];
                await user.save();
                res.status(403).send("No matching token");
                return;
            }
            user.tokens = user.tokens.filter((token) => token !== refreshToken);
            await user.save();
            res.status(200).send("Logged out");
        })
    } catch (error) {
        res.status(500).send(error);
    }
}

type payload = {
    _id: string
}

const autMiddleware = async (req: Request, res: Response, next: any) => {
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(' ')[1];
    if(token == null) {
        res.status(401).send("No token provided");
        return;
    }

    if(process.env.ACCESS_TOKEN_SECRET == null) {
        res.status(500).send("No token secret");
        return;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if(err) {
            res.status(403).send("Error in middleware");
            return;
        }
        req.params.userId = (payload as payload)._id;
        next();
    })
}

const refreshToken = async (req: Request, res: Response) => {
    const authToken = req.headers['authorization'];
    const refreshToken = authToken && authToken.split(' ')[1];
    if(refreshToken == null) {
        res.status(401).send("Unauthorized");
        return;
    }
    try {
        if(process.env.REFRESH_TOKEN_SECRET == null) {
            res.status(500).send("Internal server error");
            return;
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err: jwt.VerifyErrors | null, payload:any) => {
            if(err) {
                res.status(403).send("Wrong refresh token");
                return;
            }
            const user = await UserModel.findById((payload as payload)._id);
            if(user == null) {
                res.status(403).send("Forbidden");
                return;
            }
            if(user.tokens == null) {
                res.status(403).send("Forbidden");
                return;
            }
            if(!user.tokens.includes(refreshToken)) {
                user.tokens = []
                await user.save();
                res.status(403).send("Forbidden");
                return;
            }
            if(process.env.ACCESS_TOKEN_SECRET == null || process.env.JWT_EXPIRES_IN == null || process.env.REFRESH_TOKEN_SECRET == null) {
                res.status(500).send("Internal server error");
                return;
            }
            const random = Math.random().toString();
            const accesToken = await jwt.sign(
                {
                    '_id': user._id,
                    'random': random
                }, 
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: process.env.JWT_EXPIRES_IN}
            )
            const newRefreshToken = await jwt.sign(
                {
                    '_id': user._id,
                    'random': random
                }, 
                process.env.REFRESH_TOKEN_SECRET
            )
            user.tokens.push(newRefreshToken);
            await user.save();
            res.status(200).send({accessToken: accesToken, refreshToken: newRefreshToken});
        })
    } catch (error) {
        res.status(500).send(error);
    }
}

export default {
    register,
    login,
    logout,
    autMiddleware,
    refreshToken
};