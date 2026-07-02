import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Only initialize once Firebase env vars are actually present, so the app
// doesn't crash for anyone who hasn't set up Firebase yet — the Google
// sign-in button will just show a friendly "not configured" message instead.
export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let auth = null;
let googleProvider = null;

if (firebaseReady) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} else {
  console.warn('⚠️  Firebase env vars not set — Google sign-in is disabled until you configure REACT_APP_FIREBASE_* in frontend/.env');
}

export { auth, googleProvider };
