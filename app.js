// ─── Storage ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'dash_tickets';

function loadTickets() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveTickets(tickets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function genId() {
  return '#' + String(Math.floor(Math.random() * 9000) + 1000);
}

// ─── State ──────────────────────────────────────────────────────────────────
let tickets = loadTickets();
let currentView = 'dashboard';

// Seed demo data if empty
if (tickets.length === 0) {
  const demo = [
    { id: '#1001', title: 'Botão de login não responde no mobile', desc: 'Usuários relatam que o botão de login não funciona em dispositivos iOS.', status: 'open', priority: 'high', category: 'bug', assignee: 'Ana Silva', createdAt: Date.now() - 86400000 * 2 },
    { id: '#1002', title: 'Adicionar filtro por data no relatório', desc: 'Clientes precisam filtrar relatórios por intervalo de datas customizado.', status: 'progress', priority: 'medium', category: 'feature', assignee: 'Carlos Matos', createdAt: Date.now() - 86400000 },
    { id: '#1003', title: 'Erro ao exportar PDF com caracteres especiais', desc: 'Acentuação e caracteres especiais aparecem corrompidos no PDF exportado.', status: 'open', priority: 'high', category: 'bug', assignee: 'Beatriz Ramos', createdAt: Date.now() - 3600000 * 5 },
    { id: '#1004', title: 'Atualizar documentação da API', desc: 'Documentar os novos endpoints adicionados no último sprint.', status: 'closed', priority: 'low', category: 'other', assignee: 'Diego Ferreira', createdAt: Date.now() - 86400000 * 5 },
    { id: '#1005', title: 'Dashboard lento com muitos dados', desc: 'Quando existem mais de 10.000 registros, o dashboard demora mais de 10s para carregar.', status: 'progress', priority: 'high', category: 'bug', assignee: 'Ana Silva', createdAt: Date.now() - 3600000 * 2 },
  ];
  tickets = demo;
  saveTickets(tickets);
}

// ─── Labels ──────────────────────────────────────────────────────────────────
const statusLabel = { open: 'Aberto', progress: 'Em Andamento', closed: 'Resolvido' };
const priorityLabel = { low: 'Baixa', medium: 'Média', high: 'Alta' };
const categoryLabel = { bug: 'Bug', feature: 'Feature', support: 'Suporte', other: 'Outro' };

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora mesmo';
  if (m < 60) return `há ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

// ─── Render ──────────────────────────────────────────────────────────────────
function renderTicketItem(t) {
  const div = document.createElement('div');
  div.className = 'ticket-item';
  div.innerHTML = `
    <span class="ticket-id">${t.id}</span>
    <div class="ticket-info">
      <div class="ticket-title">${escHtml(t.title)}</div>
      <div class="ticket-meta">${categoryLabel[t.category] || t.category} · ${t.assignee ? escHtml(t.assignee) : 'Sem responsável'} · ${timeAgo(t.createdAt)}</div>
    </div>
    <div class="ticket-badges">
      <span class="badge badge-${t.priority}">${priorityLabel[t.priority]}</span>
      <span class="badge badge-${t.status}">${statusLabel[t.status]}</span>
    </div>
  `;
  div.addEventListener('click', () => openModal(t.id));
  return div;
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderDashboard() {
  document.getElementById('stat-total').textContent = tickets.length;
  document.getElementById('stat-open').textContent = tickets.filter(t => t.status === 'open').length;
  document.getElementById('stat-progress').textContent = tickets.filter(t => t.status === 'progress').length;
  document.getElementById('stat-closed').textContent = tickets.filter(t => t.status === 'closed').length;

  const container = document.getElementById('recent-tickets');
  container.innerHTML = '';
  const recent = [...tickets].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🎫</div><div>Nenhum ticket ainda. Crie o primeiro!</div></div>';
  } else {
    recent.forEach(t => container.appendChild(renderTicketItem(t)));
  }
}

function renderTickets() {
  const search = document.getElementById('search').value.toLowerCase();
  const statusF = document.getElementById('filter-status').value;
  const priorityF = document.getElementById('filter-priority').value;

  const filtered = tickets.filter(t => {
    if (search && !t.title.toLowerCase().includes(search) && !t.id.includes(search)) return false;
    if (statusF && t.status !== statusF) return false;
    if (priorityF && t.priority !== priorityF) return false;
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const container = document.getElementById('all-tickets');
  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><div>Nenhum ticket encontrado.</div></div>';
  } else {
    filtered.forEach(t => container.appendChild(renderTicketItem(t)));
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────
const viewTitles = { dashboard: 'Dashboard', tickets: 'Todos os Tickets', new: 'Novo Ticket' };

function showView(name) {
  currentView = name;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById('view-' + name);
  if (view) view.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-view="${name}"]`);
  if (navItem) navItem.classList.add('active');

  document.getElementById('page-title').textContent = viewTitles[name] || name;

  if (name === 'dashboard') renderDashboard();
  if (name === 'tickets') renderTickets();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    showView(item.dataset.view);
  });
});

document.getElementById('new-ticket-btn').addEventListener('click', () => showView('new'));
document.getElementById('cancel-btn').addEventListener('click', () => showView('dashboard'));

document.getElementById('search').addEventListener('input', renderTickets);
document.getElementById('filter-status').addEventListener('change', renderTickets);
document.getElementById('filter-priority').addEventListener('change', renderTickets);

// ─── Form ────────────────────────────────────────────────────────────────────
document.getElementById('ticket-form').addEventListener('submit', e => {
  e.preventDefault();
  const ticket = {
    id: genId(),
    title: document.getElementById('f-title').value.trim(),
    desc: document.getElementById('f-desc').value.trim(),
    priority: document.getElementById('f-priority').value,
    category: document.getElementById('f-category').value,
    assignee: document.getElementById('f-assignee').value.trim(),
    status: 'open',
    createdAt: Date.now(),
  };
  tickets.unshift(ticket);
  saveTickets(tickets);
  document.getElementById('ticket-form').reset();
  toast('Ticket criado com sucesso!');
  showView('dashboard');
});

// ─── Modal ───────────────────────────────────────────────────────────────────
let activeTicketId = null;

function openModal(id) {
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  activeTicketId = id;

  document.getElementById('modal-title').textContent = `${t.id} — ${t.title}`;
  document.getElementById('modal-status').value = t.status;

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-detail">
      <div class="label">Descrição</div>
      <div class="value">${t.desc ? escHtml(t.desc) : '<em style="color:var(--text-muted)">Sem descrição</em>'}</div>
    </div>
    <div class="modal-detail" style="display:flex;gap:24px;margin-top:16px">
      <div>
        <div class="label">Prioridade</div>
        <span class="badge badge-${t.priority}">${priorityLabel[t.priority]}</span>
      </div>
      <div>
        <div class="label">Categoria</div>
        <span class="badge badge-${t.category}">${categoryLabel[t.category] || t.category}</span>
      </div>
      <div>
        <div class="label">Responsável</div>
        <div class="value">${t.assignee ? escHtml(t.assignee) : '—'}</div>
      </div>
      <div>
        <div class="label">Criado</div>
        <div class="value">${timeAgo(t.createdAt)}</div>
      </div>
    </div>
  `;

  document.getElementById('modal').style.display = 'flex';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => { if (e.target === document.getElementById('modal')) closeModal(); });

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  activeTicketId = null;
}

document.getElementById('modal-save').addEventListener('click', () => {
  const t = tickets.find(x => x.id === activeTicketId);
  if (!t) return;
  t.status = document.getElementById('modal-status').value;
  saveTickets(tickets);
  closeModal();
  toast('Status atualizado!');
  if (currentView === 'dashboard') renderDashboard();
  if (currentView === 'tickets') renderTickets();
});

document.getElementById('modal-delete').addEventListener('click', () => {
  if (!confirm('Excluir este ticket?')) return;
  tickets = tickets.filter(x => x.id !== activeTicketId);
  saveTickets(tickets);
  closeModal();
  toast('Ticket excluído.');
  if (currentView === 'dashboard') renderDashboard();
  if (currentView === 'tickets') renderTickets();
});

// ─── Toast ───────────────────────────────────────────────────────────────────
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ─── Init ────────────────────────────────────────────────────────────────────
showView('dashboard');
