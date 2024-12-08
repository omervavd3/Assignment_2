import express from "express";
const postRouter = express.Router();
import PostController from "../controllers/postController";

postRouter
    .get("/", PostController.getAll.bind(PostController))
    .post("/", PostController.create.bind(PostController))
    .get("/:id", PostController.getById.bind(PostController))
    .delete("/:id", PostController.deleteItemById.bind(PostController))

export default postRouter;