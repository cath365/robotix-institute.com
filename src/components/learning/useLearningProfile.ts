'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { allLessons, getLevelFromXp, getNextLevelProgress, learningPaths } from '@/lib/learning-data';
import {
  ensureUserProgress,
  onFirebaseUser,
  subscribeToProgress,
  updateProgress,
  type UserProgress,
} from '@/lib/firebase';

const emptyProgress: UserProgress = {
  userId: '',
  xp: 0,
  completedLessonIds: [],
  streak: 0,
  lastActiveDate: new Date().toDateString(),
  level: 'Beginner',
};

function nextStreak(progress: UserProgress): UserProgress {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (progress.lastActiveDate === today) return progress;
  return {
    ...progress,
    streak: progress.lastActiveDate === yesterday ? progress.streak + 1 : 1,
    lastActiveDate: today,
  };
}

export function useLearningProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProgress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribeProgress: (() => void) | undefined;
    let unsubscribeAuth: (() => void) | undefined;
    try {
      unsubscribeAuth = onFirebaseUser(async (nextUser) => {
      setUser(nextUser);
      setReady(false);
      setError('');
      if (!nextUser) {
        setProfile(emptyProgress);
        setReady(true);
        return;
      }

      try {
        const ensured = nextStreak(await ensureUserProgress(nextUser));
        if (ensured.lastActiveDate !== new Date().toDateString()) {
          await updateProgress(ensured);
        }
        unsubscribeProgress?.();
        unsubscribeProgress = subscribeToProgress(nextUser.uid, (progress) => {
          setProfile(progress || ensured);
          setReady(true);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load Firebase progress.');
        setReady(true);
      }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Firebase Auth is unavailable.');
      setReady(true);
    }

    return () => {
      unsubscribeProgress?.();
      unsubscribeAuth?.();
    };
  }, []);

  const completeLesson = useCallback(async (lessonId: string, xp: number) => {
    if (!user || profile.completedLessonIds.includes(lessonId)) return;
    const nextXp = profile.xp + xp;
    await updateProgress({
      ...profile,
      userId: user.uid,
      xp: nextXp,
      completedLessonIds: [...profile.completedLessonIds, lessonId],
      level: getLevelFromXp(nextXp),
      lastActiveDate: new Date().toDateString(),
    });
  }, [profile, user]);

  return useMemo(() => {
    const badges = learningPaths
      .filter((path) => path.lessons.some((lesson) => profile.completedLessonIds.includes(lesson.id)))
      .map((path) => path.badge);
    const nextLesson =
      allLessons.find((lesson) => !profile.completedLessonIds.includes(lesson.id)) || allLessons[0];

    return {
      user,
      profile,
      ready,
      error,
      isAuthenticated: Boolean(user),
      level: getLevelFromXp(profile.xp),
      levelProgress: getNextLevelProgress(profile.xp),
      badges,
      completedCount: profile.completedLessonIds.length,
      totalLessons: allLessons.length,
      nextLesson,
      completeLesson,
    };
  }, [completeLesson, error, profile, ready, user]);
}
