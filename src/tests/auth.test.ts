import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import UserModel from "../models/postModel";
import { Express } from "express";
import * as testJSON from "./testPost.json";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await UserModel.deleteMany();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

type User = {
  email: string;
  password: string;
  _id?: string;
}

const userTest: User = {
  email: "test@example.com",
  password: "1234"
}

describe("User Tests", () => {
    test("Auth test register", async () => {
        const response = await request(app).post("/auth/register").send({
            email: userTest.email,
            password: userTest.password
        });
        expect(response.statusCode).toBe(200);
    })

    test("Auth test login", async () => {
        const response = await request(app).post("/auth/login").send({
            email: userTest.email,
            password: userTest.password
        });
        expect(response.statusCode).toBe(200);
    })

    test("Auth test logout", async () => {
        const response = await request(app).post("/auth/logout").send({
            email: userTest.email,
            password: userTest.password
        });
        expect(response.statusCode).toBe(200);
    })
})