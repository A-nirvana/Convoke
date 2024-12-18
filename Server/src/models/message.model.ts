import mongoose, { Document} from "mongoose";

export interface Messages extends Document{
    senderId: mongoose.Schema.Types.ObjectId,
    recieverId: mongoose.Schema.Types.ObjectId,
    text: string,
    image: string,
    video: string,
    audio: string,
    file: string,
    createdAt: Date,
}

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text:{
        type:String
    },
    image:{
        type:String
    },
    video : {
        type:String
    },
    audio:{
        type:String
    },
    file:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
},{timestamps: true})     

const Message = (mongoose.models.messages as mongoose.Model<Messages>) ||
mongoose.model<Messages>("Message", messageSchema);

export default Message