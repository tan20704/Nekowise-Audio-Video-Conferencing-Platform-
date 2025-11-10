import Room from "../Room.js";
import mongoose from "mongoose";

describe("Room Model Tests", () => {
  describe("Room Creation", () => {
    it("should create a new room with valid data", async () => {
      const roomData = {
        roomId: "test-room-123",
        name: "Test Room",
        createdBy: new mongoose.Types.ObjectId(),
      };

      const room = await Room.create(roomData);

      expect(room.roomId).toBe(roomData.roomId);
      expect(room.name).toBe(roomData.name);
      expect(room.createdBy).toEqual(roomData.createdBy);
      expect(room.isActive).toBe(true);
      expect(room.participants).toEqual([]);
      expect(room.messages).toEqual([]);
    });

    it("should fail to create room without required fields", async () => {
      const room = new Room({});

      let error;
      try {
        await room.validate();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.createdBy).toBeDefined();
    });

    it("should initialize with empty messages array", async () => {
      const room = await Room.create({
        roomId: "test-123",
        name: "Test Room",
        createdBy: new mongoose.Types.ObjectId(),
      });

      expect(room.messages).toEqual([]);
      expect(Array.isArray(room.messages)).toBe(true);
    });
  });

  describe("Chat Message Persistence", () => {
    let room;
    let userId;

    beforeEach(async () => {
      userId = new mongoose.Types.ObjectId();
      room = await Room.create({
        roomId: "test-room",
        name: "Test Room",
        createdBy: userId,
      });
    });

    it("should add a chat message to room", async () => {
      const message = {
        messageId: "msg-123",
        userId: userId,
        username: "testuser",
        text: "Hello, world!",
        timestamp: new Date(),
      };

      room.messages.push(message);
      await room.save();

      const updated = await Room.findById(room._id);
      expect(updated.messages).toHaveLength(1);
      expect(updated.messages[0].messageId).toBe(message.messageId);
      expect(updated.messages[0].text).toBe(message.text);
      expect(updated.messages[0].username).toBe(message.username);
    });

    it("should add multiple messages", async () => {
      const messages = [
        {
          messageId: "msg-1",
          userId: userId,
          username: "user1",
          text: "First message",
          timestamp: new Date(),
        },
        {
          messageId: "msg-2",
          userId: userId,
          username: "user2",
          text: "Second message",
          timestamp: new Date(),
        },
        {
          messageId: "msg-3",
          userId: userId,
          username: "user3",
          text: "Third message",
          timestamp: new Date(),
        },
      ];

      room.messages.push(...messages);
      await room.save();

      const updated = await Room.findById(room._id);
      expect(updated.messages).toHaveLength(3);
      expect(updated.messages[0].text).toBe("First message");
      expect(updated.messages[2].text).toBe("Third message");
    });

    it("should limit messages to last 100", async () => {
      // Add 110 messages
      for (let i = 0; i < 110; i++) {
        room.messages.push({
          messageId: `msg-${i}`,
          userId: userId,
          username: "testuser",
          text: `Message ${i}`,
          timestamp: new Date(),
        });
      }

      // Keep only last 100
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }

      await room.save();

      const updated = await Room.findById(room._id);
      expect(updated.messages).toHaveLength(100);
      // Should start from message 10 (messages 0-9 removed)
      expect(updated.messages[0].text).toBe("Message 10");
      expect(updated.messages[99].text).toBe("Message 109");
    });

    it("should preserve message order (oldest to newest)", async () => {
      const now = new Date();

      room.messages.push({
        messageId: "msg-1",
        userId: userId,
        username: "user1",
        text: "First",
        timestamp: new Date(now.getTime() - 3000),
      });

      room.messages.push({
        messageId: "msg-2",
        userId: userId,
        username: "user2",
        text: "Second",
        timestamp: new Date(now.getTime() - 2000),
      });

      room.messages.push({
        messageId: "msg-3",
        userId: userId,
        username: "user3",
        text: "Third",
        timestamp: new Date(now.getTime() - 1000),
      });

      await room.save();

      const updated = await Room.findById(room._id);
      expect(updated.messages[0].text).toBe("First");
      expect(updated.messages[1].text).toBe("Second");
      expect(updated.messages[2].text).toBe("Third");
    });

    it("should store all required message fields", async () => {
      const message = {
        messageId: "msg-123",
        userId: userId,
        username: "testuser",
        text: "Test message",
        timestamp: new Date(),
      };

      room.messages.push(message);
      await room.save();

      const updated = await Room.findById(room._id);
      const savedMessage = updated.messages[0];

      expect(savedMessage.messageId).toBe(message.messageId);
      expect(savedMessage.userId.toString()).toBe(message.userId.toString());
      expect(savedMessage.username).toBe(message.username);
      expect(savedMessage.text).toBe(message.text);
      expect(savedMessage.timestamp).toBeDefined();
    });
  });

  describe("Session Integration", () => {
    it("should store session ID reference", async () => {
      const room = await Room.create({
        roomId: "test-room",
        name: "Test Room",
        createdBy: new mongoose.Types.ObjectId(),
        sessionId: "session-123",
      });

      expect(room.sessionId).toBe("session-123");
    });

    it("should allow updating session ID", async () => {
      const room = await Room.create({
        roomId: "test-room",
        name: "Test Room",
        createdBy: new mongoose.Types.ObjectId(),
      });

      room.sessionId = "new-session-456";
      await room.save();

      const updated = await Room.findById(room._id);
      expect(updated.sessionId).toBe("new-session-456");
    });
  });

  describe("Participant Management", () => {
    let room;

    beforeEach(async () => {
      room = await Room.create({
        roomId: "test-room",
        name: "Test Room",
        createdBy: new mongoose.Types.ObjectId(),
      });
    });

    it("should add participants to room", async () => {
      const participantUserId = new mongoose.Types.ObjectId();
      room.participants.push({
        userId: participantUserId,
        joinedAt: new Date(),
      });

      await room.save();

      const updated = await Room.findById(room._id);
      expect(updated.participants).toHaveLength(1);
      expect(updated.participants[0].userId.toString()).toBe(
        participantUserId.toString()
      );
    });

    it("should track multiple participants", async () => {
      room.participants.push(
        { userId: new mongoose.Types.ObjectId(), joinedAt: new Date() },
        { userId: new mongoose.Types.ObjectId(), joinedAt: new Date() },
        { userId: new mongoose.Types.ObjectId(), joinedAt: new Date() }
      );

      await room.save();

      const updated = await Room.findById(room._id);
      expect(updated.participants).toHaveLength(3);
    });
  });

  describe("Room Queries", () => {
    beforeEach(async () => {
      const userId = new mongoose.Types.ObjectId();

      await Room.create({
        roomId: "room-1",
        name: "Active Room 1",
        createdBy: userId,
        isActive: true,
      });

      await Room.create({
        roomId: "room-2",
        name: "Active Room 2",
        createdBy: userId,
        isActive: true,
      });

      await Room.create({
        roomId: "room-3",
        name: "Inactive Room",
        createdBy: userId,
        isActive: false,
      });
    });

    it("should find active rooms", async () => {
      const activeRooms = await Room.find({ isActive: true });
      expect(activeRooms).toHaveLength(2);
    });

    it("should find room by roomId", async () => {
      const room = await Room.findOne({ roomId: "room-1" });
      expect(room).toBeDefined();
      expect(room.name).toBe("Active Room 1");
    });

    it("should find all rooms", async () => {
      const allRooms = await Room.find({});
      expect(allRooms).toHaveLength(3);
    });
  });
});
