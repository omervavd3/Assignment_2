import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import UserModel from "../models/userModel";
import e, { Express } from "express";
import * as testJSON from "./testPost.json";
import { access } from "fs";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await UserModel.deleteOne({email: testUser.email});
});

afterAll(async () => {
  console.log("afterAll");
  await UserModel.deleteOne({email: testUser.email});
  mongoose.connection.close();
});

type User = {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string;
  accessToken?: string;
};

const testUser: User = {
  email: "test@example.com",
  password: "1234",
};


describe("User Tests", () => {
  test("Auth test register", async () => {
    const response = await request(app).post("/auth/register").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.password).not.toBe(testUser.password);
  });

  test("Auth test register with the same email again", async () => {
    const response = await request(app).post("/auth/register").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(response.statusCode).toBe(400);
  });

  test("Auth test register without email", async () => {
    const response = await request(app).post("/auth/register").send({
      password: testUser.password,
    });
    expect(response.statusCode).toBe(400);
  })

  test("Auth test login", async () => {
    const response = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(response.statusCode).toBe(200);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;
    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;
    expect(testUser.accessToken).not.toBeNull();
    expect(testUser.refreshToken).not.toBeNull();
  });

  test("Auth test login with wrong password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: "wrongPassword",
    });
    expect(response.statusCode).not.toBe(200);
  });

  test("Auth test login without email", async () => {
    const response = await request(app).post("/auth/login").send({
      password: testUser.password,
    });
    expect(response.statusCode).toBe(400);
  });

  test("Auth test with wrong email", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "wrongEmail",
      password: testUser.password,
    });
    expect(response.statusCode).toBe(400);
  })

  test("Auth test refresh token", async () => {
    const response = await request(app).post("/auth/refresh").set({
      Authorization: `JWT ${testUser.refreshToken}`
    })
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  })

  test("Auth test refresh token without token", async () => {
    const response = await request(app).post("/auth/refresh").set({});
    expect(response.statusCode).toBe(401);
  })

  test("Auth test refresh token with wrong token", async () => {
    const response = await request(app).post("/auth/refresh").set({
      Authorization: `JWT wrongToken`
    })
    expect(response.statusCode).toBe(403);
  })

  test("Auth test double use of refresh token", async () => {
    const response = await request(app).post("/auth/refresh").set({
      Authorization: `JWT ${testUser.refreshToken}`
    })
    expect(response.statusCode).toBe(200);
    const response2 = await request(app).post("/auth/refresh").set({
      Authorization: `JWT ${testUser.refreshToken}`
    })
    expect(response2.statusCode).toBe(200);
    const newRefreshToken = response.body.refreshToken;
    testUser.refreshToken = newRefreshToken;
  })

  test("Auth test logout", async () => {
    const response = await request(app).post("/auth/logout").set({
      Authorization: `JWT ${testUser.refreshToken}`
    })
    expect(response.statusCode).toBe(200);
  })

  test("Auth test logout without token", async () => {
    const response = await request(app).post("/auth/logout").set({});
    expect(response.statusCode).toBe(401);
  })

  test("Auth test logout with wrong token", async () => {
    const response = await request(app).post("/auth/logout").set({
      Authorization: `JWT wrongToken`
    })
    expect(response.statusCode).toBe(403);
  })
});
