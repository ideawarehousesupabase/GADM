import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  signupUser,
  loginUser,
  getUserModels,
  getUserTransactions,
  getUserAssets,
  ModelDoc,
  TransactionDoc,
  AssetDoc,
} from "@/lib/firestore";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "designer" | "buyer";
}

export interface TrainedModel {
  id: string;
  name: string;
  style: string;
  description?: string;
  preview: string;
  createdAt: number;
  accuracy?: number;
  dataset_size?: number;
}

interface AppContextType {
  user: AuthUser | null;
  loading: boolean;
  signup: (name: string, email: string, password: string, role: "designer" | "buyer") => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  purchased: string[];
  addPurchased: (assetId: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  models: TrainedModel[];
  addModel: (m: TrainedModel) => void;
  refreshModels: () => Promise<void>;
  refreshPurchased: () => Promise<void>;
  transactions: TransactionDoc[];
  myAssets: AssetDoc[];
  refreshMyAssets: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [models, setModels] = useState<TrainedModel[]>([]);
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [myAssets, setMyAssets] = useState<AssetDoc[]>([]);

  // Restore user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("gadm_user");
    const f = localStorage.getItem("gadm_favs");
    if (stored) {
      try {
        const u = JSON.parse(stored) as AuthUser;
        setUser(u);
      } catch {
        localStorage.removeItem("gadm_user");
      }
    }
    if (f) {
      try { setFavorites(JSON.parse(f)); } catch {}
    }
    setLoading(false);
  }, []);

  // When user changes, load their data from Firestore
  useEffect(() => {
    if (user) {
      refreshModels();
      refreshPurchased();
      refreshMyAssets();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const signup = async (name: string, email: string, password: string, role: "designer" | "buyer") => {
    const userDoc = await signupUser(name, email, password, role);
    const authUser: AuthUser = {
      id: userDoc.id,
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
    };
    setUser(authUser);
    localStorage.setItem("gadm_user", JSON.stringify(authUser));
  };

  const login = async (email: string, password: string) => {
    const userDoc = await loginUser(email, password);
    const authUser: AuthUser = {
      id: userDoc.id,
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
    };
    setUser(authUser);
    localStorage.setItem("gadm_user", JSON.stringify(authUser));
  };

  const logout = () => {
    setUser(null);
    setPurchased([]);
    setFavorites([]);
    setModels([]);
    setTransactions([]);
    setMyAssets([]);
    localStorage.removeItem("gadm_user");
    localStorage.removeItem("gadm_favs");
    try { sessionStorage.clear(); } catch {}
  };

  const addPurchased = (assetId: string) => {
    if (!purchased.includes(assetId)) {
      setPurchased((prev) => [...prev, assetId]);
    }
  };

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("gadm_favs", JSON.stringify(next));
  };

  const addModel = (m: TrainedModel) => {
    setModels((prev) => [m, ...prev]);
  };

  const refreshModels = async () => {
    if (!user) return;
    try {
      const docs = await getUserModels(user.id);
      const mapped: TrainedModel[] = docs.map((d) => ({
        id: d.id,
        name: d.model_name,
        style: "",
        preview: "",
        createdAt: d.created_at?.toMillis?.() || Date.now(),
        accuracy: d.accuracy,
        dataset_size: d.dataset_size,
      }));
      setModels(mapped);
    } catch {
      // silently fail – models will be empty
    }
  };

  const refreshPurchased = async () => {
    if (!user) return;
    try {
      const txns = await getUserTransactions(user.id);
      setTransactions(txns);
      setPurchased(txns.map((t) => t.asset_id));
    } catch {
      // silently fail
    }
  };

  const refreshMyAssets = async () => {
    if (!user) return;
    try {
      const assets = await getUserAssets(user.id);
      setMyAssets(assets);
    } catch {
      // silently fail
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        purchased,
        addPurchased,
        favorites,
        toggleFavorite,
        models,
        addModel,
        refreshModels,
        refreshPurchased,
        transactions,
        myAssets,
        refreshMyAssets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
};
