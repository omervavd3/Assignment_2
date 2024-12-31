import express from "express";
const postRouter = express.Router();
import PostController from "../controllers/postController";
import authController from "../controllers/authController";

postRouter
    .get("/", PostController.getAll.bind(PostController))
    .post("/", authController.autMiddleware ,PostController.create.bind(PostController))
    .get("/:id", PostController.getById.bind(PostController))
    .delete("/:id", authController.autMiddleware ,PostController.deleteItemById.bind(PostController))

export default postRouter;