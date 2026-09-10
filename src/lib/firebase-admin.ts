import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getAdminApp() {
  if (getApps().length) return getApps()[0]!;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured.');
  const hasApplicationCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  return initializeApp({
    projectId,
    ...(hasApplicationCredentials ? { credential: applicationDefault() } : {}),
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getAdminApp());
}

export function getFirebaseRole(email: string | undefined, tokenRole: unknown) {
  const normalizedEmail = email?.trim().toLowerCase() || '';
  const adminEmails = new Set(
    (process.env.FIREBASE_ADMIN_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
  );
  if (adminEmails.has(normalizedEmail)) return 'ADMIN' as const;
  if (tokenRole === 'INSTRUCTOR' || tokenRole === 'ACCOUNTANT') return tokenRole;
  return 'STUDENT' as const;
}
