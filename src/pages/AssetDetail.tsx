import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { assets } from "@/data/assets";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Download, Sparkles, Heart, ArrowLeft, Check } from "lucide-react";
import { AssetCard } from "@/components/AssetCard";
import { useState } from "react";

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const asset = assets.find(a => a.id === id);
  const { user, purchase, purchased, favorites, toggleFavorite } = useApp();
  const [generating, setGenerating] = useState(false);

  if (!user) return <Navigate to="/auth" replace />;

  if (!asset) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl mb-4">Asset not found</h1>
          <Link to="/marketplace"><Button variant="hero">Back to marketplace</Button></Link>
        </div>
      </div>
    );
  }

  const isPurchased = purchased.includes(asset.id);
  const isFav = favorites.includes(asset.id);
  const similar = assets.filter(a => a.id !== asset.id && a.style === asset.style).slice(0, 3);

  const handleBuy = () => {
    if (!user) {
      toast.error("Please log in to purchase");
      navigate("/auth");
      return;
    }
    purchase(asset.id);
    toast.success("Asset purchased successfully", { description: `${asset.title} added to your library.` });
  };

  const handleGenerate = () => {
    setGenerating(true);
    const loadingId = toast.loading("Generating 4 similar versions of this asset…");
    setTimeout(() => {
      setGenerating(false);
      toast.dismiss(loadingId);
      toast.success("4 similar assets generated successfully");
    }, 2500);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-glow opacity-50 pointer-events-none" />
            <div className="relative aspect-square rounded-2xl overflow-hidden glass">
              <img src={asset.image} alt={asset.title} className="h-full w-full object-cover" width={768} height={768} />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium glass text-accent">{asset.style}</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium glass text-primary">{asset.category}</span>
            </div>

            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">{asset.title}</h1>
              <Link to={`/designer/${asset.designerId}`} className="text-muted-foreground hover:text-accent transition-colors">
                by <span className="text-foreground font-medium">{asset.designer}</span>
              </Link>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">{asset.description}</p>

            <div className="glass rounded-xl p-6 space-y-5">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold glow-text">${asset.price}</span>
                <span className="text-muted-foreground text-sm">one-time · royalty-free</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {isPurchased ? (
                  <Button variant="hero" size="lg" className="flex-1" disabled>
                    <Check className="h-4 w-4" /> Already owned
                  </Button>
                ) : (
                  <Button variant="hero" size="lg" className="flex-1" onClick={handleBuy}>
                    Buy Now
                  </Button>
                )}
                <Button variant="neon" size="lg" onClick={handleGenerate} disabled={generating}>
                  <Sparkles className="h-4 w-4" /> {generating ? "Generating..." : "Generate Similar"}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" disabled className="flex-1">
                  <Download className="h-4 w-4" /> Download {!isPurchased && "(buy first)"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleFavorite(asset.id)}>
                  <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                { label: "Format", value: "FBX, OBJ" },
                { label: "License", value: "Royalty-free" },
                { label: "Updates", value: "Lifetime" },
              ].map(stat => (
                <div key={stat.label} className="glass rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                  <div className="font-medium">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl font-bold mb-6">More in {asset.style}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map(a => <AssetCard key={a.id} asset={a} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AssetDetail;
