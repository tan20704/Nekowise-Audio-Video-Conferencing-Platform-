import PropTypes from "prop-types";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  Grid3x3,
  User,
  Users,
  Phone,
} from "lucide-react";
import QualitySelector from "../../../components/QualitySelector";
import ReactionPicker from "../../../components/ReactionPicker";

/**
 * VideoControls - Bottom control bar for the room
 * Handles audio/video toggles, screen sharing, view mode, reactions, and leaving
 */
export default function VideoControls({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isChatOpen,
  viewMode,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleViewMode,
  onReaction,
  onLeaveRoom,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-outline p-4 z-10 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left controls - Media */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAudio}
            className={`p-4 rounded-full transition-all shadow-sm ${
              isAudioEnabled
                ? "bg-surface-variant hover:bg-primary-container/50 text-on-surface-variant"
                : "bg-destructive hover:bg-destructive/90 text-white"
            }`}
            aria-label={
              isAudioEnabled ? "Mute microphone" : "Unmute microphone"
            }
          >
            {isAudioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-full transition-all shadow-sm ${
              isVideoEnabled
                ? "bg-surface-variant hover:bg-primary-container/50 text-on-surface-variant"
                : "bg-destructive hover:bg-destructive/90 text-white"
            }`}
            aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? (
              <VideoIcon className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={onToggleScreenShare}
            className={`p-4 rounded-full transition-all shadow-sm ${
              isScreenSharing
                ? "bg-primary hover:bg-primary/90 text-on-primary"
                : "bg-surface-variant hover:bg-primary-container/50 text-on-surface-variant"
            }`}
            aria-label={
              isScreenSharing ? "Stop sharing screen" : "Share screen"
            }
          >
            <MonitorUp className="h-5 w-5" />
          </button>
        </div>

        {/* Center controls - View and features */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleChat}
            className={`px-4 py-3 rounded-full transition-all shadow-sm font-medium flex items-center gap-2 ${
              isChatOpen
                ? "bg-primary hover:bg-primary/90 text-on-primary"
                : "bg-surface-variant hover:bg-primary-container/50 text-on-surface-variant"
            }`}
            aria-label={isChatOpen ? "Close chat" : "Open chat"}
          >
            💬 Chat
          </button>

          <button
            onClick={onToggleViewMode}
            className="px-4 py-3 bg-surface-variant hover:bg-primary-container/50 text-on-surface-variant rounded-full transition-all shadow-sm font-medium flex items-center gap-2"
            aria-label={`Switch to ${
              viewMode === "grid" ? "speaker" : "grid"
            } view`}
          >
            {viewMode === "speaker" ? (
              <>
                <Grid3x3 className="h-4 w-4" />
                Grid View
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Speaker View
              </>
            )}
          </button>

          <ReactionPicker onReaction={onReaction} />

          <QualitySelector />
        </div>

        {/* Right controls - Leave */}
        <div>
          <button
            onClick={onLeaveRoom}
            className="px-6 py-3 bg-destructive hover:bg-destructive/90 text-white rounded-full transition-all shadow-md font-medium flex items-center gap-2"
            aria-label="Leave room"
          >
            <Phone className="h-5 w-5 rotate-135" />
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}

VideoControls.propTypes = {
  isAudioEnabled: PropTypes.bool.isRequired,
  isVideoEnabled: PropTypes.bool.isRequired,
  isScreenSharing: PropTypes.bool.isRequired,
  isChatOpen: PropTypes.bool.isRequired,
  viewMode: PropTypes.oneOf(["grid", "speaker"]).isRequired,
  onToggleAudio: PropTypes.func.isRequired,
  onToggleVideo: PropTypes.func.isRequired,
  onToggleScreenShare: PropTypes.func.isRequired,
  onToggleChat: PropTypes.func.isRequired,
  onToggleViewMode: PropTypes.func.isRequired,
  onReaction: PropTypes.func.isRequired,
  onLeaveRoom: PropTypes.func.isRequired,
};
