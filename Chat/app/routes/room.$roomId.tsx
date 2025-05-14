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
  return json({ roomId: params.roomId });
};

export default function VC() {
  const navigate = useNavigate();
  const { roomId } = useLoaderData<typeof loader>();
  const { authUser, isCheckingAuth, socket } = useAuthStore();

  // redirect if not logged in
  useEffect(() => {
    if (!isCheckingAuth && !authUser) navigate("/login");
  }, [isCheckingAuth, authUser, navigate]);

  // refs & state
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [joined, setJoined] = useState(false);

  // 1) On mount: get local camera & listen to socket events
  useEffect(() => {
    // bail if no socket yet
    if (!socket) return;

    // prep PeerConnection early so handlers are installed
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    // always render incoming tracks
    pc.ontrack = (e) => {
      // first packet of remote -> set stream
      setRemoteStream((old) => {
        // if new, create, otherwise reuse
        const s = old || new MediaStream();
        e.streams[0].getTracks().forEach((t) => s.addTrack(t));
        return s;
      });
    };

    // incoming offer (localDescription from caller)
    socket.on("localDescription", async ({ description }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(description);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("remoteDescription", { description: pcRef.current.localDescription });
    });

    // incoming answer (remoteDescription from callee)
    socket.on("remoteDescription", async ({ description }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(description);
    });

    // both flavors of ICE from peer
    socket.on("iceCandidate", ({ candidate }) => {
      pcRef.current?.addIceCandidate(candidate).catch(console.error);
    });
    socket.on("iceCandidateReply", ({ candidate }) => {
      pcRef.current?.addIceCandidate(candidate).catch(console.error);
    });

    // cleanup on unmount
    return () => {
      socket.off("localDescription");
      socket.off("remoteDescription");
      socket.off("iceCandidate");
      socket.off("iceCandidateReply");
      pc.close();
      pcRef.current = null;
    };
  }, [socket]);

  // 2) Also on mount: grab the user's camera (but don't addTrack yet)
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

  // 3) When the user clicks “Join”, wire up PC + send offer
  const handleJoin = async () => {
    if (!socket || !videoStream || !pcRef.current) return;

    // 3a) join logical room
    socket.emit("join", { roomId });

    // 3b) wire ICE handling
    pcRef.current.onicecandidate = ({ candidate }) => {
      // before the answer is sent, use iceCandidate; afterwards iceCandidateReply
      socket.emit(joined ? "iceCandidateReply" : "iceCandidate", { candidate });
    };

    // 3c) add our camera track into PC
    videoStream.getTracks().forEach((t) => pcRef.current!.addTrack(t, videoStream));

    // 3d) create & send offer
    try {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socket.emit("localDescription", { description: pcRef.current.localDescription });
    } catch (err) {
      console.error("Error creating offer:", err);
    }

    setJoined(true);
  };

  // 4) UI
  // a) waiting for camera
  if (!videoStream) return <div>Loading camera…</div>;

  // b) before join: show join button
  if (!joined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2>Welcome to meeting <strong>{roomId}</strong></h2>
          <button onClick={handleJoin}>Join meeting</button>
        </div>
      </div>
    );
  }

  // c) in the call: show our & remote video
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
