import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import { authRouter, messageRouter } from "./routes/index.js";
import { app, connectDB, server } from "./lib/index.js";
import path from "path";
import { createRequestHandler } from "@remix-run/express";
import { fileURLToPath, pathToFileURL } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use(express.static(path.join(__dirname, "../../Chat/build/client")));

// Handle all other requests using Remix
(async()=>{
    const buildPath = pathToFileURL(path.join(__dirname, "../../Chat/build/server/index.js")).href;
    const build = await import(buildPath);
    app.all(
        "*",
        createRequestHandler({
            build, // Use Remix server build
            mode: process.env.NODE_ENV, // Pass the environment mode
        })
    );
})()

server.listen(PORT, ()=>{
    console.log(`⚡️[server]: Server is running on PORT: ${PORT}`);
    connectDB();
})