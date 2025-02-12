import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getPerformance } from "firebase/performance";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBcK1PxcfeHcjYSRYZBcoeJjcpUTSE9IFY",
  authDomain: "collabspace-95883.firebaseapp.com",
  databaseURL: "https://collabspace-95883-default-rtdb.firebaseio.com",
  projectId: "collabspace-95883",
  storageBucket: "collabspace-95883.appspot.com",
  messagingSenderId: "75552492225",
  appId: "1:75552492225:web:54f38ffb7e4ef28b0ee240"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

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