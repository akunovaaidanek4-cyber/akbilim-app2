import React, { useState, useRef, useEffect } from "react";

const C = {
  blue: "#6BB8E8", blueDark: "#3A8CC7", blueLight: "#EBF5FC", blueMid: "#B8DDF5",
  black: "#1A1A1A", white: "#FFFFFF", success: "#4CAF7D",
  danger: "#E05C5C", warning: "#F5A623", muted: "#7A9BB5", border: "#D4EAF7",
  card: "#FFFFFF", bg: "#EBF5FC", text: "#1A2E3D", coord: "#8B6BB5",
  group: "#E07B39", home: "#5B9E6E", online: "#4AADAD", region: "#D4845A",
};

const ADMIN       = { login: "aydanek",    password: "akbilim2025", name: "Айданек",     role: "admin" };
const COORDINATOR = { login: "pomoshnica", password: "coord123",    name: "Координатор",   role: "coordinator" };
const SMM_USER    = { id: 9999, login: "smm", password: "smm2025", name: "СММ-менеджер", role: "smm", avatar: "С", color: "#E91E8C" };

const INITIAL_TEACHERS = [
  { id: 1, name: "Айгуль Бекова",      subject: "Математика",      avatar: "А", color: "#3A8CC7", login: "aigul",  password: "aigul123",  role: "teacher", rate: 600, format: "выезд",  duties: "Проводить уроки на выезде. Заполнять отчёты после каждого урока с фото." },
  { id: 2, name: "Нурзат Токтосунова", subject: "Русский язык",    avatar: "Н", color: "#5B9E6E", login: "nurzat", password: "nurzat123", role: "teacher", rate: 700, format: "офис",   duties: "Вести группы в офисе. Следить за посещаемостью. Сдавать отчёт еженедельно." },
  { id: 3, name: "Мирлан Осмонов",     subject: "Английский язык", avatar: "М", color: "#8B6BB5", login: "mirlan", password: "mirlan123", role: "teacher", rate: 650, format: "онлайн", duties: "Онлайн-уроки через Zoom. Присылать ссылки родителям заранее." },
];

const INITIAL_STUDENTS = [];
const INITIAL_PARENTS = [];
const INITIAL_GROUPS  = [];
const INITIAL_LEADS   = [];

const INITIAL_BOOKS = [
  { id: 1, title: "Методичка: Математика 1–4 класс", subject: "Математика",   icon: "📐", url: null },
  { id: 2, title: "Упражнения по русскому языку",    subject: "Русский язык", icon: "📖", url: null },
  { id: 3, title: "Английский для начинающих",       subject: "Английский",   icon: "🌍", url: null },
  { id: 4, title: "Подготовка к школе: полный курс", subject: "Дошкольная",   icon: "🎒", url: null },
];

const LEAD_STATUSES = {
  new:      { label: "🆕 Новый лид",      color: C.blue    },
  trial:    { label: "🧪 Назначен пробный", color: C.warning },
  accepted: { label: "✅ Взяли",           color: C.success },
  rejected: { label: "❌ Отказ",           color: C.danger  },
};

const REJECT_REASONS = [
  "Далеко ехать педагогу",
  "Нет подходящего педагога",
  "Не устроила цена",
  "Родитель передумал",
  "Ребёнок не подошёл по уровню",
  "Нет свободного места в группе",
  "Другой район — нет педагога",
  "Другое",
];

const TOPICS     = ["Математика","Чтение и письмо","Русский язык","Английский язык","Кыргызский язык","Окружающий мир","Подготовка к школе","Другое"];
const DAYS       = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
const DAYS_SHORT = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const TEACHER_COLORS = ["#3A8CC7","#5B9E6E","#8B6BB5","#D4845A","#4AADAD","#C45C8A","#6B8DD6","#B5804A"];
const FORMATS    = ["выезд","группа","онлайн","регион"];
const FORMAT_LABELS = { выезд: "🚗 Выезд", группа: "🏫 Группа", онлайн: "💻 Онлайн", регион: "🌍 Регион" };
const FORMAT_COLORS = { выезд: C.home, группа: C.group, онлайн: C.online, регион: C.region };
const DISTRICTS = ["Свердловский","Октябрьский","Ленинский","Первомайский","Бишкек (центр)","Другой"];
const SOURCES   = ["Instagram","Telegram","2ГИС","Рекоменд.","Звонок","Другое"];

const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const getMonthKey = (date) => `${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;
const FORMAT_RATES = {
  выезд: { income: 1000, teacher: 600, label: "🚗 Выезд обычный" },
  выезд_англ: { income: 1300, teacher: 700, label: "🚗 Выезд англ/кырг" },
  группа: { income: 7500, teacher: 700, label: "🏫 Группа (мес)" },
  онлайн: { income: 800, teacher: 400, label: "💻 Онлайн" },
  регион: { income: 1400, teacher: 600, label: "🌍 Регион" },
};

const TG_TOKEN = "8739556192:AAHpG0Od1DeqaYkbVtTu1jD0I0WGnyG6T1w";
const TG_CHAT  = "583874846";
const sendTelegram = async (text) => {
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: "HTML" }),
    });
  } catch (e) { console.log("TG error", e); }
};

const SB_URL = "https://odicvebknzkbxgclwlfx.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaWN2ZWJrbnprYnhnY2x3bGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDA3NzgsImV4cCI6MjA5MzExNjc3OH0.qM0VYf8UyeNao4K5jg14tTLsJQhpbft933l3th2mPXc";

function CollapsibleDuties({ duties, titleColor = C.blueDark }) {
  const [open, setOpen] = useState(false);
  if (!duties) return null;
  return (
    <div style={{ background: C.blueLight, borderRadius: 8, padding: "8px 10px", marginBottom: 8, fontSize: 12 }}>
      <div onClick={() => setOpen(p => !p)} style={{ cursor: "pointer", fontWeight: 700, color: titleColor, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>📋 Обязанности</span>
        <span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div style={{ marginTop: 8, lineHeight: 1.5 }}>{duties}</div>}
    </div>
  );
}

const sb = {
  h: () => ({ "apikey": SB_ANON, "Authorization": `Bearer ${SB_ANON}`, "Content-Type": "application/json" }),
  async all(table) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}?order=id.asc`, { headers: sb.h() });
      return r.ok ? await r.json() : [];
    } catch { return []; }
  },
  async add(table, data) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method: "POST", headers: { ...sb.h(), "Prefer": "return=representation" },
        body: JSON.stringify(data)
      });
      const res = await r.json();
      return Array.isArray(res) ? res[0] : res;
    } catch { return null; }
  },
  async patch(table, id, data) {
    try { await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", headers: sb.h(), body: JSON.stringify(data) }); } catch {}
  },
  async del(table, id) {
    try { await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", headers: sb.h() }); } catch {}
  },
  async upsert(table, data) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: { ...sb.h(), "Prefer": "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(data)
      });
      const res = await r.json();
      return Array.isArray(res) ? res[0] : res;
    } catch { return null; }
  },
};
const uploadFile = async (file) => {
  try {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    // Use Edge Function to upload with service role key
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const res = await fetch(`${SB_URL}/functions/v1/upload-file`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SB_ANON}`,
        "apikey": SB_ANON,
      },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Upload successful:", data);
      return { url: data.url, name: file.name, isVideo: file.type.startsWith("video/") };
    } else {
      const error = await res.text();
      console.error("Upload failed:", res.status, error);
    }
  } catch (e) { console.error("Upload error", e); }
  return { url: URL.createObjectURL(file), name: file.name, isVideo: file.type.startsWith("video/") };
};

const PandaLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill={C.blue} />
    <circle cx="25" cy="35" r="12" fill={C.black} />
    <circle cx="75" cy="35" r="12" fill={C.black} />
    <circle cx="50" cy="55" r="28" fill="#D6EDFB" stroke={C.black} strokeWidth="2.5" />
    <circle cx="40" cy="52" r="9" fill={C.black} />
    <circle cx="60" cy="52" r="9" fill={C.black} />
    <circle cx="42" cy="50" r="3" fill="white" />
    <circle cx="62" cy="50" r="3" fill="white" />
    <ellipse cx="50" cy="62" rx="4" ry="3" fill={C.black} />
    <path d="M44 67 Q50 72 56 67" stroke={C.black} strokeWidth="2" strokeLinecap="round" fill="none" />
    <rect x="30" y="26" width="40" height="5" rx="2" fill={C.blueDark} />
    <polygon points="50,10 70,26 30,26" fill={C.blueDark} />
  </svg>
);

const Av = ({ l, color, size = 40, photoUrl }) => {
  if (photoUrl) return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, boxShadow: `0 2px 8px ${color}55` }}>
      <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: size * 0.38, flexShrink: 0, boxShadow: `0 2px 8px ${color}55` }}>{l}</div>
  );
};

const Card = ({ children, style = {}, onClick }: any) => (
  <div onClick={onClick} style={{ background: C.card, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(107,184,232,0.12)", border: `1px solid ${C.border}`, cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
);

const Btn = ({ onClick, children, color = C.blue, outline = false, small = false, full = false, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? "#D4EAF7" : outline ? "transparent" : color,
    color: disabled ? C.muted : outline ? color : "#fff",
    border: outline ? `2px solid ${color}` : "none",
    borderRadius: 10, padding: small ? "7px 14px" : "11px 20px",
    fontWeight: 700, fontSize: small ? 12 : 14, cursor: disabled ? "not-allowed" : "pointer",
    width: full ? "100%" : "auto", whiteSpace: "nowrap",
    boxShadow: disabled || outline ? "none" : `0 3px 10px ${color}44`,
    fontFamily: "inherit", transition: "all 0.15s",
  }}>{children}</button>
);

const Badge = ({ text, color }) => (
  <span style={{ background: color + "18", color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap", border: `1px solid ${color}30` }}>{text}</span>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 5, letterSpacing: "0.06em" }}>{children}</div>
);

const FInput = ({ label, value, onChange, type = "text", placeholder = "", required = false }) => (
  <div style={{ marginBottom: 13 }}>
    <Label>{label}{required && <span style={{ color: C.danger }}> *</span>}</Label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none", background: C.blueLight, color: C.text }}
      onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
  </div>
);

const FSelect = ({ label, value, onChange, options, required = false }) => (
  <div style={{ marginBottom: 13 }}>
    <Label>{label}{required && <span style={{ color: C.danger }}> *</span>}</Label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: C.blueLight, color: C.text }}>
      <option value="">— Выберите —</option>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
);

const FTextarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div style={{ marginBottom: 13 }}>
    <Label>{label}</Label>
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: C.blueLight, color: C.text }} />
  </div>
);

const Stars = ({ rating, onChange }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} onClick={() => onChange?.(n)} style={{ fontSize: 24, background: "none", border: "none", cursor: onChange ? "pointer" : "default", opacity: rating >= n ? 1 : 0.2, padding: 0 }}>⭐</button>
    ))}
  </div>
);

function FileUpload({ label, files, onChange, required = false }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const handleFiles = async (e) => {
    setUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(e.target.files).map(f => uploadFile(f)));
      onChange([...files, ...uploaded]);
    } finally { setUploading(false); }
  };
  const remove = (i) => onChange(files.filter((_, idx) => idx !== i));
  return (
    <div style={{ marginBottom: 14 }}>
      <Label>{label}{required && <span style={{ color: C.danger }}> *</span>}</Label>
      <div onClick={() => !uploading && ref.current.click()} style={{ border: `2px dashed ${files.length > 0 ? C.success : required ? C.warning : C.border}`, borderRadius: 12, padding: 16, textAlign: "center", cursor: uploading ? "wait" : "pointer", background: files.length > 0 ? C.success + "08" : C.blueLight }}>
        <div style={{ fontSize: 30, marginBottom: 4 }}>{uploading ? "⏳" : files.length > 0 ? "✅" : "📸"}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: uploading ? C.warning : files.length > 0 ? C.success : C.muted }}>
          {uploading ? "Загружаю..." : files.length > 0 ? `${files.length} файл(ов) загружено ☁️` : "Нажми — фото или видео"}
        </div>
        {required && files.length === 0 && !uploading && <div style={{ fontSize: 11, color: C.warning, marginTop: 3, fontWeight: 600 }}>⚠️ Обязательно</div>}
        <input ref={ref} type="file" accept="image/*,video/*" multiple onChange={handleFiles} style={{ display: "none" }} />
      </div>
      {files.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {files.map((f, i) => (
            <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
              {f.isVideo ? <div style={{ width: "100%", height: "100%", background: C.blue, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎥</div>
                : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />}
              <button onClick={() => remove(i)} style={{ position: "absolute", top: -5, right: -5, background: C.danger, border: "none", borderRadius: "50%", width: 20, height: 20, color: "#fff", fontSize: 11, cursor: "pointer", padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AvatarUpload({ currentUrl, name, color, onUpload }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const handle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setUploading(false);
      onUpload(reader.result);
    };
    reader.onerror = () => { setUploading(false); };
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => ref.current.click()}>
        <Av l={name?.[0] || "?"} color={color} size={80} photoUrl={currentUrl} />
        <div style={{ position: "absolute", bottom: 0, right: 0, background: C.blue, borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", border: "2px solid white" }}>
          {uploading ? "⏳" : "📷"}
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.muted }}>Нажми для загрузки фото</div>
      <input ref={ref} type="file" accept="image/*" onChange={handle} style={{ display: "none" }} />
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(58,140,199,0.25)", backdropFilter: "blur(4px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.card, borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: 24, boxShadow: "0 20px 60px rgba(107,184,232,0.3)", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: C.blueLight, border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16, color: C.muted }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const StatCard = ({ icon, val, label, color }) => (
  <Card style={{ textAlign: "center", borderTop: `4px solid ${color}` }}>
    <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 20, fontWeight: 900, color }}>{val}</div>
    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
  </Card>
);

const PageTitle = ({ emoji, title, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
    <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{emoji} {title}</div>
    {action}
  </div>
);

function Layout({ user, tab, setTab, navItems, onLogout, children }) {
  const [sideOpen, setSideOpen] = useState(true);
  const roleLabel = { admin: "👑 Руководитель", coordinator: "🗂️ Координатор", teacher: "👩‍🏫 Учитель", parent: "👨‍👩‍👧 Родитель", smm: "📱 СММ-менеджер", psychologist: "🧠 Психолог", other: "👔 Сотрудник" };
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Nunito', 'Segoe UI', sans-serif", background: C.bg }}>
      <div style={{ width: sideOpen ? 220 : 64, background: C.white, flexShrink: 0, display: "flex", flexDirection: "column", transition: "width 0.2s", borderRight: `2px solid ${C.border}`, boxShadow: "2px 0 12px rgba(107,184,232,0.1)" }}>
        <div style={{ padding: sideOpen ? "20px 16px 16px" : "20px 8px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <PandaLogo size={40} />
          {sideOpen && <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.blueDark }}>Ak Bilim</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{roleLabel[user.role] || "Пользователь"}</div>
          </div>}
        </div>
        <nav style={{ flex: 1, padding: "10px 0" }}>
          {navItems.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: sideOpen ? "11px 16px" : "11px 0", justifyContent: sideOpen ? "flex-start" : "center",
              background: tab === n.key ? C.blueLight : "transparent",
              color: tab === n.key ? C.blueDark : C.muted,
              borderLeft: tab === n.key ? `3px solid ${C.blue}` : "3px solid transparent",
              border: "none", borderRight: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === n.key ? 800 : 500, fontFamily: "inherit",
            }}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>{n.icon}</span>
              {sideOpen && n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: sideOpen ? "12px 16px" : "12px 8px", borderTop: `1px solid ${C.border}` }}>
          {sideOpen && <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>🐼 {user.name}</div>}
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onLogout} style={{ flex: 1, background: C.blueLight, border: "none", borderRadius: 8, color: C.muted, cursor: "pointer", padding: "7px", fontSize: 12, fontWeight: 600 }}>{sideOpen ? "Выйти" : "↩"}</button>
            <button onClick={() => setSideOpen(!sideOpen)} style={{ background: C.blueLight, border: "none", borderRadius: 8, color: C.muted, cursor: "pointer", padding: "7px 10px", fontSize: 13 }}>{sideOpen ? "◀" : "▶"}</button>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>{children}</div>
    </div>
  );
}

function Login({ onLogin, allUsers }) {
  const [login, setLogin] = useState(""); const [pass, setPass] = useState("");
  const [show, setShow] = useState(false); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setErr(""); setLoading(true);
    try {
      // Fetch fresh teachers and parents from Supabase before checking credentials
      const [freshTeachers, freshParents] = await Promise.all([
        sb.all("ak_teachers"),
        sb.all("ak_parents"),
      ]);
      const freshAllUsers = [ADMIN, COORDINATOR, SMM_USER, ...(freshTeachers || []), ...(freshParents || [])];
      const u = freshAllUsers.find(u => (u.login === login.trim().toLowerCase() || u.login === login.trim() || u.phone === login.trim()) && u.password === pass);
      if (u) onLogin(u); else { setErr("Неверный логин или пароль"); setLoading(false); }
    } catch (e) {
      // Fallback to passed allUsers if fetch fails
      const u = allUsers.find(u => (u.login === login.trim().toLowerCase() || u.login === login.trim() || u.phone === login.trim()) && u.password === pass);
      if (u) onLogin(u); else { setErr("Неверный логин или пароль"); setLoading(false); }
    }
  };
  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${C.blue} 0%, ${C.blueLight} 60%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ background: C.white, borderRadius: "50%", padding: 6, boxShadow: "0 8px 32px rgba(107,184,232,0.4)" }}><PandaLogo size={80} /></div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.white, letterSpacing: -1 }}>AK BILIM</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4, fontWeight: 600 }}>Система управления центром</div>
        </div>
        <div style={{ background: C.white, borderRadius: 24, padding: 28, boxShadow: "0 20px 60px rgba(58,140,199,0.2)", border: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 14 }}>
            <Label>ЛОГИН</Label>
            <input value={login} onChange={e => setLogin(e.target.value)} placeholder="введите логин"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.blueLight, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: C.text }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <Label>ПАРОЛЬ</Label>
            <div style={{ position: "relative" }}>
              <input type={show ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} placeholder="••••••••"
                style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.blueLight, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: C.text }} />
              <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{show ? "🙈" : "👁"}</button>
            </div>
          </div>
          {err && <div style={{ background: C.danger + "15", border: `1px solid ${C.danger}30`, borderRadius: 8, padding: "8px 12px", color: C.danger, fontSize: 13, fontWeight: 600, marginBottom: 10, textAlign: "center" }}>⚠️ {err}</div>}
          <button onClick={handle} disabled={loading || !login || !pass} style={{
            width: "100%", padding: "13px", marginTop: 10, borderRadius: 12,
            background: (!login || !pass) ? C.blueMid : C.blue, color: "#fff", fontWeight: 900, fontSize: 16, border: "none",
            cursor: (!login || !pass) ? "not-allowed" : "pointer",
            boxShadow: (!login || !pass) ? "none" : `0 4px 16px ${C.blue}55`, fontFamily: "inherit",
          }}>{loading ? "🐼 Входим..." : "Войти →"}</button>
          <div style={{ marginTop: 14, fontSize: 11, color: C.muted, textAlign: "center" }}>Ak Bilim | Бишкек 🇰🇬</div>
        </div>
      </div>
    </div>
  );
}

function StudentsTab({ students, teachers, groups, setStudents, canDelete, canAdd, toast }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("все");
  const [newS, setNewS] = useState({ name: "", grade: "", address: "", days: [], time: "", teacherId: "", parentPhone: "", format: "выезд", groupId: "", lessonPrice: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toggleDay = (day) => setNewS(p => ({ ...p, days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day] }));
  const addStudent = async () => {
    if (!newS.name || !newS.teacherId || newS.days.length === 0) return;
    const student = { ...newS, id: Date.now(), progress: 0, teacherId: Number(newS.teacherId), groupId: newS.groupId ? Number(newS.groupId) : undefined, lessonPrice: newS.format === "онлайн" ? Number(newS.lessonPrice) || 0 : 0 };
    setStudents(prev => [...prev, student]);
    sb.add("ak_students", student);
    setNewS({ name: "", grade: "", address: "", days: [], time: "", teacherId: "", parentPhone: "", format: "выезд", groupId: "", lessonPrice: "" });
    setModal(null); toast("🐼 Ученик добавлен!");
  };

  const filtered = filter === "все" ? students : students.filter(s => s.format === filter);

  return (
    <div>
      <PageTitle emoji="👦" title="Все ученики" action={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["все","выезд","группа","онлайн","регион"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit", background: filter === f ? C.blue : C.blueLight, color: filter === f ? "#fff" : C.muted }}>{f === "все" ? "Все" : FORMAT_LABELS[f]}</button>
            ))}
          </div>
          {canAdd && <Btn onClick={() => setModal("add")} color={C.blue}>+ Добавить</Btn>}
        </div>
      } />
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["Ученик","Формат","Класс","Учитель","Дни","Прогресс", canDelete ? "" : null].filter(Boolean).map(h => (
                <th key={h} style={{ textAlign: "left", padding: "9px 10px", fontSize: 11, color: C.muted, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const t = teachers.find(t => t.id === s.teacherId);
              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Av l={s.name[0]} color={t?.color || C.blue} size={30} photoUrl={t?.photoUrl} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{s.parentPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 10 }}><Badge text={FORMAT_LABELS[s.format] || s.format} color={FORMAT_COLORS[s.format] || C.blue} /></td>
                  <td style={{ padding: 10, fontSize: 13 }}>{s.grade}</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{t?.name}</td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(s.days || []).map(d => <span key={d} style={{ background: C.blueLight, color: C.blueDark, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>{d.slice(0,2)}</span>)}
                      {s.time && <span style={{ fontSize: 11, color: C.muted }}>{s.time}</span>}
                    </div>
                  </td>
                  <td style={{ padding: 10, minWidth: 90 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: s.progress >= 80 ? C.success : C.warning, marginBottom: 3 }}>{s.progress}%</div>
                    <div style={{ background: C.border, borderRadius: 99, height: 5 }}>
                      <div style={{ width: `${s.progress}%`, background: s.progress >= 80 ? C.success : C.warning, height: "100%", borderRadius: 99 }} />
                    </div>
                  </td>
                  {canDelete && (
                    <td style={{ padding: 10 }}>
                      <button onClick={() => setConfirmDelete({ id: s.id, name: s.name })} style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal open={modal === "add"} onClose={() => setModal(null)} title="🐼 Новый ученик">
        <FInput label="ИМЯ УЧЕНИКА" value={newS.name} onChange={v => setNewS(p => ({...p, name: v}))} required />
        <FInput label="КЛАСС / ВОЗРАСТ" value={newS.grade} onChange={v => setNewS(p => ({...p, grade: v}))} placeholder="3 класс / Дошкольник" />
        <FSelect label="ФОРМАТ" value={newS.format} onChange={v => setNewS(p => ({...p, format: v}))} options={FORMATS.map(f => ({ value: f, label: FORMAT_LABELS[f] }))} required />
        {newS.format === "группа" && <FSelect label="ГРУППА" value={newS.groupId} onChange={v => setNewS(p => ({...p, groupId: v}))} options={groups.map(g => ({ value: g.id, label: g.name }))} />}
        {newS.format !== "группа" && <FInput label="АДРЕС" value={newS.address} onChange={v => setNewS(p => ({...p, address: v}))} />}
        {newS.format === "онлайн" && (
          <div style={{ marginBottom: 13, background: C.warning + "10", borderRadius: 10, padding: 12, border: `1.5px solid ${C.warning}30` }}>
            <Label>💻 ЦЕНА УРОКА (сом) <span style={{ color: C.danger }}>*</span></Label>
            <input type="number" value={newS.lessonPrice} onChange={e => setNewS(p => ({...p, lessonPrice: e.target.value}))} placeholder="например: 800"
              style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${C.warning}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", background: "#fff" }} />
            <div style={{ fontSize: 11, color: C.warning, marginTop: 5, fontWeight: 700 }}>
              👩‍🏫 Педагог получит: {newS.lessonPrice ? Math.round(Number(newS.lessonPrice) * 0.5).toLocaleString() : "0"} сом (50%)
            </div>
          </div>
        )}
        <FInput label="ТЕЛЕФОН РОДИТЕЛЯ" value={newS.parentPhone} onChange={v => setNewS(p => ({...p, parentPhone: v}))} />
        <FSelect label="УЧИТЕЛЬ" value={newS.teacherId} onChange={v => setNewS(p => ({...p, teacherId: v}))} options={teachers.map(t => ({ value: t.id, label: t.name }))} required />
        <div style={{ marginBottom: 14 }}>
          <Label>ДНИ ЗАНЯТИЙ <span style={{ color: C.danger }}>*</span></Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(newS.format === "группа" ? DAYS_SHORT : DAYS).map(day => {
              const sel = newS.days.includes(day);
              return <button key={day} onClick={() => toggleDay(day)} style={{ padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", background: sel ? C.blue : C.blueLight, color: sel ? "#fff" : C.muted, border: `2px solid ${sel ? C.blue : C.border}`, fontFamily: "inherit" }}>{day.slice(0,2)} {sel ? "✓" : ""}</button>;
            })}
          </div>
        </div>
        <FInput label="ВРЕМЯ" value={newS.time} onChange={v => setNewS(p => ({...p, time: v}))} placeholder="14:00" />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full onClick={addStudent} color={C.blue} disabled={!newS.name || !newS.teacherId || newS.days.length === 0}>Добавить</Btn>
          <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
        </div>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="⚠️ Удалить ученика?">
        <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Удалить «{confirmDelete?.name}»?</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn color={C.danger} onClick={() => { sb.del("ak_students", confirmDelete.id); setStudents(p => p.filter(s => s.id !== confirmDelete.id)); setConfirmDelete(null); toast("Ученик удалён"); }}>Удалить</Btn>
            <Btn outline color={C.muted} onClick={() => setConfirmDelete(null)}>Отмена</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ExpandableReportCard({ r, teachers }) {
  const [open, setOpen] = useState(false);
  const teacher = teachers.find(t => t.id === r.teacherId);
  return (
    <Card style={{ marginBottom: 12, cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: open ? 10 : 6 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Av l={r.teacherAvatar} color={r.teacherColor} size={32} photoUrl={teacher?.photoUrl} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{r.teacherName}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{r.date} · 👦 {r.studentName}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Stars rating={r.rating} />
          <span style={{ fontSize: 14, color: C.muted }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      <div style={{ fontSize: 13 }}>📚 {r.topic}</div>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
          {r.notes && <div style={{ fontSize: 13, marginBottom: 8 }}><span style={{ fontWeight: 700 }}>Заметки:</span> {r.notes}</div>}
          {r.homework && <div style={{ fontSize: 13, marginBottom: 8 }}><span style={{ fontWeight: 700 }}>Домашка:</span> {r.homework}</div>}
          {r.paymentReceived && <div style={{ marginBottom: 8 }}><Badge text={`💰 ${r.paymentAmount} сом`} color={C.success} /></div>}
          {r.files && r.files.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {r.files.map((f, i) => {
                const url = f?.url || f;
                const isVideo = f?.isVideo || false;
                return (
                  <div key={i} style={{ position: "relative" }}>
                    {isVideo
                      ? <video src={url} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "2px solid #D4EAF7" }} controls />
                      : <img src={url} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "2px solid #D4EAF7", cursor: "pointer" }} onClick={() => window.open(url, "_blank")} />
                    }
                    <a href={url} download target="_blank" style={{ position: "absolute", top: -6, right: -6, background: "#3A8CC7", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", textDecoration: "none" }}>⬇</a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ExpandableTrialCard({ t, teachers }) {
  const [open, setOpen] = useState(false);
  const teacher = teachers.find(tc => tc.id === t.teacherId);
  return (
    <Card style={{ marginBottom: 12, cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Av l={teacher?.avatar || "?"} color={teacher?.color || C.blue} size={32} photoUrl={teacher?.photoUrl} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{teacher?.name || "Педагог"}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{t.date} · 👶 {t.childName}, {t.childAge} лет</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {t.decision === "take" && <Badge text="Берёт!" color={C.success} />}
          {t.decision === "reject" && <Badge text="Не беру" color={C.danger} />}
          {!t.decision && <Badge text="На рассмотрении" color={C.warning} />}
          <span style={{ fontSize: 14, color: C.muted }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
          {t.childGrade && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Класс:</span> {t.childGrade}</div>}
          {t.childLevel && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Уровень:</span> {t.childLevel}</div>}
          {t.parentName && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Родитель:</span> {t.parentName}</div>}
          {t.parentPhone && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Телефон:</span> {t.parentPhone}</div>}
          {t.parentGoal && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Цель:</span> {t.parentGoal}</div>}
          {t.teacherNotes && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Заметки педагога:</span> {t.teacherNotes}</div>}
          {t.suggestedFormat && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Предлагаемый формат:</span> {FORMAT_LABELS[t.suggestedFormat] || t.suggestedFormat}</div>}
          {t.suggestedDays && t.suggestedDays.length > 0 && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Удобные дни:</span> {t.suggestedDays.join(", ")}</div>}
          {t.suggestedTime && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Удобное время:</span> {t.suggestedTime}</div>}
          {t.decision === "take" && <div style={{ fontSize: 13, marginBottom: 6, color: C.success, fontWeight: 700 }}>✅ Педагог берёт ученика</div>}
          {t.decision === "reject" && <div style={{ fontSize: 13, marginBottom: 6, color: C.danger, fontWeight: 700 }}>❌ Педагог не берёт{t.rejectReason ? `: ${t.rejectReason}` : ""}</div>}
          {t.bookSold && <div style={{ fontSize: 13, marginBottom: 6, color: C.success }}>📚 Книга: {t.bookTitle} — {t.bookAmount} с</div>}
          {t.files && t.files.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              {t.files.map((f, i) => <img key={i} src={f.url || f} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: `2px solid ${C.border}` }} />)}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function LeadsTab({ leads, setLeads, teachers, toast, allTrials }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [newLead, setNewLead] = useState({ childName: "", parentName: "", parentPhone: "", grade: "", subject: "", district: "", source: "", notes: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [trialTeacher, setTrialTeacher] = useState("");
  const [trialDate, setTrialDate] = useState("");

  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);

  const addLead = () => {
    if (!newLead.childName || !newLead.parentPhone) return;
    const lead = { ...newLead, id: Date.now(), status: "new", createdAt: new Date().toLocaleDateString("ru-RU") };
    setLeads(p => [lead, ...p]);
    sb.add("ak_leads", lead);
    setNewLead({ childName: "", parentName: "", parentPhone: "", grade: "", subject: "", district: "", source: "", notes: "" });
    setModal(null);
    toast("✅ Лид добавлен в воронку!");
    sendTelegram(`🆕 <b>Новый лид!</b>\n👶 ${lead.childName}\n👨‍👩‍👧 ${lead.parentName}\n📞 ${lead.parentPhone}\n📍 ${lead.district}`);
  };

  const moveTo = (id, status, extra = {}) => {
    sb.patch("ak_leads", id, { status, ...extra });
    setLeads(p => p.map(l => l.id === id ? { ...l, status, ...extra } : l));
    setSelected(null); setModal(null);
    toast(`Лид → ${LEAD_STATUSES[status].label}`);
  };

  const counts = Object.keys(LEAD_STATUSES).reduce((acc, s) => { acc[s] = leads.filter(l => l.status === s).length; return acc; }, {});

  return (
    <div>
      <PageTitle emoji="🎯" title="Воронка лидов" action={<Btn onClick={() => setModal("add")} color={C.blue}>+ Новый лид</Btn>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {Object.entries(LEAD_STATUSES).map(([key, s]) => (
          <button key={key} onClick={() => setFilter(filter === key ? "all" : key)} style={{
            background: filter === key ? s.color : C.card, color: filter === key ? "#fff" : C.text,
            borderRadius: 14, padding: "14px 10px", border: `2px solid ${filter === key ? s.color : C.border}`,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            boxShadow: filter === key ? `0 4px 16px ${s.color}44` : "none",
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{counts[key]}</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>{s.label}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(lead => {
          const st = LEAD_STATUSES[lead.status];
          return (
            <Card key={lead.id} onClick={() => { setSelected(lead); setModal("detail"); }} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{lead.childName}</div>
                    <Badge text={st.label} color={st.color} />
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>👨‍👩‍👧 {lead.parentName} · 📞 {lead.parentPhone}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    📍 {lead.district} · 📚 {lead.subject} · {lead.grade}
                    {lead.source && ` · 📣 ${lead.source}`}
                  </div>
                  {lead.status === "trial" && lead.trialDate && (() => {
                    const trialReport = (allTrials || []).find(t => t.childName === lead.childName && t.teacherId === teachers.find(tc => tc.name === lead.teacherName)?.id);
                    return (
                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                        <span style={{ color: C.warning }}>🧪 Пробный: {lead.trialDate} · 👩‍🏫 {lead.teacherName}</span>
                        {trialReport?.decision === "take" && <span style={{ color: C.success, marginLeft: 8 }}>✅ Педагог берёт</span>}
                        {trialReport?.decision === "reject" && <span style={{ color: C.danger, marginLeft: 8 }}>❌ Педагог не берёт{trialReport.rejectReason ? `: ${trialReport.rejectReason}` : ""}</span>}
                        {!trialReport?.decision && <span style={{ color: C.muted, marginLeft: 8 }}>⏳ Ожидает отчёта</span>}
                      </div>
                    );
                  })()}
                  {lead.status === "rejected" && lead.rejectReason && (
                    <div style={{ fontSize: 12, color: C.danger, marginTop: 4 }}>❌ Причина: {lead.rejectReason}</div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginLeft: 10 }}>{lead.createdAt}</div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <Card><div style={{ color: C.muted, textAlign: "center", padding: 32 }}>Лидов нет</div></Card>}
      </div>

      <Modal open={modal === "add"} onClose={() => setModal(null)} title="🆕 Новый лид">
        <FInput label="ИМЯ РЕБЁНКА" value={newLead.childName} onChange={v => setNewLead(p => ({...p, childName: v}))} required />
        <FInput label="ИМЯ РОДИТЕЛЯ" value={newLead.parentName} onChange={v => setNewLead(p => ({...p, parentName: v}))} />
        <FInput label="ТЕЛЕФОН" value={newLead.parentPhone} onChange={v => setNewLead(p => ({...p, parentPhone: v}))} required />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FInput label="КЛАСС" value={newLead.grade} onChange={v => setNewLead(p => ({...p, grade: v}))} placeholder="3 класс" />
          <FInput label="ПРЕДМЕТ" value={newLead.subject} onChange={v => setNewLead(p => ({...p, subject: v}))} placeholder="Математика" />
        </div>
        <FSelect label="РАЙОН" value={newLead.district} onChange={v => setNewLead(p => ({...p, district: v}))} options={DISTRICTS} />
        <FSelect label="ИСТОЧНИК" value={newLead.source} onChange={v => setNewLead(p => ({...p, source: v}))} options={SOURCES} />
        <FTextarea label="ЗАМЕТКИ" value={newLead.notes} onChange={v => setNewLead(p => ({...p, notes: v}))} placeholder="Дополнительная информация" rows={2} />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full onClick={addLead} color={C.blue} disabled={!newLead.childName || !newLead.parentPhone}>Добавить</Btn>
          <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
        </div>
      </Modal>

      <Modal open={modal === "detail" && !!selected} onClose={() => { setModal(null); setSelected(null); }} title={`📋 ${selected?.childName}`}>
        {selected && (
          <div>
            <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                <div><span style={{ color: C.muted, fontSize: 11 }}>РОДИТЕЛЬ</span><div style={{ fontWeight: 700 }}>{selected.parentName}</div></div>
                <div><span style={{ color: C.muted, fontSize: 11 }}>ТЕЛЕФОН</span><div style={{ fontWeight: 700 }}>{selected.parentPhone}</div></div>
                <div><span style={{ color: C.muted, fontSize: 11 }}>КЛАСС</span><div style={{ fontWeight: 700 }}>{selected.grade}</div></div>
                <div><span style={{ color: C.muted, fontSize: 11 }}>ПРЕДМЕТ</span><div style={{ fontWeight: 700 }}>{selected.subject}</div></div>
                <div><span style={{ color: C.muted, fontSize: 11 }}>РАЙОН</span><div style={{ fontWeight: 700 }}>{selected.district}</div></div>
                <div><span style={{ color: C.muted, fontSize: 11 }}>ИСТОЧНИК</span><div style={{ fontWeight: 700 }}>{selected.source}</div></div>
              </div>
              {selected.notes && <div style={{ marginTop: 8, fontSize: 13, color: C.text }}>💬 {selected.notes}</div>}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10 }}>ИЗМЕНИТЬ СТАТУС:</div>

            {selected.status === "new" && (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <Label>ПЕДАГОГ ДЛЯ ПРОБНОГО</Label>
                  <select value={trialTeacher} onChange={e => setTrialTeacher(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: C.blueLight, marginBottom: 8 }}>
                    <option value="">— Выберите педагога —</option>
                    {teachers.map(t => <option key={t.id} value={t.name}>{t.name} · {t.subject}</option>)}
                  </select>
                  <Label>ДАТА ПРОБНОГО</Label>
                  <input type="date" value={trialDate} onChange={e => setTrialDate(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: C.blueLight, boxSizing: "border-box" }} />
                </div>
                <Btn full color={C.warning} onClick={() => moveTo(selected.id, "trial", { teacherName: trialTeacher, trialDate })}>🧪 Назначить пробный</Btn>
              </div>
            )}

            {selected.status === "trial" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Btn full color={C.success} onClick={() => moveTo(selected.id, "accepted")}>✅ Взяли в центр</Btn>
                <div>
                  <Label>ПЕРЕНАЗНАЧИТЬ ПЕДАГОГА</Label>
                  <select value={trialTeacher} onChange={e => setTrialTeacher(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: C.blueLight, marginBottom: 8 }}>
                    <option value="">— Новый педагог —</option>
                    {teachers.map(t => <option key={t.id} value={t.name}>{t.name} · {t.subject}</option>)}
                  </select>
                  <Label>НОВАЯ ДАТА</Label>
                  <input type="date" value={trialDate} onChange={e => setTrialDate(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: C.blueLight, boxSizing: "border-box", marginBottom: 8 }} />
                  <Btn full color={C.warning} disabled={!trialTeacher || !trialDate} onClick={() => { moveTo(selected.id, "trial", { teacherName: trialTeacher, trialDate }); setTrialTeacher(""); setTrialDate(""); }}>🔄 Переназначить</Btn>
                </div>
                <div>
                  <Label>ПРИЧИНА ОТКАЗА</Label>
                  <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: C.blueLight, marginBottom: 8 }}>
                    <option value="">— Выберите причину —</option>
                    {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <Btn full color={C.danger} disabled={!rejectReason} onClick={() => moveTo(selected.id, "rejected", { rejectReason })}>❌ Отказ</Btn>
                </div>
              </div>
            )}

            {(selected.status === "accepted" || selected.status === "rejected") && (
              <div>
                <div style={{ background: C.blueLight, borderRadius: 10, padding: 12, textAlign: "center", color: C.muted, fontSize: 13, marginBottom: 10 }}>
                  {selected.status === "accepted" ? "✅ Ученик принят в центр" : `❌ Отказ: ${selected.rejectReason}`}
                </div>
                {selected.status === "rejected" && (
                  <div>
                    <Label>ПЕРЕНАЗНАЧИТЬ ПЕДАГОГА</Label>
                    <select value={trialTeacher} onChange={e => setTrialTeacher(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: C.blueLight, marginBottom: 8 }}>
                      <option value="">— Новый педагог —</option>
                      {teachers.map(t => <option key={t.id} value={t.name}>{t.name} · {t.subject}</option>)}
                    </select>
                    <Label>ДАТА ПРОБНОГО</Label>
                    <input type="date" value={trialDate} onChange={e => setTrialDate(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: C.blueLight, boxSizing: "border-box", marginBottom: 8 }} />
                    <Btn full color={C.warning} disabled={!trialTeacher || !trialDate} onClick={() => { moveTo(selected.id, "trial", { teacherName: trialTeacher, trialDate, rejectReason: "" }); setTrialTeacher(""); setTrialDate(""); }}>🔄 Переназначить</Btn>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <Btn full outline color={C.danger} small onClick={() => { sb.del("ak_leads", selected.id); setLeads(p => p.filter(l => l.id !== selected.id)); setModal(null); setSelected(null); toast("Лид удалён"); }}>🗑️ Удалить лид</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CoordReportTab({ leads, students, teachers, toast }) {
  const [report, setReport] = useState({
    trialsScheduled: "",
    studentsAdded: "",
    parentsCalled: "",
    leadsWithoutTeacher: "",
    districtShortage: "",
    notes: "",
  });
  const [sent, setSent] = useState(false);

  const trialsCount = leads.filter(l => l.status === "trial").length;
  const newLeads = leads.filter(l => l.status === "new").length;

  const submit = async () => {
    const text = `📊 <b>Недельный отчёт координатора</b>\n\n🧪 Пробных назначено: ${report.trialsScheduled || trialsCount}\n👦 Учеников добавлено: ${report.studentsAdded}\n📞 Родителей обзвонила: ${report.parentsCalled}\n🚫 Лидов без педагога: ${report.leadsWithoutTeacher || newLeads}\n📍 Район без педагога: ${report.districtShortage || "—"}\n\n💬 ${report.notes || "Нет заметок"}`;
    await sendTelegram(text);
    setSent(true);
    toast("📊 Отчёт отправлен Айданек!");
  };

  if (sent) return (
    <Card style={{ textAlign: "center", padding: 48 }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
      <div style={{ fontWeight: 900, fontSize: 20, color: C.success }}>Отчёт отправлен!</div>
      <div style={{ marginTop: 16 }}><Btn onClick={() => setSent(false)} color={C.coord}>Новый отчёт</Btn></div>
    </Card>
  );

  return (
    <div>
      <PageTitle emoji="📊" title="Мой недельный отчёт" />
      <Card style={{ maxWidth: 540 }}>
        <div style={{ background: C.coord + "10", borderRadius: 12, padding: 14, marginBottom: 20, border: `1px solid ${C.coord}30` }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.coord, marginBottom: 8 }}>📈 Авто-данные из системы</div>
          <div style={{ fontSize: 13 }}>🧪 Лидов на пробном: <b>{trialsCount}</b></div>
          <div style={{ fontSize: 13 }}>🆕 Новых лидов: <b>{newLeads}</b></div>
          <div style={{ fontSize: 13 }}>👦 Всего учеников: <b>{students.length}</b></div>
        </div>

        <FInput label="🧪 ПРОБНЫХ НАЗНАЧЕНО (за неделю)" value={report.trialsScheduled} onChange={v => setReport(p => ({...p, trialsScheduled: v}))} type="number" placeholder={String(trialsCount)} />
        <FInput label="👦 УЧЕНИКОВ ДОБАВЛЕНО" value={report.studentsAdded} onChange={v => setReport(p => ({...p, studentsAdded: v}))} type="number" placeholder="0" />
        <FInput label="📞 РОДИТЕЛЕЙ ОБЗВОНИЛА" value={report.parentsCalled} onChange={v => setReport(p => ({...p, parentsCalled: v}))} type="number" placeholder="0" />
        <FInput label="🚫 ЛИДОВ БЕЗ ПЕДАГОГА" value={report.leadsWithoutTeacher} onChange={v => setReport(p => ({...p, leadsWithoutTeacher: v}))} type="number" placeholder={String(newLeads)} />
        <FSelect label="📍 РАЙОН — НЕ ХВАТАЕТ ПЕДАГОГА" value={report.districtShortage} onChange={v => setReport(p => ({...p, districtShortage: v}))} options={[...DISTRICTS, "Везде хватает"]} />
        <FTextarea label="💬 ЗАМЕТКИ / ПРОБЛЕМЫ" value={report.notes} onChange={v => setReport(p => ({...p, notes: v}))} placeholder="Что важного за неделю?" rows={4} />

        <Btn full onClick={submit} color={C.coord}>📤 Отправить отчёт Айданек</Btn>
      </Card>
    </div>
  );
}

function DistrictsTab({ toast }) {
  const [districts, setDistricts] = useState([]);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ teacher_name: "", main_districts: "", nearby_districts: "", subjects: "", language: "ru", can_kg: false });

  useEffect(() => {
    sb.all("akteacher_districts").then(d => { if (d?.length) setDistricts(d); });
  }, []);

  const INITIAL_DATA = [
    { teacher_name: "Анэля", main_districts: "Джал 15, Джал 23, Джал 29, Джал 30, Арча-Бешик", nearby_districts: "Ынтымак, Ак-Орго, Ак-Ордо, Орок, Чон-Арык", subjects: "Школьная подготовка, Английский, 1–4 класс", language: "ru", can_kg: false },
    { teacher_name: "Акылай", main_districts: "Тунгуч, Кок-Жар, Аламединский рынок", nearby_districts: "Кара-Жыгач, Лебединовка, Учкун, Алтын-Ордо, Рухий-Мурас", subjects: "Школьная подготовка, Английский, 1–4 класс", language: "ru", can_kg: false },
    { teacher_name: "Асыл", main_districts: "5-й мкр, 7-й мкр, 8-й мкр, Кок-Жар", nearby_districts: "6-й мкр, 9-й мкр, 10-й мкр, Восток-5, Асанбай, Юг-2", subjects: "Школьная подготовка, 1–3 класс", language: "ru", can_kg: false },
    { teacher_name: "Нури", main_districts: "ВЭФ", nearby_districts: "11-й мкр, 12-й мкр, Улан, Учкун, Восток-5", subjects: "Школьная подготовка, Все предметы, 1–4 класс", language: "both", can_kg: true },
    { teacher_name: "Виктория", main_districts: "Кок-Жар, Восток-5, Аламединский рынок", nearby_districts: "Тунгуч, Кара-Жыгач, 5-й мкр, Алтын-Ордо", subjects: "Дошкольная подготовка, 1–4 класс", language: "ru", can_kg: false },
    { teacher_name: "Анастасия", main_districts: "5-й мкр, 6-й мкр", nearby_districts: "4-й мкр, 7-й мкр, Асанбай, Юг-2, Восток-5", subjects: "Дошкольная подготовка, 1–4 класс", language: "ru", can_kg: false },
  ];

  const seedData = async () => {
    for (const d of INITIAL_DATA) {
      const rec = { id: Date.now() + Math.random(), ...d };
      await sb.add("akteacher_districts", rec);
      setDistricts(p => [...p, rec]);
      await new Promise(r => setTimeout(r, 100));
    }
    toast("✅ Данные загружены!");
  };

  const openAdd = () => { setForm({ teacher_name: "", main_districts: "", nearby_districts: "", subjects: "", language: "ru", can_kg: false }); setEditing(null); setModal("form"); };
  const openEdit = (d) => { setForm({ teacher_name: d.teacher_name, main_districts: d.main_districts, nearby_districts: d.nearby_districts || "", subjects: d.subjects || "", language: d.language || "ru", can_kg: !!d.can_kg }); setEditing(d); setModal("form"); };

  const save = async () => {
    if (!form.teacher_name) return;
    if (editing) {
      await sb.patch("akteacher_districts", editing.id, form);
      setDistricts(p => p.map(d => d.id === editing.id ? { ...d, ...form } : d));
      toast("✅ Изменения сохранены!");
    } else {
      const rec = { id: Date.now(), ...form };
      await sb.add("akteacher_districts", rec);
      setDistricts(p => [...p, rec]);
      toast("✅ Педагог добавлен!");
    }
    setModal(null);
  };

  const del = async (id) => {
    await sb.del("akteacher_districts", id);
    setDistricts(p => p.filter(d => d.id !== id));
    toast("🗑️ Удалено");
  };

  const langLabel = { ru: "🇷🇺 Только русский", kg: "🇰🇬 Только кыргызский", both: "🇷🇺🇰🇬 Русский + Кыргызский" };
  const langColor = { ru: "#2D7DD2", kg: "#1A8A4A", both: "#1A5A8A" };

  return (
    <div>
      <PageTitle emoji="🗺️" title="Карта районов" action={
        <div style={{ display: "flex", gap: 10 }}>
          {districts.length === 0 && <Btn onClick={seedData} color={C.warning} small>📥 Загрузить данные</Btn>}
          <Btn onClick={openAdd} color={C.blue}>+ Добавить педагога</Btn>
        </div>
      } />

      {districts.length === 0 && (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Карта районов пуста</div>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Нажми «Загрузить данные» чтобы добавить 6 педагогов из файла</div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {districts.map(d => (
          <Card key={d.id} style={{ borderTop: `4px solid ${C.blue}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Av l={(d.teacher_name || "?")[0]} color={C.blue} size={44} />
                <div style={{ fontWeight: 800, fontSize: 16 }}>{d.teacher_name}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openEdit(d)} style={{ background: C.blueLight, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14 }}>✏️</button>
                <button onClick={() => del(d.id)} style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: "0.06em" }}>📍 ОСНОВНЫЕ РАЙОНЫ</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {(d.main_districts || "").split(",").map(r => r.trim()).filter(Boolean).map(r => (
                <span key={r} style={{ background: C.blueLight, color: C.blueDark, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>{r}</span>
              ))}
            </div>

            {d.nearby_districts && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: "0.06em" }}>🏘️ СОСЕДНИЕ ~5 КМ</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {(d.nearby_districts || "").split(",").map(r => r.trim()).filter(Boolean).map(r => (
                    <span key={r} style={{ background: "#F0F4F8", color: "#5A7A8A", fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 8 }}>{r}</span>
                  ))}
                </div>
              </>
            )}

            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: "0.06em" }}>📚 ПРЕДМЕТЫ</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {(d.subjects || "").split(",").map(s => s.trim()).filter(Boolean).map(s => (
                <span key={s} style={{ background: "#FFF0E8", color: "#C25B2A", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 8 }}>{s}</span>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ background: langColor[d.language] + "18", color: langColor[d.language], fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, display: "inline-block" }}>{langLabel[d.language] || langLabel.ru}</span>
              {d.can_kg ? <span style={{ color: "#1A8A4A", fontSize: 12, fontWeight: 700 }}>✅ Ведёт кыргызские классы</span>
                        : <span style={{ color: C.danger, fontSize: 12, fontWeight: 600 }}>❌ Кыргызские классы не ведёт</span>}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal === "form"} onClose={() => setModal(null)} title={editing ? "✏️ Редактировать педагога" : "➕ Новый педагог"}>
        <FInput label="ИМЯ ПЕДАГОГА" value={form.teacher_name} onChange={v => setForm(p => ({...p, teacher_name: v}))} required />
        <FTextarea label="ОСНОВНЫЕ РАЙОНЫ (через запятую)" value={form.main_districts} onChange={v => setForm(p => ({...p, main_districts: v}))} placeholder="Джал 23, Арча-Бешик, ВЭФ" rows={2} />
        <FTextarea label="СОСЕДНИЕ РАЙОНЫ ~5 КМ (через запятую)" value={form.nearby_districts} onChange={v => setForm(p => ({...p, nearby_districts: v}))} placeholder="Ынтымак, Ак-Орго, Чон-Арык" rows={2} />
        <FTextarea label="ПРЕДМЕТЫ (через запятую)" value={form.subjects} onChange={v => setForm(p => ({...p, subjects: v}))} placeholder="Математика, Английский, 1–4 класс" rows={2} />
        <FSelect label="ЯЗЫК ОБУЧЕНИЯ" value={form.language} onChange={v => setForm(p => ({...p, language: v}))} options={[{value:"ru",label:"🇷🇺 Только русский"},{value:"kg",label:"🇰🇬 Только кыргызский"},{value:"both",label:"🇷🇺🇰🇬 Русский + Кыргызский"}]} />
        <div style={{ marginBottom: 13, display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="can_kg" checked={form.can_kg} onChange={e => setForm(p => ({...p, can_kg: e.target.checked}))} style={{ width: 18, height: 18, cursor: "pointer" }} />
          <label htmlFor="can_kg" style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}>✅ Ведёт кыргызские классы</label>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full onClick={save} color={C.blue} disabled={!form.teacher_name}>Сохранить</Btn>
          <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
        </div>
      </Modal>
    </div>
  );
}

function AdminApp({ user, onLogout, allReports, setAllReports, allTrials, setAllTrials, students, setStudents, teachers, setTeachers, parents, setParents, groups, setGroups, allReviews, books, setBooks, leads, setLeads, finances, setFinances, bookSales, setBookSales, allSmmReports, setAllSmmReports }) {
  const [tab, setTab] = useState("home");
  const [reportSubTab, setReportSubTab] = useState("lessons");
  const [modal, setModal] = useState(null);
  const [notif, setNotif] = useState(null);
  const [newT, setNewT] = useState({ name: "", subject: "", phone: "", rate: "600", login: "", password: "", format: "выезд", duties: "", staffRole: "teacher", position: "" });
  const STAFF_ROLES = [
    { val: "teacher",     icon: "👩‍🏫", label: "Педагог",     color: C.blueDark },
    { val: "coordinator", icon: "🗂️",  label: "Координатор", color: C.coord    },
    { val: "other",       icon: "➕",  label: "Другое",       color: C.muted    },
  ];
  const [newP, setNewP] = useState({ name: "", phone: "", password: "", studentId: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [editTeacher, setEditTeacher] = useState(null);
  const [finMonth, setFinMonth] = useState(getMonthKey(new Date()));
  const [fixedExp, setFixedExp] = useState({ rent: 15000, coordinator: 10000, ads: 20000 });
  const [editFixed, setEditFixed] = useState(false);
  const [newExp, setNewExp] = useState({ category: "", amount: "", notes: "" });
  const [expModal, setExpModal] = useState(false);
  const [prices, setPrices] = useState({ visit: 1000, online: 800, group: 7500, region: 1400 });

  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3000); };

  useEffect(() => {
    sb.all("ak_settings").then(settings => {
      if (settings) {
        const pricesSetting = settings.find(s => s.key === "prices");
        if (pricesSetting && pricesSetting.value) {
          try { setPrices(JSON.parse(pricesSetting.value)); } catch (e) {}
        }
      }
    });
  }, []);

  const addTeacher = async () => {
    if (!newT.name || !newT.login || !newT.password) return;
    const color = TEACHER_COLORS[teachers.length % TEACHER_COLORS.length];
    const isCoord = newT.staffRole === "coordinator";
    const isTeacher = newT.staffRole === "teacher";
    const roleObj = STAFF_ROLES.find(r => r.val === newT.staffRole);
    const teacher = {
      id: Date.now(), name: newT.name,
      subject: isCoord ? "Координатор" : isTeacher ? newT.subject : (newT.position || roleObj?.label || newT.staffRole),
      avatar: newT.name[0].toUpperCase(), color,
      role: isCoord ? "coordinator" : isTeacher ? "teacher" : newT.staffRole,
      login: newT.login.toLowerCase().trim(), password: newT.password, phone: newT.phone,
      rate: Number(newT.rate) || 0, format: isCoord ? "" : isTeacher ? newT.format : "", duties: newT.duties,
      position: newT.position,
    };
    // Only send valid fields to Supabase (no staffRole, salaryType, etc.)
    const dbTeacher = {
      id: teacher.id,
      name: teacher.name,
      login: teacher.login,
      password: teacher.password,
      role: teacher.role,
      subject: teacher.subject,
      phone: teacher.phone || "",
      rate: teacher.rate,
      format: teacher.format || "",
      avatar: teacher.avatar,
      color: teacher.color,
      duties: teacher.duties || "",
      position: teacher.position || "",
    };
    setTeachers(prev => [...prev, teacher]);
    await sb.add("ak_teachers", dbTeacher);
    setNewT({ name: "", subject: "", phone: "", rate: "600", login: "", password: "", format: "выезд", duties: "", staffRole: "teacher", position: "" });
    setModal(null); toast(`🎉 ${roleObj?.label || "Сотрудник"} ${newT.name} добавлен!`);
  };

  const addParent = () => {
    if (!newP.name || !newP.phone || !newP.password || !newP.studentId) return;
    const par = { id: Date.now(), name: newP.name, phone: newP.phone, login: newP.phone, password: newP.password, studentId: Number(newP.studentId), role: "parent" };
    setParents(prev => [...prev, par]); sb.add("ak_parents", par);
    setNewP({ name: "", phone: "", password: "", studentId: "" });
    setModal(null); toast(`👨‍👩‍👧 Родитель ${newP.name} добавлен!`);
  };

  const income = (prices.visit || 1000) * students.filter(s => s.format === "выезд").length
    + (prices.online || 800) * students.filter(s => s.format === "онлайн").length
    + (prices.region || 1400) * students.filter(s => s.format === "регион").length
    + (prices.group || 7500) * students.filter(s => s.format === "группа").length;
  const toTeach = teachers.reduce((s, t) => s + (t.rate || 600), 0);

  const nav = [
    { key: "home",     icon: "🏠", label: "Главная"    },
    { key: "teachers", icon: "👥", label: "Сотрудники" },
    { key: "students", icon: "👦", label: "Ученики"    },
    { key: "groups",   icon: "🏫", label: "Группы"     },
    { key: "parents",  icon: "👨‍👩‍👧", label: "Родители"  },
    { key: "leads",    icon: "🎯", label: "Лиды"       },
    { key: "reports",  icon: "📋", label: "Отчёты"     },
    { key: "finance",  icon: "💰", label: "Финансы"    },
    { key: "schedule", icon: "📅", label: "Расписание" },
    { key: "reviews",  icon: "⭐", label: "Отзывы"     },
    { key: "library",   icon: "📚", label: "Книги"      },
    { key: "districts", icon: "🗺️", label: "Карта"      },
    { key: "settings",  icon: "⚙️", label: "Настройки"  },
  ];

  return (
    <Layout user={user} tab={tab} setTab={setTab} navItems={nav} onLogout={onLogout}>
      {notif && <div style={{ position: "fixed", top: 18, right: 18, background: C.blue, color: "#fff", padding: "12px 22px", borderRadius: 12, fontWeight: 700, zIndex: 999, boxShadow: `0 4px 20px ${C.blue}55` }}>🐼 {notif}</div>}

      {tab === "home" && (
        <div>
          <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`, borderRadius: 20, padding: "24px", marginBottom: 22, display: "flex", alignItems: "center", gap: 20, boxShadow: `0 8px 32px ${C.blue}44` }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: 8 }}><PandaLogo size={56} /></div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Панель руководителя</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>Привет, Айданек! 👑</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Всё под контролем</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 22 }}>
            <StatCard icon="👦" val={students.length}  label="Учеников"  color={C.blue}    />
            <StatCard icon="🏫" val={students.filter(s=>s.format==="группа").length} label="В группах" color={C.group} />
            <StatCard icon="🚗" val={students.filter(s=>s.format==="выезд").length}  label="На выезде" color={C.home}  />
            <StatCard icon="👩‍🏫" val={teachers.length} label="Педагогов" color="#5B9E6E"   />
            <StatCard icon="💰" val={(income - toTeach).toLocaleString() + " с"} label="Прибыль" color={C.warning} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
            {Object.entries(LEAD_STATUSES).map(([key, s]) => (
              <Card key={key} style={{ textAlign: "center", borderTop: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{leads.filter(l => l.status === key).length}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
              </Card>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>📋 Последние отчёты</div>
              {allReports.length === 0 ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>Отчётов пока нет</div>
                : allReports.slice(0,4).map(r => (
                  <div key={r.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{r.teacherName}</div>
                      <Stars rating={r.rating} />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>👦 {r.studentName} · {r.topic}</div>
                  </div>
                ))}
            </Card>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>🎯 Воронка — активные</div>
              {leads.filter(l => l.status === "new" || l.status === "trial").slice(0,4).map(l => (
                <div key={l.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{l.childName}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>📍 {l.district} · {l.subject}</div>
                  <Badge text={LEAD_STATUSES[l.status].label} color={LEAD_STATUSES[l.status].color} />
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {tab === "teachers" && (
        <div>
          <PageTitle emoji="👥" title="Сотрудники" action={<Btn onClick={() => setModal("addTeacher")} color={C.blueDark}>+ Добавить сотрудника</Btn>} />

          {teachers.filter(t => t.role === "coordinator").length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.coord, marginBottom: 10 }}>🗂️ Координаторы</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {teachers.filter(t => t.role === "coordinator").map(t => (
                  <Card key={t.id} style={{ borderTop: `4px solid ${C.coord}` }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ position: "relative" }}>
                        <Av l={t.avatar} color={C.coord} size={48} photoUrl={t.photoUrl} />
                        <button onClick={() => setEditTeacher({...t})} style={{ position: "absolute", bottom: -2, right: -2, background: C.blue, border: "2px solid white", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 10, color: "#fff", padding: 0 }}>✏️</button>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</div>
                        <Badge text="🗂️ Координатор" color={C.coord} />
                        {t.rate > 0 && <div style={{ fontSize: 12, color: C.warning, fontWeight: 700, marginTop: 4 }}>{t.rate.toLocaleString()} сом/месяц</div>}
                        {t.phone && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>📞 {t.phone}</div>}
                      </div>
                      <button onClick={() => setConfirmDelete({ type: "teacher", id: t.id, name: t.name })} style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                    </div>
                    <CollapsibleDuties duties={t.duties} titleColor={C.coord} />
                    <div style={{ fontSize: 12, background: C.blueLight, borderRadius: 8, padding: "6px 10px", color: C.blueDark, fontWeight: 600 }}>🔑 {t.login}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 13, fontWeight: 800, color: C.blueDark, marginBottom: 10 }}>👩‍🏫 Педагоги</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {teachers.filter(t => t.role === "teacher").map(t => {
              const myS = students.filter(s => s.teacherId === t.id);
              const myR = allReports.filter(r => r.teacherId === t.id);
              return (
                <Card key={t.id} style={{ borderTop: `4px solid ${t.color}` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ position: "relative" }}>
                      <Av l={t.avatar} color={t.color} size={52} photoUrl={t.photoUrl} />
                      <button onClick={() => setEditTeacher({...t})} style={{ position: "absolute", bottom: -2, right: -2, background: C.blue, border: "2px solid white", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 10, color: "#fff", padding: 0 }}>✏️</button>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{t.subject}</div>
                      <div style={{ fontSize: 12, color: C.warning, fontWeight: 700 }}>{(t.rate || 600).toLocaleString()} сом/урок</div>
                      {t.format && <Badge text={FORMAT_LABELS[t.format] || t.format} color={FORMAT_COLORS[t.format] || C.blue} />}
                    </div>
                    <button onClick={() => setConfirmDelete({ type: "teacher", id: t.id, name: t.name })} style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                  </div>
                  <CollapsibleDuties duties={t.duties} />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    <Badge text={`${myS.length} учеников`} color={t.color} />
                    <Badge text={`${myR.length} отчётов`}  color={C.blue}  />
                  </div>
                  {t.phone && <div style={{ fontSize: 12, color: C.muted }}>📞 {t.phone}</div>}
                  <div style={{ fontSize: 12, background: C.blueLight, borderRadius: 8, padding: "6px 10px", color: C.blueDark, fontWeight: 600, marginTop: 8 }}>🔑 {t.login}</div>
                </Card>
              );
            })}
          </div>

          {teachers.filter(t => !["teacher","coordinator"].includes(t.role)).length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.muted, marginBottom: 10 }}>👔 Другие сотрудники</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {teachers.filter(t => !["teacher","coordinator"].includes(t.role)).map(t => {
                  const roleObj = STAFF_ROLES.find(r => r.val === (t.staffRole || t.role));
                  const roleColor = roleObj?.color || C.muted;
                  return (
                    <Card key={t.id} style={{ borderTop: `4px solid ${roleColor}` }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                        <Av l={t.avatar} color={roleColor} size={46} photoUrl={t.photoUrl} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</div>
                          <Badge text={`${roleObj?.icon || ""} ${t.position || t.subject || roleObj?.label || t.role}`} color={roleColor} />
                          {t.rate > 0 && <div style={{ fontSize: 12, color: C.warning, fontWeight: 700, marginTop: 4 }}>{t.rate.toLocaleString()} сом/мес</div>}
                          {t.phone && <div style={{ fontSize: 12, color: C.muted }}>📞 {t.phone}</div>}
                        </div>
                        <button onClick={() => setConfirmDelete({ type: "teacher", id: t.id, name: t.name })} style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                      </div>
                      <CollapsibleDuties duties={t.duties} titleColor={roleColor} />
                      <div style={{ fontSize: 12, background: C.blueLight, borderRadius: 8, padding: "6px 10px", color: C.blueDark, fontWeight: 600, marginTop: 8 }}>🔑 {t.login}</div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <Modal open={modal === "addTeacher"} onClose={() => setModal(null)} title="👥 Новый сотрудник">
            <div style={{ marginBottom: 16 }}>
              <Label>РОЛЬ СОТРУДНИКА <span style={{ color: C.danger }}>*</span></Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STAFF_ROLES.map(opt => (
                  <button key={opt.val} onClick={() => setNewT(p => ({...p, staffRole: opt.val}))} style={{
                    padding: "9px 14px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                    background: newT.staffRole === opt.val ? opt.color : C.blueLight,
                    color: newT.staffRole === opt.val ? "#fff" : C.muted,
                    border: `2px solid ${newT.staffRole === opt.val ? opt.color : C.border}`,
                  }}>{opt.icon} {opt.label}</button>
                ))}
              </div>
            </div>
            <FInput label="ИМЯ" value={newT.name} onChange={v => setNewT(p => ({...p, name: v}))} required />
            <FInput label="ТЕЛЕФОН" value={newT.phone} onChange={v => setNewT(p => ({...p, phone: v}))} placeholder="+996 700 ..." />
            {newT.staffRole === "teacher" && (
              <>
                <FInput label="ПРЕДМЕТ" value={newT.subject} onChange={v => setNewT(p => ({...p, subject: v}))} />
                <FInput label="СТАВКА (сом/урок)" value={newT.rate} onChange={v => setNewT(p => ({...p, rate: v}))} type="number" />
                <FSelect label="ФОРМАТ РАБОТЫ" value={newT.format} onChange={v => setNewT(p => ({...p, format: v}))} options={FORMATS.map(f => ({ value: f, label: FORMAT_LABELS[f] }))} />
              </>
            )}
            {newT.staffRole === "other" && (
              <>
                <FInput label="ДОЛЖНОСТЬ (своя)" value={newT.position} onChange={v => setNewT(p => ({...p, position: v}))} placeholder="Например: СММ, Психолог, Администратор..." required />
                <FInput label="ЗАРПЛАТА (сом/месяц)" value={newT.rate} onChange={v => setNewT(p => ({...p, rate: v}))} type="number" />
              </>
            )}
            <FTextarea label="ОБЯЗАННОСТИ" value={newT.duties} onChange={v => setNewT(p => ({...p, duties: v}))} placeholder="Обязанности сотрудника..." rows={3} />
            <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.blueDark, marginBottom: 10 }}>🔐 Данные для входа</div>
              <FInput label="ЛОГИН" value={newT.login} onChange={v => setNewT(p => ({...p, login: v}))} required />
              <FInput label="ПАРОЛЬ" value={newT.password} onChange={v => setNewT(p => ({...p, password: v}))} required />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <Btn full onClick={addTeacher} color={STAFF_ROLES.find(r => r.val === newT.staffRole)?.color || C.blueDark} disabled={!newT.name || !newT.login || !newT.password}>Добавить</Btn>
              <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
            </div>
          </Modal>

          <Modal open={!!editTeacher} onClose={() => setEditTeacher(null)} title={`✏️ ${editTeacher?.name}`}>
            {editTeacher && (
              <div>
                <AvatarUpload
                  currentUrl={editTeacher.photoUrl}
                  name={editTeacher.name}
                  color={editTeacher.color}
                  onUpload={url => {
                    setTeachers(p => p.map(t => t.id === editTeacher.id ? { ...t, photoUrl: url } : t));
                    setEditTeacher(prev => ({ ...prev, photoUrl: url }));
                  }}
                />
                <FInput label="ИМЯ" value={editTeacher.name} onChange={v => setEditTeacher(p => ({...p, name: v}))} />
                <FInput label="ПРЕДМЕТ" value={editTeacher.subject || ""} onChange={v => setEditTeacher(p => ({...p, subject: v}))} />
                <FInput label="ТЕЛЕФОН" value={editTeacher.phone || ""} onChange={v => setEditTeacher(p => ({...p, phone: v}))} />
                <FInput label="СТАВКА" value={String(editTeacher.rate || 600)} onChange={v => setEditTeacher(p => ({...p, rate: Number(v)}))} type="number" />
                <FSelect label="ФОРМАТ РАБОТЫ" value={editTeacher.format || "выезд"} onChange={v => setEditTeacher(p => ({...p, format: v}))} options={FORMATS.map(f => ({ value: f, label: FORMAT_LABELS[f] }))} />
                <FTextarea label="ОБЯЗАННОСТИ" value={editTeacher.duties || ""} onChange={v => setEditTeacher(p => ({...p, duties: v}))} rows={3} />
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn full color={C.success} onClick={() => {
                    sb.patch("ak_teachers", editTeacher.id, editTeacher); setTeachers(p => p.map(t => t.id === editTeacher.id ? { ...t, ...editTeacher } : t)); setEditTeacher(null); toast("✅ Педагог обновлён!");
                  }}>Сохранить</Btn>
                  <Btn outline color={C.muted} onClick={() => setEditTeacher(null)}>Отмена</Btn>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {tab === "students" && (
        <StudentsTab students={students} teachers={teachers} groups={groups} setStudents={setStudents} canDelete={true} canAdd={true} toast={toast} />
      )}

      {tab === "groups" && (
        <div>
          <PageTitle emoji="🏫" title="Группы" action={<Btn onClick={() => setModal("addGroup")} color={C.group}>+ Создать группу</Btn>} />
          {groups.map(g => {
            const teacher = teachers.find(t => t.id === g.teacherId);
            const groupStudents = students.filter(s => s.groupId === g.id);
            const today = new Date().toLocaleDateString("ru-RU");
            return (
              <Card key={g.id} style={{ marginBottom: 16, borderLeft: `5px solid ${g.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{g.name}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>👩‍🏫 {teacher?.name} · 🕐 {g.time} · 📍 {g.address}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {g.days.map(d => <span key={d} style={{ background: g.color + "20", color: g.color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{d}</span>)}
                    </div>
                  </div>
                  <Badge text={`${groupStudents.length}/${g.maxStudents} детей`} color={groupStudents.length >= g.maxStudents ? C.danger : C.success} />
                </div>
                <div style={{ background: C.blueLight, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, color: C.blueDark }}>📋 Посещаемость — {today}</div>
                  {groupStudents.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>Нет детей в группе</div>
                    : groupStudents.map(s => {
                      const key = `${g.id}_${s.id}_${today}`;
                      const status = attendance[key];
                      return (
                        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setAttendance(p => ({...p, [key]: "present"}))} style={{ padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", background: status === "present" ? C.success : C.blueLight, color: status === "present" ? "#fff" : C.muted }}>✅ Был</button>
                            <button onClick={() => setAttendance(p => ({...p, [key]: "absent"}))}  style={{ padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", background: status === "absent"  ? C.danger  : C.blueLight, color: status === "absent"  ? "#fff" : C.muted }}>❌ Нет</button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            );
          })}
          <Modal open={modal === "addGroup"} onClose={() => setModal(null)} title="🏫 Новая группа">
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>Группа для офисных занятий на Масалиева</div>
            <FInput label="НАЗВАНИЕ ГРУППЫ" value="" onChange={() => {}} placeholder="Кыргызская А" />
            <FSelect label="ПЕДАГОГ" value="" onChange={() => {}} options={teachers.map(t => ({ value: t.id, label: t.name }))} />
            <FInput label="ВРЕМЯ" value="" onChange={() => {}} placeholder="09:00–11:00" />
            <FInput label="МАХ УЧЕНИКОВ" value="8" onChange={() => {}} type="number" />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn full color={C.group}>Создать группу</Btn>
              <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
            </div>
          </Modal>
        </div>
      )}

      {tab === "parents" && (
        <div>
          <PageTitle emoji="👨‍👩‍👧" title="Родители" action={<Btn onClick={() => setModal("addParent")} color="#8B6BB5">+ Добавить</Btn>} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {parents.map(p => {
              const student = students.find(s => s.id === p.studentId);
              return (
                <Card key={p.id} style={{ borderTop: "4px solid #8B6BB5" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <Av l={p.name[0]} color="#8B6BB5" size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>📞 {p.phone}</div>
                    </div>
                    <button onClick={() => setConfirmDelete({ type: "parent", id: p.id, name: p.name })} style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                  </div>
                  {student && <div style={{ background: C.blueLight, borderRadius: 10, padding: "8px 12px", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>РЕБЁНОК</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{student.name} · {student.grade}</div>
                    <Badge text={FORMAT_LABELS[student.format] || student.format} color={FORMAT_COLORS[student.format] || C.blue} />
                  </div>}
                  <div style={{ fontSize: 12, background: C.blueLight, borderRadius: 8, padding: "6px 10px", color: C.blueDark, fontWeight: 600 }}>🔑 {p.login} / {p.password}</div>
                </Card>
              );
            })}
          </div>
          <Modal open={modal === "addParent"} onClose={() => setModal(null)} title="👨‍👩‍👧 Новый родитель">
            <FInput label="ИМЯ" value={newP.name} onChange={v => setNewP(p => ({...p, name: v}))} required />
            <FSelect label="РЕБЁНОК" value={newP.studentId} onChange={v => setNewP(p => ({...p, studentId: v}))} options={students.map(s => ({ value: s.id, label: `${s.name} · ${s.grade}` }))} required />
            <FInput label="ТЕЛЕФОН (логин)" value={newP.phone} onChange={v => setNewP(p => ({...p, phone: v}))} required />
            <FInput label="ПАРОЛЬ" value={newP.password} onChange={v => setNewP(p => ({...p, password: v}))} required />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn full onClick={addParent} color="#8B6BB5" disabled={!newP.name || !newP.phone || !newP.password || !newP.studentId}>Добавить</Btn>
              <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
            </div>
          </Modal>
        </div>
      )}

      {tab === "leads" && (
        <LeadsTab leads={leads} setLeads={setLeads} teachers={teachers} toast={toast} allTrials={allTrials} />
      )}

      {tab === "trials" && (
        <div>
          <PageTitle emoji="🧪" title="Пробные уроки" />
          {allTrials.length === 0 ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Пробных пока нет</div></Card>
            : allTrials.map(t => (
              <Card key={t.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{t.childName}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>👩‍🏫 {t.teacherName} · {t.date} · 📞 {t.parentPhone}</div>
                  </div>
                  <Badge text={t.recommend ? "✅ Берём!" : "⏳ На рассмотрении"} color={t.recommend ? C.success : C.warning} />
                </div>
              </Card>
            ))}
        </div>
      )}

      {tab === "reports" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>📋 Отчёты</div>
            <Btn small color={C.blue} onClick={() => {
              sb.all("ak_reports").then(r => { if (r) setAllReports(r); });
              sb.all("ak_trials").then(tr => { if (tr) setAllTrials(tr); });
              toast("🔄 Обновлено!");
            }}>🔄 Обновить</Btn>
          </div>
          {(() => {
            const subTab = reportSubTab;
            const setSubTab = setReportSubTab;
            const subTabs = [
              { key: "lessons", icon: "📝", label: "Уроки" },
              { key: "trials", icon: "🧪", label: "Пробные" },
              { key: "coordinator", icon: "🗂️", label: "Координатор" },
              { key: "smm", icon: "📱", label: "СММ" },
            ];
            const today = new Date().toLocaleDateString("ru-RU");
            const todayRu = new Date().toLocaleDateString("ru-RU", { weekday: "long" });
            const todayDays = DAYS.filter(d => d.toLowerCase().startsWith(todayRu.toLowerCase().slice(0, 3)));
            const todayReports = allReports.filter(r => r.date === today);
            const reportedTeacherIds = new Set(todayReports.map(r => r.teacherId));
            const teachersWithLessonsToday = teachers.filter(t => {
              const hasStudents = students.some(s => s.teacherId === t.id && (s.days || []).some(d => todayDays.includes(d) || d.toLowerCase().startsWith(todayRu.toLowerCase().slice(0, 2))));
              return hasStudents && !reportedTeacherIds.has(t.id);
            });
            return (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {subTabs.map(st => (
                    <button key={st.key} onClick={() => setSubTab(st.key)} style={{
                      padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit", border: "none",
                      background: subTab === st.key ? C.blue : C.blueLight,
                      color: subTab === st.key ? "#fff" : C.muted,
                      boxShadow: subTab === st.key ? `0 3px 10px ${C.blue}44` : "none",
                    }}>{st.icon} {st.label}</button>
                  ))}
                </div>

                {subTab === "lessons" && (
                  <div>
                    {teachersWithLessonsToday.length > 0 && (
                      <Card style={{ marginBottom: 18, borderLeft: `5px solid ${C.danger}` }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: C.danger, marginBottom: 12 }}>⚠️ Не написали отчёт — {today}</div>
                        {teachersWithLessonsToday.map(t => (
                          <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <Av l={t.avatar} color={t.color} size={32} photoUrl={t.photoUrl} />
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                            </div>
                            <Badge text="❌ Нет отчёта" color={C.danger} />
                          </div>
                        ))}
                      </Card>
                    )}
                    {allReports.length === 0
                      ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Отчётов пока нет</div></Card>
                      : allReports.map(r => <ExpandableReportCard key={r.id} r={r} teachers={teachers} />)}
                  </div>
                )}

                {subTab === "trials" && (
                  <div>
                    {allTrials.length === 0
                      ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Пробных уроков пока нет</div></Card>
                      : allTrials.map(t => <ExpandableTrialCard key={t.id} t={t} teachers={teachers} />)}
                  </div>
                )}

                {subTab === "coordinator" && (
                  <div>
                    {(allSmmReports || []).filter(r => r.type === "coordinator").length === 0
                      ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Отчётов координатора пока нет</div></Card>
                      : (allSmmReports || []).filter(r => r.type === "coordinator").map(r => (
                        <Card key={r.id} style={{ marginBottom: 12, borderLeft: `4px solid ${C.coord}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ fontWeight: 800 }}>🗂️ {r.authorName}</div>
                            <div style={{ fontSize: 12, color: C.muted }}>{r.date}</div>
                          </div>
                          <div style={{ fontSize: 13 }}>🧪 Пробных назначено: <b>{r.trialsScheduled}</b></div>
                          <div style={{ fontSize: 13 }}>👦 Учеников добавлено: <b>{r.studentsAdded}</b></div>
                          <div style={{ fontSize: 13 }}>📞 Родителей обзвонила: <b>{r.parentsCalled}</b></div>
                          {r.notes && <div style={{ marginTop: 8, background: C.blueLight, borderRadius: 8, padding: 10, fontSize: 13 }}>💬 {r.notes}</div>}
                        </Card>
                      ))}
                  </div>
                )}

                {subTab === "smm" && (
                  <div>
                    {(allSmmReports || []).filter(r => r.type === "smm_report").length === 0
                      ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Отчётов СММ пока нет</div></Card>
                      : (allSmmReports || []).filter(r => r.type === "smm_report").map(r => (
                        <Card key={r.id} style={{ marginBottom: 12, borderLeft: `4px solid #E91E8C` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <div style={{ fontWeight: 800 }}>📱 {r.authorName}</div>
                            <div style={{ fontSize: 12, color: C.muted }}>{r.date}</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                            <div style={{ background: C.blueLight, borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>📸 Постов: <b>{r.postsCount}</b></div>
                            <div style={{ background: C.blueLight, borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>👥 Подписчики: <b>+{r.newFollowers}</b></div>
                            <div style={{ background: C.blueLight, borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>👁️ Охваты: <b>{r.reach}</b></div>
                            <div style={{ background: C.blueLight, borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>🎯 Лиды: <b>{r.leadsFromSocial}</b></div>
                          </div>
                          {r.bestPost && <div style={{ fontSize: 13, marginBottom: 6 }}>⭐ Лучший пост: <b>{r.bestPost}</b></div>}
                          {r.notes && <div style={{ background: C.blueLight, borderRadius: 8, padding: 10, fontSize: 13 }}>💬 {r.notes}</div>}
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {tab === "finance" && (
        <div>
          <PageTitle emoji="💰" title="Финансы" />
          {(() => {
            const now = new Date();
            const allMonthKeys = [...new Set([
              getMonthKey(now),
              ...allReports.map(r => { const p = r.date?.split("."); return p?.length === 3 ? `${MONTHS_RU[Number(p[1])-1]} ${p[2]}` : ""; }).filter(Boolean),
              ...finances.map(f => f.month).filter(Boolean),
              ...bookSales.map(b => b.month).filter(Boolean),
            ])].sort().reverse();

            const monthReports = allReports.filter(r => {
              const p = r.date?.split("."); if (!p || p.length !== 3) return false;
              return `${MONTHS_RU[Number(p[1])-1]} ${p[2]}` === finMonth;
            });

            const monthFinances = finances.filter(f => f.month === finMonth);
            const monthBookSales = bookSales.filter(b => b.month === finMonth);

            const totalPayments = monthReports.filter(r => r.paymentReceived).reduce((s, r) => s + (r.paymentAmount || 0), 0);
            const totalBookSales = monthBookSales.reduce((s, b) => s + (b.amount || 0), 0);

            const teacherStats = teachers.filter(t => t.role === "teacher").map(t => {
              const tReports = monthReports.filter(r => r.teacherId === t.id);
              const lessons = tReports.length;
              const payments = tReports.filter(r => r.paymentReceived).reduce((s, r) => s + (r.paymentAmount || 0), 0);
              // Онлайн педагог получает 50% от оплаты, остальные — фиксированную ставку
              const isOnline = t.format === "онлайн";
              const salary = isOnline
                ? Math.round(payments * 0.5)
                : lessons * (t.rate || 600);
              const profit = payments - salary;
              return { ...t, lessons, payments, salary, profit, isOnline };
            });

            const totalSalary = teacherStats.reduce((s, t) => s + t.salary, 0);
            const totalFixed = Number(fixedExp.rent || 0) + Number(fixedExp.coordinator || 0) + Number(fixedExp.ads || 0);
            const otherExpenses = monthFinances.filter(f => f.type === "other_expense");
            const totalOtherExp = otherExpenses.reduce((s, f) => s + (f.amount || 0), 0);
            const totalIncome = totalPayments + totalBookSales;
            const netProfit = totalIncome - totalSalary - totalFixed - totalOtherExp;

            const formatStats = [
              { key: "выезд", label: "🚗 Выезд обычный (1000с)", incomePer: 1000, teacherPer: 600 },
              { key: "выезд_англ", label: "🚗 Выезд англ/кырг (1300с)", incomePer: 1300, teacherPer: 700 },
              { key: "группа", label: "🏫 Группа (7500с/мес)", incomePer: 7500, teacherPer: 700 },
              { key: "онлайн", label: "💻 Онлайн (800с, педагогу 400с)", incomePer: 800, teacherPer: 400 },
              { key: "регион", label: "🌍 Регион (1400с)", incomePer: 1400, teacherPer: 600 },
            ].map(fmt => {
              const fmtStudents = students.filter(s => {
                if (fmt.key === "выезд_англ") return s.format === "выезд" && teachers.find(t => t.id === s.teacherId)?.subject?.match(/Английский|Кыргызский/);
                if (fmt.key === "выезд") return s.format === "выезд" && !teachers.find(t => t.id === s.teacherId)?.subject?.match(/Английский|Кыргызский/);
                return s.format === fmt.key;
              });
              const fmtReports = monthReports.filter(r => {
                const s = students.find(st => st.id === r.studentId);
                if (!s) return false;
                if (fmt.key === "выезд_англ") return s.format === "выезд" && teachers.find(t => t.id === s.teacherId)?.subject?.match(/Английский|Кыргызский/);
                if (fmt.key === "выезд") return s.format === "выезд" && !teachers.find(t => t.id === s.teacherId)?.subject?.match(/Английский|Кыргызский/);
                return s.format === fmt.key;
              });
              const lessons = fmtReports.length;
              const income = fmt.key === "группа" ? fmtStudents.length * fmt.incomePer : lessons * fmt.incomePer;
              const expense = fmt.key === "группа" ? fmtStudents.length * fmt.teacherPer : lessons * fmt.teacherPer;
              return { ...fmt, students: fmtStudents.length, lessons, income, expense, profit: income - expense };
            });

            const saveFixed = () => {
              const today = new Date().toLocaleDateString("ru-RU");
              const mk = finMonth;
              ["rent","coordinator","ads"].forEach(cat => {
                const existing = finances.find(f => f.type === "fixed_expense" && f.category === cat && f.month === mk);
                if (existing) {
                  sb.patch("ak_finances", existing.id, { amount: Number(fixedExp[cat]) });
                  setFinances(p => p.map(f => f.id === existing.id ? { ...f, amount: Number(fixedExp[cat]) } : f));
                } else {
                  const rec = { type: "fixed_expense", category: cat, amount: Number(fixedExp[cat]), date: today, month: mk, notes: "" };
                  sb.add("ak_finances", rec).then(saved => { if (saved) setFinances(p => [...p, saved]); });
                }
              });
              setEditFixed(false);
              toast("Фикс. расходы сохранены");
            };

            const addOtherExpense = () => {
              if (!newExp.category || !newExp.amount) return;
              const today = new Date().toLocaleDateString("ru-RU");
              const rec = { type: "other_expense", category: newExp.category, amount: Number(newExp.amount), date: today, month: finMonth, notes: newExp.notes };
              sb.add("ak_finances", rec).then(saved => { if (saved) setFinances(p => [...p, saved]); });
              setNewExp({ category: "", amount: "", notes: "" });
              setExpModal(false);
              toast("Расход добавлен");
            };

            const delExpense = (id) => {
              sb.del("ak_finances", id);
              setFinances(p => p.filter(f => f.id !== id));
            };

            return (
              <div>
                {/* Month switcher */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {allMonthKeys.map(mk => (
                    <button key={mk} onClick={() => setFinMonth(mk)} style={{
                      padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      background: finMonth === mk ? C.blue : C.blueLight, color: finMonth === mk ? "#fff" : C.muted, border: "none",
                    }}>{mk}</button>
                  ))}
                </div>

                {/* 1. Dashboard */}
                <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`, borderRadius: 20, padding: 24, marginBottom: 20, color: "#fff" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>📊 {finMonth}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 16, textAlign: "center" }}>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>ДОХОД</div>
                      <div style={{ fontSize: 24, fontWeight: 900 }}>{totalIncome.toLocaleString()} с</div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>Оплаты: {totalPayments.toLocaleString()} с | Книги: {totalBookSales.toLocaleString()} с</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 16, textAlign: "center" }}>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>РАСХОДЫ</div>
                      <div style={{ fontSize: 24, fontWeight: 900 }}>{(totalSalary + totalFixed + totalOtherExp).toLocaleString()} с</div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>Зарплаты: {totalSalary.toLocaleString()} | Фикс: {totalFixed.toLocaleString()} | Прочее: {totalOtherExp.toLocaleString()}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 16, textAlign: "center" }}>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>ЧИСТАЯ ПРИБЫЛЬ</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: netProfit >= 0 ? "#7FFF7F" : "#FF7F7F" }}>{netProfit.toLocaleString()} с</div>
                    </div>
                  </div>
                </div>

                {/* Fixed expenses */}
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>🏠 Фиксированные расходы</div>
                    <Btn small outline color={C.blue} onClick={() => setEditFixed(!editFixed)}>{editFixed ? "Отмена" : "✏️ Изменить"}</Btn>
                  </div>
                  {editFixed ? (
                    <div>
                      <FInput label="АРЕНДА (сом)" value={fixedExp.rent} onChange={v => setFixedExp(p => ({...p, rent: v}))} type="number" />
                      <FInput label="КОРДИНАТОР (сом)" value={fixedExp.coordinator} onChange={v => setFixedExp(p => ({...p, coordinator: v}))} type="number" />
                      <FInput label="РЕКЛАМА (сом)" value={fixedExp.ads} onChange={v => setFixedExp(p => ({...p, ads: v}))} type="number" />
                      <Btn full color={C.success} onClick={saveFixed}>💾 Сохранить</Btn>
                    </div>
                  ) : (
                    <div>
                      {[
                        { icon: "🏠", label: "Аренда", val: fixedExp.rent },
                        { icon: "🗂️", label: "Координатор", val: fixedExp.coordinator },
                        { icon: "📣", label: "Реклама", val: fixedExp.ads },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{item.icon} {item.label}</span>
                          <span style={{ fontWeight: 800, fontSize: 13, color: C.danger }}>{Number(item.val).toLocaleString()} с</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: `2px solid ${C.border}`, marginTop: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>Итого фикс.</span>
                        <span style={{ fontWeight: 900, fontSize: 14, color: C.danger }}>{totalFixed.toLocaleString()} с</span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Book sales */}
                {monthBookSales.length > 0 && (
                  <Card style={{ marginBottom: 16, borderLeft: `4px solid ${C.warning}` }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>📚 Продажи книг</div>
                    {monthBookSales.map((b, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < monthBookSales.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{b.book_title}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{b.date}</div>
                        </div>
                        <span style={{ fontWeight: 800, color: C.success }}>+{b.amount?.toLocaleString()} с</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", borderTop: `2px solid ${C.border}`, marginTop: 6 }}>
                      <span style={{ fontWeight: 800 }}>Итого книги</span>
                      <span style={{ fontWeight: 900, color: C.success }}>+{totalBookSales.toLocaleString()} с</span>
                    </div>
                  </Card>
                )}

                {/* 2. Teacher table */}
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>👩‍🏫 По педагогам</div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                        {["Педагог","Уроков","Оплаты","Зарплата","Прибыль"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 6px", fontSize: 11, color: C.muted, fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teacherStats.map(t => (
                        <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: 8 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <Av l={t.avatar} color={t.color} size={26} photoUrl={t.photoUrl} />
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</span>
                                {t.isOnline && <div style={{ fontSize: 10, color: C.online, fontWeight: 700 }}>💻 50% от оплат</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: 8, fontSize: 13, fontWeight: 700 }}>{t.lessons}</td>
                          <td style={{ padding: 8, fontSize: 13, fontWeight: 700, color: C.success }}>{t.payments.toLocaleString()} с</td>
                          <td style={{ padding: 8, fontSize: 13, fontWeight: 700, color: C.danger }}>{t.salary.toLocaleString()} с{t.isOnline ? <span style={{ fontSize: 10, color: C.muted }}> (50%)</span> : ""}</td>
                          <td style={{ padding: 8, fontSize: 13, fontWeight: 800, color: t.profit >= 0 ? C.success : C.danger }}>{t.profit.toLocaleString()} с</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `2px solid ${C.border}` }}>
                        <td style={{ padding: 8, fontWeight: 900 }}>Итого</td>
                        <td style={{ padding: 8, fontWeight: 900 }}>{teacherStats.reduce((s,t) => s + t.lessons, 0)}</td>
                        <td style={{ padding: 8, fontWeight: 900, color: C.success }}>{totalPayments.toLocaleString()} с</td>
                        <td style={{ padding: 8, fontWeight: 900, color: C.danger }}>{totalSalary.toLocaleString()} с</td>
                        <td style={{ padding: 8, fontWeight: 900, color: totalPayments - totalSalary >= 0 ? C.success : C.danger }}>{(totalPayments - totalSalary).toLocaleString()} с</td>
                      </tr>
                    </tfoot>
                  </table>
                </Card>

                {/* 3. By format */}
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>📊 По форматам</div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                        {["Формат","Учеников","Уроков","Доход","Расход","Прибыль"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 6px", fontSize: 11, color: C.muted, fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formatStats.map(f => (
                        <tr key={f.key} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: 8, fontWeight: 700, fontSize: 13 }}>{f.label}</td>
                          <td style={{ padding: 8, fontSize: 13 }}>{f.students}</td>
                          <td style={{ padding: 8, fontSize: 13 }}>{f.lessons}</td>
                          <td style={{ padding: 8, fontSize: 13, fontWeight: 700, color: C.success }}>{f.income.toLocaleString()} с</td>
                          <td style={{ padding: 8, fontSize: 13, fontWeight: 700, color: C.danger }}>{f.expense.toLocaleString()} с</td>
                          <td style={{ padding: 8, fontSize: 13, fontWeight: 800, color: f.profit >= 0 ? C.success : C.danger }}>{f.profit.toLocaleString()} с</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>

                {/* 5. Other expenses */}
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>🧾 Прочие расходы</div>
                    <Btn small color={C.warning} onClick={() => setExpModal(true)}>+ Добавить</Btn>
                  </div>
                  {otherExpenses.length === 0 ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 12 }}>Нет прочих расходов</div>
                    : otherExpenses.map(f => (
                      <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{f.category}</div>
                          {f.notes && <div style={{ fontSize: 11, color: C.muted }}>{f.notes}</div>}
                          <div style={{ fontSize: 11, color: C.muted }}>{f.date}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontWeight: 800, color: C.danger }}>-{Number(f.amount).toLocaleString()} с</span>
                          <button onClick={() => delExpense(f.id)} style={{ background: C.danger + "15", border: "none", borderRadius: 6, padding: "4px 7px", cursor: "pointer", fontSize: 12, color: C.danger }}>×</button>
                        </div>
                      </div>
                    ))}
                  {otherExpenses.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", borderTop: `2px solid ${C.border}`, marginTop: 6 }}>
                      <span style={{ fontWeight: 800 }}>Итого прочее</span>
                      <span style={{ fontWeight: 900, color: C.danger }}>-{totalOtherExp.toLocaleString()} с</span>
                    </div>
                  )}
                </Card>

                {/* Add expense modal */}
                {expModal && (
                  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
                    <Card style={{ width: 340, maxWidth: "90vw" }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Добавить расход</div>
                      <FInput label="НАЗВАНИЕ" value={newExp.category} onChange={v => setNewExp(p => ({...p, category: v}))} placeholder="Материалы, распечатки..." />
                      <FInput label="СУММА (сом)" value={newExp.amount} onChange={v => setNewExp(p => ({...p, amount: v}))} type="number" placeholder="1000" />
                      <FInput label="ЗАМЕТКИ" value={newExp.notes} onChange={v => setNewExp(p => ({...p, notes: v}))} placeholder="Доп. информация" />
                      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                        <Btn full outline color={C.muted} onClick={() => setExpModal(false)}>Отмена</Btn>
                        <Btn full color={C.warning} onClick={addOtherExpense}>Добавить</Btn>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {tab === "schedule" && (
        <div>
          <PageTitle emoji="📅" title="Расписание" />
          {(() => {
            const today = new Date().toLocaleDateString("ru-RU");
            const todayRu = new Date().toLocaleDateString("ru-RU", { weekday: "long" });
            const todayReports = allReports.filter(r => r.date === today);
            const reportedStudentIds = new Set(todayReports.map(r => r.studentId));
            return DAYS.map(day => {
              const items = students.filter(s => (s.days||[]).includes(day)).map(s => ({ ...s, teacher: teachers.find(t => t.id === s.teacherId) }));
              const isToday = day.toLowerCase().startsWith(todayRu.toLowerCase().slice(0, 3)) || todayRu.toLowerCase().startsWith(day.toLowerCase().slice(0, 3));
              return (
                <Card key={day} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: items.length ? C.blueDark : C.muted, marginBottom: items.length ? 10 : 0 }}>{day}</div>
                  {items.length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>Занятий нет</div>
                    : items.map((s,i) => {
                      const missed = isToday && !reportedStudentIds.has(s.id);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < items.length-1 ? `1px solid ${C.border}` : "none", background: missed ? C.danger + "08" : "transparent", borderRadius: 6 }}>
                          <div style={{ background: missed ? C.danger : FORMAT_COLORS[s.format] || C.blue, color: "#fff", fontWeight: 800, fontSize: 12, padding: "5px 10px", borderRadius: 8 }}>{s.time}</div>
                          <Badge text={FORMAT_LABELS[s.format] || s.format} color={missed ? C.danger : FORMAT_COLORS[s.format] || C.blue} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{s.teacher?.name} · 📍 {s.address}</div>
                          </div>
                          {missed && <Badge text="❌ Нет отчёта" color={C.danger} />}
                        </div>
                      );
                    })}
                </Card>
              );
            });
          })()}
        </div>
      )}

      {tab === "reviews" && (
        <div>
          <PageTitle emoji="⭐" title="Отзывы" />
          {allReviews.length === 0 ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Отзывов пока нет</div></Card>
            : allReviews.map(rv => (
              <Card key={rv.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Av l={rv.parentName[0]} color="#8B6BB5" size={36} />
                    <div>
                      <div style={{ fontWeight: 800 }}>{rv.parentName}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>👦 {rv.studentName} · {rv.date}</div>
                    </div>
                  </div>
                  <Stars rating={rv.rating} />
                </div>
                {rv.text && <div style={{ background: C.blueLight, borderRadius: 10, padding: 12, fontSize: 14 }}>💬 {rv.text}</div>}
              </Card>
            ))}
        </div>
      )}

      {tab === "library" && (
        <div>
          <PageTitle emoji="📚" title="Книги и материалы" />
          {books.map(b => (
            <Card key={b.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>{b.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{b.subject}</div>
              </div>
              {b.url ? <Btn small color={C.blue} onClick={() => window.open(b.url)}>Открыть</Btn>
                : <Btn small outline color={C.muted}>Загрузить PDF</Btn>}
            </Card>
          ))}
        </div>
      )}

      {tab === "settings" && (
        <div>
          <PageTitle emoji="⚙️" title="Настройки" />
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.blueDark, marginBottom: 16 }}>💰 Цены за занятия</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14 }}>Выезд на дом (сом/урок)</span>
                <input type="number" value={prices.visit} onChange={e => setPrices(p => ({ ...p, visit: Number(e.target.value) }))} style={{ width: 100, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14 }}>Онлайн (сом/урок)</span>
                <input type="number" value={prices.online} onChange={e => setPrices(p => ({ ...p, online: Number(e.target.value) }))} style={{ width: 100, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14 }}>Группа (сом/месяц)</span>
                <input type="number" value={prices.group} onChange={e => setPrices(p => ({ ...p, group: Number(e.target.value) }))} style={{ width: 100, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14 }}>Регион (сом/урок)</span>
                <input type="number" value={prices.region} onChange={e => setPrices(p => ({ ...p, region: Number(e.target.value) }))} style={{ width: 100, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14 }} />
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <Btn full color={C.blue} onClick={async () => {
                const pricesData = { id: 1, key: "prices", value: JSON.stringify(prices) };
                await sb.upsert("ak_settings", pricesData);
                toast("✅ Цены сохранены!");
              }}>💾 Сохранить цены</Btn>
            </div>
          </Card>
        </div>
      )}

      {tab === "districts" && <DistrictsTab toast={toast} />}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="⚠️ Подтвердить удаление">
        <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Удалить «{confirmDelete?.name}»?</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn color={C.danger} onClick={() => {
              if (confirmDelete?.type === "teacher") { sb.del("ak_teachers", confirmDelete.id); setTeachers(p => p.filter(t => t.id !== confirmDelete.id)); setStudents(p => p.filter(s => s.teacherId !== confirmDelete.id)); }
              else if (confirmDelete?.type === "parent") { sb.del("ak_parents", confirmDelete.id); setParents(p => p.filter(x => x.id !== confirmDelete.id)); }
              setConfirmDelete(null); toast("🗑️ Удалено");
            }}>Удалить</Btn>
            <Btn outline color={C.muted} onClick={() => setConfirmDelete(null)}>Отмена</Btn>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

function CoordinatorApp({ user, onLogout, allReports, allTrials, setAllTrials, students, setStudents, teachers, setTeachers, parents, setParents, groups, allReviews, books, leads, setLeads, allSmmReports, setAllSmmReports }) {
  const [tab, setTab] = useState("home");
  const [notif, setNotif] = useState(null);
  const [modal, setModal] = useState(null);
  const [coordNewStaff, setCoordNewStaff] = useState({ name: "", subject: "", phone: "", rate: "600", login: "", password: "", format: "выезд", duties: "", staffRole: "teacher", position: "" });
  const [coordReportSubTab, setCoordReportSubTab] = useState("lessons");
  const [coordReport, setCoordReport] = useState({ trialsScheduled: "", studentsAdded: "", parentsCalled: "", leadsWithoutTeacher: "", districtShortage: "", notes: "" });
  const [coordReportSent, setCoordReportSent] = useState(false);
  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3000); };

  const nav = [
    { key: "home",      icon: "🏠", label: "Главная"    },
    { key: "leads",     icon: "🎯", label: "Лиды"       },
    { key: "students",  icon: "👦", label: "Ученики"    },
    { key: "groups",    icon: "🏫", label: "Группы"     },
    { key: "teachers",  icon: "👩‍🏫", label: "Сотрудники" },
    { key: "parents",   icon: "👨‍👩‍👧", label: "Родители"  },
    { key: "reports",   icon: "📋", label: "Отчёты"     },
    { key: "schedule",  icon: "📅", label: "Расписание" },
    { key: "reviews",   icon: "⭐", label: "Отзывы"     },
    { key: "library",   icon: "📚", label: "Книги"      },
  ];

  return (
    <Layout user={user} tab={tab} setTab={setTab} navItems={nav} onLogout={onLogout}>
      {notif && <div style={{ position: "fixed", top: 18, right: 18, background: C.coord, color: "#fff", padding: "12px 22px", borderRadius: 12, fontWeight: 700, zIndex: 999 }}>{notif}</div>}

      {tab === "home" && (
        <div>
          <div style={{ background: `linear-gradient(135deg, ${C.coord} 0%, #6B4FA0 100%)`, borderRadius: 20, padding: "24px", marginBottom: 22, display: "flex", alignItems: "center", gap: 20 }}>
            <Av l="П" color="rgba(255,255,255,0.2)" size={52} />
            <div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Панель координатора</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>Привет, {user.name}! 🗂️</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
            <StatCard icon="🆕" val={leads.filter(l=>l.status==="new").length}    label="Новых лидов"   color={C.blue}    />
            <StatCard icon="🧪" val={leads.filter(l=>l.status==="trial").length}  label="На пробном"    color={C.warning} />
            <StatCard icon="✅" val={leads.filter(l=>l.status==="accepted").length} label="Взяли"       color={C.success} />
            <StatCard icon="👦" val={students.length}                             label="Всего учеников" color={C.coord}   />
          </div>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>🎯 Активные лиды</div>
            {leads.filter(l => l.status === "new" || l.status === "trial").length === 0
              ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>Нет активных лидов</div>
              : leads.filter(l => l.status === "new" || l.status === "trial").map(l => (
                <div key={l.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{l.childName} · {l.grade}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>📞 {l.parentPhone} · 📍 {l.district}</div>
                    </div>
                    <Badge text={LEAD_STATUSES[l.status].label} color={LEAD_STATUSES[l.status].color} />
                  </div>
                </div>
              ))}
          </Card>
        </div>
      )}

      {tab === "leads" && (
        <LeadsTab leads={leads} setLeads={setLeads} teachers={teachers} toast={toast} allTrials={allTrials} />
      )}

      {tab === "trials" && (
        <div>
          <PageTitle emoji="🧪" title="Пробные уроки" />
          {(() => {
            const trialLeads = leads.filter(l => l.status === "trial");
            const trialReports = allTrials || [];
            const reportedLeadNames = new Set(trialReports.map(t => t.childName));
            return (
              <div>
                {trialLeads.length > 0 && (
                  <Card style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Лиды на пробном</div>
                    {trialLeads.map(l => {
                      const hasReport = reportedLeadNames.has(l.childName);
                      return (
                        <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}`, background: hasReport ? "transparent" : C.danger + "10", borderRadius: 8, paddingLeft: 8, paddingRight: 8, marginBottom: 4 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{l.childName}</div>
                            <div style={{ fontSize: 12, color: C.muted }}>👩‍🏫 {l.teacherName} · 📅 {l.trialDate}</div>
                            <div style={{ fontSize: 12, color: C.muted }}>📞 {l.parentPhone} · 📍 {l.district}</div>
                          </div>
                          {hasReport
                            ? <Badge text="Отчёт есть" color={C.success} />
                            : <Badge text="Нет отчёта!" color={C.danger} />}
                        </div>
                      );
                    })}
                  </Card>
                )}
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Отчёты педагогов о пробных</div>
                {trialReports.length === 0
                  ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 20 }}>Отчётов о пробных пока нет</div></Card>
                  : trialReports.map(t => <ExpandableTrialCard key={t.id} t={t} teachers={teachers} />)}
              </div>
            );
          })()}
        </div>
      )}

      {tab === "students" && (
        <StudentsTab students={students} teachers={teachers} groups={groups} setStudents={setStudents} canDelete={true} canAdd={true} toast={toast} />
      )}

      {tab === "groups" && (
        <div>
          <PageTitle emoji="🏫" title="Группы (просмотр)" />
          {groups.map(g => {
            const teacher = teachers.find(t => t.id === g.teacherId);
            const groupStudents = students.filter(s => s.groupId === g.id);
            return (
              <Card key={g.id} style={{ marginBottom: 16, borderLeft: `5px solid ${g.color}` }}>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{g.name}</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>👩‍🏫 {teacher?.name} · 🕐 {g.time} · 📍 {g.address}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Badge text={`${groupStudents.length}/${g.maxStudents} детей`} color={g.color} />
                  {g.days.map(d => <span key={d} style={{ background: g.color + "20", color: g.color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{d}</span>)}
                </div>
                <div style={{ marginTop: 12 }}>
                  {groupStudents.map(s => <div key={s.id} style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}>👦 {s.name}</div>)}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "teachers" && (
        <div>
          <PageTitle emoji="👥" title="Сотрудники" action={<Btn onClick={() => setModal("addTeacher")} color={C.blueDark}>+ Добавить</Btn>} />

          {teachers.filter(t => t.role === "coordinator").length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.coord, marginBottom: 10 }}>🗂️ Координаторы</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {teachers.filter(t => t.role === "coordinator").map(t => (
                  <Card key={t.id} style={{ borderTop: `4px solid ${C.coord}` }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                      <Av l={t.avatar} color={C.coord} size={40} photoUrl={t.photoUrl} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>{t.name}</div>
                        <Badge text="🗂️ Координатор" color={C.coord} />
                        {t.phone && <div style={{ fontSize: 12, color: C.muted }}>📞 {t.phone}</div>}
                      </div>
                      <button onClick={() => { sb.del("ak_teachers", t.id); setTeachers(p => p.filter(x => x.id !== t.id)); toast("Удалено"); }} style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 13, fontWeight: 800, color: C.blueDark, marginBottom: 10 }}>👩‍🏫 Педагоги</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {teachers.filter(t => t.role === "teacher").map(t => (
              <Card key={t.id} style={{ borderTop: `4px solid ${t.color}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <Av l={t.avatar} color={t.color} size={46} photoUrl={t.photoUrl} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{t.subject}</div>
                    {t.format && <Badge text={FORMAT_LABELS[t.format] || t.format} color={FORMAT_COLORS[t.format] || C.blue} />}
                    {t.phone && <div style={{ fontSize: 12, color: C.muted }}>📞 {t.phone}</div>}
                  </div>
                  <button onClick={() => { sb.del("ak_teachers", t.id); setTeachers(p => p.filter(x => x.id !== t.id)); toast("Удалено"); }} style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                </div>
                <CollapsibleDuties duties={t.duties} />
              </Card>
            ))}
          </div>

          {teachers.filter(t => !["teacher","coordinator"].includes(t.role)).length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.muted, marginBottom: 10 }}>👔 Другие сотрудники</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {teachers.filter(t => !["teacher","coordinator"].includes(t.role)).map(t => (
                  <Card key={t.id} style={{ borderTop: `4px solid ${t.color}` }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Av l={t.avatar} color={t.color} size={40} photoUrl={t.photoUrl} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{t.position || t.subject}</div>
                        {t.phone && <div style={{ fontSize: 12, color: C.muted }}>📞 {t.phone}</div>}
                      </div>
                      <button onClick={() => { sb.del("ak_teachers", t.id); setTeachers(p => p.filter(x => x.id !== t.id)); toast("Удалено"); }} style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Modal open={modal === "addTeacher"} onClose={() => setModal(null)} title="👥 Новый сотрудник">
            <div style={{ marginBottom: 16 }}>
              <Label>РОЛЬ <span style={{ color: C.danger }}>*</span></Label>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ val: "teacher", icon: "👩‍🏫", label: "Педагог", color: C.blueDark }, { val: "other", icon: "➕", label: "Другое", color: C.muted }].map(opt => (
                  <button key={opt.val} onClick={() => setCoordNewStaff(p => ({...p, staffRole: opt.val}))} style={{ flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14, background: coordNewStaff.staffRole === opt.val ? opt.color : C.blueLight, color: coordNewStaff.staffRole === opt.val ? "#fff" : C.muted, border: `2px solid ${coordNewStaff.staffRole === opt.val ? opt.color : C.border}` }}>{opt.icon} {opt.label}</button>
                ))}
              </div>
            </div>
            <FInput label="ИМЯ" value={coordNewStaff.name} onChange={v => setCoordNewStaff(p => ({...p, name: v}))} required />
            <FInput label="ТЕЛЕФОН" value={coordNewStaff.phone} onChange={v => setCoordNewStaff(p => ({...p, phone: v}))} placeholder="+996 700 ..." />
            {coordNewStaff.staffRole === "teacher" && (
              <>
                <FInput label="ПРЕДМЕТ" value={coordNewStaff.subject} onChange={v => setCoordNewStaff(p => ({...p, subject: v}))} />
                <FInput label="СТАВКА (сом/урок)" value={coordNewStaff.rate} onChange={v => setCoordNewStaff(p => ({...p, rate: v}))} type="number" />
                <FSelect label="ФОРМАТ" value={coordNewStaff.format} onChange={v => setCoordNewStaff(p => ({...p, format: v}))} options={FORMATS.map(f => ({ value: f, label: FORMAT_LABELS[f] }))} />
              </>
            )}
            {coordNewStaff.staffRole === "other" && (
              <FInput label="ДОЛЖНОСТЬ" value={coordNewStaff.position} onChange={v => setCoordNewStaff(p => ({...p, position: v}))} placeholder="СММ, Психолог, Администратор..." required />
            )}
            <FTextarea label="ОБЯЗАННОСТИ" value={coordNewStaff.duties} onChange={v => setCoordNewStaff(p => ({...p, duties: v}))} rows={2} />
            <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.blueDark, marginBottom: 10 }}>🔐 Данные для входа</div>
              <FInput label="ЛОГИН" value={coordNewStaff.login} onChange={v => setCoordNewStaff(p => ({...p, login: v}))} required />
              <FInput label="ПАРОЛЬ" value={coordNewStaff.password} onChange={v => setCoordNewStaff(p => ({...p, password: v}))} required />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn full color={C.blueDark} disabled={!coordNewStaff.name || !coordNewStaff.login || !coordNewStaff.password} onClick={() => {
                const color = TEACHER_COLORS[teachers.length % TEACHER_COLORS.length];
                const t = { id: Date.now(), name: coordNewStaff.name, subject: coordNewStaff.staffRole === "other" ? (coordNewStaff.position || "Другое") : coordNewStaff.subject, avatar: coordNewStaff.name[0].toUpperCase(), color, role: coordNewStaff.staffRole === "teacher" ? "teacher" : "other", login: coordNewStaff.login.toLowerCase().trim(), password: coordNewStaff.password, phone: coordNewStaff.phone, rate: Number(coordNewStaff.rate) || 0, format: coordNewStaff.format, duties: coordNewStaff.duties, position: coordNewStaff.position, staffRole: coordNewStaff.staffRole };
                // Only send valid fields to Supabase (no staffRole)
                const dbTeacher = { id: t.id, name: t.name, login: t.login, password: t.password, role: t.role, subject: t.subject || "", phone: t.phone || "", rate: t.rate || 600, format: t.format || "выезд", avatar: t.avatar, color: t.color, duties: t.duties || "", position: t.position || "" };
                setTeachers(p => [...p, t]);
                sb.add("ak_teachers", dbTeacher);
                setCoordNewStaff({ name: "", subject: "", phone: "", rate: "600", login: "", password: "", format: "выезд", duties: "", staffRole: "teacher", position: "" });
                setModal(null);
                toast(`✅ ${coordNewStaff.name} добавлен!`);
              }}>Добавить</Btn>
              <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
            </div>
          </Modal>
        </div>
      )}

      {tab === "parents" && (
        <div>
          <PageTitle emoji="👨‍👩‍👧" title="Родители" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {parents.map(p => {
              const student = students.find(s => s.id === p.studentId);
              return (
                <Card key={p.id} style={{ borderTop: "4px solid #8B6BB5" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <Av l={p.name[0]} color="#8B6BB5" size={36} />
                    <div>
                      <div style={{ fontWeight: 800 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>📞 {p.phone}</div>
                    </div>
                  </div>
                  {student && <div style={{ background: C.blueLight, borderRadius: 10, padding: "8px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{student.name}</div>
                    <Badge text={FORMAT_LABELS[student.format] || student.format} color={FORMAT_COLORS[student.format] || C.blue} />
                  </div>}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div>
          <PageTitle emoji="📋" title="Отчёты" />
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[
              { key: "lessons", icon: "📝", label: "Уроки" },
              { key: "trials", icon: "🧪", label: "Пробные" },
              { key: "myreport", icon: "🗂️", label: "Мой отчёт" },
            ].map(st => (
              <button key={st.key} onClick={() => setCoordReportSubTab(st.key)} style={{
                padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", border: "none",
                background: coordReportSubTab === st.key ? C.coord : C.blueLight,
                color: coordReportSubTab === st.key ? "#fff" : C.muted,
              }}>{st.icon} {st.label}</button>
            ))}
          </div>

          {coordReportSubTab === "lessons" && (
            <div>
              {allReports.length === 0
                ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Отчётов пока нет</div></Card>
                : allReports.map(r => <ExpandableReportCard key={r.id} r={r} teachers={teachers} />)}
            </div>
          )}

          {coordReportSubTab === "trials" && (
            <div>
              {allTrials.length === 0
                ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Пробных пока нет</div></Card>
                : allTrials.map(t => <ExpandableTrialCard key={t.id} t={t} teachers={teachers} />)}
            </div>
          )}

          {coordReportSubTab === "myreport" && (
            coordReportSent ? (
              <Card style={{ textAlign: "center", padding: 48 }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
                <div style={{ fontWeight: 900, fontSize: 20, color: C.success }}>Отчёт отправлен!</div>
                <div style={{ marginTop: 16 }}><Btn onClick={() => setCoordReportSent(false)} color={C.coord}>Новый отчёт</Btn></div>
              </Card>
            ) : (
              <Card style={{ maxWidth: 540 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: C.coord }}>📊 Недельный отчёт</div>
                <FInput label="🧪 ПРОБНЫХ НАЗНАЧЕНО" value={coordReport.trialsScheduled} onChange={v => setCoordReport(p => ({...p, trialsScheduled: v}))} type="number" placeholder={String(leads.filter(l => l.status === "trial").length)} />
                <FInput label="👦 УЧЕНИКОВ ДОБАВЛЕНО" value={coordReport.studentsAdded} onChange={v => setCoordReport(p => ({...p, studentsAdded: v}))} type="number" placeholder="0" />
                <FInput label="📞 РОДИТЕЛЕЙ ОБЗВОНИЛА" value={coordReport.parentsCalled} onChange={v => setCoordReport(p => ({...p, parentsCalled: v}))} type="number" placeholder="0" />
                <FInput label="🚫 ЛИДОВ БЕЗ ПЕДАГОГА" value={coordReport.leadsWithoutTeacher} onChange={v => setCoordReport(p => ({...p, leadsWithoutTeacher: v}))} type="number" placeholder={String(leads.filter(l => l.status === "new").length)} />
                <FSelect label="📍 РАЙОН — НЕ ХВАТАЕТ ПЕДАГОГА" value={coordReport.districtShortage} onChange={v => setCoordReport(p => ({...p, districtShortage: v}))} options={[...DISTRICTS, "Везде хватает"]} />
                <FTextarea label="💬 ЗАМЕТКИ / ПРОБЛЕМЫ" value={coordReport.notes} onChange={v => setCoordReport(p => ({...p, notes: v}))} placeholder="Что важного за неделю?" rows={4} />
                <Btn full onClick={async () => {
                  const today = new Date().toLocaleDateString("ru-RU");
                  const rec = { id: Date.now(), type: "coordinator", authorName: user.name, date: today, ...coordReport };
                  setAllSmmReports(p => [rec, ...p]);
                  sb.add("ak_smm_reports", rec);
                  await sendTelegram(`📊 <b>Отчёт координатора — ${user.name}</b>\n\n🧪 Пробных: ${coordReport.trialsScheduled}\n👦 Учеников: ${coordReport.studentsAdded}\n📞 Обзвонила: ${coordReport.parentsCalled}\n💬 ${coordReport.notes || "—"}`);
                  setCoordReportSent(true);
                  toast("📊 Отчёт отправлен Айданек!");
                }} color={C.coord}>📤 Отправить отчёт Айданек</Btn>
              </Card>
            )
          )}
        </div>
      )}

      {tab === "schedule" && (
        <div>
          <PageTitle emoji="📅" title="Расписание" />
          {(() => {
            const today = new Date().toLocaleDateString("ru-RU");
            const todayRu = new Date().toLocaleDateString("ru-RU", { weekday: "long" });
            const todayReports = allReports.filter(r => r.date === today);
            const reportedStudentIds = new Set(todayReports.map(r => r.studentId));
            return DAYS.map(day => {
              const items = students.filter(s => (s.days||[]).includes(day)).map(s => ({ ...s, teacher: teachers.find(t => t.id === s.teacherId) }));
              const isToday = day.toLowerCase().startsWith(todayRu.toLowerCase().slice(0, 3)) || todayRu.toLowerCase().startsWith(day.toLowerCase().slice(0, 3));
              return (
                <Card key={day} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: items.length ? C.blueDark : C.muted, marginBottom: items.length ? 10 : 0 }}>{day}</div>
                  {items.length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>Занятий нет</div>
                    : items.map((s,i) => {
                      const missed = isToday && !reportedStudentIds.has(s.id);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < items.length-1 ? `1px solid ${C.border}` : "none", background: missed ? C.danger + "08" : "transparent", borderRadius: 6 }}>
                          <div style={{ background: missed ? C.danger : FORMAT_COLORS[s.format] || C.blue, color: "#fff", fontWeight: 800, fontSize: 12, padding: "5px 10px", borderRadius: 8 }}>{s.time}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{s.teacher?.name}</div>
                          </div>
                          {missed && <Badge text="❌ Нет отчёта" color={C.danger} />}
                          {isToday && !missed && reportedStudentIds.has(s.id) && <Badge text="✅ Отчёт сдан" color={C.success} />}
                        </div>
                      );
                    })}
                </Card>
              );
            });
          })()}
        </div>
      )}

      {tab === "reviews" && (
        <div>
          <PageTitle emoji="⭐" title="Отзывы" />
          {allReviews.length === 0 ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Отзывов пока нет</div></Card>
            : allReviews.map(rv => (
              <Card key={rv.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontWeight: 800 }}>{rv.parentName}</div>
                  <Stars rating={rv.rating} />
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>👦 {rv.studentName} · {rv.date}</div>
                {rv.text && <div style={{ background: C.blueLight, borderRadius: 10, padding: 12, marginTop: 8, fontSize: 14 }}>💬 {rv.text}</div>}
              </Card>
            ))}
        </div>
      )}

      {tab === "library" && (
        <div>
          <PageTitle emoji="📚" title="Книги" />
          {books.map(b => (
            <Card key={b.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>{b.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{b.subject}</div>
              </div>
              {b.url ? <Btn small color={C.blue} onClick={() => window.open(b.url)}>Открыть</Btn>
                : <span style={{ fontSize: 12, color: C.muted }}>Скоро</span>}
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

function OtherStaffApp({ user, onLogout, books }) {
  const [tab, setTab] = useState("home");
  const nav = [
    { key: "home", icon: "🏠", label: "Главная" },
    { key: "library", icon: "📚", label: "Библиотека" },
  ];
  return (
    <Layout user={user} onLogout={onLogout} tab={tab} setTab={setTab} navItems={nav}>
      {tab === "home" && (
        <div>
          <Card style={{ marginBottom: 16, background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueLight} 100%)`, color: "#fff", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Av l={user.avatar || user.name[0]} color={user.color || C.blue} size={56} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>Добро пожаловать!</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>{user.name}</div>
                {user.position && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{user.position}</div>}
              </div>
            </div>
          </Card>
          {user.duties && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.blueDark, marginBottom: 12 }}>📋 Обязанности</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{user.duties}</div>
            </Card>
          )}
          {!user.duties && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Добро пожаловать в AK BILIM!</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Обратитесь к администратору для получения доступа к функциям</div>
            </Card>
          )}
        </div>
      )}
      {tab === "library" && (
        <div>
          <PageTitle emoji="📚" title="Библиотека" />
          {(books || []).map(b => (
            <Card key={b.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>{b.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{b.subject}</div>
              </div>
              {b.url ? <Btn small color={C.blue} onClick={() => window.open(b.url)}>Открыть</Btn>
                : <span style={{ fontSize: 12, color: C.muted }}>Скоро</span>}
            </Card>
          ))}
          {(!books || books.length === 0) && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              <div style={{ color: C.muted }}>Книги пока не добавлены</div>
            </Card>
          )}
        </div>
      )}
    </Layout>
  );
}

function TeacherApp({ user, onLogout, onReport, onTrial, students, allReviews, allReports, setAllReports, allTrials, parents }) {
  const [tab, setTab] = useState("home");
  const [myReports, setMyReports] = useState([]);
  const [notif, setNotif] = useState(null);
  const [teacherReportSubTab, setTeacherReportSubTab] = useState("lesson");
  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3000); };
  const myStudents = students.filter(s => s.teacherId === user.id);
  const [rf, setRf] = useState({ studentId: "", topic: "", topicCustom: "", notes: "", homework: "", rating: 5, paymentReceived: false, paymentAmount: 1400, files: [] });
  const [rfErr, setRfErr] = useState("");
  const [tf, setTf] = useState({ childName: "", childAge: "", childGrade: "", childLevel: "Начальный", parentName: "", parentPhone: "", parentGoal: "", teacherNotes: "", testScore: 3, recommend: false, files: [], bookSold: false, bookTitle: "", bookAmount: 0 });
  const [tfErr, setTfErr] = useState("");

  // Загружаем отчёты педагога из Supabase при входе
  useEffect(() => {
    sb.all("ak_reports").then(r => { if (r && setAllReports) setAllReports(r); });
    const interval = setInterval(() => {
      sb.all("ak_reports").then(r => { if (r && setAllReports) setAllReports(r); });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const submitReport = async () => {
    if (!rf.studentId) { setRfErr("Выберите ученика"); return; }
    if (!rf.topic) { setRfErr("Укажите тему"); return; }
    if (rf.files.length === 0) { setRfErr("📸 Прикрепите фото!"); return; }
    setRfErr("");
    const s = myStudents.find(s => s.id === Number(rf.studentId));
    const r = { id: Date.now(), teacherId: user.id, teacherName: user.name, teacherAvatar: user.avatar, teacherColor: user.color, studentId: Number(rf.studentId), studentName: s?.name, topic: rf.topic === "Другое" ? rf.topicCustom || "Другое" : rf.topic, notes: rf.notes, homework: rf.homework, rating: rf.rating, date: new Date().toLocaleDateString("ru-RU"), paymentReceived: rf.paymentReceived, paymentAmount: rf.paymentReceived ? Number(rf.paymentAmount) : 0, files: rf.files };
    setMyReports(p => [r, ...p]);
    onReport(r); sb.add("ak_reports", r);
    await sendTelegram(`📋 <b>Отчёт об уроке!</b>\n\n👩‍🏫 ${user.name}\n👦 ${s?.name}\n📚 ${r.topic}\n⭐ ${r.rating}/5\n📸 ${r.files.length} фото${r.paymentReceived ? `\n💰 ${r.paymentAmount} сом` : ""}`);
    setRf({ studentId: "", topic: "", topicCustom: "", notes: "", homework: "", rating: 5, paymentReceived: false, paymentAmount: 1400, files: [] });
    toast("✅ Отчёт отправлен!"); setTab("home");
  };

  const submitTrial = async () => {
    if (!tf.childName || !tf.parentName) { setTfErr("Заполните имена"); return; }
    if (tf.files.length === 0) { setTfErr("📸 Прикрепите фото!"); return; }
    setTfErr("");
    const today = new Date().toLocaleDateString("ru-RU");
    const monthKey = getMonthKey(new Date());
    const trial = { ...tf, id: Date.now(), teacherId: user.id, teacherName: user.name, date: today };
    onTrial(trial); sb.add("ak_trials", trial);
    if (tf.bookSold && tf.bookTitle && tf.bookAmount > 0) {
      const sale = { id: Date.now() + 1, trial_id: trial.id, book_title: tf.bookTitle, amount: Number(tf.bookAmount), date: today, month: monthKey };
      sb.add("ak_book_sales", sale);
    }
    await sendTelegram(`🧪 <b>Пробный урок!</b>\n\n👩‍🏫 ${user.name}\n👶 ${tf.childName}, ${tf.childAge} лет\n👨‍👩‍👧 ${tf.parentName}\n📞 ${tf.parentPhone || "—"}\n${tf.recommend ? "✅ Рекомендует взять!" : "⏳ На рассмотрении"}${tf.bookSold ? `\n📚 Книга: ${tf.bookTitle} — ${tf.bookAmount} с` : ""}`);
    setTf({ childName: "", childAge: "", childGrade: "", childLevel: "Начальный", parentName: "", parentPhone: "", parentGoal: "", teacherNotes: "", testScore: 3, recommend: false, files: [], bookSold: false, bookTitle: "", bookAmount: 0 });
    toast("🧪 Данные пробного отправлены!"); setTab("home");
  };

  const [attendance, setAttendance] = useState({});
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({ name: "", grade: "", parentPhone: "", days: [], time: "" });

  const nav = [
    { key: "home",       icon: "🏠", label: "Главная"      },
    { key: "myreports",  icon: "📋", label: "Отчёты"       },
    { key: "attendance", icon: "✅", label: "Посещаемость"  },
    { key: "students",   icon: "👦", label: "Ученики"       },
    { key: "schedule",   icon: "📅", label: "Расписание"    },
    { key: "library",    icon: "📚", label: "Книги"         },
    { key: "myreviews",  icon: "⭐", label: "Отзывы"        },
  ];

  return (
    <Layout user={user} tab={tab} setTab={setTab} navItems={nav} onLogout={onLogout}>
      {notif && <div style={{ position: "fixed", top: 18, right: 18, background: user.color, color: "#fff", padding: "12px 22px", borderRadius: 12, fontWeight: 700, zIndex: 999 }}>{notif}</div>}

      {tab === "home" && (
        <div>
          <div style={{ background: `linear-gradient(135deg, ${user.color} 0%, ${user.color}cc 100%)`, borderRadius: 20, padding: "20px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
            <Av l={user.avatar} color="rgba(255,255,255,0.2)" size={52} photoUrl={user.photoUrl} />
            <div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Кабинет учителя</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>{user.name}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{user.subject} {user.format ? `· ${FORMAT_LABELS[user.format]}` : ""}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div onClick={() => setTab("report")} style={{ background: user.color, borderRadius: 16, padding: 18, cursor: "pointer", boxShadow: `0 4px 16px ${user.color}44` }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>📝</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Отчёт об уроке</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>С обязательным фото</div>
            </div>
            <div onClick={() => setTab("trial")} style={{ background: C.blue, borderRadius: 16, padding: 18, cursor: "pointer" }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>🧪</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Пробный урок</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Анкета + фото</div>
            </div>
          </div>
          {user.duties && (
            <Card style={{ marginTop: 16, borderLeft: `4px solid ${user.color}` }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: user.color, marginBottom: 8 }}>📋 Мои обязанности</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{user.duties}</div>
            </Card>
          )}
          <Card style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>👦 Мои ученики ({myStudents.length})</div>
            {myStudents.map(s => (
              <div key={s.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name} · {s.grade}</div>
                <Badge text={FORMAT_LABELS[s.format] || s.format} color={FORMAT_COLORS[s.format] || C.blue} />
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === "report" && (
        <Card style={{ maxWidth: 520 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>📝 Отчёт об уроке</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Фото обязательны ☁️</div>
          <FSelect label="УЧЕНИК" value={rf.studentId} onChange={v => setRf(p => ({...p, studentId: v}))} options={myStudents.map(s => ({ value: s.id, label: s.name }))} required />
          <FSelect label="ТЕМА" value={rf.topic} onChange={v => setRf(p => ({...p, topic: v}))} options={TOPICS} required />
          {rf.topic === "Другое" && <FInput label="СВОЯ ТЕМА" value={rf.topicCustom} onChange={v => setRf(p => ({...p, topicCustom: v}))} />}
          <FTextarea label="КАК ПРОШЁЛ УРОК?" value={rf.notes} onChange={v => setRf(p => ({...p, notes: v}))} placeholder="Что получилось? Что было сложно?" />
          <FTextarea label="ДОМАШНЕЕ ЗАДАНИЕ" value={rf.homework} onChange={v => setRf(p => ({...p, homework: v}))} placeholder="Что задали?" rows={2} />
          <div style={{ marginBottom: 14 }}><Label>ОЦЕНКА</Label><Stars rating={rf.rating} onChange={v => setRf(p => ({...p, rating: v}))} /></div>
          <FileUpload label="ФОТО С УРОКА" files={rf.files} onChange={f => setRf(p => ({...p, files: f}))} required />
          <div style={{ marginBottom: 16, background: rf.paymentReceived ? C.success + "10" : C.blueLight, borderRadius: 10, padding: 12, border: `1.5px solid ${rf.paymentReceived ? C.success : C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: rf.paymentReceived ? 10 : 0 }}>
              <input type="checkbox" id="pay" checked={rf.paymentReceived} onChange={e => {
                const s = myStudents.find(s => s.id === Number(rf.studentId));
                const autoAmount = s?.format === "онлайн" && s?.lessonPrice ? s.lessonPrice : 1400;
                setRf(p => ({...p, paymentReceived: e.target.checked, paymentAmount: autoAmount}));
              }} style={{ width: 17, height: 17 }} />
              <label htmlFor="pay" style={{ fontWeight: 700, fontSize: 14, cursor: "pointer" }}>💰 Получила оплату</label>
            </div>
            {rf.paymentReceived && (() => {
              const s = myStudents.find(st => st.id === Number(rf.studentId));
              const isOnline = s?.format === "онлайн";
              return (
                <div>
                  <input type="number" value={rf.paymentAmount} onChange={e => setRf(p => ({...p, paymentAmount: e.target.value}))}
                    style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box", marginBottom: 8 }} />
                  {isOnline && (
                    <div style={{ background: C.success + "15", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 700 }}>
                      <div style={{ color: C.muted }}>💸 Родитель заплатил: <b style={{ color: C.text }}>{Number(rf.paymentAmount).toLocaleString()} сом</b></div>
                      <div style={{ color: C.success, marginTop: 4 }}>👩‍🏫 Твоя доля (50%): <b>{Math.round(Number(rf.paymentAmount) * 0.5).toLocaleString()} сом</b></div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          {rfErr && <div style={{ color: C.danger, fontWeight: 600, fontSize: 13, marginBottom: 12 }}>⚠️ {rfErr}</div>}
          <Btn full onClick={submitReport} color={user.color}>📤 Отправить отчёт</Btn>
          <div style={{ marginTop: 8 }}><Btn full outline color={C.muted} onClick={() => setTab("home")}>Отмена</Btn></div>
        </Card>
      )}

      {tab === "trial" && (
        <Card style={{ maxWidth: 520 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>🧪 Пробный урок</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Заполни анкету после пробного</div>

          <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.blueDark, marginBottom: 10 }}>👶 Данные ребёнка</div>
            <FInput label="ИМЯ РЕБЁНКА" value={tf.childName} onChange={v => setTf(p => ({...p, childName: v}))} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FInput label="ВОЗРАСТ" value={tf.childAge} onChange={v => setTf(p => ({...p, childAge: v}))} placeholder="7" />
              <FInput label="КЛАСС" value={tf.childGrade} onChange={v => setTf(p => ({...p, childGrade: v}))} placeholder="1 класс" />
            </div>
            <div style={{ marginBottom: 10 }}>
              <Label>УРОВЕНЬ ЗНАНИЙ</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Нулевой","Начальный","Средний","Выше среднего","Высокий"].map(lvl => (
                  <button key={lvl} onClick={() => setTf(p => ({...p, childLevel: lvl}))} style={{ padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${tf.childLevel === lvl ? C.blue : C.border}`, background: tf.childLevel === lvl ? C.blue : "#fff", color: tf.childLevel === lvl ? "#fff" : C.muted }}>{lvl}</button>
                ))}
              </div>
            </div>
            <Label>ОЦЕНКА РЕБЁНКА ПО ИТОГУ</Label>
            <Stars rating={tf.childRating || 0} onChange={v => setTf(p => ({...p, childRating: v}))} />
          </div>

          <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.blueDark, marginBottom: 10 }}>👨‍👩‍👧 Данные родителя</div>
            <FInput label="ИМЯ РОДИТЕЛЯ" value={tf.parentName} onChange={v => setTf(p => ({...p, parentName: v}))} required />
            <FInput label="ТЕЛЕФОН" value={tf.parentPhone} onChange={v => setTf(p => ({...p, parentPhone: v}))} placeholder="+996 700 ..." />
            <FTextarea label="ЦЕЛЬ ОБУЧЕНИЯ" value={tf.parentGoal} onChange={v => setTf(p => ({...p, parentGoal: v}))} placeholder="Чего хотят от занятий?" rows={2} />
          </div>

          <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.blueDark, marginBottom: 10 }}>📝 Мои заметки</div>
            <FTextarea label="КАК ПРОШЁЛ УРОК?" value={tf.teacherNotes} onChange={v => setTf(p => ({...p, teacherNotes: v}))} placeholder="Что заметила? Как вёл себя ребёнок?" rows={3} />
            <div style={{ marginBottom: 10 }}>
              <Label>ПРЕДЛАГАЕМЫЙ ФОРМАТ</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {FORMATS.map(f => (
                  <button key={f} onClick={() => setTf(p => ({...p, suggestedFormat: f}))} style={{ padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${tf.suggestedFormat === f ? FORMAT_COLORS[f] : C.border}`, background: tf.suggestedFormat === f ? FORMAT_COLORS[f] : "#fff", color: tf.suggestedFormat === f ? "#fff" : C.muted }}>{FORMAT_LABELS[f]}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Label>УДОБНЫЕ ДНИ</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DAYS.map(day => {
                  const sel = (tf.suggestedDays || []).includes(day);
                  return <button key={day} onClick={() => setTf(p => ({ ...p, suggestedDays: sel ? (p.suggestedDays||[]).filter(d=>d!==day) : [...(p.suggestedDays||[]), day] }))} style={{ padding: "6px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${sel ? C.blue : C.border}`, background: sel ? C.blue : "#fff", color: sel ? "#fff" : C.muted }}>{day.slice(0,2)}</button>;
                })}
              </div>
            </div>
            <FInput label="УДОБНОЕ ВРЕМЯ" value={tf.suggestedTime || ""} onChange={v => setTf(p => ({...p, suggestedTime: v}))} placeholder="14:00" />
          </div>

          <FileUpload label="ФОТО С ПРОБНОГО" files={tf.files} onChange={f => setTf(p => ({...p, files: f}))} required />

          <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.blueDark, marginBottom: 10 }}>📋 Итог встречи</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: tf.bookSold ? 10 : 0 }}>
              <input type="checkbox" id="bookSold" checked={tf.bookSold} onChange={e => setTf(p => ({...p, bookSold: e.target.checked}))} style={{ width: 17, height: 17 }} />
              <label htmlFor="bookSold" style={{ fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Взяли книгу</label>
            </div>
            {tf.bookSold && (
              <>
                <FInput label="НАЗВАНИЕ КНИГИ" value={tf.bookTitle} onChange={v => setTf(p => ({...p, bookTitle: v}))} placeholder="Методичка: Математика" />
                <FInput label="СУММА ОПЛАТЫ (сом)" value={tf.bookAmount} onChange={v => setTf(p => ({...p, bookAmount: v}))} type="number" placeholder="500" />
              </>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <Label>РЕШЕНИЕ ПЕДАГОГА <span style={{ color: C.danger }}>*</span></Label>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setTf(p => ({...p, decision: "take", rejectReason: ""}))} style={{ flex: 1, padding: "14px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 14, border: `2px solid ${tf.decision === "take" ? C.success : C.border}`, background: tf.decision === "take" ? C.success : "#fff", color: tf.decision === "take" ? "#fff" : C.muted }}>✅ Беру ученика</button>
              <button onClick={() => setTf(p => ({...p, decision: "reject"}))} style={{ flex: 1, padding: "14px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 14, border: `2px solid ${tf.decision === "reject" ? C.danger : C.border}`, background: tf.decision === "reject" ? C.danger : "#fff", color: tf.decision === "reject" ? "#fff" : C.muted }}>❌ Не беру</button>
            </div>
          </div>

          {tf.decision === "reject" && (
            <div style={{ background: C.danger + "08", borderRadius: 12, padding: 14, marginBottom: 14, border: `2px solid ${C.danger}30` }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: C.danger, marginBottom: 10 }}>❌ Причина отказа</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Слишком слабый уровень","Не подходит по характеру","Далеко ехать","Неудобное время","Нет свободного места","Другое"].map(reason => (
                  <button key={reason} onClick={() => setTf(p => ({...p, rejectReason: reason}))} style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, textAlign: "left", border: `2px solid ${tf.rejectReason === reason ? C.danger : C.border}`, background: tf.rejectReason === reason ? C.danger + "15" : "#fff", color: tf.rejectReason === reason ? C.danger : C.text }}>
                    {tf.rejectReason === reason ? "✓ " : ""}{reason}
                  </button>
                ))}
              </div>
              {tf.rejectReason === "Другое" && (
                <div style={{ marginTop: 10 }}>
                  <FTextarea label="СВОЯ ПРИЧИНА" value={tf.rejectReasonCustom || ""} onChange={v => setTf(p => ({...p, rejectReasonCustom: v}))} placeholder="Напиши причину..." rows={2} />
                </div>
              )}
            </div>
          )}

          {tfErr && <div style={{ color: C.danger, fontWeight: 600, fontSize: 13, marginBottom: 12 }}>⚠️ {tfErr}</div>}
          <Btn full onClick={submitTrial} color={tf.decision === "reject" ? C.danger : C.blue} disabled={!tf.decision}>📤 Отправить анкету</Btn>
          <div style={{ marginTop: 8 }}><Btn full outline color={C.muted} onClick={() => setTab("home")}>Отмена</Btn></div>
        </Card>
      )}
      {tab === "myreports" && (
        <div>
          <PageTitle emoji="📋" title="Отчёты" />
          {(() => {
            const subTab = teacherReportSubTab;
            const setSubTab = setTeacherReportSubTab;
            const teacherReports = (allReports || []).filter(r => r.teacherId === user.id);
            const teacherTrials = (allTrials || []).filter(t => t.teacherId === user.id);
            return (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {[{ key: "lesson", icon: "📝", label: "За урок" }, { key: "trial", icon: "🧪", label: "Пробный" }].map(st => (
                    <button key={st.key} onClick={() => setSubTab(st.key)} style={{
                      padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit", border: "none",
                      background: subTab === st.key ? user.color : C.blueLight,
                      color: subTab === st.key ? "#fff" : C.muted,
                      boxShadow: subTab === st.key ? `0 3px 10px ${user.color}44` : "none",
                    }}>{st.icon} {st.label}</button>
                  ))}
                </div>

                {subTab === "lesson" && (
                  <div>
                    <div onClick={() => setTab("report")} style={{ background: user.color, borderRadius: 14, padding: 16, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24 }}>📝</span>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Написать отчёт об уроке</div>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>С обязательным фото</div>
                      </div>
                      <div style={{ marginLeft: "auto", color: "#fff", fontSize: 18 }}>→</div>
                    </div>
                    {teacherReports.length === 0
                      ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 32 }}>Отчётов пока нет</div></Card>
                      : teacherReports.map(r => <ExpandableReportCard key={r.id} r={r} teachers={[user]} />)}
                  </div>
                )}

                {subTab === "trial" && (
                  <div>
                    <div onClick={() => setTab("trial")} style={{ background: C.blue, borderRadius: 14, padding: 16, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24 }}>🧪</span>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Написать отчёт о пробном</div>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Анкета + фото</div>
                      </div>
                      <div style={{ marginLeft: "auto", color: "#fff", fontSize: 18 }}>→</div>
                    </div>
                    {teacherTrials.length === 0
                      ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 32 }}>Пробных уроков пока нет</div></Card>
                      : teacherTrials.map(t => <ExpandableTrialCard key={t.id} t={t} teachers={[user]} />)}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {tab === "attendance" && (
        <div>
          <PageTitle emoji="✅" title="Посещаемость" />
          {(() => {
            const todayRu = new Date().toLocaleDateString("ru-RU", { weekday: "long" });
            const todayDays = DAYS.filter(d => d.toLowerCase().startsWith(todayRu.toLowerCase().slice(0, 3)));
            const todayStudents = myStudents.filter(s => (s.days || []).some(d => todayDays.includes(d) || d.toLowerCase().startsWith(todayRu.toLowerCase().slice(0, 2))));
            const today = new Date().toLocaleDateString("ru-RU");
            if (todayStudents.length === 0) return <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Сегодня уроков нет</div></Card>;
            return (
              <Card>
                <div style={{ fontWeight: 800, fontSize: 14, color: user.color, marginBottom: 14 }}>📅 Уроки на сегодня — {today}</div>
                {todayStudents.map(s => {
                  const key = `${user.id}_${s.id}_${today}`;
                  const status = attendance[key];
                  return (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{s.grade} · 🕐 {s.time}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setAttendance(p => ({...p, [key]: "present"})); sb.add("ak_attendance", { teacherId: user.id, studentId: s.id, date: today, status: "present" }); }} style={{ padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", background: status === "present" ? C.success : C.blueLight, color: status === "present" ? "#fff" : C.muted }}>✅ Был</button>
                        <button onClick={() => { setAttendance(p => ({...p, [key]: "absent"})); sb.add("ak_attendance", { teacherId: user.id, studentId: s.id, date: today, status: "absent" }); }} style={{ padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", background: status === "absent" ? C.danger : C.blueLight, color: status === "absent" ? "#fff" : C.muted }}>❌ Не был</button>
                      </div>
                    </div>
                  );
                })}
              </Card>
            );
          })()}
        </div>
      )}
      {tab === "students" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <PageTitle emoji="👦" title="Мои ученики" />
            <button onClick={() => { setShowAddStudent(true); setNewStudent({ name: "", grade: "", parentPhone: "", days: [], time: "" }); }} style={{ background: user.color, color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Добавить</button>
          </div>

          {showAddStudent && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: user.color }}>👤 Добавить ученика</div>
              <FInput label="ИМЯ" value={newStudent.name} onChange={v => setNewStudent(p => ({...p, name: v}))} required />
              <FInput label="КЛАСС" value={newStudent.grade} onChange={v => setNewStudent(p => ({...p, grade: v}))} placeholder="5 класс" />
              <FInput label="ТЕЛЕФОН РОДИТЕЛЯ" value={newStudent.parentPhone} onChange={v => setNewStudent(p => ({...p, parentPhone: v}))} placeholder="+996 700 ..." />
              <div style={{ marginBottom: 12 }}>
                <Label>ДНИ ЗАНЯТИЙ</Label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DAYS.map(day => {
                    const sel = newStudent.days.includes(day);
                    return <button key={day} onClick={() => setNewStudent(p => ({...p, days: sel ? p.days.filter(d => d !== day) : [...p.days, day] }))} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${sel ? user.color : C.border}`, background: sel ? user.color : "#fff", color: sel ? "#fff" : C.muted }}>{day}</button>;
                  })}
                </div>
              </div>
              <FInput label="ВРЕМЯ" value={newStudent.time} onChange={v => setNewStudent(p => ({...p, time: v}))} placeholder="15:00" />
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <Btn onClick={() => setShowAddStudent(false)} outline color={C.muted}>Отмена</Btn>
                <Btn onClick={() => {
                  if (!newStudent.name) { toast("Укажите имя ученика"); return; }
                  const student = {
                    id: Date.now(),
                    name: newStudent.name,
                    grade: newStudent.grade,
                    parentPhone: newStudent.parentPhone,
                    days: newStudent.days,
                    time: newStudent.time,
                    teacherId: user.id,
                    format: user.format || "выезд",
                    address: "",
                    status: "active",
                    notes: ""
                  };
                  sb.add("ak_students", student);
                  toast(`👤 Ученик ${newStudent.name} добавлен!`);
                  setShowAddStudent(false);
                  setNewStudent({ name: "", grade: "", parentPhone: "", days: [], time: "" });
                }} color={user.color}>Сохранить</Btn>
              </div>
            </Card>
          )}

          {myStudents.map(s => {
            const parent = (parents || []).find(p => p.studentId === s.id);
            const isEditing = editingStudent === s.id;
            return (
              <Card key={s.id} style={{ marginBottom: 12 }}>
                {isEditing ? (
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: user.color }}>✏️ Редактировать расписание</div>
                    <div style={{ marginBottom: 12 }}>
                      <Label>ДНИ ЗАНЯТИЙ</Label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {DAYS.map(day => {
                          const sel = (s.days || []).includes(day);
                          return <button key={day} onClick={() => {
                            const newDays = sel ? (s.days || []).filter(d => d !== day) : [...(s.days || []), day];
                            sb.patch("ak_students", s.id, { days: newDays });
                            toast("Дни обновлены!");
                          }} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${sel ? user.color : C.border}`, background: sel ? user.color : "#fff", color: sel ? "#fff" : C.muted }}>{day}</button>;
                        })}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={s.time || ""} onChange={e => {}} type="text" placeholder="Время" style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14 }} />
                      <button onClick={() => {
                        const input = document.querySelector(`input[data-student-id="${s.id}"]`) as HTMLInputElement;
                        if (input && input.value) {
                          sb.patch("ak_students", s.id, { time: input.value });
                          toast("Время обновлено!");
                        }
                      }} style={{ background: user.color, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}>Сохранить</button>
                      <button onClick={() => setEditingStudent(null)} style={{ background: C.muted, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}>Готово</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                      <Av l={s.name[0]} color={user.color} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{s.grade}</div>
                      </div>
                      <Badge text={FORMAT_LABELS[s.format] || s.format} color={FORMAT_COLORS[s.format] || C.blue} />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>📍 {s.address || "Адрес не указан"} · {(s.days||[]).join(", ") || "Дни не указаны"} {s.time || ""}</div>
                    {(s.parentPhone || parent) && (
                      <div style={{ background: C.blueLight, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>👨‍👩‍👧</span>
                        <div>
                          {parent && <div style={{ fontWeight: 700, fontSize: 13 }}>{parent.name}</div>}
                          <a href={`tel:${s.parentPhone || parent?.phone}`} style={{ fontSize: 13, color: C.blueDark, fontWeight: 700, textDecoration: "none" }}>
                            📞 {s.parentPhone || parent?.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    <button onClick={() => setEditingStudent(s.id)} style={{ width: "100%", padding: "8px 12px", background: C.blueLight, border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", color: C.blueDark }}>✏️ Изменить расписание</button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === "schedule" && (
        <div>
          <PageTitle emoji="📅" title="Моё расписание" />
          {(() => {
            const today = new Date().toLocaleDateString("ru-RU");
            const todayRu = new Date().toLocaleDateString("ru-RU", { weekday: "long" });
            const todayReports = (allReports || []).filter(r => r.teacherId === user.id && r.date === today);
            const reportedStudentIds = new Set(todayReports.map(r => r.studentId));
            return DAYS.map(day => {
              const items = myStudents.filter(s => (s.days||[]).includes(day));
              const isToday = day.toLowerCase().startsWith(todayRu.toLowerCase().slice(0, 3)) || todayRu.toLowerCase().startsWith(day.toLowerCase().slice(0, 3));
              return (
                <Card key={day} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: items.length ? user.color : C.muted, marginBottom: items.length ? 10 : 0 }}>{day}</div>
                  {items.length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>Свободно</div>
                    : items.map(s => {
                      const missed = isToday && !reportedStudentIds.has(s.id);
                      return (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${C.border}`, background: missed ? C.danger + "08" : "transparent", borderRadius: 8, paddingLeft: missed ? 8 : 0 }}>
                          <div style={{ background: missed ? C.danger : user.color, color: "#fff", fontWeight: 800, padding: "5px 10px", borderRadius: 8, fontSize: 12 }}>{s.time}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>📍 {s.address}</div>
                          </div>
                          {missed && <Badge text="❌ Нет отчёта" color={C.danger} />}
                          {isToday && !missed && reportedStudentIds.has(s.id) && <Badge text="✅ Отчёт сдан" color={C.success} />}
                        </div>
                      );
                    })}
                </Card>
              );
            });
          })()}
        </div>
      )}

      {tab === "history" && (
        <div>
          <PageTitle emoji="🕐" title="История отчётов" />
          {(() => {
            const teacherReports = (allReports || []).filter(r => r.teacherId === user.id);
            const teacherTrials = (allTrials || []).filter(t => t.teacherId === user.id);
            return (
              <div>
                {teacherTrials.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: C.warning }}>🧪 Пробные уроки</div>
                    {teacherTrials.map(t => (
                      <Card key={t.id} style={{ marginBottom: 12, borderLeft: `4px solid ${t.decision === "take" ? C.success : t.decision === "reject" ? C.danger : C.warning}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>👶 {t.childName}, {t.childAge} лет</div>
                            <div style={{ fontSize: 12, color: C.muted }}>{t.date}</div>
                          </div>
                          {t.decision === "take" && <Badge text="Берёт!" color={C.success} />}
                          {t.decision === "reject" && <Badge text="Не беру" color={C.danger} />}
                          {!t.decision && <Badge text="На рассмотрении" color={C.warning} />}
                        </div>
                        {t.teacherNotes && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>📝 {t.teacherNotes}</div>}
                        {t.decision === "reject" && t.rejectReason && <div style={{ fontSize: 12, color: C.danger, marginTop: 2 }}>❌ {t.rejectReason}</div>}
                      </Card>
                    ))}
                  </div>
                )}
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>📝 Уроки</div>
                {teacherReports.length === 0 ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 24 }}>Отчётов пока нет</div></Card>
                  : teacherReports.map(r => (
                    <Card key={r.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div><div style={{ fontWeight: 800 }}>{r.studentName}</div><div style={{ fontSize: 12, color: C.muted }}>{r.date}</div></div>
                        <Stars rating={r.rating} />
                      </div>
                      <div style={{ fontSize: 13 }}>📚 {r.topic}</div>
                      {r.paymentReceived && <div style={{ marginTop: 6 }}><Badge text={`💰 ${r.paymentAmount} сом`} color={C.success} /></div>}
                    </Card>
                  ))}
              </div>
            );
          })()}
        </div>
      )}

      {tab === "library" && (
        <div>
          <PageTitle emoji="📚" title="Книги" />
          {INITIAL_BOOKS.map(b => (
            <Card key={b.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>{b.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div><div style={{ fontSize: 12, color: C.muted }}>{b.subject}</div></div>
              {b.url ? <Btn small color={C.blue}>Открыть</Btn> : <span style={{ fontSize: 12, color: C.muted }}>Скоро</span>}
            </Card>
          ))}
        </div>
      )}

      {tab === "myreviews" && (
        <div>
          <PageTitle emoji="⭐" title="Отзывы обо мне" />
          {(allReviews||[]).filter(rv => rv.teacherId === user.id).length === 0
            ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Отзывов пока нет</div></Card>
            : (allReviews||[]).filter(rv => rv.teacherId === user.id).map(rv => (
              <Card key={rv.id} style={{ marginBottom: 14, borderLeft: `4px solid ${user.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontWeight: 800 }}>{rv.parentName}</div>
                  <Stars rating={rv.rating} />
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>👦 {rv.studentName} · {rv.date}</div>
                {rv.text && <div style={{ background: C.blueLight, borderRadius: 10, padding: 12, fontSize: 14 }}>💬 {rv.text}</div>}
              </Card>
            ))}
        </div>
      )}
    </Layout>
  );
}

function SmmApp({ user, onLogout, allSmmReports, setAllSmmReports }) {
  const [tab, setTab] = useState("home");
  const [notif, setNotif] = useState(null);
  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3000); };
  const SMM_COLOR = "#E91E8C";

  const myReports = (allSmmReports || []).filter(r => r.authorId === user.id);
  const myNotes = (allSmmReports || []).filter(r => r.type === "smm_note" && r.authorId === user.id);
  const myPlan = (allSmmReports || []).filter(r => r.type === "smm_task" && r.authorId === user.id);

  const [newNote, setNewNote] = useState("");
  const [noteFiles, setNoteFiles] = useState([]);
  const [newTask, setNewTask] = useState({ platform: "Instagram", taskType: "Пост", day: "Понедельник", description: "" });
  const [weekReport, setWeekReport] = useState({ postsCount: "", newFollowers: "", reach: "", leadsFromSocial: "", bestPost: "", notes: "", nextPlan: "" });
  const [reportSent, setReportSent] = useState(false);

  const PLATFORMS = ["Instagram", "Telegram", "TikTok", "YouTube"];
  const TASK_TYPES = ["Пост", "Сторис", "Рилс", "Опрос", "Отзыв", "Реклама"];

  const addNote = async () => {
    if (!newNote.trim()) return;
    const today = new Date().toLocaleDateString("ru-RU");
    const rec = { id: Date.now(), type: "smm_note", authorId: user.id, authorName: user.name, date: today, text: newNote, files: noteFiles };
    setAllSmmReports(p => [rec, ...p]);
    sb.add("ak_smm_reports", rec);
    const filesInfo = noteFiles.length > 0 ? `\n📎 Файлов: ${noteFiles.length}` : "";
    await sendTelegram(`📱 <b>СММ — новая заметка!</b>\n👤 ${user.name}\n📝 ${newNote}${filesInfo}\n📅 ${today}`);
    setNewNote("");
    setNoteFiles([]);
    toast("💡 Заметка добавлена!");
  };

  const addTask = () => {
    const today = new Date().toLocaleDateString("ru-RU");
    const rec = { id: Date.now(), type: "smm_task", authorId: user.id, authorName: user.name, date: today, platform: newTask.platform, taskType: newTask.taskType, day: newTask.day, description: newTask.description, done: false };
    setAllSmmReports(p => [rec, ...p]);
    sb.add("ak_smm_reports", rec);
    setNewTask({ platform: "Instagram", taskType: "Пост", day: "Понедельник", description: "" });
    toast("✅ Задача добавлена в план!");
  };

  const toggleTask = async (id, done) => {
    setAllSmmReports(p => p.map(r => r.id === id ? { ...r, done: !done } : r));
    sb.patch("ak_smm_reports", id, { done: !done });
    if (!done) toast("✅ Выполнено!");
  };

  const submitWeekReport = async () => {
    const today = new Date().toLocaleDateString("ru-RU");
    const rec = { id: Date.now(), type: "smm_report", authorId: user.id, authorName: user.name, date: today, ...weekReport, postsCount: Number(weekReport.postsCount), newFollowers: Number(weekReport.newFollowers), reach: Number(weekReport.reach), leadsFromSocial: Number(weekReport.leadsFromSocial) };
    setAllSmmReports(p => [rec, ...p]);
    sb.add("ak_smm_reports", rec);
    const text = `📱 <b>Недельный отчёт СММ — ${user.name}</b>\n\n📸 Постов: ${rec.postsCount}\n👥 Новые подписчики: +${rec.newFollowers}\n👁️ Охваты: ${rec.reach}\n🎯 Лиды из соцсетей: ${rec.leadsFromSocial}\n⭐ Лучший пост: ${rec.bestPost || "—"}\n\n💬 ${rec.notes || "—"}\n\n📅 План на след. неделю: ${rec.nextPlan || "—"}`;
    await sendTelegram(text);
    setReportSent(true);
    toast("📤 Отчёт отправлен!");
  };

  const nav = [
    { key: "home",    icon: "🏠", label: "Главная"     },
    { key: "plan",    icon: "📅", label: "Контент-план" },
    { key: "notes",   icon: "💡", label: "Идеи/Заметки" },
    { key: "report",  icon: "📊", label: "Мой отчёт"   },
  ];

  return (
    <Layout user={{ ...user, color: SMM_COLOR }} tab={tab} setTab={setTab} navItems={nav} onLogout={onLogout}>
      {notif && <div style={{ position: "fixed", top: 18, right: 18, background: SMM_COLOR, color: "#fff", padding: "12px 22px", borderRadius: 12, fontWeight: 700, zIndex: 999 }}>{notif}</div>}

      {tab === "home" && (
        <div>
          <div style={{ background: `linear-gradient(135deg, ${SMM_COLOR} 0%, #9C27B0 100%)`, borderRadius: 20, padding: "24px", marginBottom: 22, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: 12, fontSize: 28 }}>📱</div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>СММ-менеджер</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>Привет, {user.name}! 📱</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div onClick={() => setTab("plan")} style={{ background: SMM_COLOR, borderRadius: 16, padding: 18, cursor: "pointer" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Контент-план</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{myPlan.filter(t => !t.done).length} задач</div>
            </div>
            <div onClick={() => setTab("notes")} style={{ background: "#9C27B0", borderRadius: 16, padding: 18, cursor: "pointer" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>💡</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Идеи</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{myNotes.length} заметок</div>
            </div>
          </div>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>📊 Последние отчёты</div>
            {myReports.filter(r => r.type === "smm_report").slice(0, 3).map(r => (
              <div key={r.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{r.date}</div>
                <div style={{ fontSize: 12, color: C.muted }}>📸 {r.postsCount} постов · 👥 +{r.newFollowers} подписчиков · 🎯 {r.leadsFromSocial} лидов</div>
              </div>
            ))}
            {myReports.filter(r => r.type === "smm_report").length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Отчётов пока нет</div>}
          </Card>
        </div>
      )}

      {tab === "plan" && (
        <div>
          <PageTitle emoji="📅" title="Контент-план" />
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: SMM_COLOR }}>➕ Добавить задачу</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <FSelect label="ПЛАТФОРМА" value={newTask.platform} onChange={v => setNewTask(p => ({...p, platform: v}))} options={PLATFORMS} />
              <FSelect label="ТИП КОНТЕНТА" value={newTask.taskType} onChange={v => setNewTask(p => ({...p, taskType: v}))} options={TASK_TYPES} />
            </div>
            <FSelect label="ДЕНЬ" value={newTask.day} onChange={v => setNewTask(p => ({...p, day: v}))} options={DAYS} />
            <FInput label="ОПИСАНИЕ" value={newTask.description} onChange={v => setNewTask(p => ({...p, description: v}))} placeholder="Что публикуем?" />
            <Btn full color={SMM_COLOR} onClick={addTask} disabled={!newTask.description}>+ Добавить в план</Btn>
          </Card>
          {DAYS.map(day => {
            const dayTasks = myPlan.filter(t => t.day === day);
            if (dayTasks.length === 0) return null;
            return (
              <Card key={day} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: SMM_COLOR, marginBottom: 10 }}>{day}</div>
                {dayTasks.map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}`, opacity: t.done ? 0.5 : 1 }}>
                    <button onClick={() => toggleTask(t.id, t.done)} style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${t.done ? C.success : C.border}`, background: t.done ? C.success : "#fff", cursor: "pointer", fontSize: 14, color: "#fff", flexShrink: 0 }}>{t.done ? "✓" : ""}</button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, textDecoration: t.done ? "line-through" : "none" }}>{t.platform} — {t.taskType}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{t.description}</div>
                    </div>
                    {t.done ? <Badge text="✅ Готово" color={C.success} /> : <Badge text="🔄 В работе" color={C.warning} />}
                  </div>
                ))}
              </Card>
            );
          })}
          {myPlan.length === 0 && <Card><div style={{ color: C.muted, textAlign: "center", padding: 32 }}>Задач пока нет — добавь первую!</div></Card>}
        </div>
      )}

      {tab === "notes" && (
        <div>
          <PageTitle emoji="💡" title="Идеи и заметки" />
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: "#9C27B0" }}>💡 Новая идея</div>
            <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={3} placeholder="Идея для контента, улучшение, мысль..."
              style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: C.blueLight, marginBottom: 10 }} />
            <FileUpload label="📎 Прикрепи фото/видео/файл (необязательно)" files={noteFiles} onChange={setNoteFiles} />
            <div style={{ marginTop: 10 }}><Btn full color="#9C27B0" onClick={addNote} disabled={!newNote.trim()}>💾 Сохранить идею</Btn></div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>📲 Айданек получит уведомление в Telegram</div>
          </Card>
          {myNotes.length === 0
            ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 32 }}>Заметок пока нет</div></Card>
            : myNotes.map(n => (
              <Card key={n.id} style={{ marginBottom: 10, borderLeft: `4px solid #9C27B0` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>💡 Идея</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{n.date}</div>
                </div>
                <div style={{ fontSize: 14, marginBottom: n.files?.length ? 8 : 0 }}>{n.text}</div>
                {n.files && n.files.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {n.files.map((f, i) => f.isVideo
                      ? <div key={i} style={{ background: "#9C27B020", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#9C27B0", fontWeight: 600 }}>🎥 {f.name}</div>
                      : <img key={i} src={f.url} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: `2px solid ${C.border}` }} />
                    )}
                  </div>
                )}
              </Card>
            ))}
        </div>
      )}

      {tab === "report" && (
        <div>
          <PageTitle emoji="📊" title="Недельный отчёт" />
          {reportSent ? (
            <Card style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
              <div style={{ fontWeight: 900, fontSize: 20, color: C.success }}>Отчёт отправлен Айданек!</div>
              <div style={{ marginTop: 16 }}><Btn onClick={() => { setReportSent(false); setWeekReport({ postsCount: "", newFollowers: "", reach: "", leadsFromSocial: "", bestPost: "", notes: "", nextPlan: "" }); }} color={SMM_COLOR}>Новый отчёт</Btn></div>
            </Card>
          ) : (
            <Card style={{ maxWidth: 540 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: SMM_COLOR }}>📊 Итоги недели</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FInput label="📸 ПОСТОВ ОПУБЛИКОВАНО" value={weekReport.postsCount} onChange={v => setWeekReport(p => ({...p, postsCount: v}))} type="number" placeholder="0" />
                <FInput label="👥 НОВЫХ ПОДПИСЧИКОВ" value={weekReport.newFollowers} onChange={v => setWeekReport(p => ({...p, newFollowers: v}))} type="number" placeholder="0" />
                <FInput label="👁️ ОХВАТЫ" value={weekReport.reach} onChange={v => setWeekReport(p => ({...p, reach: v}))} type="number" placeholder="0" />
                <FInput label="🎯 ЛИДЫ ИЗ СОЦСЕТЕЙ" value={weekReport.leadsFromSocial} onChange={v => setWeekReport(p => ({...p, leadsFromSocial: v}))} type="number" placeholder="0" />
              </div>
              <FInput label="⭐ ЛУЧШИЙ ПОСТ НЕДЕЛИ" value={weekReport.bestPost} onChange={v => setWeekReport(p => ({...p, bestPost: v}))} placeholder="Опишите что сработало лучше всего" />
              <FTextarea label="💬 ЧТО СРАБОТАЛО / ЧТО НЕТ" value={weekReport.notes} onChange={v => setWeekReport(p => ({...p, notes: v}))} placeholder="Что получилось хорошо? Что можно улучшить?" rows={3} />
              <FTextarea label="📅 ПЛАН НА СЛЕДУЮЩУЮ НЕДЕЛЮ" value={weekReport.nextPlan} onChange={v => setWeekReport(p => ({...p, nextPlan: v}))} placeholder="Что планируешь на следующую неделю?" rows={3} />
              <Btn full color={SMM_COLOR} onClick={submitWeekReport}>📤 Отправить отчёт Айданек</Btn>
            </Card>
          )}
        </div>
      )}
    </Layout>
  );
}

function ParentApp({ user, onLogout, students, reports, teachers, onReview, myReviews = [] }) {
  const [tab, setTab] = useState("home");
  const student = students.find(s => s.id === user.studentId);
  const teacher = teachers.find(t => t.id === student?.teacherId);
  const myReports = reports.filter(r => r.studentId === user.studentId);
  const totalPaid = myReports.filter(r => r.paymentReceived).reduce((s,r) => s + r.paymentAmount, 0);
  const [rv, setRv] = useState({ rating: 5, text: "", teacherId: "" });
  const [rvSent, setRvSent] = useState(false);

  const nav = [
    { key: "home",     icon: "🏠", label: "Главная"    },
    { key: "reports",  icon: "📋", label: "Отчёты"     },
    { key: "schedule", icon: "📅", label: "Расписание" },
    { key: "payments", icon: "💰", label: "Оплаты"     },
    { key: "review",   icon: "⭐", label: "Отзыв"      },
  ];

  return (
    <Layout user={user} tab={tab} setTab={setTab} navItems={nav} onLogout={onLogout}>
      {tab === "home" && (
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>Добро пожаловать! 👋</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
            <StatCard icon="📋" val={myReports.length} label="Уроков" color={C.blue} />
            <StatCard icon="⭐" val={myReports.length ? (myReports.reduce((s,r)=>s+r.rating,0)/myReports.length).toFixed(1) : "—"} label="Ср. оценка" color={C.warning} />
            <StatCard icon="💰" val={totalPaid.toLocaleString() + " с"} label="Оплачено" color={C.success} />
          </div>
          {student && (
            <Card>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
                <Av l={student.name[0]} color={teacher?.color || C.blue} size={52} photoUrl={teacher?.photoUrl} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{student.name}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{student.grade} · 👩‍🏫 {teacher?.name}</div>
                  <Badge text={FORMAT_LABELS[student.format] || student.format} color={FORMAT_COLORS[student.format] || C.blue} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(student.days||[]).map(d => <span key={d} style={{ background: C.blueDark, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{d}</span>)}
                <span style={{ background: C.blueLight, color: C.blueDark, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>🕐 {student.time}</span>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "reports" && (
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>📋 Отчёты об уроках</div>
          {myReports.length === 0 ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 24 }}>Отчётов пока нет</div></Card>
            : myReports.map((r,i) => (
              <Card key={r.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div><div style={{ fontWeight: 900, fontSize: 16 }}>Урок №{myReports.length - i}</div><div style={{ fontSize: 12, color: C.muted }}>📅 {r.date}</div></div>
                  <Stars rating={r.rating} />
                </div>
                <div style={{ background: C.blueLight, borderRadius: 10, padding: 12, marginBottom: 8 }}><div style={{ fontWeight: 700 }}>📚 {r.topic}</div></div>
                {r.notes && <div style={{ fontSize: 14, marginBottom: 6 }}>💬 {r.notes}</div>}
                {r.homework && <div style={{ background: "#FFF9F0", borderRadius: 10, padding: 10, fontSize: 13 }}>📝 <b>Д/З:</b> {r.homework}</div>}
              </Card>
            ))}
        </div>
      )}

      {tab === "schedule" && student && (
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>📅 Расписание</div>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[{ icon: "🕐", label: "Время", val: student.time }, { icon: "📍", label: "Адрес", val: student.address }, { icon: "👩‍🏫", label: "Педагог", val: teacher?.name }, { icon: "📚", label: "Предмет", val: teacher?.subject }].map((item,i) => (
                <div key={i} style={{ background: C.blueLight, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.icon} {item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(student.days||[]).map(d => <div key={d} style={{ background: C.blueDark, color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 10 }}>{d}</div>)}
            </div>
          </Card>
        </div>
      )}

      {tab === "payments" && (
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>💰 Оплаты</div>
          <Card style={{ textAlign: "center", marginBottom: 16, borderTop: `4px solid ${C.success}` }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.success }}>{totalPaid.toLocaleString()} сом</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Всего оплачено</div>
          </Card>
          {myReports.filter(r => r.paymentReceived).map(r => (
            <Card key={r.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontWeight: 700 }}>{r.topic}</div><div style={{ fontSize: 12, color: C.muted }}>📅 {r.date}</div></div>
              <div style={{ fontWeight: 900, color: C.success }}>{r.paymentAmount} сом</div>
            </Card>
          ))}
        </div>
      )}

      {tab === "review" && (
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>⭐ Оставить отзыв</div>
          {rvSent ? (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
              <div style={{ fontWeight: 900, fontSize: 20, color: C.success }}>Спасибо за отзыв!</div>
              <div style={{ marginTop: 16 }}><Btn onClick={() => { setRvSent(false); setRv({ rating: 5, text: "", teacherId: "" }); }} color={C.blue}>Написать ещё</Btn></div>
            </Card>
          ) : (
            <Card style={{ maxWidth: 520 }}>
              <FSelect label="ПЕДАГОГ" value={rv.teacherId} onChange={v => setRv(p => ({...p, teacherId: v}))} options={teachers.map(t => ({ value: t.id, label: `${t.name} · ${t.subject}` }))} required />
              <div style={{ marginBottom: 16 }}><Label>ОЦЕНКА</Label><Stars rating={rv.rating} onChange={v => setRv(p => ({...p, rating: v}))} /></div>
              <div style={{ marginBottom: 20 }}>
                <Label>СООБЩЕНИЕ</Label>
                <textarea value={rv.text} onChange={e => setRv(p => ({...p, text: e.target.value}))} rows={4} placeholder="Напишите что понравилось..." style={{ width: "100%", padding: "12px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: C.blueLight }} />
              </div>
              <Btn full color={C.blue} disabled={!rv.teacherId} onClick={() => {
                const t = teachers.find(t => t.id === Number(rv.teacherId));
                onReview({ id: Date.now(), parentName: user.name, studentName: student?.name || "", teacherId: Number(rv.teacherId), teacherName: t?.name || "", rating: rv.rating, text: rv.text, date: new Date().toLocaleDateString("ru-RU") });
                setRvSent(true);
              }}>⭐ Отправить отзыв</Btn>
            </Card>
          )}
        </div>
      )}
    </Layout>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [allReports, setAllReports] = useState([]);
  const [allTrials,  setAllTrials]  = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [allSmmReports, setAllSmmReports] = useState([]);
  const [students,   setStudents]   = useState(INITIAL_STUDENTS);
  const [teachers,   setTeachers]   = useState(INITIAL_TEACHERS);
  const [parents,    setParents]    = useState(INITIAL_PARENTS);
  const [groups,     setGroups]     = useState(INITIAL_GROUPS);
  const [books,      setBooks]      = useState(INITIAL_BOOKS);
  const [leads,      setLeads]      = useState(INITIAL_LEADS);
  const [finances,   setFinances]   = useState([]);
  const [bookSales,  setBookSales]  = useState([]);

  const allUsers = [ADMIN, COORDINATOR, SMM_USER, ...teachers, ...parents];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, t, p, g, l, r, tr, rv, fn, bs, sr] = await Promise.all([
          sb.all("ak_students"), sb.all("ak_teachers"), sb.all("ak_parents"),
          sb.all("ak_groups"),   sb.all("ak_leads"),    sb.all("ak_reports"),
          sb.all("ak_trials"),   sb.all("ak_reviews"),
          sb.all("ak_finances"), sb.all("ak_book_sales"), sb.all("ak_smm_reports"),
        ]);
        if (s?.length)  setStudents(s);
        if (t?.length)  setTeachers(t);
        if (p?.length)  setParents(p);
        if (g?.length)  setGroups(g);
        if (l?.length)  setLeads(l);
        if (r?.length)  setAllReports(r); else setAllReports([]);
        if (tr?.length) setAllTrials(tr); else setAllTrials([]);
        if (rv?.length) setAllReviews(rv);
        if (fn?.length) setFinances(fn);
        if (bs?.length) setBookSales(bs);
        if (sr?.length) setAllSmmReports(sr);
      } catch(e) { console.log("DB error", e); }
      setDbLoading(false);
    };
    loadData();
    // Авто-обновление каждые 30 секунд
    const interval = setInterval(() => {
      sb.all("ak_reports").then(r => { if (r) setAllReports(r); });
      sb.all("ak_trials").then(tr => { if (tr) setAllTrials(tr); });
      sb.all("ak_leads").then(l => { if (l) setLeads(l); });
      sb.all("ak_smm_reports").then(sr => { if (sr) setAllSmmReports(sr); });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (dbLoading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif" }}>
      <PandaLogo size={80} />
      <div style={{ marginTop: 20, fontSize: 22, fontWeight: 900, color: C.blueDark }}>Ak Bilim</div>
      <div style={{ marginTop: 8, fontSize: 14, color: C.muted }}>Загружаем данные... 🐼</div>
      <div style={{ marginTop: 20, width: 220, height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: "70%", height: "100%", background: C.blue, borderRadius: 99 }} />
      </div>
    </div>
  );

  if (!user) return <Login onLogin={setUser} allUsers={allUsers} />;

  if (user.role === "admin") return (
    <AdminApp user={user} onLogout={() => setUser(null)}
      allReports={allReports} setAllReports={setAllReports}
      allTrials={allTrials} setAllTrials={setAllTrials}
      students={students} setStudents={setStudents}
      teachers={teachers} setTeachers={setTeachers}
      parents={parents} setParents={setParents}
      groups={groups} setGroups={setGroups}
      allReviews={allReviews} books={books} setBooks={setBooks}
      leads={leads} setLeads={setLeads}
      finances={finances} setFinances={setFinances}
      bookSales={bookSales} setBookSales={setBookSales}
      allSmmReports={allSmmReports} setAllSmmReports={setAllSmmReports} />
  );

  if (user.role === "coordinator") return (
    <CoordinatorApp user={user} onLogout={() => setUser(null)}
      allReports={allReports} allTrials={allTrials} setAllTrials={setAllTrials}
      students={students} setStudents={setStudents}
      teachers={teachers} setTeachers={setTeachers} parents={parents} setParents={setParents}
      groups={groups} allReviews={allReviews} books={books}
      leads={leads} setLeads={setLeads}
      allSmmReports={allSmmReports} setAllSmmReports={setAllSmmReports} />
  );

  if (user.role === "smm") return (
    <SmmApp user={user} onLogout={() => setUser(null)}
      allSmmReports={allSmmReports} setAllSmmReports={setAllSmmReports} />
  );

  if (user.role === "parent") return (
    <ParentApp user={user} onLogout={() => setUser(null)}
      students={students} reports={allReports} teachers={teachers}
      onReview={r => { setAllReviews(p => [r,...p]); sb.add("ak_reviews", r); }}
      myReviews={allReviews.filter(r => r.parentName === user.name)} />
  );

  if (user.role === "other") return (
    <OtherStaffApp user={user} onLogout={() => setUser(null)} books={books} />
  );

  const freshUser = teachers.find(t => t.id === user.id) || user;
  return (
    <TeacherApp user={freshUser} onLogout={() => setUser(null)}
      onReport={r => setAllReports(p => [r, ...p])}
      onTrial={t  => { setAllTrials(p => [t,...p]); sb.add("ak_trials", t); }}
      students={students} allReviews={allReviews} allReports={allReports} setAllReports={setAllReports} allTrials={allTrials} parents={parents} />
  );
}
