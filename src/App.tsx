import React, { useState, useRef, useEffect } from "react";
import {
  Home, Target, Users, GraduationCap, Calendar, ClipboardList, MoreHorizontal, Rss,
  FlaskConical, Plus, BarChart3, Wallet, BookOpen, Wrench, Map, Phone, MapPin,
  MessageSquare, Star, ImagePlus, Video as VideoIcon, Trash2, Pencil,
  Eye, EyeOff, LogOut, CheckCircle2, XCircle, Loader2, Send, User,
  PartyPopper, AlertTriangle, DollarSign, ChevronRight, X as CloseIcon,
} from "lucide-react";

// ═══ SUPABASE ═══
const SB_URL = "https://odicvebknzkbxgclwlfx.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaWN2ZWJrbnprYnhnY2x3bGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDA3NzgsImV4cCI6MjA5MzExNjc3OH0.qM0VYf8UyeNao4K5jg14tTLsJQhpbft933l3th2mPXc";

const sb = {
  h: (extra = {}) => ({ apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...extra }),
  async all(table: string, filter = "") {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}?order=id.asc${filter}`, { headers: sb.h() });
      return r.ok ? await r.json() : [];
    } catch { return []; }
  },
  async add(table: string, data: any) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}`, { method: "POST", headers: sb.h({ Prefer: "return=representation" }), body: JSON.stringify(data) });
      const res = await r.json(); return Array.isArray(res) ? res[0] : res;
    } catch { return null; }
  },
  async patch(table: string, id: any, data: any) {
    try { await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", headers: sb.h(), body: JSON.stringify(data) }); } catch {}
  },
  async del(table: string, id: any) {
    try { await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", headers: sb.h() }); } catch {}
  },
};

// ═══ TELEGRAM ═══
const TG_TOKEN = "8739556192:AAHpG0Od1DeqaYkbVtTu1jD0I0WGnyG6T1w";
const TG_CHAT = "583874846";
const tg = async (text: string) => {
  try { await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: "HTML" }) }); } catch {}
};
const tgPhoto = async (url: string, caption = "") => {
  try { await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: TG_CHAT, photo: url, caption }) }); } catch {}
};
const tgButtons = async (text: string, buttons: { text: string; data: string }[][]) => {
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHAT, text, parse_mode: "HTML",
        reply_markup: { inline_keyboard: buttons.map(row => row.map(b => ({ text: b.text, callback_data: b.data }))) },
      }),
    });
  } catch {}
};

// ═══ КОНСТАНТЫ ═══
const DISTRICTS_CITY = ["Джал","Асанбай","Восток-5","Южные мкр (7,8,9,10,11)","Северные мкр (1,2,3,4,5,6)","Тунгуч","Ак-Орго","Ак-Бата","Дордой","Кок-Жар","Арча-Бешик","Учкун","Аламедин-1","Аламедин-2","Моссовет","Ош базар","Филармония","Колмо"];
const DISTRICTS_OUT  = ["Лебединовка","Пригородное","Хан-Тоо","Токмок","Беловодское","Сокулук","Кара-Балта","Ивановка","Байтик","Маяк","Дальше Байтика"];
const ALL_DISTRICTS  = [...DISTRICTS_CITY, ...DISTRICTS_OUT];

const SUBJECTS = ["Математика","Русский язык","Английский язык","Кыргызский язык","Подготовка к школе","Чтение и письмо","Окружающий мир","Другое"];
const DAYS     = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const DAYS_FULL = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
const SOURCES  = ["Instagram","Telegram","2ГИС","Рекомендация","Звонок","Другое"];
const REJECT_REASONS = ["Далеко ехать педагогу","Нет подходящего педагога","Не устроила цена","Родитель передумал","Нет свободного времени","Другое"];
const TEACHER_COLORS = ["#2B5FA8","#3E8E5B","#C98A3B","#B5533F","#6B5B95","#3E7A8C","#B5651D","#9C5B6E"];

const LEAD_STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  new:      { label: "Новый",   color: "#2B5FA8", bg: "#E8EEF6" },
  trial:    { label: "Пробный", color: "#E8843D", bg: "#FBEDE1" },
  accepted: { label: "Взяли",   color: "#3E8E5B", bg: "#EAF4EE" },
  rejected: { label: "Отказ",   color: "#B5433A", bg: "#F7EAE8" },
};

const ADMIN = { login: "aydanek", password: "akbilim2025", name: "Айданек", role: "admin" };
const COORDINATOR = { login: "coord", password: "coord2025", name: "Координатор", role: "coordinator" };

const INIT_SCHEDULE = DAYS.map(d => ({ day: d, start: "", end: "" }));

const INIT_TEACHERS = [
  { id: 1, name: "Анэля",      subject: "Подготовка к школе, Английский", login: "anelya",     password: "anelya123",     role: "teacher", color: "#2B5FA8", avatar: "АН", rate: 600, districts: ["Джал","Арча-Бешик"], schedule: INIT_SCHEDULE },
  { id: 2, name: "Акылай",     subject: "Подготовка к школе, Английский", login: "akylay",     password: "akylay123",     role: "teacher", color: "#3E8E5B", avatar: "АК", rate: 600, districts: ["Тунгуч","Кок-Жар","Аламедин-1"], schedule: INIT_SCHEDULE },
  { id: 3, name: "Асыл",       subject: "Подготовка к школе, 1–3 класс",  login: "asyl",       password: "asyl123",       role: "teacher", color: "#C98A3B", avatar: "АС", rate: 600, districts: ["Северные мкр (1,2,3,4,5,6)","Кок-Жар"], schedule: INIT_SCHEDULE },
  { id: 4, name: "Нури",       subject: "Все предметы, Кыргызский",       login: "nuri",       password: "nuri123",       role: "teacher", color: "#6B5B95", avatar: "НУ", rate: 600, districts: ["Восток-5"], schedule: INIT_SCHEDULE },
  { id: 5, name: "Виктория",   subject: "Дошкольная подготовка, 1–4 кл.", login: "viktoriya",  password: "viktoriya123",  role: "teacher", color: "#B5533F", avatar: "ВИ", rate: 600, districts: ["Кок-Жар","Восток-5","Аламедин-1"], schedule: INIT_SCHEDULE },
  { id: 6, name: "Анастасия",  subject: "Дошкольная подготовка, 1–4 кл.", login: "anastasiya", password: "anastasiya123", role: "teacher", color: "#3E7A8C", avatar: "АНС",rate: 600, districts: ["Северные мкр (1,2,3,4,5,6)"], schedule: INIT_SCHEDULE },
];

const INIT_BOOKS = [
  { id: 1, title: "Математика 1–4 класс",  desc: "Рабочая тетрадь по математике", price: 250 },
  { id: 2, title: "Учи писать",             desc: "Прописи для дошкольников",      price: 200 },
];

const INIT_FORMATS = [
  { id: 1, name: "Выезд (город)",        price: 1000, teacher_rate: 600 },
  { id: 2, name: "Загород",              price: 1500, teacher_rate: 700 },
  { id: 3, name: "Дети с диагнозом",     price: 1500, teacher_rate: 800 },
];

// ═══ ЦВЕТА (CSS-переменные из index.css) ═══
const C = {
  primary: "var(--accent-blue)", primaryDark: "#1F477F", primaryLight: "#E8EEF6",
  accent: "var(--accent-orange)", accentLight: "#FBEDE1",
  success: "#3E8E5B", successLight: "#EAF4EE",
  warning: "var(--accent-orange)", warningLight: "#FBEDE1",
  danger: "#B5433A",  dangerLight: "#F7EAE8",
  bg: "var(--bg-page)", card: "var(--bg-card)", border: "#E3E6EA",
  text: "var(--text-heading)", muted: "var(--text-body)", light: "#F1F2F4",
};

const FONT = "'Inter', sans-serif";

// ═══ РЕСПОНСИВ ═══
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.innerWidth >= 900);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isDesktop;
}

// ═══ UI КОМПОНЕНТЫ ═══
const Av = ({ l, color, size = 40, photo }: any) => photo
  ? <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}><img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
  : <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: size * 0.35, flexShrink: 0 }}>{l}</div>;

const Card = ({ children, style = {}, onClick }: any) => (
  <div onClick={onClick} style={{ background: C.card, borderRadius: 16, padding: 16, boxShadow: "0 1px 3px rgba(20,24,34,0.06)", border: `1px solid ${C.border}`, cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
);

const Btn = ({ onClick, children, color = C.primary, outline = false, small = false, full = false, disabled = false, danger = false, style = {} }: any) => {
  const bg = danger ? C.danger : color;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? C.border : outline ? "transparent" : bg,
      color: disabled ? C.muted : outline ? bg : "#fff",
      border: outline ? `1.5px solid ${bg}` : "none",
      borderRadius: 12, padding: small ? "8px 16px" : "13px 20px",
      fontWeight: 700, fontSize: small ? 13 : 15, cursor: disabled ? "not-allowed" : "pointer",
      width: full ? "100%" : "auto", fontFamily: FONT,
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      ...style,
    }}>{children}</button>
  );
};

const Badge = ({ text, color, bg, icon: I }: any) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg || color + "18", color, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
    {I && <I size={12} />}{text}
  </span>
);

// строка "иконка + текст" — единый способ подать вторичную информацию без эмодзи
const IT = ({ icon: I, children, color = "currentColor", size = 14 }: any) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
    <I size={size} color={color} style={{ flexShrink: 0 }} />{children}
  </span>
);

const Inp = ({ label, value, onChange, type = "text", placeholder = "", required = false, style = {} }: any) => (
  <div style={{ marginBottom: 14, ...style }}>
    {label && <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}{required && <span style={{ color: C.danger }}> *</span>}</div>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 15, fontFamily: FONT, boxSizing: "border-box", background: C.bg, color: C.text, outline: "none" }}
      onFocus={e => e.target.style.borderColor = C.primary as string} onBlur={e => e.target.style.borderColor = C.border} />
  </div>
);

const Sel = ({ label, value, onChange, options, required = false }: any) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}{required && <span style={{ color: C.danger }}> *</span>}</div>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 15, fontFamily: FONT, background: C.bg, color: C.text }}>
      <option value="">— Выберите —</option>
      {options.map((o: any) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3, placeholder = "" }: any) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>}
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 15, fontFamily: FONT, resize: "vertical", boxSizing: "border-box", background: C.bg, color: C.text }} />
  </div>
);

const Stars = ({ value, onChange }: any) => (
  <div style={{ display: "flex", gap: 6 }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} onClick={() => onChange?.(n)} style={{ background: "none", border: "none", cursor: onChange ? "pointer" : "default", padding: 2, display: "flex" }}>
        <Star size={22} color={C.accent as string} fill={value >= n ? "currentColor" : "none"} style={{ opacity: value >= n ? 1 : 0.35 }} />
      </button>
    ))}
  </div>
);

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,34,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.card, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 600, maxHeight: "92vh", overflowY: "auto", padding: "0 20px 32px" }}>
        <div style={{ position: "sticky", top: 0, background: C.card, paddingTop: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ width: 40, height: 4, background: C.border, borderRadius: 4, margin: "0 auto 14px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: C.text }}>{title}</div>
            <button onClick={onClose} style={{ background: C.light, border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center" }}><CloseIcon size={18} /></button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg }: any) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: C.text, color: "#fff", padding: "12px 24px", borderRadius: 16, fontWeight: 700, fontSize: 14, zIndex: 2000, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

// ═══ ЗАГРУЗКА ФОТО ═══
async function uploadFile(file: File): Promise<{ url: string; name: string; isVideo: boolean }> {
  try {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const fd = new FormData(); fd.append("file", file); fd.append("fileName", fileName);
    const res = await fetch(`${SB_URL}/functions/v1/upload-file`, { method: "POST", headers: { Authorization: `Bearer ${SB_KEY}`, apikey: SB_KEY }, body: fd });
    if (res.ok) { const d = await res.json(); return { url: d.url, name: file.name, isVideo: file.type.startsWith("video/") }; }
  } catch {}
  return { url: URL.createObjectURL(file), name: file.name, isVideo: file.type.startsWith("video/") };
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(v.duration); };
    v.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    v.src = url;
  });
}

function VideoPlayer({ url }: { url: string }) {
  return (
    <video src={url} controls playsInline
      style={{ width: "100%", borderRadius: 12, maxHeight: 320, background: "#000", display: "block" }}
    />
  );
}

function FileUpload({ label, files, onChange }: any) {
  const ref = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const handle = async (e: any) => {
    setErr(""); setLoading(true);
    const list: File[] = Array.from(e.target.files as FileList);
    const valid: File[] = [];
    for (const f of list) {
      if (f.type.startsWith("video/")) {
        const dur = await getVideoDuration(f);
        if (dur > 120) { setErr(`Видео "${f.name}" длиннее 2 минут — сократите и попробуйте снова`); setLoading(false); e.target.value = ""; return; }
      }
      valid.push(f);
    }
    const uploaded = await Promise.all(valid.map(uploadFile));
    onChange([...files, ...uploaded]); setLoading(false); e.target.value = "";
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>}
      <div onClick={() => !loading && ref.current.click()} style={{ border: `1.5px dashed ${files.length > 0 ? C.success : C.border}`, borderRadius: 12, padding: 20, textAlign: "center", cursor: loading ? "wait" : "pointer", background: files.length > 0 ? C.successLight : C.bg }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          {loading ? <Loader2 className="spin" size={28} color={C.accent as string} /> : files.length > 0 ? <CheckCircle2 size={28} color={C.success} /> : <ImagePlus size={28} color={C.muted as string} />}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: loading ? C.accent : files.length > 0 ? C.success : C.muted }}>
          {loading ? "Загружаю..." : files.length > 0 ? `${files.length} файл(ов)` : "Фото / Видео (видео до 2 мин)"}
        </div>
        <input ref={ref} type="file" accept="image/*,video/*" multiple onChange={handle} style={{ display: "none" }} />
      </div>
      {err && <div style={{ color: C.danger, fontSize: 13, fontWeight: 600, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={15} />{err}</div>}
      {files.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {files.map((f: any, i: number) => (
            <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
              {f.isVideo ? <div style={{ width: "100%", height: "100%", background: C.primaryLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><VideoIcon size={24} color={C.primary as string} /></div>
                : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />}
              <button onClick={() => onChange(files.filter((_: any, j: number) => j !== i))} style={{ position: "absolute", top: -6, right: -6, background: C.danger, border: "none", borderRadius: "50%", width: 20, height: 20, color: "#fff", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CloseIcon size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ ЛОГОТИП ═══
const Logo = ({ size = 36 }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill="#2B5FA8" />
    <circle cx="25" cy="35" r="11" fill="#1A2733" />
    <circle cx="75" cy="35" r="11" fill="#1A2733" />
    <circle cx="50" cy="55" r="27" fill="#DCE7F2" stroke="#1A2733" strokeWidth="2.5" />
    <circle cx="40" cy="52" r="8" fill="#1A2733" /><circle cx="60" cy="52" r="8" fill="#1A2733" />
    <circle cx="42" cy="50" r="3" fill="white" /><circle cx="62" cy="50" r="3" fill="white" />
    <ellipse cx="50" cy="62" rx="4" ry="3" fill="#1A2733" />
    <path d="M44 67 Q50 73 56 67" stroke="#1A2733" strokeWidth="2" strokeLinecap="round" fill="none" />
    <rect x="30" y="24" width="40" height="5" rx="2.5" fill="#E8843D" />
    <polygon points="50,8 70,24 30,24" fill="#E8843D" />
  </svg>
);

// ═══ BOTTOM TAB BAR (мобильная навигация) ═══
function TabBar({ tabs, active, onSelect }: any) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
      {tabs.map((t: any) => {
        const I = t.icon;
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => onSelect(t.key)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontFamily: FONT,
            color: isActive ? C.primary : C.muted,
          }}>
            <I size={21} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══ БОКОВАЯ ПАНЕЛЬ (десктоп: руководитель/координатор) ═══
const SIDENAV_WIDTH = 232;
function SideNav({ tabs, active, onSelect, roleLabel, onLogout }: any) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: SIDENAV_WIDTH, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "22px 14px", zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "0 8px" }}>
        <Logo size={32} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>AK BILIM</div>
          <div style={{ fontSize: 12, color: C.muted }}>{roleLabel}</div>
        </div>
      </div>
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {tabs.map((t: any) => {
          const I = t.icon;
          const isActive = active === t.key;
          return (
            <button key={t.key} onClick={() => onSelect(t.key)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
              background: isActive ? C.primaryLight : "transparent", color: isActive ? C.primary : C.muted,
              fontWeight: isActive ? 700 : 500, fontSize: 14, fontFamily: FONT, textAlign: "left",
            }}>
              <I size={18} />{t.label}
            </button>
          );
        })}
      </nav>
      <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", color: C.muted, cursor: "pointer", fontFamily: FONT, fontWeight: 600, fontSize: 14 }}>
        <LogOut size={18} />Выйти
      </button>
    </div>
  );
}

// ═══ СТРАНИЦА ЛОГИНА ═══
function Login({ onLogin, teachers }: any) {
  const [login, setLogin] = useState(""); const [pass, setPass] = useState(""); const [show, setShow] = useState(false); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setErr(""); setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    if (login === ADMIN.login && pass === ADMIN.password) { onLogin(ADMIN); return; }
    if (login === COORDINATOR.login && pass === COORDINATOR.password) { onLogin(COORDINATOR); return; }
    const t = teachers.find((t: any) => t.login === login.trim() && t.password === pass);
    if (t) { onLogin(t); return; }
    setErr("Неверный логин или пароль"); setLoading(false);
  };
  return (
    <div style={{ minHeight: "100vh", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: FONT }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: 12 }}><Logo size={72} /></div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>AK BILIM</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 }}>Система управления центром</div>
        </div>
        <div style={{ background: C.card, borderRadius: 24, padding: 28, boxShadow: "0 16px 48px rgba(20,24,34,0.16)" }}>
          <Inp label="Логин" value={login} onChange={setLogin} placeholder="введите логин" />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Пароль</div>
            <div style={{ position: "relative" }}>
              <input type={show ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()}
                placeholder="••••••••"
                style={{ width: "100%", padding: "12px 44px 12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 15, fontFamily: FONT, boxSizing: "border-box", background: C.bg, color: C.text, outline: "none" }} />
              <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex" }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          {err && <div style={{ background: C.dangerLight, borderRadius: 10, padding: "10px 14px", color: C.danger, fontSize: 14, fontWeight: 600, marginBottom: 14, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><AlertTriangle size={15} />{err}</div>}
          <Btn full onClick={handle} disabled={loading || !login || !pass} color={C.primary}>{loading ? "Входим..." : "Войти"}</Btn>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted }}>Ak Bilim · Бишкек</div>
        </div>
      </div>
    </div>
  );
}

// ═══ ЭКРАН ЗАГРУЗКИ ═══
function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: C.primaryLight, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <Logo size={80} />
      <div style={{ marginTop: 20, fontSize: 22, fontWeight: 900, color: C.primaryDark }}>Ak Bilim</div>
      <div style={{ marginTop: 8, fontSize: 14, color: C.muted }}>Загружаем данные...</div>
    </div>
  );
}

// ═══ ВКЛАДКИ АДМИНИСТРАТОРА ═══

// HOME
function AdminHome({ students, teachers, leads, reports, formats }: any) {
  const today = new Date();
  const monthIncome = students.reduce((sum: number, s: any) => {
    const fmt = (formats || INIT_FORMATS).find((f: any) => f.name === s.format);
    return sum + (fmt?.price || 1000);
  }, 0);
  const newLeads = leads.filter((l: any) => l.status === "new").length;
  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <div style={{ background: C.primary, borderRadius: 20, padding: 20, marginBottom: 20, color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Панель руководителя</div>
        <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>Привет, Айданек!</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{today.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { icon: Users, val: students.length, label: "Учеников", color: C.primary },
          { icon: GraduationCap, val: teachers.length, label: "Педагогов", color: C.success },
          { icon: Target, val: newLeads, label: "Новых лидов", color: C.accent },
          { icon: DollarSign, val: monthIncome.toLocaleString() + " с", label: "Доход/мес", color: C.primaryDark },
        ].map((s, i) => (
          <Card key={i} style={{ borderTop: `3px solid ${s.color}`, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><s.icon size={24} color={s.color as string} /></div>
            <div style={{ fontSize: 21, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: C.text }}><ClipboardList size={17} color={C.primary as string} />Последние отчёты</div>
      {reports.length === 0 ? <Card><div style={{ textAlign: "center", color: C.muted, padding: 20 }}>Отчётов пока нет</div></Card>
        : reports.slice(0, 4).map((r: any) => (
          <Card key={r.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Av l={r.teacherAvatar || "?"} color={r.teacherColor || C.primary} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{r.teacherName}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{r.studentName} · {r.topic}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{r.date}</div>
              </div>
              <Stars value={r.rating} />
            </div>
          </Card>
        ))}
    </div>
  );
}

// LEADS
function LeadsTab({ leads, setLeads, teachers, toast, formats }: any) {
  const [modal, setModal] = useState<string | null>(null);
  const [sel, setSel] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [newLead, setNewLead] = useState({ childName: "", parentName: "", parentPhone: "", grade: "", subject: "", district: "", address: "", source: "", notes: "" });
  const [trialTeacher, setTrialTeacher] = useState("");
  const [trialDate, setTrialDate] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const filtered = filter === "all" ? leads : leads.filter((l: any) => l.status === filter);
  const counts: any = Object.keys(LEAD_STATUSES).reduce((a: any, k) => { a[k] = leads.filter((l: any) => l.status === k).length; return a; }, {});

  const addLead = async () => {
    if (!newLead.childName || !newLead.parentPhone) return;
    const lead = { ...newLead, id: Date.now(), status: "new", createdAt: new Date().toLocaleDateString("ru-RU") };
    setLeads((p: any) => [lead, ...p]);
    await sb.add("ak_leads", lead);
    setNewLead({ childName: "", parentName: "", parentPhone: "", grade: "", subject: "", district: "", address: "", source: "", notes: "" });
    setModal(null);
    toast("Лид добавлен!");
    // Педагоги по этому району для inline-кнопок
    const districtTeachers = teachers.filter((t: any) => !t.districts?.length || t.districts.includes(lead.district));
    const rows: { text: string; data: string }[][] = [];
    for (let i = 0; i < districtTeachers.length; i += 2) {
      rows.push(districtTeachers.slice(i, i + 2).map((t: any) => ({ text: t.name, data: `assign_${lead.id}_${t.id}` })));
    }
    rows.push([{ text: "📊 Вечерний отчёт", data: "evening_report" }]);
    await tgButtons(
      `🆕 <b>Новый лид!</b>\n👶 ${lead.childName}${lead.grade ? `, ${lead.grade}` : ""}\n👨‍👩‍👧 ${lead.parentName}\n📞 ${lead.parentPhone}\n📍 ${lead.district || "—"}${lead.subject ? `\n📚 ${lead.subject}` : ""}${lead.address ? `\n🏠 ${lead.address}` : ""}\n\n👇 <b>Назначить педагога:</b>`,
      rows,
    );
  };

  const moveTo = async (id: any, status: string, extra: any = {}) => {
    await sb.patch("ak_leads", id, { status, ...extra });
    setLeads((p: any) => p.map((l: any) => l.id === id ? { ...l, status, ...extra } : l));
    setSel(null); setModal(null); toast(`Статус изменён → ${LEAD_STATUSES[status].label}`);
  };

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 19, fontWeight: 900, display: "flex", alignItems: "center", gap: 9, color: C.text }}><Target size={20} color={C.primary as string} />Лиды</div>
        <Btn small onClick={() => setModal("add")}><Plus size={15} />Добавить</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {[["all", "Все", leads.length], ...Object.entries(LEAD_STATUSES).map(([k, v]: any) => [k, v.label, counts[k]])].map(([key, label, cnt]: any) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap",
            background: filter === key ? C.primary : C.light, color: filter === key ? "#fff" : C.muted,
          }}>{label} ({cnt})</button>
        ))}
      </div>

      {filtered.map((l: any) => {
        const st = LEAD_STATUSES[l.status];
        return (
          <Card key={l.id} onClick={() => { setSel(l); setModal("detail"); }} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{l.childName}</div>
                  <Badge text={st.label} color={st.color} bg={st.bg} />
                </div>
                <div style={{ fontSize: 13, color: C.muted, display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <IT icon={User}>{l.parentName}</IT>
                  <IT icon={Phone}>{l.parentPhone}</IT>
                </div>
                {l.address && <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}><IT icon={MapPin}>{l.address}</IT></div>}
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2, display: "flex", gap: 10 }}>
                  <IT icon={MapPin}>{l.district}</IT>{l.subject && <IT icon={BookOpen}>{l.subject}</IT>}
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{l.createdAt}</div>
            </div>
          </Card>
        );
      })}
      {filtered.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Лидов нет</div></Card>}

      {/* Добавить лид */}
      <Modal open={modal === "add"} onClose={() => setModal(null)} title="Новый лид">
        <Inp label="Имя ребёнка" value={newLead.childName} onChange={(v: string) => setNewLead(p => ({ ...p, childName: v }))} required />
        <Inp label="Имя родителя" value={newLead.parentName} onChange={(v: string) => setNewLead(p => ({ ...p, parentName: v }))} />
        <Inp label="Телефон" value={newLead.parentPhone} onChange={(v: string) => setNewLead(p => ({ ...p, parentPhone: v }))} required />
        <Inp label="Класс / возраст" value={newLead.grade} onChange={(v: string) => setNewLead(p => ({ ...p, grade: v }))} placeholder="3 класс / 6 лет" />
        <Inp label="Предмет" value={newLead.subject} onChange={(v: string) => setNewLead(p => ({ ...p, subject: v }))} placeholder="Математика" />
        <Sel label="Район" value={newLead.district} onChange={(v: string) => setNewLead(p => ({ ...p, district: v }))} options={ALL_DISTRICTS} />
        <Inp label="Точный адрес" value={newLead.address} onChange={(v: string) => setNewLead(p => ({ ...p, address: v }))} placeholder="ул. Джал 23, дом 14, кв. 5" required />
        <Sel label="Источник" value={newLead.source} onChange={(v: string) => setNewLead(p => ({ ...p, source: v }))} options={SOURCES} />
        <Textarea label="Заметки" value={newLead.notes} onChange={(v: string) => setNewLead(p => ({ ...p, notes: v }))} rows={2} />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full onClick={addLead} disabled={!newLead.childName || !newLead.parentPhone}>Добавить</Btn>
          <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
        </div>
      </Modal>

      {/* Детали лида */}
      <Modal open={modal === "detail" && !!sel} onClose={() => { setModal(null); setSel(null); }} title={sel?.childName || ""}>
        {sel && (
          <div>
            <Card style={{ marginBottom: 16, background: C.light }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 14 }}>
                {[["Родитель", sel.parentName], ["Телефон", sel.parentPhone], ["Класс", sel.grade], ["Предмет", sel.subject], ["Район", sel.district], ["Источник", sel.source]].map(([k, v]) => (
                  <div key={k}><div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{k}</div><div style={{ fontWeight: 700, color: C.text }}>{v || "—"}</div></div>
                ))}
              </div>
              {sel.address && <div style={{ marginTop: 10, fontSize: 14 }}><span style={{ fontWeight: 700, color: C.muted, fontSize: 11 }}>АДРЕС</span><br /><span style={{ fontWeight: 700, color: C.text }}><IT icon={MapPin}>{sel.address}</IT></span></div>}
              {sel.notes && <div style={{ marginTop: 8, fontSize: 13, color: C.text }}><IT icon={MessageSquare}>{sel.notes}</IT></div>}
            </Card>

            <div style={{ fontWeight: 700, color: C.muted, fontSize: 12, marginBottom: 10, textTransform: "uppercase" }}>Изменить статус</div>

            {sel.status === "new" && (
              <div>
                <Sel label="Педагог для пробного" value={trialTeacher} onChange={setTrialTeacher} options={teachers.map((t: any) => ({ value: t.name, label: `${t.name} · ${t.subject}` }))} />
                <Inp label="Дата пробного" value={trialDate} onChange={setTrialDate} type="date" />
                <Btn full color={C.accent} disabled={!trialTeacher || !trialDate} onClick={() => moveTo(sel.id, "trial", { teacherName: trialTeacher, trialDate })}><FlaskConical size={16} />Назначить пробный</Btn>
              </div>
            )}
            {sel.status === "trial" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Btn full color={C.success} onClick={() => moveTo(sel.id, "accepted")}><CheckCircle2 size={16} />Взяли в центр</Btn>
                <Sel label="Причина отказа" value={rejectReason} onChange={setRejectReason} options={REJECT_REASONS} />
                <Btn full danger disabled={!rejectReason} onClick={() => moveTo(sel.id, "rejected", { rejectReason })}><XCircle size={16} />Отказ</Btn>
              </div>
            )}
            {(sel.status === "accepted" || sel.status === "rejected") && (
              <div style={{ background: sel.status === "accepted" ? C.successLight : C.dangerLight, borderRadius: 12, padding: 14, textAlign: "center", color: sel.status === "accepted" ? C.success : C.danger, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {sel.status === "accepted" ? <><CheckCircle2 size={17} />Ученик принят</> : <><XCircle size={17} />Отказ: {sel.rejectReason}</>}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <Btn full outline color={C.danger} small onClick={async () => { await sb.del("ak_leads", sel.id); setLeads((p: any) => p.filter((l: any) => l.id !== sel.id)); setModal(null); setSel(null); toast("Удалено"); }}><Trash2 size={15} />Удалить лид</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// STUDENTS
function StudentsTab({ students, setStudents, teachers, formats, toast }: any) {
  const [modal, setModal] = useState<string | null>(null);
  const [editS, setEditS] = useState<any>(null);
  const [form, setForm] = useState({ name: "", grade: "", address: "", parentPhone: "", teacherId: "", format: "", days: [] as string[], time: "" });

  const openAdd = () => { setForm({ name: "", grade: "", address: "", parentPhone: "", teacherId: "", format: "", days: [], time: "" }); setEditS(null); setModal("form"); };
  const openEdit = (s: any) => { setForm({ name: s.name, grade: s.grade, address: s.address, parentPhone: s.parentPhone, teacherId: String(s.teacherId), format: s.format, days: s.days || [], time: s.time || "" }); setEditS(s); setModal("form"); };

  const toggleDay = (d: string) => setForm(p => ({ ...p, days: p.days.includes(d) ? p.days.filter(x => x !== d) : [...p.days, d] }));

  const save = async () => {
    if (!form.name || !form.teacherId) return;
    if (editS) {
      const updated = { ...editS, ...form, teacherId: Number(form.teacherId) };
      setStudents((p: any) => p.map((s: any) => s.id === editS.id ? updated : s));
      await sb.patch("ak_students", editS.id, form);
      toast("Ученик обновлён!");
    } else {
      const s = { ...form, id: Date.now(), teacherId: Number(form.teacherId) };
      setStudents((p: any) => [...p, s]);
      await sb.add("ak_students", s);
      toast("Ученик добавлен!");
    }
    setModal(null);
  };

  const del = async (id: any) => {
    setStudents((p: any) => p.filter((s: any) => s.id !== id));
    await sb.del("ak_students", id);
    toast("Удалено");
  };

  const fmtOptions = (formats || INIT_FORMATS).map((f: any) => ({ value: f.name, label: `${f.name} — ${f.price} сом` }));

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 19, fontWeight: 900, display: "flex", alignItems: "center", gap: 9, color: C.text }}><Users size={20} color={C.primary as string} />Ученики ({students.length})</div>
        <Btn small onClick={openAdd}><Plus size={15} />Добавить</Btn>
      </div>
      {students.map((s: any) => {
        const t = teachers.find((t: any) => t.id === s.teacherId);
        return (
          <Card key={s.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Av l={s.name[0]} color={t?.color || C.primary} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{s.name}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{s.grade}</div>
                {s.address && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}><IT icon={MapPin}>{s.address}</IT></div>}
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}><IT icon={Phone}>{s.parentPhone}</IT></div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {t && <Badge text={t.name} color={t.color} />}
                  {s.format && <Badge text={s.format} color={C.primary} />}
                  {(s.days || []).map((d: string) => <Badge key={d} text={d} color={C.muted} />)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openEdit(s)} style={{ background: C.primaryLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.primary, display: "flex" }}><Pencil size={15} /></button>
                <button onClick={() => del(s.id)} style={{ background: C.dangerLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.danger, display: "flex" }}><Trash2 size={15} /></button>
              </div>
            </div>
          </Card>
        );
      })}
      {students.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Учеников пока нет</div></Card>}

      <Modal open={modal === "form"} onClose={() => setModal(null)} title={editS ? "Редактировать ученика" : "Новый ученик"}>
        <Inp label="Имя ученика" value={form.name} onChange={(v: string) => setForm(p => ({ ...p, name: v }))} required />
        <Inp label="Класс / возраст" value={form.grade} onChange={(v: string) => setForm(p => ({ ...p, grade: v }))} placeholder="3 класс / 6.5 лет" />
        <Inp label="Точный адрес" value={form.address} onChange={(v: string) => setForm(p => ({ ...p, address: v }))} placeholder="ул. Джал 23, д. 14, кв. 5" />
        <Inp label="Телефон родителя" value={form.parentPhone} onChange={(v: string) => setForm(p => ({ ...p, parentPhone: v }))} />
        <Sel label="Педагог" value={form.teacherId} onChange={(v: string) => setForm(p => ({ ...p, teacherId: v }))} options={teachers.filter((t: any) => t.role === "teacher").map((t: any) => ({ value: t.id, label: t.name }))} required />
        <Sel label="Формат" value={form.format} onChange={(v: string) => setForm(p => ({ ...p, format: v }))} options={fmtOptions} required />
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Дни занятий</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DAYS.map(d => {
              const sel = form.days.includes(d);
              return <button key={d} onClick={() => toggleDay(d)} style={{ padding: "8px 14px", borderRadius: 20, border: `1.5px solid ${sel ? C.primary : C.border}`, background: sel ? C.primary : "transparent", color: sel ? "#fff" : C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>{d}</button>;
            })}
          </div>
        </div>
        <Inp label="Время" value={form.time} onChange={(v: string) => setForm(p => ({ ...p, time: v }))} placeholder="14:00" />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full onClick={save} disabled={!form.name || !form.teacherId}>Сохранить</Btn>
          <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
        </div>
      </Modal>
    </div>
  );
}

// TEACHERS
function DistrictChips({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (d: string) => onChange(selected.includes(d) ? selected.filter(x => x !== d) : [...selected, d]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Районы работы</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Город:</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {DISTRICTS_CITY.map(d => {
          const on = selected.includes(d);
          return <button key={d} onClick={() => toggle(d)} style={{ padding: "5px 10px", borderRadius: 16, border: `1.5px solid ${on ? C.primary : C.border}`, background: on ? C.primary : "transparent", color: on ? "#fff" : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>{d}</button>;
        })}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Пригород:</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {DISTRICTS_OUT.map(d => {
          const on = selected.includes(d);
          return <button key={d} onClick={() => toggle(d)} style={{ padding: "5px 10px", borderRadius: 16, border: `1.5px solid ${on ? C.accent : C.border}`, background: on ? C.accent : "transparent", color: on ? "#fff" : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>{d}</button>;
        })}
      </div>
    </div>
  );
}

function ScheduleEditor({ schedule, onChange }: { schedule: any[]; onChange: (v: any[]) => void }) {
  const sched = DAYS.map(d => schedule?.find((s: any) => s.day === d) || { day: d, start: "", end: "" });
  const update = (day: string, field: "start" | "end", val: string) => {
    onChange(sched.map(s => s.day === day ? { ...s, [field]: val } : s));
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Расписание по дням</div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {sched.map((s, i) => (
          <div key={s.day} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: i < 6 ? `1px solid ${C.border}` : "none", background: s.start ? C.primaryLight : "transparent" }}>
            <div style={{ width: 28, fontWeight: 700, fontSize: 13, color: s.start ? C.primary : C.muted }}>{s.day}</div>
            <input type="time" value={s.start} onChange={e => update(s.day, "start", e.target.value)}
              style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 8px", fontSize: 13, fontFamily: FONT, background: C.bg, color: C.text, flex: 1 }} />
            <span style={{ color: C.muted, fontSize: 12 }}>—</span>
            <input type="time" value={s.end} onChange={e => update(s.day, "end", e.target.value)}
              style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 8px", fontSize: 13, fontFamily: FONT, background: C.bg, color: C.text, flex: 1 }} />
            {s.start && <button onClick={() => update(s.day, "start", "") || update(s.day, "end", "")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 0, display: "flex" }}><CloseIcon size={14} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeachersTab({ teachers, setTeachers, students, toast }: any) {
  const [modal, setModal] = useState<string | null>(null);
  const [editT, setEditT] = useState<any>(null);
  const emptyForm = () => ({ name: "", subject: "", phone: "", districts: [] as string[], schedule: INIT_SCHEDULE, login: "", password: "", rate: "600", color: TEACHER_COLORS[teachers.length % TEACHER_COLORS.length] });
  const [form, setForm] = useState<any>(emptyForm());

  const openAdd = () => { setForm(emptyForm()); setEditT(null); setModal("form"); };
  const openEdit = (t: any) => {
    setForm({ name: t.name, subject: t.subject, phone: t.phone || "", districts: Array.isArray(t.districts) ? t.districts : [], schedule: t.schedule || INIT_SCHEDULE, login: t.login, password: t.password, rate: String(t.rate || 600), color: t.color });
    setEditT(t); setModal("form");
  };

  const save = async () => {
    if (!form.name || !form.login || !form.password) return;
    const data = { ...form, rate: Number(form.rate) };
    if (editT) {
      setTeachers((p: any) => p.map((t: any) => t.id === editT.id ? { ...editT, ...data } : t));
      await sb.patch("ak_teachers", editT.id, data);
      toast("Педагог обновлён!");
    } else {
      const t = { ...data, id: Date.now(), role: "teacher", avatar: form.name[0].toUpperCase() };
      setTeachers((p: any) => [...p, t]);
      await sb.add("ak_teachers", t);
      toast("Педагог добавлен!");
    }
    setModal(null);
  };

  const del = async (id: any) => {
    setTeachers((p: any) => p.filter((t: any) => t.id !== id));
    await sb.del("ak_teachers", id);
    toast("Удалено");
  };

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 19, fontWeight: 900, display: "flex", alignItems: "center", gap: 9, color: C.text }}><GraduationCap size={20} color={C.primary as string} />Педагоги</div>
        <Btn small onClick={openAdd}><Plus size={15} />Добавить</Btn>
      </div>
      {teachers.filter((t: any) => t.role === "teacher").map((t: any) => {
        const myStudents = students.filter((s: any) => s.teacherId === t.id);
        const activeDays = (t.schedule || []).filter((s: any) => s.start).map((s: any) => s.day).join(", ");
        return (
          <Card key={t.id} style={{ marginBottom: 12, borderLeft: `3px solid ${t.color}` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Av l={t.avatar || t.name[0]} color={t.color} size={52} photo={t.photoUrl} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{t.name}</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{t.subject}</div>
                {t.phone && <div style={{ fontSize: 12, color: C.muted }}><IT icon={Phone}>{t.phone}</IT></div>}
                {Array.isArray(t.districts) && t.districts.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                    {t.districts.map((d: string) => <Badge key={d} text={d} color={C.primary} />)}
                  </div>
                )}
                {activeDays && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}><IT icon={Calendar}>{activeDays}</IT></div>}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Badge text={`${myStudents.length} учеников`} color={t.color} />
                  <Badge text={`${t.rate || 600} с/урок`} color={C.accent} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>Мои ученики:</div>
                  {myStudents.slice(0, 3).map((s: any) => (
                    <div key={s.id} style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{s.name} — {s.format}</div>
                  ))}
                  {myStudents.length > 3 && <div style={{ fontSize: 12, color: C.muted }}>...ещё {myStudents.length - 3}</div>}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={() => openEdit(t)} style={{ background: C.primaryLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.primary, display: "flex" }}><Pencil size={15} /></button>
                <button onClick={() => del(t.id)} style={{ background: C.dangerLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.danger, display: "flex" }}><Trash2 size={15} /></button>
              </div>
            </div>
          </Card>
        );
      })}

      <Modal open={modal === "form"} onClose={() => setModal(null)} title={editT ? "Редактировать педагога" : "Новый педагог"}>
        <Inp label="Имя" value={form.name} onChange={(v: string) => setForm((p: any) => ({ ...p, name: v }))} required />
        <Inp label="Предмет(ы)" value={form.subject} onChange={(v: string) => setForm((p: any) => ({ ...p, subject: v }))} placeholder="Математика, Подготовка к школе" />
        <Inp label="Телефон" value={form.phone} onChange={(v: string) => setForm((p: any) => ({ ...p, phone: v }))} />
        <Inp label="Ставка (сом/урок)" value={form.rate} onChange={(v: string) => setForm((p: any) => ({ ...p, rate: v }))} type="number" />
        <DistrictChips selected={form.districts} onChange={(v: string[]) => setForm((p: any) => ({ ...p, districts: v }))} />
        <ScheduleEditor schedule={form.schedule} onChange={(v: any) => setForm((p: any) => ({ ...p, schedule: v }))} />
        <Inp label="Логин" value={form.login} onChange={(v: string) => setForm((p: any) => ({ ...p, login: v.toLowerCase() }))} required />
        <Inp label="Пароль" value={form.password} onChange={(v: string) => setForm((p: any) => ({ ...p, password: v }))} required />
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Цвет карточки</div>
          <div style={{ display: "flex", gap: 8 }}>
            {TEACHER_COLORS.map(c => (
              <button key={c} onClick={() => setForm((p: any) => ({ ...p, color: c }))} style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: form.color === c ? `3px solid ${C.text}` : "3px solid transparent", cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full onClick={save} disabled={!form.name || !form.login || !form.password}>Сохранить</Btn>
          <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ТАБЕЛЬ
function TabSheet({ reports, teachers, onBack }: any) {
  const now = new Date();
  const day = now.getDate();
  const periodStart = day <= 15 ? 1 : 16;
  const periodEnd = day <= 15 ? 15 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const [selTeacher, setSelTeacher] = useState<any>(null);

  const periodReports = reports.filter((r: any) => {
    if (r.type !== "lesson") return false;
    const parts = (r.date || "").split(".");
    if (parts.length < 3) return false;
    const d = parseInt(parts[0]), m = parseInt(parts[1]) - 1, y = parseInt(parts[2]);
    const rd = new Date(y, m, d);
    const s = new Date(now.getFullYear(), now.getMonth(), periodStart);
    const e = new Date(now.getFullYear(), now.getMonth(), periodEnd);
    return rd >= s && rd <= e;
  });

  const teacherStats = teachers.filter((t: any) => t.role === "teacher").map((t: any) => {
    const myR = periodReports.filter((r: any) => r.teacherId === t.id);
    const byStudent: Record<string, number> = {};
    myR.forEach((r: any) => { byStudent[r.studentName] = (byStudent[r.studentName] || 0) + 1; });
    return { ...t, count: myR.length, salary: myR.length * (t.rate || 600), byStudent };
  });

  if (selTeacher) {
    const ts = teacherStats.find((t: any) => t.id === selTeacher);
    return (
      <div style={{ padding: "16px 16px 90px" }}>
        <BackHeader title={ts?.name} icon={BarChart3} onBack={() => setSelTeacher(null)} />
        <Card style={{ marginBottom: 16, background: C.primaryLight }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Период: {periodStart}–{periodEnd} {now.toLocaleDateString("ru-RU", { month: "long" })}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
            <div><div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>УРОКОВ</div><div style={{ fontSize: 22, fontWeight: 900, color: C.primary }}>{ts?.count}</div></div>
            <div><div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>К ВЫПЛАТЕ</div><div style={{ fontSize: 22, fontWeight: 900, color: C.success }}>{(ts?.salary || 0).toLocaleString()} с</div></div>
          </div>
        </Card>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: C.text }}>По ученикам:</div>
        {Object.entries(ts?.byStudent || {}).map(([name, cnt]: any) => (
          <Card key={name} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, color: C.text }}>{name}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: C.muted, fontSize: 13 }}>{cnt} уроков</span>
              <Badge text={`${cnt * (ts?.rate || 600)} с`} color={C.success} />
            </div>
          </Card>
        ))}
        {Object.keys(ts?.byStudent || {}).length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 20 }}>Уроков за период нет</div></Card>}
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <BackHeader title="Табель" icon={BarChart3} onBack={onBack} />
      <Card style={{ marginBottom: 16, background: C.primaryLight }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>Период: {periodStart}–{periodEnd} {now.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Всего уроков: {periodReports.length}</div>
      </Card>
      {teacherStats.map((t: any) => (
        <Card key={t.id} onClick={() => setSelTeacher(t.id)} style={{ marginBottom: 10, borderLeft: `3px solid ${t.color}` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Av l={t.avatar || t.name[0]} color={t.color} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: C.text }}>{t.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{t.count} уроков × {t.rate || 600} с</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: 17, color: C.success }}>{t.salary.toLocaleString()} с</div>
            <ChevronRight size={18} color={C.muted as string} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// MORE TAB (Ещё)
function MoreTab({ reports, students, teachers, formats, setFormats, books, setBooks, leads, toast }: any) {
  const [sub, setSub] = useState<string | null>(null);

  if (sub === "reports")   return <ReportsView reports={reports} teachers={teachers} onBack={() => setSub(null)} />;
  if (sub === "tabsheet")  return <TabSheet reports={reports} teachers={teachers} onBack={() => setSub(null)} />;
  if (sub === "finance")   return <FinanceView students={students} teachers={teachers} formats={formats} leads={leads} onBack={() => setSub(null)} />;
  if (sub === "books")     return <BooksView books={books} setBooks={setBooks} toast={toast} onBack={() => setSub(null)} />;
  if (sub === "formats")   return <FormatsView formats={formats} setFormats={setFormats} toast={toast} onBack={() => setSub(null)} />;
  if (sub === "districts") return <DistrictsView toast={toast} onBack={() => setSub(null)} />;

  const items = [
    { key: "reports",   icon: ClipboardList, label: "Отчёты педагогов", desc: `${reports.length} отчётов` },
    { key: "tabsheet",  icon: BarChart3,     label: "Табель",            desc: "Зарплата за период" },
    { key: "finance",   icon: Wallet,        label: "Финансы",           desc: "Доходы и расходы" },
    { key: "books",     icon: BookOpen,      label: "Книги",             desc: `${books.length} книг` },
    { key: "formats",   icon: Wrench,        label: "Форматы и цены",    desc: `${formats.length} форматов` },
    { key: "districts", icon: Map,           label: "Карта районов",     desc: "Кто где работает" },
  ];

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <div style={{ fontSize: 19, fontWeight: 900, marginBottom: 20, display: "flex", alignItems: "center", gap: 9, color: C.text }}><MoreHorizontal size={20} color={C.primary as string} />Ещё</div>
      {items.map(item => (
        <Card key={item.key} onClick={() => setSub(item.key)} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, background: C.primaryLight, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><item.icon size={22} color={C.primary as string} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{item.label}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{item.desc}</div>
          </div>
          <ChevronRight size={18} color={C.muted as string} />
        </Card>
      ))}
    </div>
  );
}

function BackHeader({ title, icon: I, onBack }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <button onClick={onBack} style={{ background: C.light, border: "none", borderRadius: 12, padding: "8px 12px", cursor: "pointer", fontWeight: 700, color: C.text, fontFamily: FONT, display: "flex", alignItems: "center" }}><ChevronRight size={18} style={{ transform: "rotate(180deg)" }} /></button>
      <div style={{ fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, color: C.text }}>{I && <I size={19} color={C.primary as string} />}{title}</div>
    </div>
  );
}

function ReportsView({ reports, teachers, onBack }: any) {
  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <BackHeader title="Отчёты" icon={ClipboardList} onBack={onBack} />
      {reports.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Отчётов пока нет</div></Card>}
      {reports.map((r: any) => {
        const t = teachers.find((t: any) => t.id === r.teacherId);
        return (
          <Card key={r.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <Av l={r.teacherAvatar || "?"} color={r.teacherColor || C.primary} size={40} photo={t?.photoUrl} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: C.text }}>{r.teacherName}</div>
                <div style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>{r.date} · {r.type === "trial" ? <IT icon={FlaskConical} size={12}>Пробный</IT> : <IT icon={ClipboardList} size={12}>Урок</IT>}</div>
              </div>
              <Stars value={r.rating} />
            </div>
            <div style={{ fontSize: 14, marginBottom: 6, color: C.text }}><b>{r.studentName}</b> · {r.topic}</div>
            {r.notes && <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}><IT icon={MessageSquare}>{r.notes}</IT></div>}
            {r.homework && <div style={{ fontSize: 13, marginBottom: 6, color: C.text }}>Д/З: {r.homework}</div>}
            {r.files && r.files.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {r.files.filter((f: any) => f.isVideo).map((f: any, i: number) => (
                  <div key={`v${i}`} style={{ marginBottom: 8 }}><VideoPlayer url={f.url} /></div>
                ))}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {r.files.filter((f: any) => !f.isVideo).map((f: any, i: number) => (
                    <img key={i} src={f.url} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, cursor: "pointer" }} onClick={() => window.open(f.url, "_blank")} />
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function FinanceView({ students, teachers, formats, leads, onBack }: any) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [newExp, setNewExp] = useState({ category: "", amount: "", notes: "" });

  useEffect(() => { sb.all("ak_finances").then(d => { if (d?.length) setExpenses(d); }); }, []);

  const fmts = formats || INIT_FORMATS;
  const income = students.reduce((sum: number, s: any) => {
    const fmt = fmts.find((f: any) => f.name === s.format);
    return sum + (fmt?.price || 1000);
  }, 0);
  const salaries = students.reduce((sum: number, s: any) => {
    const t = teachers.find((t: any) => t.id === s.teacherId);
    const fmt = fmts.find((f: any) => f.name === s.format);
    return sum + (fmt?.teacher_rate || t?.rate || 600);
  }, 0);
  const expTotal = expenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
  const profit = income - salaries - expTotal;

  const addExp = async () => {
    if (!newExp.category || !newExp.amount) return;
    const e = { ...newExp, id: Date.now(), amount: Number(newExp.amount), date: new Date().toLocaleDateString("ru-RU") };
    setExpenses(p => [...p, e]);
    await sb.add("ak_finances", e);
    setNewExp({ category: "", amount: "", notes: "" });
    setModal(false);
  };

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <BackHeader title="Финансы" icon={Wallet} onBack={onBack} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Доход", val: income, color: C.success },
          { label: "Зарплаты", val: salaries, color: C.accent },
          { label: "Расходы", val: expTotal, color: C.danger },
          { label: "Прибыль", val: profit, color: profit >= 0 ? C.success : C.danger },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: "center", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 19, fontWeight: 900, color: s.color }}>{s.val.toLocaleString()} с</div>
            <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>Расходы</div>
        <Btn small onClick={() => setModal(true)}><Plus size={15} />Добавить</Btn>
      </div>
      {expenses.map(e => (
        <Card key={e.id} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: C.text }}>{e.category}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{e.date} {e.notes && `· ${e.notes}`}</div>
          </div>
          <div style={{ fontWeight: 800, color: C.danger }}>{Number(e.amount).toLocaleString()} с</div>
        </Card>
      ))}
      <Modal open={modal} onClose={() => setModal(false)} title="Расход">
        <Inp label="Категория" value={newExp.category} onChange={(v: string) => setNewExp(p => ({ ...p, category: v }))} placeholder="Аренда, Реклама..." required />
        <Inp label="Сумма (сом)" value={newExp.amount} onChange={(v: string) => setNewExp(p => ({ ...p, amount: v }))} type="number" required />
        <Textarea label="Заметки" value={newExp.notes} onChange={(v: string) => setNewExp(p => ({ ...p, notes: v }))} rows={2} />
        <Btn full onClick={addExp} disabled={!newExp.category || !newExp.amount}>Добавить</Btn>
      </Modal>
    </div>
  );
}

function BooksView({ books, setBooks, toast, onBack }: any) {
  const [modal, setModal] = useState<string | null>(null);
  const [editB, setEditB] = useState<any>(null);
  const [form, setForm] = useState({ title: "", desc: "", price: "" });

  const openAdd = () => { setForm({ title: "", desc: "", price: "" }); setEditB(null); setModal("form"); };
  const openEdit = (b: any) => { setForm({ title: b.title, desc: b.desc, price: String(b.price) }); setEditB(b); setModal("form"); };

  const save = async () => {
    if (!form.title) return;
    if (editB) {
      const updated = { ...editB, ...form, price: Number(form.price) };
      setBooks((p: any) => p.map((b: any) => b.id === editB.id ? updated : b));
      await sb.patch("ak_books", editB.id, { ...form, price: Number(form.price) });
      toast("Книга обновлена!");
    } else {
      const b = { ...form, id: Date.now(), price: Number(form.price) };
      setBooks((p: any) => [...p, b]);
      await sb.add("ak_books", b);
      toast("Книга добавлена!");
    }
    setModal(null);
  };

  const del = async (id: any) => {
    setBooks((p: any) => p.filter((b: any) => b.id !== id));
    await sb.del("ak_books", id);
    toast("Удалено");
  };

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <BackHeader title="Книги" icon={BookOpen} onBack={onBack} />
      <Btn full onClick={openAdd} style={{ marginBottom: 16 }}><Plus size={16} />Добавить книгу</Btn>
      {books.map((b: any) => (
        <Card key={b.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.text, display: "flex", alignItems: "center", gap: 8 }}><BookOpen size={16} color={C.primary as string} />{b.title}</div>
              {b.desc && <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{b.desc}</div>}
              <div style={{ marginTop: 8 }}><Badge text={`${b.price} сом`} color={C.success} /></div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openEdit(b)} style={{ background: C.primaryLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.primary, display: "flex" }}><Pencil size={15} /></button>
              <button onClick={() => del(b.id)} style={{ background: C.dangerLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.danger, display: "flex" }}><Trash2 size={15} /></button>
            </div>
          </div>
        </Card>
      ))}
      {books.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Книг пока нет</div></Card>}

      <Modal open={modal === "form"} onClose={() => setModal(null)} title={editB ? "Редактировать книгу" : "Новая книга"}>
        <Inp label="Название" value={form.title} onChange={(v: string) => setForm(p => ({ ...p, title: v }))} required />
        <Textarea label="Описание" value={form.desc} onChange={(v: string) => setForm(p => ({ ...p, desc: v }))} rows={2} />
        <Inp label="Цена (сом)" value={form.price} onChange={(v: string) => setForm(p => ({ ...p, price: v }))} type="number" />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full onClick={save} disabled={!form.title}>Сохранить</Btn>
          <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
        </div>
      </Modal>
    </div>
  );
}

function FormatsView({ formats, setFormats, toast, onBack }: any) {
  const [modal, setModal] = useState<string | null>(null);
  const [editF, setEditF] = useState<any>(null);
  const [form, setForm] = useState({ name: "", price: "", teacher_rate: "" });

  const openAdd = () => { setForm({ name: "", price: "", teacher_rate: "" }); setEditF(null); setModal("form"); };
  const openEdit = (f: any) => { setForm({ name: f.name, price: String(f.price), teacher_rate: String(f.teacher_rate) }); setEditF(f); setModal("form"); };

  const save = async () => {
    if (!form.name || !form.price) return;
    const data = { ...form, price: Number(form.price), teacher_rate: Number(form.teacher_rate) };
    if (editF) {
      setFormats((p: any) => p.map((f: any) => f.id === editF.id ? { ...editF, ...data } : f));
      await sb.patch("ak_formats", editF.id, data);
      toast("Формат обновлён!");
    } else {
      const f = { ...data, id: Date.now() };
      setFormats((p: any) => [...p, f]);
      await sb.add("ak_formats", f);
      toast("Формат добавлен!");
    }
    setModal(null);
  };

  const del = async (id: any) => {
    setFormats((p: any) => p.filter((f: any) => f.id !== id));
    await sb.del("ak_formats", id);
    toast("Удалено");
  };

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <BackHeader title="Форматы и цены" icon={Wrench} onBack={onBack} />
      <Btn full onClick={openAdd} style={{ marginBottom: 16 }}><Plus size={16} />Добавить формат</Btn>
      {formats.map((f: any) => (
        <Card key={f.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{f.name}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Цена: <b style={{ color: C.success }}>{f.price} сом</b> · Педагог: <b style={{ color: C.accent }}>{f.teacher_rate} сом</b></div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openEdit(f)} style={{ background: C.primaryLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.primary, display: "flex" }}><Pencil size={15} /></button>
              <button onClick={() => del(f.id)} style={{ background: C.dangerLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.danger, display: "flex" }}><Trash2 size={15} /></button>
            </div>
          </div>
        </Card>
      ))}
      <Modal open={modal === "form"} onClose={() => setModal(null)} title={editF ? "Редактировать формат" : "Новый формат"}>
        <Inp label="Название" value={form.name} onChange={(v: string) => setForm(p => ({ ...p, name: v }))} placeholder="Выезд, Загород..." required />
        <Inp label="Цена для клиента (сом)" value={form.price} onChange={(v: string) => setForm(p => ({ ...p, price: v }))} type="number" required />
        <Inp label="Ставка педагога (сом)" value={form.teacher_rate} onChange={(v: string) => setForm(p => ({ ...p, teacher_rate: v }))} type="number" />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full onClick={save} disabled={!form.name || !form.price}>Сохранить</Btn>
          <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
        </div>
      </Modal>
    </div>
  );
}

function DistrictsView({ toast, onBack }: any) {
  const [districts, setDistricts] = useState<any[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const [editD, setEditD] = useState<any>(null);
  const [form, setForm] = useState({ teacher_name: "", main_districts: "", nearby_districts: "", subjects: "", language: "ru", can_kg: false });

  useEffect(() => { sb.all("akteacher_districts").then(d => { if (d?.length) setDistricts(d); }); }, []);

  const openAdd = () => { setForm({ teacher_name: "", main_districts: "", nearby_districts: "", subjects: "", language: "ru", can_kg: false }); setEditD(null); setModal("form"); };
  const openEdit = (d: any) => { setForm({ teacher_name: d.teacher_name, main_districts: d.main_districts || "", nearby_districts: d.nearby_districts || "", subjects: d.subjects || "", language: d.language || "ru", can_kg: !!d.can_kg }); setEditD(d); setModal("form"); };

  const save = async () => {
    if (!form.teacher_name) return;
    if (editD) {
      setDistricts(p => p.map(d => d.id === editD.id ? { ...d, ...form } : d));
      await sb.patch("akteacher_districts", editD.id, form);
      toast("Обновлено!");
    } else {
      const rec = { ...form, id: Date.now() };
      setDistricts(p => [...p, rec]);
      await sb.add("akteacher_districts", rec);
      toast("Добавлено!");
    }
    setModal(null);
  };

  const del = async (id: any) => {
    setDistricts(p => p.filter(d => d.id !== id));
    await sb.del("akteacher_districts", id);
    toast("Удалено");
  };

  const langLabel: any = { ru: "Русский", kg: "Кыргызский", both: "Оба языка" };

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <BackHeader title="Карта районов" icon={Map} onBack={onBack} />
      <Btn full onClick={openAdd} style={{ marginBottom: 16 }}><Plus size={16} />Добавить педагога</Btn>
      {districts.map(d => (
        <Card key={d.id} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: C.text }}>{d.teacher_name}</div>
              {d.main_districts && <><div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>ОСНОВНЫЕ</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>{d.main_districts.split(",").map((r: string) => r.trim()).filter(Boolean).map((r: string) => <Badge key={r} text={r} color={C.primary} />)}</div></>}
              {d.subjects && <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}><IT icon={BookOpen}>{d.subjects}</IT></div>}
              <div style={{ fontSize: 12, color: C.muted }}>{langLabel[d.language] || langLabel.ru}</div>
              {d.can_kg && <div style={{ fontSize: 12, color: C.success, fontWeight: 700, marginTop: 4 }}><IT icon={CheckCircle2}>Кыргызские классы</IT></div>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openEdit(d)} style={{ background: C.primaryLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.primary, display: "flex" }}><Pencil size={15} /></button>
              <button onClick={() => del(d.id)} style={{ background: C.dangerLight, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: C.danger, display: "flex" }}><Trash2 size={15} /></button>
            </div>
          </div>
        </Card>
      ))}
      {districts.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Нет данных</div></Card>}

      <Modal open={modal === "form"} onClose={() => setModal(null)} title={editD ? "Редактировать" : "Добавить педагога"}>
        <Inp label="Имя педагога" value={form.teacher_name} onChange={(v: string) => setForm(p => ({ ...p, teacher_name: v }))} required />
        <Textarea label="Основные районы (через запятую)" value={form.main_districts} onChange={(v: string) => setForm(p => ({ ...p, main_districts: v }))} rows={2} />
        <Textarea label="Соседние районы (через запятую)" value={form.nearby_districts} onChange={(v: string) => setForm(p => ({ ...p, nearby_districts: v }))} rows={2} />
        <Textarea label="Предметы" value={form.subjects} onChange={(v: string) => setForm(p => ({ ...p, subjects: v }))} rows={2} />
        <Sel label="Язык обучения" value={form.language} onChange={(v: string) => setForm(p => ({ ...p, language: v }))} options={[{ value: "ru", label: "Только русский" }, { value: "kg", label: "Только кыргызский" }, { value: "both", label: "Оба языка" }]} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <input type="checkbox" checked={form.can_kg} onChange={e => setForm(p => ({ ...p, can_kg: e.target.checked }))} style={{ width: 20, height: 20 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Ведёт кыргызские классы</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full onClick={save} disabled={!form.teacher_name}>Сохранить</Btn>
          <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══ ПАНЕЛЬ АДМИНИСТРАТОРА ═══
function AdminApp({ user, onLogout, data, setters }: any) {
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const isDesktop = useIsDesktop();

  const { students, teachers, leads, reports, formats, books } = data;
  const { setStudents, setTeachers, setLeads, setFormats, setBooks } = setters;

  const tabs = [
    { key: "home",     icon: Home,          label: "Главная"  },
    { key: "leads",    icon: Target,        label: "Лиды"     },
    { key: "students", icon: Users,         label: "Ученики"  },
    { key: "teachers", icon: GraduationCap, label: "Педагоги" },
    { key: "more",     icon: MoreHorizontal,label: "Ещё"      },
  ];

  const content = (
    <>
      {tab === "home"     && <AdminHome students={students} teachers={teachers} leads={leads} reports={reports} formats={formats} />}
      {tab === "leads"    && <LeadsTab leads={leads} setLeads={setLeads} teachers={teachers} toast={showToast} formats={formats} />}
      {tab === "students" && <StudentsTab students={students} setStudents={setStudents} teachers={teachers} formats={formats} toast={showToast} />}
      {tab === "teachers" && <TeachersTab teachers={teachers} setTeachers={setTeachers} students={students} toast={showToast} />}
      {tab === "more"     && <MoreTab reports={reports} students={students} teachers={teachers} formats={formats} setFormats={setFormats} books={books} setBooks={setBooks} leads={leads} toast={showToast} />}
    </>
  );

  return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: "100vh" }}>
      <Toast msg={toast} />
      {isDesktop ? (
        <>
          <SideNav tabs={tabs} active={tab} onSelect={setTab} roleLabel="Руководитель" onLogout={onLogout} />
          <div style={{ marginLeft: SIDENAV_WIDTH, maxWidth: 720 }}>{content}</div>
        </>
      ) : (
        <>
          <div style={{ paddingTop: 8 }}>{content}</div>
          <TabBar tabs={tabs} active={tab} onSelect={setTab} />
        </>
      )}
    </div>
  );
}

// ═══ ПАНЕЛЬ ПЕДАГОГА ═══
function TeacherApp({ user, onLogout, students, setStudents, reports, setReports, teachers, setTeachers, leads, setLeads }: any) {
  const [tab, setTab] = useState("students");
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const myStudents = students.filter((s: any) => s.teacherId === user.id);
  const myReports = reports.filter((r: any) => r.teacherId === user.id);

  const tabs = [
    { key: "students", icon: Users,         label: "Ученики"  },
    { key: "report",   icon: Plus,          label: "Отчёт"    },
    { key: "history",  icon: ClipboardList, label: "История"  },
    { key: "schedule", icon: Calendar,      label: "График"   },
    { key: "newleads", icon: Target,        label: "Новые"    },
  ];

  return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: "100vh" }}>
      <Toast msg={toast} />
      <div style={{ background: C.primary, padding: "16px 16px 48px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Педагог</div>
            <div style={{ fontSize: 19, fontWeight: 900 }}>Привет, {user.name}!</div>
          </div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 12, padding: "8px 12px", color: "#fff", cursor: "pointer", fontFamily: FONT, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><LogOut size={15} />Выйти</button>
        </div>
      </div>

      <div style={{ marginTop: -24, padding: "0 16px 90px" }}>
        {tab === "students" && <TeacherStudents students={myStudents} />}
        {tab === "report"   && <TeacherReport user={user} students={myStudents} setReports={setReports} setStudents={setStudents} showToast={showToast} />}
        {tab === "history"  && <TeacherHistory reports={myReports} />}
        {tab === "schedule" && <TeacherScheduleEdit user={user} setTeachers={setTeachers} showToast={showToast} />}
        {tab === "newleads" && <TeacherNewLeads user={user} leads={leads} setLeads={setLeads} showToast={showToast} />}
      </div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
    </div>
  );
}

function TeacherScheduleEdit({ user, setTeachers, showToast }: any) {
  const [schedule, setSchedule] = useState<any[]>(user.schedule || INIT_SCHEDULE);
  const save = async () => {
    setTeachers((p: any) => p.map((t: any) => t.id === user.id ? { ...t, schedule } : t));
    await sb.patch("ak_teachers", user.id, { schedule });
    showToast("Расписание сохранено!");
  };
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: C.text }}><Calendar size={19} color={C.primary as string} />Моё расписание</div>
      <ScheduleEditor schedule={schedule} onChange={setSchedule} />
      <Btn full onClick={save}>Сохранить расписание</Btn>
    </div>
  );
}

function TeacherStudents({ students }: any) {
  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 16, marginTop: 8, color: C.text }}>Мои ученики ({students.length})</div>
      {students.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Учеников пока нет</div></Card>}
      {students.map((s: any) => (
        <Card key={s.id} style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{s.name}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{s.grade}</div>
          {s.address && <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}><IT icon={MapPin}>{s.address}</IT></div>}
          {s.parentPhone && <div style={{ fontSize: 13, color: C.muted }}><IT icon={Phone}>{s.parentPhone}</IT></div>}
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {s.format && <Badge text={s.format} color={C.primary} />}
            {(s.days || []).map((d: string) => <Badge key={d} text={d} color={C.muted} />)}
            {s.time && <Badge text={s.time} color={C.success} />}
          </div>
        </Card>
      ))}
    </div>
  );
}

function TeacherReport({ user, students, setReports, setStudents, showToast }: any) {
  const [type, setType] = useState<"lesson" | "trial" | null>(null);
  const [form, setForm] = useState({ studentId: "", studentName: "", topic: "", notes: "", homework: "", rating: 5, files: [] as any[] });
  const [trialForm, setTrialForm] = useState({ childName: "", childAge: "", childGrade: "", parentName: "", parentPhone: "", subject: "", notes: "", decision: "", rejectReason: "", suggestedDays: "", suggestedTime: "", files: [] as any[] });
  const [sent, setSent] = useState(false);

  if (sent) return (
    <Card style={{ textAlign: "center", padding: 40, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><PartyPopper size={44} color={C.success} /></div>
      <div style={{ fontWeight: 900, fontSize: 19, color: C.success }}>Отчёт отправлен!</div>
      <div style={{ marginTop: 20 }}><Btn onClick={() => { setSent(false); setType(null); }}>Новый отчёт</Btn></div>
    </Card>
  );

  if (!type) return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 16, color: C.text }}>Какой отчёт?</div>
      <Card onClick={() => setType("lesson")} style={{ marginBottom: 12, display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ClipboardList size={22} color={C.primary as string} /></div>
        <div><div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Обычный урок</div><div style={{ fontSize: 13, color: C.muted }}>Тема, заметки, фото/видео</div></div>
      </Card>
      <Card onClick={() => setType("trial")} style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FlaskConical size={22} color={C.accent as string} /></div>
        <div><div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Пробный урок</div><div style={{ fontSize: 13, color: C.muted }}>Оценка ребёнка, решение</div></div>
      </Card>
    </div>
  );

  const sendLesson = async () => {
    if (!form.studentId || form.files.length === 0) { showToast("Добавьте фото/видео!"); return; }
    const report = {
      id: Date.now(), type: "lesson", teacherId: user.id, teacherName: user.name,
      teacherAvatar: user.avatar, teacherColor: user.color,
      studentId: Number(form.studentId),
      studentName: students.find((s: any) => String(s.id) === form.studentId)?.name || form.studentName,
      topic: form.topic, notes: form.notes, homework: form.homework, rating: form.rating,
      files: form.files, date: new Date().toLocaleDateString("ru-RU"),
    };
    setReports((p: any) => [report, ...p]);
    await sb.add("ak_reports", report);
    const txt = `📝 <b>Отчёт педагога</b>\n👩‍🏫 ${user.name}\n👦 ${report.studentName}\n📚 ${form.topic}\n⭐ ${form.rating}/5${form.notes ? `\n💬 ${form.notes}` : ""}${form.homework ? `\n📝 Д/З: ${form.homework}` : ""}`;
    await tg(txt);
    for (const f of form.files) { if (f.url && !f.isVideo) await tgPhoto(f.url, `${user.name} — ${report.studentName}`); }
    setSent(true); showToast("Отчёт отправлен в Telegram!");
  };

  const sendTrial = async () => {
    if (!trialForm.childName) return;
    const report = {
      id: Date.now(), type: "trial", teacherId: user.id, teacherName: user.name,
      teacherAvatar: user.avatar, teacherColor: user.color,
      studentName: trialForm.childName, ...trialForm,
      date: new Date().toLocaleDateString("ru-RU"),
    };
    setReports((p: any) => [report, ...p]);
    await sb.add("ak_reports", report);

    if (trialForm.decision === "take") {
      const parsedDays = trialForm.suggestedDays
        ? trialForm.suggestedDays.split(/[,\s]+/).map((d: string) => d.trim()).filter(Boolean)
        : [];
      const student = {
        id: Date.now() + 1,
        name: trialForm.childName,
        grade: trialForm.childGrade || "",
        parentPhone: trialForm.parentPhone || "",
        parentName: trialForm.parentName || "",
        subject: trialForm.subject || "",
        teacherId: user.id,
        teacherName: user.name,
        days: parsedDays,
        time: trialForm.suggestedTime || "",
        format: "",
        status: "active",
        createdAt: new Date().toISOString(),
      };
      setStudents((p: any) => [...p, student]);
      await sb.add("ak_students", student);
    }

    const dec = trialForm.decision === "take" ? "✅ БЕРЁТ" : `❌ НЕ БЕРЁТ${trialForm.rejectReason ? `: ${trialForm.rejectReason}` : ""}`;
    await tg(`🧪 <b>Пробный урок</b>\n👩‍🏫 ${user.name}\n👶 ${trialForm.childName}, ${trialForm.childAge} лет, ${trialForm.childGrade}\n📞 ${trialForm.parentPhone}\n📚 ${trialForm.subject}\n${dec}${trialForm.notes ? `\n💬 ${trialForm.notes}` : ""}${trialForm.suggestedDays ? `\n📅 Дни: ${trialForm.suggestedDays}` : ""}${trialForm.suggestedTime ? ` 🕐 ${trialForm.suggestedTime}` : ""}`);
    setSent(true); showToast(trialForm.decision === "take" ? "Ученик добавлен автоматически!" : "Отчёт отправлен!");
  };

  if (type === "lesson") return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setType(null)} style={{ background: "none", border: "none", color: C.primary, fontWeight: 700, fontSize: 15, cursor: "pointer", padding: 0, marginBottom: 16, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }}><ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />Назад</button>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 16, color: C.text }}>Отчёт об уроке</div>
      <Sel label="Ученик" value={form.studentId} onChange={(v: string) => setForm(p => ({ ...p, studentId: v }))} options={students.map((s: any) => ({ value: s.id, label: s.name }))} required />
      <Inp label="Тема урока" value={form.topic} onChange={(v: string) => setForm(p => ({ ...p, topic: v }))} placeholder="Сложение в пределах 10" required />
      <Textarea label="Заметки" value={form.notes} onChange={(v: string) => setForm(p => ({ ...p, notes: v }))} placeholder="Как прошёл урок?" rows={3} />
      <Textarea label="Домашнее задание" value={form.homework} onChange={(v: string) => setForm(p => ({ ...p, homework: v }))} rows={2} />
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Рейтинг урока</div>
        <Stars value={form.rating} onChange={(v: number) => setForm(p => ({ ...p, rating: v }))} />
      </div>
      <FileUpload label="Фото / видео (обязательно)" files={form.files} onChange={(v: any) => setForm(p => ({ ...p, files: v }))} />
      {form.files.length === 0 && <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={15} />Нужно добавить хотя бы одно фото или видео</div>}
      <Btn full onClick={sendLesson} disabled={!form.studentId || !form.topic || form.files.length === 0}><Send size={16} />Отправить отчёт</Btn>
    </div>
  );

  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setType(null)} style={{ background: "none", border: "none", color: C.primary, fontWeight: 700, fontSize: 15, cursor: "pointer", padding: 0, marginBottom: 16, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }}><ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />Назад</button>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 16, color: C.text }}>Пробный урок</div>
      <Inp label="Имя ребёнка" value={trialForm.childName} onChange={(v: string) => setTrialForm(p => ({ ...p, childName: v }))} required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="Возраст" value={trialForm.childAge} onChange={(v: string) => setTrialForm(p => ({ ...p, childAge: v }))} placeholder="6.5 лет" />
        <Inp label="Класс" value={trialForm.childGrade} onChange={(v: string) => setTrialForm(p => ({ ...p, childGrade: v }))} placeholder="1 класс" />
      </div>
      <Inp label="Имя родителя" value={trialForm.parentName} onChange={(v: string) => setTrialForm(p => ({ ...p, parentName: v }))} />
      <Inp label="Телефон родителя" value={trialForm.parentPhone} onChange={(v: string) => setTrialForm(p => ({ ...p, parentPhone: v }))} />
      <Inp label="Предмет" value={trialForm.subject} onChange={(v: string) => setTrialForm(p => ({ ...p, subject: v }))} />
      <Textarea label="Заметки" value={trialForm.notes} onChange={(v: string) => setTrialForm(p => ({ ...p, notes: v }))} rows={3} />
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: "uppercase" }}>Решение</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setTrialForm(p => ({ ...p, decision: "take" }))} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1.5px solid ${trialForm.decision === "take" ? C.success : C.border}`, background: trialForm.decision === "take" ? C.successLight : "transparent", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: FONT, color: C.success, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><CheckCircle2 size={17} />Берёт</button>
          <button onClick={() => setTrialForm(p => ({ ...p, decision: "reject" }))} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1.5px solid ${trialForm.decision === "reject" ? C.danger : C.border}`, background: trialForm.decision === "reject" ? C.dangerLight : "transparent", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: FONT, color: C.danger, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><XCircle size={17} />Не берёт</button>
        </div>
        {trialForm.decision === "reject" && (
          <div style={{ marginTop: 10 }}>
            <Sel label="" value={trialForm.rejectReason} onChange={(v: string) => setTrialForm(p => ({ ...p, rejectReason: v }))} options={REJECT_REASONS} />
          </div>
        )}
      </div>
      <Inp label="Удобные дни" value={trialForm.suggestedDays} onChange={(v: string) => setTrialForm(p => ({ ...p, suggestedDays: v }))} placeholder="Пн, Ср, Пт" />
      <Inp label="Удобное время" value={trialForm.suggestedTime} onChange={(v: string) => setTrialForm(p => ({ ...p, suggestedTime: v }))} placeholder="14:00–16:00" />
      <FileUpload label="Фото / видео" files={trialForm.files} onChange={(v: any) => setTrialForm(p => ({ ...p, files: v }))} />
      <Btn full onClick={sendTrial} disabled={!trialForm.childName || !trialForm.decision}><Send size={16} />Отправить отчёт</Btn>
    </div>
  );
}

function TeacherHistory({ reports }: any) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 16, color: C.text }}>Мои отчёты ({reports.length})</div>
      {reports.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Отчётов пока нет</div></Card>}
      {reports.map((r: any) => (
        <Card key={r.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 800, color: C.text, display: "flex", alignItems: "center", gap: 7 }}>{r.type === "trial" ? <FlaskConical size={15} color={C.accent as string} /> : <ClipboardList size={15} color={C.primary as string} />}{r.studentName}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{r.date}</div>
            </div>
            {r.rating && <Stars value={r.rating} />}
          </div>
          {r.topic && <div style={{ fontSize: 13, color: C.text }}>{r.topic}</div>}
          {r.notes && <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}><IT icon={MessageSquare}>{r.notes}</IT></div>}
          {r.files && r.files.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {r.files.filter((f: any) => f.isVideo).map((f: any, i: number) => (
                <div key={`v${i}`} style={{ marginBottom: 8 }}><VideoPlayer url={f.url} /></div>
              ))}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {r.files.filter((f: any) => !f.isVideo).map((f: any, i: number) => (
                  <img key={i} src={f.url} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, cursor: "pointer" }} onClick={() => window.open(f.url, "_blank")} />
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function TeacherNewLeads({ user, leads, setLeads, showToast }: any) {
  const myDistricts: string[] = user.districts || [];
  const available = leads.filter((l: any) =>
    l.status === "new" && !l.teacherId && myDistricts.includes(l.district)
  );

  const take = async (lead: any) => {
    const patch = { status: "trial", teacherName: user.name, teacherId: user.id };
    setLeads((p: any[]) => p.map(l => l.id === lead.id ? { ...l, ...patch } : l));
    await sb.patch("ak_leads", lead.id, patch);
    showToast("Лид принят! Позвони родителю.");
  };

  const claimed = leads.filter((l: any) => l.teacherId === user.id && l.status === "trial");

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 4, display: "flex", alignItems: "center", gap: 8, color: C.text }}><Target size={19} color={C.primary as string} />Новые ученики</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Лиды по вашим районам</div>

      {available.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Новых лидов нет</div></Card>}
      {available.map((l: any) => (
        <Card key={l.id} style={{ marginBottom: 10, borderLeft: `3px solid ${C.primary}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{l.childName}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{l.childAge ? `${l.childAge} лет` : ""} {l.childGrade || ""}</div>
            </div>
            <Badge text={l.district} color={C.primary} />
          </div>
          {l.subject && <div style={{ fontSize: 13, marginBottom: 4, color: C.text }}><IT icon={BookOpen}>{l.subject}</IT></div>}
          {l.parentName && <div style={{ fontSize: 13, color: C.muted }}><IT icon={User}>{l.parentName}</IT></div>}
          {l.notes && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}><IT icon={MessageSquare}>{l.notes}</IT></div>}
          <div style={{ marginTop: 12 }}>
            <Btn full onClick={() => take(l)}>Беру этого ученика</Btn>
          </div>
        </Card>
      ))}

      {claimed.length > 0 && (
        <>
          <div style={{ fontSize: 15, fontWeight: 800, marginTop: 20, marginBottom: 10, color: C.text }}>Мои принятые лиды</div>
          {claimed.map((l: any) => (
            <Card key={l.id} style={{ marginBottom: 10, borderLeft: `3px solid ${C.success}` }}>
              <div style={{ fontWeight: 800, color: C.text }}>{l.childName}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{l.district}</div>
              {l.parentPhone && <div style={{ fontSize: 14, fontWeight: 700, color: C.success, marginTop: 8 }}><IT icon={Phone} color={C.success} size={15}>{l.parentPhone}</IT></div>}
              {l.parentName && <div style={{ fontSize: 13, color: C.muted }}><IT icon={User}>{l.parentName}</IT></div>}
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

// ═══ ПАНЕЛЬ КООРДИНАТОРА ═══
function CoordinatorApp({ user, onLogout, leads, setLeads, teachers, students, reports }: any) {
  const [tab, setTab] = useState("feed");
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const isDesktop = useIsDesktop();

  const tabs = [
    { key: "feed",     icon: Rss,           label: "Лента"    },
    { key: "trials",   icon: FlaskConical,  label: "Пробные"  },
    { key: "teachers", icon: GraduationCap, label: "Педагоги" },
  ];

  const content = (
    <>
      {tab === "feed"     && <CoordFeed leads={leads} setLeads={setLeads} teachers={teachers} showToast={showToast} />}
      {tab === "trials"   && <CoordTrials reports={reports} />}
      {tab === "teachers" && <CoordTeachers teachers={teachers} students={students} reports={reports} />}
    </>
  );

  return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: "100vh" }}>
      <Toast msg={toast} />
      {isDesktop ? (
        <>
          <SideNav tabs={tabs} active={tab} onSelect={setTab} roleLabel="Координатор" onLogout={onLogout} />
          <div style={{ marginLeft: SIDENAV_WIDTH, maxWidth: 720, padding: "24px 16px 0" }}>{content}</div>
        </>
      ) : (
        <>
          <div style={{ background: C.primary, padding: "16px 16px 48px", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Координатор</div>
                <div style={{ fontSize: 19, fontWeight: 900 }}>Привет, {user.name}!</div>
              </div>
              <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 12, padding: "8px 12px", color: "#fff", cursor: "pointer", fontFamily: FONT, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><LogOut size={15} />Выйти</button>
            </div>
          </div>
          <div style={{ marginTop: -24, padding: "0 16px 90px" }}>{content}</div>
          <TabBar tabs={tabs} active={tab} onSelect={setTab} />
        </>
      )}
    </div>
  );
}

function CoordFeed({ leads, setLeads, teachers, showToast }: any) {
  const newLeads    = leads.filter((l: any) => l.status === "new");
  const activeLeads = leads.filter((l: any) => l.status === "trial");
  const doneLeads   = leads.filter((l: any) => l.status === "student" || l.status === "rejected");

  const assign = async (lead: any, teacherId: string) => {
    const t = teachers.find((t: any) => String(t.id) === teacherId);
    if (!t) return;
    const patch = { status: "trial", teacherId: t.id, teacherName: t.name };
    setLeads((p: any[]) => p.map(l => l.id === lead.id ? { ...l, ...patch } : l));
    await sb.patch("ak_leads", lead.id, patch);
    showToast(`Назначен педагог: ${t.name}`);
  };

  const Section = ({ title, items, color }: any) => items.length === 0 ? null : (
    <>
      <div style={{ fontSize: 13, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, marginTop: 16 }}>{title} ({items.length})</div>
      {items.map((l: any) => (
        <Card key={l.id} style={{ marginBottom: 10, borderLeft: `3px solid ${color}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{l.childName}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{l.parentName} · {l.parentPhone}</div>
            </div>
            <Badge text={l.district || "—"} color={C.primary} />
          </div>
          {l.subject && <div style={{ fontSize: 13, marginBottom: 4, color: C.text }}><IT icon={BookOpen}>{l.subject}</IT></div>}
          {l.source  && <div style={{ fontSize: 12, color: C.muted }}>{l.source}</div>}
          {l.status === "new" && (
            <div style={{ marginTop: 10 }}>
              <Sel label="Назначить педагога" value={l.teacherId ? String(l.teacherId) : ""}
                onChange={(v: string) => assign(l, v)}
                options={[{ value: "", label: "— выбрать —" }, ...teachers.filter((t: any) => !t.districts?.length || t.districts.includes(l.district)).map((t: any) => ({ value: String(t.id), label: t.name }))]}
              />
            </div>
          )}
          {l.teacherName && <div style={{ fontSize: 13, color: C.success, fontWeight: 700, marginTop: 6 }}><IT icon={GraduationCap} color={C.success}>{l.teacherName}</IT></div>}
        </Card>
      ))}
    </>
  );

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 17, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, color: C.text }}><Rss size={19} color={C.primary as string} />Живая лента лидов</div>
        <button onClick={() => tgButtons("📊 Запросить отчёт:", [[{ text: "📊 Вечерний отчёт", data: "evening_report" }]])} style={{ background: C.primaryLight, border: "none", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }}><Send size={13} />Отчёт в TG</button>
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Обновляется каждые 15 сек</div>
      {leads.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Лидов пока нет</div></Card>}
      <Section title="Новые" items={newLeads} color={C.primary} />
      <Section title="На пробном" items={activeLeads} color={C.accent} />
      <Section title="Завершённые" items={doneLeads} color={C.muted} />
    </div>
  );
}

function CoordTrials({ reports }: any) {
  const trials = reports.filter((r: any) => r.type === "trial").sort((a: any, b: any) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: C.text }}><FlaskConical size={19} color={C.accent as string} />Пробные уроки ({trials.length})</div>
      {trials.length === 0 && <Card><div style={{ textAlign: "center", color: C.muted, padding: 32 }}>Пробных уроков пока нет</div></Card>}
      {trials.map((r: any) => {
        const took = r.decision === "take";
        return (
          <Card key={r.id} style={{ marginBottom: 10, borderLeft: `3px solid ${took ? C.success : C.danger}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{r.studentName || r.childName}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{r.date} · {r.teacherName}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, color: took ? C.success : C.danger, display: "flex", alignItems: "center", gap: 6 }}>{took ? <CheckCircle2 size={15} /> : <XCircle size={15} />}{took ? "Берёт" : "Отказ"}</div>
            </div>
            {r.parentPhone && <div style={{ fontSize: 13, color: C.text }}><IT icon={Phone}>{r.parentPhone}</IT></div>}
            {r.subject && <div style={{ fontSize: 13, color: C.muted }}><IT icon={BookOpen}>{r.subject}</IT></div>}
            {r.suggestedDays && <div style={{ fontSize: 12, color: C.muted }}><IT icon={Calendar}>{r.suggestedDays} {r.suggestedTime}</IT></div>}
            {!took && r.rejectReason && <div style={{ fontSize: 12, color: C.danger, marginTop: 4 }}>{r.rejectReason}</div>}
          </Card>
        );
      })}
    </div>
  );
}

function CoordTeachers({ teachers, students, reports }: any) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: C.text }}><GraduationCap size={19} color={C.primary as string} />Статистика педагогов</div>
      {teachers.filter((t: any) => t.role === "teacher").map((t: any) => {
        const myStudents = students.filter((s: any) => s.teacherId === t.id);
        const myReports  = reports.filter((r: any) => r.teacherId === t.id);
        const myTrials   = myReports.filter((r: any) => r.type === "trial");
        const took       = myTrials.filter((r: any) => r.decision === "take");
        const activeSchedule = (t.schedule || []).filter((s: any) => s.start && s.end);
        return (
          <Card key={t.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <Av l={t.avatar} color={t.color} size={44} photo={t.photoUrl} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{t.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{t.subject}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              {[["Ученики", myStudents.length, C.primary, Users], ["Пробных", myTrials.length, C.accent, FlaskConical], ["Взяли", took.length, C.success, CheckCircle2]].map(([label, val, color, I]: any) => (
                <div key={label} style={{ background: C.bg, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><I size={15} color={color as string} /></div>
                  <div style={{ fontSize: 19, fontWeight: 900, color }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
                </div>
              ))}
            </div>
            {t.districts?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                {t.districts.map((d: string) => <Badge key={d} text={d} color={C.primary} />)}
              </div>
            )}
            {activeSchedule.length > 0 && (
              <div style={{ fontSize: 12, color: C.muted }}>
                <IT icon={Calendar}>{activeSchedule.map((s: any) => `${s.day} ${s.start}–${s.end}`).join(", ")}</IT>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ═══ ГЛАВНЫЙ КОМПОНЕНТ ═══
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [teachers, setTeachers] = useState<any[]>(INIT_TEACHERS);
  const [students, setStudents] = useState<any[]>([]);
  const [leads, setLeads]       = useState<any[]>([]);
  const [reports, setReports]   = useState<any[]>([]);
  const [formats, setFormats]   = useState<any[]>(INIT_FORMATS);
  const [books, setBooks]       = useState<any[]>(INIT_BOOKS);

  useEffect(() => {
    const load = async () => {
      const [t, s, l, r, f, b] = await Promise.all([
        sb.all("ak_teachers"), sb.all("ak_students"), sb.all("ak_leads"),
        sb.all("ak_reports"),  sb.all("ak_formats"),  sb.all("ak_books"),
      ]);
      if (t?.length) setTeachers(t);
      if (s?.length) setStudents(s);
      if (l?.length) setLeads(l);
      if (r?.length) setReports(r);
      if (f?.length) setFormats(f);
      if (b?.length) setBooks(b);
      setLoading(false);
    };
    load();
    // Авто-обновление лидов и отчётов
    const iv = setInterval(() => {
      sb.all("ak_leads").then(l => { if (l?.length) setLeads(l); });
      sb.all("ak_reports").then(r => { if (r?.length) setReports(r); });
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  const allUsers = [ADMIN, ...teachers];

  if (loading) return <Loading />;
  if (!user) return <Login onLogin={setUser} teachers={teachers} />;

  if (user.role === "coordinator") return (
    <CoordinatorApp
      user={user} onLogout={() => setUser(null)}
      leads={leads} setLeads={setLeads}
      teachers={teachers} students={students} reports={reports}
    />
  );

  if (user.role === "admin") return (
    <AdminApp
      user={user} onLogout={() => setUser(null)}
      data={{ students, teachers, leads, reports, formats, books }}
      setters={{ setStudents, setTeachers, setLeads, setFormats, setBooks }}
    />
  );

  return (
    <TeacherApp
      user={user} onLogout={() => setUser(null)}
      students={students} setStudents={setStudents}
      reports={reports} setReports={setReports}
      teachers={teachers} setTeachers={setTeachers}
      leads={leads} setLeads={setLeads}
    />
  );
}
