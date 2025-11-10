import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import AudioLevelIndicator from "../../../components/AudioLevelIndicator";

/**
 * LocalVideoTile - Local participant's video tile
 */
function LocalVideoTile({
  stream,
  isActiveSpeaker,
  audioLevel,
  isScreenSharing,
  totalParticipants,
  videoRef,
}) {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

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
        muted
        className={`w-full h-full object-cover ${
          !isScreenSharing ? "mirror" : ""
        }`}
      />

      <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-2xl text-on-surface text-sm flex items-center gap-2 shadow-md">
        <AudioLevelIndicator level={audioLevel} isSpeaking={isActiveSpeaker} />
        <span>You</span>
        {isScreenSharing && (
          <span className="text-xs text-on-surface-variant">(Sharing)</span>
        )}
      </div>

      {isActiveSpeaker && (
        <div className="absolute top-2 left-2 bg-primary text-on-primary px-2 py-1 rounded-2xl text-xs font-bold shadow-md">
          SPEAKING
        </div>
      )}
    </div>
  );
}

LocalVideoTile.propTypes = {
  stream: PropTypes.object.isRequired,
  isActiveSpeaker: PropTypes.bool,
  audioLevel: PropTypes.number,
  isScreenSharing: PropTypes.bool,
  totalParticipants: PropTypes.number,
  videoRef: PropTypes.object.isRequired,
};

/**
 * RemoteVideoTile - Remote participant's video tile
 */
function RemoteVideoTile({
  username,
  stream,
  isActiveSpeaker,
  audioLevel,
  totalParticipants,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        // Browser may prevent autoplay - this is expected behavior
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
        className="w-full h-full object-cover"
      />

      <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-2xl text-on-surface text-sm flex items-center gap-2 shadow-md">
        <AudioLevelIndicator level={audioLevel} isSpeaking={isActiveSpeaker} />
        <span>{username}</span>
      </div>

      {isActiveSpeaker && (
        <div className="absolute top-2 left-2 bg-primary text-on-primary px-2 py-1 rounded-2xl text-xs font-bold shadow-md">
          SPEAKING
        </div>
      )}
    </div>
  );
}

RemoteVideoTile.propTypes = {
  username: PropTypes.string.isRequired,
  stream: PropTypes.object.isRequired,
  isActiveSpeaker: PropTypes.bool,
  audioLevel: PropTypes.number,
  totalParticipants: PropTypes.number,
};

/**
 * VideoGrid - Grid layout for video tiles
 * Displays all participants in a responsive grid
 */
export default function VideoGrid({
  localStream,
  localVideoRef,
  remoteStreams,
  activeSpeakerId,
  audioLevels,
  isScreenSharing,
}) {
  const totalParticipants = remoteStreams.size + 1;

  // Calculate grid layout based on participant count
  const getGridLayout = (count) => {
    if (count === 1) return "grid-cols-1 max-w-4xl";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-6xl";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2 max-w-6xl";
    if (count <= 6) return "grid-cols-2 md:grid-cols-3 max-w-7xl";
    if (count <= 9)
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-7xl";
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl";
  };

  const gridLayout = getGridLayout(totalParticipants);

  return (
    <div className={`grid gap-4 ${gridLayout} mx-auto p-4`}>
      {/* Local video */}
      {localStream && (
        <LocalVideoTile
          stream={localStream}
          isActiveSpeaker={activeSpeakerId === "local"}
          audioLevel={audioLevels.get("local") || 0}
          isScreenSharing={isScreenSharing}
          totalParticipants={totalParticipants}
          videoRef={localVideoRef}
        />
      )}

      {/* Remote videos */}
      {Array.from(remoteStreams.values()).map(
        ({ userId, username, stream }) => (
          <RemoteVideoTile
            key={userId}
            username={username}
            stream={stream}
            isActiveSpeaker={activeSpeakerId === userId}
            audioLevel={audioLevels.get(userId) || 0}
            totalParticipants={totalParticipants}
          />
        )
      )}
    </div>
  );
}

VideoGrid.propTypes = {
  localStream: PropTypes.object,
  localVideoRef: PropTypes.object.isRequired,
  remoteStreams: PropTypes.instanceOf(Map).isRequired,
  activeSpeakerId: PropTypes.string,
  audioLevels: PropTypes.instanceOf(Map).isRequired,
  isScreenSharing: PropTypes.bool.isRequired,
};
