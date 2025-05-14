import { useEffect, useRef } from "react";
type VideoProps = {
  stream: MediaStream | null;
  muted?: boolean;
};
export const Video: React.FC<VideoProps> = ({ stream, muted=false }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (videoRef && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef, stream])

  return (
    <div className="w-full">
      <div className="rounded-2xl border-8 border-[#404094c6] w-full h-full">
        <video style={{ borderRadius: 10 }} ref={videoRef} muted={muted} width="100%" autoPlay={true} playsInline={true}
          className=" rounded-3xl w-full"
        />
        {!stream && <p className="text-center font-bold text-2xl">
            Under Construction⚒️
          </p>}
      </div>
    </div>
  )
}