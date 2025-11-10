import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const participantStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  connectionId: {
    type: String,
    default: null,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  leftAt: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number,
    default: 0,
  },
  peakBitrate: {
    type: Number,
    default: 0,
  },
  avgJitter: {
    type: Number,
    default: 0,
  },
  avgPacketLoss: {
    type: Number,
    default: 0,
  },
  avgRTT: {
    type: Number,
    default: 0,
  },
});

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  },
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  participants: [participantStatsSchema],
  startedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  endedAt: {
    type: Date,
    default: null,
  },
  totalDuration: {
    type: Number,
    default: 0,
  },
  peakParticipants: {
    type: Number,
    default: 0,
  },
  avgParticipants: {
    type: Number,
    default: 0,
  },
  stats: {
    totalMessages: {
      type: Number,
      default: 0,
    },
    screenShareCount: {
      type: Number,
      default: 0,
    },
    screenShareDuration: {
      type: Number,
      default: 0,
    },
    qualityIssues: {
      type: Number,
      default: 0,
    },
    reconnections: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for querying active sessions
sessionSchema.index({ isActive: 1, startedAt: -1 });

// Method to add participant to session
sessionSchema.methods.addParticipant = function (
  userId,
  username,
  connectionId
) {
  this.participants.push({
    userId,
    username,
    connectionId,
    joinedAt: new Date(),
  });

  // Update peak participants
  const currentCount = this.participants.filter((p) => !p.leftAt).length;
  if (currentCount > this.peakParticipants) {
    this.peakParticipants = currentCount;
  }
};

// Method to mark participant as left
sessionSchema.methods.removeParticipant = function (connectionId) {
  const participant = this.participants
    .slice()
    .reverse()
    .find((p) => p.connectionId === connectionId && !p.leftAt);

  if (participant) {
    participant.leftAt = new Date();
    participant.duration = Math.max(
      0,
      Math.floor((participant.leftAt - participant.joinedAt) / 1000)
    );
  }

  return participant;
};

// Method to calculate average participants
sessionSchema.methods.calculateAverageParticipants = function () {
  if (this.participants.length === 0) return 0;

  const totalParticipantSeconds = this.participants.reduce((sum, p) => {
    return sum + (p.duration || 0);
  }, 0);

  const sessionDuration = this.totalDuration || 1;
  this.avgParticipants = Math.round(totalParticipantSeconds / sessionDuration);
};

// Method to end session
sessionSchema.methods.endSession = function () {
  this.endedAt = new Date();
  this.isActive = false;
  this.totalDuration = Math.floor((this.endedAt - this.startedAt) / 1000);
  this.calculateAverageParticipants();
};

const Session = mongoose.model("Session", sessionSchema);

export default Session;
