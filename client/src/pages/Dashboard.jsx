import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Container from "../components/Layout/Container";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import api from "../services/api";
import {
  Settings,
  Users,
  Globe,
  Lock,
  Plus,
  X,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [completedRooms, setCompletedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "completed"

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const [activeResponse, completedResponse] = await Promise.all([
        api.getRooms(),
        api.getCompletedRooms(),
      ]);
      setRooms(activeResponse.rooms);
      setCompletedRooms(completedResponse.rooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Are you sure you want to permanently delete this room?")) {
      return;
    }

    try {
      await api.deleteRoom(roomId);
      // Refresh the completed rooms list
      const completedResponse = await api.getCompletedRooms();
      setCompletedRooms(completedResponse.rooms);
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Failed to delete room: " + error.message);
    }
  };

  return (
    <Container>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Dashboard</h1>
          <p className="text-on-surface-variant">
            Welcome back, {user?.displayName || user?.username}!
          </p>
        </div>
        {user?.role === "admin" && (
          <Button asChild>
            <Link to="/admin">
              <Settings className="h-4 w-4" />
              Admin Panel
            </Link>
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display">Rooms</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab("active")}
              variant={activeTab === "active" ? "default" : "outline"}
              size="sm"
            >
              Active ({rooms.length})
            </Button>
            <Button
              onClick={() => setActiveTab("completed")}
              variant={activeTab === "completed" ? "default" : "outline"}
              size="sm"
            >
              Completed ({completedRooms.length})
            </Button>
          </div>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Room
            </>
          )}
        </Button>
      </div>

      {showCreateForm && (
        <CreateRoomForm
          onRoomCreated={fetchRooms}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-8">Loading rooms...</div>
      ) : activeTab === "active" ? (
        rooms.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant">
            No active rooms available. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )
      ) : completedRooms.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant">
          No completed rooms. Rooms will appear here after they are closed.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedRooms.map((room) => (
            <CompletedRoomCard
              key={room.id}
              room={room}
              onDelete={handleDeleteRoom}
            />
          ))}
        </div>
      )}
    </Container>
  );
}

function CreateRoomForm({ onRoomCreated, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
    maxParticipants: 6,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createRoom(formData);
      onRoomCreated();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="font-display">Create New Room</CardTitle>
        <CardDescription>Set up a new video conference room</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-2xl mb-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="My Meeting Room"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="flex w-full rounded-2xl border-0 bg-white px-4 py-2 text-base font-medium text-on-surface ring-offset-background placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants</Label>
            <Input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              min={2}
              max={10}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 rounded border-outline"
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Make room public
            </Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RoomCard({ room }) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-display">{room.name}</CardTitle>
        {room.description && (
          <CardDescription>{room.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Users className="h-4 w-4" />
            <span>
              {room.currentParticipants}/{room.maxParticipants}
            </span>
          </div>
          <Badge variant={room.isPublic ? "success" : "secondary"}>
            {room.isPublic ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Private
              </>
            )}
          </Badge>
        </div>
        <Button asChild className="w-full">
          <Link to={`/room/${room.roomId}`}>Join Room</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CompletedRoomCard({ room, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(room.roomId);
    } catch (error) {
      console.error("Error deleting room:", error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="transition-all hover:shadow-lg border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-display">{room.name}</CardTitle>
          <Badge variant="secondary">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        </div>
        {room.description && (
          <CardDescription>{room.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm text-on-surface-variant space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Created:</span>
            <span>{formatDate(room.createdAt)}</span>
          </div>
          {room.closedAt && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Closed:</span>
              <span>{formatDate(room.closedAt)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Max: {room.maxParticipants} participants</span>
          </div>
        </div>
        <Button
          onClick={handleDelete}
          disabled={deleting}
          variant="destructive"
          className="w-full"
        >
          {deleting ? (
            "Deleting..."
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete Room
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
