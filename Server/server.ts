import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import { authRouter, messageRouter } from "./src/routes";
import { app, connectDB, server } from "./src/lib";

dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))

const PORT = process.env.PORT || 3000;

app.use("/auth", authRouter)
app.use("/messages", messageRouter)

server.listen(PORT, ()=>{
    console.log(`⚡️[server]: Server is running on PORT: ${PORT}`);
    connectDB();
})