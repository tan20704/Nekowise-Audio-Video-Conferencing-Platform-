# Neko WebRTC - TODO List

**Last Updated:** November 10, 2025

---

## 🔴 Critical (Do Before Production)

### 1. TURN Server Deployment

**Priority:** CRITICAL  
**Effort:** 2-4 hours  
**Impact:** Users behind restrictive NAT/firewalls cannot connect without TURN

```bash
# Install coturn
sudo apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
fingerprint
lt-cred-mech
user=neko:your-strong-password
realm=yourdomain.com

# Start service
sudo systemctl start coturn
sudo systemctl enable coturn

# Update client/src/config/webrtc.js
export const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:yourdomain.com:3478",
      username: "neko",
      credential: "your-strong-password"
    }
  ],
  // ... rest of config
};
```

**Files to modify:**

- `client/src/config/webrtc.js` - Add TURN configuration

**Testing:**

- Test from mobile network
- Test from corporate VPN
- Test from restricted firewall

---

### 2. Session Model for Analytics

**Priority:** HIGH  
**Effort:** 4-6 hours  
**Impact:** No call history, no analytics, no insights

**Create:** `server/src/models/Session.js`

```javascript
import mongoose from "mongoose";

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
    ref: "Room",
  },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      connectionId: String,
      joinedAt: Date,
      leftAt: Date,
      duration: Number,
      peakBitrate: Number,
      avgJitter: Number,
      avgPacketLoss: Number,
    },
  ],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: Date,
  totalDuration: Number,
  peakParticipants: Number,
  avgParticipants: Number,
  stats: {
    totalMessages: Number,
    screenShareDuration: Number,
    qualityIssues: Number,
  },
});

export default mongoose.model("Session", sessionSchema);
```

**Add endpoints:**

- `GET /api/sessions` - List sessions
- `GET /api/sessions/:sessionId` - Get session details
- `GET /api/users/:userId/sessions` - User session history

**Files to modify:**

- Create `server/src/models/Session.js`
- Create `server/src/controllers/sessionController.js`
- Create `server/src/routes/session.js`
- Update `server/src/websocket/messageHandler.js` - Track session start/end

---

### 3. Load Testing

**Priority:** HIGH  
**Effort:** 4-6 hours  
**Impact:** Unknown performance limits and bottlenecks

**Tasks:**

- [ ] Test with 2 users (baseline)
- [ ] Test with 5 users (normal)
- [ ] Test with 10 users (max per room)
- [ ] Test with 50 concurrent users across multiple rooms
- [ ] Monitor server CPU/memory usage
- [ ] Monitor WebSocket connection limits
- [ ] Monitor MongoDB performance
- [ ] Test connection recovery scenarios
- [ ] Test network degradation scenarios

**Tools:**

- Artillery.io for load testing
- Chrome DevTools for WebRTC debugging
- MongoDB Atlas monitoring
- Server monitoring (htop, iostat)

**Create:** `tests/load-test.yml`

```yaml
config:
  target: "ws://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
  processor: "./load-test-functions.js"

scenarios:
  - name: "Join Room"
    engine: "ws"
    flow:
      - send:
          payload: '{"type":"join-room","roomId":"test-room"}'
```

---

## 🟡 Important (For Production Quality)

### 4. Admin Dashboard

**Priority:** MEDIUM  
**Effort:** 6-8 hours  
**Impact:** No operational visibility into system health

**Features:**

- Active rooms list with participant counts
- Total users online
- Server health metrics (CPU, memory, connections)
- Room management (close room, kick user)
- Session analytics (total calls, avg duration)
- WebSocket connection status

**Create:**

- `client/src/pages/Admin.jsx` - Admin dashboard UI
- `server/src/routes/admin.js` - Admin endpoints
- `server/src/middleware/adminAuth.js` - Admin role check

**Endpoints needed:**

- `GET /api/admin/stats` - System statistics
- `GET /api/admin/rooms/active` - Active rooms
- `GET /api/admin/sessions/recent` - Recent sessions
- `POST /api/admin/rooms/:roomId/close` - Force close room

**Add to User model:**

```javascript
role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user'
}
```

---

### 5. Chat Message Persistence

**Priority:** MEDIUM  
**Effort:** 2-3 hours  
**Impact:** Messages lost on disconnect

**Option A: Add to Room model**

```javascript
// In server/src/models/Room.js
messages: [
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    text: String,
    timestamp: Date,
  },
];
```

**Option B: Separate ChatMessage model**

```javascript
// server/src/models/ChatMessage.js
const chatMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});
```

**Update:**

- `server/src/websocket/messageHandler.js` - Save chat messages
- `client/src/components/Chat.jsx` - Load history on join
- Add pagination for large chat histories

---

### 6. Docker Deployment

**Priority:** MEDIUM  
**Effort:** 3-4 hours  
**Impact:** Easier deployment and scaling

**Create:** `Dockerfile` (server)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

**Create:** `client/Dockerfile`

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Create:** `docker-compose.yml`

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:latest
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/neko
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  mongo-data:
```

---

### 7. Enhanced Testing

**Priority:** MEDIUM  
**Effort:** 8-12 hours  
**Impact:** Better reliability and confidence

**Unit Tests to Add:**

- [ ] `peerConnectionManager.test.js` - Test multi-peer management
- [ ] `websocket.test.js` - Test reconnection logic
- [ ] `audioMonitor.test.js` - Test speaker detection
- [ ] `networkQualityMonitor.test.js` - Test quality calculation
- [ ] `roomController.test.js` - Test room CRUD
- [ ] `authController.test.js` - Test auth flow

**Integration Tests:**

- [ ] Complete WebRTC offer/answer flow
- [ ] Multi-user room joining
- [ ] Screen share workflow
- [ ] Chat messaging
- [ ] Connection recovery

**E2E Tests:**

- [ ] User registration → login → create room → join
- [ ] Two users joining same room and seeing each other
- [ ] Screen share between peers
- [ ] Network disconnect and reconnect

**Tools:**

- Vitest for client unit tests
- Jest for server unit tests
- Playwright for E2E tests

---

## 🟢 Nice to Have (Future Enhancements)

### 8. Emoji Reactions

**Priority:** LOW  
**Effort:** 2-3 hours  
**Impact:** Enhanced user experience

**Features:**

- Emoji picker button
- Broadcast reaction to all peers
- Floating animation on video tiles
- Auto-dismiss after 3-5 seconds

**Files to create:**

- `client/src/components/ReactionPicker.jsx`
- `client/src/components/ReactionOverlay.jsx`

**WebSocket message:**

```javascript
{
  type: 'reaction',
  emoji: '👍',
  userId: 'user123',
  timestamp: Date.now()
}
```

---

### 9. Call Recording

**Priority:** LOW  
**Effort:** 8-10 hours  
**Impact:** Feature for business users

**Approach A: Client-side Recording**

```javascript
// client/src/services/recordingService.js
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: "video/webm;codecs=vp9",
});

mediaRecorder.ondataavailable = (event) => {
  recordedChunks.push(event.data);
};

// Download on stop
mediaRecorder.onstop = () => {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  // Download or upload to server
};
```

**Approach B: Server-side Recording (Complex)**

- Requires capturing all streams server-side
- Use FFmpeg to composite video
- Store in S3 or GridFS

**Recommendation:** Start with client-side for MVP

---

### 10. E2E Encryption

**Priority:** LOW  
**Effort:** 12-16 hours  
**Impact:** Enhanced privacy

**Implementation:**

```javascript
// Using Insertable Streams API
const sender = pc.addTrack(track, stream);
const senderStreams = sender.createEncodedStreams();

const transformStream = new TransformStream({
  transform: encryptFrame,
});

senderStreams.readable
  .pipeThrough(transformStream)
  .pipeTo(senderStreams.writable);
```

**Challenges:**

- Browser support (Chrome/Edge only)
- Key management (ECDH key exchange)
- Performance overhead
- Not standard WebRTC

**Reference:** [WebRTC Insertable Streams](https://developer.chrome.com/docs/privacy-sandbox/webrtc-insertable-streams/)

---

### 11. Mobile Application

**Priority:** LOW  
**Effort:** 40-60 hours  
**Impact:** Reach mobile users

**Options:**

- **React Native** - Reuse React code
- **Flutter** - Better performance
- **Progressive Web App** - Easiest, works in mobile browsers

**Recommendation:** Start with PWA (add to manifest.json)

---

### 12. SFU Migration (For Scaling)

**Priority:** LOW (unless you need 10+ users)  
**Effort:** 80-100 hours  
**Impact:** Scale to 50+ users per room

**Note:** Already documented in `SFU_MIGRATION.md`

**When to migrate:**

- Need 10+ users per room
- Mesh topology causing performance issues
- Want server-side recording/transcoding

**Options:**

- mediasoup (recommended)
- Janus Gateway
- Jitsi Videobridge
- Commercial SFU (Twilio, Agora)

---

## 📊 Testing Checklist

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Network Conditions

- [ ] Good connection (100+ Mbps)
- [ ] Fair connection (10-20 Mbps)
- [ ] Poor connection (1-5 Mbps)
- [ ] Very poor (< 1 Mbps)
- [ ] High latency (300+ ms)
- [ ] Packet loss (5-10%)

### NAT/Firewall Scenarios

- [ ] Direct connection (same network)
- [ ] Different networks (STUN only)
- [ ] Symmetric NAT (needs TURN)
- [ ] Corporate firewall
- [ ] Mobile network
- [ ] VPN connection

### Feature Testing

- [ ] 2-user call
- [ ] 5-user call
- [ ] 10-user call
- [ ] Screen sharing
- [ ] Chat messaging
- [ ] Mute/unmute
- [ ] Video on/off
- [ ] Device switching
- [ ] Quality switching
- [ ] Network recovery
- [ ] Reconnection

### Stress Testing

- [ ] Long-duration call (2+ hours)
- [ ] Rapid join/leave
- [ ] Multiple simultaneous rooms
- [ ] Screen share + high participant count
- [ ] Chat spam
- [ ] Network disconnect/reconnect cycles

---

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] All critical TODOs completed
- [ ] Environment variables configured
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] TURN server deployed and tested
- [ ] MongoDB backups configured
- [ ] Error tracking configured (Sentry)
- [ ] Monitoring configured
- [ ] Load testing completed
- [ ] Security audit completed

### Deployment

- [ ] Deploy server to production
- [ ] Deploy client to CDN/static hosting
- [ ] Configure DNS
- [ ] Configure HTTPS/WSS
- [ ] Test production deployment
- [ ] Monitor for errors

### Post-deployment

- [ ] Set up uptime monitoring
- [ ] Set up log aggregation
- [ ] Set up alerting
- [ ] Create runbook for common issues
- [ ] Document rollback procedure
- [ ] Schedule regular backups

---

## 📝 Documentation TODOs

- [ ] API documentation (Swagger/OpenAPI)
- [ ] WebSocket message format documentation
- [ ] Deployment guide (step-by-step)
- [ ] Troubleshooting guide
- [ ] Security best practices
- [ ] Scaling guide
- [ ] Contributing guidelines
- [ ] Code of conduct

---

## 🎯 Priority Order

**This Week (Critical):**

1. TURN server deployment
2. Load testing
3. Session model implementation

**Next Week (Important):** 4. Admin dashboard 5. Chat persistence 6. Enhanced testing

**Future (Nice to Have):** 7. Docker deployment 8. Emoji reactions 9. Recording feature 10. E2E encryption

---

## Notes

- Focus on **critical items** before production launch
- **Load testing** will reveal any hidden issues
- **TURN server** is essential for real-world usage
- Consider **gradual rollout** to catch issues early
- Monitor **error rates** and **connection success rates** closely

Good luck! 🚀
