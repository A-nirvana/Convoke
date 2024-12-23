import { CircleCheck, CircleX, Pencil } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "store"

export default function Profile() {
    const { authUser, updateProfile } = useAuthStore();
    const [imgPrev, setImgPrev] = useState<string | undefined>(undefined);
    const [contactNumber, setContactNumber] = useState<string | undefined>(authUser?.contactNumber);
    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center">
            <h1 className="text-4xl font-semibold w-1/3 mb-8 ml-8 underline">Profile</h1>
            <div className="relative w-1/3">
                <div className="relative w-max">
                    <img src={imgPrev ? imgPrev : authUser?.profilePic} alt="profile" className="w-[20vw] md:w-[15vw] rounded-full border-2 border-black" />
                    <button className="absolute p-2 border-2 border-black bg-white rounded-full bottom-[1vw] right-[1vw]">
                        <label htmlFor="photo" className="cursor-pointer"><Pencil /></label>
                    </button>
                    <input name="photo" id="photo" type="file" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setImgPrev(reader.result as string);
                            }
                            reader.readAsDataURL(file);
                        }
                    }} />
                </div>
                <div className="flex mt-4 gap-4 items-center justify-between">
                    <h1 className="text-2xl font-semibold">Name:</h1>
                    <h1 className="text-2xl">{authUser?.name}</h1>
                </div>
                <div className="flex mt-4 gap-4 items-center justify-between">
                    <h1 className="text-2xl font-semibold">Email:</h1>
                    <h1 className="text-2xl">{authUser?.email}</h1>
                </div>
                <div className="flex mt-4 gap-4 items-center justify-between">
                    <h1 className="text-2xl font-semibold">Verified</h1>
                    <h1 className={`text-2xl ${authUser?.verified ? "text-green-400" : "text-red-500"}`}>{authUser?.verified ? <CircleCheck /> : <CircleX />}</h1>
                </div>
                <div className="flex mt-4 gap-4 items-center justify-between">
                    <h1 className="text-2xl font-semibold">Contact Number:</h1>
                    <input type="email" value={contactNumber} className="border-2 border-black px-3 py-2 text-xl" onChange={(e) => {
                        setContactNumber(e.target.value);
                    }} />
                </div>
                <div className="w-full flex justify-center mt-6">
                    <button className="mt-4 px-3 py-2 bg-blue-500 text-lg text-white rounded-xl font-semibold"
                        onClick={() => updateProfile({
                            contactNumber,
                            profilePic: imgPrev
                        })}>Save Changes</button>
                </div>
            </div>
        </div>
    )
}