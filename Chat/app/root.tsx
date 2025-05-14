import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useNavigation
} from "@remix-run/react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import tailwindStyles from "~/tailwind.css?url"
import styles from "./app.css?url"
import { useAuthStore } from "store/useAuthStore";
import { useEffect, useState } from "react";
import { useChatStore } from "store";
import { v4 as uuidv4 } from 'uuid';
import CallModal from "./components/modal";

export const meta: MetaFunction = () => {
  return [
    { title: "Chat | Convoke" }
  ]
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: styles },
];


export default function App() {
  const { checkAuth, authUser, isCheckingAuth, socket } = useAuthStore();
  const { getDms, getUsers, getRequests } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ fromUserId: string } | null>(null);
  const [incomingAudio, setIncomingAudio] = useState<HTMLAudioElement | null>(null);
  const [autoRejectTimeout, setAutoRejectTimeout] = useState<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const navigation = useNavigation();

  useEffect(() => {
    checkAuth();
    console.log("checkAuth");
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      getDms();
      getUsers();
      getRequests();
    }
  }, [getDms, authUser, getUsers, getRequests]);

  useEffect(() => {
    if (!socket) return;
    socket.on('incoming-call', ({ fromUserId }) => {
      console.log("Incoming call...");
      setIncomingCall({ fromUserId });
    });
    socket.on('call-accepted', ({ roomId }) => {
      navigate(`/room/${roomId}`);
    });

    return () => {
      socket?.off('incoming-call');
      socket?.off('call-accepted');
    };
  }, [socket, navigate]);

  useEffect(() => {
    if (incomingCall) {
      setIsOpen(true);

      const audio = new Audio('/sounds/incoming.mp3');
      audio.loop = true;
      audio.play().catch(err => console.error("Audio play error:", err));
      setIncomingAudio(audio);

      const timeout = setTimeout(() => {
        rejectCall();
      }, 30_000);
      setAutoRejectTimeout(timeout);
    } else {
      incomingAudio?.pause();
      incomingAudio?.remove();
      setIncomingAudio(null);

      if (autoRejectTimeout) {
        clearTimeout(autoRejectTimeout);
        setAutoRejectTimeout(null);
      }
    }
  }, [incomingCall]);

  const acceptCall = () => {
    if (!incomingCall || !authUser) return;
    const roomId = uuidv4();
    socket?.emit('accept-call', {
      toUserId: incomingCall.fromUserId,
      roomId
    });
    navigate(`/room/${roomId}`);
    setIncomingCall(null); // 👈 stop audio and clear timeout
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    socket?.emit('reject-call', {
      toUserId: incomingCall.fromUserId
    });
    setIncomingCall(null); // 👈 stop audio and clear timeout
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div
          className={
            (navigation.state === "loading" || isCheckingAuth) ? "loading" : ""
          }
        >
          <Outlet />
          <CallModal
            caller={incomingCall?.fromUserId}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            accept={acceptCall}
            reject={rejectCall}
          />
        </div>
        <ScrollRestoration />
        <Scripts />
        <ToastContainer position='top-center' limit={3} />
      </body>
    </html>
  );
}
