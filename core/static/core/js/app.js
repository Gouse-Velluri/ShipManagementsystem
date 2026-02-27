// ============================================================
// MARINEOPS — SHIP MAINTENANCE SYSTEM
// localStorage-based, no backend required
// ============================================================

// ─── SEED DATA ───────────────────────────────────────────────
const SEED = {
  users: [
    { id: '1', role: 'Admin',     email: 'admin@entnt.in',     password: 'admin123'   },
    { id: '2', role: 'Inspector', email: 'inspector@entnt.in', password: 'inspect123' },
    { id: '3', role: 'Engineer',  email: 'engineer@entnt.in',  password: 'engine123'  },
  ],
  ships: [
    { id: 's1', name: 'Ever Given',      imo: '9811000', flag: 'Panama', status: 'Active',            type: 'Container', year: 2018 },
    { id: 's2', name: 'Maersk Alabama',  imo: '9164263', flag: 'USA',    status: 'Under Maintenance', type: 'Cargo',     year: 2015 },
    { id: 's3', name: 'MSC Oscar',       imo: '9703291', flag: 'Panama', status: 'Active',            type: 'Container', year: 2014 },
    { id: 's4', name: 'CSCL Globe',      imo: '9695107', flag: 'China',  status: 'Inactive',          type: 'Container', year: 2014 },
  ],
  components: [
    { id: 'c1', shipId: 's1', name: 'Main Engine',      serialNumber: 'ME-1234',  installDate: '2020-01-10', lastMaintenanceDate: '2024-03-12' },
    { id: 'c2', shipId: 's1', name: 'Navigation System',serialNumber: 'NAV-001',  installDate: '2020-01-10', lastMaintenanceDate: '2024-11-01' },
    { id: 'c3', shipId: 's2', name: 'Radar',            serialNumber: 'RAD-5678', installDate: '2021-07-18', lastMaintenanceDate: '2023-12-01' },
    { id: 'c4', shipId: 's2', name: 'Propeller Shaft',  serialNumber: 'PS-0099',  installDate: '2021-07-18', lastMaintenanceDate: '2022-06-15' },
    { id: 'c5', shipId: 's3', name: 'Anchor System',    serialNumber: 'AS-3344',  installDate: '2019-03-22', lastMaintenanceDate: '2024-01-08' },
    { id: 'c6', shipId: 's4', name: 'Fuel System',      serialNumber: 'FS-7890',  installDate: '2018-09-01', lastMaintenanceDate: '2023-08-20' },
  ],
  jobs: [
    { id: 'j1', componentId: 'c1', shipId: 's1', type: 'Inspection',   priority: 'High',   status: 'Open',        assignedEngineerId: '3', scheduledDate: '2025-05-05', notes: 'Annual engine inspection' },
    { id: 'j2', componentId: 'c3', shipId: 's2', type: 'Repair',       priority: 'High',   status: 'In Progress', assignedEngineerId: '3', scheduledDate: '2025-04-20', notes: 'Radar calibration repair' },
    { id: 'j3', componentId: 'c2', shipId: 's1', type: 'Maintenance',  priority: 'Medium', status: 'Completed',   assignedEngineerId: '3', scheduledDate: '2025-03-10', notes: 'Navigation update' },
    { id: 'j4', componentId: 'c4', shipId: 's2', type: 'Replacement',  priority: 'Critical','status': 'Open',     assignedEngineerId: '3', scheduledDate: '2025-06-01', notes: 'Propeller shaft worn' },
    { id: 'j5', componentId: 'c5', shipId: 's3', type: 'Inspection',   priority: 'Low',    status: 'Completed',   assignedEngineerId: '3', scheduledDate: '2025-02-15', notes: 'Routine check' },
    { id: 'j6', componentId: 'c6', shipId: 's4', type: 'Maintenance',  priority: 'Medium', status: 'In Progress', assignedEngineerId: '3', scheduledDate: '2025-05-18', notes: 'Fuel filter replacement' },
  ],
  notifications: [],
};

// ─── STORAGE UTILS ───────────────────────────────────────────
const Storage = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  set: (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
  },
  init: () => {
    if (!Storage.get('initialized')) {
      Storage.set('users',         SEED.users);
      Storage.set('ships',         SEED.ships);
      Storage.set('components',    SEED.components);
      Storage.set('jobs',          SEED.jobs);
      Storage.set('notifications', SEED.notifications);
      Storage.set('initialized',   true);
    }
  },
};

// ─── AUTH ─────────────────────────────────────────────────────
const Auth = {
  currentUser: () => Storage.get('currentUser'),
  login: (email, password) => {
    const users = Storage.get('users') || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      Storage.set('currentUser', user);
      return user;
    }
    return null;
  },
  logout: () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  },
  require: () => {
    const u = Auth.currentUser();
    if (!u) { window.location.href = '/'; }
    return u;
  },
  can: (action) => {
    const u = Auth.currentUser();
    if (!u) return false;
    const permissions = {
      Admin:     ['create','edit','delete','view'],
      Inspector: ['view','create_job','update_job'],
      Engineer:  ['view','update_job'],
    };
    return permissions[u.role]?.includes(action);
  },
};

// ─── DATA ACCESS LAYER ────────────────────────────────────────
const DB = {
  ships: {
    all:    ()   => Storage.get('ships') || [],
    get:    (id) => (Storage.get('ships') || []).find(s => s.id === id),
    save:   (s)  => {
      const ships = DB.ships.all();
      const idx = ships.findIndex(x => x.id === s.id);
      if (idx >= 0) ships[idx] = s; else ships.push(s);
      Storage.set('ships', ships);
    },
    delete: (id) => {
      Storage.set('ships', DB.ships.all().filter(s => s.id !== id));
      Storage.set('components', DB.components.all().filter(c => c.shipId !== id));
      Storage.set('jobs', DB.jobs.all().filter(j => j.shipId !== id));
    },
    newId: () => 's' + Date.now(),
  },
  components: {
    all:        ()       => Storage.get('components') || [],
    get:        (id)     => (Storage.get('components') || []).find(c => c.id === id),
    byShip:     (shipId) => (Storage.get('components') || []).filter(c => c.shipId === shipId),
    save:       (c)      => {
      const comps = DB.components.all();
      const idx = comps.findIndex(x => x.id === c.id);
      if (idx >= 0) comps[idx] = c; else comps.push(c);
      Storage.set('components', comps);
    },
    delete: (id) => {
      Storage.set('components', DB.components.all().filter(c => c.id !== id));
      Storage.set('jobs', DB.jobs.all().filter(j => j.componentId !== id));
    },
    newId: () => 'c' + Date.now(),
    isOverdue: (comp) => {
      if (!comp.lastMaintenanceDate) return true;
      const last = new Date(comp.lastMaintenanceDate);
      const diff = (Date.now() - last) / (1000*60*60*24);
      return diff > 365;
    },
  },
  jobs: {
    all:      ()       => Storage.get('jobs') || [],
    get:      (id)     => (Storage.get('jobs') || []).find(j => j.id === id),
    byShip:   (shipId) => (Storage.get('jobs') || []).filter(j => j.shipId === shipId),
    byDate:   (date)   => (Storage.get('jobs') || []).filter(j => j.scheduledDate === date),
    save:     (j)      => {
      const jobs = DB.jobs.all();
      const idx = jobs.findIndex(x => x.id === j.id);
      if (idx >= 0) jobs[idx] = j; else jobs.push(j);
      Storage.set('jobs', jobs);
    },
    delete: (id) => Storage.set('jobs', DB.jobs.all().filter(j => j.id !== id)),
    newId:  () => 'j' + Date.now(),
  },
  notifications: {
    all:  () => Storage.get('notifications') || [],
    add:  (msg, type = 'info') => {
      const notifs = DB.notifications.all();
      notifs.unshift({ id: 'n' + Date.now(), msg, type, time: new Date().toISOString(), read: false });
      Storage.set('notifications', notifs.slice(0, 50));
      App.updateNotifBadge();
    },
    dismiss: (id) => {
      Storage.set('notifications', DB.notifications.all().filter(n => n.id !== id));
      App.updateNotifBadge();
    },
    clearAll: () => {
      Storage.set('notifications', []);
      App.updateNotifBadge();
    },
  },
};

// ─── UI UTILS ─────────────────────────────────────────────────
const UI = {
  el: (sel) => document.querySelector(sel),
  els: (sel) => document.querySelectorAll(sel),

  toast: (msg, type = 'success') => {
    const container = UI.el('.toast-container') || (() => {
      const c = document.createElement('div');
      c.className = 'toast-container';
      document.body.appendChild(c);
      return c;
    })();
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ'}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 300); }, 3000);
  },

  openModal: (id) => {
    const m = UI.el('#' + id);
    if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
  },
  closeModal: (id) => {
    const m = UI.el('#' + id);
    if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  },

  statusBadge: (status) => {
    const map = {
      'Open':          'badge-blue',
      'In Progress':   'badge-amber',
      'Completed':     'badge-green',
      'Active':        'badge-green',
      'Under Maintenance': 'badge-amber',
      'Inactive':      'badge-gray',
    };
    return `<span class="badge ${map[status]||'badge-gray'}">${status}</span>`;
  },

  priorityBadge: (p) => {
    const map = { Critical:'badge-red', High:'badge-red', Medium:'badge-amber', Low:'badge-green' };
    return `<span class="badge ${map[p]||'badge-gray'}">${p}</span>`;
  },

  confirm: (msg) => window.confirm(msg),

  fmtDate: (d) => d ? new Date(d).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}) : '—',

  validate: (fields) => {
    let valid = true;
    fields.forEach(({ el, msg }) => {
      const input = typeof el === 'string' ? UI.el(el) : el;
      const err = input?.parentElement?.querySelector('.form-error');
      if (!input?.value?.trim()) {
        if (err) err.textContent = msg || 'Required';
        input?.classList.add('error');
        valid = false;
      } else {
        if (err) err.textContent = '';
        input?.classList.remove('error');
      }
    });
    return valid;
  },

  clearErrors: (formId) => {
    UI.els(`#${formId} .form-error`).forEach(e => e.textContent = '');
    UI.els(`#${formId} .error`).forEach(e => e.classList.remove('error'));
  },
};

// ─── APP CONTROLLER ───────────────────────────────────────────
const App = {
  init: () => {
    Storage.init();
    App.setupSidebar();
    App.setupNotifications();
    App.updateNotifBadge();
    App.highlightNav();
  },

  setupSidebar: () => {
    // Mobile hamburger
    const ham = UI.el('.hamburger');
    const sidebar = UI.el('.sidebar');
    const overlay = UI.el('.mobile-overlay');
    if (ham) {
      ham.onclick = () => {
        sidebar.classList.toggle('mobile-open');
        overlay?.classList.toggle('active');
      };
    }
    if (overlay) {
      overlay.onclick = () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      };
    }

    // Logout
    const logoutBtn = UI.el('.logout-btn');
    if (logoutBtn) logoutBtn.onclick = Auth.logout;

    // Populate user info
    const user = Auth.currentUser();
    if (user) {
      const nameEl = UI.el('.user-name');
      const roleEl = UI.el('.user-role');
      const avatarEl = UI.el('.user-avatar');
      if (nameEl) nameEl.textContent = user.email.split('@')[0];
      if (roleEl) roleEl.textContent = user.role;
      if (avatarEl) avatarEl.textContent = user.email[0].toUpperCase();
    }
  },

  highlightNav: () => {
    const path = window.location.pathname;
    UI.els('.nav-item').forEach(item => {
      const href = item.dataset.href || item.getAttribute('href');
      if (!href) return;
      if (href === '/' && path === '/') item.classList.add('active');
      else if (href !== '/' && path.startsWith(href)) item.classList.add('active');
    });
  },

  setupNotifications: () => {
    const btn = UI.el('.notif-btn');
    const panel = UI.el('.notif-panel');
    if (!btn || !panel) return;

    btn.onclick = (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
      App.renderNotifPanel();
    };
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('open');
      }
    });
  },

  renderNotifPanel: () => {
    const panel = UI.el('.notif-panel');
    if (!panel) return;
    const notifs = DB.notifications.all();
    const icons = { info: '🔵', success: '🟢', warning: '🟡' };

    panel.innerHTML = `
      <div class="notif-panel-header">
        <span class="notif-panel-title">Notifications</span>
        ${notifs.length ? `<button class="btn btn-sm btn-secondary" onclick="DB.notifications.clearAll();App.renderNotifPanel()">Clear all</button>` : ''}
      </div>
      ${notifs.length === 0
        ? '<div class="notif-empty">No notifications</div>'
        : notifs.map(n => `
          <div class="notif-item" id="notif-${n.id}">
            <span class="notif-dot ${n.type}"></span>
            <div class="notif-content">
              <div class="notif-msg">${n.msg}</div>
              <div class="notif-time">${timeAgo(n.time)}</div>
            </div>
            <button class="notif-dismiss" onclick="DB.notifications.dismiss('${n.id}');App.renderNotifPanel()" title="Dismiss">✕</button>
          </div>`).join('')
      }`;
  },

  updateNotifBadge: () => {
    const badge = UI.el('.notif-badge');
    const count = DB.notifications.all().length;
    if (badge) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },
};

// ─── HELPERS ─────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

function genId(prefix) {
  return prefix + Date.now() + Math.random().toString(36).slice(2,5);
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
