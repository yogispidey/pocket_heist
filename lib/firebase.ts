import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUtxkTQ5b6tLiV7pytSsGyDT_BkqBQI1Y",
  authDomain: "pocket-heist-website-yog-e525f.firebaseapp.com",
  projectId: "pocket-heist-website-yog-e525f",
  storageBucket: "pocket-heist-website-yog-e525f.firebasestorage.app",
  messagingSenderId: "432082917438",
  appId: "1:432082917438:web:f4a6eb6e4cc76948c0596f",
  measurementId: "G-N2MDH7XWGD",
};

// prevent re-initialisation in Next.js hot reloads
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export default app;
