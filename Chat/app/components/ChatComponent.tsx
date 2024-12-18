import { Ban, Camera, File, Mic, Paperclip, Phone, Send, Smile, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore, MessageData, useAuthStore } from "store";

export default function ChatComponent() {
    const { selectedUser, getMessages, sendMessage, messages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
    const { authUser } = useAuthStore();
    const [disp, setDisp] = useState(false);
    const endRef = useRef<HTMLDivElement>(null)

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const messageData: MessageData = {};
        const formData = new FormData(e.currentTarget);

        // Handle text field
        const text = formData.get("text");
        if (text && typeof text === "string") messageData.text = text;

        // Helper function to handle FileReader as a Promise
        const readFileAsDataURL = (file: File) =>
            new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === "string") resolve(reader.result);
                    else reject("File reading failed");
                };
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(file);
            });

        // Handle image
        const img = formData.get("image");
        if (img && typeof img == "object" && img.name && img.type) {
            messageData.image = await readFileAsDataURL(img);
        }

        // Handle file
        const file = formData.get("file");
        if (file && typeof file == "object" && file.name && file.type) {
            messageData.file = await readFileAsDataURL(file);
        }

        // Handle video
        const video = formData.get("video");
        if (video && typeof video == "object" && video.name && video.type) {
            messageData.video = await readFileAsDataURL(video);
        }

        // Call sendMessage after all file reading is complete
        if (selectedUser?._id) await sendMessage(selectedUser._id, messageData);

        // Clear the form
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
                    <div className="hover:text-white cursor-pointer rounded-l-3xl py-2 px-4 border-r-2 border-[#aaa] hover:bg-green-500 duration-200"><Phone /></div>
                    <div className="hover:text-white cursor-pointer py-2 px-4 border-r-2 border-[#aaa] hover:bg-green-500 duration-200"><Video /></div>
                    <div className="hover:text-white cursor-pointer py-2 px-4 rounded-r-3xl text-red-600 hover:bg-red-600 duration-200"><Ban /></div>
                </div>
            </div>
            <div className="flex-1 w-full bg-slate-700 overflow-y-scroll px-6">
                {messages.map((message) => (
                    <div key={message._id} className={`${isMessagesLoading ? "opacity-50" : ""} flex items-center gap-4 ${message.senderId != authUser?._id ? "justify-start" : "justify-end"} p-4`}>
                        <div className={`bg-white p-4 rounded-xl max-w-[60vw] md:max-w-[30vw] ${message.senderId != authUser?._id ? "rounded-bl-none" : "rounded-br-none"}`}>
                            {message.image && <img src={message.image} alt="image" />}
                            {message.video && <video src={message.video} controls></video>}
                            {message.file && <a href={message.file} download>Download File</a>}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>))}
                <div ref={endRef}></div>
            </div>
            <form onSubmit={handleSendMessage} className="mt-auto w-[80vw] bg-[#f7f7f7] flex items-center gap-6 border-t-2 border-[#eee] relative z-20">
                <div className={`absolute bg-white -z-20 flex-wrap left-0 border-2 border-[#aaa] flex gap-6 rounded-xl p-6 ${disp ? 'opacity-100 bottom-full' : 'opacity-0 bottom-0'} duration-300`}>
                    <input name="file" type="file" id="upload-file" className="hidden" />
                    <label htmlFor="upload-file" className="cursor-pointer flex flex-col items-center"><File /><p>File</p></label>
                    <input name="image" type="file" id="upload-image" accept='image/*' className="hidden" />
                    <label htmlFor="upload-image" className="cursor-pointer flex flex-col items-center"><Camera /><p>Photo</p></label>
                    <input name="video" type="file" id="upload-vid" className="hidden" />
                    <label htmlFor="upload-vid" className="cursor-pointer flex flex-col items-center"><Video /><p>Video</p></label>
                </div>
                <label className={`cursor-pointer ml-4 ${disp ? "text-[#3992ff]" : ""}`} onClick={() => {
                    setDisp(!disp)
                }}><Paperclip /></label>
                <div className="hover:text-[#777] duration-100 cursor-pointer"><Smile /></div>
                <div className="hover:text-[#fff] hover:bg-[#3992ff] duration-300 p-1 rounded-full cursor-pointer"><Mic /></div>
                <input name="text" placeholder="Type a message" className="w-4/5 text-[1.1rem] p-[1rem_2rem] rounded-none focus:outline-slate-700" />
                <button type="submit" className="hover:text-[#777] duration-100 cursor-pointer"><Send /></button>
            </form>
        </div>
    )
}