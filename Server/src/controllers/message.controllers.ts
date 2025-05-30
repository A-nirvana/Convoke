import { Request, Response } from "express";
import { Message, User } from "../models/index.js";
import { cloud } from "../lib/index.js";
import { Users } from "../models/user.model.js";
import { getRecieverSocketId, io } from "../lib/index.js";
import mongoose from "mongoose";

declare global {
    namespace Express {
      interface Request {
        user: Users
      }
    }
  }

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password -requests -dms -verified");

        res.status(200).json({ users: filteredUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getDms = async (req:Request, res:Response)=>{
    try{
        const dmList  = req.user.dms;
        let dms = <any>[];
        for (const dm of dmList) {
            const dmData = await User.findById(dm).select("-password -requests -dms -verified");
            dms.push(dmData);
        }
        res.status(200).json({dms});
    }catch(error){
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const getRequests = async (req:Request, res:Response)=>{
    try{
        const requests  = req.user.requests;
        let requestList = <any>[];
        for (const dm of requests) {
            const dmData = await User.findById(dm).select("-password -requests -dms -verified");
            requestList.push(dmData);
        }
        res.status(200).json({requestList});
    }catch(error){
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const createDm = async (req:Request, res:Response)=>{
    try{
        const {dmId} = req.body;
        const user = req.user;
        await User.findByIdAndUpdate(dmId, {$push:{requests:user._id}}); 
        res.status(200).json({message:"DM request successfully"});
    }catch(error){
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const acceptDm = async (req:Request, res:Response)=>{
    try{
        const {dmId} = req.body;
        const user = req.user;
        const updatedReq = user.requests.filter((req)=>req != dmId)
        await User.findByIdAndUpdate(user._id, {$push:{dms:dmId}, $set:{requests:updatedReq}});
        if(user._id != dmId)await User.findByIdAndUpdate(dmId, {$push:{dms:user._id}});
        res.status(200).json({message:"DM request accepted"});
    }catch(error){
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const rejectDm = async (req:Request, res:Response)=>{
    try{
        const {dmId} = req.body;
        const user = req.user;
        const updatedReq = user.requests.filter((req)=>req != dmId)
        await User.findByIdAndUpdate(user._id, {$set:{requests:updatedReq}});
        res.status(200).json({message:"DM request rejected"});
    }catch(error){
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const getMessages = async (req:Request, res:Response)=>{
    try{
        const {id:userToChatId} = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId, recieverId:userToChatId},
                {senderId:userToChatId, recieverId:senderId}
            ]
        });

        res.status(200).json({messages});
    }catch(error){
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { text, image, video, audio, file } = req.body;
        const { id: recieverId } = req.params;
        const senderId = req.user._id;

        const newMessage = new Message({
            senderId,
            recieverId,
            text,
            image,
            video,
            audio,
            file,
        });

        const recieverSocketId = getRecieverSocketId(recieverId);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("newMessage", newMessage);
        }

        await newMessage.save();

        res.status(201).json({ newMessage });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
