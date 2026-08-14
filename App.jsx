"use client";

import { useState } from "react";
import { StoreProvider, useStore } from "../lib/store";
import Nav from "./Nav";
import Dashboard from "./Dashboard";
import Classes from "./Classes";
import Social from "./Social";
import StudyHub from "./StudyHub";

function Onboarding() {
  const { setName } = useStore();
  const [name, setLocalName] = useState("");

  return (
    <div className="gr-shell" style={{ maxWidth: 480, paddingTop: 96 }}>
      <div className="gr-wordmark" style={{ marginBottom: 28, justifyContent: "center" }}>
        Grade<span className="rival">Rival</span>
        <span className="dot" />
      </div>
      <div className="gr-card">
        <div className="gr-card-title">Set up your profile</div>
        <p className="gr-card-sub">
          Your name shows on the leaderboard. Everything stays on this device for now.
        </p>
        <div className="gr-field" style={{ marginBottom: 14 }}>
          <label>Your name</label>
          <input
            value={name}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="e.g. Alex Rivera"
            onKeyDown={(e) => e.key === "Enter" && name.trim() && setName(name.trim())}
          />
        </div>
        <button className="gr-btn primary" disabled={!name.trim()} onClick={() => setName(name.trim())}>
          Enter GradeRival
        </button>
      </div>
    </div>
  );
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return <div className="gr-toast">{toast.msg}</div>;
}

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Shell() {
  const { mounted, profile, levelInfo } = useStore();
  const [tab, setTab] = useState("dashboard");

  if (!mounted) {
    return <div className="gr-boot">Loading GradeRival…</div>;
  }

  if (!profile.onboarded) {
    return <Onboarding />;
  }

  return (
    <div className="gr-shell">
      <div className="gr-topbar">
        <div className="gr-wordmark">
          Grade<span className="rival">Rival</span>
          <span className="dot" />
        </div>
        <div className="gr-profile-chip">
          <div className="gr-avatar">{initials(profile.name || "You")}</div>
          <div>
            <div className="name">{profile.name}</div>
            <div className="lvl">Level {levelInfo.level}</div>
          </div>
        </div>
      </div>

      <Nav active={tab} onChange={setTab} />

      {tab === "dashboard" && <Dashboard onNavigate={setTab} />}
      {tab === "classes" && <Classes />}
      {tab === "social" && <Social />}
      {tab === "study" && <StudyHub />}

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
