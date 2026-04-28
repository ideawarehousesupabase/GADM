import { Navigate, Link } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { assets } from "@/data/assets";
import { AssetCard } from "@/components/AssetCard";
import { Package, Heart, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "purchased" | "favorites" | "profile";

const Dashboard = () => {
  const { user, purchased, favorites } = useApp();
  const [section, setSection] = useState<Section>("purchased");

  if (!user) return <Navigate to="/auth" replace />;

  const purchasedAssets = assets.filter(a => purchased.includes(a.id));
  const favoriteAssets = assets.filter(a => favorites.includes(a.id));

  const nav = [
    { id: "purchased" as const, label: "Purchased", icon: Package, count: purchasedAssets.length },
    { id: "favorites" as const, label: "Favorites", icon: Heart, count: favoriteAssets.length },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            <div className="glass rounded-xl p-5 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow mb-3">
                <span className="font-display font-bold text-primary-foreground">{user.name[0]?.toUpperCase()}</span>
              </div>
              <div className="font-display font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            {nav.map(item => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                  section === item.id ? "bg-gradient-primary text-primary-foreground shadow-glow" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-xs opacity-70">{item.count}</span>
                )}
              </button>
            ))}
          </aside>

          {/* Content */}
          <main>
            {section === "purchased" && (
              <>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Your Library</h1>
                <p className="text-muted-foreground mb-8">All assets you've purchased.</p>
                {purchasedAssets.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No assets yet"
                    desc="Browse the marketplace to start your collection."
                    cta="Explore marketplace"
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {purchasedAssets.map(a => <AssetCard key={a.id} asset={a} />)}
                  </div>
                )}
              </>
            )}

            {section === "favorites" && (
              <>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Favorites</h1>
                <p className="text-muted-foreground mb-8">Assets you've saved for later.</p>
                {favoriteAssets.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="No favorites yet"
                    desc="Tap the heart on any asset to save it here."
                    cta="Browse marketplace"
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {favoriteAssets.map(a => <AssetCard key={a.id} asset={a} />)}
                  </div>
                )}
              </>
            )}

            {section === "profile" && (
              <>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Profile</h1>
                <p className="text-muted-foreground mb-8">Your account information.</p>
                <div className="glass rounded-xl p-8 max-w-xl space-y-6">
                  <Field label="Name" value={user.name} />
                  <Field label="Email" value={user.email} />
                  <Field label="Plan" value="Free · Prototype" />
                  <Field label="Joined" value="April 2026" />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
    <div className="text-lg">{value}</div>
  </div>
);

const EmptyState = ({ icon: Icon, title, desc, cta }: { icon: any; title: string; desc: string; cta: string }) => (
  <div className="glass rounded-xl p-16 text-center">
    <div className="h-16 w-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center mb-5 shadow-glow">
      <Icon className="h-7 w-7 text-primary-foreground" />
    </div>
    <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6">{desc}</p>
    <Link to="/marketplace"><Button variant="hero"><Sparkles className="h-4 w-4" /> {cta}</Button></Link>
  </div>
);

export default Dashboard;
