if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(err => console.log("SW error:", err));
  });
}

import { useState, useEffect, useRef } from "react";

// ==================== SUPABASE CONFIG ==================== 

const SUPABASE_URL = "https://mmqtzrgydvvmegrigmqv.supabase.co";
const SUPABASE_KEY = "sb_publishable_GePae-2UxxZ-2ESQCekjsQ_8Pm18c8W";

async function supabase(table, method = "GET", body = null, filter = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}${filter}`;
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" ? "return=representation" : "return=minimal",
  };
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Supabase error:", err);
      return null;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : true;
  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
}

// ==================== MOCK DATA (fallback) ====================
const MOCK_CATEGORIES = [
  { id: 1, name: "الطوارئ والإسعاف" },
  { id: 2, name: "المشافي والعيادات" },
  { id: 3, name: "الصيدليات" },
  { id: 4, name: "خدمات البلدية" },
];

const MOCK_CONTACTS = [
  { id: 1, name: "إسعاف المدينة", phone: "110", category_id: 1 },
  { id: 2, name: "الإطفاء", phone: "113", category_id: 1 },
  { id: 3, name: "مشفى بنش العام", phone: "0934111222", category_id: 2 },
  { id: 4, name: "عيادة الأمل", phone: "0911333444", category_id: 2 },
  { id: 5, name: "صيدلية الشفاء", phone: "0921555666", category_id: 3 },
  { id: 6, name: "بلدية بنش", phone: "0941777888", category_id: 4 },
];

const MOCK_TICKER = "🔴 خبر عاجل: اجتماع المجلس المحلي غداً الساعة العاشرة صباحاً في مقر البلدية • انقطاع الكهرباء في حي الزيتون حتى الساعة الثالثة عصراً • افتتاح مركز الصحة الجديد في حي النور";

// ==================== ICONS ====================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    phone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.22 3a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    copy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    bolt: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    contacts: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    news: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    obituary: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 2a5 5 0 00-5 5c0 3 5 9 5 9s5-6 5-9a5 5 0 00-5-5z"/><circle cx="12" cy="7" r="1.5" fill={color}/></svg>,
    lost: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
    ads: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    links: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    transport: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
    admin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
    chevronUp: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
    mosque: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="2" x2="12" y2="5"/><path d="M10 5 Q12 3 14 5"/><path d="M6 10 Q12 6 18 10"/><rect x="4" y="10" width="16" height="10"/><rect x="9" y="14" width="6" height="6"/><line x1="4" y1="10" x2="4" y2="7"/><line x1="4" y1="7" x2="6" y2="7"/><line x1="20" y1="10" x2="20" y2="7"/><line x1="20" y1="7" x2="18" y2="7"/></svg>,
    city: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="10" width="4" height="11"/><rect x="10" y="6" width="4" height="15"/><rect x="17" y="3" width="4" height="18"/><line x1="1" y1="21" x2="23" y2="21"/></svg>,
  };
  return icons[name] || null;
};

// ==================== TICKER ====================
function NewsTicker({ text, isAdmin, onEdit }) {
  return (
    <div style={{
      background: "#c0392b",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      height: "36px",
      position: "relative",
    }}>
      <div style={{
        background: "#922b21",
        padding: "0 14px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        fontFamily: "'Cairo', sans-serif",
        fontWeight: "700",
        fontSize: "12px",
        whiteSpace: "nowrap",
        zIndex: 2,
        flexShrink: 0,
      }}>
        عاجل
      </div>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100vw); }
          }
          .ticker-text {
            display: inline-block;
            white-space: nowrap;
            animation: ticker 30s linear infinite;
            font-family: 'Cairo', sans-serif;
            font-size: 13px;
          }
        `}</style>
        <span className="ticker-text">{text}</span>
      </div>
      {isAdmin && (
        <button onClick={onEdit} style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          color: "#fff",
          padding: "4px 8px",
          cursor: "pointer",
          flexShrink: 0,
          marginLeft: "8px",
        }}>
          <Icon name="edit" size={14} />
        </button>
      )}
    </div>
  );
}

// ==================== ELECTRICITY STATUS ====================
function ElectricityStatus({ status, isAdmin, onToggle, timer }) {
  const isOn = status === "on";
  return (
    <div style={{
      margin: "12px 16px",
      background: isOn ? "linear-gradient(135deg, #1a5276, #2980b9)" : "linear-gradient(135deg, #4a4a4a, #2c2c2c)",
      borderRadius: "14px",
      padding: "14px 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: isOn ? "0 4px 20px rgba(41,128,185,0.4)" : "0 4px 20px rgba(0,0,0,0.3)",
      transition: "all 0.5s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: isOn ? "rgba(255,214,0,0.2)" : "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isOn ? "0 0 20px rgba(255,214,0,0.6)" : "none",
          transition: "all 0.5s ease",
        }}>
          <Icon name="bolt" size={22} color={isOn ? "#FFD600" : "#888"} />
        </div>
        <div>
          <div style={{ color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: "700", fontSize: "15px" }}>
            حالة الكهرباء
          </div>
          <div style={{
            color: isOn ? "#7fc8f8" : "#aaa",
            fontFamily: "'Cairo', sans-serif",
            fontSize: "12px",
            marginTop: "2px",
          }}>
           {isOn ? "✅ الكهرباء متوفرة حالياً" : "❌ الكهرباء مقطوعة حالياً"}
{timer && <div style={{ fontSize: "11px", color: isOn ? "#aed6f1" : "#888", marginTop: "2px" }}>{timer}</div>}
          </div>
        </div>
      </div>
      {(isAdmin) && (
  <button onClick={onToggle} style={{
          background: isOn ? "#e74c3c" : "#27ae60",
          border: "none",
          color: "#fff",
          borderRadius: "8px",
          padding: "8px 14px",
          cursor: "pointer",
          fontFamily: "'Cairo', sans-serif",
          fontSize: "12px",
          fontWeight: "700",
        }}>
          {isOn ? "قطع" : "تشغيل"}
        </button>
      )}
    </div>
  );
}

// ==================== HOME GRID BUTTONS ====================
const SECTIONS = [
  { id: "contacts", label: "جهات الاتصال", icon: "contacts", color: "#2980b9", bg: "#ebf5fb" },
  { id: "news", label: "الأخبار", icon: "news", color: "#8e44ad", bg: "#f5eef8" },
  { id: "obituary", label: "الوفيات", icon: "obituary", color: "#2c3e50", bg: "#eaecee" },
  { id: "lost", label: "المفقودات", icon: "lost", color: "#d35400", bg: "#fdf2e9" },
  { id: "ads", label: "الإعلانات", icon: "ads", color: "#27ae60", bg: "#eafaf1" },
  { id: "links", label: "روابط مهمة", icon: "links", color: "#c0392b", bg: "#fdedec" },
  { id: "transport", label: "التوصيل", icon: "transport", color: "#1a5276", bg: "#eaf2ff" },
  { id: "mosques", label: "المساجد", icon: "mosque", color: "#1a8a4a", bg: "#eafaf1" },
  { id: "cityservices", label: "خدمات المدينة", icon: "city", color: "#7d3c98", bg: "#f5eef8" },
];

function HomeGrid({ onNavigate }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
      padding: "16px",
    }}>
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onNavigate(s.id)}
          style={{
            background: s.bg,
            border: `2px solid ${s.color}22`,
            borderRadius: "16px",
            padding: "18px 8px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.2s ease",
            animation: `fadeInUp 0.4s ease ${i * 0.07}s both`,
          }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          onTouchStart={e => e.currentTarget.style.transform = "scale(0.95)"}
          onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: `${s.color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Icon name={s.icon} size={24} color={s.color} />
          </div>
          <span style={{
            fontFamily: "'Cairo', sans-serif",
            fontSize: "12px",
            fontWeight: "700",
            color: "#2c3e50",
            textAlign: "center",
            lineHeight: "1.3",
          }}>{s.label}</span>
        </button>
      ))}
    </div>
  );
}

// ==================== CONTACTS PAGE ====================
// ==================== CONTACTS PAGE ====================
function ContactsPage({ isAdmin }) {
  const [categories, setCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState({});
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addingContact, setAddingContact] = useState(null);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });


  // ✅ الإصلاح: فتح القوائم تلقائياً عند البحث
  useEffect(() => {
    if (search.trim()) {
      const newOpen = {};
      categories.forEach(cat => {
        const hasMatch = contacts.some(c =>
          c.category_id === cat.id &&
          (c.name.includes(search) || c.phone.includes(search))
        );
        if (hasMatch) newOpen[cat.id] = true;
      });
      setOpenCats(newOpen);
    }
  }, [search, contacts, categories]);
  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const cachedCats = getCache("categories");
    const cachedCons = getCache("contacts");
    if (cachedCats && cachedCons) {
      setCategories(cachedCats);
      setContacts(cachedCons);
      setLoading(false);
      return;
    }
    const cats = await supabase("categories", "GET", null, "?order=id");
    const cons = await supabase("contacts", "GET", null, "");
    if (cats && cats.length > 0) {
      setCategories(cats);
      setContacts(cons || []);
      setCache("categories", cats);
      setCache("contacts", cons || []);
    } else {
      setCategories(MOCK_CATEGORIES);
      setContacts(MOCK_CONTACTS);
    }
    setLoading(false);
  }

  const copyNumber = (phone, id) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(id);
      setToast(phone);
      setTimeout(() => {
        setCopied(null);
        setToast(null);
      }, 2000);
    });
  };

  const toggleCat = (id) => setOpenCats(p => ({ ...p, [id]: !p[id] }));

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const res = await supabase("categories", "POST", { name: newCatName });
    if (res) loadData();
    else setCategories(p => [...p, { id: Date.now(), name: newCatName }]);
    setNewCatName("");
    setShowAddCat(false);
  };

  const deleteCategory = async (id) => {
    if (!confirm("حذف القائمة بالكامل؟")) return;
    await supabase("contacts", "DELETE", null, `?category_id=eq.${id}`);
    await supabase("categories", "DELETE", null, `?id=eq.${id}`);
    loadData();
  };

  const addContact = async (catId) => {
    if (!newContact.name || !newContact.phone) return;
    const res = await supabase("contacts", "POST", { name: newContact.name, phone: newContact.phone, category_id: catId });
    if (res) loadData();
    else setContacts(p => [...p, { id: Date.now(), name: newContact.name, phone: newContact.phone, category_id: catId }]);
    setNewContact({ name: "", phone: "" });
    setAddingContact(null);
  };

  const deleteContact = async (id) => {
    if (!confirm("حذف جهة الاتصال؟")) return;
    await supabase("contacts", "DELETE", null, `?id=eq.${id}`);
    loadData();
  };

  const filtered = contacts.filter(c =>
    c.name.includes(search) || c.phone.includes(search)
  );

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      {toast && (
  <div style={{
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#27ae60",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "30px",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "700",
    fontSize: "14px",
    zIndex: 9999,
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    animation: "fadeInUp 0.3s ease",
    whiteSpace: "nowrap",
  }}>
    ✅ تم نسخ الرقم: {toast}
  </div>
)}
      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 ابحث عن اسم أو رقم..."
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "2px solid #e8e8e8",
            fontFamily: "'Cairo', sans-serif",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            background: "#f8f9fa",
          }}
        />
      </div>

      {isAdmin && (
        <button
          onClick={() => setShowAddCat(true)}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #2980b9, #1a5276)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontFamily: "'Cairo', sans-serif",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Icon name="plus" size={18} /> إضافة قائمة جديدة
        </button>
      )}

      {showAddCat && (
        <div style={{
          background: "#ebf5fb",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "14px",
          border: "2px solid #aed6f1",
        }}>
          <input
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="اسم القائمة الجديدة"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #aed6f1",
              fontFamily: "'Cairo', sans-serif",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addCategory} style={{ flex: 1, padding: "10px", background: "#2980b9", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", cursor: "pointer", fontWeight: "700" }}>حفظ</button>
            <button onClick={() => setShowAddCat(false)} style={{ flex: 1, padding: "10px", background: "#e8e8e8", color: "#555", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div>
      ) : (
        categories.map(cat => {
          const catContacts = filtered.filter(c => c.category_id === cat.id);
          const isOpen = openCats[cat.id];
          return (
            <div key={cat.id} style={{ marginBottom: "10px", borderRadius: "14px", overflow: "hidden", border: "1.5px solid #e8e8e8", background: "#fff" }}>
              <div
                onClick={() => toggleCat(cat.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  cursor: "pointer",
                  background: isOpen ? "#ebf5fb" : "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "700", fontSize: "14px", color: "#2c3e50" }}>{cat.name}</span>
                  <span style={{ background: "#2980b9", color: "#fff", borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: "700" }}>
                    {catContacts.length}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {isAdmin && (
                    <>
                      <button onClick={e => { e.stopPropagation(); setAddingContact(cat.id); }} style={{ background: "#eafaf1", border: "none", borderRadius: "8px", padding: "5px 8px", cursor: "pointer" }}>
                        <Icon name="plus" size={14} color="#27ae60" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteCategory(cat.id); }} style={{ background: "#fdedec", border: "none", borderRadius: "8px", padding: "5px 8px", cursor: "pointer" }}>
                        <Icon name="trash" size={14} color="#c0392b" />
                      </button>
                    </>
                  )}
                  <Icon name={isOpen ? "chevronUp" : "chevronDown"} size={18} color="#888" />
                </div>
              </div>

              {isOpen && (
                <div>
                  {addingContact === cat.id && (
                    <div style={{ padding: "12px 16px", background: "#f0faf5", borderTop: "1px solid #e8e8e8" }}>
                      <input
                        value={newContact.name}
                        onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))}
                        placeholder="الاسم"
                        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ddd", fontFamily: "'Cairo', sans-serif", marginBottom: "6px", boxSizing: "border-box" }}
                      />
                      <input
                        value={newContact.phone}
                        onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))}
                        placeholder="رقم الهاتف"
                        type="tel"
                        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ddd", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => addContact(cat.id)} style={{ flex: 1, padding: "8px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", cursor: "pointer", fontWeight: "700" }}>حفظ</button>
                        <button onClick={() => { setAddingContact(null); setNewContact({ name: "", phone: "" }); }} style={{ flex: 1, padding: "8px", background: "#e8e8e8", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>إلغاء</button>
                      </div>
                    </div>
                  )}
                  {catContacts.length === 0 ? (
                    <div style={{ padding: "16px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>لا توجد جهات اتصال</div>
                  ) : (
                    catContacts.map(c => (
                      <div key={c.id} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderTop: "1px solid #f0f0f0",
                      }}>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "13px", color: "#2c3e50" }}>{c.name}</div>
                          <div style={{ fontSize: "13px", color: "#2980b9", marginTop: "2px", direction: "ltr", textAlign: "right" }}>{c.phone}</div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            onClick={() => copyNumber(c.phone, c.id)}
                            style={{
                              background: copied === c.id ? "#eafaf1" : "#f8f9fa",
                              border: "1.5px solid " + (copied === c.id ? "#27ae60" : "#e8e8e8"),
                              borderRadius: "8px",
                              padding: "7px 8px",
                              cursor: "pointer",
                              transition: "all 0.3s",
                            }}
                            title="نسخ الرقم"
                          >
                            <Icon name={copied === c.id ? "check" : "copy"} size={15} color={copied === c.id ? "#27ae60" : "#555"} />
                          </button>
                          <a href={`tel:${c.phone}`} style={{
                            background: "#ebf5fb",
                            border: "1.5px solid #aed6f1",
                            borderRadius: "8px",
                            padding: "7px 8px",
                            display: "flex",
                            alignItems: "center",
                            textDecoration: "none",
                          }}>
                            <Icon name="phone" size={15} color="#2980b9" />
                          </a>
                          {isAdmin && (
                            <button onClick={() => deleteContact(c.id)} style={{ background: "#fdedec", border: "1.5px solid #f5b7b1", borderRadius: "8px", padding: "7px 8px", cursor: "pointer" }}>
                              <Icon name="trash" size={15} color="#c0392b" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
async function sendNotification(title, body, section) {
  await supabase("notifications", "POST", { title, body, section });
  await cleanOldNotifications();
}
// ==================== NEWS PAGE ====================
function NewsPage({ isAdmin, adminRole }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", image_url: "" });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { loadNews(); }, []);

  async function loadNews() {
    setLoading(true);
    const cached = getCache("news");
    if (cached) {
      setNews(cached);
      setLoading(false);
      return;
    }
    const data = await supabase("news", "GET", null, "?order=created_at.desc");
    setNews(data || []);
    if (data) setCache("news", data);
    setLoading(false);
  }

  async function addNews() {
    if (!form.title.trim()) return;
    
    // حفظ الخبر في قاعدة البيانات
    await supabase("news", "POST", { 
      title: form.title, 
      content: form.content, 
      image_url: form.image_url 
    });
    
    // ✅ إضافة ميزة إرسال إشعار للمستخدمين
    const sendNotif = window.confirm(`هل تريد إرسال إشعار للمستخدمين بخصوص: "${form.title}"؟`);
    if (sendNotif) {
      // استدعاء دالة الإرسال التي أضفناها سابقاً
      await sendNotification(
        `📰 خبر جديد: ${form.title}`, 
        form.content?.substring(0, 80) + "...", // نأخذ أول 80 حرف فقط من الخبر
        "news"
      );
    }
    
    // إعادة تصفير النموذج وإغلاقه
    setForm({ title: "", content: "", image_url: "" });
    setShowForm(false);
    clearCache("news");
    loadNews();
  }

  async function deleteNews(id) {
    if (!confirm("حذف الخبر؟")) return;
    await supabase("news", "DELETE", null, `?id=eq.${id}`);
    clearCache("news");
    loadNews();
  }

  const formatDate = (d) => new Date(d).toLocaleDateString("ar-SY", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      {isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{
          width: "100%", padding: "12px", background: "linear-gradient(135deg, #8e44ad, #6c3483)",
          color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
          fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <Icon name="plus" size={18} /> {showForm ? "إلغاء" : "إضافة خبر جديد"}
        </button>
      )}

      {showForm && (
        <div style={{ background: "#f5eef8", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #d2b4de" }}>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="عنوان الخبر *" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d2b4de", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            placeholder="تفاصيل الخبر" rows={4} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d2b4de", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", resize: "none", boxSizing: "border-box" }} />
          <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
            placeholder="رابط الصورة (اختياري)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d2b4de", fontFamily: "'Cairo', sans-serif", marginBottom: "10px", boxSizing: "border-box" }} />
          <button onClick={addNews} style={{ width: "100%", padding: "12px", background: "#8e44ad", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>نشر الخبر</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div>
      ) : news.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>لا توجد أخبار حالياً</div>
      ) : (
        news.map(item => (
          <div key={item.id} style={{ background: "#fff", borderRadius: "14px", marginBottom: "12px", overflow: "hidden", border: "1.5px solid #f0f0f0", animation: "fadeInUp 0.3s ease" }}>
            {item.image_url && (
              <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "160px", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            )}
            <div style={{ padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: "800", fontSize: "15px", color: "#2c3e50", flex: 1, lineHeight: "1.4" }}>{item.title}</div>
                {isAdmin && adminRole === "super" && (
  <button onClick={() => deleteNews(item.id)} style={{ background: "#fdedec", border: "none", borderRadius: "8px", padding: "5px 7px", cursor: "pointer", marginRight: "8px", flexShrink: 0 }}>
    <Icon name="trash" size={14} color="#c0392b" />
  </button>
)}
              </div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "6px" }}>{formatDate(item.created_at)}</div>
              {item.content && (
                <>
                  <div style={{ fontSize: "13px", color: "#555", marginTop: "8px", lineHeight: "1.7",
                    display: expanded === item.id ? "block" : "-webkit-box",
                    WebkitLineClamp: expanded === item.id ? "unset" : 3,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{item.content}</div>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`📰 ${item.title}\n\n${item.content || ""}\n\n🏙️ دليل بنش`)}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#25D366", color: "#fff", borderRadius: "8px", padding: "7px 12px", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontSize: "12px", fontWeight: "700", marginTop: "8px", marginBottom: "4px" }}><span>📤</span> مشاركة على واتساب</a>
                  
                  {item.content.length > 100 && (
                    <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      style={{ background: "none", border: "none", color: "#8e44ad", fontFamily: "'Cairo', sans-serif", fontSize: "12px", cursor: "pointer", padding: "4px 0", fontWeight: "700" }}>
                      {expanded === item.id ? "▲ أقل" : "▼ اقرأ المزيد"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ==================== OBITUARY PAGE ====================
function ObituaryPage({ isAdmin, adminRole }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", death_date: "", funeral_time: "", condolence_place: "", image_url: "" });

  useEffect(() => { loadRecords(); }, []);

  async function loadRecords() {
    setLoading(true);
    const cached = getCache("obituaries");
    if (cached) {
      setRecords(cached);
      setLoading(false);
      return;
    }
    const data = await supabase("obituaries", "GET", null, "?order=created_at.desc");
    setRecords(data || []);
    if (data) setCache("obituaries", data);
    setLoading(false);
  }

  async function addRecord() {
    if (!form.name.trim()) return;
    const res = await supabase("obituaries", "POST", {
      name: form.name,
      death_date: form.death_date || null,
      funeral_time: form.funeral_time,
      condolence_place: form.condolence_place,
      image_url: form.image_url
    });

    if (res) {
      // الكود الذي طلبت إضافة للصقه هنا
      const sendNotif = window.confirm(`هل تريد إرسال إشعار بوفاة: "${form.name}"؟`);
      if (sendNotif) {
        if (typeof sendNotification === "function") {
          await sendNotification(
            `ببالغ الأسى: وفاة ${form.name}`,
            `إنا لله وإنا إليه راجعون. الصلاة والدفن: ${form.funeral_time || ""}`,
            "obituary"
          );
        } else {
          console.log("دالة sendNotification غير معرفة بعد");
        }
      }
    }

    setForm({ name: "", death_date: "", funeral_time: "", condolence_place: "", image_url: "" });
    clearCache("obituaries");
    loadRecords();
  }

  async function deleteRecord(id) {
    if (!confirm("حذف السجل؟")) return;
    await supabase("obituaries", "DELETE", null, `?id=eq.${id}`);
    clearCache("obituaries");
    loadRecords();
  }

  const formatDate= (d) => d ? new Date(d).toLocaleDateString("ar-SY", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #2c3e50, #4a4a4a)", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontSize: "13px", opacity: 0.85, lineHeight: "1.8" }}>
          إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
        </div>
      </div>

      {isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{
          width: "100%", padding: "12px", background: "linear-gradient(135deg, #2c3e50, #4a4a4a)",
          color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
          fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <Icon name="plus" size={18} /> {showForm ? "إلغاء" : "إضافة سجل وفاة"}
        </button>
      )}

      {showForm && (
        <div style={{ background: "#eaecee", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #bdc3c7" }}>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="اسم المتوفى *" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bdc3c7", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.death_date} onChange={e => setForm(p => ({ ...p, death_date: e.target.value }))}
            type="date" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bdc3c7", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.funeral_time} onChange={e => setForm(p => ({ ...p, funeral_time: e.target.value }))}
            placeholder="موعد الدفن (مثال: بعد صلاة العصر)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bdc3c7", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.condolence_place} onChange={e => setForm(p => ({ ...p, condolence_place: e.target.value }))}
            placeholder="مكان التعزية" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bdc3c7", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
            placeholder="رابط الصورة (اختياري)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bdc3c7", fontFamily: "'Cairo', sans-serif", marginBottom: "10px", boxSizing: "border-box" }} />
          <button onClick={addRecord} style={{ width: "100%", padding: "12px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>حفظ</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>لا توجد سجلات</div>
      ) : (
        records.map(r => (
          <div key={r.id} style={{ background: "#fff", borderRadius: "14px", marginBottom: "12px", overflow: "hidden", border: "2px solid #eaecee", animation: "fadeInUp 0.3s ease" }}>
            <div style={{ background: "linear-gradient(135deg, #2c3e50, #4a4a4a)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {r.image_url ? (
                  <img src={r.image_url} alt={r.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} onError={e => e.target.style.display = "none"} />
                ) : (
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🕊️</div>
                )}
                <div>
                  <div style={{ color: "#fff", fontWeight: "800", fontSize: "15px" }}>{r.name}</div>
                  {r.death_date && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", marginTop: "2px" }}>{formatDate(r.death_date)}</div>}
                </div>
              </div>
              {isAdmin && adminRole === "super" && (
  <button onClick={() => deleteRecord(r.id)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px 8px", cursor: "pointer" }}>
    <Icon name="trash" size={14} color="#fff" />
  </button>
)}
            </div>
            <div style={{ padding: "12px 16px" }}>
            {r.funeral_time && (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
    <span style={{ fontSize: "14px" }}>🕐</span>
    <span style={{ fontSize: "13px", color: "#555" }}>موعد الدفن: <strong>{r.funeral_time}</strong></span>
  </div>
)}
{r.condolence_place && (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
    <span style={{ fontSize: "14px" }}>📍</span>
    <span style={{ fontSize: "13px", color: "#555" }}>مكان التعزية: <strong>{r.condolence_place}</strong></span>
  </div>
)}
<a href={`https://wa.me/?text=${encodeURIComponent(`🕊️ إنا لله وإنا إليه راجعون\n\nانتقل إلى رحمة الله: ${r.name}\n${r.funeral_time ? `موعد الدفن: ${r.funeral_time}\n` : ""}${r.condolence_place ? `مكان التعزية: ${r.condolence_place}` : ""}\n\n🏙️ دليل بنش`)}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#25D366", color: "#fff", borderRadius: "8px", padding: "7px 12px", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontSize: "12px", fontWeight: "700", marginTop: "8px" }}>
  <span>📤</span> مشاركة على واتساب
</a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ==================== COMING SOON ====================
function ComingSoon({ title, icon, color }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 20px",
      gap: "16px",
      fontFamily: "'Cairo', sans-serif",
    }}>
      <div style={{
        width: "80px",
        height: "80px",
        borderRadius: "24px",
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Icon name={icon} size={36} color={color} />
      </div>
      <div style={{ fontWeight: "800", fontSize: "20px", color: "#2c3e50" }}>{title}</div>
      <div style={{ color: "#888", fontSize: "14px", textAlign: "center" }}>هذا القسم قيد التطوير وسيكون متاحاً قريباً</div>
      <div style={{
        background: `${color}15`,
        border: `2px solid ${color}33`,
        borderRadius: "12px",
        padding: "10px 20px",
        color: color,
        fontSize: "13px",
        fontWeight: "700",
      }}>🚀 قريباً</div>
    </div>
  );
}

// ==================== DRAWER MENU ====================
function Drawer({ isOpen, onClose, currentPage, onNavigate, isAdmin, adminRole, adminName, onAdminToggle, darkMode }) {
  const menuItems = [
    { id: "home", label: "الرئيسية", icon: "home" },
    { id: "contacts", label: "جهات الاتصال", icon: "contacts" },
    { id: "news", label: "الأخبار", icon: "news" },
    { id: "obituary", label: "الوفيات", icon: "obituary" },
    { id: "lost", label: "المفقودات", icon: "lost" },
    { id: "ads", label: "الإعلانات", icon: "ads" },
    { id: "links", label: "روابط مهمة", icon: "links" },
    { id: "settings", label: "الإعدادات", icon: "settings" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 1000, opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
          transition: "opacity 0.3s",
        }}
      />
      {/* Drawer */}
      <div style={{
        position: "fixed",
        top: 0,
        right: isOpen ? 0 : "-280px",
        width: "280px",
        height: "100%",
        background: "#fff",
        zIndex: 1001,
        transition: "right 0.3s ease",
        display: "flex",
        flexDirection: "column",
        boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
      }}>
        {/* Drawer Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a5276, #2980b9)",
          padding: "24px 20px 20px",
          color: "#fff",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: "800", fontSize: "18px" }}>🏙️ دليل بنش</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>المنصة الرقمية لمدينة بنش</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#fff" }}>
              <Icon name="close" size={18} color="#fff" />
            </button>
          </div>{isAdmin && adminRole === "super" && (
  <details style={{ marginTop: "8px" }}>
    <summary style={{
      background: "rgba(255,255,255,0.2)",
      borderRadius: "8px",
      padding: "8px 12px",
      cursor: "pointer",
      fontFamily: "'Cairo', sans-serif",
      fontSize: "12px",
      fontWeight: "700",
      color: "#fff",
      listStyle: "none",
    }}>
      👥 إدارة المستخدمين ▼
    </summary>
    <AdminUsersManager darkMode={darkMode} />
  </details>
)}
          {isAdmin && (
  <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}>
    🔓 {adminName} — {adminRole === "super" ? "مدير رئيسي" : "محرر"}
  </div>
)}
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose(); }}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: currentPage === item.id ? "#ebf5fb" : "transparent",
                border: "none",
                borderRight: currentPage === item.id ? "4px solid #2980b9" : "4px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
                fontSize: "14px",
                fontWeight: currentPage === item.id ? "700" : "500",
                color: currentPage === item.id ? "#2980b9" : "#2c3e50",
                textAlign: "right",
                transition: "all 0.2s",
              }}
            >
              <Icon name={item.icon} size={20} color={currentPage === item.id ? "#2980b9" : "#666"} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Admin Toggle */}
        <div style={{ padding: "16px", borderTop: "1px solid #f0f0f0" }}>
          <button
            onClick={() => { onAdminToggle(); onClose(); }}
            style={{
              width: "100%",
              padding: "12px",
              background: isAdmin ? "#fdedec" : "#ebf5fb",
              border: `2px solid ${isAdmin ? "#f5b7b1" : "#aed6f1"}`,
              borderRadius: "12px",
              color: isAdmin ? "#c0392b" : "#2980b9",
              fontFamily: "'Cairo', sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Icon name="admin" size={16} color={isAdmin ? "#c0392b" : "#2980b9"} />
            {isAdmin ? "خروج من الإدارة" : "دخول الإدارة"}
          </button>
        </div>
      </div>
    </>
  );
}

// ==================== ADS PAGE ====================
function AdsPage({ isAdmin }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", phone: "" });
  const [tab, setTab] = useState("approved");

  useEffect(() => { loadAds(); }, []);

  async function loadAds() {
    setLoading(true);
    const cached = getCache("ads");
    if (cached) {
      setAds(cached);
      if (isAdmin && cached.filter(a => a.status === "pending").length > 0) {
        setTab("pending");
      }
      setLoading(false);
      return;
    }
    const data = await supabase("ads", "GET", null, "?order=created_at.desc");
    const loaded = data || [];
    setAds(loaded);
    if (data) setCache("ads", loaded);
    if (isAdmin && loaded.filter(a => a.status === "pending").length > 0) {
      setTab("pending");
    }
    setLoading(false);
  }

  async function submitAd() {
    if (!form.title.trim() || !form.phone.trim()) return alert("العنوان ورقم التواصل مطلوبان!");
    const adData = { ...form, status: "pending" };
    const res = await supabase("ads", "POST", adData);
    if (res) {
      setForm({ title: "", description: "", image_url: "", phone: "" });
      setShowForm(false);
      await loadAds();
      alert("تم إرسال إعلانك! سيظهر بعد مراجعة الإدارة ✅");
    } else {
      alert("حدث خطأ في الإرسال. يرجى التحقق من الاتصال والمحاولة مجدداً.");
    }
  }

  async function updateStatus(id, status) {
    await supabase("ads", "PATCH", { status }, `?id=eq.${id}`);
    clearCache("ads");
    loadAds();
  }

  async function deleteAd(id) {
    if (!confirm("حذف الإعلان؟")) return;
    await supabase("ads", "DELETE", null, `?id=eq.${id}`);
    clearCache("ads");
    loadAds();
  }

  const approved = ads.filter(a => a.status === "approved");
  const pending = ads.filter(a => a.status === "pending");

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={() => setShowForm(!showForm)} style={{
        width: "100%", padding: "12px", background: "linear-gradient(135deg, #27ae60, #1e8449)",
        color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
        fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      }}>
        <Icon name="plus" size={18} /> {showForm ? "إلغاء" : "أضف إعلانك مجاناً"}
      </button>

      {showForm && (
        <div style={{ background: "#eafaf1", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #a9dfbf" }}>
          <div style={{ fontSize: "12px", color: "#888", marginBottom: "12px", textAlign: "center" }}>
            سيظهر إعلانك بعد مراجعة الإدارة ✅
          </div>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="عنوان الإعلان *" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="وصف الإعلان" rows={3} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", resize: "none", boxSizing: "border-box" }} />
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="رقم التواصل *" type="tel" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
            placeholder="رابط الصورة (اختياري)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "10px", boxSizing: "border-box" }} />
          <button onClick={submitAd} style={{ width: "100%", padding: "12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>
            إرسال الإعلان
          </button>
        </div>
      )}

      {isAdmin && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {[{ id: "approved", label: "المنشورة" }, { id: "pending", label: `بانتظار الموافقة (${pending.length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: tab === t.id ? "#27ae60" : "#f0f0f0",
              color: tab === t.id ? "#fff" : "#555",
              fontFamily: "'Cairo', sans-serif", fontSize: "13px", fontWeight: "700",
            }}>{t.label}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div>
      ) : (
        (isAdmin ? (tab === "approved" ? approved : pending) : approved).map(ad => (
          <div key={ad.id} style={{ background: "#fff", borderRadius: "14px", marginBottom: "12px", overflow: "hidden", border: "1.5px solid #f0f0f0" }}>
            {ad.image_url && (
              <img src={ad.image_url} alt={ad.title} style={{ width: "100%", height: "160px", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            )}
            <div style={{ padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: "800", fontSize: "15px", color: "#2c3e50", flex: 1 }}>{ad.title}</div>
                {isAdmin && (
                  <button onClick={() => deleteAd(ad.id)} style={{ background: "#fdedec", border: "none", borderRadius: "8px", padding: "5px 7px", cursor: "pointer", marginRight: "6px" }}>
                    <Icon name="trash" size={14} color="#c0392b" />
                  </button>
                )}
              </div>
              {ad.description && <div style={{ fontSize: "13px", color: "#666", marginTop: "6px", lineHeight: "1.6" }}>{ad.description}</div>}
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
  <a href={`tel:${ad.phone}`} style={{
    display: "flex", alignItems: "center", gap: "6px", background: "#eafaf1",
    border: "1.5px solid #a9dfbf", borderRadius: "8px", padding: "8px 12px",
    color: "#27ae60", textDecoration: "none", fontSize: "13px", fontWeight: "700", fontFamily: "'Cairo', sans-serif",
  }}>
    <Icon name="phone" size={14} color="#27ae60" /> {ad.phone}
  </a>
  {isAdmin && ad.status === "pending" && (
    <button onClick={() => updateStatus(ad.id, "approved")} style={{
      background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px",
      padding: "8px 14px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: "13px", fontWeight: "700",
    }}>✅ موافقة</button>
  )}
</div>
<a href={`https://wa.me/?text=${encodeURIComponent(`📢 ${ad.title}\n\n${ad.description || ""}\n📞 للتواصل: ${ad.phone}\n\n🏙️ دليل بنش`)}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#25D366", color: "#fff", borderRadius: "8px", padding: "7px 12px", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontSize: "12px", fontWeight: "700", marginTop: "8px" }}>
  <span>📤</span> مشاركة على واتساب
</a>
            </div>
          </div>
        ))
      )}
      {!loading && (isAdmin ? (tab === "approved" ? approved : pending) : approved).length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
          {tab === "pending" ? "لا توجد إعلانات بانتظار الموافقة" : "لا توجد إعلانات حالياً"}
        </div>
      )}
    </div>
  );
}

// ==================== LOST & FOUND PAGE ====================
function LostFoundPage({ isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", phone: "", type: "lost" });
  const [tab, setTab] = useState("approved");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => { loadItems(); }, []);
  async function loadItems() {
    setLoading(true);
    const cached = getCache("lost_found");
    if (cached) {
      setItems(cached);
      setLoading(false);
      return;
    }
    const data = await supabase("lost_found", "GET", null, "?order=created_at.desc");
    setItems(data || []);
    if (data) setCache("lost_found", data);
    setLoading(false);
  }

  async function submitItem() {
    if (!form.title.trim() || !form.phone.trim()) return alert("العنوان ورقم التواصل مطلوبان!");
    await supabase("lost_found", "POST", { ...form, status: "pending" });
    setForm({ title: "", description: "", image_url: "", phone: "", type: "lost" });
    setShowForm(false);
    loadItems();
    alert("تم إرسال طلبك! سيظهر بعد مراجعة الإدارة.");
  }

  async function updateStatus(id, status) {
    await supabase("lost_found", "PATCH", { status }, `?id=eq.${id}`);
    clearCache("lost_found");
    loadItems();
  }

  async function deleteItem(id) {
    if (!confirm("حذف؟")) return;
    await supabase("lost_found", "DELETE", null, `?id=eq.${id}`);
    clearCache("lost_found");
    loadItems();
  }

  const approved = items.filter(i => i.status === "approved");
  const pending = items.filter(i => i.status === "pending");
  const displayed = (isAdmin ? (tab === "approved" ? approved : pending) : approved)
    .filter(i => typeFilter === "all" || i.type === typeFilter);

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={() => setShowForm(!showForm)} style={{
        width: "100%", padding: "12px", background: "linear-gradient(135deg, #d35400, #a04000)",
        color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
        fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      }}>
        <Icon name="plus" size={18} /> {showForm ? "إلغاء" : "أضف مفقود أو موجود"}
      </button>

      {showForm && (
        <div style={{ background: "#fdf2e9", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #f0b27a" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {[{ v: "lost", l: "🔍 مفقود" }, { v: "found", l: "✅ موجود" }].map(t => (
              <button key={t.v} onClick={() => setForm(p => ({ ...p, type: t.v }))} style={{
                flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: form.type === t.v ? "#d35400" : "#f0f0f0",
                color: form.type === t.v ? "#fff" : "#555",
                fontFamily: "'Cairo', sans-serif", fontWeight: "700", fontSize: "13px",
              }}>{t.l}</button>
            ))}
          </div>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="اسم أو وصف مختصر *" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f0b27a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="تفاصيل إضافية (المكان، اللون، الشكل...)" rows={3} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f0b27a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", resize: "none", boxSizing: "border-box" }} />
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="رقم التواصل *" type="tel" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f0b27a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
            placeholder="رابط الصورة (اختياري)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f0b27a", fontFamily: "'Cairo', sans-serif", marginBottom: "10px", boxSizing: "border-box" }} />
          <button onClick={submitItem} style={{ width: "100%", padding: "12px", background: "#d35400", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>
            إرسال
          </button>
        </div>
      )}

      {isAdmin && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {[{ id: "approved", label: "المنشورة" }, { id: "pending", label: `انتظار (${pending.length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: tab === t.id ? "#d35400" : "#f0f0f0",
              color: tab === t.id ? "#fff" : "#555",
              fontFamily: "'Cairo', sans-serif", fontSize: "13px", fontWeight: "700",
            }}>{t.label}</button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[{ v: "all", l: "الكل" }, { v: "lost", l: "🔍 مفقود" }, { v: "found", l: "✅ موجود" }].map(t => (
          <button key={t.v} onClick={() => setTypeFilter(t.v)} style={{
            flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer",
            background: typeFilter === t.v ? "#2c3e50" : "#f0f0f0",
            color: typeFilter === t.v ? "#fff" : "#555",
            fontFamily: "'Cairo', sans-serif", fontSize: "12px", fontWeight: "700",
          }}>{t.l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>لا توجد سجلات</div>
      ) : (
        displayed.map(item => (
          <div key={item.id} style={{ background: "#fff", borderRadius: "14px", marginBottom: "12px", overflow: "hidden", border: `2px solid ${item.type === "lost" ? "#f0b27a" : "#a9dfbf"}` }}>
            {item.image_url && (
              <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "150px", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            )}
            <div style={{ padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{
                  background: item.type === "lost" ? "#fdf2e9" : "#eafaf1",
                  color: item.type === "lost" ? "#d35400" : "#27ae60",
                  border: `1.5px solid ${item.type === "lost" ? "#f0b27a" : "#a9dfbf"}`,
                  borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "700",
                }}>
                  {item.type === "lost" ? "🔍 مفقود" : "✅ موجود"}
                </span>
                <span style={{ fontWeight: "800", fontSize: "14px", color: "#2c3e50" }}>{item.title}</span>
              </div>
              {item.description && <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", marginBottom: "10px" }}>{item.description}</div>}
              <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "10px" }}>
  🕐 {new Date(item.created_at).toLocaleDateString("ar-SY", { year: "numeric", month: "long", day: "numeric" })}
</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <a href={`tel:${item.phone}`} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: item.type === "lost" ? "#fdf2e9" : "#eafaf1",
                  border: `1.5px solid ${item.type === "lost" ? "#f0b27a" : "#a9dfbf"}`,
                  borderRadius: "8px", padding: "8px 12px",
                  color: item.type === "lost" ? "#d35400" : "#27ae60",
                  textDecoration: "none", fontSize: "13px", fontWeight: "700", fontFamily: "'Cairo', sans-serif",
                }}>
                  <Icon name="phone" size={14} color={item.type === "lost" ? "#d35400" : "#27ae60"} /> {item.phone}
                </a>
                <div style={{ display: "flex", gap: "6px" }}>
                  {isAdmin && item.status === "pending" && (
                    <button onClick={() => updateStatus(item.id, "approved")} style={{
                      background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px",
                      padding: "8px 12px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: "12px", fontWeight: "700",
                    }}>✅ موافقة</button>
                  )}
                  {isAdmin && (
                    <button onClick={() => deleteItem(item.id)} style={{ background: "#fdedec", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer" }}>
                      <Icon name="trash" size={14} color="#c0392b" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
// ==================== ADMIN USERS MANAGER ====================
function AdminUsersManager({ darkMode }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "editor" });

  const cardBg = darkMode ? "#16213e" : "#fff";
  const borderColor = darkMode ? "#2a2a4a" : "#f0f0f0";
  const textColor = darkMode ? "#e0e0e0" : "#2c3e50";

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    setLoading(true);
    const data = await supabase("admins", "GET", null, "?order=id.asc");
    setAdmins(data || []);
    setLoading(false);
  }

  async function addAdmin() {
    if (!form.username.trim() || !form.password.trim()) return alert("الاسم وكلمة المرور مطلوبان!");
    const hashedPassword = await hashPassword(form.password);
const res = await supabase("admins", "POST", { ...form, password: hashedPassword });
    if (res) {
      setForm({ username: "", password: "", role: "editor" });
      setShowForm(false);
      loadAdmins();
    } else {
      alert("حدث خطأ! ربما اسم المستخدم مكرر.");
    }
  }

  async function deleteAdmin(id) {
    if (!confirm("حذف هذا المستخدم؟")) return;
    await supabase("admins", "DELETE", null, `?id=eq.${id}`);
    loadAdmins();
  }

  async function updatePassword(id, currentUsername) {
    const newPass = prompt(`كلمة المرور الجديدة لـ ${currentUsername}:`);
    if (!newPass) return;
    const hashedPass = await hashPassword(newPass);
    await supabase("admins", "PATCH", { password: hashedPass }, `?id=eq.${id}`);
    alert("✅ تم تغيير كلمة المرور!");
    loadAdmins();
  }

  return (
    <div style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}` }}>
      <div style={{ fontWeight: "800", fontSize: "14px", color: "#c0392b", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>👥 إدارة المستخدمين</span>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: "#c0392b", color: "#fff", border: "none", borderRadius: "8px",
          padding: "6px 12px", cursor: "pointer", fontFamily: "'Cairo', sans-serif",
          fontSize: "12px", fontWeight: "700",
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          <Icon name="plus" size={14} color="#fff" /> إضافة
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fdedec", borderRadius: "12px", padding: "14px", marginBottom: "12px", border: "1.5px solid #f1948a" }}>
          <input
            value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            placeholder="اسم المستخدم"
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f1948a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }}
          />
          <input
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="كلمة المرور"
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f1948a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }}
          />
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px", fontFamily: "'Cairo', sans-serif" }}>الصلاحية:</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[{ v: "editor", l: "محرر" }, { v: "super", l: "مدير رئيسي" }].map(r => (
                <button key={r.v} onClick={() => setForm(p => ({ ...p, role: r.v }))} style={{
                  flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: form.role === r.v ? "#c0392b" : "#f0f0f0",
                  color: form.role === r.v ? "#fff" : "#555",
                  fontFamily: "'Cairo', sans-serif", fontWeight: "700", fontSize: "13px",
                }}>{r.l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addAdmin} style={{ flex: 1, padding: "10px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>حفظ</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "10px", background: "#f0f0f0", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#aaa", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>جاري التحميل...</div>
      ) : (
        admins.map(admin => (
          <div key={admin.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px", borderRadius: "10px", marginBottom: "8px",
            background: admin.role === "super" ? "#fdedec" : "#f8f9fa",
            border: `1.5px solid ${admin.role === "super" ? "#f1948a" : "#e8e8e8"}`,
          }}>
            <div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: textColor, fontFamily: "'Cairo', sans-serif" }}>
                {admin.role === "super" ? "👑" : "✏️"} {admin.username}
              </div>
              <div style={{ fontSize: "11px", color: "#888", marginTop: "2px", fontFamily: "'Cairo', sans-serif" }}>
                {admin.role === "super" ? "مدير رئيسي" : "محرر"}
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => updatePassword(admin.id, admin.username)} style={{
                background: "#ebf5fb", border: "1.5px solid #aed6f1", borderRadius: "8px",
                padding: "6px 10px", cursor: "pointer", fontFamily: "'Cairo', sans-serif",
                fontSize: "11px", fontWeight: "700", color: "#2980b9",
              }}>🔑 تغيير</button>
              {admin.role !== "super" && (
                <button onClick={() => deleteAdmin(admin.id)} style={{
                  background: "#fdedec", border: "1.5px solid #f1948a", borderRadius: "8px",
                  padding: "6px 8px", cursor: "pointer",
                }}>
                  <Icon name="trash" size={13} color="#c0392b" />
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
// ==================== SETTINGS PAGE ====================
function SettingsPage({ isAdmin, adminRole, darkMode, setDarkMode }) {
  const [activeSection, setActiveSection] = useState(null);
  const [contactMsg, setContactMsg] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const loadMessages = async () => {
    setLoadingMsgs(true);
    const data = await supabase("contact_messages", "GET", null, "?order=created_at.desc");
    setMessages(data || []);
    setLoadingMsgs(false);
  };

  const deleteMessage = async (id) => {
    if (!confirm("حذف الرسالة؟")) return;
    await supabase("contact_messages", "DELETE", null, `?id=eq.${id}`);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  useEffect(() => {
    if (isAdmin) loadMessages();
  }, [isAdmin]);

  const bg = darkMode ? "#1a1a2e" : "#f5f6fa";
  const cardBg = darkMode ? "#16213e" : "#fff";
  const textColor = darkMode ? "#e0e0e0" : "#2c3e50";
  const subColor = darkMode ? "#aaa" : "#888";
  const borderColor = darkMode ? "#2a2a4a" : "#f0f0f0";

  async function sendMessage() {
    if (!contactMsg.trim()) return alert("الرسالة مطلوبة!");
    setSending(true);
    await supabase("contact_messages", "POST", {
      name: contactName,
      phone: contactPhone,
      message: contactMsg,
    });
    setSending(false);
    setContactMsg(""); setContactName(""); setContactPhone("");
    setActiveSection(null);
    alert("تم إرسال رسالتك! شكراً لك ✅");
  }

  return (
    <div style={{ padding: "20px", fontFamily: "'Cairo', sans-serif", background: bg, minHeight: "80vh" }}>

      {/* Dark Mode Toggle */}
      <div style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}`, display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ fontSize: "24px" }}>{darkMode ? "🌙" : "☀️"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "14px", color: textColor }}>
            {darkMode ? "المود الليلي" : "المود النهاري"}
          </div>
          <div style={{ fontSize: "12px", color: subColor, marginTop: "2px" }}>اضغط للتبديل</div>
        </div>
        <div
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: "50px", height: "27px", borderRadius: "20px",
            background: darkMode ? "#c0392b" : "#ddd",
            position: "relative", cursor: "pointer", transition: "background 0.3s",
          }}
        >
          <div style={{
            position: "absolute", top: "3px",
            right: darkMode ? "3px" : "23px",
            width: "21px", height: "21px", borderRadius: "50%",
            background: "#fff", transition: "right 0.3s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }} />
        </div>
      </div>

      {/* About */}
      <div
        onClick={() => setActiveSection(activeSection === "about" ? null : "about")}
        style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}`, display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
      >
        <span style={{ fontSize: "24px" }}>📱</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "14px", color: textColor }}>حول التطبيق</div>
          <div style={{ fontSize: "12px", color: subColor, marginTop: "2px" }}>الإصدار 1.0 - دليل بنش الخدمي</div>
        </div>
        <Icon name={activeSection === "about" ? "chevronUp" : "chevronDown"} size={18} color={subColor} />
      </div>
      {activeSection === "about" && (
        <div style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}`, fontSize: "13px", color: textColor, lineHeight: "1.8" }}>
          <div style={{ fontWeight: "800", marginBottom: "8px", color: "#c0392b" }}>🏙️ دليل بنش الخدمي</div>
          دليل بنش هو تطبيق مجتمعي يهدف إلى تسهيل الحياة اليومية لأبناء مدينة بنش من خلال توفير معلومات الخدمات المحلية وجهات الاتصال والأخبار في مكان واحد.<br/><br/>
          <span style={{ color: subColor }}>الإصدار: 1.0.0</span>
        </div>
      )}

      {/* Privacy */}
      <div
        onClick={() => setActiveSection(activeSection === "privacy" ? null : "privacy")}
        style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}`, display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
      >
        <span style={{ fontSize: "24px" }}>🔒</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "14px", color: textColor }}>سياسة الخصوصية</div>
          <div style={{ fontSize: "12px", color: subColor, marginTop: "2px" }}>اقرأ سياسة الخصوصية</div>
        </div>
        <Icon name={activeSection === "privacy" ? "chevronUp" : "chevronDown"} size={18} color={subColor} />
      </div>
      {activeSection === "privacy" && (
        <div style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}`, fontSize: "13px", color: textColor, lineHeight: "1.9" }}>
          <div style={{ fontWeight: "800", marginBottom: "10px", color: "#c0392b" }}>🔒 سياسة الخصوصية</div>
          <b>جمع البيانات:</b> نجمع فقط البيانات التي تقدمها طوعاً مثل الإعلانات والمفقودات.<br/><br/>
          <b>استخدام البيانات:</b> تُستخدم البيانات حصراً لتقديم الخدمة داخل التطبيق ولا تُشارك مع أطراف ثالثة.<br/><br/>
          <b>الأمان:</b> نستخدم قواعد بيانات آمنة لحماية معلوماتك.<br/><br/>
          <b>التواصل:</b> إذا كان لديك أي استفسار يمكنك التواصل معنا عبر قسم "تواصل معنا".
        </div>
      )}

      {/* Contact Us */}
      <div
        onClick={() => setActiveSection(activeSection === "contact" ? null : "contact")}
        style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}`, display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
      >
        <span style={{ fontSize: "24px" }}>📩</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "14px", color: textColor }}>تواصل معنا</div>
          <div style={{ fontSize: "12px", color: subColor, marginTop: "2px" }}>أرسل اقتراحاتك وملاحظاتك</div>
        </div>
        <Icon name={activeSection === "contact" ? "chevronUp" : "chevronDown"} size={18} color={subColor} />
      </div>
      {activeSection === "contact" && (
        <div style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}` }}>
          <input
            placeholder="اسمك (اختياري)"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1.5px solid ${borderColor}`, fontFamily: "'Cairo', sans-serif", fontSize: "13px", marginBottom: "8px", boxSizing: "border-box", background: darkMode ? "#0f3460" : "#fafafa", color: textColor }}
          />
          <input
            placeholder="رقم التواصل (اختياري)"
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1.5px solid ${borderColor}`, fontFamily: "'Cairo', sans-serif", fontSize: "13px", marginBottom: "8px", boxSizing: "border-box", background: darkMode ? "#0f3460" : "#fafafa", color: textColor }}
          />
          <textarea
            placeholder="رسالتك أو اقتراحك..."
            value={contactMsg}
            onChange={e => setContactMsg(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1.5px solid ${borderColor}`, fontFamily: "'Cairo', sans-serif", fontSize: "13px", marginBottom: "8px", boxSizing: "border-box", resize: "none", background: darkMode ? "#0f3460" : "#fafafa", color: textColor }}
          />
          <button onClick={sendMessage} disabled={sending} style={{ width: "100%", padding: "12px", background: sending ? "#aaa" : "#c0392b", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", fontSize: "14px", cursor: sending ? "not-allowed" : "pointer" }}>
            {sending ? "جاري الإرسال..." : "إرسال ✉️"}
          </button>
        </div>
      )}
{/* Admin: إرسال إشعار يدوي */}{isAdmin && adminRole === "super" && (
        <div style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}` }}>
        <div style={{ fontWeight: "800", fontSize: "14px", color: "#c0392b", marginBottom: "12px" }}>
          🔔 إرسال إشعار للمستخدمين
          </div>
          <input
            placeholder="عنوان الإشعار *"
            id="notif-title"
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1.5px solid ${borderColor}`, fontFamily: "'Cairo', sans-serif", fontSize: "13px", marginBottom: "8px", boxSizing: "border-box", background: darkMode ? "#0f3460" : "#fafafa", color: textColor }}
          />
          <textarea
            placeholder="نص الإشعار (اختياري)"
            id="notif-body"
            rows={3}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1.5px solid ${borderColor}`, fontFamily: "'Cairo', sans-serif", fontSize: "13px", marginBottom: "8px", boxSizing: "border-box", resize: "none", background: darkMode ? "#0f3460" : "#fafafa", color: textColor }}
          />
          <button
            onClick={async () => {
              const title = document.getElementById("notif-title").value.trim();
              const body = document.getElementById("notif-body").value.trim();
              if (!title) return alert("العنوان مطلوب!");
              await sendNotification(title, body, "general");
              document.getElementById("notif-title").value = "";
              document.getElementById("notif-body").value = "";
              alert("✅ تم إرسال الإشعار!");
            }}
            style={{ width: "100%", padding: "12px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
          >
            إرسال الإشعار 🔔
          </button>
        </div>
      )}
      {isAdmin && adminRole === "super" && <VisitorStats darkMode={darkMode} />}{isAdmin && adminRole === "super" && (
        <>
          <div style={{ height: "1px", background: borderColor, margin: "16px 0" }} />
          <div style={{ fontWeight: "800", fontSize: "14px", color: "#c0392b", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            📩 رسائل التواصل
            <span style={{ background: "#c0392b", color: "#fff", borderRadius: "20px", padding: "2px 10px", fontSize: "12px" }}>{messages.length}</span>
            <button onClick={loadMessages} style={{ marginRight: "auto", background: "none", border: "1.5px solid #c0392b", borderRadius: "8px", padding: "4px 10px", color: "#c0392b", fontFamily: "'Cairo', sans-serif", fontSize: "12px", cursor: "pointer" }}>
              تحديث
            </button>
          </div>
          {loadingMsgs && <div style={{ textAlign: "center", padding: "20px", color: "#aaa", fontSize: "13px" }}>جاري التحميل...</div>}
          {!loadingMsgs && messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: "#aaa", fontSize: "13px", background: cardBg, borderRadius: "12px" }}>لا توجد رسائل بعد</div>
          )}
          {messages.map(msg => (
            <div key={msg.id} style={{ background: cardBg, borderRadius: "12px", padding: "14px", marginBottom: "10px", border: `1.5px solid ${borderColor}`, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "18px" }}>👤</span>
                <span style={{ fontWeight: "700", fontSize: "13px", color: textColor }}>{msg.name || "مجهول"}</span>
                {msg.phone && (
                  <a href={`tel:${msg.phone}`} style={{ fontSize: "12px", color: "#2980b9", textDecoration: "none", marginRight: "auto" }}>📞 {msg.phone}</a>
                )}
              </div>
              <div style={{ fontSize: "13px", color: textColor, lineHeight: "1.7", background: darkMode ? "#0f3460" : "#f8f8f8", padding: "10px", borderRadius: "8px", marginBottom: "6px" }}>
                {msg.message}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: subColor }}>{new Date(msg.created_at).toLocaleString("ar-SA")}</span>
                <button onClick={() => deleteMessage(msg.id)} style={{ background: "#e74c3c", border: "none", borderRadius: "7px", padding: "5px 10px", color: "#fff", fontFamily: "'Cairo', sans-serif", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Icon name="trash" size={13} color="#fff" /> حذف
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}


// ==================== LINKS PAGE ====================
function LinksPage({ isAdmin }) {
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", icon: "🔗" });
  const [linkForm, setLinkForm] = useState({ title: "", url: "", category_id: "" });
  const [expandedCat, setExpandedCat] = useState(null);

  const ICONS = ["🔗","🏛️","🏥","🚒","📚","🏫","💼","🌐","📞","⚡","🏗️","🚜","💰","📋","🕌"];

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const cachedCats = getCache("link_categories");
    const cachedLinks = getCache("links");
    if (cachedCats && cachedLinks) {
      setCategories(cachedCats);
      setLinks(cachedLinks);
      if (cachedCats.length > 0) setExpandedCat(cachedCats[0].id);
      setLoading(false);
      return;
    }
    const cats = await supabase("link_categories", "GET", null, "?order=id");
    const lnks = await supabase("links", "GET", null, "?order=created_at.desc");
    setCategories(cats || []);
    setLinks(lnks || []);
    if (cats && cats.length > 0) setExpandedCat(cats[0].id);
    if (cats) setCache("link_categories", cats);
    if (lnks) setCache("links", lnks);
    setLoading(false);
  }

  async function addCategory() {
    if (!catForm.name.trim()) return alert("اسم الفئة مطلوب!");
    const res = await supabase("link_categories", "POST", catForm);
    if (res) {
      setCatForm({ name: "", icon: "🔗" });
      setShowCatForm(false);
      clearCache("link_categories");
      clearCache("links");
      await loadAll();
    } else {
      alert("حدث خطأ، حاول مجدداً.");
    }
  }

  async function deleteCategory(id) {
    if (!confirm("سيتم حذف الفئة وجميع روابطها!")) return;
    await supabase("links", "DELETE", null, `?category_id=eq.${id}`);
    await supabase("link_categories", "DELETE", null, `?id=eq.${id}`);
    clearCache("link_categories");
    clearCache("links");
    await loadAll();
  }

  async function addLink() {
    if (!linkForm.title.trim() || !linkForm.url.trim() || !linkForm.category_id) return alert("جميع الحقول مطلوبة!");
    let url = linkForm.url.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    const res = await supabase("links", "POST", { ...linkForm, url });
    if (res) {
      setLinkForm({ title: "", url: "", category_id: "" });
      setShowLinkForm(false);
      clearCache("link_categories");
      clearCache("links");
      await loadAll();
    } else {
      alert("حدث خطأ، حاول مجدداً.");
    }
  }

  async function deleteLink(id) {
    if (!confirm("حذف الرابط؟")) return;
    await supabase("links", "DELETE", null, `?id=eq.${id}`);
    clearCache("link_categories");
    clearCache("links");
    await loadAll();
  }

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#888", fontFamily: "'Cairo', sans-serif" }}>
      جاري التحميل...
    </div>
  );

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>

      {/* Admin Buttons */}
      {isAdmin && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button onClick={() => { setShowCatForm(!showCatForm); setShowLinkForm(false); }} style={{
            flex: 1, padding: "11px", background: "linear-gradient(135deg, #8e44ad, #6c3483)",
            color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
            fontSize: "13px", fontWeight: "700", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            <Icon name="plus" size={16} /> فئة جديدة
          </button>
          <button onClick={() => { setShowLinkForm(!showLinkForm); setShowCatForm(false); }} style={{
            flex: 1, padding: "11px", background: "linear-gradient(135deg, #c0392b, #922b21)",
            color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
            fontSize: "13px", fontWeight: "700", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            <Icon name="links" size={16} /> رابط جديد
          </button>
        </div>
      )}

      {/* Add Category Form */}
      {isAdmin && showCatForm && (
        <div style={{ background: "#f5eef8", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #d7bde2" }}>
          <div style={{ fontWeight: "700", marginBottom: "12px", color: "#6c3483" }}>إضافة فئة جديدة</div>
          <input
            placeholder="اسم الفئة"
            value={catForm.name}
            onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #d7bde2", fontFamily: "'Cairo', sans-serif", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }}
          />
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>اختر أيقونة:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setCatForm(p => ({ ...p, icon: ic }))} style={{
                  width: "36px", height: "36px", fontSize: "18px", border: catForm.icon === ic ? "2px solid #8e44ad" : "2px solid #ddd",
                  borderRadius: "8px", background: catForm.icon === ic ? "#f5eef8" : "#fff", cursor: "pointer",
                }}>{ic}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addCategory} style={{ flex: 1, padding: "11px", background: "#8e44ad", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>إضافة</button>
            <button onClick={() => setShowCatForm(false)} style={{ flex: 1, padding: "11px", background: "#f0f0f0", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>إلغاء</button>
          </div>
        </div>
      )}

      {/* Add Link Form */}
      {isAdmin && showLinkForm && (
        <div style={{ background: "#fdedec", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #f1948a" }}>
          <div style={{ fontWeight: "700", marginBottom: "12px", color: "#c0392b" }}>إضافة رابط جديد</div>
          <select
            value={linkForm.category_id}
            onChange={e => setLinkForm(p => ({ ...p, category_id: e.target.value }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #f1948a", fontFamily: "'Cairo', sans-serif", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }}
          >
            <option value="">-- اختر الفئة --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <input
            placeholder="عنوان الرابط"
            value={linkForm.title}
            onChange={e => setLinkForm(p => ({ ...p, title: e.target.value }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #f1948a", fontFamily: "'Cairo', sans-serif", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }}
          />
          <input
            placeholder="الرابط (مثال: www.example.com)"
            value={linkForm.url}
            onChange={e => setLinkForm(p => ({ ...p, url: e.target.value }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #f1948a", fontFamily: "'Cairo', sans-serif", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box", direction: "ltr" }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addLink} style={{ flex: 1, padding: "11px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>إضافة</button>
            <button onClick={() => setShowLinkForm(false)} style={{ flex: 1, padding: "11px", background: "#f0f0f0", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>إلغاء</button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {categories.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔗</div>
          <div style={{ fontWeight: "700", fontSize: "15px" }}>لا توجد روابط بعد</div>
          {isAdmin && <div style={{ fontSize: "13px", marginTop: "6px" }}>ابدأ بإضافة فئة جديدة</div>}
        </div>
      )}

      {/* Categories & Links */}
      {categories.map(cat => {
        const catLinks = links.filter(l => String(l.category_id) === String(cat.id));
        const isOpen = expandedCat === cat.id;
        return (
          <div key={cat.id} style={{ marginBottom: "12px", borderRadius: "14px", overflow: "hidden", border: "1.5px solid #e8e8e8", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {/* Category Header */}
            <div
              onClick={() => setExpandedCat(isOpen ? null : cat.id)}
              style={{ display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer", background: isOpen ? "linear-gradient(135deg, #c0392b, #922b21)" : "#f8f8f8", transition: "background 0.2s" }}
            >
              <span style={{ fontSize: "22px", marginLeft: "10px" }}>{cat.icon}</span>
              <span style={{ flex: 1, fontWeight: "700", fontSize: "15px", color: isOpen ? "#fff" : "#333" }}>{cat.name}</span>
              <span style={{ fontSize: "12px", color: isOpen ? "rgba(255,255,255,0.7)" : "#aaa", marginLeft: "8px" }}>{catLinks.length} رابط</span>
              <Icon name={isOpen ? "chevronUp" : "chevronDown"} size={18} color={isOpen ? "#fff" : "#999"} />
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); deleteCategory(cat.id); }} style={{ marginRight: "8px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px 6px", cursor: "pointer" }}>
                  <Icon name="trash" size={14} color={isOpen ? "#fff" : "#e74c3c"} />
                </button>
              )}
            </div>

            {/* Links List */}
            {isOpen && (
              <div style={{ padding: "8px" }}>
                {catLinks.length === 0 && (
                  <div style={{ textAlign: "center", padding: "16px", color: "#bbb", fontSize: "13px" }}>لا توجد روابط في هذه الفئة</div>
                )}
                {catLinks.map(link => (
                  <div key={link.id} style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: "10px", marginBottom: "6px", background: "#fafafa", border: "1px solid #f0f0f0" }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, color: "#c0392b", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>
                      🔗 {link.title}
                    </a>
                    {isAdmin && (
                      <button onClick={() => deleteLink(link.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                        <Icon name="trash" size={15} color="#e74c3c" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ==================== TRANSPORT PAGE ====================
function TransportPage({ isAdmin }) {
  const [categories, setCategories] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", icon: "🚗", sort_order: 0 });
  const [driverForm, setDriverForm] = useState({ name: "", phone: "", image_url: "", category_id: "" });
  const [expandedCat, setExpandedCat] = useState(null);

  const ICONS = ["🚗","🚐","🛻","🚌","🏍️","🚜","🚛","🚑","🔧","📦"];

  useEffect(() => { loadAll(); }, []);
  async function loadAll() {
    setLoading(true);
    const cachedCats = getCache("transport_categories");
    const cachedDrvs = getCache("transport_drivers");
    if (cachedCats && cachedDrvs) {
      setCategories(cachedCats);
      setDrivers(cachedDrvs);
      if (cachedCats.length > 0) setExpandedCat(cachedCats[0].id);
      setLoading(false);
      return;
    }
    const cats = await supabase("transport_categories", "GET", null, "?order=sort_order.asc,id.asc");
    const drvs = await supabase("transport_drivers", "GET", null, "?order=created_at.desc");
    setCategories(cats || []);
    setDrivers(drvs || []);
    if (cats && cats.length > 0) setExpandedCat(cats[0].id);
    if (cats) setCache("transport_categories", cats);
    if (drvs) setCache("transport_drivers", drvs);
    setLoading(false);
  }

  async function addCategory() {
    if (!catForm.name.trim()) return alert("اسم الفئة مطلوب!");
    const res = await supabase("transport_categories", "POST", catForm);
    if (res) {
      setCatForm({ name: "", icon: "🚗", sort_order: 0 });
      setShowCatForm(false);
      clearCache("transport_categories");
      clearCache("transport_drivers");
      await loadAll();
    } else alert("حدث خطأ، حاول مجدداً.");
  }

  async function deleteCategory(id) {
    if (!confirm("سيتم حذف الفئة وجميع سائقيها!")) return;
    await supabase("transport_drivers", "DELETE", null, `?category_id=eq.${id}`);
    await supabase("transport_categories", "DELETE", null, `?id=eq.${id}`);
    clearCache("transport_categories");
    clearCache("transport_drivers");
    await loadAll();
  }

  async function addDriver() {
    if (!driverForm.name.trim() || !driverForm.phone.trim() || !driverForm.category_id)
      return alert("الاسم والهاتف والفئة مطلوبة!");
    const res = await supabase("transport_drivers", "POST", driverForm);
    if (res) {
      setDriverForm({ name: "", phone: "", image_url: "", category_id: "" });
      setShowDriverForm(false);
      clearCache("transport_categories");
      clearCache("transport_drivers");
      await loadAll();
    } else alert("حدث خطأ، حاول مجدداً.");
  }

  async function deleteDriver(id) {
    if (!confirm("حذف السائق؟")) return;
    await supabase("transport_drivers", "DELETE", null, `?id=eq.${id}`);
    clearCache("transport_categories");
    clearCache("transport_drivers");
    await loadAll();
  }

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#888", fontFamily: "'Cairo', sans-serif" }}>جاري التحميل...</div>;

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>

      {isAdmin && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button onClick={() => { setShowCatForm(!showCatForm); setShowDriverForm(false); }} style={{
            flex: 1, padding: "11px", background: "linear-gradient(135deg, #1a5276, #154360)",
            color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
            fontSize: "13px", fontWeight: "700", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            <Icon name="plus" size={16} /> فئة جديدة
          </button>
          <button onClick={() => { setShowDriverForm(!showDriverForm); setShowCatForm(false); }} style={{
            flex: 1, padding: "11px", background: "linear-gradient(135deg, #c0392b, #922b21)",
            color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
            fontSize: "13px", fontWeight: "700", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            <Icon name="plus" size={16} /> سائق جديد
          </button>
        </div>
      )}

      {/* Add Category Form */}
      {isAdmin && showCatForm && (
        <div style={{ background: "#eaf2ff", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #aed6f1" }}>
          <div style={{ fontWeight: "700", marginBottom: "12px", color: "#1a5276" }}>إضافة فئة جديدة</div>
          <input placeholder="اسم الفئة (مثال: تكاسي، بيكاب)" value={catForm.name}
            onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #aed6f1", fontFamily: "'Cairo', sans-serif", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }} />
          <input placeholder="الترتيب (0=أول)" type="number" value={catForm.sort_order}
            onChange={e => setCatForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #aed6f1", fontFamily: "'Cairo', sans-serif", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }} />
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>اختر أيقونة:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setCatForm(p => ({ ...p, icon: ic }))} style={{
                  width: "38px", height: "38px", fontSize: "20px",
                  border: catForm.icon === ic ? "2px solid #1a5276" : "2px solid #ddd",
                  borderRadius: "8px", background: catForm.icon === ic ? "#d6eaf8" : "#fff", cursor: "pointer",
                }}>{ic}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addCategory} style={{ flex: 1, padding: "11px", background: "#1a5276", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>إضافة</button>
            <button onClick={() => setShowCatForm(false)} style={{ flex: 1, padding: "11px", background: "#f0f0f0", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>إلغاء</button>
          </div>
        </div>
      )}

      {/* Add Driver Form */}
      {isAdmin && showDriverForm && (
        <div style={{ background: "#fdedec", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #f1948a" }}>
          <div style={{ fontWeight: "700", marginBottom: "12px", color: "#c0392b" }}>إضافة سائق / مركبة</div>
          <select value={driverForm.category_id} onChange={e => setDriverForm(p => ({ ...p, category_id: e.target.value }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #f1948a", fontFamily: "'Cairo', sans-serif", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }}>
            <option value="">-- اختر الفئة --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <input placeholder="الاسم" value={driverForm.name} onChange={e => setDriverForm(p => ({ ...p, name: e.target.value }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #f1948a", fontFamily: "'Cairo', sans-serif", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }} />
          <input placeholder="رقم الهاتف" value={driverForm.phone} onChange={e => setDriverForm(p => ({ ...p, phone: e.target.value }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #f1948a", fontFamily: "'Cairo', sans-serif", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box", direction: "ltr" }} />
          <input placeholder="رابط صورة السيارة أو الكابتن (اختياري)" value={driverForm.image_url} onChange={e => setDriverForm(p => ({ ...p, image_url: e.target.value }))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #f1948a", fontFamily: "'Cairo', sans-serif", fontSize: "13px", marginBottom: "10px", boxSizing: "border-box", direction: "ltr" }} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addDriver} style={{ flex: 1, padding: "11px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>إضافة</button>
            <button onClick={() => setShowDriverForm(false)} style={{ flex: 1, padding: "11px", background: "#f0f0f0", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>إلغاء</button>
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚗</div>
          <div style={{ fontWeight: "700", fontSize: "15px" }}>لا توجد فئات بعد</div>
          {isAdmin && <div style={{ fontSize: "13px", marginTop: "6px" }}>ابدأ بإضافة فئة (تكاسي، بيكاب...)</div>}
        </div>
      )}

      {categories.map(cat => {
        const catDrivers = drivers.filter(d => String(d.category_id) === String(cat.id));
        const isOpen = expandedCat === cat.id;
        return (
          <div key={cat.id} style={{ marginBottom: "14px", borderRadius: "16px", overflow: "hidden", border: "1.5px solid #e8e8e8", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            {/* Category Header */}
            <div onClick={() => setExpandedCat(isOpen ? null : cat.id)} style={{
              display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer",
              background: isOpen ? "linear-gradient(135deg, #c0392b, #922b21)" : "#f8f8f8",
            }}>
              <span style={{ fontSize: "24px", marginLeft: "10px" }}>{cat.icon}</span>
              <span style={{ flex: 1, fontWeight: "800", fontSize: "15px", color: isOpen ? "#fff" : "#333" }}>{cat.name}</span>
              <span style={{ fontSize: "12px", color: isOpen ? "rgba(255,255,255,0.7)" : "#aaa", marginLeft: "8px" }}>{catDrivers.length} سائق</span>
              <Icon name={isOpen ? "chevronUp" : "chevronDown"} size={18} color={isOpen ? "#fff" : "#999"} />
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); deleteCategory(cat.id); }} style={{ marginRight: "8px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px 6px", cursor: "pointer" }}>
                  <Icon name="trash" size={14} color={isOpen ? "#fff" : "#e74c3c"} />
                </button>
              )}
            </div>

            {/* Drivers Grid */}
            {isOpen && (
              <div style={{ padding: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {catDrivers.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "20px", color: "#bbb", fontSize: "13px" }}>لا يوجد سائقون في هذه الفئة</div>
                )}
                {catDrivers.map(driver => (
                  <div key={driver.id} style={{ borderRadius: "12px", border: "1.5px solid #f0f0f0", overflow: "hidden", background: "#fafafa", position: "relative" }}>
                    {driver.image_url ? (
                      <img src={driver.image_url} alt={driver.name} style={{ width: "100%", height: "100px", objectFit: "cover" }} onError={e => e.target.style.display='none'} />
                    ) : (
                      <div style={{ width: "100%", height: "100px", background: "linear-gradient(135deg, #2c3e50, #1a2634)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
                        {cat.icon}
                      </div>
                    )}
                    <div style={{ padding: "8px" }}>
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "#2c3e50", marginBottom: "6px" }}>{driver.name}</div>
                      <a href={`tel:${driver.phone}`} style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                        padding: "7px", background: "linear-gradient(135deg, #27ae60, #1e8449)",
                        color: "#fff", borderRadius: "8px", textDecoration: "none",
                        fontSize: "12px", fontWeight: "700", fontFamily: "'Cairo', sans-serif",
                      }}>
                        <Icon name="phone" size={13} color="#fff" /> {driver.phone}
                      </a>
                    </div>
                    <DriverLikeButton driverId={driver.id} />
                    {isAdmin && (
                      <button onClick={() => deleteDriver(driver.id)} style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(231,76,60,0.9)", border: "none", borderRadius: "6px", padding: "4px 6px", cursor: "pointer" }}>
                        <Icon name="trash" size={13} color="#fff" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
// ==================== MOSQUES PAGE ====================
function MosquesPage({ isAdmin }) {
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", image_url: "", imam: "", khatib: "", location: "", notes: "" });

  useEffect(() => { loadMosques(); }, []);

  async function loadMosques() {
    setLoading(true);
    const cached = getCache("mosques");
    if (cached) {
      setMosques(cached);
      setLoading(false);
      return;
    }
    const data = await supabase("mosques", "GET", null, "?order=created_at.desc");
    setMosques(data || []);
    if (data) setCache("mosques", data);
    setLoading(false);
  }

  async function addMosque() {
    if (!form.name.trim()) return alert("اسم المسجد مطلوب!");
    await supabase("mosques", "POST", form);
    setForm({ name: "", image_url: "", imam: "", khatib: "", location: "", notes: "" });
    setShowForm(false);
    loadMosques();
  }

  async function deleteMosque(id) {
    if (!confirm("حذف المسجد؟")) return;
    await supabase("mosques", "DELETE", null, `?id=eq.${id}`);
    loadMosques();
  }

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>

      {isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{
          width: "100%", padding: "12px", background: "linear-gradient(135deg, #1a8a4a, #145a32)",
          color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
          fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <Icon name="plus" size={18} /> {showForm ? "إلغاء" : "إضافة مسجد جديد"}
        </button>
      )}

      {showForm && (
        <div style={{ background: "#eafaf1", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #a9dfbf" }}>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="اسم المسجد *" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
            placeholder="رابط صورة المسجد" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.imam} onChange={e => setForm(p => ({ ...p, imam: e.target.value }))}
            placeholder="اسم الإمام" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.khatib} onChange={e => setForm(p => ({ ...p, khatib: e.target.value }))}
            placeholder="اسم الخطيب (إن كان مختلفاً)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            placeholder="موقع المسجد أو الحي" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="ملاحظات إضافية" rows={3} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #a9dfbf", fontFamily: "'Cairo', sans-serif", marginBottom: "10px", resize: "none", boxSizing: "border-box" }} />
          <button onClick={addMosque} style={{ width: "100%", padding: "12px", background: "#1a8a4a", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>
            حفظ المسجد
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div>
      ) : mosques.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🕌</div>
          <div style={{ fontWeight: "700" }}>لا توجد مساجد مضافة بعد</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {mosques.map(m => (
            <div key={m.id} style={{ borderRadius: "14px", overflow: "hidden", border: "1.5px solid #e8e8e8", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", cursor: "pointer", position: "relative" }}
              onClick={() => setSelected(m)}>
              {m.image_url ? (
                <img src={m.image_url} alt={m.name} style={{ width: "100%", height: "120px", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
              ) : (
                <div style={{ width: "100%", height: "120px", background: "linear-gradient(135deg, #1a8a4a, #145a32)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
                  🕌
                </div>
              )}
              <div style={{ padding: "10px" }}>
                <div style={{ fontWeight: "800", fontSize: "13px", color: "#2c3e50", textAlign: "center" }}>{m.name}</div>
                {m.location && <div style={{ fontSize: "11px", color: "#888", textAlign: "center", marginTop: "4px" }}>📍 {m.location}</div>}
              </div>
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); deleteMosque(m.id); }} style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(231,76,60,0.9)", border: "none", borderRadius: "6px", padding: "4px 6px", cursor: "pointer" }}>
                  <Icon name="trash" size={13} color="#fff" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal التفاصيل */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "380px", overflow: "hidden", maxHeight: "85vh", overflowY: "auto" }}>
            {selected.image_url ? (
              <img src={selected.image_url} alt={selected.name} style={{ width: "100%", height: "220px", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "220px", background: "linear-gradient(135deg, #1a8a4a, #145a32)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "80px" }}>🕌</div>
            )}
            <div style={{ padding: "20px" }}>
              <div style={{ fontWeight: "800", fontSize: "18px", color: "#2c3e50", marginBottom: "16px", textAlign: "center" }}>{selected.name}</div>
              {selected.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", background: "#f8f9fa", borderRadius: "10px", padding: "10px" }}>
                  <span style={{ fontSize: "18px" }}>📍</span>
                  <div>
                    <div style={{ fontSize: "11px", color: "#888" }}>الموقع</div>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "#2c3e50" }}>{selected.location}</div>
                  </div>
                </div>
              )}
              {selected.imam && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", background: "#eafaf1", borderRadius: "10px", padding: "10px" }}>
                  <span style={{ fontSize: "18px" }}>👳</span>
                  <div>
                    <div style={{ fontSize: "11px", color: "#888" }}>الإمام</div>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "#2c3e50" }}>{selected.imam}</div>
                  </div>
                </div>
              )}
              {selected.khatib && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", background: "#ebf5fb", borderRadius: "10px", padding: "10px" }}>
                  <span style={{ fontSize: "18px" }}>🎙️</span>
                  <div>
                    <div style={{ fontSize: "11px", color: "#888" }}>الخطيب</div>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "#2c3e50" }}>{selected.khatib}</div>
                  </div>
                </div>
              )}
              {selected.notes && (
                <div style={{ background: "#fdf2e9", borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>معلومات عن المسجد</div>
                  <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.7" }}>{selected.notes}</div>
                </div>
              )}
              <button onClick={() => setSelected(null)} style={{ width: "100%", padding: "12px", background: "#1a8a4a", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", fontSize: "14px", cursor: "pointer", marginTop: "8px" }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ==================== CURRENCY PAGE ====================
function CurrencyPage({ onBack }) {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [amount, setAmount] = useState("1");
  const [base, setBase] = useState("USD");
  const [lastUpdated, setLastUpdated] = useState("");

  const CURRENCIES = [
    { code: "TRY", label: "ليرة تركية", flag: "🇹🇷" },
    { code: "USD", label: "دولار أمريكي", flag: "🇺🇸" },
    { code: "SYP", label: "ليرة سورية", flag: "🇸🇾" },
    { code: "SYP_OLD", label: "ليرة سورية قديمة", flag: "🏛️" },
  ];

  const COLORS = {
    TRY: { bg: "#fdf2e9", border: "#f0b27a", text: "#d35400" },
    USD: { bg: "#eafaf1", border: "#a9dfbf", text: "#1a8a4a" },
    SYP: { bg: "#ebf5fb", border: "#aed6f1", text: "#1a5276" },
    SYP_OLD: { bg: "#f5eef8", border: "#d2b4de", text: "#6c3483" },
  };

  useEffect(() => { fetchRates(); }, []);

  async function fetchRates() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      if (!data.rates) throw new Error();
      const r = {
        USD: 1,
        TRY: data.rates.TRY || 32.5,
        SYP: data.rates.SYP || 12900,
      };
      r.SYP_OLD = r.SYP * 100;
      setRates(r);
      setLastUpdated(new Date().toLocaleTimeString("ar-SY"));
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  function convert(targetCode) {
    if (!rates || !amount || isNaN(Number(amount))) return "—";
    const val = parseFloat(amount);
    const inUSD = val / rates[base];
    const result = inUSD * rates[targetCode];
    if (targetCode === "SYP" || targetCode === "SYP_OLD") {
      return result.toLocaleString("ar-SY", { maximumFractionDigits: 0 });
    }
    return result.toLocaleString("ar-SY", { maximumFractionDigits: 2 });
  }

  function getRate(targetCode) {
    if (!rates) return "—";
    const r = rates[targetCode] / rates[base];
    if (targetCode === "SYP" || targetCode === "SYP_OLD") {
      return r.toLocaleString("ar-SY", { maximumFractionDigits: 0 });
    }
    return r.toLocaleString("ar-SY", { maximumFractionDigits: 2 });
  }

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={onBack} style={{
        background: "#f0f0f0", border: "none", borderRadius: "10px",
        padding: "8px 16px", cursor: "pointer",
        fontFamily: "'Cairo', sans-serif", marginBottom: "16px", fontWeight: "700",
      }}>← رجوع</button>

      <div style={{
        background: "linear-gradient(135deg, #27ae60, #1e8449)",
        borderRadius: "14px", padding: "16px", marginBottom: "16px",
        color: "#fff", textAlign: "center",
      }}>
        <div style={{ fontWeight: "800", fontSize: "18px" }}>💱 حاسبة العملات</div>
        {lastUpdated && (
          <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>
            آخر تحديث: {lastUpdated}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري تحميل الأسعار...</div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "30px" }}>
          <div style={{ color: "#e74c3c", marginBottom: "12px", fontSize: "14px" }}>
            تعذر تحميل الأسعار، تحقق من الاتصال
          </div>
          <button onClick={fetchRates} style={{
            background: "#27ae60", color: "#fff", border: "none",
            borderRadius: "10px", padding: "10px 20px",
            fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer",
          }}>إعادة المحاولة</button>
        </div>
      ) : (
        <>
          <div style={{
            background: "#fff", borderRadius: "14px", padding: "16px",
            marginBottom: "14px", border: "1.5px solid #e8e8e8",
          }}>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>أدخل المبلغ</div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              style={{
                width: "100%", padding: "12px", borderRadius: "10px",
                border: "2px solid #e8e8e8", fontFamily: "'Cairo', sans-serif",
                fontSize: "22px", fontWeight: "800", textAlign: "center",
                boxSizing: "border-box", outline: "none", color: "#2c3e50",
              }}
            />
          </div>

          <div style={{
            background: "#fff", borderRadius: "14px", padding: "14px",
            marginBottom: "16px", border: "1.5px solid #e8e8e8",
          }}>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "10px" }}>من عملة</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => setBase(c.code)}
                  style={{
                    padding: "10px 8px", borderRadius: "10px",
                    border: `2px solid ${base === c.code ? COLORS[c.code].text : "#e8e8e8"}`,
                    background: base === c.code ? COLORS[c.code].bg : "#fafafa",
                    cursor: "pointer", fontFamily: "'Cairo', sans-serif",
                    fontSize: "12px", fontWeight: "700",
                    color: base === c.code ? COLORS[c.code].text : "#555",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{c.flag}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CURRENCIES.filter(c => c.code !== base).map(c => (
              <div key={c.code} style={{
                background: COLORS[c.code].bg, borderRadius: "14px", padding: "16px",
                border: `1.5px solid ${COLORS[c.code].border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "28px" }}>{c.flag}</span>
                  <div>
                    <div style={{ fontSize: "12px", color: "#888" }}>{c.label}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                      1 {CURRENCIES.find(x => x.code === base)?.label} = {getRate(c.code)}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontWeight: "900", fontSize: "20px",
                  color: COLORS[c.code].text, direction: "ltr",
                }}>
                  {convert(c.code)}
                </div>
              </div>
            ))}
          </div>

          <button onClick={fetchRates} style={{
            width: "100%", marginTop: "16px", padding: "12px",
            background: "#fff", border: "1.5px solid #e8e8e8",
            borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
            fontSize: "13px", fontWeight: "700", color: "#555",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "8px",
          }}>
            🔄 تحديث الأسعار
          </button>

          <div style={{ textAlign: "center", fontSize: "11px", color: "#bbb", marginTop: "10px" }}>
            * أسعار الليرة السورية قد تختلف عن سعر السوق الحر
          </div>
        </>
      )}
    </div>
  );
}
// ==================== CITY SERVICES PAGE ====================
function CityServicesPage({ isAdmin }) {
  const [currentService, setCurrentService] = useState(null);

  const services = [
    { id: "prayer", label: "أوقات الصلاة", icon: "🕐", color: "#1a8a4a", bg: "#eafaf1" },
    { id: "water", label: "جدول المياه", icon: "💧", color: "#2980b9", bg: "#ebf5fb" },
    { id: "poll", label: "استطلاع رأي", icon: "📊", color: "#8e44ad", bg: "#f5eef8" },
    { id: "events", label: "الفعاليات", icon: "🗓️", color: "#d35400", bg: "#fdf2e9" },
    { id: "weather", label: "الطقس", icon: "🌤️", color: "#1a5276", bg: "#eaf2ff" },
    { id: "gallery", label: "معرض الصور", icon: "📸", color: "#c0392b", bg: "#fdedec" },
{ id: "currency", label: "حاسبة العملات", icon: "💱", color: "#27ae60", bg: "#eafaf1" },
  ];

  if (currentService === "prayer") return <PrayerTimesPage onBack={() => setCurrentService(null)} />;
  if (currentService === "water") return <WaterSchedulePage isAdmin={isAdmin} onBack={() => setCurrentService(null)} />;
  if (currentService === "poll") return <PollPage isAdmin={isAdmin} onBack={() => setCurrentService(null)} />;
  if (currentService === "events") return <EventsPage isAdmin={isAdmin} onBack={() => setCurrentService(null)} />;
  if (currentService === "weather") return <WeatherPage onBack={() => setCurrentService(null)} />;
  if (currentService === "gallery") return <GalleryPage isAdmin={isAdmin} onBack={() => setCurrentService(null)} />;
if (currentService === "currency") return <CurrencyPage onBack={() => setCurrentService(null)} />;

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {services.map((s, i) => (
          <button key={s.id} onClick={() => setCurrentService(s.id)} style={{
            background: s.bg, border: `2px solid ${s.color}22`, borderRadius: "16px",
            padding: "24px 8px", cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", gap: "10px", transition: "all 0.2s ease",
            animation: `fadeInUp 0.4s ease ${i * 0.07}s both`,
          }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            onTouchStart={e => e.currentTarget.style.transform = "scale(0.95)"}
            onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <span style={{ fontSize: "36px" }}>{s.icon}</span>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: "13px", fontWeight: "700", color: "#2c3e50", textAlign: "center" }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== PRAYER TIMES PAGE ====================
function PrayerTimesPage({ onBack }) {
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.aladhan.com/v1/timingsByCity?city=Idlib&country=Syria&method=3&school=1")      .then(r => r.json())
      .then(d => { setTimes(d.data.timings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  const [banner, setBanner] = useState(null);
  const [editingBanner, setEditingBanner] = useState(false);
  const [tempBanner, setTempBanner] = useState("");

  useEffect(() => {
    supabase("settings", "GET", null, "?key=eq.prayer_banner").then(data => {
      if (data && data[0]) setBanner(data[0].value);
    });
  }, []);

  async function saveBanner() {
    const existing = await supabase("settings", "GET", null, "?key=eq.prayer_banner");
    if (existing && existing.length > 0) {
      await supabase("settings", "PATCH", { value: tempBanner }, "?key=eq.prayer_banner");
    } else {
      await supabase("settings", "POST", { key: "prayer_banner", value: tempBanner });
    }
    setBanner(tempBanner);
    setEditingBanner(false);
  }

  async function deleteBanner() {
    await supabase("settings", "DELETE", null, "?key=eq.prayer_banner");
    setBanner(null);
  }
  const prayers = [
    { name: "الفجر", key: "Fajr", icon: "🌙" },
    { name: "الشروق", key: "Sunrise", icon: "🌅" },
    { name: "الظهر", key: "Dhuhr", icon: "☀️" },
    { name: "العصر", key: "Asr", icon: "🌤️" },
    { name: "المغرب", key: "Maghrib", icon: "🌇" },
    { name: "العشاء", key: "Isha", icon: "🌃" },
  ];

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={onBack} style={{ background: "#f0f0f0", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", marginBottom: "16px", fontWeight: "700" }}>
        ← رجوع
      </button>
      <div style={{ background: "linear-gradient(135deg, #1a5276, #2980b9)", borderRadius: "14px", padding: "16px", marginBottom: "16px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontSize: "13px", opacity: 0.8 }}>{new Date().toLocaleDateString("ar-SY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        <div style={{ fontWeight: "800", fontSize: "18px", marginTop: "4px" }}>🕌 أوقات الصلاة - بنش</div>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div>
      ) : !times ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#e74c3c" }}>تعذر تحميل الأوقات، تحقق من الاتصال</div>
      ) : (
        prayers.map(p => (
          <div key={p.key} style={{ background: "#fff", borderRadius: "12px", padding: "14px 16px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1.5px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>{p.icon}</span>
              <span style={{ fontWeight: "700", fontSize: "15px", color: "#2c3e50" }}>{p.name}</span>
            </div>
            <span style={{ fontWeight: "800", fontSize: "18px", color: "#1a5276", direction: "ltr" }}>{times[p.key]}</span>
          </div>
        ))
      )}
    </div>
  );
}

// ==================== WATER SCHEDULE PAGE ====================
function WaterSchedulePage({ isAdmin, onBack }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ neighborhood: "", days: "", time: "", notes: "" });

  useEffect(() => { loadSchedule(); }, []);

  async function loadSchedule() {
    setLoading(true);
    const data = await supabase("water_schedule", "GET", null, "?order=created_at.asc");
    setSchedule(data || []);
    setLoading(false);
  }

  async function addEntry() {
    if (!form.neighborhood.trim()) return alert("اسم الحي مطلوب!");
    await supabase("water_schedule", "POST", form);
    setForm({ neighborhood: "", days: "", time: "", notes: "" });
    setShowForm(false);
    loadSchedule();
  }

  async function deleteEntry(id) {
    if (!confirm("حذف؟")) return;
    await supabase("water_schedule", "DELETE", null, `?id=eq.${id}`);
    loadSchedule();
  }

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={onBack} style={{ background: "#f0f0f0", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", marginBottom: "16px", fontWeight: "700" }}>
        ← رجوع
      </button>
      <div style={{ background: "linear-gradient(135deg, #1a5276, #2980b9)", borderRadius: "14px", padding: "16px", marginBottom: "16px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontWeight: "800", fontSize: "18px" }}>💧 جدول توزيع المياه</div>
      </div>
      {isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #2980b9, #1a5276)", color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px" }}>
          + إضافة موعد
        </button>
      )}
      {showForm && (
        <div style={{ background: "#ebf5fb", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #aed6f1" }}>
          <input value={form.neighborhood} onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))} placeholder="اسم الحي *" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #aed6f1", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.days} onChange={e => setForm(p => ({ ...p, days: e.target.value }))} placeholder="أيام الوصول (مثال: السبت والثلاثاء)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #aed6f1", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="وقت الوصول (مثال: 8 صباحاً)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #aed6f1", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #aed6f1", fontFamily: "'Cairo', sans-serif", marginBottom: "10px", boxSizing: "border-box" }} />
          <button onClick={addEntry} style={{ width: "100%", padding: "12px", background: "#2980b9", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>حفظ</button>
        </div>
      )}
      {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div> :
        schedule.length === 0 ? <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>لا يوجد جدول بعد</div> :
        schedule.map(s => (
          <div key={s.id} style={{ background: "#fff", borderRadius: "12px", padding: "14px 16px", marginBottom: "10px", border: "1.5px solid #aed6f1", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontWeight: "800", fontSize: "15px", color: "#1a5276" }}>📍 {s.neighborhood}</div>
              {isAdmin && <button onClick={() => deleteEntry(s.id)} style={{ background: "#fdedec", border: "none", borderRadius: "8px", padding: "5px 7px", cursor: "pointer" }}><Icon name="trash" size={14} color="#c0392b" /></button>}
            </div>
            {s.days && <div style={{ fontSize: "13px", color: "#555", marginTop: "6px" }}>📅 {s.days}</div>}
            {s.time && <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>🕐 {s.time}</div>}
            {s.notes && <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>📝 {s.notes}</div>}
          </div>
        ))
      }
    </div>
  );
}

// ==================== POLL PAGE ====================
function PollPage({ isAdmin, onBack }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: "", option1: "", option2: "", option3: "", option4: "" });

  useEffect(() => { loadPoll(); }, []);

  async function loadPoll() {
    setLoading(true);
    const data = await supabase("polls", "GET", null, "?order=created_at.desc&limit=1");
    if (data && data.length > 0) {
      setPoll(data[0]);
      const v = localStorage.getItem("voted_poll_" + data[0].id);
      if (v) setVoted(true);
    }
    setLoading(false);
  }

  async function createPoll() {
    if (!form.question.trim() || !form.option1.trim() || !form.option2.trim()) return alert("السؤال وخيارين على الأقل مطلوبان!");
    const options = [form.option1, form.option2, form.option3, form.option4].filter(o => o.trim());
    const votes = options.map(() => 0);
    await supabase("polls", "POST", { question: form.question, options: JSON.stringify(options), votes: JSON.stringify(votes) });
    setForm({ question: "", option1: "", option2: "", option3: "", option4: "" });
    setShowForm(false);
    loadPoll();
  }

  async function vote(index) {
    if (voted || !poll) return;
    const votes = JSON.parse(poll.votes || "[]");
    votes[index] = (votes[index] || 0) + 1;
    await supabase("polls", "PATCH", { votes: JSON.stringify(votes) }, `?id=eq.${poll.id}`);
    localStorage.setItem("voted_poll_" + poll.id, "1");
    setVoted(true);
    loadPoll();
  }

  async function deletePoll() {
    if (!confirm("حذف الاستطلاع؟")) return;
    await supabase("polls", "DELETE", null, `?id=eq.${poll.id}`);
    setPoll(null);
  }

  const options = poll ? JSON.parse(poll.options || "[]") : [];
  const votes = poll ? JSON.parse(poll.votes || "[]") : [];
  const total = votes.reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={onBack} style={{ background: "#f0f0f0", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", marginBottom: "16px", fontWeight: "700" }}>← رجوع</button>
      <div style={{ background: "linear-gradient(135deg, #8e44ad, #6c3483)", borderRadius: "14px", padding: "16px", marginBottom: "16px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontWeight: "800", fontSize: "18px" }}>📊 استطلاع الرأي</div>
      </div>
      {isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #8e44ad, #6c3483)", color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px" }}>
          + إنشاء استطلاع جديد
        </button>
      )}
      {showForm && (
        <div style={{ background: "#f5eef8", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #d2b4de" }}>
          <input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="السؤال *" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d2b4de", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          {["option1","option2","option3","option4"].map((k,i) => (
            <input key={k} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={`الخيار ${i+1} ${i < 2 ? "*" : "(اختياري)"}`} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d2b4de", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          ))}
          <button onClick={createPoll} style={{ width: "100%", padding: "12px", background: "#8e44ad", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>نشر الاستطلاع</button>
        </div>
      )}
      {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div> :
        !poll ? <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>لا يوجد استطلاع حالياً</div> : (
          <div style={{ background: "#fff", borderRadius: "14px", padding: "16px", border: "1.5px solid #d2b4de" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ fontWeight: "800", fontSize: "15px", color: "#2c3e50", flex: 1 }}>{poll.question}</div>
              {isAdmin && <button onClick={deletePoll} style={{ background: "#fdedec", border: "none", borderRadius: "8px", padding: "5px 7px", cursor: "pointer" }}><Icon name="trash" size={14} color="#c0392b" /></button>}
            </div>
            {options.map((opt, i) => {
              const pct = total > 0 ? Math.round((votes[i] || 0) / total * 100) : 0;
              return (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <button onClick={() => vote(i)} disabled={voted} style={{
                    width: "100%", padding: "12px 14px", borderRadius: "10px", border: `2px solid #8e44ad`,
                    background: voted ? "#f5eef8" : "#fff", cursor: voted ? "default" : "pointer",
                    fontFamily: "'Cairo', sans-serif", fontSize: "14px", fontWeight: "600", color: "#2c3e50",
                    textAlign: "right", position: "relative", overflow: "hidden",
                  }}>
                    {voted && <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: `${pct}%`, background: "#d2b4de", opacity: 0.4, transition: "width 0.5s" }} />}
                    <span style={{ position: "relative" }}>{opt}</span>
                    {voted && <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "800", color: "#8e44ad" }}>{pct}%</span>}
                  </button>
                </div>
              );
            })}
            <div style={{ textAlign: "center", fontSize: "12px", color: "#888", marginTop: "8px" }}>
              {voted ? `إجمالي الأصوات: ${total}` : "اضغط على خيارك للتصويت"}
            </div>
          </div>
        )
      }
    </div>
  );
}

// ==================== EVENTS PAGE ====================
function EventsPage({ isAdmin, onBack }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "", description: "" });

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    const data = await supabase("events", "GET", null, "?order=date.asc");
    setEvents(data || []);
    setLoading(false);
  }

  async function addEvent() {
    if (!form.title.trim() || !form.date) return alert("العنوان والتاريخ مطلوبان!");
    await supabase("events", "POST", form);
    setForm({ title: "", date: "", time: "", location: "", description: "" });
    setShowForm(false);
    loadEvents();
  }

  async function deleteEvent(id) {
    if (!confirm("حذف الفعالية؟")) return;
    await supabase("events", "DELETE", null, `?id=eq.${id}`);
    loadEvents();
  }

  const formatDate = d => new Date(d).toLocaleDateString("ar-SY", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={onBack} style={{ background: "#f0f0f0", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", marginBottom: "16px", fontWeight: "700" }}>← رجوع</button>
      <div style={{ background: "linear-gradient(135deg, #d35400, #a04000)", borderRadius: "14px", padding: "16px", marginBottom: "16px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontWeight: "800", fontSize: "18px" }}>🗓️ الفعاليات والمناسبات</div>
      </div>
      {isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #d35400, #a04000)", color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px" }}>
          + إضافة فعالية
        </button>
      )}
      {showForm && (
        <div style={{ background: "#fdf2e9", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #f0b27a" }}>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="عنوان الفعالية *" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f0b27a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f0b27a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="الوقت (مثال: 6 مساءً)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f0b27a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="المكان" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f0b27a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="وصف الفعالية" rows={3} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f0b27a", fontFamily: "'Cairo', sans-serif", marginBottom: "10px", resize: "none", boxSizing: "border-box" }} />
          <button onClick={addEvent} style={{ width: "100%", padding: "12px", background: "#d35400", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>حفظ</button>
        </div>
      )}
      {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div> :
        events.length === 0 ? <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>لا توجد فعاليات قادمة</div> :
        events.map(ev => (
          <div key={ev.id} style={{ background: "#fff", borderRadius: "14px", marginBottom: "12px", overflow: "hidden", border: "1.5px solid #f0b27a" }}>
            <div style={{ background: "linear-gradient(135deg, #d35400, #a04000)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#fff", fontWeight: "800", fontSize: "15px" }}>{ev.title}</div>
              {isAdmin && <button onClick={() => deleteEvent(ev.id)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "5px 7px", cursor: "pointer" }}><Icon name="trash" size={14} color="#fff" /></button>}
            </div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>📅 {formatDate(ev.date)}</div>
              {ev.time && <div style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>🕐 {ev.time}</div>}
              {ev.location && <div style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>📍 {ev.location}</div>}
              {ev.description && <div style={{ fontSize: "13px", color: "#777", marginTop: "8px", lineHeight: "1.6" }}>{ev.description}</div>}
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ==================== WEATHER PAGE ====================
function WeatherPage({ onBack }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://wttr.in/Binnish,Syria?format=j1")
      .then(r => r.json())
      .then(d => { setWeather(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const current = weather?.current_condition?.[0];
  const desc = current?.weatherDesc?.[0]?.value || "";

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={onBack} style={{ background: "#f0f0f0", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", marginBottom: "16px", fontWeight: "700" }}>← رجوع</button>
      <div style={{ background: "linear-gradient(135deg, #1a5276, #2980b9)", borderRadius: "14px", padding: "16px", marginBottom: "16px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontWeight: "800", fontSize: "18px" }}>🌤️ طقس بنش</div>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div> :
        !current ? <div style={{ textAlign: "center", padding: "40px", color: "#e74c3c" }}>تعذر تحميل بيانات الطقس</div> : (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid #aed6f1", textAlign: "center" }}>
            <div style={{ fontSize: "72px", marginBottom: "8px" }}>
              {current.weatherCode <= 113 ? "☀️" : current.weatherCode <= 176 ? "⛅" : current.weatherCode <= 248 ? "🌫️" : current.weatherCode <= 314 ? "🌧️" : "⛈️"}
            </div>
            <div style={{ fontSize: "48px", fontWeight: "900", color: "#1a5276" }}>{current.temp_C}°</div>
            <div style={{ fontSize: "16px", color: "#555", marginBottom: "16px" }}>{desc}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "#ebf5fb", borderRadius: "12px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "#888" }}>الرطوبة</div>
                <div style={{ fontWeight: "800", color: "#1a5276", fontSize: "16px" }}>{current.humidity}%</div>
              </div>
              <div style={{ background: "#ebf5fb", borderRadius: "12px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "#888" }}>الرياح</div>
                <div style={{ fontWeight: "800", color: "#1a5276", fontSize: "16px" }}>{current.windspeedKmph} km/h</div>
              </div>
              <div style={{ background: "#ebf5fb", borderRadius: "12px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "#888" }}>الإحساس</div>
                <div style={{ fontWeight: "800", color: "#1a5276", fontSize: "16px" }}>{current.FeelsLikeC}°</div>
              </div>
              <div style={{ background: "#ebf5fb", borderRadius: "12px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "#888" }}>الرؤية</div>
                <div style={{ fontWeight: "800", color: "#1a5276", fontSize: "16px" }}>{current.visibility} km</div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

// ==================== GALLERY PAGE ====================
function GalleryPage({ isAdmin, onBack }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", image_url: "" });
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadPhotos(); }, []);

  async function loadPhotos() {
    setLoading(true);
    const data = await supabase("gallery", "GET", null, "?order=created_at.desc");
    setPhotos(data || []);
    setLoading(false);
  }

  async function addPhoto() {
    if (!form.image_url.trim()) return alert("رابط الصورة مطلوب!");
    await supabase("gallery", "POST", form);
    setForm({ title: "", image_url: "" });
    setShowForm(false);
    loadPhotos();
  }

  async function deletePhoto(id) {
    if (!confirm("حذف الصورة؟")) return;
    await supabase("gallery", "DELETE", null, `?id=eq.${id}`);
    loadPhotos();
  }

  return (
    <div style={{ padding: "16px", fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={onBack} style={{ background: "#f0f0f0", border: "none", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", marginBottom: "16px", fontWeight: "700" }}>← رجوع</button>
      <div style={{ background: "linear-gradient(135deg, #c0392b, #922b21)", borderRadius: "14px", padding: "16px", marginBottom: "16px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontWeight: "800", fontSize: "18px" }}>📸 معرض صور بنش</div>
      </div>
      {isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #c0392b, #922b21)", color: "#fff", border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px" }}>
          + إضافة صورة
        </button>
      )}
      {showForm && (
        <div style={{ background: "#fdedec", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "2px solid #f1948a" }}>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="عنوان الصورة (اختياري)" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f1948a", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
          <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="رابط الصورة *" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f1948a", fontFamily: "'Cairo', sans-serif", marginBottom: "10px", boxSizing: "border-box" }} />
          <button onClick={addPhoto} style={{ width: "100%", padding: "12px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>حفظ</button>
        </div>
      )}
      {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>جاري التحميل...</div> :
        photos.length === 0 ? <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>لا توجد صور بعد</div> : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {photos.map(p => (
              <div key={p.id} style={{ borderRadius: "12px", overflow: "hidden", position: "relative", cursor: "pointer" }} onClick={() => setSelected(p)}>
                <img src={p.image_url} alt={p.title} style={{ width: "100%", height: "130px", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                {p.title && <div style={{ position: "absolute", bottom: 0, right: 0, left: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "8px", color: "#fff", fontSize: "11px", fontWeight: "700" }}>{p.title}</div>}
                {isAdmin && <button onClick={e => { e.stopPropagation(); deletePhoto(p.id); }} style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(231,76,60,0.9)", border: "none", borderRadius: "6px", padding: "4px 6px", cursor: "pointer" }}><Icon name="trash" size={13} color="#fff" /></button>}
              </div>
            ))}
          </div>
        )
      }
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "400px" }}>
            <img src={selected.image_url} alt={selected.title} style={{ width: "100%", borderRadius: "14px", maxHeight: "70vh", objectFit: "contain" }} />
            {selected.title && <div style={{ color: "#fff", textAlign: "center", marginTop: "12px", fontWeight: "700", fontSize: "15px" }}>{selected.title}</div>}
            <button onClick={() => setSelected(null)} style={{ width: "100%", marginTop: "12px", padding: "12px", background: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}
// ==================== MAIN APP ====================
// ==================== NOTIFICATIONS SYSTEM ====================
function DriverLikeButton({ driverId }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const isLiked = localStorage.getItem(`liked_driver_${driverId}`);
    if (isLiked) setLiked(true);
    loadLikes();
  }, [driverId]);

  async function loadLikes() {
    try {
      const data = await supabase("driver_likes", "GET", null, `?driver_id=eq.${driverId}`);
      if (data && Array.isArray(data)) {
        setLikes(data.length);
        // حفظ العدد في localStorage كنسخة احتياطية
        localStorage.setItem(`likes_count_${driverId}`, data.length.toString());
      } else {
        // إذا فشل التحميل، استخدم النسخة المحفوظة
        const savedCount = localStorage.getItem(`likes_count_${driverId}`);
        setLikes(savedCount ? parseInt(savedCount) : 0);
      }
    } catch (error) {
      console.error("Error loading likes:", error);
      // في حالة الخطأ، استخدم النسخة المحفوظة
      const savedCount = localStorage.getItem(`likes_count_${driverId}`);
      setLikes(savedCount ? parseInt(savedCount) : 0);
    }
  }

  async function toggleLike() {
    if (liked) return;
    
    try {
      // حفظ الإعجاب في قاعدة البيانات
      await supabase("driver_likes", "POST", { driver_id: driverId });
      
      // تحديث الحالة المحلية
      localStorage.setItem(`liked_driver_${driverId}`, "1");
      setLiked(true);
      
      // زيادة العدد وحفظه
      const newCount = likes + 1;
      setLikes(newCount);
      localStorage.setItem(`likes_count_${driverId}`, newCount.toString());
      
      console.log("✅ تم حفظ الإعجاب:", driverId, "العدد الجديد:", newCount);
    } catch (error) {
      console.error("❌ خطأ في حفظ الإعجاب:", error);
      alert("حدث خطأ، حاول مرة أخرى");
    }
  }

  return (
    <button
      onClick={toggleLike}
      style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        background: "#fff",
        border: "none",
        borderRadius: "20px",
        padding: "6px 12px",
        cursor: liked ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "13px",
        fontWeight: "700",
        fontFamily: "'Cairo', sans-serif",
        color: liked ? "#1877f2" : "#65676b",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        transition: "all 0.2s ease",
        userSelect: "none",
        zIndex: 10,
      }}
      onMouseEnter={e => {
        if (!liked) e.currentTarget.style.background = "#f2f3f5";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "#fff";
      }}
      onMouseDown={e => {
        if (!liked) {
          e.currentTarget.style.transform = "scale(0.92)";
        }
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span style={{ 
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        transform: liked ? "scale(1.2)" : "scale(1)",
        transition: "transform 0.2s ease",
      }}>
        {liked ? "👍" : "👍🏻"}
      </span>
      <span style={{ 
        fontSize: "13px",
        fontWeight: "600",
        minWidth: "16px",
        textAlign: "center",
      }}>
        {likes}
      </span>
    </button>
  );
}
function VisitorStats({ darkMode }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardBg = darkMode ? "#16213e" : "#fff";
  const borderColor = darkMode ? "#2a2a4a" : "#f0f0f0";
  const textColor = darkMode ? "#e0e0e0" : "#2c3e50";

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    setLoading(true);
    const data = await supabase("visitor_logs", "GET", null, "");
    if (!data) { setLoading(false); return; }
    const now = new Date();
    const today = data.filter(v => new Date(v.visited_at).toDateString() === now.toDateString()).length;
    const month = data.filter(v => {
      const d = new Date(v.visited_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const year = data.filter(v => new Date(v.visited_at).getFullYear() === now.getFullYear()).length;
    const total = data.length;
    setStats({ today, month, year, total });
    setLoading(false);
  }

  return (
    <div style={{ background: cardBg, borderRadius: "14px", padding: "16px", marginBottom: "10px", border: `1.5px solid ${borderColor}` }}>
      <div style={{ fontWeight: "800", fontSize: "14px", color: "#2980b9", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>👁️ إحصائيات الزوار</span>
        <button onClick={loadStats} style={{ background: "none", border: "1.5px solid #2980b9", borderRadius: "8px", padding: "4px 10px", color: "#2980b9", fontFamily: "'Cairo', sans-serif", fontSize: "12px", cursor: "pointer" }}>تحديث</button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#aaa", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>جاري التحميل...</div>
      ) : !stats ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#e74c3c", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>تعذر تحميل البيانات</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { label: "اليوم", value: stats.today, icon: "📅", color: "#27ae60" },
            { label: "هذا الشهر", value: stats.month, icon: "🗓️", color: "#2980b9" },
            { label: "هذه السنة", value: stats.year, icon: "📆", color: "#8e44ad" },
            { label: "إجمالي الكل", value: stats.total, icon: "👥", color: "#c0392b" },
          ].map(s => (
            <div key={s.label} style={{ background: `${s.color}12`, border: `1.5px solid ${s.color}33`, borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>{s.icon}</div>
              <div style={{ fontWeight: "900", fontSize: "22px", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: textColor, fontFamily: "'Cairo', sans-serif", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function NotifBell({ isAdmin }) {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notif_seen") || "[]"); } catch { return []; }
  });

  useEffect(() => { loadNotifs(); }, []);

  async function loadNotifs() {
    const data = await supabase("notifications", "GET", null, "?order=created_at.desc&limit=20");
    setNotifs(data || []);
  }

  const unseen = notifs.filter(n => !seen.includes(n.id)).length;

  function markAllSeen() {
    const allIds = notifs.map(n => n.id);
    setSeen(allIds);
    localStorage.setItem("notif_seen", JSON.stringify(allIds));
  }

  const SECTION_LABELS = {
    contacts: "جهات الاتصال", news: "الأخبار", obituary: "الوفيات",
    lost: "المفقودات", ads: "الإعلانات", links: "روابط مهمة", transport: "التوصيل",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllSeen(); }}
        style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer", position: "relative" }}
      >
        <Icon name="bell" size={20} color="#fff" />
        {unseen > 0 && (
          <span style={{
            position: "absolute", top: "2px", left: "2px",
            background: "#e74c3c", color: "#fff",
            borderRadius: "50%", width: "17px", height: "17px",
            fontSize: "10px", fontWeight: "800",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unseen}</span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 999 }} />
          <div style={{
            position: "absolute", top: "44px", left: "-10px",
            width: "280px", background: "#fff", borderRadius: "14px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            zIndex: 1000, overflow: "hidden",
            border: "1px solid #eee",
          }}>
            <div style={{ padding: "12px 16px", background: "linear-gradient(135deg,#1a5276,#2980b9)", color: "#fff", fontWeight: "800", fontSize: "14px", fontFamily: "'Cairo',sans-serif" }}>
              🔔 الإشعارات
            </div>
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {notifs.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#aaa", fontSize: "13px", fontFamily: "'Cairo',sans-serif" }}>لا توجد إشعارات</div>
              ) : notifs.map(n => (
                <div key={n.id} style={{
                  padding: "12px 16px", borderBottom: "1px solid #f5f5f5",
                  background: seen.includes(n.id) ? "#fff" : "#ebf5fb",
                  fontFamily: "'Cairo',sans-serif",
                }}>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "#2c3e50", marginBottom: "3px" }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.5" }}>{n.body}</div>}
                  <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                    {n.section && <span style={{ background: "#ebf5fb", color: "#2980b9", borderRadius: "20px", padding: "1px 8px", fontSize: "10px", marginLeft: "6px" }}>{SECTION_LABELS[n.section] || n.section}</span>}
                    {new Date(n.created_at).toLocaleDateString("ar-SY")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// أداة إرسال الإشعار — تُستخدم داخل كل صفحة
async function cleanOldNotifications() {
  const data = await supabase("notifications", "GET", null, "?order=created_at.asc");
  if (data && data.length > 10) {
    const toDelete = data.slice(0, data.length - 10);
    for (const n of toDelete) {
      await supabase("notifications", "DELETE", null, `?id=eq.${n.id}`);
    }
  }
}


async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

function getCache(key) {
  try {
    const item = localStorage.getItem("cache_" + key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem("cache_" + key);
      return null;
    }
    return data;
  } catch { return null; }
}

function setCache(key, data) {
  try {
    localStorage.setItem("cache_" + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {}
}

function clearCache(key) {
  localStorage.removeItem("cache_" + key);
}
async function logVisitor() {
  const lastVisit = localStorage.getItem("last_visit_date");
  const today = new Date().toDateString();
  if (lastVisit !== today) {
    await supabase("visitor_logs", "POST", { visited_at: new Date().toISOString() });
    localStorage.setItem("last_visit_date", today);
  }
}
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
const [adminRole, setAdminRole] = useState(null);
const [adminName, setAdminName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [tickerText, setTickerText] = useState(MOCK_TICKER);
  useEffect(() => { logVisitor(); }, []);
  const fetchTicker = async () => {
    const data = await supabase("settings", "GET", null, "?key=eq.ticker");
    if (data && data[0]) setTickerText(data[0].value);
  };

  useEffect(() => { fetchTicker(); }, []);

  const saveTicker = async (text) => {
    const existing = await supabase("settings", "GET", null, "?key=eq.ticker");
    if (existing && existing.length > 0) {
      await supabase("settings", "PATCH", { value: text }, "?key=eq.ticker");
    } else {
      await supabase("settings", "POST", { key: "ticker", value: text });
    }
    setTickerText(text);
  };
  const [elecStatus, setElecStatus] = useState("on");
  const [elecTime, setElecTime] = useState(null);
  const [elecTimer, setElecTimer] = useState("");
  const fetchElectricity = async () => {
    const data = await supabase("settings", "GET", null, "?key=eq.electricity");
    if (data && data[0]) setElecStatus(data[0].value);
    const timeData = await supabase("settings", "GET", null, "?key=eq.electricity_time");
    if (timeData && timeData[0]) setElecTime(timeData[0].value);
  };

  useEffect(() => {
    fetchElectricity();
    // Poll every 30 seconds to stay in sync
    const interval = setInterval(fetchElectricity, 30000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!elecTime) return;
    const update = () => {
      const diff = Date.now() - new Date(elecTime).getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      if (hours > 0) {
        setElecTimer(`منذ ${hours} ساعة و${minutes} دقيقة`);
      } else {
        setElecTimer(`منذ ${minutes} دقيقة`);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [elecTime]);
  const toggleElectricity = async () => {
    const newStatus = elecStatus === "on" ? "off" : "on";
    const patchRes = await supabase("settings", "PATCH", { value: newStatus }, "?key=eq.electricity");
    const checkData = await supabase("settings", "GET", null, "?key=eq.electricity");
    if (!checkData || checkData.length === 0) {
      await supabase("settings", "POST", { key: "electricity", value: newStatus });
    }
    const confirmed = await supabase("settings", "GET", null, "?key=eq.electricity");
    if (confirmed && confirmed[0]) {
      setElecStatus(confirmed[0].value);
    } else {
      setElecStatus(newStatus);
    }
    await supabase("settings", "PATCH", { value: new Date().toISOString() }, "?key=eq.electricity_time");
const timeCheck = await supabase("settings", "GET", null, "?key=eq.electricity_time");
if (!timeCheck || timeCheck.length === 0) {
  await supabase("settings", "POST", { key: "electricity_time", value: new Date().toISOString() });
}

    await sendNotification(
      newStatus === "off" ? "⚡ انقطاع الكهرباء" : "✅ عادت الكهرباء",
      newStatus === "off" ? "تم إيقاف التيار الكهربائي في المنطقة" : "تم استعادة التيار الكهربائي",
      "electricity"
    );
  };
  const [editingTicker, setEditingTicker] = useState(false);
  const [alertBanner, setAlertBanner] = useState("");
const [editingBanner, setEditingBanner] = useState(false);
const [tempBanner, setTempBanner] = useState("");

useEffect(() => {
  supabase("settings", "GET", null, "?key=eq.alert_banner").then(data => {
    if (data && data[0]) setAlertBanner(data[0].value);
  });
}, []);

const saveBanner = async (text) => {
  const existing = await supabase("settings", "GET", null, "?key=eq.alert_banner");
  if (existing && existing.length > 0) {
    await supabase("settings", "PATCH", { value: text }, "?key=eq.alert_banner");
  } else {
    await supabase("settings", "POST", { key: "alert_banner", value: text });
  }
  setAlertBanner(text);
};
  const [tempTicker, setTempTicker] = useState("");

  const handleAdminToggle = async () => {
    if (isAdmin) {
      setIsAdmin(false);
      setAdminRole(null);
      setAdminName("");
      return;
    }
  
    const user = prompt("اسم المستخدم:");
    if (!user) return;
    const pass = prompt("كلمة المرور:");
    if (!pass) return;
  
    const hashedPass = await hashPassword(pass);
const data = await supabase("admins", "GET", null, 
  `?username=eq.${encodeURIComponent(user)}&password=eq.${encodeURIComponent(hashedPass)}`
);
  
    if (data && data.length > 0) {
      setIsAdmin(true);
      setAdminRole(data[0].role);
      setAdminName(data[0].username);
    } else {
      alert("اسم المستخدم أو كلمة المرور خاطئة!");
    }
  };
  const pageTitle = {
    home: "🏙️ دليل بنش",
    contacts: "جهات الاتصال",
    news: "الأخبار",
    obituary: "الوفيات",
    lost: "المفقودات والموجودات",
    ads: "الإعلانات",
    links: "روابط مهمة",
    transport: "التوصيل والمواصلات",
    settings: "الإعدادات",
  };

  return (
    <div style={{
      maxWidth: "430px",
      margin: "0 auto",
      minHeight: "100vh",
      background: darkMode ? "#1a1a2e" : "#f5f6fa",
      direction: "rtl",
      fontFamily: "'Cairo', sans-serif",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #f0f2f5; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a5276, #2980b9)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 12px rgba(26,82,118,0.3)",
      }}>
        <button
          onClick={() => setDrawerOpen(true)}
          style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer", color: "#fff" }}
        >
          <Icon name="menu" size={22} color="#fff" />
        </button>
        <span style={{ color: "#fff", fontWeight: "800", fontSize: "16px" }}>
          {pageTitle[currentPage] || "دليل بنش"}
        </span>
        {currentPage !== "home" ? (
          <button
            onClick={() => setCurrentPage("home")}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer" }}
          >
            <Icon name="home" size={20} color="#fff" />
          </button>
        ) : (
          <NotifBell isAdmin={isAdmin} />
        )}
      </div>
{/* Alert Banner */}
{alertBanner && alertBanner.trim() !== "" && (
  <div style={{
    background: "linear-gradient(135deg, #1a8a4a, #145a32)",
    color: "#fff",
    padding: "10px 16px",
    textAlign: "center",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "700",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  }}>
    <span>🕌 {alertBanner}</span>
    {isAdmin && (
      <button onClick={() => saveBanner("")} style={{
        background: "rgba(255,255,255,0.2)",
        border: "none",
        borderRadius: "6px",
        color: "#fff",
        padding: "2px 8px",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "'Cairo', sans-serif",
      }}>✕ مسح</button>
    )}
  </div>
)}
{isAdmin && (!alertBanner || alertBanner.trim() === "") && (
  <div onClick={() => { setTempBanner(""); setEditingBanner(true); }} style={{
    background: "#eafaf1",
    color: "#1a8a4a",
    textAlign: "center",
    padding: "8px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "700",
    borderBottom: "1px solid #a9dfbf",
  }}>
    ➕ إضافة إشعار خاص (صلاة خسوف، طارئ...)
  </div>
)}

{/* Edit Banner Modal */}
{editingBanner && (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
  }}>
    <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", width: "100%" }}>
      <div style={{ fontWeight: "800", marginBottom: "12px", fontSize: "15px" }}>✏️ إشعار خاص</div>
      <textarea
        value={tempBanner}
        onChange={e => setTempBanner(e.target.value)}
        placeholder="مثال: حان وقت صلاة الخسوف — اتجهوا للمساجد"
        rows={3}
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #ddd", fontFamily: "'Cairo', sans-serif", fontSize: "13px", resize: "none", boxSizing: "border-box" }}
      />
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button onClick={async () => { await saveBanner(tempBanner); setEditingBanner(false); }} style={{ flex: 1, padding: "12px", background: "#1a8a4a", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>حفظ</button>
        <button onClick={() => setEditingBanner(false)} style={{ flex: 1, padding: "12px", background: "#f0f0f0", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>إلغاء</button>
      </div>
    </div>
  </div>
)}
      {/* News Ticker */}
      <NewsTicker
  text={tickerText}
  isAdmin={isAdmin && adminRole === "super"}
  onEdit={() => { setTempTicker(tickerText); setEditingTicker(true); }}
/>

      {/* Edit Ticker Modal */}
      {editingTicker && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", width: "100%" }}>
            <div style={{ fontWeight: "800", marginBottom: "12px", fontSize: "15px" }}>تعديل الشريط الإخباري</div>
            <textarea
              value={tempTicker}
              onChange={e => setTempTicker(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #ddd", fontFamily: "'Cairo', sans-serif", fontSize: "13px", resize: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button onClick={async () => { await saveTicker(tempTicker); setEditingTicker(false); }} style={{ flex: 1, padding: "12px", background: "#2980b9", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", fontWeight: "700", cursor: "pointer" }}>حفظ</button>
              <button onClick={() => setEditingTicker(false)} style={{ flex: 1, padding: "12px", background: "#f0f0f0", border: "none", borderRadius: "10px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div style={{ paddingBottom: "20px" }}>
        {currentPage === "home" && (
          <>
            <ElectricityStatus
  status={elecStatus}
  isAdmin={isAdmin}
  onToggle={toggleElectricity}
  timer={elecTimer}
/>
            <HomeGrid onNavigate={setCurrentPage} />
          </>
        )}
        {currentPage === "contacts" && <ContactsPage isAdmin={isAdmin} />}
        {currentPage === "news" && <NewsPage isAdmin={isAdmin} adminRole={adminRole} />}
{currentPage === "obituary" && <ObituaryPage isAdmin={isAdmin} adminRole={adminRole} />}
{currentPage === "ads" && <AdsPage isAdmin={isAdmin} adminRole={adminRole} />}
{currentPage === "lost" && <LostFoundPage isAdmin={isAdmin} adminRole={adminRole} />}
{currentPage === "settings" && <SettingsPage isAdmin={isAdmin} adminRole={adminRole} darkMode={darkMode} setDarkMode={setDarkMode} />}
{currentPage === "mosques" && <MosquesPage isAdmin={isAdmin} adminRole={adminRole} />}
{currentPage === "transport" && <TransportPage isAdmin={isAdmin} adminRole={adminRole} />}
{currentPage === "links" && <LinksPage isAdmin={isAdmin} adminRole={adminRole} />}
{currentPage === "cityservices" && <CityServicesPage isAdmin={isAdmin} adminRole={adminRole} />}
      </div>

      {/* Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isAdmin={isAdmin}
        adminRole={adminRole}
        adminName={adminName}
        onAdminToggle={handleAdminToggle}
      />
    </div>
  );
} 
