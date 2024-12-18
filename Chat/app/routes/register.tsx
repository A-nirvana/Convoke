import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from "react";
import { Form, Link, redirect, useLoaderData, useNavigate } from '@remix-run/react';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { axiosInstance } from 'utils/axios';


export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const navigate = useNavigate()
    return (
        <Form className="flex w-screen h-screen bg-[#0f766e] justify-center md:justify-between items-center">
            <div className='w-0 md:w-[70vw] h-screen bg-purple-800'>
                
            </div>
            <div className=" bg-[#fff] flex flex-col p-8 z-10 rounded-3xl md:rounded-none md:h-screen drop-shadow-[-1rem_2rem_3rem_#00000090] text-center w-[70vw] md:w-[30vw]">
                <p className="text-xl font-semibold mb-6">Create an Account</p>
                <label className=" text-left text-md font-semibold mt-6">Full Name</label>
                <input className='signup-input' value={name} placeholder='Enter your full name..' onChange={(e)=>{setName(e.target.value)}}/>
                <label className=" text-left text-md font-semibold mt-6">Email-Address</label>
                <input className='signup-input' placeholder='Enter your email...' value={email} onChange={(e) => { setEmail(e.target.value) }}/>
                <label className=" text-left text-md font-semibold mt-6">Create Password</label>
                <input className='signup-input' type='password' value={password} placeholder='Make a strong password' onChange={(e) => { setPassword(e.target.value) }}/>
                <label className=" text-left text-md font-semibold mt-6">Confirm Password</label>
                <input className='signup-input' type='password'  placeholder='Re-type your password' onChange={(e)=>{
                    if(e.target.value === password){
                        setConfirmed(true);
                    }else{
                        setConfirmed(false);
                    }
                }}/>
                <div className='flex w-full justify-between items-center mt-6 mb-4'>
                    <div className='h-[2px] w-[45%] bg-[#d9d9d9] rounded-3xl'></div>
                    <p className="text-xs font-semibold text-[#888]">OR</p>
                    <div className='h-[2px] w-[45%] bg-[#d9d9d9] rounded-3xl'></div>
                </div>
                <div className='flex w-full justify-between'>
                    <button className='w-[30%] rounded-xl bg-white border-2 border-[#333] flex justify-center hover:bg-[#eee]'><img src='/images/google.svg' className='w-1/3'/></button>
                    <button className='w-[30%] rounded-xl bg-white border-2 border-[#333] flex justify-center hover:bg-[#eee]'><img src='/images/google.svg' className='w-1/3'/></button>
                    <button className='w-[30%] rounded-xl bg-white border-2 border-[#333] flex justify-center hover:bg-[#eee]'><img src='/images/google.svg' className='w-1/3'/></button>
                </div>
                <button className=" bg-black text-white  p-3 rounded-xl w-10/12 self-center font-semibold hover:bg-[#222] duration-100 mt-4"
                    onClick={async ()=>{
                        if(name === "" || email === "" || password === ""){
                            toast.error("Please fill all fields")
                            return;
                        }
                        if(!confirmed){
                            toast.error("Passwords do not match")
                            return;
                        }
                        if(password.length < 6){
                            toast.error("Password must be atleast 6 characters long")
                            return;
                        }
                        try{
                            const response = await axiosInstance.post(`/auth/signup`,{
                                name,
                                email,
                                password
                            })
                            if(response.status === 201){
                                toast.success("Account created successfully")
                            }
                            navigate("/login")
                        }catch(e:any){
                            if(e.response.status === 401){
                                toast.error("Email already exists")
                            }
                            if(e.response.status === 500){
                                toast.error("Something went wrong")
                            }
                            if(e.response.status === 400){
                                toast.error("Failed to create user")
                            }
                        }
                        
                    }}
                >Sign up</button>

                <Link to={"/login"} className="mt-6 text-sm hover:underline cursor-pointer">Already have an account? <span className='font-semibold'>Log In</span> here</Link>
            </div>
        </Form>
    )
}
