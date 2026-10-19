"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  ChevronRight,
  Dumbbell,
  History,
  LogOut,
  Music,
  Plus,
  Search,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const APP_VERSION = "0.4.0";

function SpotifyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill="currentColor"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function AppleMusicIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.323-.16.67-.25 1.018-.324.378-.082.758-.153 1.134-.24.274-.063.457-.23.51-.516a.904.904 0 00.02-.193c0-1.815 0-3.63-.002-5.443a.725.725 0 00-.026-.185c-.04-.15-.15-.243-.304-.234-.16.01-.318.035-.475.066-.76.15-1.52.303-2.28.456l-2.325.47-1.374.278c-.016.003-.032.01-.048.013-.277.077-.377.203-.39.49-.002.042 0 .086 0 .13-.002 2.602 0 5.204-.003 7.805 0 .42-.047.836-.215 1.227-.278.64-.77 1.04-1.434 1.233-.35.1-.71.16-1.075.172-.96.036-1.755-.6-1.92-1.544-.14-.812.23-1.685 1.154-2.075.357-.15.73-.232 1.108-.31.287-.06.575-.116.86-.177.383-.083.583-.323.6-.714v-.15c0-2.96 0-5.922 0-8.882 0-.123.013-.25.042-.37.07-.285.273-.448.546-.518.255-.066.515-.112.774-.165.733-.15 1.466-.296 2.2-.444l2.27-.46c.67-.134 1.34-.27 2.01-.403.22-.043.442-.088.663-.106.31-.025.523.17.554.482.008.073.012.148.012.223.002 1.91.002 3.822 0 5.732z"
      />
    </svg>
  );
}

type Exercise = { id: string; name: string; muscle: string; equipment: string };
type SetRow = { weight: string; reps: string; done: boolean };
type LoggedExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: { weight: number; reps: number }[];
};
type Workout = {
  id: string;
  name: string;
  date: string;
  exercises: number;
  volume: number;
  loggedExercises: LoggedExercise[];
};
type Routine = { id: string; name: string; exerciseIds: string[] };

const exercises: Exercise[] = [
  {
    id: "bench",
    name: "Barbell Bench Press",
    muscle: "Chest",
    equipment: "Barbell",
  },
  { id: "squat", name: "Back Squat", muscle: "Legs", equipment: "Barbell" },
  { id: "row", name: "Seated Cable Row", muscle: "Back", equipment: "Cable" },
  {
    id: "press",
    name: "Overhead Press",
    muscle: "Shoulders",
    equipment: "Barbell",
  },
  {
    id: "rdl",
    name: "Romanian Deadlift",
    muscle: "Hamstrings",
    equipment: "Barbell",
  },
  { id: "pullup", name: "Pull Up", muscle: "Back", equipment: "Bodyweight" },
];

const initialWorkouts: Workout[] = [
  {
    id: "1",
    name: "Upper body strength",
    date: "2026-10-19",
    exercises: 5,
    volume: 8420,
    loggedExercises: [
      {
        exerciseId: "bench",
        exerciseName: "Barbell Bench Press",
        sets: [
          { weight: 60, reps: 8 },
          { weight: 60, reps: 8 },
          { weight: 65, reps: 6 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Leg day",
    date: "2026-10-16",
    exercises: 6,
    volume: 10850,
    loggedExercises: [
      {
        exerciseId: "squat",
        exerciseName: "Back Squat",
        sets: [
          { weight: 90, reps: 8 },
          { weight: 100, reps: 6 },
          { weight: 100, reps: 6 },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Pull & core",
    date: "2026-10-12",
    exercises: 5,
    volume: 7240,
    loggedExercises: [
      {
        exerciseId: "bench",
        exerciseName: "Barbell Bench Press",
        sets: [
          { weight: 55, reps: 8 },
          { weight: 60, reps: 6 },
        ],
      },
    ],
  },
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

const missionApiUrl = "https://todaysmission-alpha.vercel.app/api/mission";
const safeMissionFallbacks = [
  "Hold a door open for someone and wish them a genuinely good day.",
  "Send a thoughtful message to someone you have not spoken to in a while.",
  "Give someone a specific, sincere compliment.",
  "Drink a full glass of water before your next coffee or soft drink.",
  "Take a ten-minute walk without checking your phone.",
  "Put one small area of your room or workspace back in order.",
  "Thank someone whose work often goes unnoticed.",
  "Write down one thing you handled well this week.",
  "Try one exercise with slower, more controlled reps than usual.",
  "Stretch for five minutes before you sit down for the evening.",
];
const dailyQuotes = [
  "Small steps still move you forward.",
  "Consistency is built one ordinary choice at a time.",
  "You do not need a perfect day to make meaningful progress.",
  "Rest is part of the work, not a reward for finishing it.",
  "Progress deserves your attention even when it is quiet.",
  "Your habits are votes for the person you are becoming.",
];

function getDailyIndex(length: number, date = new Date()) {
  const key = getLocalDateKey(date);
  let hash = 0;
  for (const character of key) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash % length;
}

function isSafeMission(mission: string) {
  return !/\b(superglue|saran|duct tape|zip tie|toothbrush|toilet|car|phone|computer|wifi|alarm|poison|bleach|lube|firework|weapon|bomb|steal|break into|fake (?:police|parking)|harass|scare|prank|gaslight|glitter|nail polish|food coloring|public restroom|scream|run away)\b/i.test(
    mission,
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [showWorkout, setShowWorkout] = useState(false);
  const [dailyMission, setDailyMission] = useState("");
  const [missionLoading, setMissionLoading] = useState(true);
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number | null>(null);
  const [workoutElapsed, setWorkoutElapsed] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customExerciseMuscle, setCustomExerciseMuscle] = useState("Other");
  const [customExerciseEquipment, setCustomExerciseEquipment] =
    useState("Other");
  const [workouts, setWorkouts] = useState<Workout[]>(
    supabase ? [] : initialWorkouts,
  );
  const [routines, setRoutines] = useState<Routine[]>(
    supabase ? [] : initialRoutines,
  );
  const [allExercises, setAllExercises] = useState<Exercise[]>(exercises);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([
    exercises[0],
    exercises[2],
  ]);
  const [sets, setSets] = useState<Record<string, SetRow[]>>({});
  const [search, setSearch] = useState("");
  const [progressExercise, setProgressExercise] = useState("bench");
  const [user, setUser] = useState("Guest");
  const [accountName, setAccountName] = useState("");
  const [accountNameBusy, setAccountNameBusy] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [authReady, setAuthReady] = useState(!supabase);
  const [sessionUser, setSessionUser] = useState<{
    id: string;
    email?: string;
    createdAt?: string;
  } | null>(null);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [cloudError, setCloudError] = useState("");
  const [cloudLoadError, setCloudLoadError] = useState("");
  const cloudRequest = useRef(0);

  async function loadMission() {
    setMissionLoading(true);
    try {
      const response = await fetch(missionApiUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Mission request failed: ${response.status}`);
      }
      const data: { mission?: unknown } = await response.json();
      if (
        typeof data.mission !== "string" ||
        !data.mission.trim() ||
        !isSafeMission(data.mission)
      ) {
        throw new Error("Mission was not suitable for display");
      }
      setDailyMission(data.mission.trim());
    } catch {
      setDailyMission(
        safeMissionFallbacks[
          Math.floor(Math.random() * safeMissionFallbacks.length)
        ],
      );
    } finally {
      setMissionLoading(false);
    }
  }

  useEffect(() => {
    if (active === "Overview") void loadMission();
  }, [active]);

  useEffect(() => {
    if (!showWorkout || workoutStartedAt === null) return;
    const updateElapsed = () =>
      setWorkoutElapsed(Math.max(0, Math.floor((Date.now() - workoutStartedAt) / 1000)));
    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [showWorkout, workoutStartedAt]);

  useEffect(() => {
    if (supabase) {
      let active = true;
      const syncSession = async (
        nextSession: {
          user?: {
            id: string;
            email?: string;
            created_at?: string;
            user_metadata?: Record<string, string>;
            app_metadata?: Record<string, string>;
          };
        } | null,
      ) => {
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
        const displayName =
          metadata.full_name ||
          metadata.name ||
          metadata.user_name ||
          nextUser.email?.split("@")[0] ||
          "Athlete";
        setUser(displayName);
        setAccountName(displayName);
        setAvatarUrl(metadata.avatar_url || metadata.picture || "");
        setSessionUser({
          id: nextUser.id,
          email: nextUser.email,
          createdAt: nextUser.created_at,
        });
        await loadCloudData(nextUser.id);
      };
      supabase.auth.getSession().then(({ data }) => syncSession(data.session));
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          syncSession(nextSession);
        },
      );
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
    const [
      { data: cloudWorkouts, error: workoutsError },
      { data: cloudRoutines, error: routinesError },
      { data: cloudExercises, error: exercisesError },
      { data: profile, error: profileError },
    ] = await Promise.all([
      supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId)
        .order("workout_date", { ascending: false }),
      supabase
        .from("routines")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("custom_exercises")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle(),
    ]);
    if (requestId !== cloudRequest.current) return;
    const loadError = workoutsError || routinesError;
    if (loadError || !cloudWorkouts || !cloudRoutines) {
      setWorkouts([]);
      setRoutines([]);
      setCloudLoadError(
        loadError?.code === "42P01"
          ? "Your workout tables are not set up yet. Run the latest supabase/schema.sql in the Supabase SQL Editor."
          : loadError?.code === "42501"
            ? "Supabase denied access to your workout data. Run the latest RLS policies in supabase/schema.sql."
            : "Cloud sync is temporarily unavailable. Your account is still safe; try again from Settings.",
      );
    } else {
      if (!profileError && profile) {
        setUser(profile.display_name);
        setAccountName(profile.display_name);
        setAvatarUrl(profile.avatar_url || "");
      } else if (!profileError) {
        const fallbackName = user || "Athlete";
        await supabase.from("profiles").upsert({
          id: userId,
          display_name: fallbackName,
          avatar_url: null,
        });
      }
      if (!exercisesError) {
        setAllExercises([
          ...exercises,
          ...(cloudExercises || []).map((item) => ({
            id: item.id,
            name: item.name,
            muscle: item.muscle,
            equipment: item.equipment,
          })),
        ]);
      }
      setWorkouts(
        cloudWorkouts.map((item) => ({
          id: item.id,
          name: item.name,
          date: item.workout_date,
          exercises: item.logged_exercises.length,
          volume: Number(item.volume),
          loggedExercises: item.logged_exercises,
        })),
      );
      setRoutines(
        cloudRoutines.map((item) => ({
          id: item.id,
          name: item.name,
          exerciseIds: item.exercise_ids,
        })),
      );
      if (exercisesError?.code !== "42P01") {
        setCloudLoadError(
          exercisesError
            ? "Custom exercises are unavailable until the latest Supabase schema is applied."
            : "",
        );
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
    const result =
      authMode === "sign-in"
        ? await supabase.auth.signInWithPassword({
            email: authEmail,
            password: authPassword,
          })
        : await supabase.auth.signUp({
            email: authEmail,
            password: authPassword,
            options: { emailRedirectTo: window.location.origin },
          });
    if (result.error) setAuthError(result.error.message);
    else if (authMode === "sign-up" && !result.data.session)
      setAuthMessage("Check your email to confirm your account.");
    setAuthBusy(false);
  }

  async function signInWithGoogle() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
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
    setAvatarUrl("");
    window.localStorage.removeItem("lifted-workouts");
    window.localStorage.removeItem("lifted-routines");
  }

  async function saveAccountName() {
    const nextName = accountName.trim();
    if (!supabase || !sessionUser || !nextName) return;
    setAccountNameBusy(true);
    const [{ error: authError }, { error: profileError }] = await Promise.all([
      supabase.auth.updateUser({ data: { full_name: nextName } }),
      supabase.from("profiles").upsert({
        id: sessionUser.id,
        display_name: nextName,
        avatar_url: avatarUrl || null,
      }),
    ]);
    if (authError || profileError)
      setCloudError("We could not update your name. Run the latest Supabase schema, then try again.");
    else setUser(nextName);
    setAccountNameBusy(false);
  }

  async function changeProfilePicture(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (
      !file ||
      !file.type.startsWith("image/") ||
      file.size > 2 * 1024 * 1024
    ) {
      setCloudError("Choose an image smaller than 2 MB.");
      return;
    }
    setAvatarBusy(true);
    if (!supabase || !sessionUser) {
      setAvatarUrl(URL.createObjectURL(file));
      setAvatarBusy(false);
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${sessionUser.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setCloudError(
        "Profile pictures are not configured yet. Run the latest Supabase schema, then try again.",
      );
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
      const [{ error: authError }, { error: profileError }] = await Promise.all([
        supabase.auth.updateUser({ data: { avatar_url: publicUrl } }),
        supabase.from("profiles").upsert({
          id: sessionUser.id,
          display_name: accountName || user,
          avatar_url: publicUrl,
        }),
      ]);
      if (authError || profileError)
        setCloudError(
          "Your picture uploaded, but the profile could not be updated.",
        );
      else setAvatarUrl(publicUrl);
    }
    setAvatarBusy(false);
  }

  const profileAvatar = avatarUrl ? (
    <img
      src={avatarUrl}
      alt=""
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span>{user.charAt(0).toUpperCase()}</span>
  );

  async function retryCloudSync() {
    if (sessionUser) await loadCloudData(sessionUser.id);
  }

  async function createExercise(event: React.FormEvent) {
    event.preventDefault();
    const name = customExerciseName.trim();
    if (!name) return;
    const localExercise = {
      id: `custom-${Date.now()}`,
      name,
      muscle: customExerciseMuscle,
      equipment: customExerciseEquipment,
    };
    if (supabase && sessionUser) {
      const { data, error } = await supabase
        .from("custom_exercises")
        .insert({
          user_id: sessionUser.id,
          name,
          muscle: customExerciseMuscle,
          equipment: customExerciseEquipment,
        })
        .select()
        .single();
      if (error || !data) {
        setCloudError(
          "We could not add that exercise. Run the latest Supabase schema, then try again.",
        );
        return;
      }
      setAllExercises((current) => [
        ...current,
        {
          id: data.id,
          name: data.name,
          muscle: data.muscle,
          equipment: data.equipment,
        },
      ]);
    } else {
      setAllExercises((current) => [...current, localExercise]);
    }
    setCustomExerciseName("");
    setShowCreateExercise(false);
  }

  const totalVolume = useMemo(
    () => workouts.reduce((sum, workout) => sum + workout.volume, 0),
    [workouts],
  );
  const filteredExercises = allExercises.filter((exercise) =>
    `${exercise.name} ${exercise.muscle}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function openWorkout(exerciseList: Exercise[] = []) {
    setSelectedExercises(exerciseList);
    setSets(
      Object.fromEntries(
        exerciseList.map((exercise) => [
          exercise.id,
          [{ weight: "", reps: "", done: false }],
        ]),
      ),
    );
    setWorkoutStartedAt(Date.now());
    setWorkoutElapsed(0);
    setShowWorkout(true);
  }

  function useRoutine(routine: Routine) {
    const routineExercises = routine.exerciseIds
        .map((id) => allExercises.find((exercise) => exercise.id === id))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
    openWorkout(routineExercises);
    setActive("Overview");
  }

  function addSet(exerciseId: string) {
    setSets((current) => ({
      ...current,
      [exerciseId]: [...(current[exerciseId] || []), { weight: "", reps: "", done: false }],
    }));
  }

  function removeSet(exerciseId: string) {
    setSets((current) => ({
      ...current,
      [exerciseId]: (current[exerciseId] || []).length > 1
        ? current[exerciseId].slice(0, -1)
        : current[exerciseId],
    }));
  }

  function updateSetValue(
    exerciseId: string,
    index: number,
    field: "weight" | "reps",
    value: string,
  ) {
    setSets((current) => ({
      ...current,
      [exerciseId]: current[exerciseId].map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function adjustSetValue(
    exerciseId: string,
    index: number,
    field: "weight" | "reps",
    amount: number,
  ) {
    setSets((current) => ({
      ...current,
      [exerciseId]: current[exerciseId].map((item, i) => {
        if (i !== index) return item;
        const currentValue = Number(item[field]) || 0;
        const nextValue = Math.max(0, currentValue + amount);
        return { ...item, [field]: String(nextValue || "") };
      }),
    }));
  }

  function getPreviousExerciseSet(exerciseId: string) {
    const previousWorkout = workouts.find((workout) =>
      workout.loggedExercises.some((logged) => logged.exerciseId === exerciseId),
    );
    const previousExercise = previousWorkout?.loggedExercises.find(
      (logged) => logged.exerciseId === exerciseId,
    );
    if (!previousExercise?.sets.length) return null;
    return previousExercise.sets.reduce((best, set) =>
      set.weight > best.weight ||
      (set.weight === best.weight && set.reps > best.reps)
        ? set
        : best,
    );
  }

  async function saveRoutine() {
    const name = window.prompt("Name this routine", "My routine")?.trim();
    if (!name || selectedExercises.length === 0) return;
    if (supabase && sessionUser) {
      const { error } = await supabase
        .from("routines")
        .insert({
          user_id: sessionUser.id,
          name,
          exercise_ids: selectedExercises.map((exercise) => exercise.id),
        });
      if (error) {
        setCloudError("We could not save that routine. Please try again.");
        return;
      }
    }
    const next = [
      {
        id: String(Date.now()),
        name,
        exerciseIds: selectedExercises.map((exercise) => exercise.id),
      },
      ...routines,
    ];
    setRoutines(next);
    if (!supabase)
      window.localStorage.setItem("lifted-routines", JSON.stringify(next));
  }

  async function saveWorkout() {
    if (selectedExercises.length === 0) {
      setCloudError("Add at least one exercise before finishing the workout.");
      return;
    }
    const volume = Object.values(sets)
      .flat()
      .reduce(
        (sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0),
        0,
      );
    const newWorkout: Workout = {
      id: String(Date.now()),
      name: "Quick workout",
      date: getLocalDateKey(),
      exercises: selectedExercises.length,
      volume,
      loggedExercises: selectedExercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: (sets[exercise.id] || [])
          .filter((set) => Number(set.weight) > 0 && Number(set.reps) > 0)
          .map((set) => ({
            weight: Number(set.weight),
            reps: Number(set.reps),
          })),
      })),
    };
    if (supabase && sessionUser) {
      const { error } = await supabase
        .from("workouts")
        .insert({
          user_id: sessionUser.id,
          name: newWorkout.name,
          workout_date: newWorkout.date,
          volume: newWorkout.volume,
          logged_exercises: newWorkout.loggedExercises,
        });
      if (error) {
        setCloudError("We could not save that workout. Please try again.");
        return;
      }
    }
    const next = [newWorkout, ...workouts];
    setWorkouts(next);
    if (!supabase)
      window.localStorage.setItem("lifted-workouts", JSON.stringify(next));
    setShowWorkout(false);
    setWorkoutStartedAt(null);
    setWorkoutElapsed(0);
    setActive("History");
  }

  function toggleExercise(exercise: Exercise) {
    const alreadySelected = selectedExercises.some((item) => item.id === exercise.id);
    setSelectedExercises((current) =>
      alreadySelected
        ? current.filter((item) => item.id !== exercise.id)
        : [...current, exercise],
    );
    setSets((current) => {
      const next = { ...current };
      if (alreadySelected) delete next[exercise.id];
      else next[exercise.id] = [{ weight: "", reps: "", done: false }];
      return next;
    });
  }

  function openMusic(provider: "spotify" | "apple") {
    const query = encodeURIComponent("workout music");
    const url =
      provider === "spotify"
        ? `https://open.spotify.com/search/${query}`
        : `https://music.apple.com/us/search?term=${query}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const navItems = [
    { label: "Overview", icon: BarChart3 },
    { label: "Routines", icon: Sparkles },
    { label: "History", icon: History },
    { label: "Progress", icon: TrendingUp },
  ];

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 5
      ? "Good night"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
  const todayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);
  const getWeekKey = (date: Date) => {
    const weekStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay(),
    );
    return getLocalDateKey(weekStart);
  };
  const workoutWeeks = new Set(
    workouts.map((workout) => getWeekKey(new Date(`${workout.date}T00:00:00`))),
  );
  const firstWorkoutDate = workouts.length
    ? new Date(`${workouts[workouts.length - 1].date}T00:00:00`)
    : now;
  const elapsedWeeks = Math.max(
    1,
    Math.floor(
      (now.getTime() - firstWorkoutDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
    ) + 1,
  );
  const averageWorkoutsPerWeek = workouts.length / elapsedWeeks;
  const averageVolumePerWeek = totalVolume / elapsedWeeks;
  const joinedDate = sessionUser?.createdAt
    ? new Date(sessionUser.createdAt)
    : workouts.length
      ? new Date(`${workouts[workouts.length - 1].date}T00:00:00`)
      : now;
  const daysUsingLifted = Math.max(
    1,
    Math.floor(
      (now.getTime() - joinedDate.getTime()) / (24 * 60 * 60 * 1000),
    ) + 1,
  );
  let currentStreak = 0;
  const streakWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay(),
  );
  while (workoutWeeks.has(getLocalDateKey(streakWeek))) {
    currentStreak += 1;
    streakWeek.setDate(streakWeek.getDate() - 7);
  }

  if (!authReady)
    return (
      <main className="grain flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        Loading your account…
      </main>
    );
  if (supabase && !sessionUser)
    return (
      <main className="grain flex min-h-screen items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-7 shadow-soft">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ink)] text-white">
              <Dumbbell size={19} />
            </div>
            <span className="text-xl font-bold">
              lifted<span className="text-[#83b798]">.</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold">
            {authMode === "sign-in" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Your workouts sync across every device.
          </p>
          <form onSubmit={submitAuth} className="mt-7 space-y-3">
            <input
              required
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="Email address"
              className="w-full rounded-xl border border-[var(--line)] bg-[#fbfcf9] px-4 py-3 text-sm outline-none focus:border-[#75a889]"
            />
            <input
              required
              minLength={6}
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Password (6+ characters)"
              className="w-full rounded-xl border border-[var(--line)] bg-[#fbfcf9] px-4 py-3 text-sm outline-none focus:border-[#75a889]"
            />
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            {authMessage && (
              <p className="text-sm text-[#56856a]">{authMessage}</p>
            )}
            <button
              disabled={authBusy}
              className="w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {authBusy
                ? "Please wait…"
                : authMode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
          <button
            onClick={signInWithGoogle}
            className="mt-3 w-full rounded-xl border border-[var(--line)] bg-white py-3 text-sm font-semibold"
          >
            Continue with Google
          </button>
          <button
            onClick={() => {
              setAuthMode(authMode === "sign-in" ? "sign-up" : "sign-in");
              setAuthError("");
              setAuthMessage("");
            }}
            className="mt-5 w-full text-sm text-[var(--muted)]"
          >
            {authMode === "sign-in"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </main>
    );

  return (
    <main className="grain min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 flex-col border-r border-[var(--line)] bg-[#fbfcf9] p-6 lg:flex">
          <div className="mb-14 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ink)] text-white">
              <Dumbbell size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              lifted<span className="text-[#83b798]">.</span>
            </span>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActive(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${active === label ? "bg-[var(--mint)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[#f0f4ef]"}`}
              >
                <Icon size={17} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-1">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[#f0f4ef]"
            >
              <LogOut size={17} />
              Sign out
            </button>
            <button
              onClick={() => setActive("Settings")}
              className="mt-4 flex w-full items-center gap-3 border-t border-[var(--line)] pt-5 text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d2e8d9] text-sm font-bold">
                {profileAvatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{user}</p>
                <p className="text-xs text-[var(--muted)]">
                  Using Lifted for {daysUsingLifted}{" "}
                  {daysUsingLifted === 1 ? "day" : "days"}
                </p>
              </div>
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 pb-24 sm:px-8 lg:px-14 lg:pb-10">
          <header className="flex items-center justify-between py-6">
            <button
              onClick={() => setActive("Overview")}
              className="flex items-center gap-2 lg:hidden"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--ink)] text-white">
                <Dumbbell size={16} />
              </span>
              <span className="font-bold">
                lifted<span className="text-[#83b798]">.</span>
              </span>
            </button>
            <p className="hidden text-sm text-[var(--muted)] lg:block">
              {active}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActive("Settings")}
                aria-label="Open account settings"
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#d2e8d9] text-sm font-bold text-[var(--ink)]"
              >
                {profileAvatar}
              </button>
            </div>
          </header>

          {cloudError && (
            <div
              role="alert"
              className="mb-4 flex items-center justify-between rounded-xl border border-[#e7c9a4] bg-[#fff8ed] px-4 py-3 text-sm text-[#8a5a21]"
            >
              <span>{cloudError}</span>
              <button
                onClick={() => setCloudError("")}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {active === "Overview" && (
            <div className="fade-in">
              <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-2 text-sm font-medium text-[#75a889]">
                    {todayLabel}
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {greeting}, {user}.
                  </h1>
                  <p className="mt-2 text-[var(--muted)]">
                    Ready to make today count?
                  </p>
                </div>
                <button
                  onClick={() => openWorkout()}
                  className="flex w-fit items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                >
                  <Plus size={17} />
                  Start workout
                </button>
              </div>
              <div className="mb-8 rounded-2xl bg-[var(--ink)] p-5 text-white sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b1c9b7]">
                      Random mission
                    </p>
                    <p className="mt-1 text-xs text-[#8fae99]">
                      A fresh one appears when you return home
                    </p>
                  </div>
                  <button
                    onClick={() => void loadMission()}
                    disabled={missionLoading}
                    className="rounded-lg bg-[#31443a] px-3 py-2 text-xs font-semibold text-[#dff2e6] disabled:opacity-60"
                  >
                    {missionLoading ? "Loading..." : "New mission"}
                  </button>
                </div>
                <p className="max-w-3xl text-lg font-semibold leading-relaxed">
                  {missionLoading ? "Finding a mission..." : dailyMission}
                </p>
              </div>
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {[
                  [
                    "Workouts",
                    String(workouts.length),
                    "workouts",
                    `Avg. ${averageWorkoutsPerWeek.toFixed(1)} / week`,
                  ],
                  [
                    "Volume",
                    formatNumber(totalVolume),
                    "kg lifted",
                    `Avg. ${formatNumber(averageVolumePerWeek)} kg / week`,
                  ],
                  ["Weekly streak", String(currentStreak), "weeks", "Consecutive weeks"],
                ].map(([label, value, suffix, secondary], index) => (
                  <div
                    key={label}
                    className={`rounded-2xl border border-[var(--line)] p-5 ${index === 1 ? "bg-[var(--ink)] text-white" : "bg-white"}`}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <p
                        className={`text-sm ${index === 1 ? "text-[#b1c9b7]" : "text-[var(--muted)]"}`}
                      >
                        {label}
                      </p>
                      {index === 0 ? (
                        <Dumbbell size={17} />
                      ) : index === 1 ? (
                        <BarChart3 size={17} />
                      ) : (
                        <Trophy size={17} />
                      )}
                    </div>
                    <p className="text-3xl font-bold">
                      {value}
                      <span
                        className={`ml-1 text-sm font-normal ${index === 1 ? "text-[#b1c9b7]" : "text-[var(--muted)]"}`}
                      >
                        {suffix}
                      </span>
                    </p>
                    <p
                      className={`mt-2 text-xs ${index === 1 ? "text-[#b1c9b7]" : "text-[var(--muted)]"}`}
                    >
                      {secondary}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7ef] text-[#56856a]">
                    <Music size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">Workout music</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Open your favorite training playlist.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openMusic("spotify")}
                    aria-label="Open Spotify workout music"
                    title="Spotify"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4f5e8] text-[#287542] hover:bg-[#d4eedb]"
                  >
                    <SpotifyIcon />
                  </button>
                  <button
                    onClick={() => openMusic("apple")}
                    aria-label="Open Apple Music workout music"
                    title="Apple Music"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5e5ed] text-[#9a3f6a] hover:bg-[#eed7e3]"
                  >
                    <AppleMusicIcon />
                  </button>
                </div>
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <div className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold">Recent workouts</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Your latest training sessions
                      </p>
                    </div>
                    <button
                      onClick={() => setActive("History")}
                      className="text-sm font-semibold text-[#75a889]"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {workouts.slice(0, 3).map((workout) => (
                      <div
                        key={workout.id}
                        className="flex items-center justify-between rounded-xl p-3 hover:bg-[#f8faf7]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mint)]">
                            <Dumbbell size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {workout.name}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                              {workout.date} · {workout.exercises} exercises
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={17} className="text-[#aab5ad]" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#e5f3e8] p-6">
                  <div className="mb-14 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#56856a]">
                        Tip of the day
                      </p>
                      <Sparkles className="mt-3 text-[#56856a]" size={22} />
                    </div>
                    <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#56856a]">
                      01
                    </span>
                  </div>
                  <p className="text-xl font-semibold leading-snug">
                    Consistency beats intensity. Show up, do the work, and let
                    the results compound.
                  </p>
                  <p className="mt-5 text-sm text-[#64836d]">
                    — The Lifted team
                  </p>
                </div>
              </div>
            </div>
          )}

          {active === "History" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                  Workout history
                </h1>
                <p className="mt-2 text-[var(--muted)]">
                  A record of everything you&apos;ve put in.
                </p>
              </div>
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    className="cursor-pointer rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--mint)]">
                          <Dumbbell size={18} />
                        </div>
                        <div>
                          <p className="font-semibold">{workout.name}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {workout.date} · {workout.exercises} exercises
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatNumber(workout.volume)} kg
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-3">
                      {workout.loggedExercises
                        .flatMap((logged) =>
                          logged.sets.length
                            ? [
                                `${logged.exerciseName}: ${logged.sets.map((set) => `${set.weight}kg × ${set.reps}`).join(", ")}`,
                              ]
                            : [],
                        )
                        .map((summary) => (
                          <span
                            key={summary}
                            className="rounded-lg bg-[#f5f8f4] px-2.5 py-1.5 text-xs text-[var(--muted)]"
                          >
                            {summary}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "Progress" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                  Your progress
                </h1>
                <p className="mt-2 text-[var(--muted)]">
                  See how your working weight is moving over time.
                </p>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                {allExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => setProgressExercise(exercise.id)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${progressExercise === exercise.id ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)]"}`}
                  >
                    {exercise.name}
                  </button>
                ))}
              </div>
              {(() => {
                const points = workouts
                  .flatMap((workout) =>
                    workout.loggedExercises
                      .filter(
                        (logged) => logged.exerciseId === progressExercise,
                      )
                      .map((logged) => ({
                        date: workout.date,
                        weight: Math.max(
                          ...logged.sets.map((set) => set.weight),
                          0,
                        ),
                      })),
                  )
                  .reverse();
                const max = Math.max(...points.map((point) => point.weight), 1);
                const first = points[0]?.weight || 0;
                const latest = points.at(-1)?.weight || 0;
                const change = latest - first;
                return (
                  <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
                    <div className="mb-8 flex items-center justify-between">
                      <div>
                        <h2 className="font-bold">Working weight</h2>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          Your heaviest logged set for each session
                        </p>
                      </div>
                      <TrendingUp className="text-[#75a889]" />
                    </div>
                    {points.length > 0 ? (
                      <>
                        <div className="flex h-56 items-end gap-3 border-b border-[var(--line)] px-2">
                          {points.map((point, index) => (
                            <div
                              key={`${point.date}-${index}`}
                              className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                            >
                              <div
                                className="relative w-full max-w-16 rounded-t-lg bg-[#a8d5ba] transition hover:bg-[#75a889]"
                                style={{
                                  height: `${Math.max((point.weight / max) * 88, 8)}%`,
                                }}
                              >
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 transition group-hover:opacity-100">
                                  {point.weight}kg
                                </span>
                              </div>
                              <span className="text-[10px] text-[var(--muted)]">
                                {point.date.slice(5)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div
                          className={`mt-5 flex items-center gap-2 text-sm ${change >= 0 ? "text-[#56856a]" : "text-amber-700"}`}
                        >
                          <TrendingUp size={15} />
                          {change >= 0
                            ? `${change} kg improvement`
                            : `${Math.abs(change)} kg down`}{" "}
                          since first logged session
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl bg-[#f5f8f4] p-8 text-center text-sm text-[var(--muted)]">
                        Log this exercise in a workout to start seeing your
                        progress.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {active === "Settings" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                  Account settings
                </h1>
                <p className="mt-2 text-[var(--muted)]">
                  Manage your profile and account.
                </p>
              </div>
              <div className="max-w-2xl space-y-4">
                <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <label className="relative flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#d2e8d9] text-lg font-bold">
                      {profileAvatar}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={changeProfilePicture}
                        className="sr-only"
                      />
                      {avatarBusy && (
                        <span className="absolute inset-0 flex items-center justify-center bg-[rgba(23,33,27,.6)] text-xs text-white">
                          ...
                        </span>
                      )}
                    </label>
                    <div>
                      <h2 className="font-bold">Profile</h2>
                      <p className="text-sm text-[var(--muted)]">
                        Click your picture to change it.
                      </p>
                    </div>
                  </div>
                  <label className="block text-sm font-semibold">
                    Display name
                    <input
                      value={accountName}
                      onChange={(event) => setAccountName(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#fbfcf9] px-4 py-3 text-sm font-normal outline-none focus:border-[#75a889]"
                    />
                  </label>
                  <button
                    onClick={saveAccountName}
                    disabled={
                      accountNameBusy ||
                      !accountName.trim() ||
                      accountName.trim() === user
                    }
                    className="mt-4 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {accountNameBusy ? "Saving…" : "Save changes"}
                  </button>
                </section>
                <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
                  <h2 className="font-bold">Account</h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--muted)]">Email</span>
                      <span className="font-medium">
                        {sessionUser?.email || "Local demo account"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--muted)]">Data sync</span>
                      <span
                        className={`font-medium ${cloudLoadError ? "text-amber-700" : "text-[#56856a]"}`}
                      >
                        {cloudLoadError
                          ? "Needs attention"
                          : supabase
                            ? "Supabase cloud"
                            : "This browser only"}
                      </span>
                    </div>
                  </div>
                  {cloudLoadError && (
                    <div className="mt-5 rounded-xl bg-[#fff8ed] p-4 text-sm text-[#8a5a21]">
                      <p>{cloudLoadError}</p>
                      <button
                        onClick={retryCloudSync}
                        className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold"
                      >
                        Retry sync
                      </button>
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-4 text-sm">
                    <a
                      href="/privacy-policy"
                      className="text-[#56856a] hover:underline"
                    >
                      Privacy policy
                    </a>
                    <a
                      href="/terms-of-service"
                      className="text-[#56856a] hover:underline"
                    >
                      Terms of service
                    </a>
                  </div>
                  <button
                    onClick={signOut}
                    className="mt-6 flex items-center gap-2 rounded-xl border border-[#e7c9c9] px-4 py-2.5 text-sm font-semibold text-[#a85454] hover:bg-[#fff5f5]"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </section>
              </div>
            </div>
          )}

          {active === "Routines" && (
            <div className="fade-in">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Routines
                  </h1>
                  <p className="mt-2 text-[var(--muted)]">
                    Your go-to sessions, ready when you are.
                  </p>
                </div>
                <button
                  onClick={saveRoutine}
                  className="flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white"
                >
                  <Plus size={17} />
                  Save routine
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {routines.map((routine) => (
                  <div
                    key={routine.id}
                    className="rounded-2xl border border-[var(--line)] bg-white p-5"
                  >
                    <div className="mb-8 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--mint)]">
                        <Sparkles size={18} />
                      </div>
                      <span className="text-xs text-[var(--muted)]">
                        {routine.exerciseIds.length} exercises
                      </span>
                    </div>
                    <h2 className="font-bold">{routine.name}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {routine.exerciseIds
                        .map(
                          (id) =>
                            allExercises.find((exercise) => exercise.id === id)
                              ?.name,
                        )
                        .join(" · ")}
                    </p>
                    <button
                      onClick={() => useRoutine(routine)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ink)] py-2.5 text-sm font-semibold text-white"
                    >
                      Use routine <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <nav className="fixed bottom-2 left-2 right-2 z-20 flex justify-around rounded-2xl border border-[var(--line)] bg-[#fbfcf9]/95 px-2 py-2 shadow-soft backdrop-blur lg:hidden">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium ${active === label ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <span className="fixed bottom-3 right-4 z-10 hidden text-[10px] font-medium tracking-wide text-[#a1aaa3] lg:block">
        v{APP_VERSION}
      </span>

      {showWorkout && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-[rgba(23,33,27,.3)] p-0 sm:items-center sm:p-5">
          <div className="slide-up max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-[#fbfcf9] p-5 sm:rounded-3xl sm:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[#75a889]">
                  New session
                </p>
                <h2 className="mt-1 text-2xl font-bold">Log your workout</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#eef7ef] px-3 py-2 text-sm font-semibold text-[#56856a]">
                  <Timer size={16} />
                  {formatDuration(workoutElapsed)}
                </div>
                <button
                  onClick={() => {
                    setShowWorkout(false);
                    setWorkoutStartedAt(null);
                    setWorkoutElapsed(0);
                  }}
                className="rounded-full p-2 hover:bg-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--line)] bg-white p-3">
              <span className="mr-1 text-xs font-semibold text-[var(--muted)]">
                Play music
              </span>
              <button
                onClick={() => openMusic("spotify")}
                aria-label="Open Spotify workout music"
                title="Spotify"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4f5e8] text-[#287542] hover:bg-[#d4eedb]"
              >
                <SpotifyIcon />
              </button>
              <button
                onClick={() => openMusic("apple")}
                aria-label="Open Apple Music workout music"
                title="Apple Music"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5e5ed] text-[#9a3f6a] hover:bg-[#eed7e3]"
              >
                <AppleMusicIcon />
              </button>
            </div>
            <div className="space-y-4">
              {selectedExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="rounded-2xl border border-[var(--line)] bg-white p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{exercise.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {exercise.muscle} · {exercise.equipment}
                      </p>
                      {(() => {
                        const previousSet = getPreviousExerciseSet(exercise.id);
                        return (
                          <p className="mt-2 text-xs text-[var(--muted)]">
                            {previousSet
                              ? `Last time: ${previousSet.weight} kg × ${previousSet.reps}`
                              : "No previous entry yet"}
                          </p>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer size={17} className="text-[#75a889]" />
                      <button
                        onClick={() => {
                          setSelectedExercises((current) => current.filter((item) => item.id !== exercise.id));
                          setSets((current) => {
                            const next = { ...current };
                            delete next[exercise.id];
                            return next;
                          });
                        }}
                        className="text-xs font-semibold text-[#a85454]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {(sets[exercise.id] || []).map((set, index) => (
                    <div
                      key={index}
                      className="mb-3 rounded-xl bg-[#f8faf7] p-2"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--muted)]">
                          Set {index + 1}
                        </span>
                        <button
                          onClick={() =>
                            setSets((current) => ({
                              ...current,
                              [exercise.id]: current[exercise.id].map(
                                (item, i) =>
                                  i === index
                                    ? { ...item, done: !item.done }
                                    : item,
                              ),
                            }))
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm ${set.done ? "border-[#75a889] bg-[var(--mint)] text-[#56856a]" : "border-[var(--line)] text-transparent"}`}
                        >
                          ✓
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                            <span>Weight</span>
                            <span>kg</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => adjustSetValue(exercise.id, index, "weight", -2.5)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-lg">−</button>
                            <input
                              inputMode="decimal"
                              value={set.weight}
                              onChange={(event) => updateSetValue(exercise.id, index, "weight", event.target.value)}
                              placeholder="0"
                              aria-label={`Set ${index + 1} weight in kilograms`}
                              className="min-w-0 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-2.5 text-center text-sm font-semibold outline-none focus:border-[#75a889]"
                            />
                            <button onClick={() => adjustSetValue(exercise.id, index, "weight", 2.5)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#b8c9bb] bg-white text-lg text-[#56856a]">+</button>
                          </div>
                          <div className="mt-1 flex gap-1">
                            {[20, 40, 60, 80, 100].map((value) => (
                              <button key={value} onClick={() => updateSetValue(exercise.id, index, "weight", String(value))} className="flex-1 rounded-md bg-white py-1 text-[10px] text-[var(--muted)] hover:bg-[#e4f5e8]">{value}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                            <span>Reps</span>
                            <span>count</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => adjustSetValue(exercise.id, index, "reps", -1)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-lg">−</button>
                            <input
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(event) => updateSetValue(exercise.id, index, "reps", event.target.value)}
                              placeholder="0"
                              aria-label={`Set ${index + 1} repetitions`}
                              className="min-w-0 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-2.5 text-center text-sm font-semibold outline-none focus:border-[#75a889]"
                            />
                            <button onClick={() => adjustSetValue(exercise.id, index, "reps", 1)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#b8c9bb] bg-white text-lg text-[#56856a]">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => removeSet(exercise.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-lg text-[var(--muted)]">−</button>
                    <span className="min-w-16 text-center text-xs text-[var(--muted)]">{(sets[exercise.id] || []).length} sets</span>
                    <button onClick={() => addSet(exercise.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#b8c9bb] text-lg text-[#56856a]">+</button>
                  </div>
                </div>
              ))}
            </div>
            {selectedExercises.length === 0 && (
              <div className="rounded-2xl bg-[#eef7ef] p-8 text-center text-sm text-[var(--muted)]">
                Start by adding the exercises you actually do today.
              </div>
            )}
            <button
              onClick={() => setShowExercisePicker(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b8c9bb] py-3 text-sm font-semibold text-[#56856a]"
            >
              <Plus size={16} />
              Add exercise
            </button>{" "}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={saveRoutine}
                className="flex-1 rounded-xl border border-[var(--line)] bg-white py-3 text-sm font-semibold"
              >
                Save as routine
              </button>
              <button
                onClick={saveWorkout}
                className="flex-1 rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white"
              >
                Finish workout
              </button>
            </div>
          </div>
        </div>
      )}

      {showExercisePicker && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(23,33,27,.3)] p-5">
          <div className="scale-in w-full max-w-lg rounded-3xl bg-[#fbfcf9] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Add exercises</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Pick everything you want to train.
                </p>
              </div>
              <button onClick={() => setShowExercisePicker(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5">
              <Search size={17} className="text-[var(--muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search exercises"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => toggleExercise(exercise)}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-white"
                >
                  <span>
                    <span className="block text-sm font-semibold">
                      {exercise.name}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {exercise.muscle} · {exercise.equipment}
                    </span>
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${selectedExercises.some((item) => item.id === exercise.id) ? "border-[#75a889] bg-[var(--mint)] text-[#56856a]" : "border-[var(--line)] text-transparent"}`}
                  >
                    ✓
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreateExercise(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b8c9bb] py-3 text-sm font-semibold text-[#56856a]"
            >
              <Plus size={16} />
              Create custom exercise
            </button>
            <button
              onClick={() => setShowExercisePicker(false)}
              className="mt-3 w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {showCreateExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,33,27,.3)] p-5">
          <form
            onSubmit={createExercise}
            className="scale-in w-full max-w-md rounded-3xl bg-[#fbfcf9] p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Create exercise</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Add it once and reuse it in future workouts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateExercise(false)}
              >
                <X size={20} />
              </button>
            </div>
            <label className="block text-sm font-semibold">
              Exercise name
              <input
                required
                autoFocus
                value={customExerciseName}
                onChange={(event) => setCustomExerciseName(event.target.value)}
                placeholder="e.g. Incline dumbbell press"
                className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#75a889]"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold">
                Muscle
                <input
                  value={customExerciseMuscle}
                  onChange={(event) =>
                    setCustomExerciseMuscle(event.target.value)
                  }
                  placeholder="Chest"
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#75a889]"
                />
              </label>
              <label className="block text-sm font-semibold">
                Equipment
                <input
                  value={customExerciseEquipment}
                  onChange={(event) =>
                    setCustomExerciseEquipment(event.target.value)
                  }
                  placeholder="Dumbbells"
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#75a889]"
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateExercise(false)}
                className="flex-1 rounded-xl border border-[var(--line)] bg-white py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button className="flex-1 rounded-xl bg-[var(--ink)] py-3 text-sm font-semibold text-white">
                Add exercise
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedWorkout && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(23,33,27,.3)] p-5">
          <div className="scale-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#fbfcf9] p-6 sm:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[#75a889]">{selectedWorkout.date}</p>
                <h2 className="mt-1 text-2xl font-bold">{selectedWorkout.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{selectedWorkout.exercises} exercises · {formatNumber(selectedWorkout.volume)} kg total volume</p>
              </div>
              <button onClick={() => setSelectedWorkout(null)} className="rounded-full p-2 hover:bg-white"><X size={20} /></button>
            </div>
            {(() => {
              const muscleVolume = selectedWorkout.loggedExercises.reduce<Record<string, number>>((result, logged) => {
                const muscle = allExercises.find((exercise) => exercise.id === logged.exerciseId)?.muscle || "Other";
                result[muscle] = (result[muscle] || 0) + logged.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
                return result;
              }, {});
              const total = Object.values(muscleVolume).reduce((sum, value) => sum + value, 0) || 1;
              return (
                <div className="mb-6 rounded-2xl border border-[var(--line)] bg-white p-5">
                  <h3 className="font-bold">Muscle focus</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">Share of this workout&apos;s logged volume</p>
                  <div className="mt-5 space-y-3">
                    {Object.entries(muscleVolume).sort(([, a], [, b]) => b - a).map(([muscle, value]) => {
                      const percentage = Math.round((value / total) * 100);
                      return <div key={muscle}><div className="mb-1 flex justify-between text-xs font-semibold"><span>{muscle}</span><span>{percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf2ed]"><div className="h-full rounded-full bg-[#8fbea0]" style={{ width: `${percentage}%` }} /></div></div>;
                    })}
                  </div>
                </div>
              );
            })()}
            <div className="space-y-3">
              {selectedWorkout.loggedExercises.map((logged) => (
                <div key={logged.exerciseId} className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <div className="flex items-center justify-between"><div><p className="font-semibold">{logged.exerciseName}</p><p className="mt-1 text-xs text-[var(--muted)]">{logged.sets.length} sets · {formatNumber(logged.sets.reduce((sum, set) => sum + set.weight * set.reps, 0))} kg volume</p></div><TrendingUp size={17} className="text-[#75a889]" /></div>
                  <div className="mt-3 flex flex-wrap gap-2">{logged.sets.map((set, index) => <span key={`${logged.exerciseId}-${index}`} className="rounded-lg bg-[#f5f8f4] px-2.5 py-1.5 text-xs text-[var(--muted)]">Set {index + 1}: {set.weight}kg × {set.reps}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
