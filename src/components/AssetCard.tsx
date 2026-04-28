import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Asset } from "@/data/assets";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const AssetCard = ({ asset, requireAuth = false }: { asset: Asset; requireAuth?: boolean }) => {
  const { favorites, toggleFavorite, user } = useApp();
  const navigate = useNavigate();
  const isFav = favorites.includes(asset.id);
  const detailHref = requireAuth && !user ? "/auth" : `/asset/${asset.id}`;
  const handleGuard = (e: React.MouseEvent) => {
    if (requireAuth && !user) {
      e.preventDefault();
      toast.info("Please log in to view asset details");
      navigate("/auth");
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-lg glass hover:border-primary/40 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
      <Link to={detailHref} onClick={handleGuard} className="block">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={asset.image}
            alt={asset.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium glass text-accent">
            {asset.style}
          </span>
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); toggleFavorite(asset.id); }}
        className="absolute top-3 right-3 h-9 w-9 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Toggle favorite"
      >
        <Heart className={cn("h-4 w-4", isFav ? "fill-primary text-primary" : "text-foreground")} />
      </button>
      <div className="p-4 space-y-3">
        <Link to={detailHref} onClick={handleGuard}>
          <h3 className="font-display font-semibold text-base line-clamp-1 hover:text-primary transition-colors">
            {asset.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-sm">
          <Link to={`/designer/${asset.designerId}`} className="text-muted-foreground hover:text-accent transition-colors">
            {asset.designer}
          </Link>
          <span className="font-display font-bold text-lg glow-text">${asset.price}</span>
        </div>
        <Link to={detailHref} onClick={handleGuard} className="block">
          <Button variant="neon" size="sm" className="w-full">View Details</Button>
        </Link>
      </div>
    </article>
  );
};
