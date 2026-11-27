import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  logSaathiAnalyticsEvent,
} from '../firebase';
import { AbVariant, Language, PeerSolution, ScreenId, TelemetryEvent } from '../types';

export const ADMIN_BOOTSTRAP_EMAIL = 'suryaaru918@gmail.com';

export function isAdminUser(user: User | null): boolean {
  return Boolean(user?.emailVerified && user.email === ADMIN_BOOTSTRAP_EMAIL);
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

function sanitizeId(raw: string, fallback: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned || fallback;
}

function clampStr(value: string, maxLen: number, fallback = ''): string {
  const trimmed = (value || fallback).trim();
  return (trimmed || fallback).slice(0, maxLen);
}

export async function syncTeacherProfileToFirestore(params: {
  user: User;
  displayName: string;
  blockDistrict: string;
  phoneMasked?: string;
  xp: number;
  streakDays: number;
  solutionsCount: number;
  weeksDoneCount: number;
}): Promise<void> {
  if (!params.user.emailVerified) return;
  const uid = sanitizeId(params.user.uid, 'user');
  const userPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/info`;

  try {
    const userRef = doc(db, 'users', uid);
    const existing = await getDoc(userRef);

    if (!existing.exists()) {
      await setDoc(userRef, {
        uid,
        displayName: clampStr(params.displayName, 80, 'Teacher Saathi'),
        blockDistrict: clampStr(params.blockDistrict, 80, 'Barabanki'),
        xp: Math.max(0, Math.min(100000, Math.round(params.xp))),
        streakDays: Math.max(0, Math.min(3650, Math.round(params.streakDays))),
        solutionsCount: Math.max(0, Math.min(10000, Math.round(params.solutionsCount))),
        weeksDoneCount: Math.max(0, Math.min(1000, Math.round(params.weeksDoneCount))),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        displayName: clampStr(params.displayName, 80, 'Teacher Saathi'),
        blockDistrict: clampStr(params.blockDistrict, 80, 'Barabanki'),
        xp: Math.max(0, Math.min(100000, Math.round(params.xp))),
        streakDays: Math.max(0, Math.min(3650, Math.round(params.streakDays))),
        solutionsCount: Math.max(0, Math.min(10000, Math.round(params.solutionsCount))),
        weeksDoneCount: Math.max(0, Math.min(1000, Math.round(params.weeksDoneCount))),
        updatedAt: serverTimestamp(),
      });
    }

    const privateRef = doc(db, 'users', uid, 'private', 'info');
    await setDoc(
      privateRef,
      {
        uid,
        ...(params.phoneMasked ? { phoneMasked: clampStr(params.phoneMasked, 20) } : {}),
        ...(params.user.email ? { email: clampStr(params.user.email, 160) } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const leaderboardRef = doc(db, 'leaderboard', uid);
    const lbExisting = await getDoc(leaderboardRef);
    const lbPayload = {
      uid,
      displayName: clampStr(params.displayName, 80, 'Teacher Saathi'),
      blockDistrict: clampStr(params.blockDistrict, 80, 'Barabanki'),
      xp: Math.max(0, Math.min(100000, Math.round(params.xp))),
      streakDays: Math.max(0, Math.min(3650, Math.round(params.streakDays))),
      weeksDoneCount: Math.max(0, Math.min(1000, Math.round(params.weeksDoneCount))),
      solutionsCount: Math.max(0, Math.min(10000, Math.round(params.solutionsCount))),
      isPublic: true,
      updatedAt: serverTimestamp(),
    };
    if (!lbExisting.exists()) {
      await setDoc(leaderboardRef, { ...lbPayload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(leaderboardRef, lbPayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${userPath} / ${privatePath}`);
  }
}

export interface CloudLeaderboardRow {
  uid: string;
  displayName: string;
  blockDistrict: string;
  xp: number;
  streakDays: number;
  weeksDoneCount: number;
  solutionsCount: number;
}

export async function fetchLeaderboardFromFirestore(
  user: User | null
): Promise<CloudLeaderboardRow[]> {
  if (!user || !user.emailVerified) return [];
  const path = 'leaderboard';

  try {
    const q = query(
      collection(db, path),
      where('isPublic', '==', true),
      orderBy('xp', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: String(data.uid ?? d.id),
        displayName: String(data.displayName ?? 'Teacher Saathi'),
        blockDistrict: String(data.blockDistrict ?? 'Barabanki'),
        xp: Number(data.xp ?? 0),
        streakDays: Number(data.streakDays ?? 0),
        weeksDoneCount: Number(data.weeksDoneCount ?? 0),
        solutionsCount: Number(data.solutionsCount ?? 0),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveSolutionToFirestore(params: {
  user: User | null;
  solutionId: string;
  authorName: string;
  blockDistrict: string;
  themeId: string;
  method: 'voice' | 'text';
  summary: string;
  transcript: string;
  durationSec: number;
}): Promise<boolean> {
  if (!params.user || !params.user.emailVerified) return false;

  const docId = sanitizeId(params.solutionId, `sol_${Date.now()}`);
  const path = `solutions/${docId}`;

  try {
    await setDoc(doc(db, 'solutions', docId), {
      authorUid: params.user.uid,
      authorName: clampStr(params.authorName, 80, 'Teacher Saathi'),
      blockDistrict: clampStr(params.blockDistrict, 80, 'Your Block'),
      themeId: clampStr(params.themeId, 64, 'multi-age'),
      method: params.method,
      summary: clampStr(params.summary, 200, 'Classroom solution shared'),
      transcript: clampStr(params.transcript, 1000, 'Classroom solution shared'),
      durationSec: Math.max(0, Math.min(600, Math.round(params.durationSec))),
      helpfulCount: 0,
      isPublic: true,
      prototypeData: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function recordTelemetryEventToFirestore(params: {
  user: User | null;
  event: TelemetryEvent;
  lang: Language;
  themeId?: string;
}): Promise<void> {
  void logSaathiAnalyticsEvent(params.event.eventType, {
    screen: params.event.screen,
    variant: params.event.variant,
    lang: params.lang,
    ...(params.themeId ? { themeId: params.themeId } : {}),
  });

  if (!params.user || !params.user.emailVerified) return;

  const docId = sanitizeId(params.event.id, `evt_${Date.now()}`);
  const path = `telemetryEvents/${docId}`;

  try {
    await setDoc(doc(db, 'telemetryEvents', docId), {
      uid: params.user.uid,
      sessionId: clampStr(params.event.sessionId ?? 'session', 80, 'session'),
      variant: params.event.variant,
      eventType: clampStr(params.event.eventType, 64, 'event'),
      screen: clampStr(params.event.screen, 32, 'map'),
      ...(params.themeId ? { themeId: clampStr(params.themeId, 64) } : {}),
      lang: params.lang,
      prototypeData: true,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveFeedbackNoteToFirestore(params: {
  user: User | null;
  sentiment: 'yes' | 'somewhat' | 'no';
  note?: string;
}): Promise<boolean> {
  if (!params.user || !params.user.emailVerified) return false;
  const docId = sanitizeId(`fb_${params.user.uid}_${Date.now()}`, `fb_${Date.now()}`);
  const path = `feedbackNotes/${docId}`;

  try {
    await setDoc(doc(db, 'feedbackNotes', docId), {
      authorUid: params.user.uid,
      sentiment: params.sentiment,
      ...(params.note ? { note: clampStr(params.note, 500) } : {}),
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchPublicSolutionsFromFirestore(
  user: User | null
): Promise<PeerSolution[]> {
  if (!user || !user.emailVerified) return [];
  const path = 'solutions';

  try {
    const q = query(
      collection(db, path),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        themeId: String(data.themeId ?? 'multi-age'),
        teacherName: {
          hi: String(data.authorName ?? 'शिक्षक साथी'),
          en: String(data.authorName ?? 'Teacher Saathi'),
        },
        blockDistrict: {
          hi: String(data.blockDistrict ?? 'ब्लॉक'),
          en: String(data.blockDistrict ?? 'Block'),
        },
        avatarUrl: '/src/assets/images/teacher_avatar_sunita_1795606670313.jpg',
        audioDurationSec: Number(data.durationSec ?? 25),
        summary: {
          hi: String(data.summary ?? ''),
          en: String(data.summary ?? ''),
        },
        transcript: {
          hi: String(data.transcript ?? ''),
          en: String(data.transcript ?? ''),
        },
        helpfulCount: Number(data.helpfulCount ?? 0),
        isUserSubmitted: true,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export interface TeamCloudSummary {
  totalEvents: number;
  totalSolutions: number;
  readAloudCount: number;
  winMomentsCount: number;
  whatsappSharesCount: number;
  voiceCompletedCount: number;
  variantACount: number;
  variantBCount: number;
  recentEvents: {
    id: string;
    eventType: string;
    screen: ScreenId;
    variant: AbVariant;
    lang: Language;
  }[];
}

export async function fetchTeamCloudSummary(user: User | null): Promise<TeamCloudSummary | null> {
  if (!user || !user.emailVerified) return null;
  const admin = isAdminUser(user);

  try {
    const eventsQuery = admin
      ? query(collection(db, 'telemetryEvents'), orderBy('createdAt', 'desc'), limit(120))
      : query(
          collection(db, 'telemetryEvents'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(120)
        );
    const solQuery = query(
      collection(db, 'solutions'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(60)
    );

    const [eventsSnap, solSnap] = await Promise.all([getDocs(eventsQuery), getDocs(solQuery)]);

    let readAloudCount = 0;
    let winMomentsCount = 0;
    let whatsappSharesCount = 0;
    let voiceCompletedCount = 0;
    let variantACount = 0;
    let variantBCount = 0;

    const recentEvents = eventsSnap.docs.map((docSnap) => {
      const d = docSnap.data();
      const eventType = String(d.eventType ?? 'event');
      const variant = (d.variant === 'A' ? 'A' : 'B') as AbVariant;

      if (eventType === 'read_aloud_used') readAloudCount += 1;
      if (eventType === 'win_moment_triggered') winMomentsCount += 1;
      if (eventType === 'whatsapp_share_clicked') whatsappSharesCount += 1;
      if (eventType === 'voice_recording_completed') voiceCompletedCount += 1;
      if (variant === 'A') variantACount += 1;
      else variantBCount += 1;

      return {
        id: docSnap.id,
        eventType,
        screen: String(d.screen ?? 'map') as ScreenId,
        variant,
        lang: (d.lang === 'en' ? 'en' : 'hi') as Language,
      };
    });

    return {
      totalEvents: eventsSnap.size,
      totalSolutions: solSnap.size,
      readAloudCount,
      winMomentsCount,
      whatsappSharesCount,
      voiceCompletedCount,
      variantACount,
      variantBCount,
      recentEvents: recentEvents.slice(0, 12),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'telemetryEvents');
  }
}
