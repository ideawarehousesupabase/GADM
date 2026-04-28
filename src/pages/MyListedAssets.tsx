import { Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { getUserAssets, getTransactionCountForAsset, AssetDoc } from "@/lib/firestore";
import { ShoppingBag, Sparkles, Plus, Loader2, Users } from "lucide-react";

interface ListedAsset {
  id: string;
  title: string;
  price: number;
  image: string;
  style: string;
  category: string;
  model_id: string;
  purchases: number;
}

const MyListedAssets = () => {
  const { user } = useApp();
  const [listedAssets, setListedAssets] = useState<ListedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const assets = await getUserAssets(user.id);
        // Fetch purchase counts for each asset
        const withCounts = await Promise.all(
          assets.map(async (a) => {
            let purchases = 0;
            try { purchases = await getTransactionCountForAsset(a.id); } catch {}
            return {
              id: a.id,
              title: a.title,
              price: a.price,
              image: a.image_url,
              style: a.style || "Fantasy",
              category: a.category || "3D",
              model_id: a.model_id,
              purchases,
            };
          })
        );
        setListedAssets(withCounts);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [user]);

  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "designer") return <Navigate to="/marketplace" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">My Assets</h1>
            <p className="text-muted-foreground text-lg">{listedAssets.length} assets listed for sale.</p>
          </div>
          <Link to="/train-model">
            <Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Create New</Button>
          </Link>
        </div>

        {loading ? (
          <div className="glass rounded-xl p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your assets...</p>
          </div>
        ) : listedAssets.length === 0 ? (
          <div className="glass rounded-xl p-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center mb-5 shadow-glow">
              <ShoppingBag className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No assets listed yet</h3>
            <p className="text-muted-foreground mb-6">Train a model and create assets to list them on the marketplace.</p>
            <Link to="/train-model"><Button variant="hero"><Sparkles className="h-4 w-4" /> Train AI Model</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listedAssets.map(asset => (
              <article key={asset.id} className="group glass rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-glow hover:-translate-y-1 transition-all">
                <Link to={`/asset/${asset.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img src={asset.image} alt={asset.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium glass text-accent">{asset.style}</span>
                  </div>
                </Link>
                <div className="p-4 space-y-3">
                  <Link to={`/asset/${asset.id}`}>
                    <h3 className="font-display font-semibold text-base line-clamp-1 hover:text-primary transition-colors">{asset.title}</h3>
                  </Link>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-display font-bold text-lg glow-text">${asset.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">{asset.purchases} purchase{asset.purchases !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Model: <span className="text-foreground">{asset.model_id.slice(0, 8)}…</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListedAssets;
