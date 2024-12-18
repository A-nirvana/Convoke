import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from "react";
import { Form, Link, useNavigate } from '@remix-run/react';
import { axiosInstance } from 'utils/axios';
import { useAuthStore } from 'store';

export default function Signup() {
    const [email, setEmail] = useState("");
    const {checkAuth} = useAuthStore();
    const [password, setPassword] = useState("");
    const navigate = useNavigate()
    return (
        <Form className="flex absolute top-0 left-0 w-screen h-screen bg-[#0f766e] justify-center items-center">
            <div className=" bg-[#fff] flex flex-col p-8 z-10 rounded-3xl drop-shadow-[-1rem_2rem_3rem_#00000090] text-center w-[70vw] md:w-[30vw]">
                <img src='/images/logo.svg' className='drop-shadow-[0_0_0.5rem_#0f766e] w-1/5 self-center mb-4 p-2 rounded-full bg-transparent border-2 border-black ' />
                <p className="text-xl font-semibold ">Welcome Back !</p>
                <p className="text-sm font-thin mb-6">please enter you details to sign in.</p>
                <div className='flex w-full justify-between mb-6'>
                    <button className='w-[30%] rounded-xl bg-white border-2 border-[#333] flex justify-center hover:bg-[#eee]'><img src='/images/google.svg' className='w-1/3' /></button>
                    <button className='w-[30%] rounded-xl bg-white border-2 border-[#333] flex justify-center hover:bg-[#eee]'><img src='/images/google.svg' className='w-1/3' /></button>
                    <button className='w-[30%] rounded-xl bg-white border-2 border-[#333] flex justify-center hover:bg-[#eee]'><img src='/images/google.svg' className='w-1/3' /></button>
                </div>
                <div className='flex w-full justify-between items-center'>
                    <div className='h-[2px] w-[45%] bg-[#d9d9d9] rounded-3xl'></div>
                    <p className="text-xs font-semibold text-[#888]">OR</p>
                    <div className='h-[2px] w-[45%] bg-[#d9d9d9] rounded-3xl'></div>
                </div>
                <label className=" text-left text-md font-semibold mt-6">Email-Address or Phone No.</label>
                <input className='signup-input' placeholder='Enter your email or mobile...' value={email} onChange={(e) => { setEmail(e.target.value) }} />
                <label className=" text-left text-md font-semibold mt-6">Password</label>
                <input className='signup-input' type='password' value={password} placeholder='...' onChange={(e) => { setPassword(e.target.value) }} />

                <div className='flex w-full justify-between mt-4'>
                    <div className='flex items-center gap-2'>
                        <input className='mt-[0.125rem]' id='rmbr' type='checkbox' />
                        <label className='text-md font-semibold' htmlFor='rmbr'>Remember me</label>
                    </div>
                    <Link to={""} className='font-thin text-[#888] underline '>Forgot password</Link>
                </div>
                <button className=" bg-black text-white  p-3 rounded-xl w-10/12 self-center font-semibold hover:bg-[#222] duration-100 mt-4"
                    onClick={async () => {
                        if (email === "" || password === "") {
                            toast.error("Please fill all fields")
                            return;
                        }
                        try {
                            const response = await axiosInstance.post(`/auth/signin`, {
                                emailOrContact: email,
                                password
                            });
                            if (response.status === 200) {
                                toast.success("Logged in Successfully")
                                checkAuth();
                                setTimeout(() => {
                                    navigate("/")
                                }, 1500);
                            }
                        } catch (e: any) {
                            if (e.response.status === 401) {
                                toast.error("Invalid Credentials")
                            }
                            if (e.response.status === 404) {
                                toast.error("User not found")
                            }
                            if (e.response.status === 500) {
                                toast.error("Something went wrong")
                            }
                        }
                    }}
                >Sign in</button>

                <Link to={"/register"} className="mt-6 text-sm hover:underline cursor-pointer">Don&apos;t have an account yet? <span className='font-semibold'>Sign Up</span></Link>
            </div>
        </Form>
    )
}
