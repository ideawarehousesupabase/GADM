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
import { Upload, X, Sparkles, Brain, CheckCircle2, Rocket, BarChart3, Database, Cpu, Plus, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { filesToDataUrls, createModel, saveTrainingData, createAsset } from "@/lib/firestore";

type Phase = "idle" | "uploading" | "training" | "done";

const STYLES = ["Fantasy", "Sci-Fi", "Pixel", "Realistic"] as const;
const MAX_IMAGES = 10;
const MIN_IMAGES = 3;

const TrainModel = () => {
  const { user, models, addModel, refreshMyAssets } = useApp();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [style, setStyle] = useState<string>("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [lastTrainedModel, setLastTrainedModel] = useState<{ accuracy: number; dataset_size: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Create Asset state
  const [creatingForModel, setCreatingForModel] = useState<string | null>(null);
  const [assetTitle, setAssetTitle] = useState("");
  const [assetPrice, setAssetPrice] = useState("");
  const [assetImagePreview, setAssetImagePreview] = useState("");
  const [savingAsset, setSavingAsset] = useState(false);
  const assetImageInput = useRef<HTMLInputElement>(null);

  if (!user) return <Navigate to="/auth" replace />;

  const stepText =
    phase === "uploading" ? "Processing images…" :
    progress < 30 ? "Analyzing your artwork…" :
    progress < 70 ? "Learning your artistic style…" :
    "Generating AI outputs…";

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - imageFiles.length;
    const incoming = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, remaining);
    if (!incoming.length) { toast.error(`Limit is ${MAX_IMAGES} images`); return; }
    setImageFiles(prev => [...prev, ...incoming]);
    incoming.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const canTrain = imageFiles.length >= MIN_IMAGES && name.trim() && style && phase === "idle";

  const startTraining = async () => {
    if (!canTrain || !user) return;
    try {
      setPhase("uploading");
      setProgress(0);
      const uploadedUrls = await filesToDataUrls(imageFiles);
      setProgress(20);
      setPhase("training");
      const start = Date.now();
      const duration = 5500;
      await new Promise<void>((resolve) => {
        const tick = () => {
          const elapsed = Date.now() - start;
          const pct = Math.min(100, Math.round((elapsed / duration) * 100));
          setProgress(pct);
          if (pct < 100) requestAnimationFrame(tick); else resolve();
        };
        requestAnimationFrame(tick);
      });
      const modelDoc = await createModel(user.id, name.trim(), imageFiles.length);
      await saveTrainingData(modelDoc.id, uploadedUrls);
      const model: TrainedModel = {
        id: modelDoc.id, name: name.trim(), style, description: description.trim() || undefined,
        preview: imagePreviews[0] || "", createdAt: Date.now(),
        accuracy: modelDoc.accuracy, dataset_size: modelDoc.dataset_size,
      };
      addModel(model);
      setLastTrainedModel({ accuracy: modelDoc.accuracy, dataset_size: modelDoc.dataset_size });
      setPhase("done");
      toast.success("AI Model trained successfully");
    } catch (err: any) {
      toast.error(err.message || "Training failed");
      setPhase("idle"); setProgress(0);
    }
  };

  const resetForm = () => {
    setImageFiles([]); setImagePreviews([]); setName(""); setStyle("");
    setDescription(""); setProgress(0); setPhase("idle"); setLastTrainedModel(null);
  };

  const handleAssetImage = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => setAssetImagePreview(reader.result as string);
    reader.readAsDataURL(files[0]);
  };

  const handleCreateAsset = async (modelId: string, modelStyle: string) => {
    if (!assetTitle.trim()) { toast.error("Enter asset title"); return; }
    if (!assetPrice || Number(assetPrice) <= 0) { toast.error("Enter a valid price"); return; }
    if (!assetImagePreview) { toast.error("Upload an image for the asset"); return; }
    setSavingAsset(true);
    try {
      await createAsset({
        model_id: modelId, user_id: user!.id, title: assetTitle.trim(),
        image_url: assetImagePreview, price: Number(assetPrice),
        designer_name: user!.name, style: modelStyle, category: "3D",
        description: "AI-generated asset",
      });
      toast.success("Asset created and listed on marketplace!");
      setCreatingForModel(null); setAssetTitle(""); setAssetPrice(""); setAssetImagePreview("");
      refreshMyAssets();
    } catch (err: any) {
      toast.error(err.message || "Failed to create asset");
    } finally { setSavingAsset(false); }
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
              <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-glow mb-4">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">Drag & drop your artwork</h3>
              <p className="text-sm text-muted-foreground mb-4">PNG, JPG up to {MAX_IMAGES} images</p>
              <Button variant="neon" size="sm" type="button" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>Browse files</Button>
              <p className={cn("mt-4 text-xs", imageFiles.length < MIN_IMAGES ? "text-accent" : "text-muted-foreground")}>
                {imageFiles.length < MIN_IMAGES
                  ? `Upload at least ${MIN_IMAGES} images (${imageFiles.length}/${MIN_IMAGES})`
                  : `${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""} ready`}
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden glass">
                    <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground" aria-label="Remove">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(phase === "uploading" || phase === "training" || phase === "done") && (
              <div className="glass rounded-xl p-6 space-y-4 animate-fade-up">
                <div className="flex items-center gap-3">
                  {phase === "done" ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <Sparkles className="h-5 w-5 text-primary animate-pulse" />}
                  <div className="font-medium">{phase === "done" ? "Training complete" : stepText}</div>
                  <div className="ml-auto font-mono text-sm text-muted-foreground">{progress}%</div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {phase === "done" && lastTrainedModel && (
              <div className="glass rounded-xl p-6 space-y-5 animate-fade-up">
                <div>
                  <h3 className="font-display text-xl font-semibold">Model Performance</h3>
                  <p className="text-sm text-muted-foreground">Simulated training results.</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass rounded-lg p-4 text-center">
                    <Cpu className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    <div className="font-display font-semibold text-accent">Trained</div>
                  </div>
                  <div className="glass rounded-lg p-4 text-center">
                    <BarChart3 className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                    <div className="font-display font-semibold glow-text">{lastTrainedModel.accuracy}%</div>
                  </div>
                  <div className="glass rounded-lg p-4 text-center">
                    <Database className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground mb-1">Dataset</div>
                    <div className="font-display font-semibold">{lastTrainedModel.dataset_size} imgs</div>
                  </div>
                </div>
                <Button variant="hero" size="lg" className="w-full" onClick={resetForm}>
                  <Rocket className="h-4 w-4" /> Train Another Model
                </Button>
              </div>
            )}
          </section>

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
                  <SelectContent>{STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-desc">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea id="model-desc" rows={3} placeholder="What makes this style unique?" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button variant="hero" size="lg" className="w-full" disabled={!canTrain} onClick={startTraining}>
                <Sparkles className="h-4 w-4" />
                {phase === "uploading" ? "Processing…" : phase === "training" ? "Training…" : "Start Training"}
              </Button>
              {!canTrain && phase === "idle" && (
                <p className="text-xs text-muted-foreground text-center">Add a name, pick a style, and upload {MIN_IMAGES}+ images to start.</p>
              )}
            </div>
          </aside>
        </div>

        {/* My Models with Create Asset */}
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
                <article key={m.id} className="glass rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-glow transition-all">
                  {m.preview && (
                    <div className="aspect-video overflow-hidden bg-secondary">
                      <img src={m.preview} alt={m.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold line-clamp-1">{m.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/20 text-accent">Trained</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.style && <span className="px-2 py-0.5 rounded-full text-xs glass text-accent">{m.style}</span>}
                      {m.accuracy && <span className="px-2 py-0.5 rounded-full text-xs glass text-primary">{m.accuracy}%</span>}
                      {m.dataset_size && <span className="px-2 py-0.5 rounded-full text-xs glass text-muted-foreground">{m.dataset_size} imgs</span>}
                    </div>

                    {creatingForModel === m.id ? (
                      <div className="space-y-3 pt-3 border-t border-border/50 animate-fade-up">
                        <h4 className="font-display text-sm font-semibold">Create Asset</h4>
                        <Input placeholder="Asset title" value={assetTitle} onChange={e => setAssetTitle(e.target.value)} />
                        <Input type="number" placeholder="Price ($)" min="1" value={assetPrice} onChange={e => setAssetPrice(e.target.value)} />
                        <div>
                          <input ref={assetImageInput} type="file" accept="image/*" hidden onChange={e => handleAssetImage(e.target.files)} />
                          {assetImagePreview ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                              <img src={assetImagePreview} alt="Preview" className="h-full w-full object-cover" />
                              <button onClick={() => setAssetImagePreview("")} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" className="w-full" onClick={() => assetImageInput.current?.click()}>
                              <ImagePlus className="h-4 w-4" /> Upload Image
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="hero" size="sm" className="flex-1" onClick={() => handleCreateAsset(m.id, m.style)} disabled={savingAsset}>
                            {savingAsset ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {savingAsset ? "Saving..." : "Create"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setCreatingForModel(null); setAssetTitle(""); setAssetPrice(""); setAssetImagePreview(""); }}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="neon" size="sm" className="w-full" onClick={() => setCreatingForModel(m.id)}>
                        <Plus className="h-4 w-4" /> Create Asset
                      </Button>
                    )}
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
