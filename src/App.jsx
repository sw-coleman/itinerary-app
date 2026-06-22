import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, BedDouble, Plane, Car, Utensils, Ticket, Plus, Minus, X, Settings,
  ChevronDown, Trash2, Check, MoreHorizontal, Luggage, CalendarDays, StickyNote, LogOut,
} from "lucide-react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

/* ------------------------------------------------------------------ */
/*  Design tokens + global CSS                                         */
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
  font-family:var(--font-body);color:var(--ink);
  min-height:100vh;
  background:linear-gradient(168deg,var(--bg) 0%,var(--bg2) 100%);
  -webkit-font-smoothing:antialiased;
}
.itin-root *{box-sizing:border-box;}
.itin-root button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
.itin-root input,.itin-root textarea,.itin-root select{font-family:inherit;color:var(--ink);}

/* ---- sign-in screen ---- */
.signin-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
.signin-card{background:var(--surface);border:1px solid var(--line);border-radius:28px;box-shadow:var(--shadow-lift);padding:56px 48px 48px;max-width:420px;width:100%;text-align:center;}
.signin-logo{width:72px;height:72px;border-radius:24px;background:var(--ink);color:#fff;display:grid;place-items:center;margin:0 auto 22px;box-shadow:0 8px 24px rgba(30,42,56,.18);}
.signin-brand{font-family:var(--font-display);font-weight:700;font-size:40px;letter-spacing:-.025em;color:var(--ink);margin:0 0 8px;}
.signin-tagline{color:var(--ink-soft);font-size:15.5px;font-weight:500;margin:0 0 40px;line-height:1.5;}
.google-btn{display:flex;align-items:center;gap:12px;width:100%;padding:15px 22px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);font-weight:600;font-size:15px;justify-content:center;transition:.15s;color:var(--ink);}
.google-btn:hover:not(:disabled){border-color:var(--ink-mute);background:var(--surface-2);transform:translateY(-1px);box-shadow:var(--shadow);}
.google-btn:disabled{opacity:.6;cursor:default;}
.signin-error{color:var(--primary-ink);font-size:13px;margin-top:14px;font-weight:500;}
.signin-caption{margin-top:20px;font-size:12.5px;color:var(--ink-mute);line-height:1.55;}

/* ---- loading screen ---- */
.loading-screen{min-height:100vh;display:grid;place-items:center;}
.loading-inner{text-align:center;}
.loading-logo{width:60px;height:60px;border-radius:20px;background:var(--ink);color:#fff;display:grid;place-items:center;margin:0 auto 18px;opacity:.85;}
.loading-text{color:var(--ink-mute);font-weight:600;font-size:14.5px;}

/* ---- top bar ---- */
.topbar{position:sticky;top:0;z-index:30;backdrop-filter:saturate(1.4) blur(10px);background:rgba(247,249,251,.82);border-bottom:1px solid var(--line);}
.topbar-inner{max-width:1680px;margin:0 auto;padding:16px 28px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;flex:none;}
.brand-mark{width:32px;height:32px;border-radius:10px;background:var(--ink);color:#fff;display:grid;place-items:center;flex:none;}
.brand-name{font-family:var(--font-display);font-weight:700;font-size:19px;letter-spacing:-.015em;color:var(--ink);}
.title-block{flex:1;min-width:240px;}
.trip-title{font-family:var(--font-display);font-weight:600;font-size:30px;letter-spacing:-.01em;color:var(--ink);background:transparent;border:none;outline:none;width:100%;padding:2px 4px;border-radius:8px;margin-left:-4px;}
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
.user-btn{display:flex;align-items:center;gap:8px;padding:5px 10px 5px 5px;border-radius:11px;border:1px solid var(--line);background:var(--surface);transition:.15s;font-size:13px;font-weight:600;color:var(--ink-soft);}
.user-btn:hover{border-color:var(--ink-mute);color:var(--ink);}
.user-avatar{width:30px;height:30px;border-radius:8px;object-fit:cover;}
.user-initial{width:30px;height:30px;border-radius:8px;background:var(--primary-soft);color:var(--primary-ink);display:grid;place-items:center;font-size:12px;font-weight:700;font-family:var(--font-display);flex:none;}

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
.canvas{max-width:1680px;margin:0 auto;padding:30px 28px 100px;}

/* Fixed column widths — 1fr alone resolves to minmax(auto,1fr) which grows
   with typed content. An explicit px floor stops that. */
.cal-scroll{overflow-x:auto;padding-bottom:4px;}
.weekday-head{display:grid;grid-template-columns:34px repeat(7,minmax(210px,1fr));gap:12px;margin-bottom:10px;}
.weekday-head span{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-mute);padding-left:4px;}
.cal-grid{display:grid;grid-template-columns:34px repeat(7,minmax(210px,1fr));gap:12px;}
.week-row{display:contents;}
.week-gutter{position:relative;}
.remove-week-handle{opacity:0;pointer-events:none;position:absolute;top:50%;left:0;transform:translateY(-50%);width:30px;height:30px;border-radius:9px;display:grid;place-items:center;color:var(--ink-mute);border:1px solid var(--line);background:var(--surface);transition:.15s;}
.week-row:hover .remove-week-handle{opacity:1;pointer-events:auto;}
.remove-week-handle:hover{color:var(--primary-ink);border-color:var(--primary);background:var(--primary-soft);}
.week-row:hover .remove-week-handle:disabled{opacity:.35;cursor:default;}
.remove-week-handle:disabled:hover{color:var(--ink-mute);border-color:var(--line);background:var(--surface);}
.add-week-row{display:flex;justify-content:center;margin-top:8px;}
.add-week{display:flex;align-items:center;gap:7px;padding:11px 18px;border-radius:12px;border:1.5px dashed var(--line);color:var(--ink-soft);font-weight:600;font-size:13.5px;transition:.15s;}
.add-week:hover{border-color:var(--primary);color:var(--primary-ink);background:var(--primary-soft);}

/* ---- day card ---- */
.cell{min-height:182px;}
.cell.ghost{width:100%;height:100%;min-height:182px;padding:13px 14px 13px 17px;border-radius:var(--radius);display:flex;justify-content:flex-end;align-items:flex-start;text-align:left;transition:.16s ease;background:var(--surface-2);border:1px dashed var(--line-soft);}
.cell.ghost:hover{background:var(--primary-soft);border-color:var(--primary);}
.cell.ghost .ghost-date{font-family:var(--font-display);font-weight:600;font-size:16px;line-height:1;color:var(--ink-mute);opacity:.6;transition:.16s;}
.cell.ghost:hover .ghost-date{color:var(--primary-ink);opacity:1;}
.daycard{position:relative;height:100%;min-height:182px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:15px 16px 15px 19px;text-align:left;width:100%;transition:.16s ease;overflow:hidden;display:flex;flex-direction:column;gap:9px;}
.daycard::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--line);transition:.16s;}
.daycard.filled::before{background:var(--primary);}
.daycard:hover{transform:translateY(-3px);box-shadow:var(--shadow-lift);border-color:transparent;}
.daycard.today{box-shadow:0 0 0 2px var(--primary);}
.dc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:6px;}
.dc-date{font-family:var(--font-display);font-weight:600;font-size:23px;line-height:1;color:var(--ink);}
.dc-dow{display:none;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);}
.dc-month-tag{font-family:var(--font-mono);font-size:10.5px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:var(--primary-ink);background:var(--primary-soft);padding:3px 7px;border-radius:6px;white-space:nowrap;}
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
.drawer{position:fixed;top:0;right:0;bottom:0;width:440px;max-width:92vw;background:var(--surface);z-index:60;box-shadow:-12px 0 40px rgba(20,28,38,.16);display:flex;flex-direction:column;animation:slide .24s cubic-bezier(.2,.8,.2,1);}
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

/* ---- bottom panels ---- */
.bottom-panels{display:flex;gap:16px;margin-top:32px;align-items:flex-start;}
.bottom-panels > *{flex:1;min-width:0;}

/* ---- todo checklist ---- */
.todo-section{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px;}
.todo-header{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
.todo-header-title{font-family:var(--font-display);font-weight:600;font-size:16px;}
.todo-count{background:var(--primary-soft);color:var(--primary-ink);font-size:11px;font-weight:700;padding:2px 7px;border-radius:20px;}
.todo-list{display:flex;flex-direction:column;gap:2px;margin-bottom:10px;}
.todo-item{display:flex;align-items:center;gap:9px;padding:6px 5px;border-radius:8px;transition:.12s;}
.todo-item:hover{background:var(--surface-2);}
.todo-item:hover .todo-del{opacity:1;}
.todo-check{width:20px;height:20px;border-radius:6px;border:2px solid var(--line);flex:none;display:grid;place-items:center;color:#fff;transition:.12s;background:var(--surface);}
.todo-check:hover{border-color:var(--green);}
.todo-item.done .todo-check{background:var(--green);border-color:var(--green);}
.todo-text{flex:1;font-size:14px;font-weight:500;text-align:left;line-height:1.4;}
.todo-item.done .todo-text{text-decoration:line-through;color:var(--ink-mute);}
.todo-del{opacity:0;color:var(--ink-mute);width:20px;height:20px;border-radius:5px;display:grid;place-items:center;transition:.12s;flex:none;}
.todo-del:hover{background:var(--primary-soft);color:var(--primary);}
.todo-add-row{display:flex;gap:8px;align-items:center;}
.todo-inp{flex:1;border:1px solid var(--line);border-radius:9px;padding:9px 11px;font-size:13.5px;font-weight:500;outline:none;background:var(--surface-2);transition:.14s;}
.todo-inp::placeholder{color:var(--ink-mute);font-weight:400;}
.todo-inp:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft);background:var(--surface);}
.todo-add-btn{width:34px;height:34px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--ink-soft);display:grid;place-items:center;transition:.14s;flex:none;}
.todo-add-btn:hover{background:var(--primary);color:#fff;border-color:var(--primary);}

/* ---- expense tracker ---- */
.expense-section{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px;}
.expense-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.expense-header-title{font-family:var(--font-display);font-weight:600;font-size:16px;}
.expense-total-badge{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--ink);}
.expense-list{display:flex;flex-direction:column;gap:2px;margin-bottom:10px;}
.expense-item{display:flex;align-items:center;gap:8px;padding:5px 5px;border-radius:7px;transition:.12s;}
.expense-item:not(.expense-total-row):hover{background:var(--surface-2);}
.expense-item:hover .expense-del{opacity:1;}
.expense-dot{width:8px;height:8px;border-radius:3px;flex:none;}
.expense-desc{flex:1;font-size:13.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.expense-cat-label{font-size:11px;font-weight:600;color:var(--ink-mute);white-space:nowrap;flex:none;}
.expense-amt{font-family:var(--font-mono);font-size:13px;font-weight:500;color:var(--ink-soft);white-space:nowrap;flex:none;}
.expense-del{opacity:0;color:var(--ink-mute);width:20px;height:20px;border-radius:5px;display:grid;place-items:center;transition:.12s;flex:none;}
.expense-del:hover{background:var(--primary-soft);color:var(--primary);}
.expense-divider{height:1px;background:var(--line);margin:6px 0;}
.expense-total-row .expense-amt{color:var(--ink);font-weight:700;}
.expense-total-row .expense-desc{font-size:12.5px;font-weight:700;color:var(--ink-soft);}
.expense-add-row{display:flex;gap:6px;align-items:center;}
.expense-cat-pick{position:relative;flex:none;}
.expense-cat-btn{display:flex;align-items:center;gap:4px;width:36px;height:36px;border-radius:9px;border:1px solid var(--line);background:var(--surface-2);justify-content:center;transition:.14s;}
.expense-cat-btn:hover{border-color:var(--ink-mute);}
.expense-cat-menu{position:absolute;bottom:calc(100% + 6px);left:0;background:var(--surface);border:1px solid var(--line);border-radius:11px;box-shadow:var(--shadow-lift);padding:6px;z-index:10;min-width:140px;animation:pop .12s ease;}
.expense-cat-opt{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:7px;font-size:13px;font-weight:500;width:100%;text-align:left;transition:.1s;}
.expense-cat-opt:hover{background:var(--surface-2);}
.expense-desc-inp{flex:1;min-width:0;border:1px solid var(--line);border-radius:9px;padding:9px 10px;font-size:13.5px;font-weight:500;outline:none;background:var(--surface-2);transition:.14s;}
.expense-desc-inp::placeholder{color:var(--ink-mute);font-weight:400;}
.expense-desc-inp:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft);background:var(--surface);}
.expense-amt-wrap{position:relative;flex:none;width:90px;}
.expense-currency{position:absolute;left:9px;top:50%;transform:translateY(-50%);font-family:var(--font-mono);font-size:13px;color:var(--ink-mute);pointer-events:none;}
.expense-amt-inp{width:100%;border:1px solid var(--line);border-radius:9px;padding:9px 8px 9px 20px;font-size:13px;font-family:var(--font-mono);outline:none;background:var(--surface-2);transition:.14s;}
.expense-amt-inp::-webkit-outer-spin-button,.expense-amt-inp::-webkit-inner-spin-button{-webkit-appearance:none;}
.expense-amt-inp:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft);background:var(--surface);}
.expense-add-btn{width:34px;height:34px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--ink-soft);display:grid;place-items:center;transition:.14s;flex:none;}
.expense-add-btn:hover{background:var(--primary);color:#fff;border-color:var(--primary);}

@media (max-width:860px){
  .weekday-head{display:none;}
  .cal-grid{grid-template-columns:1fr;}
  .week-gutter{display:none;}
  .cell.ghost{display:none;}
  .daycard{min-height:0;}
  .dc-dow{display:block;}
  .canvas{padding:22px 16px 100px;}
  .topbar-inner{padding:16px;}
  .bottom-panels{flex-direction:column;}
}
@media (prefers-reduced-motion:reduce){
  .itin-root *{animation:none!important;transition:none!important;}
}
`;

/* ------------------------------------------------------------------ */
/*  Item types + expense categories                                    */
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

const EXPENSE_CATS = {
  flight:    { label: "Flight",    color: "var(--sky)" },
  stay:      { label: "Stay",      color: "var(--green)" },
  food:      { label: "Food",      color: "var(--amber)" },
  activity:  { label: "Activity",  color: "var(--primary)" },
  transport: { label: "Transport", color: "var(--indigo)" },
  other:     { label: "Other",     color: "var(--grey)" },
};
const EXPENSE_CAT_KEYS = Object.keys(EXPENSE_CATS);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const uid = () => Math.random().toString(36).slice(2, 9);
const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12); };
const toISO = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmtShort = (iso) => { const d = parseISO(iso); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };
const fmtMoney = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function buildCalendar(startISO, endISO) {
  if (!startISO || !endISO) return { weeks: [], total: 0 };
  let s = parseISO(startISO), e = parseISO(endISO);
  if (e < s) { const t = s; s = e; e = t; }
  const real = [];
  const cur = new Date(s);
  let idx = 1;
  while (cur <= e) { real.push({ iso: toISO(cur), dayNum: idx, date: new Date(cur), inTrip: true }); cur.setDate(cur.getDate() + 1); idx++; }
  const total = real.length;
  const leadGap = (real[0].date.getDay() + 6) % 7;
  const lead = [];
  for (let i = leadGap; i > 0; i--) {
    const gd = new Date(real[0].date); gd.setDate(gd.getDate() - i);
    lead.push({ iso: toISO(gd), dayNum: null, date: gd, inTrip: false });
  }
  const lastDow = (real[real.length - 1].date.getDay() + 6) % 7;
  const trail = [];
  for (let i = 1; i <= 6 - lastDow; i++) {
    const gd = new Date(real[real.length - 1].date); gd.setDate(gd.getDate() + i);
    trail.push({ iso: toISO(gd), dayNum: null, date: gd, inTrip: false });
  }
  const all = [...lead, ...real, ...trail];
  const weeks = [];
  for (let i = 0; i < all.length; i += 7) weeks.push(all.slice(i, i + 7));
  return { weeks, total };
}

function monthTag(cell, isFirstRealDay) {
  if (!cell.inTrip || !(isFirstRealDay || cell.date.getDate() === 1)) return null;
  return `${MONTHS[cell.date.getMonth()].slice(0, 3)} '${String(cell.date.getFullYear()).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/*  Firestore helpers                                                  */
/* ------------------------------------------------------------------ */
const userDocRef  = (u) => doc(db, "users", u);
const tripDocRef  = (u, id) => doc(db, "users", u, "trips", id);

async function fsGetIndex(u) {
  const snap = await getDoc(userDocRef(u));
  return snap.exists() ? snap.data() : null;
}
async function fsSetIndex(u, data) {
  await setDoc(userDocRef(u), data, { merge: true });
}
async function fsGetTrip(u, id) {
  const snap = await getDoc(tripDocRef(u, id));
  return snap.exists() ? snap.data() : null;
}
async function fsSetTrip(u, id, data) {
  await setDoc(tripDocRef(u, id), data);
}
async function fsDelTrip(u, id) {
  await deleteDoc(tripDocRef(u, id));
}

/* ------------------------------------------------------------------ */
/*  localStorage → Firestore one-time migration                       */
/* ------------------------------------------------------------------ */
async function migrateFromLocalStorage(u) {
  try {
    const raw = localStorage.getItem("itin:index");
    if (!raw) return;
    const idx = JSON.parse(raw);
    if (!idx?.trips?.length) return;
    const existing = await fsGetIndex(u);
    if (existing?.trips?.length) return; // already done
    await fsSetIndex(u, { trips: idx.trips, activeId: idx.activeId });
    for (const t of idx.trips) {
      const tripRaw = localStorage.getItem(`itin:trip:${t.id}`);
      if (tripRaw) await fsSetTrip(u, t.id, JSON.parse(tripRaw));
    }
    localStorage.removeItem("itin:index");
    idx.trips.forEach((t) => localStorage.removeItem(`itin:trip:${t.id}`));
  } catch (e) {
    console.error("Migration error:", e);
  }
}

/* ------------------------------------------------------------------ */
/*  Seed trip                                                          */
/* ------------------------------------------------------------------ */
const LEGACY_SEED_FINGERPRINT = "2027-09-27|2027-10-08";

function sampleTrip(id = uid()) {
  return {
    id, name: "Canada 27", startDate: "2026-10-29", endDate: "2026-11-18",
    days: {
      "2026-10-29": { location: "Vancouver", accommodation: "", notes: "", items: [{ id: uid(), type: "flight", time: "", title: "BNE → YVR", detail: "" }] },
      "2026-10-30": { location: "Vancouver", accommodation: "", notes: "", items: [] },
      "2026-10-31": { location: "Whitehorse", accommodation: "", notes: "", items: [{ id: uid(), type: "flight", time: "", title: "YVR → YXY", detail: "" }] },
      "2026-11-01": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-02": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-03": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-04": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-05": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-06": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-07": { location: "Whitehorse", accommodation: "", notes: "", items: [] },
      "2026-11-08": { location: "Vancouver", accommodation: "", notes: "", items: [{ id: uid(), type: "flight", time: "", title: "YXY → YVR", detail: "" }] },
      "2026-11-09": { location: "Vancouver", accommodation: "", notes: "", items: [] },
      "2026-11-10": { location: "Manila", accommodation: "", notes: "", items: [{ id: uid(), type: "flight", time: "", title: "YVR → MNL", detail: "" }] },
      "2026-11-11": { location: "Manila", accommodation: "", notes: "", items: [] },
      "2026-11-12": { location: "Manila", accommodation: "", notes: "", items: [] },
      "2026-11-13": { location: "Manila", accommodation: "", notes: "", items: [] },
      "2026-11-14": { location: "", accommodation: "", notes: "", items: [{ id: uid(), type: "flight", time: "", title: "MNL → ???", detail: "" }] },
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

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.707 17.64 9.2z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

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
        <span className="tdot" style={{ background: t.color }} />{t.label}<ChevronDown size={14} />
      </button>
      {open && (
        <div className="type-menu">
          {TYPE_KEYS.map((k) => {
            const Icon = ITEM_TYPES[k].icon;
            return (
              <button key={k} className="type-opt" type="button" onClick={() => { onChange(k); setOpen(false); }}>
                <Icon size={15} style={{ color: ITEM_TYPES[k].color }} />{ITEM_TYPES[k].label}
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
          {day.items.length === 0
            ? <div className="items-empty">Nothing planned yet. Add a flight, activity, or anything else.</div>
            : day.items.map((it) => (
              <ItemCard key={it.id} item={it}
                onChange={(next) => updateItem(it.id, next)}
                onDelete={() => delItem(it.id)} />
            ))
          }
          <div className="field" style={{ marginTop: 20 }}>
            <label className="field-label"><StickyNote size={14} /> Notes</label>
            <textarea className="inp" value={day.notes} placeholder="Anything else to remember for the day"
              onChange={(e) => patch({ notes: e.target.value })} />
          </div>
        </div>
      </aside>
    </>
  );
}

function DayCard({ cellDay, data, isToday, tag, onOpen }) {
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
        {tag && <span className="dc-month-tag">{tag}</span>}
      </div>
      {data?.location
        ? <div className="dc-loc"><MapPin size={13} /><span className="ctitle">{data.location}</span></div>
        : <div className="dc-loc placeholder"><MapPin size={13} />Add location</div>}
      {data?.accommodation && (
        <div className="dc-accom"><BedDouble size={12} /><span className="ctitle">{data.accommodation}</span></div>
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
        <div className="dc-notes"><StickyNote size={11} /><span className="ctitle">{data.notes}</span></div>
      )}
      <span className="dc-add"><Plus size={14} /></span>
    </button>
  );
}

function TodoSection({ todos = [], onChange }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...todos, { id: uid(), text, done: false }]);
    setDraft("");
  };
  const toggle = (id) => onChange(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const del = (id) => onChange(todos.filter((t) => t.id !== id));
  const pending = todos.filter((t) => !t.done).length;
  return (
    <div className="todo-section">
      <div className="todo-header">
        <span className="todo-header-title">Checklist</span>
        {pending > 0 && <span className="todo-count">{pending}</span>}
      </div>
      {todos.length > 0 && (
        <div className="todo-list">
          {todos.map((t) => (
            <div key={t.id} className={`todo-item${t.done ? " done" : ""}`}>
              <button className="todo-check" onClick={() => toggle(t.id)}>
                {t.done && <Check size={11} />}
              </button>
              <span className="todo-text">{t.text}</span>
              <button className="todo-del" onClick={() => del(t.id)}><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="todo-add-row">
        <input className="todo-inp" value={draft} placeholder="Add a task…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
        <button className="todo-add-btn" onClick={add}><Plus size={14} /></button>
      </div>
    </div>
  );
}

function ExpenseSection({ expenses = [], onChange }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("other");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const add = () => {
    const text = desc.trim();
    const amt = parseFloat(amount);
    if (!text || isNaN(amt) || amt <= 0) return;
    onChange([...expenses, { id: uid(), desc: text, amount: amt, cat }]);
    setDesc(""); setAmount("");
  };
  const del = (id) => onChange(expenses.filter((e) => e.id !== id));
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <div className="expense-section">
      <div className="expense-header">
        <span className="expense-header-title">Expenses</span>
        {expenses.length > 0 && <span className="expense-total-badge">{fmtMoney(total)}</span>}
      </div>
      {expenses.length > 0 && (
        <div className="expense-list">
          {expenses.map((e) => (
            <div key={e.id} className="expense-item">
              <span className="expense-dot" style={{ background: EXPENSE_CATS[e.cat]?.color || "var(--grey)" }} />
              <span className="expense-desc">{e.desc}</span>
              <span className="expense-cat-label">{EXPENSE_CATS[e.cat]?.label}</span>
              <span className="expense-amt">{fmtMoney(e.amount)}</span>
              <button className="expense-del" onClick={() => del(e.id)}><X size={12} /></button>
            </div>
          ))}
          <div className="expense-divider" />
          <div className="expense-item expense-total-row">
            <span className="expense-desc">Total</span>
            <span className="expense-amt">{fmtMoney(total)}</span>
            <span style={{ width: 20 }} />
          </div>
        </div>
      )}
      <div className="expense-add-row">
        <div className="expense-cat-pick" ref={catRef}>
          <button className="expense-cat-btn" onClick={() => setCatOpen((o) => !o)} title={EXPENSE_CATS[cat].label}>
            <span className="expense-dot" style={{ background: EXPENSE_CATS[cat].color }} />
            <ChevronDown size={11} />
          </button>
          {catOpen && (
            <div className="expense-cat-menu">
              {EXPENSE_CAT_KEYS.map((k) => (
                <button key={k} className="expense-cat-opt" onClick={() => { setCat(k); setCatOpen(false); }}>
                  <span className="expense-dot" style={{ background: EXPENSE_CATS[k].color }} />
                  {EXPENSE_CATS[k].label}
                </button>
              ))}
            </div>
          )}
        </div>
        <input className="expense-desc-inp" value={desc} placeholder="Description"
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
        <div className="expense-amt-wrap">
          <span className="expense-currency">$</span>
          <input className="expense-amt-inp" type="number" min="0" step="0.01" value={amount}
            placeholder="0.00" onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
        </div>
        <button className="expense-add-btn" onClick={add}><Plus size={14} /></button>
      </div>
    </div>
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

function SignInScreen({ onSignIn, signingIn, error }) {
  return (
    <div className="itin-root">
      <style>{STYLES}</style>
      <div className="signin-screen">
        <div className="signin-card">
          <div className="signin-logo">
            <Plane size={34} />
          </div>
          <h1 className="signin-brand">Wayfarer</h1>
          <p className="signin-tagline">Your trips, beautifully planned.</p>
          <button className="google-btn" onClick={onSignIn} disabled={signingIn}>
            <GoogleG />
            {signingIn ? "Signing in…" : "Sign in with Google"}
          </button>
          {error && <p className="signin-error">{error}</p>}
          <p className="signin-caption">Your trips are private and sync across all your browsers and devices.</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Root                                                               */
/* ================================================================== */
export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState({ trips: [], activeId: null });
  const [trip, setTrip] = useState(null);
  const [openDay, setOpenDay] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const saveTimer = useRef(null);
  const menuRef = useRef(null);

  const loadData = useCallback(async (u) => {
    setLoading(true);
    await migrateFromLocalStorage(u);
    let idx = await fsGetIndex(u);
    if (!idx || !idx.trips?.length) {
      const t = sampleTrip();
      idx = { trips: [{ id: t.id, name: t.name }], activeId: t.id };
      await fsSetIndex(u, idx);
      await fsSetTrip(u, t.id, t);
      setIndex(idx); setTrip(t);
    } else {
      setIndex(idx);
      const activeId = idx.activeId || idx.trips[0].id;
      let t = await fsGetTrip(u, activeId);
      if (t && `${t.startDate}|${t.endDate}` === LEGACY_SEED_FINGERPRINT) {
        t = sampleTrip(t.id);
        await fsSetTrip(u, t.id, t);
        const fixedIdx = { ...idx, trips: idx.trips.map((x) => (x.id === t.id ? { ...x, name: t.name } : x)) };
        setIndex(fixedIdx); await fsSetIndex(u, fixedIdx);
      }
      setTrip(t);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadData(u.uid);
      } else {
        setTrip(null);
        setIndex({ trips: [], activeId: null });
      }
      setAuthLoading(false);
    });
  }, [loadData]);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const persistTrip = useCallback((t) => {
    if (!user) return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await fsSetTrip(user.uid, t.id, t);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1600);
    }, 500);
  }, [user]);

  const updateTrip = (next) => { setTrip(next); persistTrip(next); };

  const addWeek = () => {
    const e = parseISO(trip.endDate); e.setDate(e.getDate() + 7);
    updateTrip({ ...trip, endDate: toISO(e) });
  };
  const removeWeek = () => {
    const s = parseISO(trip.startDate);
    const e = parseISO(trip.endDate); e.setDate(e.getDate() - 7);
    if (e < s) return;
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
  const updateDay = (iso, dayData) => updateTrip({ ...trip, days: { ...trip.days, [iso]: dayData } });
  const updateTodos = (todos) => updateTrip({ ...trip, todos });
  const updateExpenses = (expenses) => updateTrip({ ...trip, expenses });

  const updateName = (name) => {
    const next = { ...trip, name };
    setTrip(next); persistTrip(next);
    const idx = { ...index, trips: index.trips.map((x) => (x.id === trip.id ? { ...x, name } : x)) };
    setIndex(idx); fsSetIndex(user.uid, idx);
  };
  const switchTrip = async (id) => {
    setMenuOpen(false);
    if (id === trip?.id) return;
    const t = await fsGetTrip(user.uid, id);
    setTrip(t);
    const idx = { ...index, activeId: id }; setIndex(idx); fsSetIndex(user.uid, idx);
  };
  const createTrip = async ({ name, startDate, endDate }) => {
    const t = { id: uid(), name, startDate, endDate, days: {} };
    await fsSetTrip(user.uid, t.id, t);
    const idx = { trips: [...index.trips, { id: t.id, name }], activeId: t.id };
    setIndex(idx); await fsSetIndex(user.uid, idx);
    setTrip(t); setShowNew(false); setMenuOpen(false);
  };
  const saveSettings = ({ name, startDate, endDate }) => {
    const next = { ...trip, name, startDate, endDate };
    updateTrip(next);
    const idx = { ...index, trips: index.trips.map((x) => (x.id === trip.id ? { ...x, name } : x)) };
    setIndex(idx); fsSetIndex(user.uid, idx);
    setShowSettings(false);
  };
  const deleteTrip = async (id) => {
    await fsDelTrip(user.uid, id);
    const remaining = index.trips.filter((x) => x.id !== id);
    if (remaining.length === 0) {
      const idx = { trips: [], activeId: null };
      setIndex(idx); await fsSetIndex(user.uid, idx);
      setTrip(null); setShowSettings(false); setShowNew(true);
      return;
    }
    const nextActive = remaining[0].id;
    const idx = { trips: remaining, activeId: nextActive };
    setIndex(idx); await fsSetIndex(user.uid, idx);
    const t = await fsGetTrip(user.uid, nextActive);
    setTrip(t); setShowSettings(false); setMenuOpen(false);
  };

  const handleSignIn = async () => {
    setSigningIn(true); setSignInError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setSignInError("Sign-in failed — please try again.");
      setSigningIn(false);
    }
  };

  /* ---- loading / auth states ---- */
  if (authLoading || (user && loading)) {
    return (
      <div className="itin-root">
        <style>{STYLES}</style>
        <div className="loading-screen">
          <div className="loading-inner">
            <div className="loading-logo"><Plane size={28} /></div>
            <div className="loading-text">{authLoading ? "Checking in…" : "Loading your trips…"}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <SignInScreen onSignIn={handleSignIn} signingIn={signingIn} error={signInError} />;

  if (!trip) {
    return (
      <div className="itin-root">
        <style>{STYLES}</style>
        <div className="empty-state">
          <div className="es-mark"><CalendarDays size={30} /></div>
          <h1>Plan your first trip</h1>
          <p>Lay your itinerary out on a calendar — locations, flights, accommodation and everything in between, day by day.</p>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={16} style={{ marginRight: 6, verticalAlign: "-2px" }} />New trip
          </button>
        </div>
        {showNew && <NewTripModal canCancel={false} onCreate={createTrip} onClose={() => setShowNew(false)} />}
      </div>
    );
  }

  const { weeks, total } = buildCalendar(trip.startDate, trip.endDate);
  const todayISO = toISO(new Date());
  const canRemoveWeek = total > 7;

  return (
    <div className="itin-root">
      <style>{STYLES}</style>

      {/* top bar */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark"><Plane size={17} /></span>
            <span className="brand-name">Wayfarer</span>
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

            <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Trip settings">
              <Settings size={18} />
            </button>

            <button className="user-btn" onClick={() => signOut(auth)} title="Sign out">
              {user.photoURL
                ? <img className="user-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                : <div className="user-initial">{(user.displayName || user.email || "U")[0].toUpperCase()}</div>
              }
              <LogOut size={14} />
            </button>
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

        <div className="cal-scroll">
          <div className="weekday-head">
            <span />
            {DOW.map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="cal-grid">
            {weeks.map((week, wi) => {
              const isLastRow = wi === weeks.length - 1;
              return (
                <div className="week-row" key={wi}>
                  <div className="week-gutter">
                    {isLastRow && (
                      <button className="remove-week-handle" disabled={!canRemoveWeek} onClick={removeWeek}
                        title={canRemoveWeek ? "Remove this week" : "Trip is already 7 days or fewer"}>
                        <Minus size={14} />
                      </button>
                    )}
                  </div>
                  {week.map((cell, ci) => (
                    cell.inTrip ? (
                      <div className="cell" key={ci}>
                        <DayCard cellDay={cell} data={trip.days[cell.iso]}
                          isToday={cell.iso === todayISO}
                          tag={monthTag(cell, cell.iso === trip.startDate)}
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
              );
            })}
          </div>
        </div>

        <div className="add-week-row">
          <button className="add-week" onClick={addWeek}><Plus size={15} /> Add week</button>
        </div>

        <div className="bottom-panels">
          <TodoSection todos={trip.todos || []} onChange={updateTodos} />
          <ExpenseSection expenses={trip.expenses || []} onChange={updateExpenses} />
        </div>
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
