"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

/* ============================================================
   Persistence — everything lives in localStorage. GradeRival's
   MVP has no backend yet, so "friends" are a local roster you
   manage yourself (see StudyHub/Social copy for the caveat).
   ============================================================ */

const KEYS = {
  profile: "gr_profile_v1",
  classes: "gr_classes_v1",
  friends: "gr_friends_v1",
  groups: "gr_groups_v1",
  files: "gr_files_v1",
  activity: "gr_activity_v1",
};

function readLS(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — fail silently */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- GPA math ---------- */

const GRADE_SCALE = [
  { min: 93, letter: "A", points: 4.0 },
  { min: 90, letter: "A-", points: 3.7 },
  { min: 87, letter: "B+", points: 3.3 },
  { min: 83, letter: "B", points: 3.0 },
  { min: 80, letter: "B-", points: 2.7 },
  { min: 77, letter: "C+", points: 2.3 },
  { min: 73, letter: "C", points: 2.0 },
  { min: 70, letter: "C-", points: 1.7 },
  { min: 67, letter: "D+", points: 1.3 },
  { min: 63, letter: "D", points: 1.0 },
  { min: 60, letter: "D-", points: 0.7 },
  { min: -Infinity, letter: "F", points: 0.0 },
];

export function pctToLetterPoints(pct) {
  const row = GRADE_SCALE.find((r) => pct >= r.min) || GRADE_SCALE.at(-1);
  return row;
}

// Computes a class's live percentage from its categories/assignments.
// extraDraft: optional array of { categoryId, score, max } simulated
// assignments layered on top for "what-if" mode, without mutating state.
export function computeClassPct(klass, extraDraft = []) {
  const byCat = new Map();
  for (const c of klass.categories) byCat.set(c.id, []);
  for (const a of klass.assignments) {
    if (byCat.has(a.categoryId)) byCat.get(a.categoryId).push(a);
  }
  for (const d of extraDraft) {
    if (byCat.has(d.categoryId)) byCat.get(d.categoryId).push(d);
  }

  let weightedSum = 0;
  let weightUsed = 0;
  for (const cat of klass.categories) {
    const items = byCat.get(cat.id) || [];
    if (!items.length) continue;
    const totalScore = items.reduce((s, i) => s + Number(i.score), 0);
    const totalMax = items.reduce((s, i) => s + Number(i.max), 0);
    if (totalMax <= 0) continue;
    const catPct = (totalScore / totalMax) * 100;
    weightedSum += catPct * cat.weight;
    weightUsed += cat.weight;
  }

  if (weightUsed === 0) return null; // no graded work yet
  return weightedSum / weightUsed;
}

export function computeGpa(classes, draftByClass = {}) {
  let pointSum = 0;
  let creditSum = 0;
  const perClass = classes.map((k) => {
    const pct = computeClassPct(k, draftByClass[k.id] || []);
    const row = pct == null ? null : pctToLetterPoints(pct);
    if (row) {
      pointSum += row.points * (k.credits || 3);
      creditSum += k.credits || 3;
    }
    return { id: k.id, pct, row };
  });
  const gpa = creditSum > 0 ? pointSum / creditSum : 0;
  return { gpa, perClass };
}

/* ---------- Leveling ---------- */

export function levelFromXp(xp) {
  // Each level needs progressively a bit more: 150 * level
  let level = 1;
  let remaining = xp;
  let need = 150;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = 150 + (level - 1) * 25;
  }
  return { level, into: remaining, need };
}

export const XP_RULES = {
  addAssignment: 5,
  uploadFile: 15,
  quizCorrect: 8,
  quizComplete: 12,
  addFriend: 5,
  createGroup: 10,
};

/* ---------- Seed data (first run only) ---------- */

const SEED_CLASSES = [
  {
    id: uid(),
    name: "AP Calculus BC",
    color: "#e8b93f",
    credits: 4,
    categories: [
      { id: uid(), name: "Tests", weight: 50 },
      { id: uid(), name: "Quizzes", weight: 30 },
      { id: uid(), name: "Homework", weight: 20 },
    ],
    assignments: [],
  },
  {
    id: uid(),
    name: "AP Literature",
    color: "#9d8cff",
    credits: 3,
    categories: [
      { id: uid(), name: "Essays", weight: 60 },
      { id: uid(), name: "Quizzes", weight: 25 },
      { id: uid(), name: "Participation", weight: 15 },
    ],
    assignments: [],
  },
];

function seedAssignments(classes) {
  const [calc, lit] = classes;
  if (calc) {
    const [tests, quizzes, hw] = calc.categories;
    calc.assignments = [
      { id: uid(), categoryId: tests.id, name: "Unit 3 Test", score: 87, max: 100 },
      { id: uid(), categoryId: quizzes.id, name: "Related Rates Quiz", score: 18, max: 20 },
      { id: uid(), categoryId: hw.id, name: "Problem Set 6", score: 19, max: 20 },
    ];
  }
  if (lit) {
    const [essays, quizzes] = lit.categories;
    lit.assignments = [
      { id: uid(), categoryId: essays.id, name: "Gatsby Close Read", score: 91, max: 100 },
      { id: uid(), categoryId: quizzes.id, name: "Ch. 1-4 Reading Check", score: 9, max: 10 },
    ];
  }
  return classes;
}

const DEFAULT_PROFILE = {
  name: "",
  handle: "",
  xp: 0,
  onboarded: false,
  createdAt: Date.now(),
};

/* ---------- Context ---------- */

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [classes, setClasses] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [files, setFiles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const p = readLS(KEYS.profile, DEFAULT_PROFILE);
    let c = readLS(KEYS.classes, null);
    if (!c) {
      c = seedAssignments(JSON.parse(JSON.stringify(SEED_CLASSES)));
    }
    const f = readLS(KEYS.friends, [
      { id: uid(), name: "Maya Chen", handle: "@mayac", gpa: 3.82, level: 6, seeded: true },
      { id: uid(), name: "Jordan Blake", handle: "@jblake", gpa: 3.41, level: 4, seeded: true },
      { id: uid(), name: "Sam Rivera", handle: "@samr", gpa: 3.95, level: 8, seeded: true },
    ]);
    const g = readLS(KEYS.groups, []);
    const fl = readLS(KEYS.files, []);
    const act = readLS(KEYS.activity, []);
    setProfile(p);
    setClasses(c);
    setFriends(f);
    setGroups(g);
    setFiles(fl);
    setActivity(act);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) writeLS(KEYS.profile, profile);
  }, [profile, mounted]);
  useEffect(() => {
    if (mounted) writeLS(KEYS.classes, classes);
  }, [classes, mounted]);
  useEffect(() => {
    if (mounted) writeLS(KEYS.friends, friends);
  }, [friends, mounted]);
  useEffect(() => {
    if (mounted) writeLS(KEYS.groups, groups);
  }, [groups, mounted]);
  useEffect(() => {
    if (mounted) writeLS(KEYS.files, files);
  }, [files, mounted]);
  useEffect(() => {
    if (mounted) writeLS(KEYS.activity, activity.slice(0, 40));
  }, [activity, mounted]);

  const pushToast = useCallback((msg) => {
    setToast({ msg, id: uid() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const grantXp = useCallback(
    (amount, reason) => {
      setProfile((p) => ({ ...p, xp: (p.xp || 0) + amount }));
      setActivity((a) => [{ id: uid(), amount, reason, at: Date.now() }, ...a]);
      pushToast(`+${amount} XP · ${reason}`);
    },
    [pushToast]
  );

  const addClass = useCallback((name, color, credits) => {
    setClasses((cs) => [
      ...cs,
      {
        id: uid(),
        name,
        color,
        credits: Number(credits) || 3,
        categories: [
          { id: uid(), name: "Tests", weight: 40 },
          { id: uid(), name: "Quizzes", weight: 30 },
          { id: uid(), name: "Homework", weight: 30 },
        ],
        assignments: [],
      },
    ]);
  }, []);

  const removeClass = useCallback((classId) => {
    setClasses((cs) => cs.filter((c) => c.id !== classId));
  }, []);

  const addCategory = useCallback((classId, name, weight) => {
    setClasses((cs) =>
      cs.map((c) =>
        c.id === classId
          ? {
              ...c,
              categories: [...c.categories, { id: uid(), name, weight: Number(weight) || 0 }],
            }
          : c
      )
    );
  }, []);

  const addAssignment = useCallback(
    (classId, categoryId, name, score, max) => {
      setClasses((cs) =>
        cs.map((c) =>
          c.id === classId
            ? {
                ...c,
                assignments: [
                  ...c.assignments,
                  { id: uid(), categoryId, name, score: Number(score), max: Number(max) },
                ],
              }
            : c
        )
      );
      grantXp(XP_RULES.addAssignment, `Logged "${name}"`);
    },
    [grantXp]
  );

  const removeAssignment = useCallback((classId, assignmentId) => {
    setClasses((cs) =>
      cs.map((c) =>
        c.id === classId
          ? { ...c, assignments: c.assignments.filter((a) => a.id !== assignmentId) }
          : c
      )
    );
  }, []);

  const addFriend = useCallback(
    (name, handle) => {
      setFriends((fr) => [
        ...fr,
        {
          id: uid(),
          name,
          handle: handle || `@${name.toLowerCase().replace(/\s+/g, "")}`,
          gpa: +(2.6 + Math.random() * 1.3).toFixed(2),
          level: 1 + Math.floor(Math.random() * 6),
          seeded: false,
        },
      ]);
      grantXp(XP_RULES.addFriend, `Added ${name} as a rival`);
    },
    [grantXp]
  );

  const removeFriend = useCallback((id) => {
    setFriends((fr) => fr.filter((f) => f.id !== id));
  }, []);

  const addGroup = useCallback(
    (name, memberIds) => {
      setGroups((gs) => [...gs, { id: uid(), name, memberIds, createdAt: Date.now() }]);
      grantXp(XP_RULES.createGroup, `Started group "${name}"`);
    },
    [grantXp]
  );

  const removeGroup = useCallback((id) => {
    setGroups((gs) => gs.filter((g) => g.id !== id));
  }, []);

  const addFile = useCallback(
    (fileMeta) => {
      setFiles((fl) => [{ id: uid(), ...fileMeta, at: Date.now() }, ...fl]);
      grantXp(XP_RULES.uploadFile, `Shared "${fileMeta.name}"`);
    },
    [grantXp]
  );

  const removeFile = useCallback((id) => {
    setFiles((fl) => fl.filter((f) => f.id !== id));
  }, []);

  const completeQuiz = useCallback(
    (correctCount, total) => {
      const xp = XP_RULES.quizComplete + correctCount * XP_RULES.quizCorrect;
      grantXp(xp, `Quiz: ${correctCount}/${total} correct`);
    },
    [grantXp]
  );

  const setName = useCallback((name, handle) => {
    setProfile((p) => ({ ...p, name, handle, onboarded: true }));
  }, []);

  const { gpa, perClass } = useMemo(() => computeGpa(classes), [classes]);
  const levelInfo = useMemo(() => levelFromXp(profile.xp || 0), [profile.xp]);

  const value = {
    mounted,
    profile,
    classes,
    friends,
    groups,
    files,
    activity,
    toast,
    gpa,
    perClass,
    levelInfo,
    setName,
    grantXp,
    addClass,
    removeClass,
    addCategory,
    addAssignment,
    removeAssignment,
    addFriend,
    removeFriend,
    addGroup,
    removeGroup,
    addFile,
    removeFile,
    completeQuiz,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { uid };
