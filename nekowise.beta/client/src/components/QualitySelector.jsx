import { useState, useEffect } from "react";
import mediaService from "../services/mediaService";
import { VIDEO_QUALITY_PROFILES } from "../config/webrtc";
import { Settings, Mic, Video, Volume2, X } from "lucide-react";

const QUALITY_PRESETS = {
  "1080p": {
    label: "HD (1080p)",
    ...VIDEO_QUALITY_PROFILES["1080p"],
  },
  "720p": {
    label: "High (720p)",
    ...VIDEO_QUALITY_PROFILES["720p"],
  },
  "480p": {
    label: "Medium (480p)",
    ...VIDEO_QUALITY_PROFILES["480p"],
  },
  "360p": {
    label: "Low (360p)",
    ...VIDEO_QUALITY_PROFILES["360p"],
  },
};

export default function QualitySelector({ onQualityChange, onDeviceChange }) {
  const [quality, setQuality] = useState("720p");
  const [devices, setDevices] = useState({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
  });
  const [selectedDevices, setSelectedDevices] = useState({
    audioInput: "",
    videoInput: "",
    audioOutput: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const loadDevices = async () => {
    try {
      const deviceList = await mediaService.enumerateDevices();
      setDevices(deviceList);

      // Set default devices
      if (deviceList.audioInputs.length > 0 && !selectedDevices.audioInput) {
        setSelectedDevices((prev) => ({
          ...prev,
          audioInput: deviceList.audioInputs[0].deviceId,
        }));
      }
      if (deviceList.videoInputs.length > 0 && !selectedDevices.videoInput) {
        setSelectedDevices((prev) => ({
          ...prev,
          videoInput: deviceList.videoInputs[0].deviceId,
        }));
      }
    } catch (error) {
      console.error("Error loading devices:", error);
    }
  };

  useEffect(() => {
    loadDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", loadDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    if (onQualityChange) {
      const profile = QUALITY_PRESETS[newQuality];
      onQualityChange({
        quality: newQuality,
        constraints: {
          video: {
            width: profile.width,
            height: profile.height,
            frameRate: profile.frameRate,
          },
        },
        maxBitrate: profile.maxBitrate,
      });
    }
  };

  const handleDeviceChange = (type, deviceId) => {
    setSelectedDevices((prev) => ({
      ...prev,
      [type]: deviceId,
    }));

    if (onDeviceChange) {
      onDeviceChange(type, deviceId);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-surface-variant hover:bg-primary-container/50 text-on-surface transition-colors shadow-sm"
        title="Settings"
      >
        <Settings className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-surface border border-outline rounded-2xl p-4 shadow-xl min-w-[300px] z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-on-surface font-semibold font-display">
              Settings
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Video Quality */}
            <div>
              <label className="text-on-surface text-sm block mb-2">
                Video Quality
              </label>
              <select
                value={quality}
                onChange={(e) => handleQualityChange(e.target.value)}
                className="w-full bg-surface-variant text-on-surface px-3 py-2 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
              >
                {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Microphone */}
            {devices.audioInputs.length > 0 && (
              <div>
                <label className="text-on-surface text-sm mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Microphone
                </label>
                <select
                  value={selectedDevices.audioInput}
                  onChange={(e) =>
                    handleDeviceChange("audioInput", e.target.value)
                  }
                  className="w-full bg-surface-variant text-on-surface px-3 py-2 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
                >
                  {devices.audioInputs.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Microphone ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Camera */}
            {devices.videoInputs.length > 0 && (
              <div>
                <label className="text-on-surface text-sm mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Camera
                </label>
                <select
                  value={selectedDevices.videoInput}
                  onChange={(e) =>
                    handleDeviceChange("videoInput", e.target.value)
                  }
                  className="w-full bg-surface-variant text-on-surface px-3 py-2 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
                >
                  {devices.videoInputs.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speaker */}
            {devices.audioOutputs.length > 0 && (
              <div>
                <label className="text-on-surface text-sm mb-2 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Speaker
                </label>
                <select
                  value={selectedDevices.audioOutput}
                  onChange={(e) =>
                    handleDeviceChange("audioOutput", e.target.value)
                  }
                  className="w-full bg-surface-variant text-on-surface px-3 py-2 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
                >
                  {devices.audioOutputs.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
