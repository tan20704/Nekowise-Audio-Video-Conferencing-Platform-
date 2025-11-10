import Session from "../Session.js";
import mongoose from "mongoose";

describe("Session Model Tests", () => {
  describe("Session Creation", () => {
    it("should create a new session with valid data", async () => {
      const sessionData = {
        sessionId: "test-session-123",
        roomId: "test-room-456",
        roomName: "Test Room",
      };

      const session = await Session.create(sessionData);

      expect(session.sessionId).toBe(sessionData.sessionId);
      expect(session.roomId).toBe(sessionData.roomId);
      expect(session.roomName).toBe(sessionData.roomName);
      expect(session.isActive).toBe(true);
      expect(session.participants).toEqual([]);
      expect(session.stats.totalMessages).toBe(0);
      expect(session.stats.screenShareCount).toBe(0);
    });

    it("should fail to create session without required fields", async () => {
      const session = new Session({});

      let error;
      try {
        await session.validate();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.roomId).toBeDefined();
      expect(error.errors.roomName).toBeDefined();
    });

    it("should initialize with default values", async () => {
      const session = await Session.create({
        sessionId: "test-123",
        roomId: "room-456",
        roomName: "Room",
      });

      expect(session.isActive).toBe(true);
      expect(session.participants).toEqual([]);
      expect(session.peakParticipants).toBe(0);
      expect(session.avgParticipants).toBe(0);
      expect(session.totalDuration).toBe(0);
      expect(session.stats).toMatchObject({
        totalMessages: 0,
        screenShareCount: 0,
        screenShareDuration: 0,
        qualityIssues: 0,
        reconnections: 0,
      });
    });
  });

  describe("Participant Management", () => {
    let session;

    beforeEach(async () => {
      session = await Session.create({
        sessionId: "test-session",
        roomId: "test-room",
        roomName: "Test Room",
      });
    });

    it("should add participant to session", async () => {
      const userId = new mongoose.Types.ObjectId();
      const participant = {
        userId: userId,
        username: "testuser",
        connectionId: "conn-123",
      };

      await session.addParticipant(
        participant.userId,
        participant.username,
        participant.connectionId
      );

      expect(session.participants).toHaveLength(1);
      expect(session.participants[0].userId.toString()).toBe(
        participant.userId.toString()
      );
      expect(session.participants[0].username).toBe(participant.username);
      expect(session.participants[0].connectionId).toBe(
        participant.connectionId
      );
      expect(session.participants[0].joinedAt).toBeDefined();
      expect(session.peakParticipants).toBe(1);
    });

    it("should update peak participants", async () => {
      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "user1",
        "conn-1"
      );
      expect(session.peakParticipants).toBe(1);

      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "user2",
        "conn-2"
      );
      expect(session.peakParticipants).toBe(2);

      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "user3",
        "conn-3"
      );
      expect(session.peakParticipants).toBe(3);
    });

    it("should remove participant from session", async () => {
      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "testuser",
        "conn-123"
      );

      await session.removeParticipant("conn-123");

      expect(session.participants).toHaveLength(1);
      expect(session.participants[0].leftAt).toBeDefined();
      expect(session.participants[0].duration).toBeGreaterThanOrEqual(0);
    });

    it("should calculate participant duration", async () => {
      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "testuser",
        "conn-123"
      );

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1100));

      await session.removeParticipant("conn-123");

      expect(session.participants[0].duration).toBeGreaterThan(0);
    });

    it("should update network stats for participant", async () => {
      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "testuser",
        "conn-123"
      );

      session.participants[0].peakBitrate = 1500000;
      session.participants[0].avgJitter = 15;
      session.participants[0].avgPacketLoss = 0.5;
      session.participants[0].avgRTT = 50;

      await session.save();

      const updated = await Session.findById(session._id);
      expect(updated.participants[0].peakBitrate).toBe(1500000);
      expect(updated.participants[0].avgJitter).toBe(15);
    });
  });

  describe("Session Lifecycle", () => {
    let session;

    beforeEach(async () => {
      session = await Session.create({
        sessionId: "test-session",
        roomId: "test-room",
        roomName: "Test Room",
      });
    });

    it("should end session correctly", async () => {
      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "user1",
        "conn-1"
      );
      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "user2",
        "conn-2"
      );

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1100));

      await session.endSession();

      expect(session.isActive).toBe(false);
      expect(session.endedAt).toBeDefined();
      expect(session.totalDuration).toBeGreaterThan(0);
    });

    it("should calculate average participants", async () => {
      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "user1",
        "conn-1"
      );
      await session.save();

      session.calculateAverageParticipants();
      expect(session.avgParticipants).toBeGreaterThanOrEqual(0);

      await session.addParticipant(
        new mongoose.Types.ObjectId(),
        "user2",
        "conn-2"
      );
      await session.save();

      session.calculateAverageParticipants();
      expect(session.avgParticipants).toBeGreaterThanOrEqual(0);
    });

    it("should track session duration", async () => {
      const startTime = session.startedAt;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1100));

      await session.endSession();

      expect(session.totalDuration).toBeGreaterThan(0);
      expect(session.endedAt.getTime() - startTime.getTime()).toBeGreaterThan(
        1000
      );
    });
  });

  describe("Session Statistics", () => {
    let session;

    beforeEach(async () => {
      session = await Session.create({
        sessionId: "test-session",
        roomId: "test-room",
        roomName: "Test Room",
      });
    });

    it("should track total messages", async () => {
      session.stats.totalMessages = 10;
      await session.save();

      const updated = await Session.findById(session._id);
      expect(updated.stats.totalMessages).toBe(10);
    });

    it("should track screen shares", async () => {
      session.stats.screenShareCount = 2;
      session.stats.screenShareDuration = 300;
      await session.save();

      const updated = await Session.findById(session._id);
      expect(updated.stats.screenShareCount).toBe(2);
      expect(updated.stats.screenShareDuration).toBe(300);
    });

    it("should track quality issues", async () => {
      session.stats.qualityIssues = 5;
      session.stats.reconnections = 3;
      await session.save();

      const updated = await Session.findById(session._id);
      expect(updated.stats.qualityIssues).toBe(5);
      expect(updated.stats.reconnections).toBe(3);
    });
  });

  describe("Session Queries", () => {
    beforeEach(async () => {
      await Session.create({
        sessionId: "session-1",
        roomId: "room-1",
        roomName: "Room 1",
      });
      await Session.create({
        sessionId: "session-2",
        roomId: "room-2",
        roomName: "Room 2",
        isActive: false,
      });
    });

    it("should find active sessions", async () => {
      const activeSessions = await Session.find({ isActive: true });
      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].sessionId).toBe("session-1");
    });

    it("should find sessions by room ID", async () => {
      const roomSessions = await Session.find({ roomId: "room-1" });
      expect(roomSessions).toHaveLength(1);
      expect(roomSessions[0].roomName).toBe("Room 1");
    });

    it("should find all sessions", async () => {
      const allSessions = await Session.find({});
      expect(allSessions).toHaveLength(2);
    });
  });
});
