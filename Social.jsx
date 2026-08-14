"use client";

import { useMemo, useState } from "react";
import { useStore } from "../lib/store";

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AddFriendForm({ onAdd }) {
  const [name, setName] = useState("");
  return (
    <div className="gr-row">
      <div className="gr-field" style={{ flex: 1 }}>
        <label>Add a rival</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Friend's name" />
      </div>
      <button
        className="gr-btn primary"
        disabled={!name.trim()}
        onClick={() => {
          onAdd(name.trim());
          setName("");
        }}
      >
        Add friend
      </button>
    </div>
  );
}

function Leaderboard({ friends, profile, gpa, levelInfo }) {
  const rows = useMemo(() => {
    const list = [
      { id: "you", name: profile.name || "You", gpa, level: levelInfo.level, you: true },
      ...friends.map((f) => ({ ...f, you: false })),
    ];
    return list.sort((a, b) => b.gpa - a.gpa);
  }, [friends, profile.name, gpa, levelInfo.level]);

  const rankClass = (i) => (i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "");

  return (
    <div className="gr-card">
      <div className="gr-card-title">Leaderboard</div>
      <p className="gr-card-sub">Ranked by GPA across your circle.</p>
      {rows.map((r, i) => (
        <div key={r.id} className={`gr-lb-row ${r.you ? "you" : ""}`}>
          <div className={`gr-lb-rank ${rankClass(i)}`}>{i + 1}</div>
          <div className="gr-lb-person">
            <div
              className="gr-avatar"
              style={{
                width: 28,
                height: 28,
                fontSize: 11,
                background: r.you ? undefined : "var(--ink-3)",
                color: r.you ? undefined : "var(--ink-text)",
              }}
            >
              {initials(r.name || "?")}
            </div>
            <div>
              <div className="who">
                {r.name} {r.you && <span style={{ color: "var(--gold)" }}>· you</span>}
              </div>
              <div className="lvl">Lv. {r.level}</div>
            </div>
          </div>
          <div className="gr-lb-gpa">{r.gpa ? r.gpa.toFixed(2) : "—"}</div>
        </div>
      ))}
    </div>
  );
}

function NewGroupForm({ friends, onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (!open) {
    return (
      <button className="gr-btn primary" onClick={() => setOpen(true)}>
        + Create a study group
      </button>
    );
  }

  return (
    <div className="gr-card">
      <div className="gr-field" style={{ marginBottom: 12 }}>
        <label>Group name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Calc BC Crew" />
      </div>
      <label style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Members</label>
      <div className="gr-chip-list" style={{ margin: "8px 0 16px" }}>
        {friends.length === 0 && <span className="gr-card-sub">Add friends first to invite them.</span>}
        {friends.map((f) => (
          <button
            key={f.id}
            className="gr-person-chip"
            style={{
              borderColor: selected.includes(f.id) ? "var(--gold)" : undefined,
              cursor: "pointer",
            }}
            onClick={() => toggle(f.id)}
          >
            <span className="dot">{initials(f.name)}</span>
            {f.name}
          </button>
        ))}
      </div>
      <div className="gr-row">
        <button
          className="gr-btn primary"
          disabled={!name.trim()}
          onClick={() => {
            onAdd(name.trim(), selected);
            setName("");
            setSelected([]);
            setOpen(false);
          }}
        >
          Create group
        </button>
        <button className="gr-btn ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Social() {
  const { friends, addFriend, removeFriend, groups, addGroup, removeGroup, profile, gpa, levelInfo } =
    useStore();

  return (
    <div>
      <div className="gr-section-head">
        <div>
          <h2>Friends & Groups</h2>
          <p>
            Local circle for now — GradeRival's MVP keeps rivals on this device. Connect a backend to
            sync real friends across accounts.
          </p>
        </div>
      </div>

      <div className="gr-grid cols-2">
        <div>
          <div className="gr-card" style={{ marginBottom: 18 }}>
            <div className="gr-card-title">Your rivals</div>
            <p className="gr-card-sub">Compete for the highest GPA.</p>
            <AddFriendForm onAdd={addFriend} />
            <div style={{ marginTop: 14 }}>
              {friends.map((f) => (
                <div key={f.id} className="gr-assignment">
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="gr-avatar" style={{ width: 26, height: 26, fontSize: 10, background: "var(--ink-3)", color: "var(--ink-text)" }}>
                      {initials(f.name)}
                    </span>
                    <span className="name">
                      {f.name} <span style={{ color: "var(--muted)" }}>{f.handle}</span>
                    </span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="score">{f.gpa.toFixed(2)}</span>
                    <button className="gr-btn small ghost" onClick={() => removeFriend(f.id)}>
                      ✕
                    </button>
                  </span>
                </div>
              ))}
              {!friends.length && <div className="gr-empty">No rivals yet — add one above.</div>}
            </div>
          </div>

          <div className="gr-card">
            <div className="gr-card-title">Study groups</div>
            <p className="gr-card-sub">Shared spaces for files and study guides.</p>
            <NewGroupForm friends={friends} onAdd={addGroup} />
            <div style={{ marginTop: 14 }}>
              {groups.map((g) => (
                <div key={g.id} className="gr-assignment">
                  <span className="name">
                    {g.name}{" "}
                    <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>
                      · {g.memberIds.length} member{g.memberIds.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <button className="gr-btn small ghost" onClick={() => removeGroup(g.id)}>
                    ✕
                  </button>
                </div>
              ))}
              {!groups.length && <div className="gr-empty">No groups yet — create one above.</div>}
            </div>
          </div>
        </div>

        <Leaderboard friends={friends} profile={profile} gpa={gpa} levelInfo={levelInfo} />
      </div>
    </div>
  );
}
