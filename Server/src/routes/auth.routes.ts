import { Router } from "express";
import { signup, login, logout, updateProfile, me, getUser } from "../controllers";
import { protectRoute } from "../middlewares";

const authRouter = Router();

authRouter.post("/signup",signup);
authRouter.post("/signin",login);
authRouter.post("/logout",logout);
authRouter.put("/update-profile",protectRoute,updateProfile);
authRouter.get("/me",protectRoute,me);
authRouter.get("/getUser/:id",protectRoute,getUser);

export { authRouter };