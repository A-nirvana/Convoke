import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useAuthStore, useChatStore} from "store";
import ChatComponent from "~/components/ChatComponent";
import Sidebar from "~/components/Sidebar";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export const loader = async ({
    params,
}: LoaderFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
    return json({ id: params.contactId });
};


export default function Contact() {
    const {id} = useLoaderData<typeof loader>();
    const { authUser, isCheckingAuth } = useAuthStore();
    const navigate = useNavigate();
    const {selectedUser, getUser} = useChatStore();

    useEffect(() => {
        if (!isCheckingAuth && !authUser)
            navigate("/login");
    } , [isCheckingAuth, authUser])

    useEffect(()=>{
        console.log("id", id)
    },[])
    useEffect(()=>{
        if(!selectedUser){
            getUser(id)
        }
    }, [selectedUser])

    
    return (
        <main className="flex">
            <Sidebar />
            <ChatComponent/>
        </main>
    );
}

