import { useEffect, useState } from "react";

export default function ConnectionQualityBadge({ peer }) {
  const [quality, setQuality] = useState("excellent");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!peer) return;

    const interval = setInterval(async () => {
      const peerStats = await peer.getStats();
      if (peerStats) {
        setStats(peerStats);

        // Determine quality
        const rtt = peerStats.video.rtt * 1000;
        const packetsLost = peerStats.video.packetsLost || 0;

        if (rtt > 300 || packetsLost > 100) {
          setQuality("poor");
        } else if (rtt > 200 || packetsLost > 50) {
          setQuality("fair");
        } else if (rtt > 100 || packetsLost > 10) {
          setQuality("good");
        } else {
          setQuality("excellent");
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [peer]);

  const qualityConfig = {
    excellent: { color: "bg-green-500", text: "Excellent" },
    good: { color: "bg-yellow-500", text: "Good" },
    fair: { color: "bg-orange-500", text: "Fair" },
    poor: { color: "bg-red-500", text: "Poor" },
  };

  const config = qualityConfig[quality];

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 bg-surface/90 backdrop-blur-sm rounded-2xl text-on-surface text-xs shadow-md"
      title={
        stats
          ? `RTT: ${Math.round(stats.video.rtt * 1000)}ms, Packets Lost: ${
              stats.video.packetsLost || 0
            }`
          : "Measuring..."
      }
    >
      <span className={`w-2 h-2 rounded-full ${config.color}`}></span>
      <span className="hidden sm:inline">{config.text}</span>
    </div>
  );
}
