import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Validates connection to Firestore on boot as per Firebase Integration Skill constraint.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore connection check: Client is offline. Please check network/config.");
    }
    return false;
  }
}

// Run non-blocking connection check on startup
testFirestoreConnection().catch(() => {});
