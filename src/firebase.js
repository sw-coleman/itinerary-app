import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCj4ALT1uErwjaVCtuWC8v6DnNf_GFXP-I",
  authDomain: "wayfarer-52b06.firebaseapp.com",
  projectId: "wayfarer-52b06",
  storageBucket: "wayfarer-52b06.firebasestorage.app",
  messagingSenderId: "306807647229",
  appId: "1:306807647229:web:470022f547840b7a990794",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
