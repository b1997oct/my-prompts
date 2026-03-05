import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Prefer environment variables in real projects; this is a simple demo setup.
const firebaseConfig = {
  apiKey: "AIzaSyD3fZuBvZEGrnVTAf99hd2usdJMAPf24xc",
  authDomain: "first-app-f4060.firebaseapp.com",
  projectId: "first-app-f4060",
  storageBucket: "first-app-f4060.firebasestorage.app",
  messagingSenderId: "158699882700",
  appId: "1:158699882700:web:90b1c86a0367d734715a69",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Avoid re-initializing in environments that preserve module state (e.g. HMR)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = globalThis as any;

if (!globalAny.__FIREBASE_CLIENT__) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  globalAny.__FIREBASE_CLIENT__ = { app, auth, db };
} else {
  ({ app, auth, db } = globalAny.__FIREBASE_CLIENT__);
}

export { app, auth, db };