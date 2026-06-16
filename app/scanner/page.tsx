"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ScanLine, Loader2, CheckCircle, X, Plus, Camera, Zap, AlertCircle, Wifi, WifiOff } from "lucide-react";
import toast from "react-hot-toast";

interface ScanResult {
  identified: boolean;
  cardName?: string;
  setName?: string;
  cardNumber?: string;
  rarity?: string;
  type?: string;
  estimatedCondition?: number;
  conditionNotes?: string;
  marketPrice?: number;
  imageUrl?: string;
  confidence?: number;
  centering?: string;
  corners?: string;
  edges?: string;
  surface?: string;
}

const TIPS = [
  "Use a dark background for best results",
  "Ensure good, even lighting — avoid harsh shadows",
  "Capture the full card including borders",
  "Avoid flash glare on holographic surfaces",
  "Scan front and back for more accurate grading",
  "Keep the card flat and avoid angled shots",
];

type Provider = "kimi" | "gemma";

export default function ScannerPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [provider, setProvider] = useState<Provider>("kimi");
  const [lmOnline, setLmOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Load provider preference from settings
    const stored = localStorage.getItem('pokemon_dashboard_settings')
    if (stored) {
      const s = JSON.parse(stored)
      if (s.aiProvider) setProvider(s.aiProvider)
    }
    // Check LM Studio status
    fetch("/api/lmstudio")
      .then((r) => r.json())
      .then((d) => setLmOnline(d.online))
      .catch(() => setLmOnline(false));
  }, []);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const scanCard = async () => {
    if (!image || !imageFile) return;
    setScanning(true);
    setScanError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const endpoint = provider === "gemma" ? "/api/lmstudio" : "/api/scanner";
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        setScanError(data.error || "Scan failed with unknown error");
        toast.error("Scan failed — see details below");
        return;
      }

      const d = data.data;
      setResult({
        identified: true,
        cardName: d.name,
        setName: d.set,
        cardNumber: d.number,
        rarity: d.rarity,
        type: d.type,
        estimatedCondition: d.condition?.overall,
        conditionNotes: d.condition?.notes,
        marketPrice: d.estimatedMarketPrice,
        imageUrl: image,
        confidence: d.identificationConfidence === "high" ? 0.95 : d.identificationConfidence === "medium" ? 0.75 : 0.5,
        centering: d.condition?.centering ? `${d.condition.centering}/10` : undefined,
        corners: d.condition?.corners ? `${d.condition.corners}/10` : undefined,
        edges: d.condition?.edges ? `${d.condition.edges}/10` : undefined,
        surface: d.condition?.surface ? `${d.condition.surface}/10` : undefined,
      });
    } catch (err: any) {
      const msg = err?.message || String(err);
      setScanError(msg);
      toast.error("Scan failed — see details below");
    } finally {
      setScanning(false);
    }
  };

  const conditionLabel = (score: number) => {
    if (score >= 9.5) return { label: "Gem Mint", color: "#00ff9d" };
    if (score >= 9) return { label: "Mint", color: "#00e5ff" };
    if (score >= 8) return { label: "Near Mint", color: "#00b4d8" };
    if (score >= 7) return { label: "Lightly Played", color: "#ffd60a" };
    if (score >= 5) return { label: "Moderately Played", color: "#ff6b35" };
    return { label: "Heavily Played", color: "#f0147a" };
  };

  const SubGradeBar = ({ label, value }: { label: string; value: string }) => {
    const score = value.toLowerCase().startsWith("gem") ? 10 :
      value.toLowerCase().startsWith("mint") || value.toLowerCase().startsWith("nm") ? 9 :
      value.toLowerCase().includes("lp") || value.toLowerCase().includes("lightly") ? 7 : 8;
    const pct = (score / 10) * 100;
    const color = score >= 9 ? "#00ff9d" : score >= 7 ? "#ffd60a" : "#f0147a";

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#4a6080]">{label}</span>
          <span className="text-[#94a8c0] font-medium">{value}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill-cyan" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#03040a]/80 backdrop-blur-xl border-b border-[#1a2a40] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00ff9d18] border border-[#00ff9d33] flex items-center justify-center">
            <ScanLine size={16} className="text-[#00ff9d]" />
          </div>
          <div>
            <h1 className="font-['Orbitron'] text-lg font-bold text-[#e8f4ff] tracking-wider">CARD SCANNER</h1>
            <p className="text-xs text-[#4a6080] mt-0.5">AI-powered identification & condition analysis</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Provider toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080d14] border border-[#1a2a40]">
              <button
                onClick={() => setProvider("kimi")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  provider === "kimi"
                    ? "bg-[#00e5ff22] text-[#00e5ff] border border-[#00e5ff33]"
                    : "text-[#4a6080] hover:text-[#94a8c0]"
                }`}
              >
                <Zap size={11} />
                Kimi K2.5
              </button>
              <button
                onClick={() => setProvider("gemma")}
                disabled={lmOnline === false}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  provider === "gemma"
                    ? "bg-[#00ff9d22] text-[#00ff9d] border border-[#00ff9d33]"
                    : lmOnline === false
                    ? "text-[#2a4a6a] cursor-not-allowed"
                    : "text-[#4a6080] hover:text-[#94a8c0]"
                }`}
              >
                {lmOnline === null ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : lmOnline ? (
                  <Wifi size={11} />
                ) : (
                  <WifiOff size={11} />
                )}
                Gemma (Local)
              </button>
            </div>
            {/* Status dot */}
            <div className="flex items-center gap-1.5 text-xs text-[#4a6080]">
              {provider === "gemma" ? (
                lmOnline ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />LM Studio</>
                ) : (
                  <><span className="w-1.5 h-1.5 rounded-full bg-[#f0147a]" />Offline</>
                )
              ) : (
                <><span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />Cloud</>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload zone */}
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden
                  ${isDragActive ? "border-[#00ff9d] bg-[#00ff9d08]" : "border-[#1f3350] hover:border-[#2a4a6a] bg-[#0d1520]/50"}`}
                style={{ minHeight: "320px" }}
              >
                <input {...getInputProps()} />

                {image ? (
                  <div className="relative h-full">
                    <img
                      src={image}
                      alt="Card"
                      className="w-full h-full object-contain p-4"
                      style={{ maxHeight: "400px" }}
                    />
                    {scanning && (
                      <div className="absolute inset-0 bg-[#03040a]/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 scan-overlay">
                        <Loader2 size={28} className="text-[#00ff9d] animate-spin" />
                        <p className="text-sm text-[#00ff9d] font-['Outfit']">Analyzing card...</p>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); setImageFile(null); setScanError(null); }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#0d1520]/80 border border-[#1f3350] flex items-center justify-center hover:border-[#f0147a] transition-all"
                    >
                      <X size={13} className="text-[#94a8c0]" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#00ff9d11] border border-[#00ff9d22] flex items-center justify-center mb-4 animate-float">
                      <Camera size={28} className="text-[#00ff9d]" />
                    </div>
                    <p className="text-[#e8f4ff] font-semibold mb-1 text-sm font-['Outfit']">
                      {isDragActive ? "Drop your card photo here" : "Upload Card Photo"}
                    </p>
                    <p className="text-[#4a6080] text-xs">Drag & drop or click to browse</p>
                    <p className="text-[#2a4a6a] text-[11px] mt-1">PNG, JPG, WEBP · Max 10MB</p>
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0d1520] border border-[#1a2a40]">
                <AlertCircle size={14} className="text-[#00e5ff] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#94a8c0] font-semibold mb-0.5">Photo Tip</p>
                  <p className="text-[11px] text-[#4a6080]">{TIPS[tipIndex]}</p>
                </div>
              </div>

              {/* Scan button */}
              {image && !scanning && (
                <button
                  onClick={scanCard}
                  className="btn-cyber btn-cyber-primary w-full justify-center py-3 text-sm font-semibold"
                >
                  <ScanLine size={16} />
                  Scan & Identify Card
                </button>
              )}

              {scanning && (
                <div className="btn-cyber w-full justify-center py-3 text-sm opacity-60 cursor-not-allowed">
                  <Loader2 size={16} className="animate-spin" />
                  Scanning...
                </div>
              )}
            </div>

            {/* Results */}
            <div className="space-y-4">
              {/* Error state */}
              {scanError && !result && (
                <div className="glass-card p-5 border border-[#f0147a44] animate-slide-up">
                  <div className="flex items-center gap-2 mb-3 text-[#f0147a]">
                    <AlertCircle size={15} />
                    <span className="text-xs font-bold uppercase tracking-wider">Scan Failed</span>
                  </div>
                  <p className="text-xs text-[#94a8c0] font-mono break-all leading-relaxed bg-[#080d14] rounded-lg p-3 border border-[#1a2a40]">
                    {scanError}
                  </p>
                  <p className="text-xs text-[#4a6080] mt-3">
                    This is the real error from the AI API — no demo data. Check your provider settings or try switching models.
                  </p>
                  <button
                    onClick={() => { setScanError(null); }}
                    className="mt-3 text-xs text-[#00e5ff] hover:opacity-80"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {!result && !scanError ? (
                <div className="glass-card h-full flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#0d1520] border border-[#1a2a40] flex items-center justify-center mb-4">
                    <ScanLine size={28} className="text-[#2a4a6a]" />
                  </div>
                  <p className="text-[#2a4a6a] text-sm font-['Outfit']">Upload a card photo to get started</p>
                  <p className="text-[11px] text-[#1f3350] mt-1">AI will identify the card and assess condition</p>
                </div>
              ) : result ? (
                <div className="space-y-4 animate-slide-up">
                  {/* Card ID result */}
                  <div className={`glass-card p-4 border ${result.identified ? "border-glow-green" : "border-[#f0147a44]"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={15} className="text-[#00ff9d]" />
                      <span className="text-xs font-semibold text-[#00ff9d] uppercase tracking-wider">
                        {result.confidence ? `${(result.confidence * 100).toFixed(0)}% Confidence` : "Identified"}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      {result.imageUrl && (
                        <img src={result.imageUrl} alt="" className="w-16 h-22 object-contain rounded" />
                      )}
                      <div>
                        <h3 className="font-['Orbitron'] text-base font-bold text-[#e8f4ff] tracking-wide">
                          {result.cardName || "Unknown Card"}
                        </h3>
                        <p className="text-[#94a8c0] text-sm mt-0.5">{result.setName}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {result.cardNumber && (
                            <span className="stat-badge stat-badge-cyan">#{result.cardNumber}</span>
                          )}
                          {result.rarity && (
                            <span className="stat-badge stat-badge-gold">{result.rarity}</span>
                          )}
                          {result.type && (
                            <span className={`stat-badge border ${["Fire","Water","Grass","Lightning","Psychic","Dragon","Dark"].includes(result.type) ? `type-${result.type.toLowerCase()}` : "type-colorless"}`}>
                              {result.type}
                            </span>
                          )}
                        </div>
                        {result.marketPrice && (
                          <div className="mt-2">
                            <span className="num-display text-xl font-bold text-[#e8f4ff]">${result.marketPrice}</span>
                            <span className="text-[11px] text-[#4a6080] ml-1.5">market value</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Condition analysis */}
                  {result.estimatedCondition && (
                    <div className="glass-card p-4">
                      <h4 className="font-['Orbitron'] text-xs font-bold text-[#e8f4ff] tracking-wider mb-3">
                        CONDITION ANALYSIS
                      </h4>
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="w-16 h-16 rounded-xl flex flex-col items-center justify-center border"
                          style={{
                            borderColor: conditionLabel(result.estimatedCondition).color + "44",
                            background: conditionLabel(result.estimatedCondition).color + "11",
                          }}
                        >
                          <span className="num-display text-2xl font-black" style={{ color: conditionLabel(result.estimatedCondition).color }}>
                            {result.estimatedCondition}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-[#e8f4ff] text-sm">{conditionLabel(result.estimatedCondition).label}</div>
                          <div className="text-[11px] text-[#4a6080] mt-0.5 max-w-xs">{result.conditionNotes}</div>
                        </div>
                      </div>

                      {/* Sub-grades */}
                      {result.centering && (
                        <div className="space-y-2.5">
                          <SubGradeBar label="Centering" value={result.centering} />
                          {result.corners && <SubGradeBar label="Corners" value={result.corners} />}
                          {result.edges && <SubGradeBar label="Edges" value={result.edges} />}
                          {result.surface && <SubGradeBar label="Surface" value={result.surface} />}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toast.success(`${result.cardName} added to collection!`)}
                      className="btn-cyber btn-cyber-success justify-center py-2.5 text-sm"
                    >
                      <Plus size={14} /> Add to Collection
                    </button>
                    <a
                      href={`/grading?card=${encodeURIComponent(result.cardName || "")}&price=${result.marketPrice || 0}&condition=${result.estimatedCondition || 8}`}
                      className="btn-cyber btn-cyber-primary justify-center py-2.5 text-sm"
                    >
                      🏅 Grade Check
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Scanner tips */}
          <div className="mt-6 glass-card p-5">
            <h3 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider mb-4">HOW IT WORKS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "01", title: "Upload Photo", desc: "Take a clear photo of your Pokémon card with good lighting and a dark background.", icon: "📷" },
                { step: "02", title: "AI Analysis", desc: "Claude AI identifies the exact card, set, and edition, then assesses condition across all 4 grading criteria.", icon: "🤖" },
                { step: "03", title: "Add & Grade", desc: "Add directly to your collection with auto-filled details, or run a grading ROI simulation instantly.", icon: "✅" },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#080d14] border border-[#1a2a40] flex items-center justify-center text-sm flex-shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="num-display text-[10px] text-[#4a6080]">{s.step}</span>
                      <span className="text-xs font-semibold text-[#e8f4ff]">{s.title}</span>
                    </div>
                    <p className="text-[11px] text-[#4a6080] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
