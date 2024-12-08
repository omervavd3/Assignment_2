import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import PostModel from "../models/postModel";
import { Express } from "express";
import * as testJSON from "./testPost.json";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await PostModel.deleteMany();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

let postId = "";
describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create Post", async () => {
    const response = await request(app).post("/posts").send({
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

  test("Test get post by owner", async () => {
    const response = await request(app).get(`/posts?owner=${testJSON[0].owner}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe(testJSON[0].title);
    expect(response.body[0].content).toBe(testJSON[0].content);
    expect(response.body[0].owner).toBe(testJSON[0].owner);
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(testJSON[0].title);
    expect(response.body.content).toBe(testJSON[0].content);
    expect(response.body.owner).toBe(testJSON[0].owner);
  });

  test("Test Delete Post", async () => {
    const response = await request(app).delete("/posts/" + postId);
    expect(response.statusCode).toBe(204);
  });

  test("Posts test get all after delete", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });
});
