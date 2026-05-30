import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkjt3Nk3o7K7khBgfz36Xf5Owl7YT4PHk",
  authDomain: "mechanzo-ide.firebaseapp.com",
  projectId: "mechanzo-ide",
  storageBucket: "mechanzo-ide.firebasestorage.app",
  messagingSenderId: "12685296437",
  appId: "1:12685296437:web:c24cfaf155c3f26b4c027c",
  measurementId: "G-5N1RLY3LP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export { onAuthStateChanged, doc, setDoc, getDoc };