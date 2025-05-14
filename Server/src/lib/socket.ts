import { Server } from "socket.io";
import http from "http";
import express from "express";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

interface Room {
  roomId: string;
  users: string[];
}

const rooms: Record<string, Room> = {};
const users: Record<string, { roomId: string }> = {};

// ————————  EXISTING MAP & CHAT EVENTS  ————————
const userSocketMap: Record<string, string> = {};
export function getRecieverSocketId(userId:string) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId && typeof userId === "string") {
    userSocketMap[userId] = socket.id;
  }
  // broadcast updated online‑list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ————————  YOUR ORIGINAL VIDEO‑CALL FLOW  ————————

  // 1️⃣ “join” – your original room‑join
  socket.on("join", ({ roomId }) => {
    // your existing rooms/users maps logic…
    users[socket.id] = { roomId };
    if (!rooms[roomId]) rooms[roomId] = { roomId, users: [] };
    rooms[roomId].users.push(socket.id);
  });

  // 2️⃣ localDescription → broadcast to other peer
  socket.on("localDescription", ({ description }) => {
    const { roomId } = users[socket.id];
    rooms[roomId].users
      .filter(id => id !== socket.id)
      .forEach(id => io.to(id).emit("localDescription", { description }));
  });

  // 3️⃣ remoteDescription → broadcast to other peer
  socket.on("remoteDescription", ({ description }) => {
    const { roomId } = users[socket.id];
    rooms[roomId].users
      .filter(id => id !== socket.id)
      .forEach(id => io.to(id).emit("remoteDescription", { description }));
  });

  // 4️⃣ ICE candidates (caller → callee)
  socket.on("iceCandidate", ({ candidate }) => {
    const { roomId } = users[socket.id];
    rooms[roomId].users
      .filter(id => id !== socket.id)
      .forEach(id => io.to(id).emit("iceCandidate", { candidate }));
  });

  // 5️⃣ ICE candidate replies (callee → caller)
  socket.on("iceCandidateReply", ({ candidate }) => {
    const { roomId } = users[socket.id];
    rooms[roomId].users
      .filter(id => id !== socket.id)
      .forEach(id => io.to(id).emit("iceCandidateReply", { candidate }));
  });

  // 6️⃣ Clean up when someone disconnects
  socket.on("disconnect", () => {
    Object.keys(rooms).forEach(roomId => {
      rooms[roomId].users = rooms[roomId].users.filter(id => id !== socket.id);
      if (rooms[roomId].users.length === 0) delete rooms[roomId];
    });
    delete users[socket.id];
  });


  // ————————  NEW WebRTC “init/ready/offer/answer” FLOW  ————————

  socket.on("join-room", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;
    // are you the first in the room?
    const isInitiator = numClients === 0;
    socket.join(roomId);
    socket.emit("init", { isInitiator });
    if (numClients > 0) {
      // once second peer arrives, everyone in room knows “ready”
      io.to(roomId).emit("ready");
    }
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
  });


  // ————————  CALL‑INVITE EVENTS (UNCHANGED)  ————————

  socket.on("call-user", ({ toUserId, fromUserId }) => {
    const target = getRecieverSocketId(toUserId);
    if (target) io.to(target).emit("incoming-call", { fromUserId });
  });

  socket.on("accept-call", ({ toUserId, roomId }) => {
    const caller = getRecieverSocketId(toUserId);
    if (caller) io.to(caller).emit("call-accepted", { roomId });
  });

  socket.on("reject-call", ({ toUserId }) => {
    const caller = getRecieverSocketId(toUserId);
    if (caller) io.to(caller).emit("call-rejected");
  });
});

export { io, server, app };