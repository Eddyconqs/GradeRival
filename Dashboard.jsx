"use client";

import { useStore } from "../lib/store";
import { pctToLetterPoints } from "../lib/store";

function gradeBand(gpa) {
  if (gpa >= 3.7) return "A";
  if (gpa >= 2.7) return "B";
  return "";
}

export default function Dashboard({ onNavigate }) {
  const { profile, gpa, classes, perClass, friends, levelInfo, files, activity } = useStore();

  const rank =
    [...friends, { id: "you", gpa }].sort((a, b) => b.gpa - a.gpa).findIndex((p) => p.id === "you") + 1;

  const gradedClasses = perClass.filter((p) => p.pct != null);
  const bestClass = gradedClasses.length
    ? classes.find(
        (c) => c.id === gradedClasses.reduce((a, b) => (a.pct > b.pct ? a : b)).id
      )
    : null;

  const xpPct = Math.min(100, Math.round((levelInfo.into / levelInfo.need) * 100));

  return (
    <div>
      <div className="gr-hero">
        <div className="gr-hero-main">
          <div className={`gr-stamp grade-${gradeBand(gpa)}`}>
            <div>
              <div className="gpa">{gpa ? gpa.toFixed(2) : "—"}</div>
              <div className="label">Live GPA</div>
            </div>
          </div>
          <div className="gr-hero-copy">
            <p className="eyebrow">Welcome back{profile.name ? `, ${profile.name}` : ""}</p>
            <h1>
              You're rank #{friends.length ? rank : 1} out of {friends.length + 1} in your circle.
            </h1>
            <p>
              {gradedClasses.length
                ? `${bestClass ? bestClass.name : "Your top class"} is currently your strongest grade. Head to Classes to log new scores or run a what-if projection.`
                : "Add your classes and log a few scores to see your GPA take shape."}
            </p>
            <div className="gr-row" style={{ marginTop: 16 }}>
              <button className="gr-btn primary" onClick={() => onNavigate("classes")}>
                Log a grade
              </button>
              <button className="gr-btn ghost" onClick={() => onNavigate("study")}>
                Take a quiz · +XP
              </button>
            </div>
          </div>
        </div>

        <div className="gr-card gr-level-card">
          <div className="gr-level-top">
            <div>
              <div className="gr-level-badge">
                Lv. {levelInfo.level}
                <sup>{profile.name || "Scholar"}</sup>
              </div>
            </div>
            <span className="gr-tag">{profile.xp || 0} XP total</span>
          </div>
          <div className="gr-xp-track">
            <div className="gr-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="gr-xp-caption">
            <span>{levelInfo.into} XP</span>
            <span>{levelInfo.need} XP to Lv. {levelInfo.level + 1}</span>
          </div>
          <div className="gr-xp-sources">
            <div className="gr-xp-source-row">
              <span>Log an assignment</span>
              <b>+5 XP</b>
            </div>
            <div className="gr-xp-source-row">
              <span>Upload a study file</span>
              <b>+15 XP</b>
            </div>
            <div className="gr-xp-source-row">
              <span>Finish an in-app quiz</span>
              <b>+12–52 XP</b>
            </div>
          </div>
        </div>
      </div>

      <div className="gr-grid cols-3" style={{ marginBottom: 20 }}>
        <div className="gr-stat">
          <div className="n">{classes.length}</div>
          <div className="k">Classes tracked</div>
        </div>
        <div className="gr-stat">
          <div className="n">{files.length}</div>
          <div className="k">Files shared</div>
        </div>
        <div className="gr-stat">
          <div className="n">{friends.length}</div>
          <div className="k">Rivals in your circle</div>
        </div>
      </div>

      <div className="gr-grid cols-2">
        <div className="gr-card">
          <div className="gr-card-title">Grade breakdown</div>
          <p className="gr-card-sub">Weighted class percentages, live.</p>
          {gradedClasses.length ? (
            classes
              .filter((c) => perClass.find((p) => p.id === c.id)?.pct != null)
              .map((c) => {
                const p = perClass.find((pp) => pp.id === c.id);
                return (
                  <div key={c.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="gr-swatch" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span style={{ fontFamily: "var(--mono)" }}>
                        {p.pct.toFixed(1)}% · {p.row.letter}
                      </span>
                    </div>
                    <div className="gr-pct-track">
                      <div
                        className="gr-pct-fill"
                        style={{ width: `${Math.min(100, p.pct)}%`, background: c.color }}
                      />
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="gr-empty">
              <b>No grades logged yet</b>
              Head to Classes & Grades to add your first assignment.
            </div>
          )}
        </div>

        <div className="gr-card">
          <div className="gr-card-title">Recent activity</div>
          <p className="gr-card-sub">Where your XP has come from.</p>
          {activity.length ? (
            activity.slice(0, 6).map((a) => (
              <div key={a.id} className="gr-xp-source-row" style={{ marginBottom: 6 }}>
                <span>{a.reason}</span>
                <b>+{a.amount} XP</b>
              </div>
            ))
          ) : (
            <div className="gr-empty">
              <b>Nothing yet</b>
              Log a grade, upload a file, or take a quiz to start earning XP.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
