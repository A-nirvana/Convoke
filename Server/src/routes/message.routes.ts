import { Router } from "express";
import { protectRoute, fileUploadMiddleware, processFiles } from "../middlewares/index.js";
import {  getDms, getAllUsers, getMessages, sendMessage, createDm, rejectDm, acceptDm, getRequests  } from "../controllers/index.js";

const messageRouter = Router();
messageRouter.get("/users", protectRoute, getAllUsers);
messageRouter.get("/dms", protectRoute, getDms);
messageRouter.get("/request", protectRoute, getRequests);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.post("/:id", protectRoute, fileUploadMiddleware, processFiles, sendMessage);
messageRouter.put("/create", protectRoute, createDm);
messageRouter.put("/accept", protectRoute, acceptDm);
messageRouter.put("/reject", protectRoute, rejectDm);

export { messageRouter };