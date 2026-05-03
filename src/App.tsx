import { useState, useRef } from "react";

// 🐼 AK BILIM color palette — from the panda logo
const C = {
  blue: "#6BB8E8",       // логотип голубой
  blueDark: "#3A8CC7",   // темнее голубой
  blueLight: "#EBF5FC",  // очень светлый голубой фон
  blueMid: "#B8DDF5",    // средний голубой
  black: "#1A1A1A",      // панда чёрный
  white: "#FFFFFF",
  cream: "#FFF9F0",      // фон логотипа
  success: "#4CAF7D",
  danger: "#E05C5C",
  warning: "#F5A623",
  muted: "#7A9BB5",
  border: "#D4EAF7",
  card: "#FFFFFF",
  bg: "#EBF5FC",
  text: "#1A2E3D",
};

const ADMIN = { login: "aydanek", password: "akbilim2025", name: "Айданек", role: "admin" };
const INITIAL_TEACHERS = [
  { id: 1, name: "Айгуль Бекова", subject: "Математика", avatar: "А", color: "#3A8CC7", login: "aigul", password: "aigul123", role: "teacher" },
  { id: 2, name: "Нурзат Токтосунова", subject: "Русский язык", avatar: "Н", color: "#5B9E6E", login: "nurzat", password: "nurzat123", role: "teacher" },
  { id: 3, name: "Мирлан Осмонов", subject: "Английский язык", avatar: "М", color: "#8B6BB5", login: "mirlan", password: "mirlan123", role: "teacher" },
];
const INITIAL_STUDENTS = [
  { id: 1, name: "Алина Сейткали", grade: "3 класс", address: "ул. Ленина 12", days: ["Понедельник","Среда"], time: "14:00", progress: 85, teacherId: 1, parentPhone: "+996 700 100 200" },
  { id: 2, name: "Тимур Джумалиев", grade: "2 класс", address: "ул. Манаса 5", days: ["Вторник","Четверг"], time: "15:00", progress: 70, teacherId: 1, parentPhone: "+996 700 300 400" },
  { id: 3, name: "Айзада Рысбекова", grade: "4 класс", address: "ул. Байтик Баатыра 20", days: ["Среда","Пятница"], time: "13:00", progress: 92, teacherId: 2, parentPhone: "+996 700 500 600" },
  { id: 4, name: "Эрлан Бакытбеков", grade: "1 класс", address: "ул. Киевская 44", days: ["Четверг"], time: "16:00", progress: 60, teacherId: 3, parentPhone: "+996 700 700 800" },
  { id: 5, name: "Дана Асанова", grade: "3 класс", address: "ул. Горького 8", days: ["Понедельник","Среда","Пятница"], time: "14:00", progress: 78, teacherId: 2, parentPhone: "+996 700 900 000" },
];
const BOOKS = [
  { id: 1, title: "Методичка: Математика 1–4 класс", subject: "Математика", icon: "📐" },
  { id: 2, title: "Упражнения по русскому языку", subject: "Русский язык", icon: "📖" },
  { id: 3, title: "Английский для начинающих", subject: "Английский язык", icon: "🌍" },
  { id: 4, title: "Подготовка к школе: полный курс", subject: "Дошкольная", icon: "🎒" },
];
const TOPICS = ["Математика","Чтение и письмо","Русский язык","Английский язык","Кыргызский язык","Окружающий мир","Подготовка к школе","Другое"];
const DAYS = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const TEACHER_COLORS = ["#3A8CC7","#5B9E6E","#8B6BB5","#D4845A","#4AADAD","#C45C8A","#6B8DD6","#B5804A"];

// 🐼 Panda Logo SVG
const PandaLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill={C.blue} />
    {/* Stars */}
    {[[15,35],[85,35],[20,65],[80,65],[50,85]].map(([x,y],i) => (
      <text key={i} x={x} y={y} fontSize="8" fill="white" textAnchor="middle">✦</text>
    ))}
    {/* Ears */}
    <circle cx="25" cy="35" r="12" fill={C.black} />
    <circle cx="75" cy="35" r="12" fill={C.black} />
    {/* Face */}
    <circle cx="50" cy="55" r="28" fill="#D6EDFB" />
    <circle cx="50" cy="55" r="28" stroke={C.black} strokeWidth="2.5" fill="#D6EDFB" />
    {/* Eyes */}
    <circle cx="40" cy="52" r="9" fill={C.black} />
    <circle cx="60" cy="52" r="9" fill={C.black} />
    <circle cx="42" cy="50" r="3" fill="white" />
    <circle cx="62" cy="50" r="3" fill="white" />
    {/* Nose */}
    <ellipse cx="50" cy="62" rx="4" ry="3" fill={C.black} />
    {/* Smile */}
    <path d="M44 67 Q50 72 56 67" stroke={C.black} strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Cap */}
    <rect x="30" y="26" width="40" height="5" rx="2" fill={C.blueDark} />
    <polygon points="50,10 70,26 30,26" fill={C.blueDark} />
    <circle cx="50" cy="10" r="3" fill={C.blueDark} />
    <line x1="50" y1="10" x2="68" y2="13" stroke={C.black} strokeWidth="1.5" />
  </svg>
);

// ── UI Components ──
const Av = ({ l, color, size = 40 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: size * 0.38, flexShrink: 0, boxShadow: `0 2px 8px ${color}55` }}>{l}</div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.card, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(107,184,232,0.12)", border: `1px solid ${C.border}`, ...style }}>{children}</div>
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
    transition: "all 0.15s",
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
      style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none", background: C.blueLight, transition: "border 0.15s" }}
      onFocus={e => e.target.style.borderColor = C.blue}
      onBlur={e => e.target.style.borderColor = C.border} />
  </div>
);

const FSelect = ({ label, value, onChange, options, required = false }) => (
  <div style={{ marginBottom: 13 }}>
    <Label>{label}{required && <span style={{ color: C.danger }}> *</span>}</Label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: C.blueLight }}>
      <option value="">— Выберите —</option>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
);

const Stars = ({ rating, onChange }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} onClick={() => onChange?.(n)}
        style={{ fontSize: 24, background: "none", border: "none", cursor: onChange ? "pointer" : "default", opacity: rating >= n ? 1 : 0.2, padding: 0, transition: "opacity 0.1s" }}>⭐</button>
    ))}
  </div>
);

function FileUpload({ label, files, onChange, required = false }) {
  const ref = useRef();
  const handleFiles = (e) => {
    const newFiles = Array.from(e.target.files).map(f => ({
      name: f.name, type: f.type, size: f.size,
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith("video/"),
    }));
    onChange([...files, ...newFiles]);
  };
  const remove = (i) => onChange(files.filter((_, idx) => idx !== i));
  return (
    <div style={{ marginBottom: 14 }}>
      <Label>{label}{required && <span style={{ color: C.danger }}> *</span>}</Label>
      <div onClick={() => ref.current.click()} style={{
        border: `2px dashed ${files.length > 0 ? C.success : required ? C.warning : C.border}`,
        borderRadius: 12, padding: 16, textAlign: "center", cursor: "pointer",
        background: files.length > 0 ? C.success + "08" : C.blueLight, transition: "all 0.2s",
      }}>
        <div style={{ fontSize: 30, marginBottom: 4 }}>{files.length > 0 ? "✅" : "📸"}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: files.length > 0 ? C.success : C.muted }}>
          {files.length > 0 ? `${files.length} файл(ов) прикреплено` : "Нажми — фото или видео с урока"}
        </div>
        {required && files.length === 0 && <div style={{ fontSize: 11, color: C.warning, marginTop: 3, fontWeight: 600 }}>⚠️ Обязательно для отправки</div>}
        <input ref={ref} type="file" accept="image/*,video/*" multiple onChange={handleFiles} style={{ display: "none" }} />
      </div>
      {files.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {files.map((f, i) => (
            <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
              {f.isVideo
                ? <div style={{ width: "100%", height: "100%", background: C.blue, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎥</div>
                : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />}
              <button onClick={() => remove(i)} style={{ position: "absolute", top: -5, right: -5, background: C.danger, border: "none", borderRadius: "50%", width: 20, height: 20, color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(58,140,199,0.25)", backdropFilter: "blur(4px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.card, borderRadius: 20, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", padding: 24, boxShadow: "0 20px 60px rgba(107,184,232,0.3)", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: C.blueLight, border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16, color: C.muted }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── SIDEBAR LAYOUT ──
function Layout({ user, tab, setTab, navItems, onLogout, children }) {
  const [sideOpen, setSideOpen] = useState(true);
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Nunito', 'Segoe UI', sans-serif", background: C.bg }}>
      {/* Sidebar */}
      <div style={{ width: sideOpen ? 220 : 64, background: C.white, flexShrink: 0, display: "flex", flexDirection: "column", transition: "width 0.2s", borderRight: `2px solid ${C.border}`, boxShadow: "2px 0 12px rgba(107,184,232,0.1)" }}>
        {/* Logo */}
        <div style={{ padding: sideOpen ? "20px 16px 16px" : "20px 8px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <PandaLogo size={40} />
          {sideOpen && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.blueDark, letterSpacing: "-0.5px" }}>Ak Bilim</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{user.role === "admin" ? "👑 Руководитель" : "👩‍🏫 Учитель"}</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 0" }}>
          {navItems.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: sideOpen ? "11px 16px" : "11px 0", justifyContent: sideOpen ? "flex-start" : "center",
              background: tab === n.key ? C.blueLight : "transparent",
              color: tab === n.key ? C.blueDark : C.muted,
              borderLeft: tab === n.key ? `3px solid ${C.blue}` : "3px solid transparent",
              border: "none", borderRight: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === n.key ? 800 : 500,
              borderRadius: tab === n.key ? "0 10px 10px 0" : 0,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>{n.icon}</span>
              {sideOpen && n.label}
            </button>
          ))}
        </nav>

        {/* User + toggle */}
        <div style={{ padding: sideOpen ? "12px 16px" : "12px 8px", borderTop: `1px solid ${C.border}` }}>
          {sideOpen && <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>🐼 {user.name}</div>}
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onLogout} style={{ flex: 1, background: C.blueLight, border: "none", borderRadius: 8, color: C.muted, cursor: "pointer", padding: "7px", fontSize: 12, fontWeight: 600 }}>
              {sideOpen ? "Выйти" : "↩"}
            </button>
            <button onClick={() => setSideOpen(!sideOpen)} style={{ background: C.blueLight, border: "none", borderRadius: 8, color: C.muted, cursor: "pointer", padding: "7px 10px", fontSize: 13 }}>
              {sideOpen ? "◀" : "▶"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>{children}</div>
    </div>
  );
}

// ── PAGE TITLE ──
const PageTitle = ({ emoji, title, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
    <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{emoji} {title}</div>
    {action}
  </div>
);

// ── STAT CARD ──
const StatCard = ({ icon, val, label, color }) => (
  <Card style={{ textAlign: "center", borderTop: `4px solid ${color}` }}>
    <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 20, fontWeight: 900, color }}>{val}</div>
    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
  </Card>
);

// ══════════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════════
function Login({ onLogin, allUsers }) {
  const [login, setLogin] = useState(""); const [pass, setPass] = useState("");
  const [show, setShow] = useState(false); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);

  const handle = () => {
    setErr(""); setLoading(true);
    setTimeout(() => {
      const u = allUsers.find(u => 
        (u.login === login.trim().toLowerCase() || u.login === login.trim() || u.phone === login.trim()) 
        && u.password === pass
      );
      if (u) onLogin(u); else { setErr("Неверный логин или пароль"); setLoading(false); }
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${C.blue} 0%, ${C.blueLight} 60%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      {/* Floating stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {["10% 20%","80% 15%","5% 70%","90% 60%","50% 5%","30% 85%","70% 80%"].map((pos, i) => (
          <div key={i} style={{ position: "absolute", left: pos.split(" ")[0], top: pos.split(" ")[1], fontSize: [16,20,14,18,12,22,15][i], opacity: 0.3, color: "#fff" }}>✦</div>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ background: C.white, borderRadius: "50%", padding: 6, boxShadow: "0 8px 32px rgba(107,184,232,0.4)" }}>
              <PandaLogo size={80} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.white, letterSpacing: -1, textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>AK BILIM</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4, fontWeight: 600 }}>Система управления центром</div>
        </div>

        {/* Form */}
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

          {err && (
            <div style={{ background: C.danger + "15", border: `1px solid ${C.danger}30`, borderRadius: 8, padding: "8px 12px", color: C.danger, fontSize: 13, fontWeight: 600, marginBottom: 10, textAlign: "center" }}>⚠️ {err}</div>
          )}

          <button onClick={handle} disabled={loading || !login || !pass} style={{
            width: "100%", padding: "13px", marginTop: 10, borderRadius: 12,
            background: (!login || !pass) ? C.blueMid : C.blue,
            color: "#fff", fontWeight: 900, fontSize: 16, border: "none",
            cursor: (!login || !pass) ? "not-allowed" : "pointer",
            boxShadow: (!login || !pass) ? "none" : `0 4px 16px ${C.blue}55`,
            transition: "all 0.2s",
          }}>{loading ? "🐼 Входим..." : "Войти →"}</button>

          <div style={{ marginTop: 18, padding: 14, background: C.blueLight, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 8 }}>🔑 АККАУНТЫ ДЛЯ ТЕСТА:</div>
            {allUsers.map((u, i) => (
              <div key={i} style={{ fontSize: 12, color: C.text, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                <span>{u.role === "admin" ? "👑" : "👩‍🏫"} {u.name?.split(" ")[0]}</span>
                <span style={{ color: C.blueDark, fontWeight: 700 }}>{u.login} / {u.password}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ADMIN APP
// ══════════════════════════════════════
function AdminApp({ user, onLogout, allReports, setAllReports, allTrials, students, setStudents, teachers, setTeachers }) {
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null); // null | { type, data } | "addTeacher" | "addStudent"
  const [notif, setNotif] = useState(null);
  const [newS, setNewS] = useState({ name: "", grade: "", address: "", days: [], time: "", teacherId: "", parentPhone: "" });
  const [newT, setNewT] = useState({ name: "", subject: "", phone: "", salary: "600", login: "", password: "" });
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'student'|'teacher', id, name }
  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3000); };

  const toggleDay = (day) => {
    setNewS(p => ({
      ...p,
      days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day]
    }));
  };

  const addStudent = () => {
    if (!newS.name || !newS.teacherId || newS.days.length === 0) return;
    setStudents(prev => [...prev, { ...newS, id: Date.now(), progress: 0, teacherId: Number(newS.teacherId) }]);
    setNewS({ name: "", grade: "", address: "", days: [], time: "", teacherId: "", parentPhone: "" });
    setModal(null); toast("🐼 Ученик добавлен!");
  };

  const addTeacher = () => {
    if (!newT.name || !newT.login || !newT.password) return;
    const color = TEACHER_COLORS[teachers.length % TEACHER_COLORS.length];
    setTeachers(prev => [...prev, { id: Date.now(), name: newT.name, subject: newT.subject, avatar: newT.name[0].toUpperCase(), color, role: "teacher", login: newT.login.toLowerCase().trim(), password: newT.password, phone: newT.phone, salary: Number(newT.salary) || 600 }]);
    setNewT({ name: "", subject: "", phone: "", salary: "600", login: "", password: "" });
    setModal(null); toast(`🎉 Педагог ${newT.name} добавлен!`);
  };

  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setConfirmDelete(null); toast("🗑️ Ученик удалён");
  };

  const deleteTeacher = (id) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    setStudents(prev => prev.filter(s => s.teacherId !== id));
    setConfirmDelete(null); toast("🗑️ Педагог удалён");
  };

  const income = 1400 * students.length;
  const toTeach = 600 * students.length;

  const nav = [
    { key: "home", icon: "🏠", label: "Главная" },
    { key: "teachers", icon: "👩‍🏫", label: "Учителя" },
    { key: "students", icon: "👦", label: "Ученики" },
    { key: "trials", icon: "🧪", label: "Пробные уроки" },
    { key: "reports", icon: "📋", label: "Отчёты" },
    { key: "finance", icon: "💰", label: "Финансы" },
    { key: "schedule", icon: "📅", label: "Расписание" },
    { key: "library", icon: "📚", label: "Книги" },
  ];

  return (
    <Layout user={user} tab={tab} setTab={setTab} navItems={nav} onLogout={onLogout}>
      {notif && <div style={{ position: "fixed", top: 18, right: 18, background: C.blue, color: "#fff", padding: "12px 22px", borderRadius: 12, fontWeight: 700, zIndex: 999, boxShadow: `0 4px 20px ${C.blue}55` }}>🐼 {notif}</div>}

      {/* HOME */}
      {tab === "home" && (
        <div>
          {/* Welcome banner */}
          <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`, borderRadius: 20, padding: "24px 24px", marginBottom: 22, display: "flex", alignItems: "center", gap: 20, boxShadow: `0 8px 32px ${C.blue}44` }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: 8 }}>
              <PandaLogo size={56} />
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>Панель руководителя</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>Привет, Айданек! 👑</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Всё под контролем</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
            <StatCard icon="👦" val={students.length} label="Учеников" color={C.blue} />
            <StatCard icon="👩‍🏫" val={teachers.length} label="Учителей" color="#5B9E6E" />
            <StatCard icon="📋" val={allReports.length} label="Отчётов" color="#8B6BB5" />
            <StatCard icon="💰" val={(income - toTeach).toLocaleString() + " с"} label="Прибыль" color={C.warning} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: C.text }}>📋 Последние отчёты</div>
              {allReports.length === 0
                ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>🐼 Отчётов пока нет</div>
                : allReports.slice(0, 4).map(r => (
                  <div key={r.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{r.teacherName}</div>
                      <Stars rating={r.rating} />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>👦 {r.studentName} · {r.topic}</div>
                    {r.files?.length > 0 && <Badge text={`📎 ${r.files.length} фото`} color={C.success} />}
                  </div>
                ))}
            </Card>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: C.text }}>🧪 Пробные уроки</div>
              {allTrials.length === 0
                ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>🐼 Пробных пока нет</div>
                : allTrials.slice(0, 4).map(t => (
                  <div key={t.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.childName}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{t.teacherName} · {t.date}</div>
                    <Badge text={t.recommend ? "✅ Рекомендуют" : "⏳ На рассмотрении"} color={t.recommend ? C.success : C.warning} />
                  </div>
                ))}
            </Card>
          </div>
        </div>
      )}

      {/* TEACHERS */}
      {tab === "teachers" && (
        <div>
          <PageTitle emoji="👩‍🏫" title="Все учителя" action={<Btn onClick={() => setModal("addTeacher")} color={C.blueDark}>+ Добавить педагога</Btn>} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {teachers.map(t => {
              const myS = students.filter(s => s.teacherId === t.id);
              const myR = allReports.filter(r => r.teacherId === t.id);
              return (
                <Card key={t.id} style={{ borderTop: `4px solid ${t.color}` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <Av l={t.avatar} color={t.color} size={46} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{t.subject}</div>
                    </div>
                    <button onClick={() => setConfirmDelete({ type: "teacher", id: t.id, name: t.name })}
                      style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    <Badge text={`${myS.length} учеников`} color={t.color} />
                    <Badge text={`${myR.length} отчётов`} color={C.blue} />
                    <Badge text={`${t.salary || 600} сом`} color={C.warning} />
                  </div>
                  {t.phone && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>📞 {t.phone}</div>}
                  <div style={{ fontSize: 12, background: C.blueLight, borderRadius: 8, padding: "6px 10px", color: C.blueDark, fontWeight: 600 }}>🔑 {t.login}</div>
                </Card>
              );
            })}
          </div>
          <Modal open={modal === "addTeacher"} onClose={() => setModal(null)} title="🐼 Новый педагог">
            <FInput label="ИМЯ ПЕДАГОГА" value={newT.name} onChange={v => setNewT(p => ({...p, name: v}))} placeholder="Иванова Айгуль" required />
            <FInput label="ПРЕДМЕТ" value={newT.subject} onChange={v => setNewT(p => ({...p, subject: v}))} placeholder="Математика" />
            <FInput label="ТЕЛЕФОН" value={newT.phone} onChange={v => setNewT(p => ({...p, phone: v}))} placeholder="+996 700 ..." />
            <FInput label="ЗАРПЛАТА (сом за урок)" value={newT.salary} onChange={v => setNewT(p => ({...p, salary: v}))} type="number" />
            <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 4, border: `2px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.blueDark, marginBottom: 10 }}>🔐 Данные для входа в систему</div>
              <FInput label="ЛОГИН" value={newT.login} onChange={v => setNewT(p => ({...p, login: v}))} placeholder="aigul" required />
              <FInput label="ПАРОЛЬ" value={newT.password} onChange={v => setNewT(p => ({...p, password: v}))} placeholder="минимум 6 символов" required />
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>💡 Передай логин и пароль педагогу лично</div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <Btn full onClick={addTeacher} color={C.blueDark} disabled={!newT.name || !newT.login || !newT.password}>Добавить педагога</Btn>
              <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
            </div>
          </Modal>
        </div>
      )}

      {/* STUDENTS */}
      {tab === "students" && (
        <div>
          <PageTitle emoji="👦" title="Все ученики" action={<Btn onClick={() => setModal("addStudent")} color={C.blue}>+ Добавить ученика</Btn>} />
          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {["Ученик","Класс","Учитель","Адрес","Дни занятий","Прогресс",""].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "9px 10px", fontSize: 11, color: C.muted, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const t = teachers.find(t => t.id === s.teacherId);
                  const daysArr = s.days || (s.day ? [s.day] : []);
                  return (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Av l={s.name[0]} color={t?.color || C.blue} size={30} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{s.parentPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 10, fontSize: 13 }}>{s.grade}</td>
                      <td style={{ padding: 10, fontSize: 13 }}>{t?.name}</td>
                      <td style={{ padding: 10, fontSize: 12, color: C.muted }}>{s.address}</td>
                      <td style={{ padding: 10 }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {daysArr.map(d => (
                            <span key={d} style={{ background: C.blueLight, color: C.blueDark, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>{d.slice(0,2)}</span>
                          ))}
                          {s.time && <span style={{ fontSize: 11, color: C.muted, alignSelf: "center" }}>{s.time}</span>}
                        </div>
                      </td>
                      <td style={{ padding: 10, minWidth: 100 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: s.progress >= 80 ? C.success : C.warning, marginBottom: 3 }}>{s.progress}%</div>
                        <div style={{ background: C.border, borderRadius: 99, height: 5 }}>
                          <div style={{ width: `${s.progress}%`, background: s.progress >= 80 ? C.success : C.warning, height: "100%", borderRadius: 99 }} />
                        </div>
                      </td>
                      <td style={{ padding: 10 }}>
                        <button onClick={() => setConfirmDelete({ type: "student", id: s.id, name: s.name })}
                          style={{ background: C.danger + "15", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14, color: C.danger }}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Confirm delete modal */}
          <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="⚠️ Подтверди удаление">
            <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Удалить «{confirmDelete?.name}»?</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                {confirmDelete?.type === "teacher"
                  ? "⚠️ Все ученики этого педагога тоже будут удалены!"
                  : "Это действие нельзя отменить."}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <Btn color={C.danger} onClick={() => confirmDelete?.type === "teacher" ? deleteTeacher(confirmDelete.id) : deleteStudent(confirmDelete.id)}>Да, удалить</Btn>
                <Btn outline color={C.muted} onClick={() => setConfirmDelete(null)}>Отмена</Btn>
              </div>
            </div>
          </Modal>

          <Modal open={modal === "addStudent"} onClose={() => setModal(null)} title="🐼 Новый ученик">
            <FInput label="ИМЯ УЧЕНИКА" value={newS.name} onChange={v => setNewS(p => ({...p, name: v}))} required />
            <FInput label="КЛАСС" value={newS.grade} onChange={v => setNewS(p => ({...p, grade: v}))} placeholder="3 класс" />
            <FInput label="АДРЕС" value={newS.address} onChange={v => setNewS(p => ({...p, address: v}))} />
            <FInput label="ТЕЛЕФОН РОДИТЕЛЯ" value={newS.parentPhone} onChange={v => setNewS(p => ({...p, parentPhone: v}))} />
            <FSelect label="УЧИТЕЛЬ" value={newS.teacherId} onChange={v => setNewS(p => ({...p, teacherId: v}))} options={teachers.map(t => ({ value: t.id, label: t.name }))} required />

            <div style={{ marginBottom: 14 }}>
              <Label>ДНИ ЗАНЯТИЙ <span style={{ color: C.danger }}>*</span> (можно несколько)</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DAYS.map(day => {
                  const selected = newS.days.includes(day);
                  return (
                    <button key={day} onClick={() => toggleDay(day)} style={{
                      padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      background: selected ? C.blue : C.blueLight,
                      color: selected ? "#fff" : C.muted,
                      border: `2px solid ${selected ? C.blue : C.border}`,
                      transition: "all 0.15s",
                    }}>{day.slice(0, 2)} {selected ? "✓" : ""}</button>
                  );
                })}
              </div>
              {newS.days.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: C.blueDark, fontWeight: 600 }}>
                  Выбрано: {newS.days.join(", ")}
                </div>
              )}
            </div>

            <FInput label="ВРЕМЯ" value={newS.time} onChange={v => setNewS(p => ({...p, time: v}))} placeholder="14:00" />
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Btn full onClick={addStudent} color={C.blue} disabled={!newS.name || !newS.teacherId || newS.days.length === 0}>Добавить</Btn>
              <Btn outline color={C.muted} onClick={() => setModal(null)}>Отмена</Btn>
            </div>
          </Modal>
        </div>
      )}

      {/* TRIALS */}
      {tab === "trials" && (
        <div>
          <PageTitle emoji="🧪" title="Пробные уроки" />
          {allTrials.length === 0
            ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40, fontSize: 14 }}>🐼 Пробных уроков пока нет</div></Card>
            : allTrials.map(t => (
              <Card key={t.id} style={{ marginBottom: 12, cursor: "pointer" }}
                onClick={() => setModal({ type: "trialDetail", data: t })}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${C.blue}33`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{t.childName}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>👩‍🏫 {t.teacherName} · {t.date}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge text={t.recommend ? "✅ Рекомендуют" : "⏳ На рассмотрении"} color={t.recommend ? C.success : C.warning} />
                    <span style={{ fontSize: 12, color: C.blue, fontWeight: 700 }}>Открыть →</span>
                  </div>
                </div>
                {t.files?.length > 0 && <div style={{ marginTop: 8 }}><Badge text={`📎 ${t.files.length} фото/видео`} color={C.blue} /></div>}
              </Card>
            ))}
        </div>
      )}

      {/* REPORTS */}
      {tab === "reports" && (
        <div>
          <PageTitle emoji="📋" title="Все отчёты учителей" />
          {allReports.length === 0
            ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 40 }}>🐼 Отчётов пока нет</div></Card>
            : allReports.map(r => (
              <Card key={r.id} style={{ marginBottom: 12, cursor: "pointer", transition: "box-shadow 0.15s" }}
                onClick={() => setModal({ type: "reportDetail", data: r })}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${C.blue}33`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Av l={r.teacherAvatar} color={r.teacherColor} size={36} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{r.teacherName}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{r.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Stars rating={r.rating} />
                    <span style={{ fontSize: 12, color: C.blue, fontWeight: 700 }}>Открыть →</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>👦 <b>{r.studentName}</b> · 📚 {r.topic}</div>
                {r.files?.length > 0 && <Badge text={`📎 ${r.files.length} фото/видео`} color={C.success} />}
                {r.paymentReceived && <span style={{ marginLeft: 6 }}><Badge text={`💰 ${r.paymentAmount} сом`} color={C.success} /></span>}
              </Card>
            ))}
        </div>
      )}

      {/* FINANCE */}
      {tab === "finance" && (
        <div>
          <PageTitle emoji="💰" title="Финансы" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
            <StatCard icon="📥" val={income.toLocaleString() + " с"} label="Общий доход" color={C.success} />
            <StatCard icon="👩‍🏫" val={toTeach.toLocaleString() + " с"} label="Учителям" color={C.blue} />
            <StatCard icon="📈" val={(income - toTeach).toLocaleString() + " с"} label="Прибыль" color={C.warning} />
          </div>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Оплаты из отчётов</div>
            {allReports.filter(r => r.paymentReceived).length === 0
              ? <div style={{ color: C.muted, fontSize: 13 }}>Оплат пока нет</div>
              : allReports.filter(r => r.paymentReceived).map(r => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.studentName}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{r.teacherName} · {r.date}</div>
                  </div>
                  <Badge text={r.paymentAmount + " сом"} color={C.success} />
                </div>
              ))}
          </Card>
        </div>
      )}

      {/* SCHEDULE */}
      {tab === "schedule" && (
        <div>
          <PageTitle emoji="📅" title="Полное расписание" />
          {DAYS.map(day => {
            const items = students.filter(s => (s.days || [s.day]).includes(day)).map(s => ({ ...s, teacher: teachers.find(t => t.id === s.teacherId) }));
            return (
              <Card key={day} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: items.length ? C.blueDark : C.muted, marginBottom: items.length ? 10 : 0 }}>{day}</div>
                {items.length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>Занятий нет</div>
                  : items.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ background: C.blue, color: "#fff", fontWeight: 800, fontSize: 12, padding: "5px 10px", borderRadius: 8 }}>{s.time}</div>
                      <Av l={s.teacher?.avatar || "?"} color={s.teacher?.color || C.blue} size={28} />
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

      {/* LIBRARY */}
      {tab === "library" && (
        <div>
          <PageTitle emoji="📚" title="Книги и материалы" />
          {BOOKS.map(b => (
            <Card key={b.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>{b.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{b.subject}</div>
              </div>
              <Btn small color={C.blue}>Открыть</Btn>
            </Card>
          ))}
        </div>
      )}
      {/* REPORT DETAIL MODAL */}
      <Modal open={modal?.type === "reportDetail"} onClose={() => setModal(null)} title="📋 Отчёт об уроке">
        {modal?.data && (() => { const r = modal.data; return (
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, background: C.blueLight, borderRadius: 12, padding: 14 }}>
              <Av l={r.teacherAvatar} color={r.teacherColor} size={44} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{r.teacherName}</div>
                <div style={{ fontSize: 12, color: C.muted }}>📅 {r.date}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ background: C.blueLight, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>УЧЕНИК</div>
                <div style={{ fontWeight: 700 }}>{r.studentName}</div>
              </div>
              <div style={{ background: C.blueLight, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>ТЕМА</div>
                <div style={{ fontWeight: 700 }}>{r.topic}</div>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>ОЦЕНКА УРОКА</div>
              <Stars rating={r.rating} />
            </div>
            {r.notes && (
              <div style={{ marginBottom: 12, background: C.blueLight, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>КАК ПРОШЁЛ УРОК</div>
                <div style={{ fontSize: 14 }}>{r.notes}</div>
              </div>
            )}
            {r.homework && (
              <div style={{ marginBottom: 12, background: C.blueLight, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>ДОМАШНЕЕ ЗАДАНИЕ</div>
                <div style={{ fontSize: 14 }}>{r.homework}</div>
              </div>
            )}
            {r.paymentReceived && (
              <div style={{ marginBottom: 12, background: C.success + "15", borderRadius: 10, padding: 12, border: `1px solid ${C.success}30` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.success, marginBottom: 4 }}>ОПЛАТА ПОЛУЧЕНА</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.success }}>{r.paymentAmount} сом</div>
              </div>
            )}
            {r.files?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10 }}>ФОТО И ВИДЕО С УРОКА ({r.files.length})</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {r.files.map((f, i) => (
                    <div key={i} style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {f.isVideo
                        ? <div style={{ textAlign: "center" }}><div style={{ fontSize: 32 }}>🎥</div><div style={{ fontSize: 10, color: "#fff", marginTop: 4 }}>{f.name}</div></div>
                        : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ); })()}
      </Modal>

      {/* TRIAL DETAIL MODAL */}
      <Modal open={modal?.type === "trialDetail"} onClose={() => setModal(null)} title="🧪 Пробный урок">
        {modal?.data && (() => { const t = modal.data; return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{t.childName}</div>
                <div style={{ fontSize: 12, color: C.muted }}>👩‍🏫 {t.teacherName} · {t.date}</div>
              </div>
              <Badge text={t.recommend ? "✅ Берём!" : "⏳ На рассмотрении"} color={t.recommend ? C.success : C.warning} />
            </div>
            <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.blueDark, marginBottom: 10 }}>👶 Данные ребёнка</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Возраст", t.childAge + " лет"], ["Класс", t.childGrade], ["Уровень", t.childLevel]].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{k}</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{v}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>РЕЗУЛЬТАТ ТЕСТА</div>
                  <Stars rating={t.testScore} />
                </div>
              </div>
            </div>
            <div style={{ background: C.success + "10", borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid ${C.success}20` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#2d7a4f", marginBottom: 10 }}>👨‍👩‍👧 Анкета родителя</div>
              {[["Имя", t.parentName], ["Телефон", t.parentPhone], ["Цель обучения", t.parentGoal]].map(([k,v]) => v && (
                <div key={k} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{k.toUpperCase()}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
                </div>
              ))}
            </div>
            {t.teacherNotes && (
              <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>ЗАМЕТКИ ПЕДАГОГА</div>
                <div style={{ fontSize: 14 }}>{t.teacherNotes}</div>
              </div>
            )}
            {t.files?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10 }}>ФОТО И ВИДЕО ({t.files.length})</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {t.files.map((f, i) => (
                    <div key={i} style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {f.isVideo
                        ? <div style={{ textAlign: "center" }}><div style={{ fontSize: 32 }}>🎥</div></div>
                        : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ); })()}
      </Modal>

    </Layout>
  );
}
// ══════════════════════════════════════
function TeacherApp({ user, onLogout, onReport, onTrial, students }) {
  const [tab, setTab] = useState("home");
  const [myReports, setMyReports] = useState([]);
  const [notif, setNotif] = useState(null);
  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3000); };
  const myStudents = students.filter(s => s.teacherId === user.id);

  const [rf, setRf] = useState({ studentId: "", topic: "", topicCustom: "", notes: "", homework: "", rating: 5, paymentReceived: false, paymentAmount: 1400, files: [] });
  const [rfErr, setRfErr] = useState("");
  const [tf, setTf] = useState({ childName: "", childAge: "", childGrade: "", childLevel: "Начальный", parentName: "", parentPhone: "", parentGoal: "", teacherNotes: "", testScore: 3, recommend: false, files: [] });
  const [tfErr, setTfErr] = useState("");

  const submitReport = () => {
    if (!rf.studentId) { setRfErr("Выберите ученика"); return; }
    if (!rf.topic) { setRfErr("Укажите тему"); return; }
    if (rf.files.length === 0) { setRfErr("📸 Прикрепите фото или видео с урока — обязательно!"); return; }
    setRfErr("");
    const s = myStudents.find(s => s.id === Number(rf.studentId));
    const r = { id: Date.now(), teacherId: user.id, teacherName: user.name, teacherAvatar: user.avatar, teacherColor: user.color, studentId: Number(rf.studentId), studentName: s?.name, topic: rf.topic === "Другое" ? rf.topicCustom || "Другое" : rf.topic, notes: rf.notes, homework: rf.homework, rating: rf.rating, date: new Date().toLocaleDateString("ru-RU"), paymentReceived: rf.paymentReceived, paymentAmount: rf.paymentReceived ? Number(rf.paymentAmount) : 0, files: rf.files };
    setMyReports(p => [r, ...p]);
    onReport(r);
    setRf({ studentId: "", topic: "", topicCustom: "", notes: "", homework: "", rating: 5, paymentReceived: false, paymentAmount: 1400, files: [] });
    toast("✅ Отчёт отправлен Айданек!");
    setTab("home");
  };

  const submitTrial = () => {
    if (!tf.childName || !tf.parentName) { setTfErr("Заполните имя ребёнка и родителя"); return; }
    if (tf.files.length === 0) { setTfErr("📸 Прикрепите фото или видео с пробного урока!"); return; }
    setTfErr("");
    onTrial({ ...tf, id: Date.now(), teacherId: user.id, teacherName: user.name, date: new Date().toLocaleDateString("ru-RU") });
    setTf({ childName: "", childAge: "", childGrade: "", childLevel: "Начальный", parentName: "", parentPhone: "", parentGoal: "", teacherNotes: "", testScore: 3, recommend: false, files: [] });
    toast("🧪 Данные пробного урока отправлены!");
    setTab("home");
  };

  const totalPay = myReports.filter(r => r.paymentReceived).reduce((s, r) => s + r.paymentAmount, 0);
  const avgRating = myReports.length ? (myReports.reduce((s, r) => s + r.rating, 0) / myReports.length).toFixed(1) : "—";

  const nav = [
    { key: "home", icon: "🏠", label: "Главная" },
    { key: "report", icon: "📋", label: "Отчёт" },
    { key: "trial", icon: "🧪", label: "Пробный урок" },
    { key: "students", icon: "👦", label: "Ученики" },
    { key: "schedule", icon: "📅", label: "Расписание" },
    { key: "results", icon: "📊", label: "Итоги" },
    { key: "library", icon: "📚", label: "Книги" },
    { key: "history", icon: "🕐", label: "История" },
  ];

  return (
    <Layout user={user} tab={tab} setTab={setTab} navItems={nav} onLogout={onLogout}>
      {notif && <div style={{ position: "fixed", top: 18, right: 18, background: user.color, color: "#fff", padding: "12px 22px", borderRadius: 12, fontWeight: 700, zIndex: 999, boxShadow: `0 4px 20px ${user.color}55` }}>{notif}</div>}

      {/* HOME */}
      {tab === "home" && (
        <div>
          <div style={{ background: `linear-gradient(135deg, ${user.color} 0%, ${user.color}cc 100%)`, borderRadius: 20, padding: "20px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, boxShadow: `0 6px 24px ${user.color}44` }}>
            <Av l={user.avatar} color="rgba(255,255,255,0.2)" size={52} />
            <div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Кабинет учителя</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>{user.name}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{user.subject}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
            <StatCard icon="📋" val={myReports.length} label="Отчётов" color={user.color} />
            <StatCard icon="⭐" val={avgRating} label="Оценка" color={C.warning} />
            <StatCard icon="💰" val={totalPay + "с"} label="Принято" color={C.success} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div onClick={() => setTab("report")} style={{ background: user.color, borderRadius: 16, padding: 18, cursor: "pointer", boxShadow: `0 4px 16px ${user.color}44` }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>📋</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Отчёт об уроке</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>С обязательным фото</div>
            </div>
            <div onClick={() => setTab("trial")} style={{ background: C.blue, borderRadius: 16, padding: 18, cursor: "pointer", boxShadow: `0 4px 16px ${C.blue}44` }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>🧪</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Пробный урок</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>Анкета + тест + фото</div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT */}
      {tab === "report" && (
        <Card style={{ maxWidth: 520 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: C.text, marginBottom: 4 }}>📋 Отчёт об уроке</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Фото/видео обязательны!</div>
          <FSelect label="УЧЕНИК" value={rf.studentId} onChange={v => setRf(p => ({...p, studentId: v}))} options={myStudents.map(s => ({ value: s.id, label: s.name }))} required />
          <FSelect label="ТЕМА УРОКА" value={rf.topic} onChange={v => setRf(p => ({...p, topic: v}))} options={TOPICS} required />
          {rf.topic === "Другое" && <FInput label="СВОЯ ТЕМА" value={rf.topicCustom} onChange={v => setRf(p => ({...p, topicCustom: v}))} />}
          <div style={{ marginBottom: 13 }}>
            <Label>КАК ПРОШЁЛ УРОК?</Label>
            <textarea value={rf.notes} onChange={e => setRf(p => ({...p, notes: e.target.value}))} rows={3} placeholder="Что получилось? Что было сложно?"
              style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: C.blueLight }} />
          </div>
          <div style={{ marginBottom: 13 }}>
            <Label>ДОМАШНЕЕ ЗАДАНИЕ</Label>
            <textarea value={rf.homework} onChange={e => setRf(p => ({...p, homework: e.target.value}))} rows={2} placeholder="Что задали?"
              style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: C.blueLight }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <Label>ОЦЕНКА УРОКА</Label>
            <Stars rating={rf.rating} onChange={v => setRf(p => ({...p, rating: v}))} />
          </div>
          <FileUpload label="ФОТО И ВИДЕО С УРОКА" files={rf.files} onChange={f => setRf(p => ({...p, files: f}))} required />
          <div style={{ marginBottom: 16, background: rf.paymentReceived ? C.success + "10" : C.blueLight, borderRadius: 10, padding: 12, border: `1.5px solid ${rf.paymentReceived ? C.success : C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: rf.paymentReceived ? 10 : 0 }}>
              <input type="checkbox" id="pay" checked={rf.paymentReceived} onChange={e => setRf(p => ({...p, paymentReceived: e.target.checked}))} style={{ width: 17, height: 17 }} />
              <label htmlFor="pay" style={{ fontWeight: 700, fontSize: 14, cursor: "pointer" }}>💰 Получила оплату от родителя</label>
            </div>
            {rf.paymentReceived && (
              <>
                <Label>СУММА (сом)</Label>
                <input type="number" value={rf.paymentAmount} onChange={e => setRf(p => ({...p, paymentAmount: e.target.value}))}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: C.white }} />
                <div style={{ fontSize: 11, color: C.success, marginTop: 5, fontWeight: 600 }}>✓ Айданек увидит эту оплату</div>
              </>
            )}
          </div>
          {rfErr && <div style={{ color: C.danger, fontWeight: 600, fontSize: 13, marginBottom: 12, padding: "8px 12px", background: C.danger + "10", borderRadius: 8 }}>⚠️ {rfErr}</div>}
          <Btn full onClick={submitReport} color={user.color}>📤 Отправить отчёт</Btn>
          <div style={{ marginTop: 8 }}><Btn full outline color={C.muted} onClick={() => setTab("home")}>Отмена</Btn></div>
        </Card>
      )}

      {/* TRIAL */}
      {tab === "trial" && (
        <Card style={{ maxWidth: 520 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: C.text, marginBottom: 4 }}>🧪 Пробный урок</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Заполни анкету после пробного занятия</div>
          <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 14, borderLeft: `4px solid ${C.blue}` }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.blueDark, marginBottom: 10 }}>👶 Данные ребёнка</div>
            <FInput label="ИМЯ РЕБЁНКА" value={tf.childName} onChange={v => setTf(p => ({...p, childName: v}))} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FInput label="ВОЗРАСТ" value={tf.childAge} onChange={v => setTf(p => ({...p, childAge: v}))} placeholder="7" />
              <FInput label="КЛАСС" value={tf.childGrade} onChange={v => setTf(p => ({...p, childGrade: v}))} placeholder="1 класс" />
            </div>
            <FSelect label="УРОВЕНЬ ЗНАНИЙ" value={tf.childLevel} onChange={v => setTf(p => ({...p, childLevel: v}))} options={["Начальный","Средний","Выше среднего","Высокий"]} />
            <div style={{ marginBottom: 8 }}>
              <Label>РЕЗУЛЬТАТ ТЕСТА</Label>
              <Stars rating={tf.testScore} onChange={v => setTf(p => ({...p, testScore: v}))} />
            </div>
          </div>
          <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, marginBottom: 14, borderLeft: `4px solid ${C.success}` }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#2d7a4f", marginBottom: 10 }}>👨‍👩‍👧 Анкета родителя</div>
            <FInput label="ИМЯ РОДИТЕЛЯ" value={tf.parentName} onChange={v => setTf(p => ({...p, parentName: v}))} required />
            <FInput label="ТЕЛЕФОН" value={tf.parentPhone} onChange={v => setTf(p => ({...p, parentPhone: v}))} placeholder="+996 700 ..." />
            <div style={{ marginBottom: 8 }}>
              <Label>ЦЕЛЬ ОБУЧЕНИЯ</Label>
              <textarea value={tf.parentGoal} onChange={e => setTf(p => ({...p, parentGoal: e.target.value}))} rows={2} placeholder="Чего хотят от занятий?"
                style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontFamily: "inherit", resize: "none", boxSizing: "border-box", background: C.white }} />
            </div>
          </div>
          <div style={{ marginBottom: 13 }}>
            <Label>МОИ ЗАМЕТКИ О РЕБЁНКЕ</Label>
            <textarea value={tf.teacherNotes} onChange={e => setTf(p => ({...p, teacherNotes: e.target.value}))} rows={3} placeholder="Как прошёл урок? Что заметила?"
              style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: C.blueLight }} />
          </div>
          <FileUpload label="ФОТО И ВИДЕО С ПРОБНОГО УРОКА" files={tf.files} onChange={f => setTf(p => ({...p, files: f}))} required />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: tf.recommend ? C.success + "12" : C.blueLight, borderRadius: 10, marginBottom: 14, border: `1.5px solid ${tf.recommend ? C.success : C.border}` }}>
            <input type="checkbox" id="rec" checked={tf.recommend} onChange={e => setTf(p => ({...p, recommend: e.target.checked}))} style={{ width: 17, height: 17 }} />
            <label htmlFor="rec" style={{ fontWeight: 700, fontSize: 14, cursor: "pointer" }}>✅ Рекомендую взять этого ребёнка</label>
          </div>
          {tfErr && <div style={{ color: C.danger, fontWeight: 600, fontSize: 13, marginBottom: 12, padding: "8px 12px", background: C.danger + "10", borderRadius: 8 }}>⚠️ {tfErr}</div>}
          <Btn full onClick={submitTrial} color={C.blue}>📤 Отправить данные пробного урока</Btn>
          <div style={{ marginTop: 8 }}><Btn full outline color={C.muted} onClick={() => setTab("home")}>Отмена</Btn></div>
        </Card>
      )}

      {/* STUDENTS */}
      {tab === "students" && (
        <div>
          <PageTitle emoji="👦" title="Мои ученики" />
          {myStudents.map(s => (
            <Card key={s.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                <Av l={s.name[0]} color={user.color} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.grade}</div>
                </div>
                <Badge text={s.progress + "%"} color={s.progress >= 80 ? C.success : C.warning} />
              </div>
              <div style={{ background: C.border, borderRadius: 99, height: 6, marginBottom: 8 }}>
                <div style={{ width: `${s.progress}%`, background: user.color, height: "100%", borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>📍 {s.address} · 📅 {(s.days || [s.day]).join(", ")} {s.time}</div>
            </Card>
          ))}
        </div>
      )}

      {/* SCHEDULE */}
      {tab === "schedule" && (
        <div>
          <PageTitle emoji="📅" title="Моё расписание" />
          {DAYS.map(day => {
            const items = myStudents.filter(s => (s.days || [s.day]).includes(day));
            return (
              <Card key={day} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: items.length ? user.color : C.muted, marginBottom: items.length ? 10 : 0 }}>{day}</div>
                {items.length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>Занятий нет</div>
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

      {/* RESULTS */}
      {tab === "results" && (
        <div>
          <PageTitle emoji="📊" title="Мои итоги" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <StatCard icon="📋" val={myReports.length} label="Уроков" color={user.color} />
            <StatCard icon="⭐" val={avgRating} label="Ср. оценка" color={C.warning} />
            <StatCard icon="💰" val={totalPay + " сом"} label="Принято" color={C.success} />
            <StatCard icon="👦" val={myStudents.length} label="Учеников" color={C.blue} />
          </div>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>По каждому ученику</div>
            {myStudents.map(s => {
              const sR = myReports.filter(r => r.studentId === s.id);
              const sPay = sR.filter(r => r.paymentReceived).reduce((sum, r) => sum + r.paymentAmount, 0);
              return (
                <div key={s.id} style={{ padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={{ color: C.success, fontWeight: 800 }}>{sPay} сом</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 5 }}>{sR.length} уроков · {s.grade}</div>
                  <div style={{ background: C.border, borderRadius: 99, height: 5 }}>
                    <div style={{ width: `${Math.min(sR.length * 10, 100)}%`, background: user.color, height: "100%", borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* LIBRARY */}
      {tab === "library" && (
        <div>
          <PageTitle emoji="📚" title="Книги и материалы" />
          {BOOKS.map(b => (
            <Card key={b.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>{b.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{b.subject}</div>
              </div>
              <Btn small color={C.blue}>Открыть</Btn>
            </Card>
          ))}
        </div>
      )}

      {/* HISTORY */}
      {tab === "history" && (
        <div>
          <PageTitle emoji="🕐" title="История отчётов" />
          {myReports.length === 0
            ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 24 }}>🐼 Отчётов пока нет</div></Card>
            : myReports.map(r => (
              <Card key={r.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{r.studentName}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{r.date}</div>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>📚 {r.topic}</div>
                {r.notes && <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>💬 {r.notes}</div>}
                {r.files?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {r.files.map((f, i) => (
                      <div key={i} style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {f.isVideo ? <span style={{ fontSize: 20 }}>🎥</span> : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                    ))}
                  </div>
                )}
                {r.paymentReceived && <div style={{ marginTop: 8 }}><Badge text={`💰 ${r.paymentAmount} сом`} color={C.success} /></div>}
              </Card>
            ))}
        </div>
      )}
    </Layout>
  );
}

// ══════════════════════════════════════
// ROOT
// ══════════════════════════════════════
// КАБИНЕТ РОДИТЕЛЯ
// ══════════════════════════════════════
const INITIAL_PARENTS = [
  { id: 1, login: "+996700000001", phone: "+996700000001", password: "test123", name: "Айгуль Сейткали", studentId: 1, role: "parent" },
];

const TEST_REPORTS = [
  { id: 101, teacherId: 1, teacherName: "Айгуль Бекова", teacherAvatar: "А", teacherColor: "#3A8CC7", studentId: 1, studentName: "Алина Сейткали", topic: "Математика", notes: "Алина отлично справилась с дробями! Очень старательная девочка.", homework: "Стр. 45, задания 1-5", rating: 5, date: "01.05.2025", paymentReceived: true, paymentAmount: 1400, files: [] },
  { id: 102, teacherId: 1, teacherName: "Айгуль Бекова", teacherAvatar: "А", teacherColor: "#3A8CC7", studentId: 1, studentName: "Алина Сейткали", topic: "Русский язык", notes: "Работали над правописанием. Есть прогресс!", homework: "Написать сочинение на тему 'Моя семья'", rating: 4, date: "28.04.2025", paymentReceived: true, paymentAmount: 1400, files: [] },
  { id: 103, teacherId: 1, teacherName: "Айгуль Бекова", teacherAvatar: "А", teacherColor: "#3A8CC7", studentId: 1, studentName: "Алина Сейткали", topic: "Чтение и письмо", notes: "Читает хорошо, скорость чтения улучшилась. Молодец!", homework: "Прочитать рассказ стр. 30-35", rating: 5, date: "25.04.2025", paymentReceived: false, paymentAmount: 0, files: [] },
];

function ParentApp({ user, onLogout, students, reports, teachers }) {
  const [tab, setTab] = useState("home");
  const [sideOpen, setSideOpen] = useState(true);
  const student = students.find(s => s.id === user.studentId);
  const teacher = teachers.find(t => t.id === student?.teacherId);
  const allReports = [...TEST_REPORTS, ...reports.filter(r => r.studentId === user.studentId)];
  const myReports = allReports;
  const lessonCount = myReports.length;
  const totalPaid = myReports.filter(r => r.paymentReceived).reduce((s,r) => s + r.paymentAmount, 0);
  const avgRating = myReports.length ? (myReports.reduce((s,r) => s+r.rating, 0)/myReports.length).toFixed(1) : "—";

  const nav = [
    { key: "home", icon: "🏠", label: "Главная" },
    { key: "reports", icon: "📋", label: "Отчёты" },
    { key: "schedule", icon: "📅", label: "Расписание" },
    { key: "progress", icon: "📈", label: "Прогресс" },
    { key: "payments", icon: "💰", label: "Оплаты" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Nunito','Segoe UI',sans-serif", background: C.bg }}>

      {/* Боковая панель */}
      <div style={{ width: sideOpen ? 220 : 64, background: C.white, flexShrink: 0, display: "flex", flexDirection: "column", transition: "width 0.2s", borderRight: `2px solid ${C.border}`, boxShadow: "2px 0 12px rgba(107,184,232,0.1)" }}>

        {/* Лого */}
        <div style={{ padding: sideOpen ? "20px 16px 16px" : "20px 8px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <PandaLogo size={40} />
          {sideOpen && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.blueDark }}>Ak Bilim</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>👨‍👩‍👧 Кабинет родителя</div>
            </div>
          )}
        </div>

        {/* Ученик */}
        {sideOpen && student && (
          <div style={{ padding: "12px 16px", background: C.blueLight, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 4 }}>МОЙ РЕБЁНОК</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{student.name}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{student.grade}</div>
          </div>
        )}

        {/* Навигация */}
        <nav style={{ flex: 1, padding: "10px 0" }}>
          {nav.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: sideOpen ? "11px 16px" : "11px 0", justifyContent: sideOpen ? "flex-start" : "center",
              background: tab === n.key ? C.blueLight : "transparent",
              color: tab === n.key ? C.blueDark : C.muted,
              borderLeft: tab === n.key ? `3px solid ${C.blue}` : "3px solid transparent",
              border: "none", borderRight: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === n.key ? 800 : 500,
            }}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>{n.icon}</span>
              {sideOpen && n.label}
            </button>
          ))}
        </nav>

        {/* Выход */}
        <div style={{ padding: sideOpen ? "12px 16px" : "12px 8px", borderTop: `1px solid ${C.border}` }}>
          {sideOpen && <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>👤 {user.name}</div>}
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onLogout} style={{ flex: 1, background: C.blueLight, border: "none", borderRadius: 8, color: C.muted, cursor: "pointer", padding: "7px", fontSize: 12, fontWeight: 600 }}>
              {sideOpen ? "Выйти" : "↩"}
            </button>
            <button onClick={() => setSideOpen(!sideOpen)} style={{ background: C.blueLight, border: "none", borderRadius: 8, color: C.muted, cursor: "pointer", padding: "7px 10px", fontSize: 13 }}>
              {sideOpen ? "◀" : "▶"}
            </button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

        {/* HOME */}
        {tab === "home" && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 4 }}>Добро пожаловать! 👋</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Следите за успехами вашего ребёнка</div>

            {/* Статистика */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { icon: "📋", val: lessonCount, label: "Уроков", color: C.blue },
                { icon: "⭐", val: avgRating, label: "Ср. оценка", color: C.warning },
                { icon: "💰", val: totalPaid.toLocaleString() + " с", label: "Оплачено", color: C.success },
              ].map((c,i) => (
                <Card key={i} style={{ textAlign: "center", borderTop: `4px solid ${c.color}` }}>
                  <div style={{ fontSize: 26 }}>{c.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: c.color, marginTop: 4 }}>{c.val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.label}</div>
                </Card>
              ))}
            </div>

            {/* Инфо об ученике */}
            {student && (
              <Card style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: teacher?.color || C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 22 }}>
                    {student.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{student.name}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{student.grade}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>👩‍🏫 {teacher?.name} · {teacher?.subject}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(student.days || []).map(d => (
                    <span key={d} style={{ background: C.blueDark, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{d}</span>
                  ))}
                  <span style={{ background: C.blueLight, color: C.blueDark, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>🕐 {student.time}</span>
                </div>
              </Card>
            )}

            {/* Последний отчёт */}
            {myReports.length > 0 && (
              <Card>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>📋 Последний отчёт</div>
                {(() => { const r = myReports[0]; return (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.topic}</div>
                      <div>{[1,2,3,4,5].map(n => <span key={n} style={{ opacity: r.rating >= n ? 1 : 0.2, fontSize: 18 }}>⭐</span>)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>📅 {r.date}</div>
                    {r.notes && <div style={{ fontSize: 14, color: C.text, marginBottom: 8, background: C.blueLight, borderRadius: 10, padding: 12 }}>💬 {r.notes}</div>}
                    {r.homework && <div style={{ fontSize: 13, background: "#FFF9F0", borderRadius: 10, padding: 12, border: `1px solid ${C.warning}30` }}>📝 <b>Д/З:</b> {r.homework}</div>}
                  </div>
                ); })()}
              </Card>
            )}
          </div>
        )}

        {/* ОТЧЁТЫ */}
        {tab === "reports" && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 20 }}>📋 Все отчёты об уроках</div>
            {myReports.map((r, idx) => (
              <Card key={r.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>Урок №{myReports.length - idx}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>📅 {r.date} · 👩‍🏫 {r.teacherName}</div>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map(n => <span key={n} style={{ opacity: r.rating >= n ? 1 : 0.2, fontSize: 20 }}>⭐</span>)}</div>
                </div>

                <div style={{ background: C.blueLight, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>ТЕМА УРОКА</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>📚 {r.topic}</div>
                </div>

                {r.notes && (
                  <div style={{ background: C.blueLight, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>КАК ПРОШЁЛ УРОК</div>
                    <div style={{ fontSize: 14 }}>💬 {r.notes}</div>
                  </div>
                )}

                {r.homework && (
                  <div style={{ background: "#FFF9F0", borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${C.warning}30` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.warning, marginBottom: 4 }}>ДОМАШНЕЕ ЗАДАНИЕ</div>
                    <div style={{ fontSize: 14 }}>📝 {r.homework}</div>
                  </div>
                )}

                {r.files?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>ФОТО И ВИДЕО С УРОКА</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {r.files.map((f,i) => (
                        <div key={i} style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {f.isVideo ? <span style={{ fontSize: 28 }}>🎥</span> : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {r.paymentReceived && (
                  <div style={{ marginTop: 10 }}>
                    <span style={{ background: C.success+"18", color: C.success, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: `1px solid ${C.success}30` }}>
                      💰 Оплачено: {r.paymentAmount} сом
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* РАСПИСАНИЕ */}
        {tab === "schedule" && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 20 }}>📅 Расписание занятий</div>
            {student && (
              <Card>
                <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 16 }}>{student.name} · {student.grade}</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10 }}>ДНИ ЗАНЯТИЙ</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {(student.days || []).map(d => (
                      <div key={d} style={{ background: C.blueDark, color: "#fff", fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 12 }}>{d}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { icon: "🕐", label: "Время", val: student.time },
                    { icon: "📍", label: "Адрес", val: student.address },
                    { icon: "👩‍🏫", label: "Педагог", val: teacher?.name },
                    { icon: "📚", label: "Предмет", val: teacher?.subject },
                  ].map((item,i) => (
                    <div key={i} style={{ background: C.blueLight, borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 6 }}>{item.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{item.icon} {item.val}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ПРОГРЕСС */}
        {tab === "progress" && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 20 }}>📈 Прогресс</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[
                { icon: "📋", val: lessonCount, label: "Всего уроков", color: C.blue },
                { icon: "⭐", val: avgRating, label: "Средняя оценка", color: C.warning },
              ].map((c,i) => (
                <Card key={i} style={{ textAlign: "center", borderTop: `4px solid ${c.color}` }}>
                  <div style={{ fontSize: 28 }}>{c.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: c.color, marginTop: 4 }}>{c.val}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{c.label}</div>
                </Card>
              ))}
            </div>

            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Пройдено уроков</div>
              <div style={{ background: C.border, borderRadius: 99, height: 14, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: `${Math.min(lessonCount * 8, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, ${C.blueDark})`, borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>{lessonCount} уроков пройдено</div>
            </Card>

            <Card>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Оценки по урокам</div>
              {myReports.map((r, idx) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Урок №{myReports.length - idx} — {r.topic}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{r.date}</div>
                  </div>
                  <div>{[1,2,3,4,5].map(n => <span key={n} style={{ opacity: r.rating >= n ? 1 : 0.2, fontSize: 18 }}>⭐</span>)}</div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ОПЛАТЫ */}
        {tab === "payments" && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 20 }}>💰 История оплат</div>
            <Card style={{ marginBottom: 16, borderTop: `4px solid ${C.success}`, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: C.success }}>{totalPaid.toLocaleString()} сом</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Всего оплачено</div>
            </Card>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Детали оплат</div>
              {myReports.filter(r => r.paymentReceived).length === 0
                ? <div style={{ color: C.muted, textAlign: "center", padding: 20 }}>Оплат пока нет</div>
                : myReports.filter(r => r.paymentReceived).map((r, idx) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.topic}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>📅 {r.date} · 👩‍🏫 {r.teacherName}</div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: C.success }}>{r.paymentAmount} сом</div>
                  </div>
                ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function _OldCode() { const nav = []; const tab = ""; const user = {}; const student = null; const teacher = null; const myReports = []; return (<div>

      <div style={{ padding: "0 16px 100px", marginTop: -36 }}>

        {/* HOME */}
        {tab === "home" && (
          <div>
            {/* Карточка ребёнка */}
            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: teacher?.color || C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 22 }}>
                  {student?.name[0] || "?"}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 17 }}>{student?.name}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{student?.grade}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>👩‍🏫 {teacher?.name} · {teacher?.subject}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { icon: "📋", val: lessonCount, label: "Уроков" },
                  { icon: "⭐", val: myReports.length ? (myReports.reduce((s,r) => s+r.rating, 0)/myReports.length).toFixed(1) : "—", label: "Оценка" },
                  { icon: "💰", val: myReports.filter(r=>r.paymentReceived).reduce((s,r)=>s+r.paymentAmount,0) + "с", label: "Оплачено" },
                ].map((c,i) => (
                  <div key={i} style={{ background: C.blueLight, borderRadius: 10, padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: 20 }}>{c.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: C.blueDark }}>{c.val}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Последний отчёт */}
            {myReports.length > 0 && (
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>📋 Последний отчёт</div>
                {(() => { const r = myReports[0]; return (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontWeight: 700 }}>{r.topic}</div>
                      <div>{[1,2,3,4,5].map(n => <span key={n} style={{ opacity: r.rating >= n ? 1 : 0.2 }}>⭐</span>)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>📅 {r.date}</div>
                    {r.notes && <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>💬 {r.notes}</div>}
                    {r.homework && <div style={{ fontSize: 13, background: C.blueLight, borderRadius: 8, padding: "6px 10px" }}>📝 Д/З: {r.homework}</div>}
                    {r.files?.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                        {r.files.map((f,i) => (
                          <div key={i} style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {f.isVideo ? <span style={{ fontSize: 20 }}>🎥</span> : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ); })()}
              </Card>
            )}

            {/* Расписание */}
            {student && (
              <Card>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>📅 Расписание</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {(student.days || []).map(d => (
                    <span key={d} style={{ background: C.blueDark, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{d}</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: C.muted }}>🕐 {student.time} · 📍 {student.address}</div>
              </Card>
            )}
          </div>
        )}

        {/* ОТЧЁТЫ */}
        {tab === "reports" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px", color: C.text }}>📋 Все отчёты</div>
            {myReports.length === 0
              ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 24 }}>🐼 Отчётов пока нет</div></Card>
              : myReports.map((r, idx) => (
                <Card key={r.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>Урок №{myReports.length - idx}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>📅 {r.date}</div>
                    </div>
                    <div>{[1,2,3,4,5].map(n => <span key={n} style={{ opacity: r.rating >= n ? 1 : 0.2 }}>⭐</span>)}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>📚 {r.topic}</div>
                  {r.notes && <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>💬 {r.notes}</div>}
                  {r.homework && (
                    <div style={{ background: C.blueLight, borderRadius: 8, padding: "8px 10px", marginBottom: 8, fontSize: 13 }}>
                      📝 <b>Д/З:</b> {r.homework}
                    </div>
                  )}
                  {r.files?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>ФОТО И ВИДЕО</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {r.files.map((f,i) => (
                          <div key={i} style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {f.isVideo ? <span style={{ fontSize: 24 }}>🎥</span> : <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.paymentReceived && <div style={{ marginTop: 8 }}><span style={{ background: C.success+"18", color: C.success, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>💰 {r.paymentAmount} сом оплачено</span></div>}
                </Card>
              ))}
          </div>
        )}

        {/* РАСПИСАНИЕ */}
        {tab === "schedule" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px", color: C.text }}>📅 Расписание</div>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>{student?.name}</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>ДНИ ЗАНЯТИЙ</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(student?.days || []).map(d => (
                    <span key={d} style={{ background: C.blueDark, color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 20 }}>{d}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: "🕐", label: "Время", val: student?.time },
                  { icon: "📍", label: "Адрес", val: student?.address },
                  { icon: "👩‍🏫", label: "Педагог", val: teacher?.name },
                  { icon: "📚", label: "Предмет", val: teacher?.subject },
                ].map((item,i) => (
                  <div key={i} style={{ background: C.blueLight, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{item.icon} {item.val}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ПРОГРЕСС */}
        {tab === "progress" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px", color: C.text }}>📈 Прогресс</div>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Количество уроков</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: C.blueDark, textAlign: "center", marginBottom: 8 }}>{lessonCount}</div>
              <div style={{ fontSize: 14, color: C.muted, textAlign: "center", marginBottom: 16 }}>уроков пройдено</div>
              <div style={{ background: C.border, borderRadius: 99, height: 12, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(lessonCount * 8, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, ${C.blueDark})`, borderRadius: 99, transition: "width 0.5s" }} />
              </div>
            </Card>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Оценки по урокам</div>
              {myReports.length === 0
                ? <div style={{ color: C.muted, textAlign: "center", padding: 20 }}>Уроков пока нет</div>
                : myReports.map((r, idx) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Урок №{myReports.length - idx}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{r.topic} · {r.date}</div>
                    </div>
                    <div>{[1,2,3,4,5].map(n => <span key={n} style={{ opacity: r.rating >= n ? 1 : 0.2, fontSize: 16 }}>⭐</span>)}</div>
                  </div>
                ))}
            </Card>
          </div>
        )}

        {/* ОПЛАТЫ */}
        {tab === "payments" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px", color: C.text }}>💰 История оплат</div>
            <Card style={{ marginBottom: 14, borderTop: `4px solid ${C.success}`, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: C.success }}>
                {myReports.filter(r=>r.paymentReceived).reduce((s,r)=>s+r.paymentAmount,0).toLocaleString()} сом
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Всего оплачено</div>
            </Card>
            {myReports.filter(r=>r.paymentReceived).length === 0
              ? <Card><div style={{ color: C.muted, textAlign: "center", padding: 24 }}>Оплат пока нет</div></Card>
              : myReports.filter(r=>r.paymentReceived).map(r => (
                <Card key={r.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.topic}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>📅 {r.date}</div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: C.success }}>{r.paymentAmount} сом</div>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 12px", boxShadow: "0 -4px 20px rgba(107,184,232,0.1)" }}>
        {nav.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: tab === n.key ? C.blueDark : C.muted }}>{n.label}</span>
            {tab === n.key && <div style={{ width: 16, height: 2, background: C.blue, borderRadius: 99 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [allTrials, setAllTrials] = useState([]);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [parents] = useState(INITIAL_PARENTS);
  const allUsers = [ADMIN, ...teachers, ...parents];

  if (!user) return <Login onLogin={setUser} allUsers={allUsers} />;
  if (user.role === "admin") return (
    <AdminApp user={user} onLogout={() => setUser(null)} allReports={allReports} setAllReports={setAllReports} allTrials={allTrials} students={students} setStudents={setStudents} teachers={teachers} setTeachers={setTeachers} />
  );
  if (user.role === "parent") return (
    <ParentApp user={user} onLogout={() => setUser(null)} students={students} reports={allReports} teachers={teachers} />
  );
  const freshUser = teachers.find(t => t.id === user.id) || user;
  return (
    <TeacherApp user={freshUser} onLogout={() => setUser(null)} onReport={r => setAllReports(p => [r, ...p])} onTrial={t => setAllTrials(p => [t, ...p])} students={students} />
  );
}