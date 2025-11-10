import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const [meetingLink, setMeetingLink] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingLink.trim()) {
      // Extract room ID from link or use as is
      const roomId = meetingLink.includes("/room/")
        ? meetingLink.split("/room/")[1]
        : meetingLink;
      navigate(`/room/${roomId}`);
    }
  };

  const handleCreateMeeting = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 h-full w-full object-cover"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-having-a-video-call-40204-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-subtle bg-background/85 backdrop-blur-lg"></div>

      {/* Header */}
      <header className="absolute top-0 left-0 z-20 w-full px-8 py-4">
        <nav className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3 text-on-background">
            <span className="material-symbols-outlined text-primary text-4xl">
              hub
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Nekowise
            </h2>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="#features"
              className="rounded-full px-4 py-2 font-display text-base font-medium text-on-surface-variant transition-colors hover:bg-primary-container/50 hover:text-on-primary-container"
            >
              Features
            </a>
            <a
              href="#about"
              className="rounded-full px-4 py-2 font-display text-base font-medium text-on-surface-variant transition-colors hover:bg-primary-container/50 hover:text-on-primary-container"
            >
              About Us
            </a>
            <a
              href="#contact"
              className="rounded-full px-4 py-2 font-display text-base font-medium text-on-surface-variant transition-colors hover:bg-primary-container/50 hover:text-on-primary-container"
            >
              Contact
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full px-5 py-2.5 font-display text-sm font-medium text-on-surface-variant transition-colors hover:bg-primary-container/50 hover:text-on-primary-container"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-primary px-5 py-2.5 font-display text-sm font-medium text-on-primary shadow-sm transition-colors hover:bg-primary/90"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex h-full w-full flex-col px-8 pt-24 pb-8">
        <main className="grid flex-1 grid-cols-1 md:grid-cols-2">
          {/* Left Column - Hero Text */}
          <div className="flex flex-col items-start justify-center text-left">
            <div className="flex max-w-xl flex-col gap-6">
              <h1 className="font-display text-6xl font-bold leading-none tracking-tighter text-on-background md:text-8xl">
                Connect Face-to-Face, Instantly.
              </h1>
              <p className="font-sans text-lg font-normal leading-relaxed text-on-surface-variant">
                Experience secure and seamless peer-to-peer video conferencing.
                No downloads, no call drops. Just pure connection.
              </p>
            </div>
          </div>

          {/* Right Column - Action Panel */}
          <div className="flex items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center gap-4">
              {/* Meeting Link Input */}
              <form onSubmit={handleJoinMeeting} className="relative w-full">
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    link
                  </span>
                  <input
                    className="form-input h-14 w-full rounded-3xl border-0 bg-white py-2 pl-12 pr-6 text-base font-medium text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter Meeting Link"
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>
              </form>

              {/* Join Meeting Button */}
              <button
                onClick={handleJoinMeeting}
                disabled={!meetingLink.trim()}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-4xl bg-secondary-container px-6 text-base font-bold tracking-wide text-on-secondary-container shadow-sm transition-transform duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <span className="material-symbols-outlined">group_add</span>
                <span>Join Meeting</span>
              </button>

              {/* Divider */}
              <div className="flex w-full items-center gap-4 py-2">
                <hr className="w-full border-t border-outline/50" />
                <span className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  OR
                </span>
                <hr className="w-full border-t border-outline/50" />
              </div>

              {/* Create Meeting Button */}
              <button
                onClick={handleCreateMeeting}
                className="flex h-14 w-full animate-pulse-subtle items-center justify-center gap-3 rounded-4xl bg-primary px-6 text-base font-bold tracking-wide text-on-primary shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="material-symbols-outlined">video_call</span>
                <span>Create New Meeting</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center">
          <p className="text-sm text-on-surface-variant">
            © 2025 Nekowise. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
