import { Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { assets as staticAssets } from "@/data/assets";
import { AssetCard } from "@/components/AssetCard";
import { Package, Heart, User, Sparkles, Brain, BarChart3, Database, Cpu, ShoppingBag, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAssetById, AssetDoc, Asset as AssetType } from "@/lib/firestore";

type Section = "purchased" | "favorites" | "models" | "my-assets" | "profile";

const Dashboard = () => {
  const { user, purchased, favorites, models, transactions, myAssets } = useApp();
  const [section, setSection] = useState<Section>("purchased");
  const [purchasedAssetDetails, setPurchasedAssetDetails] = useState<any[]>([]);
  const [loadingPurchased, setLoadingPurchased] = useState(false);

  // Resolve purchased asset IDs to full asset objects
  useEffect(() => {
    const resolve = async () => {
      if (purchased.length === 0) {
        setPurchasedAssetDetails([]);
        return;
      }
      setLoadingPurchased(true);
      const resolved: any[] = [];
      for (const assetId of purchased) {
        // Try static first
        const staticAsset = staticAssets.find(a => a.id === assetId);
        if (staticAsset) {
          resolved.push(staticAsset);
          continue;
        }
        // Try Firestore
        try {
          const doc = await getAssetById(assetId);
          if (doc) {
            resolved.push({
              id: doc.id,
              title: doc.title,
              description: doc.description || "",
              price: doc.price,
              image: doc.image_url,
              category: doc.category || "3D",
              style: doc.style || "Fantasy",
              designer: doc.designer_name || "Unknown",
              designerId: doc.user_id,
            });
          }
        } catch {}
      }
      setPurchasedAssetDetails(resolved);
      setLoadingPurchased(false);
    };
    resolve();
  }, [purchased]);

  if (!user) return <Navigate to="/auth" replace />;

  const favoriteAssets = staticAssets.filter(a => favorites.includes(a.id));
  const isDesigner = user.role === "designer";

  // Convert myAssets (Firestore) to displayable format
  const myListedAssets = myAssets.map(a => ({
    id: a.id,
    title: a.title,
    description: a.description || "",
    price: a.price,
    image: a.image_url,
    category: a.category || "3D",
    style: a.style || "Fantasy",
    designer: user.name,
    designerId: user.id,
  }));

  const nav = [
    { id: "purchased" as const, label: "Purchased", icon: Package, count: purchased.length },
    { id: "favorites" as const, label: "Favorites", icon: Heart, count: favoriteAssets.length },
    ...(isDesigner ? [
      { id: "models" as const, label: "My Models", icon: Brain, count: models.length },
      { id: "my-assets" as const, label: "My Assets", icon: ShoppingBag, count: myListedAssets.length },
    ] : []),
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
              <div className="mt-2">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium",
                  isDesigner ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                )}>
                  {isDesigner ? "Designer" : "Buyer"}
                </span>
              </div>
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
                {loadingPurchased ? (
                  <div className="glass rounded-xl p-16 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading your purchases...</p>
                  </div>
                ) : purchasedAssetDetails.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No assets yet"
                    desc="Browse the marketplace to start your collection."
                    cta="Explore marketplace"
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {purchasedAssetDetails.map((a: any) => <AssetCard key={a.id} asset={a} />)}
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

            {section === "models" && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="font-display text-3xl md:text-4xl font-bold">My Models</h1>
                  <Link to="/train-model">
                    <Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Train New</Button>
                  </Link>
                </div>
                <p className="text-muted-foreground mb-8">Your trained AI models with performance stats.</p>
                {models.length === 0 ? (
                  <EmptyState
                    icon={Brain}
                    title="No models yet"
                    desc="Train your first AI model to get started."
                    cta="Train AI Model"
                    ctaLink="/train-model"
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {models.map(m => (
                      <article key={m.id} className="glass rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-glow hover:-translate-y-1 transition-all">
                        {m.preview && (
                          <div className="aspect-video overflow-hidden bg-secondary">
                            <img src={m.preview} alt={m.name} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display font-semibold line-clamp-1">{m.name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/20 text-accent">Trained</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="glass rounded-lg p-2">
                              <Cpu className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                              <div className="text-[10px] text-muted-foreground">Status</div>
                              <div className="text-xs font-semibold text-accent">Trained</div>
                            </div>
                            <div className="glass rounded-lg p-2">
                              <BarChart3 className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                              <div className="text-[10px] text-muted-foreground">Accuracy</div>
                              <div className="text-xs font-semibold glow-text">{m.accuracy || "N/A"}%</div>
                            </div>
                            <div className="glass rounded-lg p-2">
                              <Database className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                              <div className="text-[10px] text-muted-foreground">Dataset</div>
                              <div className="text-xs font-semibold">{m.dataset_size || "N/A"}</div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {section === "my-assets" && (
              <>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">My Listed Assets</h1>
                <p className="text-muted-foreground mb-8">Assets you've created and listed for sale.</p>
                {myListedAssets.length === 0 ? (
                  <EmptyState
                    icon={ShoppingBag}
                    title="No assets listed"
                    desc="Create and list assets from your trained models."
                    cta="Train a model first"
                    ctaLink="/train-model"
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {myListedAssets.map((a: any) => <AssetCard key={a.id} asset={a} />)}
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
                  <Field label="Role" value={user.role === "designer" ? "Designer" : "Buyer"} />
                  <Field label="Total Purchases" value={String(purchased.length)} />
                  {isDesigner && <Field label="Models Trained" value={String(models.length)} />}
                  {isDesigner && <Field label="Assets Listed" value={String(myListedAssets.length)} />}
                  <Field label="Plan" value="Free · Prototype" />
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

const EmptyState = ({ icon: Icon, title, desc, cta, ctaLink }: { icon: any; title: string; desc: string; cta: string; ctaLink?: string }) => (
  <div className="glass rounded-xl p-16 text-center">
    <div className="h-16 w-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center mb-5 shadow-glow">
      <Icon className="h-7 w-7 text-primary-foreground" />
    </div>
    <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6">{desc}</p>
    <Link to={ctaLink || "/marketplace"}><Button variant="hero"><Sparkles className="h-4 w-4" /> {cta}</Button></Link>
  </div>
);

export default Dashboard;
