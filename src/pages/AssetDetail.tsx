import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { assets } from "@/data/assets";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Download, Sparkles, Heart, ArrowLeft, Check, MessageSquarePlus, Send, Loader2 } from "lucide-react";
import { AssetCard } from "@/components/AssetCard";
import { useState, useEffect } from "react";
import { getAssetById, createRequest, AssetDoc } from "@/lib/firestore";

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, purchased, favorites, toggleFavorite } = useApp();
  const [generating, setGenerating] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [firestoreAsset, setFirestoreAsset] = useState<AssetDoc | null>(null);
  const [loadingAsset, setLoadingAsset] = useState(false);

  // Try to find in static assets first
  const staticAsset = assets.find(a => a.id === id);

  // If not found in static, try Firestore
  useEffect(() => {
    if (!staticAsset && id) {
      setLoadingAsset(true);
      getAssetById(id)
        .then(doc => setFirestoreAsset(doc))
        .catch(() => {})
        .finally(() => setLoadingAsset(false));
    }
  }, [id, staticAsset]);

  if (!user) return <Navigate to="/auth" replace />;

  if (loadingAsset) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading asset...</p>
        </div>
      </div>
    );
  }

  // Build a unified asset object
  const asset = staticAsset
    ? staticAsset
    : firestoreAsset
      ? {
          id: firestoreAsset.id,
          title: firestoreAsset.title,
          description: firestoreAsset.description || "",
          price: firestoreAsset.price,
          image: firestoreAsset.image_url,
          category: firestoreAsset.category || "3D",
          style: firestoreAsset.style || "Fantasy",
          designer: firestoreAsset.designer_name || "Unknown",
          designerId: firestoreAsset.user_id,
        }
      : null;

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
  const isOwner = asset.designerId === user.id;
  const isBuyer = user.role === "buyer";
  const canBuy = isBuyer && !isOwner && !isPurchased;
  const similar = assets.filter(a => a.id !== asset.id && a.style === asset.style).slice(0, 3);

  const handleBuy = () => {
    if (!isBuyer || isOwner) {
      toast.error("You cannot purchase your own assets");
      return;
    }
    navigate(`/payment/${asset.id}`);
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

  const handleRequestCustomization = async () => {
    if (!requestMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    setSubmittingRequest(true);
    try {
      await createRequest({
        user_id: user.id,
        asset_id: asset.id,
        message: requestMessage.trim(),
      });
      toast.success("Customization request submitted!");
      setRequestMessage("");
      setShowRequestForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleDownload = () => {
    toast.success("Download started", { description: `Downloading ${asset.title}…` });
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
                {isOwner ? (
                  <Button variant="outline" size="lg" className="flex-1" disabled>
                    Your Asset
                  </Button>
                ) : isPurchased ? (
                  <Button variant="hero" size="lg" className="flex-1" disabled>
                    <Check className="h-4 w-4" /> Already owned
                  </Button>
                ) : canBuy ? (
                  <Button variant="hero" size="lg" className="flex-1" onClick={handleBuy}>
                    Buy Now
                  </Button>
                ) : null}
                <Button variant="neon" size="lg" onClick={handleGenerate} disabled={generating}>
                  <Sparkles className="h-4 w-4" /> {generating ? "Generating..." : "Generate Similar"}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!isPurchased}
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" /> Download {!isPurchased && "(buy first)"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleFavorite(asset.id)}>
                  <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Request Customization */}
            <div className="glass rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold">Need changes?</h3>
                  <p className="text-sm text-muted-foreground">Request a custom version of this asset.</p>
                </div>
                <Button
                  variant="neon"
                  size="sm"
                  onClick={() => setShowRequestForm(!showRequestForm)}
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  {showRequestForm ? "Cancel" : "Request Customization"}
                </Button>
              </div>
              {showRequestForm && (
                <div className="space-y-3 animate-fade-up">
                  <Textarea
                    placeholder="Describe the changes you'd like (e.g. different color, add effects, resize)…"
                    rows={3}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  />
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={handleRequestCustomization}
                    disabled={submittingRequest}
                    className="w-full"
                  >
                    {submittingRequest ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="h-4 w-4" /> Submit Request</>
                    )}
                  </Button>
                </div>
              )}
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
