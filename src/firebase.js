import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcK1PxcfeHcjYSRYZBcoeJjcpUTSE9IFY",
  authDomain: "collabspace-95883.firebaseapp.com",
  projectId: "collabspace-95883",
  storageBucket: "collabspace-95883.firebasestorage.app",
  messagingSenderId: "75552492225",
  appId: "1:75552492225:web:54f38ffb7e4ef28b0ee240"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence (optional)
// enableIndexedDbPersistence(db).catch((err) => {
//   console.error("Failed to enable offline persistence:", err);
// });