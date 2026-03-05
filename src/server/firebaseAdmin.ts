import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = "first-app-f4060";

const getAdminApp = (): App => {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  // Set environment variables for underlying Google libraries
  process.env.GOOGLE_CLOUD_PROJECT = PROJECT_ID;
  process.env.GCLOUD_PROJECT = PROJECT_ID;

  if (serviceAccountJson) {
    try {
      return initializeApp({
        credential: cert(JSON.parse(serviceAccountJson)),
        projectId: PROJECT_ID,
      });
    } catch (e) {
      console.error("[Firebase Admin] Service account parse failed, falling back to default.");
    }
  }

  return initializeApp({ projectId: PROJECT_ID });
};

export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

// Force Firestore settings
try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch (e) {}
