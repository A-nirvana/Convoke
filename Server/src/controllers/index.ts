import { signup, login, logout, updateProfile, me, getUser } from "./auth.controllers";
import { getDms, getAllUsers, getMessages, sendMessage, createDm, rejectDm, acceptDm, getRequests } from "./message.controllers";

export {signup, login, logout, updateProfile, me,  getDms, getAllUsers, getMessages, sendMessage, createDm, rejectDm, acceptDm, getRequests, getUser}