import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, BedDouble, Plane, Car, Utensils, Ticket, Plus, X, Settings,
  ChevronDown, Trash2, Check, MoreHorizontal, Luggage, CalendarDays, StickyNote
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design system                                                      */
/* ------------------------------------------------------------------ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.itin-root{
  --bg:#EDF1F4; --bg2:#F2EFEB;
  --surface:#FFFFFF; --surface-2:#F7F9FB;
  --ink:#1E2A38; --ink-soft:#56636F; --ink-mute:#94A1AC;
  --line:#E4EAEF; --line-soft:#EEF2F5;
  --primary:#F76C5E; --primary-soft:#FFE8E4; --primary-ink:#C73E30;
  --sky:#3E8FD6; --sky-soft:#E2EFFB;
  --teal:#1FA89B; --teal-soft:#DBF3EF;
  --amber:#E8962E; --amber-soft:#FBEBD2;
  --indigo:#6C72E0; --indigo-soft:#E8E9FC;
  --green:#37A867; --green-soft:#DCF1E5;
  --grey:#8B98A4; --grey-soft:#EDF1F4;
  --font-display:'Bricolage Grotesque',system-ui,sans-serif;
  --font-body:'Plus Jakarta Sans',system-ui,sans-serif;
  --font-mono:'DM Mono',ui-monospace,monospace;
  --radius:16px; --radius-sm:10px;
  --shadow:0 1px 2px rgba(30,42,56,.04),0 8px 24px rgba(30,42,56,.06);
  --shadow-lift:0 8px 16px rgba(30,42,56,.08),0 20px 48px rgba(30,42,56,.12);

  font-family:var(--font-body); color:var(--ink);
  min-height:100vh;
  background:linear-gradient(168deg,var(--bg) 0%, var(--bg2) 100%);
  -webkit-font-smoothing:antialiased;
}
.itin-root *{box-sizing:border-box;}
.itin-root button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
.itin-root input,.itin-root textarea,.itin-root select{font-family:inherit;color:var(--ink);}

/* ---- top bar ---- */
.topbar{
  position:sticky;top:0;z-index:30;
  backdrop-filter:saturate(1.4) blur(10px);
  background:rgba(247,249,251,.82);
  border-bottom:1px solid var(--line);
}
.topbar-inner{max-width:1180px;margin:0 auto;padding:18px 28px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;}
.brand{display:flex;align-items:center;gap:11px;color:var(--ink-mute);font-weight:600;font-size:13px;letter-spacing:.04em;text-transform:uppercase;}
.brand-mark{width:30px;height:30px;border-radius:9px;background:var(--ink);color:#fff;display:grid;place-items:center;}
.title-block{flex:1;min-width:240px;}
.trip-title{
  font-family:var(--font-display);font-weight:600;font-size:30px;letter-spacing:-.01em;
  color:var(--ink);background:transparent;border:none;outline:none;width:100%;padding:2px 4px;
  border-radius:8px;margin-left:-4px;
}
.trip-title:hover{background:rgba(30,42,56,.04);}
.trip-title:focus{background:var(--surface);box-shadow:0 0 0 2px var(--primary-soft),0 0 0 3px var(--primary);}
.trip-meta{display:flex;align-items:center;gap:8px;margin-top:4px;color:var(--ink-soft);font-size:13.5px;font-weight:500;flex-wrap:wrap;}
.trip-meta .dot{width:3px;height:3px;border-radius:50%;background:var(--ink-mute);}
.day-count{color:var(--primary-ink);font-weight:600;}

.bar-actions{display:flex;align-items:center;gap:10px;}
.save-pill{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:500;color:var(--ink-mute);padding:6px 4px;min-width:62px;}
.save-pill.saved{color:var(--green);}
.icon-btn{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;color:var(--ink-soft);border:1px solid var(--line);background:var(--surface);transition:.15s;}
.icon-btn:hover{color:var(--ink);border-color:var(--ink-mute);transform:translateY(-1px);}

/* ---- trip switcher ---- */
.switcher{position:relative;}
.switcher-btn{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:11px;border:1px solid var(--line);background:var(--surface);font-weight:600;font-size:14px;transition:.15s;}
.switcher-btn:hover{border-color:var(--ink-mute);}
.menu{position:absolute;top:calc(100% + 8px);right:0;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow-lift);padding:7px;min-width:248px;z-index:40;animation:pop .14s ease;}
@keyframes pop{from{opacity:0;transform:translateY(-4px) scale(.98);}to{opacity:1;transform:none;}}
.menu-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 11px;border-radius:9px;font-size:14px;font-weight:500;transition:.12s;}
.menu-item:hover{background:var(--surface-2);}
.menu-item.active{background:var(--primary-soft);color:var(--primary-ink);font-weight:600;}
.menu-item .grow{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.menu-item .trash{opacity:0;color:var(--ink-mute);transition:.12s;}
.menu-item:hover .trash{opacity:1;}
.menu-item .trash:hover{color:var(--primary);}
.menu-sep{height:1px;background:var(--line-soft);margin:6px 4px;}
.menu-new{color:var(--primary-ink);font-weight:600;}

/* ---- canvas ---- */
.canvas{max-width:1180px;margin:0 auto;padding:30px 28px 120px;}

.month-block{margin-bottom:38px;}
.month-head{display:flex;align-items:baseline;gap:14px;margin-bottom:14px;padding-bottom:10px;border-bottom:1.5px solid var(--line);}
.month-name{font-family:var(--font-display);font-weight:700;font-size:24px;letter-spacing:-.01em;}
.month-year{font-family:var(--font-mono);font-size:13px;color:var(--ink-mute);font-weight:500;}
.month-len{margin-left:auto;font-size:12.5px;font-weight:600;color:var(--ink-mute);background:var(--surface);border:1px solid var(--line);padding:4px 10px;border-radius:99px;}

.weekday-head{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-bottom:10px;}
.weekday-head span{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-mute);padding-left:4px;}

.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;}
.week-row{display:contents;}

/* ---- day card ---- */
.cell{min-height:156px;}
.cell.ghost{width:100%;height:100%;min-height:156px;padding:11px 12px 11px 15px;border-radius:var(--radius);display:flex;justify-content:flex-end;align-items:flex-start;text-align:left;transition:.16s ease;}
.cell.ghost:hover{background:var(--surface-2);}
.cell.ghost .ghost-date{font-family:var(--font-display);font-weight:600;font-size:15px;line-height:1;color:var(--ink-mute);opacity:.4;transition:.16s;}
.cell.ghost:hover .ghost-date{opacity:.8;}

.add-week{display:flex;align-items:center;gap:7px;margin:6px auto 0;padding:11px 18px;border-radius:12px;border:1.5px dashed var(--line);color:var(--ink-soft);font-weight:600;font-size:13.5px;transition:.15s;}
.add-week:hover{border-color:var(--primary);color:var(--primary-ink);background:var(--primary-soft);}
.daycard{
  position:relative;height:100%;min-height:156px;background:var(--surface);
  border:1px solid var(--line);border-radius:var(--radius);padding:13px 14px 13px 17px;
  text-align:left;width:100%;transition:.16s ease;overflow:hidden;display:flex;flex-direction:column;gap:8px;
}
.daycard::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--line);transition:.16s;}
.daycard.filled::before{background:var(--primary);}
.daycard:hover{transform:translateY(-3px);box-shadow:var(--shadow-lift);border-color:transparent;}
.daycard.today{box-shadow:0 0 0 2px var(--primary);}
.dc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:6px;}
.dc-date{font-family:var(--font-display);font-weight:600;font-size:22px;line-height:1;color:var(--ink);}
.dc-dow{display:none;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);}
.dc-daynum{font-family:var(--font-mono);font-size:11px;font-weight:500;color:var(--ink-mute);background:var(--surface-2);padding:2px 6px;border-radius:6px;}
.dc-loc{display:flex;align-items:center;gap:6px;font-weight:600;font-size:15px;color:var(--ink);}
.dc-loc.placeholder{color:var(--ink-mute);font-weight:500;}
.dc-loc svg{flex:none;color:var(--primary);}
.dc-loc.placeholder svg{color:var(--ink-mute);}
.dc-accom{display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--ink-soft);}
.dc-accom svg{flex:none;color:var(--green);}
.dc-notes{display:flex;align-items:center;gap:5px;font-size:12px;font-style:italic;color:var(--ink-mute);}
.dc-notes svg{flex:none;}
.dc-notes .ctitle{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dc-chips{display:flex;flex-direction:column;gap:6px;margin-top:auto;}
.chip{display:flex;align-items:center;gap:6px;font-size:12.5px;line-height:1.3;color:var(--ink-soft);}
.chip .cdot{width:7px;height:7px;border-radius:2px;flex:none;}
.chip .ctime{font-family:var(--font-mono);font-size:11.5px;font-weight:600;color:var(--ink-soft);flex:none;}
.chip .ctitle{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.chip-more{font-size:11px;color:var(--ink-mute);font-weight:600;padding-left:13px;}
.dc-add{opacity:0;position:absolute;right:9px;bottom:9px;width:24px;height:24px;border-radius:7px;background:var(--surface-2);display:grid;place-items:center;color:var(--ink-mute);transition:.14s;}
.daycard:hover .dc-add{opacity:1;}
.dc-add:hover{background:var(--primary);color:#fff;}

/* ---- drawer ---- */
.scrim{position:fixed;inset:0;background:rgba(20,28,38,.34);z-index:50;animation:fade .18s ease;}
@keyframes fade{from{opacity:0;}to{opacity:1;}}
.drawer{
  position:fixed;top:0;right:0;bottom:0;width:440px;max-width:92vw;background:var(--surface);
  z-index:60;box-shadow:-12px 0 40px rgba(20,28,38,.16);display:flex;flex-direction:column;
  animation:slide .24s cubic-bezier(.2,.8,.2,1);
}
@keyframes slide{from{transform:translateX(100%);}to{transform:none;}}
.drawer-head{padding:22px 24px 18px;border-bottom:1px solid var(--line);display:flex;align-items:flex-start;gap:12px;}
.dh-dow{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--primary-ink);}
.dh-date{font-family:var(--font-display);font-weight:600;font-size:23px;letter-spacing:-.01em;margin-top:2px;}
.dh-tag{font-family:var(--font-mono);font-size:11px;color:var(--ink-mute);background:var(--surface-2);padding:3px 8px;border-radius:7px;margin-top:6px;display:inline-block;}
.drawer-body{flex:1;overflow-y:auto;padding:22px 24px 40px;}
.field{margin-bottom:20px;}
.field-label{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-mute);margin-bottom:8px;}
.field-label svg{color:var(--ink-soft);}
.inp{width:100%;border:1px solid var(--line);border-radius:var(--radius-sm);padding:11px 12px;font-size:14.5px;font-weight:500;background:var(--surface);transition:.14s;outline:none;}
.inp::placeholder{color:var(--ink-mute);font-weight:400;}
.inp:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft);}
textarea.inp{resize:vertical;min-height:64px;line-height:1.5;}

.items-head{display:flex;align-items:center;justify-content:space-between;margin:6px 0 12px;}
.items-head .field-label{margin:0;}
.add-item{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--primary-ink);padding:6px 10px;border-radius:8px;background:var(--primary-soft);transition:.14s;}
.add-item:hover{background:var(--primary);color:#fff;}

.item-card{border:1px solid var(--line);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px;background:var(--surface-2);position:relative;border-left:4px solid var(--grey);}
.item-row1{display:flex;gap:8px;margin-bottom:8px;}
.type-select{position:relative;flex:none;}
.type-pick{display:flex;align-items:center;gap:6px;padding:8px 9px;border-radius:8px;background:var(--surface);border:1px solid var(--line);font-size:12.5px;font-weight:600;color:var(--ink);min-width:118px;}
.type-pick .tdot{width:9px;height:9px;border-radius:3px;}
.type-pick svg{margin-left:auto;color:var(--ink-mute);}
.type-menu{position:absolute;top:calc(100% + 5px);left:0;background:var(--surface);border:1px solid var(--line);border-radius:11px;box-shadow:var(--shadow-lift);padding:6px;z-index:5;min-width:150px;animation:pop .12s ease;}
.type-opt{display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:7px;font-size:13px;font-weight:500;width:100%;text-align:left;}
.type-opt:hover{background:var(--surface-2);}
.time-inp{width:84px;flex:none;text-align:center;font-family:var(--font-mono);font-size:13px;letter-spacing:-.02em;border:1px solid var(--line);border-radius:8px;padding:8px 6px;outline:none;background:var(--surface);}
.time-inp:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft);}
.flight-no-inp{width:84px;flex:none;text-align:center;text-transform:uppercase;font-family:var(--font-mono);font-size:13px;letter-spacing:.02em;border:1px solid var(--line);border-radius:8px;padding:8px 6px;outline:none;background:var(--surface);}
.flight-no-inp::placeholder{text-transform:none;}
.flight-no-inp:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft);}
.item-title{width:100%;border:1px solid var(--line);border-radius:8px;padding:9px 10px;font-size:14px;font-weight:600;outline:none;background:var(--surface);}
.item-title:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft);}
.item-detail{width:100%;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:13px;outline:none;background:var(--surface);resize:vertical;min-height:34px;color:var(--ink-soft);}
.item-detail:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft);}
.item-del{position:absolute;top:9px;right:9px;width:24px;height:24px;border-radius:7px;display:grid;place-items:center;color:var(--ink-mute);transition:.12s;}
.item-del:hover{background:var(--primary-soft);color:var(--primary);}
.items-empty{text-align:center;padding:22px;color:var(--ink-mute);font-size:13.5px;border:1.5px dashed var(--line);border-radius:var(--radius-sm);}

/* ---- modal ---- */
.modal{position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:20px;background:rgba(20,28,38,.34);animation:fade .16s ease;}
.modal-card{background:var(--surface);border-radius:20px;box-shadow:var(--shadow-lift);width:420px;max-width:100%;padding:26px;animation:pop .18s ease;}
.modal-card h2{font-family:var(--font-display);font-weight:600;font-size:21px;margin:0 0 18px;}
.modal-row{display:flex;gap:12px;}
.btn{padding:11px 16px;border-radius:11px;font-size:14px;font-weight:600;transition:.14s;}
.btn-primary{background:var(--primary);color:#fff;}
.btn-primary:hover{background:var(--primary-ink);}
.btn-ghost{color:var(--ink-soft);}
.btn-ghost:hover{background:var(--surface-2);}
.btn-danger{color:var(--primary-ink);}
.btn-danger:hover{background:var(--primary-soft);}
.modal-foot{display:flex;justify-content:space-between;align-items:center;margin-top:22px;}

/* ---- empty state ---- */
.empty-state{max-width:480px;margin:90px auto;text-align:center;}
.empty-state .es-mark{width:64px;height:64px;border-radius:18px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;margin:0 auto 22px;}
.empty-state h1{font-family:var(--font-display);font-weight:600;font-size:30px;margin:0 0 10px;}
.empty-state p{color:var(--ink-soft);font-size:15px;line-height:1.6;margin:0 0 26px;}

/* ---- legend ---- */
.legend{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:26px;padding:14px 18px;background:rgba(255,255,255,.55);border:1px solid var(--line);border-radius:14px;}
.legend-item{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:var(--ink-soft);}
.legend-item .ldot{width:9px;height:9px;border-radius:3px;}

@media (max-width:860px){
  .weekday-head{display:none;}
  .cal-grid{grid-template-columns:1fr;}
  .cell.ghost{display:none;}
  .daycard{min-height:0;}
  .dc-dow{display:block;}
  .canvas{padding:22px 16px 100px;}
  .topbar-inner{padding:16px;}
}
@media (prefers-reduced-motion:reduce){
  .itin-root *{animation:none!important;transition:none!important;}
}
`;

/* ------------------------------------------------------------------ */
/*  Item types                                                         */
/* ------------------------------------------------------------------ */
const ITEM_TYPES = {
  flight:    { label: "Flight",    icon: Plane,          color: "var(--sky)",     soft: "var(--sky-soft)" },
  activity:  { label: "Activity",  icon: Ticket,         color: "var(--primary)", soft: "var(--primary-soft)" },
  transport: { label: "Transport", icon: Car,            color: "var(--indigo)",  soft: "var(--indigo-soft)" },
  food:      { label: "Food",      icon: Utensils,       color: "var(--amber)",   soft: "var(--amber-soft)" },
  lodging:   { label: "Lodging",   icon: BedDouble,      color: "var(--green)",   soft: "var(--green-soft)" },
  other:     { label: "Other",     icon: MoreHorizontal, color: "var(--grey)",    soft: "var(--grey-soft)" },
};
const TYPE_KEYS = Object.keys(ITEM_TYPES);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const uid = () => Math.random().toString(36).slice(2, 9);
const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12); };
const toISO = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmtShort = (iso) => { const d = parseISO(iso); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };

function buildMonths(startISO, endISO) {
  if (!startISO || !endISO) return { months: [], total: 0 };
  let s = parseISO(startISO), e = parseISO(endISO);
  if (e < s) { const t = s; s = e; e = t; }
  const days = [];
  const cur = new Date(s);
  let idx = 1;
  while (cur <= e) { days.push({ iso: toISO(cur), dayNum: idx, date: new Date(cur), inTrip: true }); cur.setDate(cur.getDate() + 1); idx++; }
  const months = [];
  for (const d of days) {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    let m = months.find((x) => x.key === key);
    if (!m) { m = { key, year: d.date.getFullYear(), month: d.date.getMonth(), days: [] }; months.push(m); }
    m.days.push(d);
  }
  for (const m of months) {
    const weeks = []; let week = new Array(7).fill(null); let prev = -1;
    for (const d of m.days) {
      const dow = (d.date.getDay() + 6) % 7;
      if (dow <= prev) { weeks.push(week); week = new Array(7).fill(null); }
      week[dow] = d; prev = dow;
    }
    weeks.push(week);
    // pad the first/last week of the month with muted out-of-trip dates so every row is a full 7-day week
    for (const w of [weeks[0], weeks[weeks.length - 1]]) {
      const anchorIdx = w.findIndex((x) => x);
      const anchor = w[anchorIdx];
      for (let i = 0; i < 7; i++) {
        if (!w[i]) {
          const gd = new Date(anchor.date);
          gd.setDate(gd.getDate() + (i - anchorIdx));
          w[i] = { iso: toISO(gd), dayNum: null, date: gd, inTrip: false };
        }
      }
    }
    m.weeks = weeks;
  }
  return { months, total: days.length };
}

/* ---- storage (localStorage) ---- */
async function sGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
async function sSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch { return false; }
}
async function sDel(key) {
  try { localStorage.removeItem(key); } catch {}
}
const K_INDEX = "itin:index";
const K_TRIP = (id) => `itin:trip:${id}`;

/* ---- seed: real itinerary imported from the "Canada 27" Google Sheet ---- */
const LEGACY_SEED_FINGERPRINT = "2027-09-27|2027-10-08";

function sampleTrip(id = uid()) {
  return {
    id, name: "Canada 27", startDate: "2026-10-29", endDate: "2026-11-18",
    days: {
      "2026-10-29": { location: "Vancouver", accommodation: "", notes: "", items: [
        { id: uid(), type: "flight", time: "", title: "BNE → YVR", detail: "" },
      ]},
      "2026-10-30": { location: "Vancouver", accommodation: "", notes: "", items: [] },
      "2026-10-31": { location: "Whitehorse", accommodation: "", notes: "", items: [
        { id: uid(), type: "flight", time: "", title: "YVR → YXY", detail: "" },
      ]},
      "2026-11-01": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-02": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-03": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-04": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-05": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-06": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-07": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-08": { location: "Vancouver", accommodation: "", notes: "", items: [
        { id: uid(), type: "flight", time: "", title: "YXY → YVR", detail: "" },
      ]},
      "2026-11-09": { location: "Vancouver", accommodation: "", notes: "", items: [] },
      "2026-11-10": { location: "Manila", accommodation: "", notes: "", items: [
        { id: uid(), type: "flight", time: "", title: "YVR → MNL", detail: "" },
      ]},
      "2026-11-11": { location: "Manila", accommodation: "", notes: "", items: [] },
      "2026-11-12": { location: "Manila", accommodation: "", notes: "", items: [] },
      "2026-11-13": { location: "Manila", accommodation: "", notes: "", items: [] },
      "2026-11-14": { location: "", accommodation: "", notes: "", items: [
        { id: uid(), type: "flight", time: "", title: "MNL → ???", detail: "" },
      ]},
      "2026-11-15": { location: "", accommodation: "", notes: "", items: [] },
      "2026-11-16": { location: "", accommodation: "", notes: "", items: [] },
      "2026-11-17": { location: "", accommodation: "", notes: "", items: [] },
      "2026-11-18": { location: "", accommodation: "", notes: "", items: [] },
    },
  };
}

/* ================================================================== */
/*  Small components                                                   */
/* ================================================================== */
function TypePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const t = ITEM_TYPES[value];
  return (
    <div className="type-select" ref={ref}>
      <button className="type-pick" onClick={() => setOpen((o) => !o)} type="button">
        <span className="tdot" style={{ background: t.color }} />
        {t.label}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="type-menu">
          {TYPE_KEYS.map((k) => {
            const Icon = ITEM_TYPES[k].icon;
            return (
              <button key={k} className="type-opt" type="button"
                onClick={() => { onChange(k); setOpen(false); }}>
                <Icon size={15} style={{ color: ITEM_TYPES[k].color }} />
                {ITEM_TYPES[k].label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onChange, onDelete }) {
  const isFlight = item.type === "flight";
  return (
    <div className="item-card" style={{ borderLeftColor: ITEM_TYPES[item.type].color }}>
      <button className="item-del" onClick={onDelete} title="Remove item"><Trash2 size={14} /></button>
      <div className="item-row1">
        <TypePicker value={item.type} onChange={(t) => onChange({ ...item, type: t })} />
        <input className="time-inp" value={item.time} placeholder="09:30"
          onChange={(e) => onChange({ ...item, time: e.target.value })} />
        {isFlight && (
          <input className="flight-no-inp" value={item.flightNo || ""} placeholder="QF55"
            onChange={(e) => onChange({ ...item, flightNo: e.target.value })} />
        )}
      </div>
      <input className="item-title" value={item.title}
        placeholder={isFlight ? "Route, e.g. SYD → YVR" : "What's happening?"}
        onChange={(e) => onChange({ ...item, title: e.target.value })} style={{ marginBottom: 8 }} />
      <textarea className="item-detail" value={item.detail} placeholder="Notes, confirmation #, address…"
        onChange={(e) => onChange({ ...item, detail: e.target.value })} />
    </div>
  );
}

function DayDrawer({ iso, dayNum, data, onClose, onUpdate }) {
  const d = parseISO(iso);
  const day = data || { location: "", accommodation: "", notes: "", items: [] };
  const patch = (p) => onUpdate(iso, { ...day, ...p });
  const updateItem = (id, next) => patch({ items: day.items.map((it) => (it.id === id ? next : it)) });
  const addItem = () => patch({ items: [...day.items, { id: uid(), type: "activity", time: "", title: "", detail: "" }] });
  const delItem = (id) => patch({ items: day.items.filter((it) => it.id !== id) });

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Edit day">
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div className="dh-dow">{DOW[(d.getDay() + 6) % 7]}</div>
            <div className="dh-date">{d.getDate()} {MONTHS[d.getMonth()]}</div>
            <span className="dh-tag">Day {dayNum} · {d.getFullYear()}</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="drawer-body">
          <div className="field">
            <label className="field-label"><MapPin size={14} /> Location</label>
            <input className="inp" value={day.location} placeholder="Where are you this day?"
              onChange={(e) => patch({ location: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label"><BedDouble size={14} /> Accommodation</label>
            <input className="inp" value={day.accommodation} placeholder="Where you're staying"
              onChange={(e) => patch({ accommodation: e.target.value })} />
          </div>

          <div className="items-head">
            <label className="field-label"><Luggage size={14} /> Plans</label>
            <button className="add-item" onClick={addItem}><Plus size={15} /> Add</button>
          </div>
          {day.items.length === 0 ? (
            <div className="items-empty">Nothing planned yet. Add a flight, activity, or anything else.</div>
          ) : (
            day.items.map((it) => (
              <ItemCard key={it.id} item={it}
                onChange={(next) => updateItem(it.id, next)}
                onDelete={() => delItem(it.id)} />
            ))
          )}

          <div className="field" style={{ marginTop: 20 }}>
            <label className="field-label">Notes</label>
            <textarea className="inp" value={day.notes} placeholder="Anything else to remember for the day"
              onChange={(e) => patch({ notes: e.target.value })} />
          </div>
        </div>
      </aside>
    </>
  );
}

function DayCard({ cellDay, data, isToday, onOpen }) {
  const d = parseISO(cellDay.iso);
  const items = (data?.items || []).filter((i) => i.title || i.time);
  const sorted = [...items].sort((a, b) => (a.time || "~").localeCompare(b.time || "~"));
  const shown = sorted.slice(0, 3);
  const more = sorted.length - shown.length;
  const filled = !!(data && (data.location || items.length || data.accommodation || data.notes));
  return (
    <button className={`daycard${filled ? " filled" : ""}${isToday ? " today" : ""}`} onClick={() => onOpen(cellDay)}>
      <div className="dc-head">
        <div>
          <span className="dc-dow">{DOW[(d.getDay() + 6) % 7]}</span>{" "}
          <span className="dc-date">{d.getDate()}</span>
        </div>
        <span className="dc-daynum">D{cellDay.dayNum}</span>
      </div>
      {data?.location
        ? <div className="dc-loc"><MapPin size={13} /> <span className="ctitle">{data.location}</span></div>
        : <div className="dc-loc placeholder"><MapPin size={13} /> Add location</div>}
      {data?.accommodation && (
        <div className="dc-accom"><BedDouble size={12} /> <span className="ctitle">{data.accommodation}</span></div>
      )}
      {shown.length > 0 && (
        <div className="dc-chips">
          {shown.map((it) => (
            <div className="chip" key={it.id}>
              <span className="cdot" style={{ background: ITEM_TYPES[it.type].color }} />
              {it.time && <span className="ctime">{it.time}</span>}
              <span className="ctitle">
                {it.type === "flight" && it.flightNo ? `${it.flightNo} · ` : ""}
                {it.title || ITEM_TYPES[it.type].label}
              </span>
            </div>
          ))}
          {more > 0 && <div className="chip-more">+{more} more</div>}
        </div>
      )}
      {data?.notes && (
        <div className="dc-notes"><StickyNote size={11} /> <span className="ctitle">{data.notes}</span></div>
      )}
      <span className="dc-add"><Plus size={14} /></span>
    </button>
  );
}

function SettingsModal({ trip, onSave, onDelete, onClose }) {
  const [name, setName] = useState(trip.name);
  const [start, setStart] = useState(trip.startDate);
  const [end, setEnd] = useState(trip.endDate);
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Trip settings</h2>
        <div className="field">
          <label className="field-label">Trip name</label>
          <input className="inp" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="modal-row">
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">Starts</label>
            <input className="inp" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">Ends</label>
            <input className="inp" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-danger" onClick={onDelete}>Delete trip</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave({ name: name || "Untitled trip", startDate: start, endDate: end })}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewTripModal({ onCreate, onClose, canCancel }) {
  const today = toISO(new Date());
  const wk = new Date(); wk.setDate(wk.getDate() + 6);
  const [name, setName] = useState("");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(toISO(wk));
  return (
    <div className="modal" onClick={canCancel ? onClose : undefined}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>New trip</h2>
        <div className="field">
          <label className="field-label">Where are you going?</label>
          <input className="inp" autoFocus value={name} placeholder="e.g. Japan '28"
            onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="modal-row">
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">Starts</label>
            <input className="inp" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">Ends</label>
            <input className="inp" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="modal-foot">
          <span />
          <div style={{ display: "flex", gap: 8 }}>
            {canCancel && <button className="btn btn-ghost" onClick={onClose}>Cancel</button>}
            <button className="btn btn-primary"
              onClick={() => onCreate({ name: name || "Untitled trip", startDate: start, endDate: end })}>
              Create trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Root                                                               */
/* ================================================================== */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState({ trips: [], activeId: null });
  const [trip, setTrip] = useState(null);          // active trip blob
  const [openDay, setOpenDay] = useState(null);    // {iso, dayNum}
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle|saving|saved
  const saveTimer = useRef(null);
  const menuRef = useRef(null);

  /* initial load */
  useEffect(() => {
    (async () => {
      let idx = await sGet(K_INDEX);
      if (!idx || !idx.trips || idx.trips.length === 0) {
        const t = sampleTrip();
        idx = { trips: [{ id: t.id, name: t.name }], activeId: t.id };
        await sSet(K_TRIP(t.id), t);
        await sSet(K_INDEX, idx);
        setIndex(idx); setTrip(t);
      } else {
        setIndex(idx);
        const activeId = idx.activeId || idx.trips[0].id;
        let t = await sGet(K_TRIP(activeId));
        if (t && `${t.startDate}|${t.endDate}` === LEGACY_SEED_FINGERPRINT) {
          t = sampleTrip(t.id);
          await sSet(K_TRIP(t.id), t);
          const fixedIdx = { ...idx, trips: idx.trips.map((x) => (x.id === t.id ? { ...x, name: t.name } : x)) };
          setIndex(fixedIdx); await sSet(K_INDEX, fixedIdx);
        }
        setTrip(t);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  /* debounced persist of active trip */
  const persistTrip = useCallback((t) => {
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await sSet(K_TRIP(t.id), t);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1600);
    }, 500);
  }, []);

  const updateTrip = (next) => { setTrip(next); persistTrip(next); };

  const addWeek = () => {
    const e = parseISO(trip.endDate);
    e.setDate(e.getDate() + 7);
    updateTrip({ ...trip, endDate: toISO(e) });
  };

  const openGhost = (cell) => {
    let next = trip;
    if (cell.iso < trip.startDate) next = { ...trip, startDate: cell.iso };
    else if (cell.iso > trip.endDate) next = { ...trip, endDate: cell.iso };
    if (next !== trip) updateTrip(next);
    const dayNum = Math.round((parseISO(cell.iso) - parseISO(next.startDate)) / 86400000) + 1;
    setOpenDay({ iso: cell.iso, dayNum });
  };

  const updateDay = (iso, dayData) => {
    const days = { ...trip.days, [iso]: dayData };
    updateTrip({ ...trip, days });
  };

  const updateName = (name) => {
    const next = { ...trip, name };
    setTrip(next); persistTrip(next);
    const idx = { ...index, trips: index.trips.map((x) => (x.id === trip.id ? { ...x, name } : x)) };
    setIndex(idx); sSet(K_INDEX, idx);
  };

  const switchTrip = async (id) => {
    setMenuOpen(false);
    if (id === trip?.id) return;
    const t = await sGet(K_TRIP(id));
    setTrip(t);
    const idx = { ...index, activeId: id }; setIndex(idx); sSet(K_INDEX, idx);
  };

  const createTrip = async ({ name, startDate, endDate }) => {
    const t = { id: uid(), name, startDate, endDate, days: {} };
    await sSet(K_TRIP(t.id), t);
    const idx = { trips: [...index.trips, { id: t.id, name }], activeId: t.id };
    setIndex(idx); await sSet(K_INDEX, idx);
    setTrip(t); setShowNew(false); setMenuOpen(false);
  };

  const saveSettings = ({ name, startDate, endDate }) => {
    const next = { ...trip, name, startDate, endDate };
    updateTrip(next);
    const idx = { ...index, trips: index.trips.map((x) => (x.id === trip.id ? { ...x, name } : x)) };
    setIndex(idx); sSet(K_INDEX, idx);
    setShowSettings(false);
  };

  const deleteTrip = async (id) => {
    await sDel(K_TRIP(id));
    const remaining = index.trips.filter((x) => x.id !== id);
    if (remaining.length === 0) {
      const idx = { trips: [], activeId: null };
      setIndex(idx); await sSet(K_INDEX, idx);
      setTrip(null); setShowSettings(false); setShowNew(true);
      return;
    }
    const nextActive = remaining[0].id;
    const idx = { trips: remaining, activeId: nextActive };
    setIndex(idx); await sSet(K_INDEX, idx);
    const t = await sGet(K_TRIP(nextActive));
    setTrip(t); setShowSettings(false); setMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="itin-root" style={{ display: "grid", placeItems: "center" }}>
        <style>{STYLES}</style>
        <div style={{ color: "var(--ink-mute)", fontWeight: 600 }}>Loading your trips…</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="itin-root">
        <style>{STYLES}</style>
        <div className="empty-state">
          <div className="es-mark"><CalendarDays size={30} /></div>
          <h1>Plan your first trip</h1>
          <p>Lay your itinerary out on a calendar — locations, where you're staying, flights and everything in between, day by day.</p>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={16} style={{ marginRight: 6, verticalAlign: "-2px" }} />New trip</button>
        </div>
        {showNew && <NewTripModal canCancel={false} onCreate={createTrip} onClose={() => setShowNew(false)} />}
      </div>
    );
  }

  const { months, total } = buildMonths(trip.startDate, trip.endDate);
  const todayISO = toISO(new Date());

  return (
    <div className="itin-root">
      <style>{STYLES}</style>

      {/* top bar */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark"><Plane size={16} /></span>
            Itinerary
          </div>
          <div className="title-block">
            <input className="trip-title" value={trip.name}
              onChange={(e) => updateName(e.target.value)} aria-label="Trip name" />
            <div className="trip-meta">
              <span className="day-count">{total} {total === 1 ? "day" : "days"}</span>
              <span className="dot" />
              <span>{fmtShort(trip.startDate)} – {fmtShort(trip.endDate)}</span>
            </div>
          </div>

          <div className="bar-actions">
            <span className={`save-pill${saveStatus === "saved" ? " saved" : ""}`}>
              {saveStatus === "saving" && <>Saving…</>}
              {saveStatus === "saved" && <><Check size={14} /> Saved</>}
            </span>
            <div className="switcher" ref={menuRef}>
              <button className="switcher-btn" onClick={() => setMenuOpen((o) => !o)}>
                Trips <ChevronDown size={15} />
              </button>
              {menuOpen && (
                <div className="menu">
                  {index.trips.map((t) => (
                    <div key={t.id} className={`menu-item${t.id === trip.id ? " active" : ""}`}
                      onClick={() => switchTrip(t.id)} role="button">
                      <MapPin size={15} />
                      <span className="grow">{t.name}</span>
                      {index.trips.length > 1 && (
                        <button className="trash" title="Delete"
                          onClick={(e) => { e.stopPropagation(); deleteTrip(t.id); }}><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  <div className="menu-sep" />
                  <button className="menu-item menu-new" onClick={() => { setShowNew(true); setMenuOpen(false); }}>
                    <Plus size={15} /> New trip
                  </button>
                </div>
              )}
            </div>
            <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Trip settings"><Settings size={18} /></button>
          </div>
        </div>
      </div>

      {/* canvas */}
      <div className="canvas">
        <div className="legend">
          {TYPE_KEYS.map((k) => (
            <span className="legend-item" key={k}>
              <span className="ldot" style={{ background: ITEM_TYPES[k].color }} />{ITEM_TYPES[k].label}
            </span>
          ))}
        </div>

        {months.map((m) => (
          <section className="month-block" key={m.key}>
            <div className="month-head">
              <span className="month-name">{MONTHS[m.month]}</span>
              <span className="month-year">{m.year}</span>
              <span className="month-len">{m.days.length} {m.days.length === 1 ? "day" : "days"}</span>
            </div>
            <div className="weekday-head">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
            <div className="cal-grid">
              {m.weeks.map((week, wi) => (
                <div className="week-row" key={wi}>
                  {week.map((cell, ci) => (
                    cell.inTrip ? (
                      <div className="cell" key={ci}>
                        <DayCard cellDay={cell} data={trip.days[cell.iso]}
                          isToday={cell.iso === todayISO}
                          onOpen={(c) => setOpenDay({ iso: c.iso, dayNum: c.dayNum })} />
                      </div>
                    ) : (
                      <button className="cell ghost" key={ci} onClick={() => openGhost(cell)}
                        title={`Add ${fmtShort(cell.iso)} to the trip`}>
                        <span className="ghost-date">{cell.date.getDate()}</span>
                      </button>
                    )
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}

        <button className="add-week" onClick={addWeek}><Plus size={15} /> Add week</button>
      </div>

      {openDay && (
        <DayDrawer iso={openDay.iso} dayNum={openDay.dayNum}
          data={trip.days[openDay.iso]} onClose={() => setOpenDay(null)} onUpdate={updateDay} />
      )}
      {showSettings && (
        <SettingsModal trip={trip} onSave={saveSettings}
          onDelete={() => deleteTrip(trip.id)} onClose={() => setShowSettings(false)} />
      )}
      {showNew && <NewTripModal canCancel onCreate={createTrip} onClose={() => setShowNew(false)} />}
    </div>
  );
}
