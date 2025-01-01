import express from "express";
const postRouter = express.Router();
import PostController from "../controllers/postController";
import authController from "../controllers/authController";

/**
 * @swagger
 * tags:
 *  name: Posts
 *  description: Post api
 */

/**
 * @swagger
 * components:
 *  schemas:
 *      Post:
 *          type: object
 *          required:
 *              - title
 *              - content
 *              - owner
 *          properties:
 *              title:
 *                  type: string
 *                  description: Title of the post
 *              content:
 *                  type: string
 *                  description: Content of the post
 *              owner:
 *                  type: string
 *                  description: Owner of the post
 *          example:
 *              title: Post Title
 *              content: Post Content
 *              owner: Owner
 */

postRouter
/**
 * @swagger
 * /posts:
 *  get:
 *    summary: Get all posts
 *    tags: 
 *      - Posts
 *    parameters:
 *      - in: query
 *        name: owner
 *    responses:
 *      200:
 *        description: The list of the posts
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Post'
 *      500:
 *        description: Some server error
 */
    .get("/", PostController.getAll.bind(PostController))
/**
 * @swagger
 * /posts:
 *  post:
 *    summary: Create a new post
 *    tags:
 *      - Posts
 *    security:
 *      - bearerAuth: []
 *    description: Requires access token
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Post'
 *    responses:
 *      201:
 *        description: New post created
 *        content: 
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      500:
 *         description: Some server error
 */
    .post("/", authController.autMiddleware ,PostController.create.bind(PostController))
/**
 * @swagger
 * /posts/{id}:
 *  get:
 *     summary: Get a post filtered by post id
 *     tags: 
 *      - Posts
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *          description: The post id
 *          example: 61f3b1b3b3b3b3b3b3b3b3
 *     responses:
 *         200:
 *            description: A single post
 *            content:
 *               application/json:
 *                 schema:
 *                   $ref: '#/components/schemas/Post'
 *         500:
 *           description: Some server error
 */
    .get("/:id", PostController.getById.bind(PostController))
/**
 * @swagger
 * /posts/{id}:
 *  delete:
 *    summary: Delete a post by id
 *    tags:
 *      - Posts
 *    security:
 *      - bearerAuth: []
 *    description: Requires access token
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The post id
 *        example: 61f3b1b3b3b3b3b3b3b3b3
 *    responses:
 *      204:
 *        description: Post deleted
 *      404:
 *        description: Post not found
 *      500:
 *        description: Some server error
 */
    .delete("/:id", authController.autMiddleware ,PostController.deleteItemById.bind(PostController))

export default postRouter;