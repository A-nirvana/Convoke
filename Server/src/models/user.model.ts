import mongoose from "mongoose";

export interface Users extends Document{
    _id: mongoose.Schema.Types.ObjectId,
    name: string,
    email: string,
    password: string,
    profilePic: string | null,
    contactNumber: string | null,
    verified: boolean,
    dms: mongoose.Schema.Types.ObjectId[],
    requests: mongoose.Schema.Types.ObjectId[],
}

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePic: {
        type: String,
        default: "https://res.cloudinary.com/dmezugavw/image/upload/v1734430333/logo_t9fe5h.svg"
    },
    contactNumber: {
        type: String,
        sparse : true
    },
    verified:{
        type: Boolean,
        default: false
    },
    dms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},
    { timestamps: true }
);

const User = (mongoose.models.Users as mongoose.Model<Users>) ||
mongoose.model<Users>("User", UserSchema);

export default User;