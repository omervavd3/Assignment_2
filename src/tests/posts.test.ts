import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import PostModel from "../models/postModel";
import UserModel from "../models/userModel";
import e, { Express } from "express";
import * as testJSON from "./testPost.json";

var app: Express;

type User = {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string;
  accessToken?: string;
};

const testUser: User = {
  email: "example@email.com",
  password: "1234",
};

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await PostModel.deleteMany();
  await UserModel.deleteMany();
  await request(app).post("/auth/register").send({
    email: testUser.email,
    password: testUser.password,
  });
  const res = await request(app).post("/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  testUser.refreshToken = res.body.refreshToken;
  testUser.accessToken = res.body.accessToken;
  testUser._id = res.body._id;
  expect(testUser.refreshToken).toBeDefined();
  expect(testUser.accessToken).toBeDefined();
});

afterAll(async () => {
  console.log("afterAll");
  await PostModel.deleteMany();
  await UserModel.deleteMany();
  mongoose.connection.close();
});

let postId = "";
describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create Post", async () => {
    const response = await request(app).post("/posts").set({
      Authorization: "JWT " + testUser.accessToken,
    }).send({
      title: testJSON[0].title,
      content: testJSON[0].content,
      owner: testJSON[0].owner,
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(testJSON[0].title);
    expect(response.body.content).toBe(testJSON[0].content);
    expect(response.body.owner).toBe(testJSON[0].owner);
    postId = response.body._id;
  });

  test("Test Create Post without all params", async () => {
    const response = await request(app).post("/posts").set({
      Authorization: "JWT " + testUser.accessToken,
    }).send({
      title: testJSON[0].title,
    });
    expect(response.statusCode).toBe(500);
  });

  test("Test Create Post without token", async () => {
    const response = await request(app).post("/posts").set({}).send({
      title: testJSON[0].title,
      content: testJSON[0].content,
      owner: testJSON[0].owner,
    });
    expect(response.statusCode).toBe(401);
  })

  test("Test create post with wrong token", async () => {
    const response = await request(app).post("/posts").set({
      Authorization: "JWT " + testUser.accessToken + "1",
    }).send({
      title: testJSON[0].title,
      content: testJSON[0].content,
      owner: testJSON[0].owner,
    });
    expect(response.statusCode).toBe(403);
  })

  test("Test get post by owner", async () => {
    const response = await request(app).get(`/posts?owner=${testJSON[0].owner}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe(testJSON[0].title);
    expect(response.body[0].content).toBe(testJSON[0].content);
    expect(response.body[0].owner).toBe(testJSON[0].owner);
  });

  test("Posts test get all fail (no matching owner)", async () => {
    const response = await request(app).get("/posts/?owner=123");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(testJSON[0].title);
    expect(response.body.content).toBe(testJSON[0].content);
    expect(response.body.owner).toBe(testJSON[0].owner);
  });

  test("Test get post by id fail (no matchind id)", async () => {
    const response = await request(app).get("/posts/" + postId + "1");
    expect(response.statusCode).not.toBe(200);
  });

  test("Test Delete Post", async () => {
    const response = await request(app).delete("/posts/" + postId).set({
      Authorization: "JWT " + testUser.accessToken,
    });
    expect(response.statusCode).toBe(204);
  });

  test("Test get post by id fail (no data)", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.statusCode).toBe(404);
  });

  test("Test Delete Post fail (no matching id)", async () => {
    const response = await request(app).delete("/posts/" + postId + "1");
    expect(response.statusCode).not.toBe(200);
  });

  test("Posts test get all after delete", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });
});
