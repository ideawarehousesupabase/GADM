import { Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { assets as staticAssets } from "@/data/assets";
import { getAssetById } from "@/lib/firestore";
import { Package, Download, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MyAssets = () => {
  const { user, purchased } = useApp();
  const [resolvedAssets, setResolvedAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolve = async () => {
      if (purchased.length === 0) {
        setResolvedAssets([]);
        setLoading(false);
        return;
      }
      const resolved: any[] = [];
      for (const assetId of purchased) {
        const sa = staticAssets.find(a => a.id === assetId);
        if (sa) { resolved.push(sa); continue; }
        try {
          const doc = await getAssetById(assetId);
          if (doc) {
            resolved.push({
              id: doc.id, title: doc.title, description: doc.description || "",
              price: doc.price, image: doc.image_url,
              category: doc.category || "3D", style: doc.style || "Fantasy",
              designer: doc.designer_name || "Unknown", designerId: doc.user_id,
            });
          }
        } catch {}
      }
      setResolvedAssets(resolved);
      setLoading(false);
    };
    resolve();
  }, [purchased]);

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">My Assets</h1>
          <p className="text-muted-foreground text-lg">Assets you've purchased.</p>
        </div>

        {loading ? (
          <div className="glass rounded-xl p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your assets...</p>
          </div>
        ) : resolvedAssets.length === 0 ? (
          <div className="glass rounded-xl p-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center mb-5 shadow-glow">
              <Package className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No purchased assets</h3>
            <p className="text-muted-foreground mb-6">Browse the marketplace and buy your first asset.</p>
            <Link to="/marketplace"><Button variant="hero"><Sparkles className="h-4 w-4" /> Explore Marketplace</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resolvedAssets.map(asset => (
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
                    <span className="text-muted-foreground">{asset.designer}</span>
                    <span className="font-display font-bold text-lg glow-text">${asset.price}</span>
                  </div>
                  <Button
                    variant="neon"
                    size="sm"
                    className="w-full"
                    onClick={() => toast.success("Download started", { description: `Downloading ${asset.title}…` })}
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssets;
