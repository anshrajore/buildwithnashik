import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ROLES = ["Builder", "Hacker", "Designer", "Mentor", "Judge", "Volunteer", "Sponsor", "Organizer"] as const;
const AVATARS = ["🦾", "🧠", "🚀", "⚡", "🐝", "🦊", "🐼", "🐧", "🦄", "👾", "🤖", "🧑‍💻"];

type Role = typeof ROLES[number];

export function DigitalSwag() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Builder");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [showAvatars, setShowAvatars] = useState(false);

  const draw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;

    // background: cream paper
    ctx.fillStyle = "#f7f0dd";
    ctx.fillRect(0, 0, W, H);

    // dotted noise
    ctx.fillStyle = "rgba(24,18,14,0.06)";
    for (let x = 0; x < W; x += 18) for (let y = 0; y < H; y += 18) {
      ctx.fillRect(x, y, 1, 1);
    }

    // outer ink border
    ctx.strokeStyle = "#181e14";
    ctx.lineWidth = 14;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // orange top bar
    const barY = 60;
    const barH = 96;
    ctx.fillStyle = "#f28a3a";
    ctx.fillRect(60, barY, W - 120, barH);
    ctx.strokeStyle = "#181e14";
    ctx.lineWidth = 6;
    ctx.strokeRect(60, barY, W - 120, barH);

    // title
    ctx.fillStyle = "#f7f0dd";
    ctx.font = "800 54px Anton, Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BUILD / NASHIK", W / 2, barY + barH / 2 - 4);
    ctx.font = "700 18px 'JetBrains Mono', monospace";
    ctx.fillText("· HACKATHON · 2026 ·", W / 2, barY + barH / 2 + 30);

    // photo frame
    const frameX = 100, frameY = 200, frameW = W - 200, frameH = 480;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(frameX, frameY, frameW, frameH);
    ctx.strokeStyle = "#181e14";
    ctx.lineWidth = 6;
    ctx.strokeRect(frameX, frameY, frameW, frameH);

    // photo or avatar
    if (photo) {
      const s = Math.min(frameW - 40, frameH - 40);
      const px = frameX + (frameW - s) / 2;
      const py = frameY + (frameH - s) / 2;
      // cover-fit
      const ir = photo.width / photo.height;
      let sw = photo.width, sh = photo.height, sx = 0, sy = 0;
      if (ir > 1) { sw = photo.height; sx = (photo.width - sw) / 2; }
      else { sh = photo.width; sy = (photo.height - sh) / 2; }
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, s, s);
      ctx.clip();
      ctx.drawImage(photo, sx, sy, sw, sh, px, py, s, s);
      ctx.restore();
      ctx.strokeStyle = "#181e14";
      ctx.lineWidth = 4;
      ctx.strokeRect(px, py, s, s);
    } else if (emoji) {
      ctx.font = "300px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, W / 2, frameY + frameH / 2);
    } else {
      ctx.fillStyle = "rgba(24,18,14,0.2)";
      ctx.font = "700 44px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YOUR PHOTO", W / 2, frameY + frameH / 2 - 10);
      ctx.font = "500 18px 'JetBrains Mono', monospace";
      ctx.fillText("upload or pick an avatar", W / 2, frameY + frameH / 2 + 30);
    }

    // role tag (cobalt)
    const tagText = role.toUpperCase();
    ctx.font = "800 22px 'JetBrains Mono', monospace";
    const tagW = ctx.measureText(tagText).width + 40;
    const tagH = 42;
    const tagX = W / 2 - tagW / 2;
    const tagY = frameY + frameH - 28;
    ctx.save();
    ctx.translate(tagX + tagW / 2, tagY + tagH / 2);
    ctx.rotate(-0.03);
    ctx.fillStyle = "#3b6bd6";
    ctx.fillRect(-tagW / 2, -tagH / 2, tagW, tagH);
    ctx.strokeStyle = "#181e14";
    ctx.lineWidth = 4;
    ctx.strokeRect(-tagW / 2, -tagH / 2, tagW, tagH);
    ctx.fillStyle = "#f7f0dd";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tagText, 0, 2);
    ctx.restore();

    // name band
    const nameY = 730;
    ctx.fillStyle = "#f9d84a";
    ctx.fillRect(60, nameY, W - 120, 130);
    ctx.strokeStyle = "#181e14";
    ctx.lineWidth = 6;
    ctx.strokeRect(60, nameY, W - 120, 130);
    ctx.fillStyle = "#181e14";
    ctx.font = "800 56px Anton, Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const displayName = (name || "YOUR NAME").toUpperCase();
    // fit
    let fontSize = 56;
    while (ctx.measureText(displayName).width > W - 180 && fontSize > 24) {
      fontSize -= 2;
      ctx.font = `800 ${fontSize}px Anton, Impact, sans-serif`;
    }
    ctx.fillText(displayName, W / 2, nameY + 55);
    ctx.font = "500 22px 'Caveat Brush', cursive";
    ctx.fillStyle = "#181e14";
    ctx.fillText("#BuildWithNashik", W / 2, nameY + 100);

    // corner stickers
    ctx.save();
    ctx.translate(80, 80);
    ctx.rotate(-0.2);
    ctx.fillStyle = "#e85a71";
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#181e14"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#f7f0dd";
    ctx.font = "800 18px 'JetBrains Mono', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("36h", 0, 2);
    ctx.restore();

    ctx.save();
    ctx.translate(W - 80, H - 80);
    ctx.rotate(0.15);
    ctx.fillStyle = "#181e14";
    ctx.fillRect(-46, -20, 92, 40);
    ctx.fillStyle = "#f7f0dd";
    ctx.font = "800 14px 'JetBrains Mono', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("OFFICIAL", 0, -4);
    ctx.fillText("BADGE", 0, 12);
    ctx.restore();
  };

  useEffect(() => { draw(); /* eslint-disable-next-line */ }, [name, role, photo, emoji]);

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
    link.download = `build-with-nashik-${clean}.png`;
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
          await navigator.share({ files: [file], title: "Build With Nashik 2026", text: "I'm in for #BuildWithNashik 2026 🚀" });
        } catch { /* cancelled */ }
      } else {
        download();
      }
    });
  };

  return (
    <section id="swag" className="relative border-t-2 border-ink bg-cream py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start gap-4">
          <span className="chip"><span className="h-2 w-2 rounded-full bg-orange" /> Digital Swag</span>
          <h2 className="font-chunk text-5xl uppercase leading-[0.9] tracking-tight md:text-7xl">
            Grab your <span className="tag-orange">Build/Nashik</span><br /> badge.
          </h2>
          <p className="max-w-2xl font-mono text-sm text-ink/70">
            Add your name, pick a role, and drop a photo or avatar. Download your official Build With Nashik 2026 badge and flex it on socials with <span className="font-bold text-ink">#BuildWithNashik</span>.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Preview */}
          <div className="order-2 lg:order-1">
            <div className="ink-border-lg rounded-xl bg-white p-3">
              <canvas ref={canvasRef} width={900} height={900} className="h-auto w-full rounded-md" />
            </div>
            <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-widest text-ink/60">
              Preview · downloads as 900×900 PNG
            </p>
          </div>

          {/* Controls */}
          <div className="order-1 lg:order-2">
            <div className="ink-border rounded-2xl bg-white p-6">
              <label className="block">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 40))}
                  placeholder="e.g. Ansh Patil"
                  className="mt-2 w-full rounded-lg border-2 border-ink bg-cream px-4 py-3 font-sans text-base outline-none focus:bg-white"
                />
              </label>

              <div className="mt-6">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">Your role</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`ink-border-sm rounded-full px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 ${role === r ? "bg-ink text-cream" : "bg-cream text-ink"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">Your photo</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-cream"
                  >
                    ↑ Upload photo
                  </button>
                  <button
                    onClick={() => setShowAvatars((s) => !s)}
                    className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink"
                  >
                    ☺ Pick an avatar
                  </button>
                  {(photo || emoji) && (
                    <button
                      onClick={() => { setPhoto(null); setEmoji(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="rounded-full px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60 underline underline-offset-4 hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0] || null)}
                />
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

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={download}
                  className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5"
                >
                  ↓ Download badge
                </button>
                <button
                  onClick={share}
                  className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:-translate-y-0.5"
                >
                  ↗ Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
