import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const Auth = () => {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill all fields"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    setTimeout(() => {
      login(email, mode === "signup" ? name : undefined);
      toast.success(mode === "login" ? "Logged in successfully" : "Account created — welcome!");
      setLoading(false);
      navigate("/marketplace");
    }, 600);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container flex items-center justify-center py-16 md:py-24">
        <div className="w-full max-w-md relative">
          <div className="absolute -inset-8 bg-gradient-glow opacity-60 pointer-events-none" />
          <div className="relative glass rounded-2xl p-8 md:p-10 animate-fade-up">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-center mb-2">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              {mode === "login" ? "Log in to continue exploring." : "Start building your asset library."}
            </p>

            <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-6">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === "login" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"}`}
              >Login</button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === "signup" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"}`}
              >Sign Up</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@studio.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? "Loading..." : mode === "login" ? "Log in" : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/" className="hover:text-foreground transition-colors">← Back to home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
