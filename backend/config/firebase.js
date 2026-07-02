const admin = require('firebase-admin');

// Initializes Firebase Admin so the backend can verify the ID token that the
// frontend gets from Firebase after a "Sign in with Google" popup.
// Uses three separate env vars instead of a JSON key file so it's easy to
// paste into any host's environment variable settings (Render, Railway, etc).
let initialized = false;

const initFirebase = () => {
  if (initialized) return;
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn('⚠️  Firebase env vars not set — Google sign-in will not work until FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are configured in backend/.env');
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // Private keys from .env files store newlines as literal "\n" — swap
        // them back to real newlines or Firebase will reject the key.
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    initialized = true;
    console.log('Firebase Admin initialized');
  } catch (err) {
    // Never let a bad/placeholder Firebase key take down the whole server —
    // Google sign-in just stays disabled (with a clear error on that one
    // endpoint) while everything else keeps working normally.
    console.warn('⚠️  Firebase Admin failed to initialize (Google sign-in disabled):', err.message);
  }
};

module.exports = { admin, initFirebase };

module.exports = { admin, initFirebase };
