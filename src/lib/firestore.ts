import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import bcrypt from "bcryptjs";

// ─── USERS ───────────────────────────────────────────────────────────

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "designer" | "buyer";
  created_at: Timestamp;
}

export async function signupUser(
  name: string,
  email: string,
  password: string,
  role: "designer" | "buyer" = "designer"
): Promise<UserDoc> {
  // Check if email already exists
  const q = query(collection(db, "users"), where("email", "==", email));
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error("An account with this email already exists");

  const password_hash = await bcrypt.hash(password, 10);
  const docRef = await addDoc(collection(db, "users"), {
    name,
    email,
    password_hash,
    role,
    created_at: serverTimestamp(),
  });
  return {
    id: docRef.id,
    name,
    email,
    password_hash,
    role,
    created_at: Timestamp.now(),
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<UserDoc> {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No account found with this email");

  const userDoc = snap.docs[0];
  const data = userDoc.data();
  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) throw new Error("Incorrect password");

  return { id: userDoc.id, ...data } as UserDoc;
}

// ─── MODELS ──────────────────────────────────────────────────────────

export interface ModelDoc {
  id: string;
  user_id: string;
  model_name: string;
  status: "trained";
  accuracy: number;
  dataset_size: number;
  created_at: Timestamp;
}

export async function createModel(
  userId: string,
  modelName: string,
  datasetSize: number
): Promise<ModelDoc> {
  const accuracy = Math.floor(Math.random() * 16) + 80; // 80–95
  const docRef = await addDoc(collection(db, "models"), {
    user_id: userId,
    model_name: modelName,
    status: "trained",
    accuracy,
    dataset_size: datasetSize,
    created_at: serverTimestamp(),
  });
  return {
    id: docRef.id,
    user_id: userId,
    model_name: modelName,
    status: "trained",
    accuracy,
    dataset_size: datasetSize,
    created_at: Timestamp.now(),
  };
}

export async function getUserModels(userId: string): Promise<ModelDoc[]> {
  const q = query(
    collection(db, "models"),
    where("user_id", "==", userId),
    orderBy("created_at", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ModelDoc));
}

// ─── TRAINING DATA ───────────────────────────────────────────────────

export interface TrainingDataDoc {
  id: string;
  model_id: string;
  file_url: string;
  uploaded_at: Timestamp;
}

export async function saveTrainingData(
  modelId: string,
  fileUrls: string[]
): Promise<TrainingDataDoc[]> {
  const results: TrainingDataDoc[] = [];
  for (const file_url of fileUrls) {
    const docRef = await addDoc(collection(db, "training_data"), {
      model_id: modelId,
      file_url,
      uploaded_at: serverTimestamp(),
    });
    results.push({
      id: docRef.id,
      model_id: modelId,
      file_url,
      uploaded_at: Timestamp.now(),
    });
  }
  return results;
}

// ─── LOCAL FILE HELPERS (avoids Firebase Storage CORS) ───────────────

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function filesToDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(files.map(fileToDataUrl));
}

// ─── ASSETS ──────────────────────────────────────────────────────────

export interface AssetDoc {
  id: string;
  model_id: string;
  user_id: string;
  title: string;
  image_url: string;
  price: number;
  designer_name?: string;
  category?: string;
  style?: string;
  description?: string;
  created_at: Timestamp;
}

export async function createAsset(data: {
  model_id: string;
  user_id: string;
  title: string;
  image_url: string;
  price: number;
  designer_name?: string;
  category?: string;
  style?: string;
  description?: string;
}): Promise<AssetDoc> {
  const docRef = await addDoc(collection(db, "assets"), {
    ...data,
    created_at: serverTimestamp(),
  });
  return {
    id: docRef.id,
    ...data,
    created_at: Timestamp.now(),
  };
}

export async function getAllAssets(): Promise<AssetDoc[]> {
  const q = query(collection(db, "assets"), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AssetDoc));
}

export async function getAssetById(assetId: string): Promise<AssetDoc | null> {
  const docSnap = await getDoc(doc(db, "assets", assetId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as AssetDoc;
}

export async function getUserAssets(userId: string): Promise<AssetDoc[]> {
  const q = query(
    collection(db, "assets"),
    where("user_id", "==", userId),
    orderBy("created_at", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AssetDoc));
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────

export interface TransactionDoc {
  id: string;
  user_id: string;
  asset_id: string;
  amount: number;
  status: "success";
  created_at: Timestamp;
}

export async function createTransaction(data: {
  user_id: string;
  asset_id: string;
  amount: number;
}): Promise<TransactionDoc> {
  const docRef = await addDoc(collection(db, "transactions"), {
    ...data,
    status: "success",
    created_at: serverTimestamp(),
  });
  return {
    id: docRef.id,
    ...data,
    status: "success",
    created_at: Timestamp.now(),
  };
}

export async function getUserTransactions(
  userId: string
): Promise<TransactionDoc[]> {
  const q = query(
    collection(db, "transactions"),
    where("user_id", "==", userId),
    orderBy("created_at", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TransactionDoc));
}

export async function isAssetPurchased(
  userId: string,
  assetId: string
): Promise<boolean> {
  const q = query(
    collection(db, "transactions"),
    where("user_id", "==", userId),
    where("asset_id", "==", assetId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─── REQUESTS ────────────────────────────────────────────────────────

export interface RequestDoc {
  id: string;
  user_id: string;
  asset_id: string;
  message: string;
  status: "pending";
  created_at: Timestamp;
}

export async function createRequest(data: {
  user_id: string;
  asset_id: string;
  message: string;
}): Promise<RequestDoc> {
  const docRef = await addDoc(collection(db, "requests"), {
    ...data,
    status: "pending",
    created_at: serverTimestamp(),
  });
  return {
    id: docRef.id,
    ...data,
    status: "pending",
    created_at: Timestamp.now(),
  };
}

export async function getRequestsForAssets(
  assetIds: string[]
): Promise<RequestDoc[]> {
  if (assetIds.length === 0) return [];
  // Firestore 'in' queries support max 30 items
  const chunks: string[][] = [];
  for (let i = 0; i < assetIds.length; i += 30) {
    chunks.push(assetIds.slice(i, i + 30));
  }
  const results: RequestDoc[] = [];
  for (const chunk of chunks) {
    const q = query(
      collection(db, "requests"),
      where("asset_id", "in", chunk)
    );
    const snap = await getDocs(q);
    results.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequestDoc)));
  }
  return results;
}
