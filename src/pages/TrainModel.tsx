import { Navigate } from "react-router-dom";
import { useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp, TrainedModel } from "@/context/AppContext";
import { assets } from "@/data/assets";
import { Upload, X, Sparkles, Brain, CheckCircle2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Phase = "idle" | "training" | "done";

const STYLES = ["Fantasy", "Sci-Fi", "Pixel", "Realistic"] as const;
const MAX_IMAGES = 10;
const MIN_IMAGES = 3;

const TrainModel = () => {
  const { user, models, addModel } = useApp();
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [style, setStyle] = useState<string>("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  if (!user) return <Navigate to="/auth" replace />;

  const stepText =
    progress < 30 ? "Uploading and analyzing images…" :
    progress < 70 ? "Learning your artistic style…" :
    "Generating AI outputs…";

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const incoming = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, remaining);
    if (!incoming.length) {
      toast.error(`Limit is ${MAX_IMAGES} images`);
      return;
    }
    Promise.all(incoming.map(f => new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(f);
    }))).then(urls => setImages(prev => [...prev, ...urls]));
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));

  const canTrain = images.length >= MIN_IMAGES && name.trim() && style && phase === "idle";

  const startTraining = () => {
    if (!canTrain) return;
    setPhase("training");
    setProgress(0);
    const start = Date.now();
    const duration = 5500;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        // pick mock generated samples by style
        const pool = assets.filter(a => a.style === style);
        const fallback = assets;
        const picks = (pool.length >= 4 ? pool : fallback).slice(0, 6).map(a => a.image);
        setGenerated(picks);
        setPhase("done");
        toast.success("AI Model trained successfully");
      }
    };
    requestAnimationFrame(tick);
  };

  const publishModel = () => {
    const model: TrainedModel = {
      id: `m_${Date.now()}`,
      name: name.trim(),
      style,
      description: description.trim() || undefined,
      preview: generated[0] || images[0],
      createdAt: Date.now(),
    };
    addModel(model);
    toast.success("Model published successfully");
    // reset form
    setImages([]);
    setName("");
    setStyle("");
    setDescription("");
    setGenerated([]);
    setProgress(0);
    setPhase("idle");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12 max-w-6xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
            <Brain className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium">AI Studio</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">Train your AI Model</h1>
          <p className="text-muted-foreground text-lg">Upload reference artwork and let GADM learn your style.</p>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
          {/* Upload + previews */}
          <section className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInput.current?.click()}
              className={cn(
                "glass rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all",
                dragOver ? "border-primary shadow-glow bg-primary/5" : "border-border/60 hover:border-primary/60"
              )}
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-glow mb-4">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">Drag & drop your artwork</h3>
              <p className="text-sm text-muted-foreground mb-4">PNG, JPG up to {MAX_IMAGES} images</p>
              <Button variant="neon" size="sm" type="button" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>
                Browse files
              </Button>
              <p className={cn(
                "mt-4 text-xs",
                images.length < MIN_IMAGES ? "text-accent" : "text-muted-foreground"
              )}>
                {images.length < MIN_IMAGES
                  ? `Upload at least ${MIN_IMAGES} images to train your AI model (${images.length}/${MIN_IMAGES})`
                  : `${images.length} image${images.length > 1 ? "s" : ""} ready`}
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden glass">
                    <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Training simulation */}
            {phase !== "idle" && (
              <div className="glass rounded-xl p-6 space-y-4 animate-fade-up">
                <div className="flex items-center gap-3">
                  {phase === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  )}
                  <div className="font-medium">
                    {phase === "done" ? "Training complete" : stepText}
                  </div>
                  <div className="ml-auto font-mono text-sm text-muted-foreground">{progress}%</div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Generated samples */}
            {phase === "done" && generated.length > 0 && (
              <div className="glass rounded-xl p-6 space-y-5 animate-fade-up">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold">AI Generated Samples</h3>
                    <p className="text-sm text-muted-foreground">Preview of what your model can produce.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {generated.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden glass group">
                      <img src={src} alt={`Sample ${i + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium glass text-accent">
                        AI · Sample
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="hero" size="lg" className="w-full" onClick={publishModel}>
                  <Rocket className="h-4 w-4" /> Publish Model
                </Button>
              </div>
            )}
          </section>

          {/* Right: model details + action */}
          <aside className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-5 sticky top-24">
              <h2 className="font-display text-xl font-semibold">Model details</h2>
              <div className="space-y-2">
                <Label htmlFor="model-name">Model Name</Label>
                <Input id="model-name" placeholder="e.g. Crystal Realm v1" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger><SelectValue placeholder="Choose a style" /></SelectTrigger>
                  <SelectContent>
                    {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-desc">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea id="model-desc" rows={3} placeholder="What makes this style unique?" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                disabled={!canTrain}
                onClick={startTraining}
              >
                <Sparkles className="h-4 w-4" />
                {phase === "training" ? "Training…" : "Start Training"}
              </Button>
              {!canTrain && phase === "idle" && (
                <p className="text-xs text-muted-foreground text-center">
                  Add a name, pick a style, and upload {MIN_IMAGES}+ images to start.
                </p>
              )}
            </div>
          </aside>
        </div>

        {/* My Models */}
        <section className="mt-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl font-bold">My Models</h2>
              <p className="text-muted-foreground">Your published AI models.</p>
            </div>
            <span className="text-sm text-muted-foreground">{models.length} total</span>
          </div>

          {models.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center mb-4 shadow-glow">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">No models yet</h3>
              <p className="text-muted-foreground text-sm">Train and publish your first model above.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map(m => (
                <article key={m.id} className="glass rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-glow hover:-translate-y-1 transition-all">
                  <div className="aspect-video overflow-hidden bg-secondary">
                    <img src={m.preview} alt={m.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold line-clamp-1">{m.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/20 text-accent">Ready</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs glass text-accent">{m.style}</span>
                    </div>
                    <Button variant="neon" size="sm" className="w-full" onClick={() => toast.info(`Opening ${m.name}…`)}>
                      View Model
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TrainModel;
