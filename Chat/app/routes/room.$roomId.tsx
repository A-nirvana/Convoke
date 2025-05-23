// app/routes/room.$roomId.tsx
import { useState, useEffect, useRef } from "react";
import { json, redirect, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { useAuthStore } from "store";
import { Video } from "~/components/video";
import { Phone } from "lucide-react";

// protect route
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.roomId, "Missing roomId");
  return json({ roomId: params.roomId,
    TURN_URL: process.env.TURN_URL,
    TURN_USERNAME: process.env.TURN_USERNAME,
    TURN_PASSWORD: process.env.TURN_PASSWORD });
};

export default function VC() {
  const navigate = useNavigate();
  const { roomId, TURN_URL, TURN_USERNAME, TURN_PASSWORD } = useLoaderData<typeof loader>();
  const { authUser, isCheckingAuth, socket } = useAuthStore();

  useEffect(() => {
    if (!isCheckingAuth && !authUser) navigate("/login");
  }, [isCheckingAuth, authUser, navigate]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: `${TURN_URL}?transport=udp`,
          username: TURN_USERNAME,
          credential: TURN_PASSWORD,
        },
        {
          urls: `${TURN_URL}?transport=tcp`,
          username: TURN_USERNAME,
          credential: TURN_PASSWORD,
        },
      ],
    });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      setRemoteStream((old) => {
        const s = old || new MediaStream();
        e.streams[0].getTracks().forEach((t) => s.addTrack(t));
        return s;
      });
    };

    socket.on("localDescription", async ({ description }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(description);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("remoteDescription", {
        description: pcRef.current.localDescription,
      });
    });

    socket.on("remoteDescription", async ({ description }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(description);
    });

    socket.on("iceCandidate", ({ candidate }) => {
      pcRef.current?.addIceCandidate(candidate).catch(console.error);
    });
    socket.on("iceCandidateReply", ({ candidate }) => {
      pcRef.current?.addIceCandidate(candidate).catch(console.error);
    });

    return () => {
      socket.off("localDescription");
      socket.off("remoteDescription");
      socket.off("iceCandidate");
      socket.off("iceCandidateReply");
      pc.close();
      pcRef.current = null;
    };
  }, [socket]);

  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (mounted) setVideoStream(stream);
      })
      .catch((err) => {
        console.error("Failed to access camera/mic:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleJoin = async () => {
    if (!socket || !videoStream || !pcRef.current) return;

    socket.emit("join", { roomId });

    pcRef.current.onicecandidate = ({ candidate }) => {
      socket.emit(joined ? "iceCandidateReply" : "iceCandidate", { candidate });
    };

    videoStream
      .getTracks()
      .forEach((t) => pcRef.current!.addTrack(t, videoStream));

    try {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socket.emit("localDescription", {
        description: pcRef.current.localDescription,
      });
    } catch (err) {
      console.error("Error creating offer:", err);
    }

    setJoined(true);
  };

  if (!videoStream) return <div>Loading camera…</div>;

  if (!joined) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>
            Welcome to meeting <strong>{roomId}</strong>
          </h2>
          <button onClick={handleJoin}>Join meeting</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
        <Video stream={videoStream} muted />
        <Video stream={remoteStream} />
      </div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Phone
          size={32}
          style={{ cursor: "pointer", color: "red" }}
          onClick={() => {
            socket?.emit("leave-room", roomId);
            pcRef.current?.close();
            navigate("/");
          }}
        />
      </div>
    </div>
  );
}
