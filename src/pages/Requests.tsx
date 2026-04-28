import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { getRequestsForAssets, RequestDoc } from "@/lib/firestore";
import { MessageSquare, Loader2, Clock } from "lucide-react";

const Requests = () => {
  const { user, myAssets } = useApp();
  const [requests, setRequests] = useState<(RequestDoc & { assetTitle: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user || myAssets.length === 0) { setLoading(false); return; }
      try {
        const assetIds = myAssets.map(a => a.id);
        const reqs = await getRequestsForAssets(assetIds);
        const assetMap = new Map(myAssets.map(a => [a.id, a.title]));
        const enriched = reqs.map(r => ({
          ...r,
          assetTitle: assetMap.get(r.asset_id) || "Unknown Asset",
        }));
        setRequests(enriched);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user, myAssets]);

  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "designer") return <Navigate to="/marketplace" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Customization Requests</h1>
          <p className="text-muted-foreground text-lg">Requests from buyers for your assets.</p>
        </div>

        {loading ? (
          <div className="glass rounded-xl p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="glass rounded-xl p-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center mb-5 shadow-glow">
              <MessageSquare className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No requests yet</h3>
            <p className="text-muted-foreground">When buyers request customizations on your assets, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <article key={req.id} className="glass rounded-xl p-6 hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-display font-semibold">{req.assetTitle}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {req.status}
                      </span>
                    </div>
                    <div className="glass rounded-lg p-4 mb-3">
                      <p className="text-sm text-muted-foreground italic">"{req.message}"</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Asset ID: {req.asset_id.slice(0, 8)}… · Request ID: {req.id.slice(0, 8)}…
                    </div>
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

export default Requests;
