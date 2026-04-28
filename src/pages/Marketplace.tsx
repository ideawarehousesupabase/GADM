import { useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { AssetCard } from "@/components/AssetCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { getAllAssets, AssetDoc } from "@/lib/firestore";
import { assets as staticAssets, Category, Style, Asset } from "@/data/assets";

const categories: ("All" | Category)[] = ["All", "3D", "2D", "Textures"];
const styles: ("All" | Style)[] = ["All", "Fantasy", "Sci-Fi", "Pixel", "Realistic"];

// Convert Firestore asset doc to the Asset format used by AssetCard
function firestoreToAsset(doc: AssetDoc): Asset {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description || "",
    price: doc.price,
    image: doc.image_url,
    category: (doc.category as Category) || "3D",
    style: (doc.style as Style) || "Fantasy",
    designer: doc.designer_name || "Unknown",
    designerId: doc.user_id,
  };
}

const Marketplace = () => {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"All" | Category>("All");
  const [style, setStyle] = useState<"All" | Style>("All");
  const [firestoreAssets, setFirestoreAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic assets from Firestore on mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const docs = await getAllAssets();
        setFirestoreAssets(docs.map(firestoreToAsset));
      } catch {
        // silently fail - will show static assets as fallback
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // Merge: Firestore assets first, then static assets
  const allAssets = useMemo(() => {
    const firestoreIds = new Set(firestoreAssets.map(a => a.id));
    const dedupedStatic = staticAssets.filter(a => !firestoreIds.has(a.id));
    return [...firestoreAssets, ...dedupedStatic];
  }, [firestoreAssets]);

  const filtered = useMemo(() =>
    allAssets.filter(a =>
      (cat === "All" || a.category === cat) &&
      (style === "All" || a.style === style) &&
      (query === "" || a.title.toLowerCase().includes(query.toLowerCase()) || a.designer.toLowerCase().includes(query.toLowerCase()))
    ), [query, cat, style, allAssets]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Marketplace</h1>
          <p className="text-muted-foreground text-lg">{allAssets.length} AI-generated assets, ready to ship.</p>
        </div>

        {/* Search + filters */}
        <div className="space-y-5 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search assets, designers, styles..."
              className="pl-11 h-12 text-base bg-card/50 border-border"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
              <SlidersHorizontal className="h-4 w-4" /> Category
            </div>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${cat === c ? "bg-gradient-primary text-primary-foreground shadow-glow" : "glass hover:border-primary/40"}`}
              >{c}</button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
              <SlidersHorizontal className="h-4 w-4" /> Style
            </div>
            {styles.map(s => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${style === s ? "bg-accent text-accent-foreground shadow-cyan" : "glass hover:border-accent/40"}`}
              >{s}</button>
            ))}
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-6">
          Showing <span className="text-foreground font-medium">{filtered.length}</span> of {allAssets.length} assets
        </div>

        {loading ? (
          <div className="glass rounded-lg p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading assets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-lg p-16 text-center">
            <p className="text-muted-foreground mb-4">No assets match your filters.</p>
            <Button variant="neon" onClick={() => { setQuery(""); setCat("All"); setStyle("All"); }}>
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(a => <AssetCard key={a.id} asset={a} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
