import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { CreditCard, Lock, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { assets as staticAssets } from "@/data/assets";
import { getAssetById, createTransaction, AssetDoc } from "@/lib/firestore";

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addPurchased, refreshPurchased } = useApp();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [firestoreAsset, setFirestoreAsset] = useState<AssetDoc | null>(null);
  const [loading, setLoading] = useState(false);

  const staticAsset = staticAssets.find(a => a.id === id);

  useEffect(() => {
    if (!staticAsset && id) {
      setLoading(true);
      getAssetById(id)
        .then(doc => setFirestoreAsset(doc))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, staticAsset]);

  if (!user) return <Navigate to="/auth" replace />;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const asset = staticAsset
    ? { id: staticAsset.id, title: staticAsset.title, price: staticAsset.price, image: staticAsset.image }
    : firestoreAsset
      ? { id: firestoreAsset.id, title: firestoreAsset.title, price: firestoreAsset.price, image: firestoreAsset.image_url }
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

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handlePay = async () => {
    if (cardNumber.replace(/\s/g, "").length < 16) { toast.error("Enter a valid card number"); return; }
    if (expiry.length < 5) { toast.error("Enter a valid expiry date"); return; }
    if (cvv.length < 3) { toast.error("Enter a valid CVV"); return; }

    setProcessing(true);
    try {
      // Simulate processing delay
      await new Promise(r => setTimeout(r, 1500));

      // Create transaction in Firestore
      await createTransaction({
        user_id: user.id,
        asset_id: asset.id,
        amount: asset.price,
      });

      addPurchased(asset.id);
      await refreshPurchased();
      toast.success("Payment successful!", { description: `${asset.title} is now in your library.` });
      navigate("/my-assets");
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="relative">
          <div className="absolute -inset-8 bg-gradient-glow opacity-40 pointer-events-none" />
          <div className="relative glass rounded-2xl p-8 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <CreditCard className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-center mb-2">Complete Purchase</h1>
            <p className="text-center text-muted-foreground mb-8">Secure simulated payment</p>

            {/* Order Summary */}
            <div className="glass rounded-xl p-5 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img src={asset.image} alt={asset.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold line-clamp-1">{asset.title}</h3>
                  <p className="text-sm text-muted-foreground">One-time · Royalty-free</p>
                </div>
                <div className="font-display text-2xl font-bold glow-text">${asset.price}</div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="card-number"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    className="pl-10"
                    maxLength={19}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                  />
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handlePay}
                disabled={processing}
              >
                {processing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><Lock className="h-4 w-4" /> Pay ${asset.price}</>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Simulated payment · No real charges</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
