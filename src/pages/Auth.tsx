import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Sparkles, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { changePassword } from "@/lib/firestore";

const Auth = () => {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"designer" | "buyer">("designer");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useApp();
  const navigate = useNavigate();

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpEmail, setCpEmail] = useState("");
  const [cpOldPassword, setCpOldPassword] = useState("");
  const [cpNewPassword, setCpNewPassword] = useState("");
  const [cpConfirmPassword, setCpConfirmPassword] = useState("");
  const [cpShowOld, setCpShowOld] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);
  const [cpLoading, setCpLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill all fields"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (mode === "signup" && !name.trim()) { toast.error("Please enter your name"); return; }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(name.trim(), email, password, role);
        toast.success("Account created — welcome!");
        navigate(role === "designer" ? "/train-model" : "/marketplace");
      } else {
        await login(email, password);
        toast.success("Logged in successfully");
        const stored = localStorage.getItem("gadm_user");
        const userData = stored ? JSON.parse(stored) : null;
        navigate(userData?.role === "designer" ? "/train-model" : "/marketplace");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpEmail || !cpOldPassword || !cpNewPassword || !cpConfirmPassword) {
      toast.error("Please fill all fields"); return;
    }
    if (cpNewPassword.length < 6) {
      toast.error("New password must be at least 6 characters"); return;
    }
    if (cpNewPassword !== cpConfirmPassword) {
      toast.error("New passwords do not match"); return;
    }
    if (cpOldPassword === cpNewPassword) {
      toast.error("New password must be different from old password"); return;
    }

    setCpLoading(true);
    try {
      await changePassword(cpEmail, cpOldPassword, cpNewPassword);
      toast.success("Password updated successfully");
      setCpEmail(""); setCpOldPassword(""); setCpNewPassword(""); setCpConfirmPassword("");
      setShowChangePassword(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setCpLoading(false);
    }
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
                {showChangePassword ? <KeyRound className="h-6 w-6 text-primary-foreground" /> : <Sparkles className="h-6 w-6 text-primary-foreground" />}
              </div>
            </div>

            {showChangePassword ? (
              <>
                <h1 className="font-display text-3xl font-bold text-center mb-2">Change Password</h1>
                <p className="text-center text-muted-foreground mb-8">Update your account password securely.</p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cp-email">Email</Label>
                    <Input id="cp-email" type="email" value={cpEmail} onChange={e => setCpEmail(e.target.value)} placeholder="you@studio.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cp-old">Old Password</Label>
                    <div className="relative">
                      <Input id="cp-old" type={cpShowOld ? "text" : "password"} value={cpOldPassword} onChange={e => setCpOldPassword(e.target.value)} placeholder="••••••••" required className="pr-10" />
                      <button type="button" onClick={() => setCpShowOld(!cpShowOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle old password">
                        {cpShowOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cp-new">New Password</Label>
                    <div className="relative">
                      <Input id="cp-new" type={cpShowNew ? "text" : "password"} value={cpNewPassword} onChange={e => setCpNewPassword(e.target.value)} placeholder="••••••••" required className="pr-10" />
                      <button type="button" onClick={() => setCpShowNew(!cpShowNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle new password">
                        {cpShowNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cp-confirm">Confirm New Password</Label>
                    <Input id="cp-confirm" type={cpShowNew ? "text" : "password"} value={cpConfirmPassword} onChange={e => setCpConfirmPassword(e.target.value)} placeholder="••••••••" required />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={cpLoading}>
                    {cpLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : "Update Password"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  <button onClick={() => setShowChangePassword(false)} className="hover:text-foreground transition-colors">← Back to login</button>
                </p>
              </>
            ) : (
              <>
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
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" />
                      </div>
                      <div className="space-y-2">
                        <Label>I am a</Label>
                        <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                          <button
                            type="button"
                            onClick={() => setRole("designer")}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === "designer" ? "bg-accent text-accent-foreground shadow-cyan" : "text-muted-foreground"}`}
                          >Designer</button>
                          <button
                            type="button"
                            onClick={() => setRole("buyer")}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === "buyer" ? "bg-accent text-accent-foreground shadow-cyan" : "text-muted-foreground"}`}
                          >Buyer</button>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@studio.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle password visibility">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : mode === "login" ? "Log in" : "Create account"}
                  </Button>
                </form>

                {mode === "login" && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    <button onClick={() => setShowChangePassword(true)} className="hover:text-foreground transition-colors text-accent">
                      Change Password
                    </button>
                  </p>
                )}

                <p className="text-center text-sm text-muted-foreground mt-6">
                  <Link to="/" className="hover:text-foreground transition-colors">← Back to home</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
