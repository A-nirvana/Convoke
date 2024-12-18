import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

export function getRecieverSocketId(userId: string) {
    return userSocketMap[userId];
}

const userSocketMap: { [key:string]: string} = {};

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if(userId && typeof userId==="string")userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        if(userId && typeof userId==="string")delete userSocketMap[userId];
    });
});

export { io, server, app };