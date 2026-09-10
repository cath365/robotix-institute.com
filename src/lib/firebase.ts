'use client';

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Firestore,
  type Timestamp,
} from 'firebase/firestore';
import { sanitizeText } from '@/lib/utils';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const apiKeyLooksValid =
  typeof firebaseConfig.apiKey === 'string' &&
  /^AIza[0-9A-Za-z_-]{20,}$/.test(firebaseConfig.apiKey);

const firebaseConfigured =
  apiKeyLooksValid &&
  Boolean(firebaseConfig.authDomain) &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.appId);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;
let persistenceConfigured = false;

function firebaseConfigMessage() {
  if (!firebaseConfig.apiKey) {
    return 'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values to .env.local.';
  }
  if (!apiKeyLooksValid) {
    return 'Firebase API key is missing or invalid. Update NEXT_PUBLIC_FIREBASE_API_KEY with a real web API key.';
  }
  return 'Firebase is not configured. Check NEXT_PUBLIC_FIREBASE_* values in .env.local.';
}

export function isFirebaseConfigured() {
  return firebaseConfigured;
}

export function assertFirebaseConfigured() {
  if (!firebaseConfigured) {
    throw new Error(firebaseConfigMessage());
  }
}

function getFirebaseApp() {
  assertFirebaseConfigured();
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

function getFirebaseAuthInstance() {
  assertFirebaseConfigured();
  if (!firebaseAuth) {
    try {
      firebaseAuth = getAuth(getFirebaseApp());
      if (typeof window !== 'undefined' && !persistenceConfigured) {
        persistenceConfigured = true;
        setPersistence(firebaseAuth, browserLocalPersistence).catch(() => undefined);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : firebaseConfigMessage());
    }
  }
  return firebaseAuth;
}

function getFirestoreInstance() {
  assertFirebaseConfigured();
  if (!firebaseDb) {
    try {
      firebaseDb = getFirestore(getFirebaseApp());
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : firebaseConfigMessage());
    }
  }
  return firebaseDb;
}

export interface UserProgress {
  userId: string;
  xp: number;
  completedLessonIds: string[];
  streak: number;
  lastActiveDate: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  updatedAt?: Timestamp;
}

export interface FirebaseProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'AI' | 'Arduino' | 'Programming' | 'Game';
  code: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LeaderboardScore {
  id: string;
  userId: string;
  displayName: string;
  game: 'memory' | 'coding-puzzle' | 'signal-sprint';
  score: number;
  updatedAt?: Timestamp;
}

export interface WeekendClassLeadInput {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  childAge: string;
  childSchool: string;
  preferredTrack: string;
  preferredSchedule: string;
  notes?: string;
}

export interface WeekendClassLead extends WeekendClassLeadInput {
  id: string;
  status?: string;
  adminNotes?: string | null;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  source?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactMessage extends ContactMessageInput {
  id: string;
  status?: string;
  adminNotes?: string | null;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  source?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export function onFirebaseUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuthInstance(), callback);
}

export async function signInWithFirebaseEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuthInstance(), sanitizeText(email, 120), password);
}

export async function registerWithFirebaseEmail(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuthInstance(),
    sanitizeText(input.email, 120).toLowerCase(),
    input.password
  );
  const displayName = `${sanitizeText(input.firstName, 60)} ${sanitizeText(input.lastName, 60)}`.trim();
  await updateProfile(credential.user, { displayName });
  // Do not strand a newly created Auth account if Firestore is not provisioned yet.
  await ensureUserProgress(credential.user).catch(() => undefined);
  return credential;
}

export async function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuthInstance(), new GoogleAuthProvider());
}

export async function signOutFirebase() {
  return signOut(getFirebaseAuthInstance());
}

export async function sendFirebasePasswordReset(email: string) {
  return sendPasswordResetEmail(getFirebaseAuthInstance(), sanitizeText(email, 120).toLowerCase());
}

export function sanitizeProject(project: Omit<FirebaseProject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  return {
    title: sanitizeText(project.title, 80),
    description: sanitizeText(project.description, 240),
    type: project.type,
    code: sanitizeText(project.code, 4000),
  };
}

export async function ensureUserProgress(user: User): Promise<UserProgress> {
  const db = getFirestoreInstance();
  const ref = doc(db, 'progress', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProgress;

  const initial: UserProgress = {
    userId: user.uid,
    xp: 0,
    completedLessonIds: [],
    streak: 1,
    lastActiveDate: new Date().toDateString(),
    level: 'Beginner',
  };
  await setDoc(ref, { ...initial, updatedAt: serverTimestamp() });
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    displayName: user.displayName || user.email || 'Robotix Student',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return initial;
}

export function subscribeToProgress(userId: string, callback: (progress: UserProgress | null) => void) {
  const db = getFirestoreInstance();
  return onSnapshot(doc(db, 'progress', userId), (snap) => {
    callback(snap.exists() ? snap.data() as UserProgress : null);
  });
}

export async function updateProgress(progress: UserProgress) {
  const db = getFirestoreInstance();
  await setDoc(doc(db, 'progress', progress.userId), {
    ...progress,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function saveProjectToFirebase(
  userId: string,
  project: Omit<FirebaseProject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  projectId?: string
) {
  const db = getFirestoreInstance();
  const clean = sanitizeProject(project);
  const id = projectId || crypto.randomUUID();
  const ref = doc(db, 'projects', id);
  await setDoc(ref, {
    ...clean,
    userId,
    updatedAt: serverTimestamp(),
    ...(projectId ? {} : { createdAt: serverTimestamp() }),
  }, { merge: true });
  return id;
}

export async function deleteProjectFromFirebase(projectId: string) {
  const db = getFirestoreInstance();
  await deleteDoc(doc(db, 'projects', projectId));
}

export function subscribeToProjects(userId: string, callback: (projects: FirebaseProject[]) => void) {
  const db = getFirestoreInstance();
  const q = query(collection(db, 'projects'), where('userId', '==', userId), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((projectDoc) => ({ id: projectDoc.id, ...projectDoc.data() } as FirebaseProject)));
  });
}

export async function saveLeaderboardScore(score: Omit<LeaderboardScore, 'id' | 'updatedAt'>) {
  const db = getFirestoreInstance();
  const id = `${score.game}_${score.userId}`;
  const ref = doc(db, 'leaderboardScores', id);
  const current = await getDoc(ref);
  const currentScore = current.exists() ? Number(current.data().score || 0) : 0;
  if (score.score < currentScore) return;
  await setDoc(ref, {
    ...score,
    displayName: sanitizeText(score.displayName, 80),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeToLeaderboard(callback: (scores: LeaderboardScore[]) => void) {
  const db = getFirestoreInstance();
  const q = query(collection(db, 'leaderboardScores'), orderBy('score', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((scoreDoc) => ({ id: scoreDoc.id, ...scoreDoc.data() } as LeaderboardScore)));
  });
}

export async function saveWeekendClassLead(lead: WeekendClassLeadInput) {
  const clean = {
    parentName: sanitizeText(lead.parentName, 80),
    parentEmail: sanitizeText(lead.parentEmail, 120),
    parentPhone: sanitizeText(lead.parentPhone, 40),
    childName: sanitizeText(lead.childName, 80),
    childAge: sanitizeText(lead.childAge, 20),
    childSchool: sanitizeText(lead.childSchool, 120),
    preferredTrack: sanitizeText(lead.preferredTrack, 80),
    preferredSchedule: sanitizeText(lead.preferredSchedule, 80),
    notes: sanitizeText(lead.notes || '', 800),
  };

  if (firebaseConfigured) {
    const db = getFirestoreInstance();
    const id = crypto.randomUUID();
    await setDoc(doc(db, 'weekendClassLeads', id), {
      ...clean,
      source: 'weekend-classes-page',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { storage: 'firebase' as const, id };
  }

  if (typeof window === 'undefined') {
    throw new Error(firebaseConfigMessage());
  }

  const id = crypto.randomUUID();
  const inbox = JSON.parse(window.localStorage.getItem('robotix-weekend-class-signups') || '[]');
  inbox.push({
    id,
    ...clean,
    source: 'weekend-classes-page',
    createdAt: new Date().toISOString(),
  });
  window.localStorage.setItem('robotix-weekend-class-signups', JSON.stringify(inbox));
  return { storage: 'local' as const, id };
}

export function subscribeToWeekendClassLeads(callback: (leads: WeekendClassLead[]) => void) {
  const db = getFirestoreInstance();
  const q = query(collection(db, 'weekendClassLeads'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((leadDoc) => ({ id: leadDoc.id, ...leadDoc.data() } as WeekendClassLead)));
  });
}

export async function saveContactMessage(message: ContactMessageInput) {
  const clean = {
    name: sanitizeText(message.name, 80),
    email: sanitizeText(message.email, 120).toLowerCase(),
    subject: sanitizeText(message.subject || '', 120),
    message: sanitizeText(message.message, 4000),
  };

  if (firebaseConfigured) {
    const db = getFirestoreInstance();
    const id = crypto.randomUUID();
    await setDoc(doc(db, 'contactMessages', id), {
      ...clean,
      status: 'NEW',
      source: 'website-contact-form',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { storage: 'firebase' as const, id };
  }

  if (typeof window === 'undefined') {
    throw new Error(firebaseConfigMessage());
  }

  const id = crypto.randomUUID();
  const inbox = JSON.parse(window.localStorage.getItem('robotix-contact-inbox') || '[]');
  inbox.push({
    id,
    ...clean,
    status: 'NEW',
    source: 'website-contact-form',
    createdAt: new Date().toISOString(),
  });
  window.localStorage.setItem('robotix-contact-inbox', JSON.stringify(inbox));
  return { storage: 'local' as const, id };
}

export function subscribeToContactMessages(callback: (messages: ContactMessage[]) => void) {
  const db = getFirestoreInstance();
  const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((messageDoc) => ({ id: messageDoc.id, ...messageDoc.data() } as ContactMessage)));
  });
}
