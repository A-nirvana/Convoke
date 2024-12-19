import { Router } from "express";
import { protectRoute } from "../middlewares/index.js";
import {  getDms, getAllUsers, getMessages, sendMessage, createDm, rejectDm, acceptDm, getRequests  } from "../controllers/index.js";

const messageRouter = Router();

messageRouter.get("/users", protectRoute, getAllUsers);
messageRouter.get("/dms", protectRoute, getDms);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.post("/:id", protectRoute, sendMessage);
messageRouter.get("/request", protectRoute, getRequests);
messageRouter.post("/create", protectRoute, createDm);
messageRouter.post("/accept", protectRoute, acceptDm);
messageRouter.post("/reject", protectRoute, rejectDm);

export { messageRouter };