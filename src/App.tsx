import { useState, useRef } from "react";

const C = {
  blue: "#6BB8E8", blueDark: "#3A8CC7", blueLight: "#EBF5FC", blueMid: "#B8DDF5",
  black: "#1A1A1A", white: "#FFFFFF", success: "#4CAF7D",
  danger: "#E05C5C", warning: "#F5A623", muted: "#7A9BB5", border: "#D4EAF7",
  card: "#FFFFFF", bg: "#EBF5FC", text: "#1A2E3D", coord: "#8B6BB5",
  group: "#E07B39", home: "#5B9E6E", online: "#4AADAD", region: "#D4845A",
};

const ADMIN       = { login: "aydanek",    password: "akbilim2025", name: "Айданек",     role: "admin" };
const COORDINATOR = { login: "pomoshnica", password: "coord123",    name: "Координатор",   role: "coordinator" };

const INITIAL_TEACHERS = [
  { id: 1, name: "Айгуль Бекова",      subject: "Математика",      avatar: "А", color: "#3A8CC7", login: "aigul",  password: "aigul123",  role: "teacher", rate: 600, format: "выезд",  duties: "Проводить уроки на выезде. Заполнять отчёты после каждого урока с фото." },
  { id: 2, name: "Нурзат Токтосунова", subject: "Русский язык",    avatar: "Н", color: "#5B9E6E", login: "nurzat", password: "nurzat123", role: "teacher", rate: 700, format: "офис",   duties: "Вести группы в офисе. Следить за посещаемостью. Сдавать отчёт еженедельно." },
  { id: 3, name: "Мирлан Осмонов",     subject: "Английский язык", avatar: "М", color: "#8B6BB5", login: "mirlan", password: "mirlan123", role: "teacher", rate: 650, format: "онлайн", duties: "Онлайн-уроки через Zoom. Присылать ссылки родителям заранее." },
];

const INITIAL_STUDENTS = [
  { id: 1, name: "Алина Сейткали",   grade: "3 класс",    address: "ул. Ленина 12",        days: ["Понедельник","Среда"],      time: "14:00", progress: 85, teacherId: 1, parentPhone: "+996 700 100 200", format: "выезд"  },
  { id: 2, name: "Тимур Джумалиев",  grade: "2 класс",    address: "ул. Манаса 5",          days: ["Вторник","Четверг"],        time: "15:00", progress: 70, teacherId: 1, parentPhone: "+996 700 300 400", format: "выезд"  },
  { id: 3, name: "Айзада Рысбекова", grade: "4 класс",    address: "ул. Байтик Баатыра 20", days: ["Среда","Пятница"],         time: "13:00", progress: 92, teacherId: 2, parentPhone: "+996 700 500 600", format: "выезд"  },
  { id: 4, name: "Эрлан Бакытбеков", grade: "Дошкольник", address: "Масалиева 16 (офис)",   days: ["Пн","Вт","Ср","Чт","Пт"], time: "09:00", progress: 60, teacherId: 2, parentPhone: "+996 700 700 800", format: "группа", groupId: 1 },
  { id: 5, name: "Дана Асанова",     grade: "Дошкольник", address: "Масалиева 16 (офис)",   days: ["Пн","Вт","Ср","Чт","Пт"], time: "09:00", progress: 78, teacherId: 2, parentPhone: "+996 700 900 000", format: "группа", groupId: 1 },
];

const INITIAL_PARENTS = [
  { id: 1, login: "+996700000001", phone: "+996700000001", password: "test123", name: "Айгуль Сейткали", studentId: 1, role: "parent" },
];

const INITIAL_GROUPS = [
  { id: 1, name: "Кыргызская А", lang: "Кыргызский", teacherId: 2, time: "09:00–11:00", days: ["Пн","Вт","Ср","Чт","Пт"], color: C.group, maxStudents: 8, address: "Масалиева 16" },
];

const INITIAL_BOOKS = [
  { id: 1, title: "Методичка: Математика 1–4 класс", subject: "Математика",   icon: "📐", url: null },
  { id: 2, title: "Упражнения по русскому языку",    subject: "Русский язык", icon: "📖", url: null },
  { id: 3, title: "Английский для начинающих",       subject: "Английский",   icon: "🌍", url: null },
  { id: 4, title: "Подготовка к школе: полный курс", subject: "Дошкольная",   icon: "🎒", url: null },
];

// Начальные лиды для воронки
const INITIAL_LEADS = [
  { id: 1, childName: "Айбек Касымов",    parentName: "Асель Касымова",  parentPhone: "+996 700 111 222", grade: "2 класс",    subject: "Математика", district: "Свердловский", source: "Instagram", status: "new",      createdAt: "01.05.2025", notes: "" },
  { id: 2, childName: "Зарина Токтогул",  parentName: "Бурул Токтогул",  parentPhone: "+996 555 333 444", grade: "Дошкольник", subject: "Кыргызский", district: "Октябрьский", source: "Telegram",  status: "trial",    createdAt: "28.04.2025", trialDate: "05.05.2025", teacherName: "Айгуль Бекова", notes: "Очень активный ребёнок" },
  { id: 3, childName: "Данияр Алиев",     parentName: "Гульзат Алиева",  parentPhone: "+996 700 555 666", grade: "3 класс",    subject: "Английский", district: "Первомайский",source: "Рекоменд.", status: "accepted", createdAt: "25.04.2025", notes: "Взяли в группу Мирлана" },
  { id: 4, childName: "Малика Жакшылык",  parentName: "Нуржан Жакшылык", parentPhone: "+996 555 777 888", grade: "5 класс",    subject: "Русский",    district: "Ленинский",  source: "2ГИС",      status: "rejected", createdAt: "20.04.2025", rejectReason: "Далеко ехать педагогу", notes: "" },
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
const DAYS       = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const DAYS_SHORT = ["Пн","Вт","Ср","Чт","Пт","Сб"];
const TEACHER_COLORS = ["#3A8CC7","#5B9E6E","#8B6BB5","#D4845A","#4AADAD","#C45C8A","#6B8DD6","#B5804A"];
const FORMATS    = ["выезд","группа","онлайн","регион"];
const FORMAT_LABELS = { выезд: "🚗 Выезд", группа: "🏫 Группа", онлайн: "💻 Онлайн", регион: "🌍 Регион" };
const FORMAT_COLORS = { выезд: C.home, группа: C.group, онлайн: C.online, регион: C.region };
const DISTRICTS = ["Свердловский","Октябрьский","Ленинский","Первомайский","Бишкек (центр)","Другой"];
const SOURCES   = ["Instagram","Telegram","2ГИС","Рекоменд.","Звонок","Другое"];

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
const SB_KEY = "sb_publishable_D4ORqqQ1WZdcD9CAWjpvXA_9-GaVcqR";
const uploadFile = async (file) => {
  try {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const res = await fetch(`${SB_URL}/storage/v1/object/akbilim/${fileName}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${SB_KEY}`, "Content-Type": file.type },
      body: file,
    });
    if (res.ok) return { url: `${SB_URL}/storage/v1/object/public/akbilim/${fileName}`, name: file.name, isVideo: file.type.startsWith("video/") };
  } catch (e) { console.log("Upload error", e); }
  return { url: URL.createObjectURL(file), name: file.name, isVideo: file.type.startsWith("video/") };
};

// ─── UI ────────────────────────────────────────────────────────────────────────
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

// Аватар с фото или буквой
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

const Card = ({ children, style = {}, onClick }) => (
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

// Загрузка фото-аватара
function AvatarUpload({ currentUrl, name, color, onUpload }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const handle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file);
    setUploading(false);
    onUpload(result.url);
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

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
function Layout({ user, tab, setTab, navItems, onLogout, children }) {
  const [sideOpen, setSideOpen] = useState(true);
  const roleLabel = { admin: "👑 Руководитель", coordinator: "🗂️ Координатор", teacher: "👩‍🏫 Учитель", parent: "👨‍👩‍👧 Родитель" };
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

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin, allUsers }) {
  const [login, setLogin] = useState(""); const [pass, setPass] = useState("");
  const [show, setShow] = useState(false); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const handle = () => {
    setErr(""); setLoading(true);
    setTimeout(() => {
      const u = allUsers.find(u => (u.login === login.trim().toLowerCase() || u.login === login.trim() || u.phone === login.trim()) && u.password === pass);
      if (u) onLogin(u); else { setErr("Неверный логин или пароль"); setLoading(false); }
    }, 600);
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

// ─── STUDENTS TAB (shared) ────────────────────────────────────────────────────
function StudentsTab({ students, teachers, groups, setStudents, canDelete, canAdd, toast }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("все");
  const [newS, setNewS] = useState({ name: "", grade: "", address: "", days: [], time: "", teacherId: "", parentPhone: "", format: "выезд", groupId: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toggleDay = (day) => setNewS(p => ({ ...p, days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day] }));
  const addStudent = () => {
    if (!newS.name || !newS.teacherId || newS.days.length === 0) return;
    setStudents(prev => [...prev, { ...newS, id: Date.now(), progress: 0, teacherId: Number(newS.teacherId), groupId: newS.groupId ? Number(newS.groupId) : undefined }]);
    setNewS({ name: "", grade: "", address: "", days: [], time: "", teacherId: "", parentPhone: "", format: "выезд", groupId: "" });
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
            <Btn color={C.danger} onClick={() => { setStudents(p => p.filter(s => s.id !== confirmDelete.id)); setConfirmDelete(null); toast("Ученик удалён"); }}>Удалить</Btn>
            <Btn outline color={C.muted} onClick={() => setConfirmDelete(null)}>Отмена</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── LEADS TAB (воронка лидов) ────────────────────────────────────────────────
function LeadsTab({ leads, setLeads, teachers, toast }) {
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
    setNewLead({ childName: "", parentName: "", parentPhone: "", grade: "", subject: "", district: "", source: "", notes: "" });
    setModal(null);
    toast("✅ Лид добавлен в воронку!");
    sendTelegram(`🆕 <b>Новый лид!</b>\n👶 ${lead.childName}\n👨‍👩‍👧 ${lead.parentName}\n📞 ${lead.parentPhone}\n📍 ${lead.district}`);
  };

  const moveTo = (id, status, extra = {}) => {
    setLeads(p => p.map(l => l.id === id ? { ...l, status, ...extra } : l));
    setSelected(null); setModal(null);
    toast(`Лид → ${LEAD_STATUSES[status].label}`);
  };

  const counts = Object.keys(LEAD_STATUSES).reduce((acc, s) => { acc[s] = leads.filter(l => l.status === s).length; return acc; }, {});

  return (
    <div>
      <PageTitle emoji="🎯" title="Воронка лидов" action={<Btn onClick={() => setModal("add")} color={C.blue}>+ Новый лид</Btn>} />

      {/* Воронка */}
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

      {/* Список */}
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
                  {lead.status === "trial" && lead.trialDate && (
                    <div style={{ fontSize: 12, color: C.warning, fontWeight: 700, marginTop: 4 }}>🧪 Пробный: {lead.trialDate} · 👩‍🏫 {lead.teacherName}</div>
                  )}
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

      {/* Добавить лид */}
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

      {/* Детали лида */}
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
              <div style={{ background: C.blueLight, borderRadius: 10, padding: 12, textAlign: "center", color: C.muted, fontSize: 13 }}>
                {selected.status === "accepted" ? "✅ Ученик принят в центр" : `❌ Отказ: ${selected.rejectReason}`}
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <Btn full outline color={C.danger} small onClick={() => { setLeads(p => p.filter(l => l.id !== selected.id)); setModal(null); setSelected(null); toast("Лид удалён"); }}>🗑️ Удалить лид</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── COORDINATOR WEEKLY REPORT ────────────────────────────────────────────────
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

// ─── ADMIN APP ────────────────────────────────────────────────────────────────
function AdminApp({ user, onLogout, allReports, setAllReports, allTrials, setAllTrials, students, setStudents, teachers, setTeachers, parents, setParents, groups, setGroups, allReviews, books, setBooks, leads, setLeads }) {
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [notif, setNotif] = useState(null);
  const [newT, setNewT] = useState({ name: "", subject: "", phone: "", rate: "600", login: "", password: "", format: "выезд", duties: "", staffRole: "teacher" });
  const [newP, setNewP] = useState({ name: "", phone: "", password: "", studentId: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [editTeacher, setEditTeacher] = useState(null);

  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3000); };

  const addTeacher = () => {
    if (!newT.name || !newT.login || !newT.password) return;
    const color = TEACHER_COLORS[teachers.length % TEACHER_COLORS.length];
    const isCoord = newT.staffRole === "coordinator";
    setTeachers(prev => [...prev, {
      id: Date.now(), name: newT.name, subject: isCoord ? "Координатор" : newT.subject,
      avatar: newT.name[0].toUpperCase(), color, role: isCoord ? "coordinator" : "teacher",
      login: newT.login.toLowerCase().trim(), password: newT.password, phone: newT.phone,
      rate: Number(newT.rate) || 0, format: isCoord ? "" : newT.format, duties: newT.duties,
      salaryType: isCoord ? "monthly" : "perLesson"
    }]);
    setNewT({ name: "", subject: "", phone: "", rate: "600", login: "", password: "", format: "выезд", duties: "", staffRole: "teacher" });
    setModal(null); toast(`🎉 ${isCoord ? "Координатор" : "Педагог"} ${newT.name} добавлен${isCoord ? "а" : ""}!`);
  };

  const addParent = () => {
    if (!newP.name || !newP.phone || !newP.password || !newP.studentId) return;
    setParents(prev => [...prev, { id: Date.now(), name: newP.name, phone: newP.phone, login: newP.phone, password: newP.password, studentId: Number(newP.studentId), role: "parent" }]);
    setNewP({ name: "", phone: "", password: "", studentId: "" });
    setModal(null); toast(`👨‍👩‍👧 Родитель ${newP.name} добавлен!`);
  };

  const income = 1400 * students.filter(s => s.format === "выезд" || s.format === "онлайн" || s.format === "регион").length
    + 6000 * students.filter(s => s.format === "группа").length;
  const toTeach = teachers.reduce((s, t) => s + (t.rate || 600), 0);

  const nav = [
    { key: "home",     icon: "🏠", label: "Главная"    },
    { key: "teachers", icon: "👥", label: "Сотрудники" },
    { key: "students", icon: "👦", label: "Ученики"    },
    { key: "groups",   icon: "🏫", label: "Группы"     },
    { key: "parents",  icon: "👨‍👩‍👧", label: "Родители"  },
    { key: "leads",    icon: "🎯", label: "Лиды"       },
    { key: "trials",   icon: "🧪", label: "Пробные"    },
    { key: "reports",  icon: "📋", label: "Отчёты"     },
    { key: "finance",  icon: "💰", label: "Финансы"    },
    { key: "schedule", icon: "📅", label: "Расписание" },
    { key: "reviews",  icon: "⭐", label: "Отзывы"     },
    { key: "library",  icon: "📚", label: "Книги"      },
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

          {/* Координаторы */}
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
                    {t.duties && <div style={{ background: C.blueLight, borderRadius: 8, padding: "8px 10px", marginBottom: 8, fontSize: 12 }}><span style={{ fontWeight: 700, color: C.coord }}>📋 </span>{t.duties}</div>}
                    <div style={{ fontSize: 12, background: C.blueLight, borderRadius: 8, padding: "6px 10px", color: C.blueDark, fontWeight: 600 }}>🔑 {t.login}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Педагоги */}
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
                  {t.duties && (
                    <div style={{ background: C.blueLight, borderRadius: 8, padding: "8px 10px", marginBottom: 10, fontSize: 12, color: C.text }}>
                      <span style={{ fontWeight: 700, color: C.blueDark }}>📋 </span>{t.duties}
                    </div>
                  )}
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

          {/* Добавить сотрудника */}
          <Modal open={modal === "addTeacher"} onClose={() => setModal(null)} title="👥 Новый сотрудник">
            {/* Роль */}
            <div style={{ marginBottom: 16 }}>
              <Label>РОЛЬ СОТРУДНИКА <span style={{ color: C.danger }}>*</span></Label>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ val: "teacher", icon: "👩‍🏫", label: "Педагог" }, { val: "coordinator", icon: "🗂️", label: "Координатор" }].map(opt => (
                  <button key={opt.val} onClick={() => setNewT(p => ({...p, staffRole: opt.val}))} style={{
                    flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14,
                    background: newT.staffRole === opt.val ? (opt.val === "teacher" ? C.blueDark : C.coord) : C.blueLight,
                    color: newT.staffRole === opt.val ? "#fff" : C.muted,
                    border: `2px solid ${newT.staffRole === opt.val ? (opt.val === "teacher" ? C.blueDark : C.coord) : C.border}`,
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
            {newT.staffRole === "coordinator" && (
              <FInput label="ЗАРПЛАТА КООРДИНАТОРА (сом/месяц)" value={newT.rate} onChange={v => setNewT(p => ({...p, rate: v}))} type="number" placeholder="15000" />
            )}
            <FTextarea label="ОБЯЗАННОСТИ" value={newT.duties} onChange={v => setNewT(p => ({...p, duties: v}))} placeholder={newT.staffRole === "coordinator" ? "Обязанности координатора..." : "Обязанности педагога..."} rows={3} />
            <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.blueDark, marginBottom: 10 }}>🔐 Данные для входа</div>
              <FInput label="ЛОГИН" value={newT.login} onChange={v => setNewT(p => ({...p, login: v}))} required />
              <FInput label="ПАРОЛЬ" value={newT.password} onChange={v => setNewT(p => ({...p, password: v}))} required />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <Btn full onClick={addTeacher} color={newT.staffRole === "coordinator" ? C.coord : C.blueDark} disabled={!newT.name || !newT.login || !newT.password}>Добавить</Btn>
              <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
            </div>
          </Modal>

          {/* Редактирование педагога (фото + данные) */}
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
                    setTeachers(p => p.map(t => t.id === editTeacher.id ? { ...t, ...editTeacher } : t));
                    setEditTeacher(null); toast("✅ Педагог обновлён!");
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
        <LeadsTab leads={leads} setLeads={setLeads} teachers={teachers} toast={toast} />
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
          <PageTitle emoji="📋" title="Отчёты педагогов" />
          {allReports.length === 0 ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Отчётов пока нет</div></Card>
            : allReports.map(r => (
              <Card key={r.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Av l={r.teacherAvatar} color={r.teacherColor} size={36} photoUrl={teachers.find(t=>t.id===r.teacherId)?.photoUrl} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{r.teacherName}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{r.date}</div>
                    </div>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <div style={{ fontSize: 13 }}>👦 <b>{r.studentName}</b> · 📚 {r.topic}</div>
                {r.paymentReceived && <div style={{ marginTop: 6 }}><Badge text={`💰 ${r.paymentAmount} сом`} color={C.success} /></div>}
              </Card>
            ))}
        </div>
      )}

      {tab === "finance" && (
        <div>
          <PageTitle emoji="💰" title="Финансы" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
            <StatCard icon="🏫" val={6000 * students.filter(s=>s.format==="группа").length + " с"}  label="Офис (группы)" color={C.group}  />
            <StatCard icon="🚗" val={1400 * students.filter(s=>s.format==="выезд").length + " с"}   label="Выезд"        color={C.home}   />
            <StatCard icon="💻" val={1400 * students.filter(s=>s.format==="онлайн").length + " с"}  label="Онлайн"       color={C.online} />
            <StatCard icon="🌍" val={1400 * students.filter(s=>s.format==="регион").length + " с"}  label="Регион"       color={C.region} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
            <StatCard icon="📥" val={income.toLocaleString() + " с"}   label="Общий доход"     color={C.success} />
            <StatCard icon="👩‍🏫" val={teachers.reduce((s,t)=>s+(t.rate||600),0).toLocaleString() + " с"} label="Ставки педагогов" color={C.blue} />
            <StatCard icon="📈" val={(income - toTeach).toLocaleString() + " с"} label="Прибыль" color={C.warning} />
          </div>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>👩‍🏫 Ставки педагогов</div>
            {teachers.map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Av l={t.avatar} color={t.color} size={28} photoUrl={t.photoUrl} />
                  <div>
                    <span style={{ fontWeight: 700 }}>{t.name}</span>
                    {t.format && <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{FORMAT_LABELS[t.format]}</span>}
                  </div>
                </div>
                <Badge text={`${(t.rate||600).toLocaleString()} сом/урок`} color={C.warning} />
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === "schedule" && (
        <div>
          <PageTitle emoji="📅" title="Расписание" />
          {DAYS.map(day => {
            const items = students.filter(s => (s.days||[]).includes(day)).map(s => ({ ...s, teacher: teachers.find(t => t.id === s.teacherId) }));
            return (
              <Card key={day} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: items.length ? C.blueDark : C.muted, marginBottom: items.length ? 10 : 0 }}>{day}</div>
                {items.length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>Занятий нет</div>
                  : items.map((s,i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < items.length-1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ background: FORMAT_COLORS[s.format] || C.blue, color: "#fff", fontWeight: 800, fontSize: 12, padding: "5px 10px", borderRadius: 8 }}>{s.time}</div>
                      <Badge text={FORMAT_LABELS[s.format] || s.format} color={FORMAT_COLORS[s.format] || C.blue} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{s.teacher?.name} · 📍 {s.address}</div>
                      </div>
                    </div>
                  ))}
              </Card>
            );
          })}
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

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="⚠️ Подтвердить удаление">
        <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Удалить «{confirmDelete?.name}»?</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn color={C.danger} onClick={() => {
              if (confirmDelete?.type === "teacher") { setTeachers(p => p.filter(t => t.id !== confirmDelete.id)); setStudents(p => p.filter(s => s.teacherId !== confirmDelete.id)); }
              else if (confirmDelete?.type === "parent") setParents(p => p.filter(x => x.id !== confirmDelete.id));
              setConfirmDelete(null); toast("🗑️ Удалено");
            }}>Удалить</Btn>
            <Btn outline color={C.muted} onClick={() => setConfirmDelete(null)}>Отмена</Btn>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

// ─── COORDINATOR APP ──────────────────────────────────────────────────────────
function CoordinatorApp({ user, onLogout, allReports, allTrials, setAllTrials, students, setStudents, teachers, parents, setParents, groups, allReviews, books, leads, setLeads }) {
  const [tab, setTab] = useState("home");
  const [notif, setNotif] = useState(null);
  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3000); };

  const nav = [
    { key: "home",      icon: "🏠", label: "Главная"    },
    { key: "duties",    icon: "📋", label: "Обязанности" },
    { key: "leads",     icon: "🎯", label: "Лиды"       },
    { key: "students",  icon: "👦", label: "Ученики"    },
    { key: "groups",    icon: "🏫", label: "Группы"     },
    { key: "teachers",  icon: "👩‍🏫", label: "Педагоги"  },
    { key: "parents",   icon: "👨‍👩‍👧", label: "Родители"  },
    { key: "reports",   icon: "📊", label: "Мой отчёт"  },
    { key: "lessons",   icon: "📑", label: "Отчёты ур." },
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
          {/* Активные лиды */}
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

      {tab === "duties" && (
        <div>
          <PageTitle emoji="📋" title="Мои обязанности" />
          <Card style={{ borderLeft: `5px solid ${C.coord}` }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: C.coord, marginBottom: 16 }}>🗂️ Координатор Ak Bilim</div>
            {[
              { icon: "🎯", title: "Воронка лидов", desc: "Принимаю новые заявки, вношу в систему, назначаю пробные уроки, фиксирую результат." },
              { icon: "🧪", title: "Пробные уроки", desc: "Назначаю педагога и дату, слежу за результатом, заношу взятых учеников в систему." },
              { icon: "👦", title: "Добавление учеников", desc: "После успешного пробного добавляю ученика в систему с указанием формата, дней, времени." },
              { icon: "👨‍👩‍👧", title: "Работа с родителями", desc: "Звоню по новым заявкам, отвечаю на вопросы, консультирую." },
              { icon: "📅", title: "Расписание", desc: "Слежу за расписанием педагогов, помогаю составлять, фиксирую изменения." },
              { icon: "📊", title: "Еженедельный отчёт", desc: "Каждую пятницу заполняю отчёт — сколько лидов, пробных, учеников добавлено." },
              { icon: "❌", title: "Финансы — не моё", desc: "Финансами занимается только Айданек. Я в эту вкладку не захожу." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 24 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === "leads" && (
        <LeadsTab leads={leads} setLeads={setLeads} teachers={teachers} toast={toast} />
      )}

      {tab === "students" && (
        <StudentsTab students={students} teachers={teachers} groups={groups} setStudents={setStudents} canDelete={false} canAdd={true} toast={toast} />
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
          <PageTitle emoji="👩‍🏫" title="Педагоги" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {teachers.map(t => (
              <Card key={t.id} style={{ borderTop: `4px solid ${t.color}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <Av l={t.avatar} color={t.color} size={46} photoUrl={t.photoUrl} />
                  <div>
                    <div style={{ fontWeight: 800 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{t.subject}</div>
                    {t.format && <Badge text={FORMAT_LABELS[t.format] || t.format} color={FORMAT_COLORS[t.format] || C.blue} />}
                    {t.phone && <div style={{ fontSize: 12, color: C.muted }}>📞 {t.phone}</div>}
                  </div>
                </div>
                {t.duties && (
                  <div style={{ background: C.blueLight, borderRadius: 8, padding: "8px 10px", fontSize: 12, color: C.text }}>
                    <span style={{ fontWeight: 700, color: C.blueDark }}>📋 </span>{t.duties}
                  </div>
                )}
              </Card>
            ))}
          </div>
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
        <CoordReportTab leads={leads} students={students} teachers={teachers} toast={toast} />
      )}

      {tab === "lessons" && (
        <div>
          <PageTitle emoji="📑" title="Отчёты педагогов" />
          {allReports.length === 0 ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Отчётов пока нет</div></Card>
            : allReports.map(r => (
              <Card key={r.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Av l={r.teacherAvatar} color={r.teacherColor} size={32} photoUrl={teachers.find(t=>t.id===r.teacherId)?.photoUrl} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{r.teacherName}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{r.date} · 👦 {r.studentName}</div>
                    </div>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <div style={{ fontSize: 13 }}>📚 {r.topic}</div>
              </Card>
            ))}
        </div>
      )}

      {tab === "schedule" && (
        <div>
          <PageTitle emoji="📅" title="Расписание" />
          {DAYS.map(day => {
            const items = students.filter(s => (s.days||[]).includes(day)).map(s => ({ ...s, teacher: teachers.find(t => t.id === s.teacherId) }));
            return (
              <Card key={day} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: items.length ? C.blueDark : C.muted, marginBottom: items.length ? 10 : 0 }}>{day}</div>
                {items.length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>Занятий нет</div>
                  : items.map((s,i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < items.length-1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ background: FORMAT_COLORS[s.format] || C.blue, color: "#fff", fontWeight: 800, fontSize: 12, padding: "5px 10px", borderRadius: 8 }}>{s.time}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{s.teacher?.name}</div>
                      </div>
                    </div>
                  ))}
              </Card>
            );
          })}
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

// ─── TEACHER APP ──────────────────────────────────────────────────────────────
function TeacherApp({ user, onLogout, onReport, onTrial, students, allReviews }) {
  const [tab, setTab] = useState("home");
  const [myReports, setMyReports] = useState([]);
  const [notif, setNotif] = useState(null);
  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3000); };
  const myStudents = students.filter(s => s.teacherId === user.id);
  const [rf, setRf] = useState({ studentId: "", topic: "", topicCustom: "", notes: "", homework: "", rating: 5, paymentReceived: false, paymentAmount: 1400, files: [] });
  const [rfErr, setRfErr] = useState("");
  const [tf, setTf] = useState({ childName: "", childAge: "", childGrade: "", childLevel: "Начальный", parentName: "", parentPhone: "", parentGoal: "", teacherNotes: "", testScore: 3, recommend: false, files: [] });
  const [tfErr, setTfErr] = useState("");

  const submitReport = async () => {
    if (!rf.studentId) { setRfErr("Выберите ученика"); return; }
    if (!rf.topic) { setRfErr("Укажите тему"); return; }
    if (rf.files.length === 0) { setRfErr("📸 Прикрепите фото!"); return; }
    setRfErr("");
    const s = myStudents.find(s => s.id === Number(rf.studentId));
    const r = { id: Date.now(), teacherId: user.id, teacherName: user.name, teacherAvatar: user.avatar, teacherColor: user.color, studentId: Number(rf.studentId), studentName: s?.name, topic: rf.topic === "Другое" ? rf.topicCustom || "Другое" : rf.topic, notes: rf.notes, homework: rf.homework, rating: rf.rating, date: new Date().toLocaleDateString("ru-RU"), paymentReceived: rf.paymentReceived, paymentAmount: rf.paymentReceived ? Number(rf.paymentAmount) : 0, files: rf.files };
    setMyReports(p => [r, ...p]);
    onReport(r);
    await sendTelegram(`📋 <b>Отчёт об уроке!</b>\n\n👩‍🏫 ${user.name}\n👦 ${s?.name}\n📚 ${r.topic}\n⭐ ${r.rating}/5\n📸 ${r.files.length} фото${r.paymentReceived ? `\n💰 ${r.paymentAmount} сом` : ""}`);
    setRf({ studentId: "", topic: "", topicCustom: "", notes: "", homework: "", rating: 5, paymentReceived: false, paymentAmount: 1400, files: [] });
    toast("✅ Отчёт отправлен!"); setTab("home");
  };

  const submitTrial = async () => {
    if (!tf.childName || !tf.parentName) { setTfErr("Заполните имена"); return; }
    if (tf.files.length === 0) { setTfErr("📸 Прикрепите фото!"); return; }
    setTfErr("");
    onTrial({ ...tf, id: Date.now(), teacherId: user.id, teacherName: user.name, date: new Date().toLocaleDateString("ru-RU") });
    await sendTelegram(`🧪 <b>Пробный урок!</b>\n\n👩‍🏫 ${user.name}\n👶 ${tf.childName}, ${tf.childAge} лет\n👨‍👩‍👧 ${tf.parentName}\n📞 ${tf.parentPhone || "—"}\n${tf.recommend ? "✅ Рекомендует взять!" : "⏳ На рассмотрении"}`);
    setTf({ childName: "", childAge: "", childGrade: "", childLevel: "Начальный", parentName: "", parentPhone: "", parentGoal: "", teacherNotes: "", testScore: 3, recommend: false, files: [] });
    toast("🧪 Данные пробного отправлены!"); setTab("home");
  };

  const nav = [
    { key: "home",      icon: "🏠", label: "Главная"    },
    { key: "duties",    icon: "📋", label: "Обязанности" },
    { key: "report",    icon: "📝", label: "Отчёт"      },
    { key: "trial",     icon: "🧪", label: "Пробный"    },
    { key: "students",  icon: "👦", label: "Ученики"    },
    { key: "schedule",  icon: "📅", label: "Расписание" },
    { key: "history",   icon: "🕐", label: "История"    },
    { key: "library",   icon: "📚", label: "Книги"      },
    { key: "myreviews", icon: "⭐", label: "Отзывы"     },
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

      {tab === "duties" && (
        <div>
          <PageTitle emoji="📋" title="Мои обязанности" />
          <Card style={{ borderLeft: `5px solid ${user.color}` }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
              <Av l={user.avatar} color={user.color} size={56} photoUrl={user.photoUrl} />
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{user.subject}</div>
                {user.format && <Badge text={FORMAT_LABELS[user.format]} color={FORMAT_COLORS[user.format] || C.blue} />}
              </div>
            </div>
            {user.duties ? (
              <div style={{ background: C.blueLight, borderRadius: 12, padding: 16, fontSize: 14, lineHeight: 1.8, color: C.text }}>
                {user.duties}
              </div>
            ) : (
              <div style={{ color: C.muted, textAlign: "center", padding: 24 }}>Обязанности пока не указаны</div>
            )}
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
              <input type="checkbox" id="pay" checked={rf.paymentReceived} onChange={e => setRf(p => ({...p, paymentReceived: e.target.checked}))} style={{ width: 17, height: 17 }} />
              <label htmlFor="pay" style={{ fontWeight: 700, fontSize: 14, cursor: "pointer" }}>💰 Получила оплату</label>
            </div>
            {rf.paymentReceived && <input type="number" value={rf.paymentAmount} onChange={e => setRf(p => ({...p, paymentAmount: e.target.value}))} style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />}
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
                {["Слишком слабый уровень","Слишком сильный уровень","Не подходит по характеру","Далеко ехать","Неудобное время","Нет свободного места","Другое"].map(reason => (
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
      {tab === "students" && (
        <div>
          <PageTitle emoji="👦" title="Мои ученики" />
          {myStudents.map(s => (
            <Card key={s.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                <Av l={s.name[0]} color={user.color} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.grade}</div>
                </div>
                <Badge text={FORMAT_LABELS[s.format] || s.format} color={FORMAT_COLORS[s.format] || C.blue} />
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>📍 {s.address} · {(s.days||[]).join(", ")} {s.time}</div>
            </Card>
          ))}
        </div>
      )}

      {tab === "schedule" && (
        <div>
          <PageTitle emoji="📅" title="Моё расписание" />
          {DAYS.map(day => {
            const items = myStudents.filter(s => (s.days||[]).includes(day));
            return (
              <Card key={day} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: items.length ? user.color : C.muted, marginBottom: items.length ? 10 : 0 }}>{day}</div>
                {items.length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>Свободно</div>
                  : items.map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ background: user.color, color: "#fff", fontWeight: 800, padding: "5px 10px", borderRadius: 8, fontSize: 12 }}>{s.time}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>📍 {s.address}</div>
                      </div>
                    </div>
                  ))}
              </Card>
            );
          })}
        </div>
      )}

      {tab === "history" && (
        <div>
          <PageTitle emoji="🕐" title="История отчётов" />
          {myReports.length === 0 ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 24 }}>Отчётов пока нет</div></Card>
            : myReports.map(r => (
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

// ─── PARENT APP ───────────────────────────────────────────────────────────────
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

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [allTrials,  setAllTrials]  = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [students,   setStudents]   = useState(INITIAL_STUDENTS);
  const [teachers,   setTeachers]   = useState(INITIAL_TEACHERS);
  const [parents,    setParents]    = useState(INITIAL_PARENTS);
  const [groups,     setGroups]     = useState(INITIAL_GROUPS);
  const [books,      setBooks]      = useState(INITIAL_BOOKS);
  const [leads,      setLeads]      = useState(INITIAL_LEADS);

  const allUsers = [ADMIN, COORDINATOR, ...teachers, ...parents];

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
      leads={leads} setLeads={setLeads} />
  );

  if (user.role === "coordinator") return (
    <CoordinatorApp user={user} onLogout={() => setUser(null)}
      allReports={allReports} allTrials={allTrials} setAllTrials={setAllTrials}
      students={students} setStudents={setStudents}
      teachers={teachers} parents={parents} setParents={setParents}
      groups={groups} allReviews={allReviews} books={books}
      leads={leads} setLeads={setLeads} />
  );

  if (user.role === "parent") return (
    <ParentApp user={user} onLogout={() => setUser(null)}
      students={students} reports={allReports} teachers={teachers}
      onReview={r => setAllReviews(p => [r, ...p])}
      myReviews={allReviews.filter(r => r.parentName === user.name)} />
  );

  const freshUser = teachers.find(t => t.id === user.id) || user;
  return (
    <TeacherApp user={freshUser} onLogout={() => setUser(null)}
      onReport={r => setAllReports(p => [r, ...p])}
      onTrial={t  => setAllTrials(p  => [t, ...p])}
      students={students} allReviews={allReviews} />
  );
}
