import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User { name: string; email: string; }
export interface TrainedModel {
  id: string;
  name: string;
  style: string;
  description?: string;
  preview: string;
  createdAt: number;
}
interface AppContextType {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  purchased: string[];
  purchase: (id: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  models: TrainedModel[];
  addModel: (m: TrainedModel) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [models, setModels] = useState<TrainedModel[]>([]);

  useEffect(() => {
    const u = localStorage.getItem("gadm_user");
    const p = localStorage.getItem("gadm_purchased");
    const f = localStorage.getItem("gadm_favs");
    const m = localStorage.getItem("gadm_models");
    if (u) setUser(JSON.parse(u));
    if (p) setPurchased(JSON.parse(p));
    if (f) setFavorites(JSON.parse(f));
    if (m) setModels(JSON.parse(m));
  }, []);

  const login = (email: string, name?: string) => {
    const u = { email, name: name || email.split("@")[0] };
    setUser(u);
    localStorage.setItem("gadm_user", JSON.stringify(u));
  };
  const logout = () => {
    setUser(null);
    setPurchased([]);
    setFavorites([]);
    setModels([]);
    localStorage.removeItem("gadm_user");
    localStorage.removeItem("gadm_purchased");
    localStorage.removeItem("gadm_favs");
    localStorage.removeItem("gadm_models");
    try { sessionStorage.clear(); } catch {}
  };
  const purchase = (id: string) => {
    if (purchased.includes(id)) return;
    const next = [...purchased, id];
    setPurchased(next);
    localStorage.setItem("gadm_purchased", JSON.stringify(next));
  };
  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("gadm_favs", JSON.stringify(next));
  };

  const addModel = (m: TrainedModel) => {
    const next = [m, ...models];
    setModels(next);
    localStorage.setItem("gadm_models", JSON.stringify(next));
  };

  return (
    <AppContext.Provider value={{ user, login, logout, purchased, purchase, favorites, toggleFavorite, models, addModel }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
};
