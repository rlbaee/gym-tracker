"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, ChevronRight, CircleUserRound, Dumbbell, History, LogOut,
  Menu, Plus, Search, Settings, Sparkles, Timer, TrendingUp, Trophy, X,
} from "lucide-react";

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

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [showWorkout, setShowWorkout] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([exercises[0], exercises[2]]);
  const [sets, setSets] = useState<Record<string, SetRow[]>>({});
  const [search, setSearch] = useState("");
  const [progressExercise, setProgressExercise] = useState("bench");
  const [user, setUser] = useState("Alex");

  useEffect(() => {
    const saved = window.localStorage.getItem("lifted-workouts");
    if (saved) setWorkouts(JSON.parse(saved));
    const savedRoutines = window.localStorage.getItem("lifted-routines");
    if (savedRoutines) setRoutines(JSON.parse(savedRoutines));
    const savedUser = window.localStorage.getItem("lifted-user");
    if (savedUser) setUser(savedUser);
  }, []);

  const totalVolume = useMemo(() => workouts.reduce((sum, workout) => sum + workout.volume, 0), [workouts]);
  const filteredExercises = exercises.filter((exercise) =>
    `${exercise.name} ${exercise.muscle}`.toLowerCase().includes(search.toLowerCase()),
  );

  function openWorkout() {
    setSets(Object.fromEntries(selectedExercises.map((exercise) => [
      exercise.id, [{ weight: "", reps: "", done: false }, { weight: "", reps: "", done: false }],
    ])));
    setShowWorkout(true);
  }

  function useRoutine(routine: Routine) {
    setSelectedExercises(routine.exerciseIds.map((id) => exercises.find((exercise) => exercise.id === id)).filter((exercise): exercise is Exercise => Boolean(exercise)));
    setActive("Workouts");
    setTimeout(() => setShowWorkout(true), 0);
  }

  function saveRoutine() {
    const name = window.prompt("Name this routine", "My routine")?.trim();
    if (!name || selectedExercises.length === 0) return;
    const next = [{ id: String(Date.now()), name, exerciseIds: selectedExercises.map((exercise) => exercise.id) }, ...routines];
    setRoutines(next);
    window.localStorage.setItem("lifted-routines", JSON.stringify(next));
  }

  function saveWorkout() {
    const volume = Object.values(sets).flat().reduce((sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0);
    const newWorkout: Workout = {
      id: String(Date.now()),
      name: "Quick workout",
      date: new Date().toISOString().slice(0, 10),
      exercises: selectedExercises.length,
      volume,
      loggedExercises: selectedExercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: (sets[exercise.id] || []).filter((set) => Number(set.weight) > 0 && Number(set.reps) > 0).map((set) => ({ weight: Number(set.weight), reps: Number(set.reps) })),
      })),
    };
    const next = [newWorkout, ...workouts];
    setWorkouts(next);
    window.localStorage.setItem("lifted-workouts", JSON.stringify(next));
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
    { label: "Workouts", icon: Dumbbell },
    { label: "Routines", icon: Sparkles },
    { label: "History", icon: History },
    { label: "Progress", icon: TrendingUp },
  ];

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
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[#f0f4ef]"><Settings size={17} />Settings</button>
            <button onClick={() => { setUser("Guest"); window.localStorage.removeItem("lifted-user"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[#f0f4ef]"><LogOut size={17} />Sign out</button>
            <div className="mt-4 flex items-center gap-3 border-t border-[var(--line)] pt-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d2e8d9] text-sm font-bold">A</div>
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

          {active === "Overview" && <div className="fade-in">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><p className="mb-2 text-sm font-medium text-[#75a889]">Saturday, October 19</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Good morning, {user}.</h1><p className="mt-2 text-[var(--muted)]">Ready to make today count?</p></div>
              <button onClick={openWorkout} className="flex w-fit items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"><Plus size={17} />Start workout</button>
            </div>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[["This week", "3", "workouts"], ["Total volume", `${(totalVolume / 1000).toFixed(1)}k`, "kg lifted"], ["Current streak", "5", "days"]].map(([label, value, suffix], index) => (
                <div key={label} className={`rounded-2xl border border-[var(--line)] p-5 ${index === 1 ? "bg-[var(--ink)] text-white" : "bg-white"}`}><div className="mb-5 flex items-center justify-between"><p className={`text-sm ${index === 1 ? "text-[#b1c9b7]" : "text-[var(--muted)]"}`}>{label}</p>{index === 0 ? <Dumbbell size={17} /> : index === 1 ? <BarChart3 size={17} /> : <Trophy size={17} />}</div><p className="text-3xl font-bold">{value}<span className={`ml-1 text-sm font-normal ${index === 1 ? "text-[#b1c9b7]" : "text-[var(--muted)]"}`}>{suffix}</span></p></div>
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="font-bold">Recent workouts</h2><p className="mt-1 text-sm text-[var(--muted)]">Your latest training sessions</p></div><button onClick={() => setActive("History")} className="text-sm font-semibold text-[#75a889]">View all</button></div><div className="space-y-2">{workouts.slice(0, 3).map((workout) => <div key={workout.id} className="flex items-center justify-between rounded-xl p-3 hover:bg-[#f8faf7]"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mint)]"><Dumbbell size={17} /></div><div><p className="text-sm font-semibold">{workout.name}</p><p className="mt-0.5 text-xs text-[var(--muted)]">{workout.date} · {workout.exercises} exercises</p></div></div><ChevronRight size={17} className="text-[#aab5ad]" /></div>)}</div></div>
              <div className="rounded-2xl bg-[#e5f3e8] p-6"><div className="mb-14 flex items-start justify-between"><div><p className="text-sm font-semibold text-[#56856a]">Tip of the day</p><Sparkles className="mt-3 text-[#56856a]" size={22} /></div><span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#56856a]">01</span></div><p className="text-xl font-semibold leading-snug">Consistency beats intensity. Show up, do the work, and let the results compound.</p><p className="mt-5 text-sm text-[#64836d]">— The Lifted team</p></div>
            </div>
          </div>}

          {active === "History" && <div className="fade-in"><div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Workout history</h1><p className="mt-2 text-[var(--muted)]">A record of everything you&apos;ve put in.</p></div><div className="space-y-3">{workouts.map((workout) => <div key={workout.id} className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--mint)]"><Dumbbell size={18} /></div><div><p className="font-semibold">{workout.name}</p><p className="mt-1 text-sm text-[var(--muted)]">{workout.date} · {workout.exercises} exercises</p></div></div><p className="text-sm font-semibold">{formatNumber(workout.volume)} kg</p></div><div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-3">{workout.loggedExercises.flatMap((logged) => logged.sets.length ? [`${logged.exerciseName}: ${logged.sets.map((set) => `${set.weight}kg × ${set.reps}`).join(", ")}`] : []).map((summary) => <span key={summary} className="rounded-lg bg-[#f5f8f4] px-2.5 py-1.5 text-xs text-[var(--muted)]">{summary}</span>)}</div></div>)}</div></div>}

          {active === "Progress" && <div className="fade-in"><div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Your progress</h1><p className="mt-2 text-[var(--muted)]">See how your working weight is moving over time.</p></div><div className="mb-5 flex flex-wrap gap-2">{exercises.map((exercise) => <button key={exercise.id} onClick={() => setProgressExercise(exercise.id)} className={`rounded-full px-3 py-2 text-xs font-semibold ${progressExercise === exercise.id ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)]"}`}>{exercise.name}</button>)}</div>{(() => { const points = workouts.flatMap((workout) => workout.loggedExercises.filter((logged) => logged.exerciseId === progressExercise).map((logged) => ({ date: workout.date, weight: Math.max(...logged.sets.map((set) => set.weight), 0) }))).reverse(); const max = Math.max(...points.map((point) => point.weight), 1); const first = points[0]?.weight || 0; const latest = points.at(-1)?.weight || 0; const change = latest - first; return <div className="rounded-2xl border border-[var(--line)] bg-white p-6"><div className="mb-8 flex items-center justify-between"><div><h2 className="font-bold">Working weight</h2><p className="mt-1 text-sm text-[var(--muted)]">Your heaviest logged set for each session</p></div><TrendingUp className="text-[#75a889]" /></div>{points.length > 0 ? <><div className="flex h-56 items-end gap-3 border-b border-[var(--line)] px-2">{points.map((point, index) => <div key={`${point.date}-${index}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="relative w-full max-w-16 rounded-t-lg bg-[#a8d5ba] transition hover:bg-[#75a889]" style={{ height: `${Math.max((point.weight / max) * 88, 8)}%` }}><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 transition group-hover:opacity-100">{point.weight}kg</span></div><span className="text-[10px] text-[var(--muted)]">{point.date.slice(5)}</span></div>)}</div><div className={`mt-5 flex items-center gap-2 text-sm ${change >= 0 ? "text-[#56856a]" : "text-amber-700"}`}><TrendingUp size={15} />{change >= 0 ? `${change} kg improvement` : `${Math.abs(change)} kg down`} since first logged session</div></> : <div className="rounded-xl bg-[#f5f8f4] p-8 text-center text-sm text-[var(--muted)]">Log this exercise in a workout to start seeing your progress.</div>}</div> })()}</div>}

          {active === "Workouts" && <div className="fade-in"><div className="mb-8 flex items-end justify-between"><div><h1 className="text-3xl font-bold tracking-tight">Workouts</h1><p className="mt-2 text-[var(--muted)]">Build your next session.</p></div><button onClick={openWorkout} className="flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white"><Plus size={17} />New workout</button></div><div className="rounded-2xl border border-dashed border-[#b8c9bb] bg-[#eef7ef] p-10 text-center"><Dumbbell className="mx-auto mb-4 text-[#75a889]" size={28} /><h2 className="font-bold">Start with a blank workout</h2><p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">Choose your exercises, add your sets, and keep building momentum.</p><button onClick={openWorkout} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-sm">Create workout</button></div></div>}

          {active === "Routines" && <div className="fade-in"><div className="mb-8 flex items-end justify-between"><div><h1 className="text-3xl font-bold tracking-tight">Routines</h1><p className="mt-2 text-[var(--muted)]">Your go-to sessions, ready when you are.</p></div><button onClick={saveRoutine} className="flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white"><Plus size={17} />Save routine</button></div><div className="grid gap-4 sm:grid-cols-2">{routines.map((routine) => <div key={routine.id} className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className="mb-8 flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--mint)]"><Sparkles size={18} /></div><span className="text-xs text-[var(--muted)]">{routine.exerciseIds.length} exercises</span></div><h2 className="font-bold">{routine.name}</h2><p className="mt-1 text-sm text-[var(--muted)]">{routine.exerciseIds.map((id) => exercises.find((exercise) => exercise.id === id)?.name).join(" · ")}</p><button onClick={() => useRoutine(routine)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ink)] py-2.5 text-sm font-semibold text-white">Use routine <ChevronRight size={16} /></button></div>)}</div></div>}
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-[var(--line)] bg-[#fbfcf9]/95 px-2 py-2 backdrop-blur lg:hidden">{navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium ${active === label ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}><Icon size={19} /><span>{label}</span></button>)}</nav>

      {showWorkout && <div className="fixed inset-0 z-30 flex items-end justify-center bg-[rgba(23,33,27,.3)] p-0 sm:items-center sm:p-5"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-[#fbfcf9] p-5 sm:rounded-3xl sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="text-sm font-semibold text-[#75a889]">New session</p><h2 className="mt-1 text-2xl font-bold">Log your workout</h2></div><button onClick={() => setShowWorkout(false)} className="rounded-full p-2 hover:bg-white"><X size={20} /></button></div><div className="space-y-4">{selectedExercises.map((exercise) => <div key={exercise.id} className="rounded-2xl border border-[var(--line)] bg-white p-4"><div className="mb-4 flex items-center justify-between"><div><p className="font-semibold">{exercise.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{exercise.muscle} · {exercise.equipment}</p></div><Timer size={17} className="text-[#75a889]" /></div>{(sets[exercise.id] || []).map((set, index) => <div key={index} className="mb-2 grid grid-cols-[32px_1fr_1fr_40px] items-center gap-2"><span className="text-center text-xs text-[var(--muted)]">{index + 1}</span><input value={set.weight} onChange={(event) => setSets((current) => ({ ...current, [exercise.id]: current[exercise.id].map((item, i) => i === index ? { ...item, weight: event.target.value } : item) }))} placeholder="kg" className="w-full rounded-lg border border-[var(--line)] bg-[#fbfcf9] px-3 py-2 text-sm outline-none focus:border-[#75a889]" /><input value={set.reps} onChange={(event) => setSets((current) => ({ ...current, [exercise.id]: current[exercise.id].map((item, i) => i === index ? { ...item, reps: event.target.value } : item) }))} placeholder="reps" className="w-full rounded-lg border border-[var(--line)] bg-[#fbfcf9] px-3 py-2 text-sm outline-none focus:border-[#75a889]" /><button onClick={() => setSets((current) => ({ ...current, [exercise.id]: current[exercise.id].map((item, i) => i === index ? { ...item, done: !item.done } : item) }))} className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm ${set.done ? "border-[#75a889] bg-[var(--mint)] text-[#56856a]" : "border-[var(--line)] text-transparent"}`}>✓</button></div>)}<button onClick={() => setSets((current) => ({ ...current, [exercise.id]: [...current[exercise.id], { weight: "", reps: "", done: false }] }))} className="mt-1 text-xs font-semibold text-[#75a889]">+ Add set</button></div>)}</div><button onClick={() => setShowExercisePicker(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b8c9bb] py-3 text-sm font-semibold text-[#56856a]"><Plus size={16} />Add exercise</button>      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><button onClick={saveRoutine} className="flex-1 rounded-xl border border-[var(--line)] bg-white py-3 text-sm font-semibold">Save as routine</button><button onClick={saveWorkout} className="flex-1 rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white">Finish workout</button></div></div></div>}

      {showExercisePicker && <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(23,33,27,.3)] p-5"><div className="w-full max-w-lg rounded-3xl bg-[#fbfcf9] p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold">Add exercises</h2><p className="mt-1 text-sm text-[var(--muted)]">Pick everything you want to train.</p></div><button onClick={() => setShowExercisePicker(false)}><X size={20} /></button></div><div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5"><Search size={17} className="text-[var(--muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exercises" className="w-full bg-transparent text-sm outline-none" /></div><div className="max-h-64 space-y-1 overflow-y-auto">{filteredExercises.map((exercise) => <button key={exercise.id} onClick={() => toggleExercise(exercise)} className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-white"><span><span className="block text-sm font-semibold">{exercise.name}</span><span className="text-xs text-[var(--muted)]">{exercise.muscle} · {exercise.equipment}</span></span><span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${selectedExercises.some((item) => item.id === exercise.id) ? "border-[#75a889] bg-[var(--mint)] text-[#56856a]" : "border-[var(--line)] text-transparent"}`}>✓</span></button>)}</div><button onClick={() => setShowExercisePicker(false)} className="mt-5 w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white">Done</button></div></div>}
    </main>
  );
}
