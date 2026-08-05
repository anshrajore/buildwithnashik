import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";

const ROLES = ["Builder", "Hacker", "Designer", "Mentor", "Judge", "Volunteer", "Sponsor", "Organizer"] as const;
const AVATARS = ["🦾", "🧠", "🚀", "⚡", "🐝", "🦊", "🐼", "🐧", "🦄", "👾", "🤖", "🧑‍💻"];

type Role = typeof ROLES[number];

type Theme = {
  id: string;
  name: string;
  bg: string;
  ink: string;
  accent: string;
  accent2: string;
  text: string;
  frame: string;
  grid: "dots" | "lines" | "none";
  swatch: string[];
};

const THEMES: Theme[] = [
  {
    id: "paper",
    name: "Paper Pass",
    bg: "#f7f0dd",
    ink: "#181e14",
    accent: "#f28a3a",
    accent2: "#f9d84a",
    text: "#181e14",
    frame: "#ffffff",
    grid: "dots",
    swatch: ["#f7f0dd", "#f28a3a", "#f9d84a"],
  },
  {
    id: "midnight",
    name: "Midnight Ink",
    bg: "#161310",
    ink: "#f7f0dd",
    accent: "#f28a3a",
    accent2: "#3b6bd6",
    text: "#f7f0dd",
    frame: "#221d18",
    grid: "dots",
    swatch: ["#161310", "#f28a3a", "#3b6bd6"],
  },
  {
    id: "cobalt",
    name: "Cobalt Blueprint",
    bg: "#e8eefb",
    ink: "#132146",
    accent: "#3b6bd6",
    accent2: "#f9d84a",
    text: "#132146",
    frame: "#ffffff",
    grid: "lines",
    swatch: ["#e8eefb", "#3b6bd6", "#f9d84a"],
  },
  {
    id: "tape",
    name: "Yellow Tape",
    bg: "#f9d84a",
    ink: "#181e14",
    accent: "#181e14",
    accent2: "#e85a71",
    text: "#181e14",
    frame: "#f7f0dd",
    grid: "lines",
    swatch: ["#f9d84a", "#181e14", "#e85a71"],
  },
  {
    id: "rose",
    name: "Sunset Sticker",
    bg: "#fdeae4",
    ink: "#2a1512",
    accent: "#e85a71",
    accent2: "#f28a3a",
    text: "#2a1512",
    frame: "#ffffff",
    grid: "dots",
    swatch: ["#fdeae4", "#e85a71", "#f28a3a"],
  },
  {
    id: "terminal",
    name: "Retro Terminal",
    bg: "#0f1410",
    ink: "#c9f27a",
    accent: "#c9f27a",
    accent2: "#f9d84a",
    text: "#c9f27a",
    frame: "#141b15",
    grid: "lines",
    swatch: ["#0f1410", "#c9f27a", "#f9d84a"],
  },
];

export function DigitalSwag() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Builder");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [showAvatars, setShowAvatars] = useState(false);
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [qrImg, setQrImg] = useState<HTMLImageElement | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);

  const theme = useMemo(() => THEMES.find((t) => t.id === themeId) ?? THEMES[0], [themeId]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://buildwithnashik.lovable.app/#swag";
    return `${window.location.origin}/#swag`;
  }, []);

  // build QR once
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(shareUrl, { margin: 1, width: 320, color: { dark: "#181e14ff", light: "#ffffffff" } })
      .then((url) => {
        if (!alive) return;
        setQrData(url);
        const img = new Image();
        img.onload = () => alive && setQrImg(img);
        img.src = url;
      })
      .catch(() => void 0);
    return () => { alive = false; };
  }, [shareUrl]);

  const draw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    const T = theme;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = T.bg;
    ctx.fillRect(0, 0, W, H);

    // texture
    if (T.grid === "dots") {
      ctx.fillStyle = hexA(T.ink, 0.07);
      for (let x = 0; x < W; x += 18) for (let y = 0; y < H; y += 18) ctx.fillRect(x, y, 1.5, 1.5);
    } else if (T.grid === "lines") {
      ctx.strokeStyle = hexA(T.ink, 0.07);
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }

    // outer border
    ctx.strokeStyle = T.ink;
    ctx.lineWidth = 12;
    roundRect(ctx, 26, 26, W - 52, H - 52, 34);
    ctx.stroke();

    // header bar
    const barX = 58, barY = 58, barW = W - 116, barH = 104;
    ctx.fillStyle = T.accent;
    roundRect(ctx, barX, barY, barW, barH, 18);
    ctx.fill();
    ctx.strokeStyle = T.ink;
    ctx.lineWidth = 5;
    roundRect(ctx, barX, barY, barW, barH, 18);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = readable(T.accent, T.ink, T.bg);
    ctx.font = "800 52px Anton, Impact, sans-serif";
    ctx.fillText("BUILD / NASHIK", W / 2, barY + barH / 2 - 8);
    ctx.font = "700 16px 'JetBrains Mono', monospace";
    ctx.fillText("· TEAM NEST · HACKATHON 2026 ·", W / 2, barY + barH / 2 + 26);

    // portrait frame
    const frameX = 96, frameY = 200, frameW = W - 192, frameH = 468;
    ctx.fillStyle = T.frame;
    roundRect(ctx, frameX, frameY, frameW, frameH, 24);
    ctx.fill();
    ctx.strokeStyle = T.ink;
    ctx.lineWidth = 5;
    roundRect(ctx, frameX, frameY, frameW, frameH, 24);
    ctx.stroke();

    if (photo) {
      const s = Math.min(frameW - 46, frameH - 46);
      const px = frameX + (frameW - s) / 2;
      const py = frameY + (frameH - s) / 2;
      const ir = photo.width / photo.height;
      let sw = photo.width, sh = photo.height, sx = 0, sy = 0;
      if (ir > 1) { sw = photo.height; sx = (photo.width - sw) / 2; }
      else { sh = photo.width; sy = (photo.height - sh) / 2; }
      ctx.save();
      roundRect(ctx, px, py, s, s, 18);
      ctx.clip();
      ctx.drawImage(photo, sx, sy, sw, sh, px, py, s, s);
      ctx.restore();
      ctx.strokeStyle = T.ink;
      ctx.lineWidth = 4;
      roundRect(ctx, px, py, s, s, 18);
      ctx.stroke();
    } else if (emoji) {
      ctx.font = "280px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'";
      ctx.fillText(emoji, W / 2, frameY + frameH / 2);
    } else {
      ctx.fillStyle = hexA(T.ink, 0.25);
      ctx.font = "700 40px 'JetBrains Mono', monospace";
      ctx.fillText("YOUR PHOTO", W / 2, frameY + frameH / 2 - 12);
      ctx.font = "500 17px 'JetBrains Mono', monospace";
      ctx.fillText("upload or pick an avatar", W / 2, frameY + frameH / 2 + 28);
    }

    // role tag
    const tagText = role.toUpperCase();
    ctx.font = "800 22px 'JetBrains Mono', monospace";
    const tagW = ctx.measureText(tagText).width + 44;
    const tagH = 44;
    ctx.save();
    ctx.translate(W / 2, frameY + frameH - 6);
    ctx.rotate(-0.03);
    ctx.fillStyle = T.accent2;
    roundRect(ctx, -tagW / 2, -tagH / 2, tagW, tagH, 12);
    ctx.fill();
    ctx.strokeStyle = T.ink;
    ctx.lineWidth = 4;
    roundRect(ctx, -tagW / 2, -tagH / 2, tagW, tagH, 12);
    ctx.stroke();
    ctx.fillStyle = readable(T.accent2, T.ink, T.bg);
    ctx.fillText(tagText, 0, 2);
    ctx.restore();

    // name band
    const nameY = 716;
    const bandW = W - 116 - 150; // leave room for QR
    ctx.fillStyle = hexA(T.ink, T.grid === "none" ? 0.06 : 0.08);
    roundRect(ctx, 58, nameY, bandW, 140, 20);
    ctx.fill();
    ctx.strokeStyle = T.ink;
    ctx.lineWidth = 5;
    roundRect(ctx, 58, nameY, bandW, 140, 20);
    ctx.stroke();

    ctx.fillStyle = T.text;
    ctx.textAlign = "left";
    const displayName = (name || "YOUR NAME").toUpperCase();
    let fontSize = 54;
    ctx.font = `800 ${fontSize}px Anton, Impact, sans-serif`;
    while (ctx.measureText(displayName).width > bandW - 56 && fontSize > 22) {
      fontSize -= 2;
      ctx.font = `800 ${fontSize}px Anton, Impact, sans-serif`;
    }
    ctx.fillText(displayName, 90, nameY + 54);
    ctx.font = "600 20px 'JetBrains Mono', monospace";
    ctx.fillStyle = hexA(T.text, 0.7);
    ctx.fillText("#BuildWithNashik", 90, nameY + 100);

    // QR block
    const qrS = 118;
    const qrX = W - 58 - qrS - 16;
    const qrY = nameY + 11;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, qrX - 8, qrY - 8, qrS + 16, qrS + 16, 14);
    ctx.fill();
    ctx.strokeStyle = T.ink;
    ctx.lineWidth = 4;
    roundRect(ctx, qrX - 8, qrY - 8, qrS + 16, qrS + 16, 14);
    ctx.stroke();
    if (qrImg) ctx.drawImage(qrImg, qrX, qrY, qrS, qrS);
    ctx.fillStyle = hexA(T.text, 0.7);
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO JOIN", qrX + qrS / 2, nameY + 132);

    // corner stickers
    ctx.save();
    ctx.translate(78, 78);
    ctx.rotate(-0.2);
    ctx.fillStyle = T.accent2;
    ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = T.ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = readable(T.accent2, T.ink, T.bg);
    ctx.font = "800 17px 'JetBrains Mono', monospace";
    ctx.textBaseline = "middle";
    ctx.fillText("36h", 0, 2);
    ctx.restore();

    ctx.save();
    ctx.translate(W - 84, H - 74);
    ctx.rotate(0.14);
    ctx.fillStyle = T.ink;
    roundRect(ctx, -52, -22, 104, 44, 10);
    ctx.fill();
    ctx.fillStyle = T.bg;
    ctx.font = "800 13px 'JetBrains Mono', monospace";
    ctx.fillText("OFFICIAL", 0, -5);
    ctx.fillText("BADGE", 0, 11);
    ctx.restore();
  };

  useEffect(() => { draw(); /* eslint-disable-next-line */ }, [name, role, photo, emoji, theme, qrImg]);

  const onUpload = (f: File | null) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { toast.error("Image too large (max 8MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => { setPhoto(img); setEmoji(null); };
      img.onerror = () => toast.error("Could not load image");
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    const link = document.createElement("a");
    const clean = (name || "badge").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    link.download = `build-with-nashik-${theme.id}-${clean}.png`;
    link.href = c.toDataURL("image/png");
    link.click();
    toast.success("Badge downloaded — share with #BuildWithNashik");
  };

  const share = async () => {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "build-with-nashik-badge.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Build With Nashik 2026", text: `I'm in for #BuildWithNashik 2026 🚀 ${shareUrl}` });
        } catch { /* cancelled */ }
      } else {
        download();
      }
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Swag link copied — paste it anywhere.");
    } catch {
      toast.error("Could not copy. Long-press the link to copy it.");
    }
  };

  return (
    <section id="swag" className="relative border-t-2 border-ink bg-cream py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start gap-4">
          <span className="chip"><span className="h-2 w-2 rounded-full bg-orange" /> Digital Swag</span>
          <h2 className="font-chunk text-5xl uppercase leading-[0.9] tracking-tight md:text-7xl">
            Grab your <span className="tag-orange text-cream">Build/Nashik</span><br /> badge.
          </h2>
          <p className="max-w-2xl font-mono text-sm text-ink/70">
            Pick a template, add your name, drop a photo or avatar — then download a 900×900 PNG with a scannable QR back to the event. Flex it with <span className="font-bold text-ink">#BuildWithNashik</span>.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Preview */}
          <div className="order-2 lg:order-1 lg:sticky lg:top-24">
            <div className="ink-border-lg rounded-3xl bg-white p-3">
              <canvas ref={canvasRef} width={900} height={900} className="h-auto w-full rounded-2xl" />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">
                {theme.name} · 900×900 PNG
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={download} className="ink-border-sm rounded-full bg-orange px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5">
                  ↓ Download
                </button>
                <button onClick={share} className="ink-border-sm rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5">
                  ↗ One-tap share
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="order-1 lg:order-2 grid gap-5">
            {/* templates */}
            <div className="ink-border rounded-2xl bg-white p-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">/01 · Pick a template</span>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    aria-pressed={themeId === t.id}
                    className={`ink-border-sm rounded-xl p-3 text-left transition-transform hover:-translate-y-0.5 ${themeId === t.id ? "bg-ink text-cream" : "bg-cream text-ink"}`}
                  >
                    <div className="flex gap-1">
                      {t.swatch.map((s) => (
                        <span key={s} className="h-5 w-5 rounded-md border-2 border-ink" style={{ background: s }} />
                      ))}
                    </div>
                    <div className="mt-2 font-mono text-[10px] font-bold uppercase leading-tight tracking-widest">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* identity */}
            <div className="ink-border rounded-2xl bg-white p-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">/02 · Your identity</span>
              <label className="mt-3 block">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 40))}
                  placeholder="Your name"
                  className="w-full rounded-lg border-2 border-ink bg-cream px-4 py-3 font-sans text-base outline-none focus:bg-white"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`ink-border-sm rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 ${role === r ? "bg-orange text-cream" : "bg-cream text-ink"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* photo */}
            <div className="ink-border rounded-2xl bg-white p-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">/03 · Photo or avatar</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => fileRef.current?.click()} className="ink-border-sm rounded-full bg-ink px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">
                  ↑ Upload photo
                </button>
                <button onClick={() => setShowAvatars((s) => !s)} className="ink-border-sm rounded-full bg-cream px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
                  ☺ Pick an avatar
                </button>
                {(photo || emoji) && (
                  <button
                    onClick={() => { setPhoto(null); setEmoji(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="rounded-full px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60 underline underline-offset-4 hover:text-ink"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0] || null)} />
              {showAvatars && (
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setEmoji(a); setPhoto(null); }}
                      className={`ink-border-sm grid aspect-square place-items-center rounded-lg text-2xl transition-transform hover:-translate-y-0.5 ${emoji === a ? "bg-yellow" : "bg-cream"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-3 font-mono text-[10px] text-ink/50">* Photos never leave your device — everything renders locally.</p>
            </div>

            {/* share */}
            <div className="ink-border rounded-2xl bg-ink p-6 text-cream">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cream/60">/04 · Share the swag page</span>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="ink-border-sm shrink-0 rounded-xl bg-white p-2">
                  {qrData ? (
                    <img src={qrData} alt="QR code linking to the Build With Nashik digital swag page" className="h-24 w-24" />
                  ) : (
                    <div className="h-24 w-24 animate-pulse rounded bg-cream" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="break-all font-mono text-[11px] text-cream/70">{shareUrl}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={copyLink} className="ink-border-sm rounded-full bg-cream px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
                      ⧉ Copy link
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Get your Build With Nashik 2026 badge 🚀 ${shareUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ink-border-sm rounded-full bg-orange px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
                    >
                      Share on WhatsApp ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- canvas helpers ---------- */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function hexA(hex: string, a: number) {
  const { r, g, b } = toRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function toRgb(hex: string) {
  const h = hex.replace("#", "").slice(0, 6);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function luminance(hex: string) {
  const { r, g, b } = toRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** picks whichever of the two candidates contrasts better with `bg` */
function readable(bg: string, a: string, b: string) {
  const l = luminance(bg);
  const da = Math.abs(l - luminance(a));
  const db = Math.abs(l - luminance(b));
  return da >= db ? a : b;
}
