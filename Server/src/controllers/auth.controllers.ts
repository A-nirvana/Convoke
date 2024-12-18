import { Request, Response } from "express"
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { User } from "../models";
import { generateToken, cloud } from "../lib";
import { Users } from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            user: Users
        }
    }
}

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PWD
    }
});
var mailOptions = (link : string, to: string, name:  string) => {return {
    from: process.env.EMAIL,
    subject: 'Convoke | Email Verification',
    to,
    html: `
    <html>
      <head>
        <style>
          /* Inline CSS styles */
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            padding: 20px;
          }
          .email-container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #007BFF;
          }
          p {
            font-size: 16px;
          }
          .cta-button {
            background-color: #007BFF;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1>Hello, ${name.split(" ")[0]} !</h1>
          <p>Thank you for signing up for our service. We are excited to have you onboard! Click on the link below to get verified</p>
          <a href="${link}" class="cta-button">Get verified</a>
        </div>
      </body>
    </html>
  `,
};}

const signup = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    try {
        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters long" });
            return;
        }
        const existingUser = await User.findOne({ $or: [{ email }] });
        if (existingUser) {
            res.status(401).json({ message: "Email or number already in use" });
            return;
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            transporter.sendMail(mailOptions(`http://localhost:5000/auth/verifyEmail/${newUser._id}`, email, name), (err, info) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(info);
                }
            });

            res.status(201).json({ message: "User created successfully" });
        }
        else {
            res.status(400).json({ message: "Failed to create user" });
        }

    } catch (error:any) {
        res.status(500).json({ message: error.message });
    }
}

const login = async (req: Request, res: Response) => {
    const { emailOrContact, password } = req.body;
    if (!emailOrContact) {
        res.status(400).json({ message: "Either email or contact number is required" });
        return;
    }
    if (!password) {
        res.status(400).json({ message: "Password is required" });
        return;
    }
    try {
        const user = await User.findOne({ $or: [{ email: emailOrContact }, { contactNumber: emailOrContact }] });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            contactNumber: user.contactNumber,
            profilePic: user.profilePic
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = (req: Request, res: Response) => {
    try {
        res.clearCookie('jwt');
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { profilePic } = req.body;
        const userID = req.user._id;

        if (!profilePic) {
            res.status(400).json({ message: "Profile Pic is required" });
            return;
        }

        const uploaded = await cloud.uploader.upload(profilePic);
        if (uploaded) {
            const updatedUser = await User.findByIdAndUpdate(userID, { profilePic: uploaded.secure_url }, { new: true });
            if (updatedUser) {
                res.status(200).json(updatedUser);
            }
            else {
                res.status(400).json({ message: "Failed to update profile" });
            }
        }
        else {
            res.status(400).json({ message: "Failed to upload image" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const me = (req: Request, res: Response) => {
    try {
        res.status(200).json(req.user);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getUser = async(req:Request, res:Response)=>{
    try{
        const {id} = req.params;
        const user = await User.findById(id).select("-password -requests -dms -verified");
        if(user){
            res.status(200).json({user});
        }
        else{
            res.status(404).json({message:"User not found"});
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}


export { signup, login }