import { useNavigate } from "@remix-run/react";
import { Ban, Camera, File, Mic, Paperclip, Phone, Send, Smile, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore, useAuthStore } from "store";

// const socket = io('http://localhost:3000');

export default function ChatComponent() {
    const { selectedUser, getMessages, sendMessage, messages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
    const { authUser, socket } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false)
    const [calling, setCalling] = useState(false);
    const [disp, setDisp] = useState(false);

    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!socket) return;
        socket.on('call-rejected', () => {
            alert('User rejected your call.');
            setCalling(false);
        });

        return () => {
            socket?.off('call-rejected');
        };
    }, [socket]);

    const startCall = () => {
        if (calling) return;
        if (!selectedUser || !authUser) return;
        console.log("Starting call...");
        setCalling(true);
        console.log(socket)
        socket?.emit('call-user', {
            toUserId: selectedUser._id,
            fromUserId: authUser._id
        });
    };

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const text = (formData.get("text") as string)?.trim();

        const fields = ["image", "video", "file"]; // you don’t have "audio"
        const hasFile = fields.some((field) => {
            const input = form.elements.namedItem(field) as HTMLInputElement | null;
            return input?.files?.length;
        });

        if (!(text || hasFile)) return;
        if (selectedUser?._id) await sendMessage(selectedUser._id, formData);
        form.reset();
    };

    useEffect(() => {
        if (selectedUser?._id) getMessages(selectedUser?._id)

        subscribeToMessages()

        return () => unsubscribeFromMessages()
    }, [selectedUser])

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages])


    return (
        <div className="h-screen w-[80vw] flex flex-col items-center min-h-screen relative">
            <div className="flex justify-between w-full items-center px-8">
                <div className="flex h-[10vh] py-2 items-center gap-2 bg-[#f7f7f7] border-b-2 border-[#eee]">
                    <img src={selectedUser?.profilePic} alt="profile" className="h-[90%] rounded-full" />
                    <h1 className="text-2xl font-semibold hidden md:block">{selectedUser?.name}</h1>
                </div>
                <div className="flex items-center h-max rounded-3xl border-2 border-[#aaa]">
                    <button onClick={startCall} className="hover:text-white cursor-pointer rounded-l-3xl py-2 px-4 border-r-2 border-[#aaa] hover:bg-green-500 duration-200">
                        <Phone />
                    </button>
                    <button className="hover:text-white cursor-pointer py-2 px-4 border-r-2 border-[#aaa] hover:bg-green-500 duration-200">
                        <Video />
                    </button>
                    <button onClick={() => { setIsOpen(!isOpen) }} className="hover:text-white cursor-pointer py-2 px-4 rounded-r-3xl text-red-600 hover:bg-red-600 duration-200">
                        <Ban />
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full bg-slate-700 overflow-y-scroll px-6">
                {messages.map((message) => (
                    <div key={message._id} className={`${isMessagesLoading ? "opacity-50" : ""} flex items-center gap-4 ${message.senderId !== authUser?._id ? "justify-start" : "justify-end"} p-4`}>
                        <div className={`bg-white p-4 rounded-xl max-w-[60vw] md:max-w-[30vw] ${message.senderId !== authUser?._id ? "rounded-bl-none" : "rounded-br-none"}`}>
                            {message.image && <img src={message.image} alt="image" />}
                            {message.video && <video src={message.video} controls></video>}
                            {message.file && <a href={message.file} download>Download File</a>}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>

            <form onSubmit={handleSendMessage} className="mt-auto w-[80vw] bg-[#f7f7f7] flex items-center gap-6 border-t-2 border-[#eee] relative z-20">
                <div className={`absolute bg-white -z-20 flex-wrap left-0 border-2 border-[#aaa] flex gap-6 rounded-xl p-6 ${disp ? 'opacity-100 bottom-full' : 'opacity-0 bottom-0'} duration-300`}>
                    <input name="file" type="file" id="upload-file" className="hidden" />
                    <label htmlFor="upload-file" className="cursor-pointer flex flex-col items-center"><File /><p>File</p></label>
                    <input name="image" type="file" id="upload-image" accept="image/*" className="hidden" />
                    <label htmlFor="upload-image" className="cursor-pointer flex flex-col items-center"><Camera /><p>Photo</p></label>
                    <input name="video" type="file" id="upload-vid" className="hidden" />
                    <label htmlFor="upload-vid" className="cursor-pointer flex flex-col items-center"><Video /><p>Video</p></label>
                </div>
                <label className={`cursor-pointer ml-4 ${disp ? "text-[#3992ff]" : ""}`} onClick={() => setDisp(!disp)}><Paperclip /></label>
                <div className="hover:text-[#777] duration-100 cursor-pointer"><Smile /></div>
                <div className="hover:text-[#fff] hover:bg-[#3992ff] duration-300 p-1 rounded-full cursor-pointer"><Mic /></div>
                <input name="text" placeholder="Type a message" autoComplete="off" className="w-4/5 text-[1.1rem] p-[1rem_2rem] rounded-none focus:outline-slate-700" />
                <button type="submit" className="hover:text-[#777] duration-100 cursor-pointer"><Send /></button>
            </form>
        </div>
    );
}
