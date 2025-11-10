import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import AudioLevelIndicator from "../../../components/AudioLevelIndicator";

/**
 * VideoTile - Individual video tile component
 * Displays a single participant's video with name overlay and audio indicator
 */
export default function VideoTile({
  username,
  stream,
  isActiveSpeaker = false,
  audioLevel = 0,
  isLocal = false,
  isScreenSharing = false,
  totalParticipants = 1,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        // Browser may prevent autoplay - this is expected behavior
        // User interaction will resume playback
      });
    }
  }, [stream]);

  return (
    <div
      className={`relative bg-surface-variant rounded-2xl overflow-hidden transition-all shadow-sm ${
        isActiveSpeaker ? "ring-4 ring-primary scale-105 shadow-lg" : ""
      } ${totalParticipants <= 2 ? "h-[70vh]" : "aspect-video"}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${
          isLocal && !isScreenSharing ? "mirror" : ""
        }`}
      />

      {/* Username and audio indicator */}
      <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-2xl text-on-surface text-sm flex items-center gap-2 shadow-md">
        <AudioLevelIndicator level={audioLevel} isSpeaking={isActiveSpeaker} />
        <span>{isLocal ? "You" : username}</span>
        {isScreenSharing && (
          <span className="text-xs text-on-surface-variant">(Sharing)</span>
        )}
      </div>

      {/* Speaking indicator */}
      {isActiveSpeaker && (
        <div className="absolute top-2 left-2 bg-primary text-on-primary px-2 py-1 rounded-2xl text-xs font-bold shadow-md">
          SPEAKING
        </div>
      )}
    </div>
  );
}

VideoTile.propTypes = {
  username: PropTypes.string.isRequired,
  stream: PropTypes.object.isRequired,
  isActiveSpeaker: PropTypes.bool,
  audioLevel: PropTypes.number,
  isLocal: PropTypes.bool,
  isScreenSharing: PropTypes.bool,
  totalParticipants: PropTypes.number,
};
