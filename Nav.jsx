"use client";

const TABS = [
  { id: "dashboard", label: "Dashboard", idx: "01" },
  { id: "classes", label: "Classes & Grades", idx: "02" },
  { id: "social", label: "Friends & Groups", idx: "03" },
  { id: "study", label: "Study Hub", idx: "04" },
];

export default function Nav({ active, onChange }) {
  return (
    <nav className="gr-nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={active === t.id ? "active" : ""}
          onClick={() => onChange(t.id)}
        >
          <span className="idx">{t.idx}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
