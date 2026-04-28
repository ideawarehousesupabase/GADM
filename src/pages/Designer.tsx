import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { assets, designers } from "@/data/assets";
import { AssetCard } from "@/components/AssetCard";
import { toast } from "sonner";
import { UserPlus, Check } from "lucide-react";

const Designer = () => {
  const { id } = useParams();
  const designer = designers.find(d => d.id === id);
  const [following, setFollowing] = useState(false);

  if (!designer) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl mb-4">Designer not found</h1>
          <Link to="/marketplace"><Button variant="hero">Back to marketplace</Button></Link>
        </div>
      </div>
    );
  }

  const designerAssets = assets.filter(a => a.designerId === designer.id);

  const handleFollow = () => {
    setFollowing(!following);
    toast.success(following ? "Unfollowed" : `Now following ${designer.name}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12">
        <div className="relative glass rounded-2xl p-8 md:p-12 mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow opacity-60" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-24 w-24 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="font-display text-4xl font-bold text-primary-foreground">{designer.name[0]}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">{designer.name}</h1>
              <p className="text-accent font-medium mb-2">{designer.style}</p>
              <p className="text-muted-foreground">{designer.bio}</p>
            </div>
            <Button variant={following ? "neon" : "hero"} size="lg" onClick={handleFollow}>
              {following ? <><Check className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>}
            </Button>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold mb-6">{designerAssets.length} assets by {designer.name}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designerAssets.map(a => <AssetCard key={a.id} asset={a} />)}
        </div>
      </div>
    </div>
  );
};

export default Designer;
