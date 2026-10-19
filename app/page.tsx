"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3, ChevronRight, CircleUserRound, Dumbbell, History, LogOut,
  Menu, Plus, Search, Settings, Sparkles, Timer, TrendingUp, Trophy, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const APP_VERSION = "0.1.0";

type Exercise = { id: string; name: string; muscle: string; equipment: string };
type SetRow = { weight: string; reps: string; done: boolean };
type LoggedExercise = { exerciseId: string; exerciseName: string; sets: { weight: number; reps: number }[] };
type Workout = { id: string; name: string; date: string; exercises: number; volume: number; loggedExercises: LoggedExercise[] };
type Routine = { id: string; name: string; exerciseIds: string[] };

const exercises: Exercise[] = [
  { id: "bench", name: "Barbell Bench Press", muscle: "Chest", equipment: "Barbell" },
  { id: "squat", name: "Back Squat", muscle: "Legs", equipment: "Barbell" },
  { id: "row", name: "Seated Cable Row", muscle: "Back", equipment: "Cable" },
  { id: "press", name: "Overhead Press", muscle: "Shoulders", equipment: "Barbell" },
  { id: "rdl", name: "Romanian Deadlift", muscle: "Hamstrings", equipment: "Barbell" },
  { id: "pullup", name: "Pull Up", muscle: "Back", equipment: "Bodyweight" },
];

const initialWorkouts: Workout[] = [
  { id: "1", name: "Upper body strength", date: "2026-10-19", exercises: 5, volume: 8420, loggedExercises: [{ exerciseId: "bench", exerciseName: "Barbell Bench Press", sets: [{ weight: 60, reps: 8 }, { weight: 60, reps: 8 }, { weight: 65, reps: 6 }] }] },
  { id: "2", name: "Leg day", date: "2026-10-16", exercises: 6, volume: 10850, loggedExercises: [{ exerciseId: "squat", exerciseName: "Back Squat", sets: [{ weight: 90, reps: 8 }, { weight: 100, reps: 6 }, { weight: 100, reps: 6 }] }] },
  { id: "3", name: "Pull & core", date: "2026-10-12", exercises: 5, volume: 7240, loggedExercises: [{ exerciseId: "bench", exerciseName: "Barbell Bench Press", sets: [{ weight: 55, reps: 8 }, { weight: 60, reps: 6 }] }] },
];
const initialRoutines: Routine[] = [
  { id: "push", name: "Push day", exerciseIds: ["bench", "press"] },
  { id: "full", name: "Full body", exerciseIds: ["squat", "bench", "row"] },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [showWorkout, setShowWorkout] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customExerciseMuscle, setCustomExerciseMuscle] = useState("Other");
  const [customExerciseEquipment, setCustomExerciseEquipment] = useState("Other");
  const [workouts, setWorkouts] = useState<Workout[]>(supabase ? [] : initialWorkouts);
  const [routines, setRoutines] = useState<Routine[]>(supabase ? [] : initialRoutines);
  const [allExercises, setAllExercises] = useState<Exercise[]>(exercises);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([exercises[0], exercises[2]]);
  const [sets, setSets] = useState<Record<string, SetRow[]>>({});
  const [search, setSearch] = useState("");
  const [progressExercise, setProgressExercise] = useState("bench");
  const [user, setUser] = useState("Guest");
  const [accountName, setAccountName] = useState("");
  const [accountNameBusy, setAccountNameBusy] = useState(false);
  const [authReady, setAuthReady] = useState(!supabase);
  const [sessionUser, setSessionUser] = useState<{ id: string; email?: string } | null>(null);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [cloudError, setCloudError] = useState("");
  const [cloudLoadError, setCloudLoadError] = useState("");
  const cloudRequest = useRef(0);

  useEffect(() => {
    if (supabase) {
      let active = true;
      const syncSession = async (nextSession: { user?: { id: string; email?: string; user_metadata?: Record<string, string>; app_metadata?: Record<string, string> } } | null) => {
        const nextUser = nextSession?.user;
        if (!nextUser) {
          cloudRequest.current += 1;
          setSessionUser(null);
          setWorkouts([]);
          setRoutines([]);
          setAuthReady(true);
          return;
        }
        if (!active) return;
        const metadata = nextUser.user_metadata || {};
        const displayName = metadata.full_name || metadata.name || metadata.user_name || nextUser.email?.split("@")[0] || "Athlete";
        setUser(displayName);
        setAccountName(displayName);
        setSessionUser({ id: nextUser.id, email: nextUser.email });
        await loadCloudData(nextUser.id);
      };
      supabase.auth.getSession().then(({ data }) => syncSession(data.session));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        syncSession(nextSession);
      });
      return () => {
        active = false;
        listener.subscription.unsubscribe();
        cloudRequest.current += 1;
      };
    }
    const saved = window.localStorage.getItem("lifted-workouts");
    if (saved) setWorkouts(JSON.parse(saved));
    const savedRoutines = window.localStorage.getItem("lifted-routines");
    if (savedRoutines) setRoutines(JSON.parse(savedRoutines));
    const savedUser = window.localStorage.getItem("lifted-user");
    if (savedUser) setUser(savedUser);
  }, []);

  async function loadCloudData(userId: string) {
    if (!supabase) return;
    const requestId = ++cloudRequest.current;
    setAuthReady(false);
    setCloudLoadError("");
    const [{ data: cloudWorkouts, error: workoutsError }, { data: cloudRoutines, error: routinesError }, { data: cloudExercises, error: exercisesError }] = await Promise.all([
      supabase.from("workouts").select("*").eq("user_id", userId).order("workout_date", { ascending: false }),
      supabase.from("routines").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("custom_exercises").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    ]);
    if (requestId !== cloudRequest.current) return;
    const loadError = workoutsError || routinesError;
    if (loadError || !cloudWorkouts || !cloudRoutines) {
      setWorkouts([]);
      setRoutines([]);
      setCloudLoadError(loadError?.code === "42P01"
        ? "Your workout tables are not set up yet. Run the latest supabase/schema.sql in the Supabase SQL Editor."
        : loadError?.code === "42501"
          ? "Supabase denied access to your workout data. Run the latest RLS policies in supabase/schema.sql."
          : "Cloud sync is temporarily unavailable. Your account is still safe; try again from Settings.");
    } else {
      if (!exercisesError) {
        setAllExercises([...exercises, ...(cloudExercises || []).map((item) => ({ id: item.id, name: item.name, muscle: item.muscle, equipment: item.equipment }))]);
      }
      setWorkouts(cloudWorkouts.map((item) => ({ id: item.id, name: item.name, date: item.workout_date, exercises: item.logged_exercises.length, volume: Number(item.volume), loggedExercises: item.logged_exercises })));
      setRoutines(cloudRoutines.map((item) => ({ id: item.id, name: item.name, exerciseIds: item.exercise_ids })));
      if (exercisesError?.code !== "42P01") {
        setCloudLoadError(exercisesError ? "Custom exercises are unavailable until the latest Supabase schema is applied." : "");
      }
    }
    setAuthReady(true);
  }

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setAuthBusy(true);
    setAuthError("");
    setAuthMessage("");
    const result = authMode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      : await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: { emailRedirectTo: window.location.origin },
      });
    if (result.error) setAuthError(result.error.message);
    else if (authMode === "sign-up" && !result.data.session) setAuthMessage("Check your email to confirm your account.");
    setAuthBusy(false);
  }

  async function signInWithGoogle() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    cloudRequest.current += 1;
    setSessionUser(null);
    setWorkouts([]);
    setRoutines([]);
    setCloudError("");
    setCloudLoadError("");
    setUser("Guest");
    setAccountName("");
    window.localStorage.removeItem("lifted-workouts");
    window.localStorage.removeItem("lifted-routines");
  }

  async function saveAccountName() {
    const nextName = accountName.trim();
    if (!supabase || !sessionUser || !nextName) return;
    setAccountNameBusy(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: nextName } });
    if (error) setCloudError("We could not update your name. Please try again.");
    else setUser(nextName);
    setAccountNameBusy(false);
  }

  async function retryCloudSync() {
    if (sessionUser) await loadCloudData(sessionUser.id);
  }

  async function createExercise(event: React.FormEvent) {
    event.preventDefault();
    const name = customExerciseName.trim();
    if (!name) return;
    const localExercise = { id: `custom-${Date.now()}`, name, muscle: customExerciseMuscle, equipment: customExerciseEquipment };
    if (supabase && sessionUser) {
      const { data, error } = await supabase.from("custom_exercises").insert({ user_id: sessionUser.id, name, muscle: customExerciseMuscle, equipment: customExerciseEquipment }).select().single();
      if (error || !data) {
        setCloudError("We could not add that exercise. Run the latest Supabase schema, then try again.");
        return;
      }
      setAllExercises((current) => [...current, { id: data.id, name: data.name, muscle: data.muscle, equipment: data.equipment }]);
    } else {
      setAllExercises((current) => [...current, localExercise]);
    }
    setCustomExerciseName("");
    setShowCreateExercise(false);
  }

  const totalVolume = useMemo(() => workouts.reduce((sum, workout) => sum + workout.volume, 0), [workouts]);
  const filteredExercises = allExercises.filter((exercise) =>
    `${exercise.name} ${exercise.muscle}`.toLowerCase().includes(search.toLowerCase()),
  );

  function openWorkout() {
    setSets(Object.fromEntries(selectedExercises.map((exercise) => [
      exercise.id, [{ weight: "", reps: "", done: false }, { weight: "", reps: "", done: false }],
    ])));
    setShowWorkout(true);
  }

  function useRoutine(routine: Routine) {
    setSelectedExercises(routine.exerciseIds.map((id) => allExercises.find((exercise) => exercise.id === id)).filter((exercise): exercise is Exercise => Boolean(exercise)));
    setActive("Overview");
    setTimeout(() => setShowWorkout(true), 0);
  }

  async function saveRoutine() {
    const name = window.prompt("Name this routine", "My routine")?.trim();
    if (!name || selectedExercises.length === 0) return;
    if (supabase && sessionUser) {
      const { error } = await supabase.from("routines").insert({ user_id: sessionUser.id, name, exercise_ids: selectedExercises.map((exercise) => exercise.id) });
      if (error) {
        setCloudError("We could not save that routine. Please try again.");
        return;
      }
    }
    const next = [{ id: String(Date.now()), name, exerciseIds: selectedExercises.map((exercise) => exercise.id) }, ...routines];
    setRoutines(next);
    if (!supabase) window.localStorage.setItem("lifted-routines", JSON.stringify(next));
  }

  async function saveWorkout() {
    const volume = Object.values(sets).flat().reduce((sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0);
    const newWorkout: Workout = {
      id: String(Date.now()),
      name: "Quick workout",
      date: getLocalDateKey(),
      exercises: selectedExercises.length,
      volume,
      loggedExercises: selectedExercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: (sets[exercise.id] || []).filter((set) => Number(set.weight) > 0 && Number(set.reps) > 0).map((set) => ({ weight: Number(set.weight), reps: Number(set.reps) })),
      })),
    };
    if (supabase && sessionUser) {
      const { error } = await supabase.from("workouts").insert({ user_id: sessionUser.id, name: newWorkout.name, workout_date: newWorkout.date, volume: newWorkout.volume, logged_exercises: newWorkout.loggedExercises });
      if (error) {
        setCloudError("We could not save that workout. Please try again.");
        return;
      }
    }
    const next = [newWorkout, ...workouts];
    setWorkouts(next);
    if (!supabase) window.localStorage.setItem("lifted-workouts", JSON.stringify(next));
    setShowWorkout(false);
    setActive("History");
  }

  function toggleExercise(exercise: Exercise) {
    setSelectedExercises((current) => current.some((item) => item.id === exercise.id)
      ? current.filter((item) => item.id !== exercise.id)
      : [...current, exercise]);
  }

  const navItems = [
    { label: "Overview", icon: BarChart3 },
    { label: "Routines", icon: Sparkles },
    { label: "History", icon: History },
    { label: "Progress", icon: TrendingUp },
  ];

  const workoutsThisWeek = workouts.filter((workout) => {
    const date = new Date(`${workout.date}T00:00:00`);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return date >= weekStart && date <= now;
  }).length;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(now);
  const workoutDates = new Set(workouts.map((workout) => workout.date));
  let currentStreak = 0;
  const streakDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (workoutDates.has(getLocalDateKey(streakDate))) {
    currentStreak += 1;
    streakDate.setDate(streakDate.getDate() - 1);
  }

  if (!authReady) return <main className="grain flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">Loading your account…</main>;
  if (supabase && !sessionUser) return <main className="grain flex min-h-screen items-center justify-center p-5"><div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-7 shadow-soft"><div className="mb-8 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ink)] text-white"><Dumbbell size={19} /></div><span className="text-xl font-bold">lifted<span className="text-[#83b798]">.</span></span></div><h1 className="text-2xl font-bold">{authMode === "sign-in" ? "Welcome back." : "Create your account."}</h1><p className="mt-2 text-sm text-[var(--muted)]">Your workouts sync across every device.</p><form onSubmit={submitAuth} className="mt-7 space-y-3"><input required type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="Email address" className="w-full rounded-xl border border-[var(--line)] bg-[#fbfcf9] px-4 py-3 text-sm outline-none focus:border-[#75a889]" /><input required minLength={6} type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Password (6+ characters)" className="w-full rounded-xl border border-[var(--line)] bg-[#fbfcf9] px-4 py-3 text-sm outline-none focus:border-[#75a889]" />{authError && <p className="text-sm text-red-600">{authError}</p>}{authMessage && <p className="text-sm text-[#56856a]">{authMessage}</p>}<button disabled={authBusy} className="w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white disabled:opacity-60">{authBusy ? "Please wait…" : authMode === "sign-in" ? "Sign in" : "Create account"}</button></form><button onClick={signInWithGoogle} className="mt-3 w-full rounded-xl border border-[var(--line)] bg-white py-3 text-sm font-semibold">Continue with Google</button><button onClick={() => { setAuthMode(authMode === "sign-in" ? "sign-up" : "sign-in"); setAuthError(""); setAuthMessage(""); }} className="mt-5 w-full text-sm text-[var(--muted)]">{authMode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}</button></div></main>;

  return (
    <main className="grain min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 flex-col border-r border-[var(--line)] bg-[#fbfcf9] p-6 lg:flex">
          <div className="mb-14 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ink)] text-white"><Dumbbell size={18} /></div>
            <span className="text-lg font-bold tracking-tight">lifted<span className="text-[#83b798]">.</span></span>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => setActive(label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${active === label ? "bg-[var(--mint)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[#f0f4ef]"}`}>
                <Icon size={17} strokeWidth={1.8} />{label}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-1">
            <button onClick={() => setActive("Settings")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active === "Settings" ? "bg-[var(--mint)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[#f0f4ef]"}`}><Settings size={17} />Settings</button>
            <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[#f0f4ef]"><LogOut size={17} />Sign out</button>
            <div className="mt-4 flex items-center gap-3 border-t border-[var(--line)] pt-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d2e8d9] text-sm font-bold">{user.charAt(0).toUpperCase()}</div>
              <div><p className="text-sm font-semibold">{user}</p><p className="text-xs text-[var(--muted)]">Free account</p></div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 pb-24 sm:px-8 lg:px-14 lg:pb-10">
          <header className="flex items-center justify-between py-6">
            <button className="flex items-center gap-2 lg:hidden"><Menu size={20} /><span className="font-bold">lifted<span className="text-[#83b798]">.</span></span></button>
            <p className="hidden text-sm text-[var(--muted)] lg:block">{active}</p>
            <div className="flex items-center gap-3">
              <button className="rounded-full p-2 text-[var(--muted)] hover:bg-white"><CircleUserRound size={20} /></button>
              <div className="h-8 w-8 rounded-full bg-[#d2e8d9] text-center text-sm font-bold leading-8 lg:hidden">A</div>
            </div>
          </header>

          {cloudError && <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-[#e7c9a4] bg-[#fff8ed] px-4 py-3 text-sm text-[#8a5a21]"><span>{cloudError}</span><button onClick={() => setCloudError("")} aria-label="Dismiss error"><X size={16} /></button></div>}
          {active === "Overview" && <div className="fade-in">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><p className="mb-2 text-sm font-medium text-[#75a889]">{todayLabel}</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{greeting}, {user}.</h1><p className="mt-2 text-[var(--muted)]">Ready to make today count?</p></div>
              <button onClick={openWorkout} className="flex w-fit items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"><Plus size={17} />Start workout</button>
            </div>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[["This week", String(workoutsThisWeek), "workouts"], ["Total volume", `${(totalVolume / 1000).toFixed(1)}k`, "kg lifted"], ["Current streak", String(currentStreak), "days"]].map(([label, value, suffix], index) => (
                <div key={label} className={`rounded-2xl border border-[var(--line)] p-5 ${index === 1 ? "bg-[var(--ink)] text-white" : "bg-white"}`}><div className="mb-5 flex items-center justify-between"><p className={`text-sm ${index === 1 ? "text-[#b1c9b7]" : "text-[var(--muted)]"}`}>{label}</p>{index === 0 ? <Dumbbell size={17} /> : index === 1 ? <BarChart3 size={17} /> : <Trophy size={17} />}</div><p className="text-3xl font-bold">{value}<span className={`ml-1 text-sm font-normal ${index === 1 ? "text-[#b1c9b7]" : "text-[var(--muted)]"}`}>{suffix}</span></p></div>
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="font-bold">Recent workouts</h2><p className="mt-1 text-sm text-[var(--muted)]">Your latest training sessions</p></div><button onClick={() => setActive("History")} className="text-sm font-semibold text-[#75a889]">View all</button></div><div className="space-y-2">{workouts.slice(0, 3).map((workout) => <div key={workout.id} className="flex items-center justify-between rounded-xl p-3 hover:bg-[#f8faf7]"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mint)]"><Dumbbell size={17} /></div><div><p className="text-sm font-semibold">{workout.name}</p><p className="mt-0.5 text-xs text-[var(--muted)]">{workout.date} · {workout.exercises} exercises</p></div></div><ChevronRight size={17} className="text-[#aab5ad]" /></div>)}</div></div>
              <div className="rounded-2xl bg-[#e5f3e8] p-6"><div className="mb-14 flex items-start justify-between"><div><p className="text-sm font-semibold text-[#56856a]">Tip of the day</p><Sparkles className="mt-3 text-[#56856a]" size={22} /></div><span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#56856a]">01</span></div><p className="text-xl font-semibold leading-snug">Consistency beats intensity. Show up, do the work, and let the results compound.</p><p className="mt-5 text-sm text-[#64836d]">— The Lifted team</p></div>
            </div>
          </div>}

          {active === "History" && <div className="fade-in"><div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Workout history</h1><p className="mt-2 text-[var(--muted)]">A record of everything you&apos;ve put in.</p></div><div className="space-y-3">{workouts.map((workout) => <div key={workout.id} className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--mint)]"><Dumbbell size={18} /></div><div><p className="font-semibold">{workout.name}</p><p className="mt-1 text-sm text-[var(--muted)]">{workout.date} · {workout.exercises} exercises</p></div></div><p className="text-sm font-semibold">{formatNumber(workout.volume)} kg</p></div><div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-3">{workout.loggedExercises.flatMap((logged) => logged.sets.length ? [`${logged.exerciseName}: ${logged.sets.map((set) => `${set.weight}kg × ${set.reps}`).join(", ")}`] : []).map((summary) => <span key={summary} className="rounded-lg bg-[#f5f8f4] px-2.5 py-1.5 text-xs text-[var(--muted)]">{summary}</span>)}</div></div>)}</div></div>}

          {active === "Progress" && <div className="fade-in"><div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Your progress</h1><p className="mt-2 text-[var(--muted)]">See how your working weight is moving over time.</p></div><div className="mb-5 flex flex-wrap gap-2">{allExercises.map((exercise) => <button key={exercise.id} onClick={() => setProgressExercise(exercise.id)} className={`rounded-full px-3 py-2 text-xs font-semibold ${progressExercise === exercise.id ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)]"}`}>{exercise.name}</button>)}</div>{(() => { const points = workouts.flatMap((workout) => workout.loggedExercises.filter((logged) => logged.exerciseId === progressExercise).map((logged) => ({ date: workout.date, weight: Math.max(...logged.sets.map((set) => set.weight), 0) }))).reverse(); const max = Math.max(...points.map((point) => point.weight), 1); const first = points[0]?.weight || 0; const latest = points.at(-1)?.weight || 0; const change = latest - first; return <div className="rounded-2xl border border-[var(--line)] bg-white p-6"><div className="mb-8 flex items-center justify-between"><div><h2 className="font-bold">Working weight</h2><p className="mt-1 text-sm text-[var(--muted)]">Your heaviest logged set for each session</p></div><TrendingUp className="text-[#75a889]" /></div>{points.length > 0 ? <><div className="flex h-56 items-end gap-3 border-b border-[var(--line)] px-2">{points.map((point, index) => <div key={`${point.date}-${index}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="relative w-full max-w-16 rounded-t-lg bg-[#a8d5ba] transition hover:bg-[#75a889]" style={{ height: `${Math.max((point.weight / max) * 88, 8)}%` }}><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 transition group-hover:opacity-100">{point.weight}kg</span></div><span className="text-[10px] text-[var(--muted)]">{point.date.slice(5)}</span></div>)}</div><div className={`mt-5 flex items-center gap-2 text-sm ${change >= 0 ? "text-[#56856a]" : "text-amber-700"}`}><TrendingUp size={15} />{change >= 0 ? `${change} kg improvement` : `${Math.abs(change)} kg down`} since first logged session</div></> : <div className="rounded-xl bg-[#f5f8f4] p-8 text-center text-sm text-[var(--muted)]">Log this exercise in a workout to start seeing your progress.</div>}</div> })()}</div>}

          {active === "Settings" && <div className="fade-in"><div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Settings</h1><p className="mt-2 text-[var(--muted)]">Manage your Lifted account.</p></div><div className="max-w-2xl space-y-4"><section className="rounded-2xl border border-[var(--line)] bg-white p-6"><div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d2e8d9] text-lg font-bold">{user.charAt(0).toUpperCase()}</div><div><h2 className="font-bold">Profile</h2><p className="text-sm text-[var(--muted)]">This name appears in your dashboard.</p></div></div><label className="block text-sm font-semibold">Display name<input value={accountName} onChange={(event) => setAccountName(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#fbfcf9] px-4 py-3 text-sm font-normal outline-none focus:border-[#75a889]" /></label><button onClick={saveAccountName} disabled={accountNameBusy || !accountName.trim() || accountName.trim() === user} className="mt-4 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{accountNameBusy ? "Saving…" : "Save changes"}</button></section><section className="rounded-2xl border border-[var(--line)] bg-white p-6"><h2 className="font-bold">Account</h2><div className="mt-4 space-y-3 text-sm"><div className="flex items-center justify-between gap-4"><span className="text-[var(--muted)]">Email</span><span className="font-medium">{sessionUser?.email || "Local demo account"}</span></div><div className="flex items-center justify-between gap-4"><span className="text-[var(--muted)]">Data sync</span><span className={`font-medium ${cloudLoadError ? "text-amber-700" : "text-[#56856a]"}`}>{cloudLoadError ? "Needs attention" : supabase ? "Supabase cloud" : "This browser only"}</span></div></div>{cloudLoadError && <div className="mt-5 rounded-xl bg-[#fff8ed] p-4 text-sm text-[#8a5a21]"><p>{cloudLoadError}</p><button onClick={retryCloudSync} className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold">Retry sync</button></div>}<button onClick={signOut} className="mt-6 flex items-center gap-2 rounded-xl border border-[#e7c9c9] px-4 py-2.5 text-sm font-semibold text-[#a85454] hover:bg-[#fff5f5]"><LogOut size={16} />Sign out</button></section></div></div>}

          {active === "Routines" && <div className="fade-in"><div className="mb-8 flex items-end justify-between"><div><h1 className="text-3xl font-bold tracking-tight">Routines</h1><p className="mt-2 text-[var(--muted)]">Your go-to sessions, ready when you are.</p></div><button onClick={saveRoutine} className="flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white"><Plus size={17} />Save routine</button></div><div className="grid gap-4 sm:grid-cols-2">{routines.map((routine) => <div key={routine.id} className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className="mb-8 flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--mint)]"><Sparkles size={18} /></div><span className="text-xs text-[var(--muted)]">{routine.exerciseIds.length} exercises</span></div><h2 className="font-bold">{routine.name}</h2><p className="mt-1 text-sm text-[var(--muted)]">{routine.exerciseIds.map((id) => allExercises.find((exercise) => exercise.id === id)?.name).join(" · ")}</p><button onClick={() => useRoutine(routine)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ink)] py-2.5 text-sm font-semibold text-white">Use routine <ChevronRight size={16} /></button></div>)}</div></div>}
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-[var(--line)] bg-[#fbfcf9]/95 px-2 py-2 backdrop-blur lg:hidden">{navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium ${active === label ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}><Icon size={19} /><span>{label}</span></button>)}</nav>
      <span className="fixed bottom-3 right-4 z-10 hidden text-[10px] font-medium tracking-wide text-[#a1aaa3] lg:block">v{APP_VERSION}</span>

      {showWorkout && <div className="fixed inset-0 z-30 flex items-end justify-center bg-[rgba(23,33,27,.3)] p-0 sm:items-center sm:p-5"><div className="slide-up max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-[#fbfcf9] p-5 sm:rounded-3xl sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="text-sm font-semibold text-[#75a889]">New session</p><h2 className="mt-1 text-2xl font-bold">Log your workout</h2></div><button onClick={() => setShowWorkout(false)} className="rounded-full p-2 hover:bg-white"><X size={20} /></button></div><div className="space-y-4">{selectedExercises.map((exercise) => <div key={exercise.id} className="rounded-2xl border border-[var(--line)] bg-white p-4"><div className="mb-4 flex items-center justify-between"><div><p className="font-semibold">{exercise.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{exercise.muscle} · {exercise.equipment}</p></div><Timer size={17} className="text-[#75a889]" /></div>{(sets[exercise.id] || []).map((set, index) => <div key={index} className="mb-2 grid grid-cols-[32px_1fr_1fr_40px] items-center gap-2"><span className="text-center text-xs text-[var(--muted)]">{index + 1}</span><input value={set.weight} onChange={(event) => setSets((current) => ({ ...current, [exercise.id]: current[exercise.id].map((item, i) => i === index ? { ...item, weight: event.target.value } : item) }))} placeholder="kg" className="w-full rounded-lg border border-[var(--line)] bg-[#fbfcf9] px-3 py-2 text-sm outline-none focus:border-[#75a889]" /><input value={set.reps} onChange={(event) => setSets((current) => ({ ...current, [exercise.id]: current[exercise.id].map((item, i) => i === index ? { ...item, reps: event.target.value } : item) }))} placeholder="reps" className="w-full rounded-lg border border-[var(--line)] bg-[#fbfcf9] px-3 py-2 text-sm outline-none focus:border-[#75a889]" /><button onClick={() => setSets((current) => ({ ...current, [exercise.id]: current[exercise.id].map((item, i) => i === index ? { ...item, done: !item.done } : item) }))} className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm ${set.done ? "border-[#75a889] bg-[var(--mint)] text-[#56856a]" : "border-[var(--line)] text-transparent"}`}>✓</button></div>)}<button onClick={() => setSets((current) => ({ ...current, [exercise.id]: [...current[exercise.id], { weight: "", reps: "", done: false }] }))} className="mt-1 text-xs font-semibold text-[#75a889]">+ Add set</button></div>)}</div><button onClick={() => setShowExercisePicker(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b8c9bb] py-3 text-sm font-semibold text-[#56856a]"><Plus size={16} />Add exercise</button>      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><button onClick={saveRoutine} className="flex-1 rounded-xl border border-[var(--line)] bg-white py-3 text-sm font-semibold">Save as routine</button><button onClick={saveWorkout} className="flex-1 rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white">Finish workout</button></div></div></div>}

      {showExercisePicker && <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(23,33,27,.3)] p-5"><div className="scale-in w-full max-w-lg rounded-3xl bg-[#fbfcf9] p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold">Add exercises</h2><p className="mt-1 text-sm text-[var(--muted)]">Pick everything you want to train.</p></div><button onClick={() => setShowExercisePicker(false)}><X size={20} /></button></div><div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5"><Search size={17} className="text-[var(--muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exercises" className="w-full bg-transparent text-sm outline-none" /></div><div className="max-h-64 space-y-1 overflow-y-auto">{filteredExercises.map((exercise) => <button key={exercise.id} onClick={() => toggleExercise(exercise)} className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-white"><span><span className="block text-sm font-semibold">{exercise.name}</span><span className="text-xs text-[var(--muted)]">{exercise.muscle} · {exercise.equipment}</span></span><span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${selectedExercises.some((item) => item.id === exercise.id) ? "border-[#75a889] bg-[var(--mint)] text-[#56856a]" : "border-[var(--line)] text-transparent"}`}>✓</span></button>)}</div><button onClick={() => setShowCreateExercise(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b8c9bb] py-3 text-sm font-semibold text-[#56856a]"><Plus size={16} />Create custom exercise</button><button onClick={() => setShowExercisePicker(false)} className="mt-3 w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white">Done</button></div></div>}
      {showCreateExercise && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,33,27,.3)] p-5"><form onSubmit={createExercise} className="scale-in w-full max-w-md rounded-3xl bg-[#fbfcf9] p-6"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-bold">Create exercise</h2><p className="mt-1 text-sm text-[var(--muted)]">Add it once and reuse it in future workouts.</p></div><button type="button" onClick={() => setShowCreateExercise(false)}><X size={20} /></button></div><label className="block text-sm font-semibold">Exercise name<input required autoFocus value={customExerciseName} onChange={(event) => setCustomExerciseName(event.target.value)} placeholder="e.g. Incline dumbbell press" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#75a889]" /></label><div className="mt-3 grid grid-cols-2 gap-3"><label className="block text-sm font-semibold">Muscle<input value={customExerciseMuscle} onChange={(event) => setCustomExerciseMuscle(event.target.value)} placeholder="Chest" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#75a889]" /></label><label className="block text-sm font-semibold">Equipment<input value={customExerciseEquipment} onChange={(event) => setCustomExerciseEquipment(event.target.value)} placeholder="Dumbbells" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#75a889]" /></label></div><div className="mt-6 flex gap-3"><button type="button" onClick={() => setShowCreateExercise(false)} className="flex-1 rounded-xl border border-[var(--line)] bg-white py-3 text-sm font-semibold">Cancel</button><button className="flex-1 rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white">Add exercise</button></div></form></div>}
    </main>
  );
}
