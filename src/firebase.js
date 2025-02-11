import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getPerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyBcK1PxcfeHcjYSRYZBcoeJjcpUTSE9IFY",
  authDomain: "collabspace-95883.firebaseapp.com",
  databaseURL: "https://collabspace-95883-default-rtdb.firebaseio.com",
  projectId: "collabspace-95883",
  storageBucket: "collabspace-95883.firebasestorage.app",
  messagingSenderId: "75552492225",
  appId: "1:75552492225:web:54f38ffb7e4ef28b0ee240"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  console.error("Firestore offline persistence failed:", err);
});

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  getPerformance(app);
}

// Optional: Configure Firestore cache size
// db.settings({
//   cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
// });

// Optional: Enable long polling for Firestore in environments with restrictive firewall settings
// db.enablePersistence({ experimentalForceOwningTab: true })
//   .catch((err) => {
//     console.error('Error enabling multi-tab persistence:', err);
//   });