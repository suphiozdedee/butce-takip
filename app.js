const STORE_KEY = "suphi_finance_premium_v1";

const banks = {
  garanti: {
    id: "garanti",
    name: "Garanti BBVA",
    logo: "./assets/logos/garanti-bbva.svg",
    accent: "#26d39b",
  },
  yapikredi: {
    id: "yapikredi",
    name: "Yapı Kredi",
    logo: "./assets/logos/yapi-kredi.svg",
    accent: "#8eb7ff",
  },
  enpara: {
    id: "enpara",
    name: "Enpara",
    logo: "./assets/logos/enpara.svg",
    accent: "#b99cff",
  },
};

const networks = {
  visa: "./assets/logos/visa.svg",
  mastercard: "./assets/logos/mastercard.svg",
};

const defaultState = {
  isLoggedIn: false,
  privacyMode: false,
  activeSection: "calendar",
  cashAccounts: [
    {
      id: "garanti-vadesiz-1",
      bank: "garanti",
      name: "Vadesiz TL Hesabı",
      type: "Vadesiz",
      balance: 12199.18,
      includedInCash: true,
    },
    {
      id: "yapikredi-vadesiz-1",
      bank: "yapikredi",
      name: "Vadesiz TL Hesabı",
      type: "Vadesiz",
      balance: 145.92,
      includedInCash: true,
    },
    {
      id: "enpara-vadesiz-1",
      bank: "enpara",
      name: "Vadesiz TL Hesabı",
      type: "Vadesiz",
      balance: 0,
      includedInCash: true,
    },
  ],
  creditCards: [
    {
      id: "world-gold",
      bank: "yapikredi",
      name: "World Gold",
      network: "visa",
      last4: "8221",
      limit: 22400,
      availableLimit: 742.78,
      totalDebt: 21741.35,
      minimumPayment: null,
      dueDate: "2026-05-13",
      statementNote: "Minimum ödeme girilmedi",
    },
    {
      id: "ms-platinum",
      bank: "garanti",
      name: "M&S Platinum",
      network: "mastercard",
      last4: "1018",
      limit: 45000,
      availableLimit: 12.25,
      totalDebt: 33866.09,
      minimumPayment: 7865,
      dueDate: "2026-06-05",
      statementNote: "Minimum ödeme baz alındı",
    },
    {
      id: "shopfly-business",
      bank: "garanti",
      name: "Shop&Fly Business",
      network: "mastercard",
      last4: "4425",
      limit: 10000,
      availableLimit: 905.53,
      totalDebt: 9094.47,
      minimumPayment: 1011,
      dueDate: "2026-06-01",
      statementNote: "Minimum ödeme baz alındı",
    },
  ],
  loans: [
    {
      id: "garanti-ihtiyac",
      bank: "garanti",
      name: "İhtiyaç Kredisi",
      remainingDebt: 36218.28,
      monthlyInstallment: 18109.13,
      remainingInstallments: 3,
      nextPaymentDate: "2026-06-01",
    },
    {
      id: "enpara-yapilandirma",
      bank: "enpara",
      name: "Yapılandırma Kredisi",
      remainingDebt: 94792.06,
      monthlyInstallment: 15798.67,
      remainingInstallments: 6,
      nextPaymentDate: "2026-06-01",
    },
  ],
  fixedExpenses: [
    {
      id: "rent",
      name: "Kira",
      category: "Ev",
      amount: 0,
      windowStartDay: 1,
      windowEndDay: 5,
      frequency: "Her ay",
      status: "pending",
    },
    {
      id: "internet",
      name: "İnternet",
      category: "Fatura",
      amount: 0,
      windowStartDay: 1,
      windowEndDay: 5,
      frequency: "Her ay",
      status: "pending",
    },
    {
      id: "phone",
      name: "Telefon",
      category: "Fatura",
      amount: 0,
      windowStartDay: 1,
      windowEndDay: 5,
      frequency: "Her ay",
      status: "pending",
    },
    {
      id: "subscriptions",
      name: "Abonelikler",
      category: "Dijital",
      amount: 0,
      windowStartDay: 1,
      windowEndDay: 5,
      frequency: "Her ay",
      status: "pending",
    },
    {
      id: "business",
      name: "İş / Muhasebe",
      category: "İş",
      amount: 0,
      windowStartDay: 1,
      windowEndDay: 5,
      frequency: "Her ay",
      status: "pending",
    },
  ],
  transactions: [],
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    return saved ? { ...defaultState, ...saved } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function resetState() {
  localStorage.removeItem(STORE_KEY);
  state = structuredClone(defaultState);
  render();
}

function formatMoney(value) {
  if (state.privacyMode) return "•••••• TL";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function todayISO() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function currentMonthWindowDate(day) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-${String(day).padStart(2, "0")}`;
}

function daysUntil(dateISO) {
  const today = new Date(`${todayISO()}T00:00:00`);
  const target = new Date(`${dateISO}T00:00:00`);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function statusForDate(dateISO) {
  const diff = daysUntil(dateISO);
  if (diff < 0) return { label: "Gecikti", tone: "red" };
  if (diff === 0) return { label: "Bugün", tone: "red" };
  if (diff <= 3) return { label: "Kritik", tone: "amber" };
  if (diff <= 7) return { label: "Yaklaşıyor", tone: "blue" };
  return { label: "Bekliyor", tone: "green" };
}

function statusForWindow(startDay, endDay) {
  const today = new Date();
  const day = today.getDate();
  if (day >= startDay && day <= endDay) return { label: "Ödeme aralığı", tone: "amber" };
  if (day < startDay) return { label: "Bekliyor", tone: "blue" };
  return { label: "Manuel takip", tone: "green" };
}

function calc() {
  const netCash = state.cashAccounts
    .filter((item) => item.includedInCash)
    .reduce((sum, item) => sum + Number(item.balance || 0), 0);

  const totalCardDebt = state.creditCards.reduce((sum, item) => sum + Number(item.totalDebt || 0), 0);

  const totalCardMinimum = state.creditCards.reduce(
    (sum, item) => sum + Number(item.minimumPayment || 0),
    0
  );

  const totalCardAvailableLimit = state.creditCards.reduce(
    (sum, item) => sum + Number(item.availableLimit || 0),
    0
  );

  const totalLoanDebt = state.loans.reduce((sum, item) => sum + Number(item.remainingDebt || 0), 0);

  const totalLoanInstallment = state.loans.reduce(
    (sum, item) => sum + Number(item.monthlyInstallment || 0),
    0
  );

  const totalFixedExpense = state.fixedExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const monthlyMinimumObligation = totalCardMinimum + totalLoanInstallment + totalFixedExpense;
  const monthlyCashGap = netCash - monthlyMinimumObligation;
  const fullClosureNeed = totalCardDebt + totalLoanInstallment + totalFixedExpense;

  return {
    netCash,
    totalCardDebt,
    totalCardMinimum,
    totalCardAvailableLimit,
    totalLoanDebt,
    totalLoanInstallment,
    totalFixedExpense,
    monthlyMinimumObligation,
    monthlyCashGap,
    fullClosureNeed,
    totalLiabilities: totalCardDebt + totalLoanDebt,
  };
}

function bankLogo(bankId) {
  const bank = banks[bankId] || {};
  return `<img class="logo" src="${bank.logo || ""}" alt="${bank.name || "Banka"} logosu">`;
}

function bankName(bankId) {
  return banks[bankId]?.name || "Banka";
}

function pill(label, tone = "") {
  return `<span class="pill ${tone}">${label}</span>`;
}

function moneyCell(value) {
  return `<span class="money">${formatMoney(value)}</span>`;
}

function percent(value, total) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, (Number(value || 0) / Number(total || 0)) * 100));
}

function getPaymentCalendar() {
  const cardPayments = state.creditCards.map((card) => ({
    id: `card-${card.id}`,
    date: card.dueDate,
    title: card.name,
    bank: card.bank,
    type: "Kredi Kartı",
    minimum: card.minimumPayment,
    full: card.totalDebt,
    status: statusForDate(card.dueDate),
    note: card.minimumPayment === null ? "Minimum ödeme girilmedi" : "Minimum ödeme baz alındı",
  }));

  const loanPayments = state.loans.map((loan) => ({
    id: `loan-${loan.id}`,
    date: loan.nextPaymentDate,
    title: loan.name,
    bank: loan.bank,
    type: "Kredi Taksiti",
    minimum: loan.monthlyInstallment,
    full: loan.monthlyInstallment,
    status: statusForDate(loan.nextPaymentDate),
    note: `${loan.remainingInstallments} taksit kaldı`,
  }));

  const fixed = state.fixedExpenses.map((expense) => ({
    id: `fixed-${expense.id}`,
    date: currentMonthWindowDate(expense.windowStartDay),
    title: expense.name,
    bank: "—",
    type: "Sabit Gider",
    minimum: expense.amount,
    full: expense.amount,
    status: statusForWindow(expense.windowStartDay, expense.windowEndDay),
    note: `Her ay ${expense.windowStartDay}-${expense.windowEndDay} arası`,
    windowText: `${expense.windowStartDay}-${expense.windowEndDay}`,
  }));

  return [...cardPayments, ...loanPayments, ...fixed].sort((a, b) => {
    return new Date(`${a.date}T00:00:00`) - new Date(`${b.date}T00:00:00`);
  });
}

function renderLogin() {
  return `
    <main class="login-page">
      <section class="hero">
        <div class="hero-content">
          <div class="brand-mark">SF</div>
          <div class="kicker">Private Finance Command Center</div>
          <h1>Net nakit ayrı. Borç ayrı. Karar tek ekranda.</h1>
          <p>
            Kasa sadece vadesiz hesaplardaki gerçek parayı gösterir.
            Kartlar, krediler, minimum ödemeler ve sabit giderler kendi panellerinde takip edilir.
          </p>
        </div>
        <div class="hero-metrics">
          <div class="mini-card">
            <span>Kasa Mantığı</span>
            <strong>Sadece nakit</strong>
          </div>
          <div class="mini-card">
            <span>Ödeme Dönemi</span>
            <strong>Her ay 1–5</strong>
          </div>
          <div class="mini-card">
            <span>İşlem Tarihi</span>
            <strong>Bugün otomatik</strong>
          </div>
        </div>
      </section>

      <section class="login-card">
        <div class="brand-mark">SF</div>
        <h2>Giriş yap</h2>
        <p>Bu demo yerel çalışır. Veri tarayıcı localStorage içinde saklanır.</p>

        <div class="field">
          <label>Kullanıcı</label>
          <input class="input" value="Suphi Özdede" id="loginName" />
        </div>
        <div class="field">
          <label>Şifre</label>
          <input class="input" type="password" placeholder="Demo için boş bırakabilirsin" />
        </div>

        <button class="primary-btn" onclick="login()">Finans Paneline Gir</button>

        <div class="login-foot">
          <span>Premium koyu panel</span>
          <span>Logo slotları hazır</span>
        </div>
      </section>
    </main>
  `;
}

function login() {
  state.isLoggedIn = true;
  saveState();
  render();
}

function logout() {
  state.isLoggedIn = false;
  saveState();
  render();
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-mark">SF</div>
        <div>
          <h1>Suphi Finance</h1>
          <span>Bugün: ${formatDate(todayISO())} · geçmiş tarih manuel seçilir</span>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="secondary-btn" onclick="openTransactionModal()">+ İşlem Ekle</button>
        <button class="icon-btn" title="Gizlilik modu" onclick="togglePrivacy()">${state.privacyMode ? "👁" : "◉"}</button>
        <button class="icon-btn" title="Demo veriyi sıfırla" onclick="resetState()">↺</button>
        <button class="icon-btn" title="Çıkış" onclick="logout()">⌁</button>
      </div>
    </header>
  `;
}

function togglePrivacy() {
  state.privacyMode = !state.privacyMode;
  saveState();
  render();
}

function renderSummary() {
  const c = calc();
  const gapTone = c.monthlyCashGap >= 0 ? "green" : "red";

  return `
    <section class="grid summary-grid">
      <article class="card pad">
        <div class="card-head">
          <div>
            <p class="card-title">Kasa / Net Nakit</p>
            <h2 class="amount">${formatMoney(c.netCash)}</h2>
            <p class="help">Sadece vadesiz hesaplar. Kart limitleri ve borçlar kasaya dahil edilmez.</p>
          </div>
          ${pill("Nakit", "green")}
        </div>
      </article>

      <article class="card pad">
        <div class="card-head">
          <div>
            <p class="card-title">Bu Ay Minimum Ödeme</p>
            <h2 class="amount mid">${formatMoney(c.monthlyMinimumObligation)}</h2>
            <p class="help">Kart minimumları + kredi taksitleri + sabit giderler.</p>
          </div>
          ${pill("Zorunlu", "amber")}
        </div>
      </article>

      <article class="card pad">
        <div class="card-head">
          <div>
            <p class="card-title">Kasa Farkı</p>
            <h2 class="amount mid">${formatMoney(c.monthlyCashGap)}</h2>
            <p class="help">${c.monthlyCashGap >= 0 ? "Minimum ödeme için kasa yeterli görünüyor." : "Minimum ödeme için ek nakit gerekiyor."}</p>
          </div>
          ${pill(c.monthlyCashGap >= 0 ? "Yeterli" : "Açık", gapTone)}
        </div>
      </article>

      <article class="card pad">
        <div class="card-head">
          <div>
            <p class="card-title">Toplam Yükümlülük</p>
            <h2 class="amount mid">${formatMoney(c.totalLiabilities)}</h2>
            <p class="help">Kart toplam borcu + kredi kalan borçları. Kasa değerini değiştirmez.</p>
          </div>
          ${pill("Ayrı panel", "violet")}
        </div>
      </article>
    </section>
  `;
}

function renderNotices() {
  const c = calc();
  const calendar = getPaymentCalendar();
  const urgent = calendar.filter((item) => {
    if (item.type === "Sabit Gider") {
      const d = new Date().getDate();
      return d >= 1 && d <= 5;
    }
    const diff = daysUntil(item.date);
    return diff >= 0 && diff <= 7;
  });

  return `
    <article class="card pad">
      <div class="card-head">
        <div>
          <p class="card-title">Akıllı Hatırlatmalar</p>
          <h2 class="amount mid">1–5 Sabit Gider Dönemi</h2>
          <p class="help">Her ayın 1–5 arası sabit giderler kontrol edilir. Tutarları sonradan güncelleyebilirsin.</p>
        </div>
        ${pill(`${urgent.length} aktif`, urgent.length ? "amber" : "green")}
      </div>

      <div class="notice-list">
        <div class="notice">
          <strong>Minimum ödeme baskısı</strong>
          <span>Bu ay minimum bazda toplam ödeme: ${formatMoney(c.monthlyMinimumObligation)}. Sabit giderler fiyat girildikçe bu hesaba eklenir.</span>
        </div>
        ${
          urgent.length
            ? urgent.slice(0, 5).map((item) => `
              <div class="notice">
                <strong>${item.title}</strong>
                <span>${item.type} · ${item.windowText ? `Her ay ${item.windowText} arası` : formatDate(item.date)} · ${item.minimum == null ? "Minimum ödeme girilmedi" : formatMoney(item.minimum)}</span>
              </div>
            `).join("")
            : `<div class="notice"><strong>Yakın ödeme yok</strong><span>7 gün içinde kritik ödeme görünmüyor.</span></div>`
        }
      </div>
    </article>
  `;
}

function sectionTabs() {
  const tabs = [
    ["calendar", "Ödeme Takvimi"],
    ["cash", "Vadesiz Hesaplar"],
    ["cards", "Kredi Kartları"],
    ["loans", "Krediler"],
    ["fixed", "Sabit Giderler"],
    ["transactions", "İşlemler"],
  ];

  return `
    <div class="tabs">
      ${tabs.map(([id, label]) => `
        <button class="segment-btn ${state.activeSection === id ? "active" : ""}" onclick="setSection('${id}')">${label}</button>
      `).join("")}
    </div>
  `;
}

function setSection(id) {
  state.activeSection = id;
  saveState();
  render();
}

function renderSection() {
  const titleMap = {
    calendar: "Ödeme Takvimi",
    cash: "Vadesiz Hesaplar",
    cards: "Kredi Kartları",
    loans: "Krediler",
    fixed: "Sabit Giderler",
    transactions: "İşlem Geçmişi",
  };

  return `
    <section class="card">
      <div class="card pad" style="border:0; border-radius:0; box-shadow:none; background:transparent;">
        <div class="card-head" style="margin-bottom:0;">
          <div>
            <p class="card-title">${titleMap[state.activeSection]}</p>
            <h2 class="amount mid">${sectionSubtitle()}</h2>
          </div>
          ${sectionTabs()}
        </div>
      </div>
      ${renderActiveTable()}
    </section>
  `;
}

function sectionSubtitle() {
  const c = calc();
  const map = {
    calendar: "Tarih sıralı tek tek ödeme listesi",
    cash: formatMoney(c.netCash),
    cards: `${formatMoney(c.totalCardDebt)} toplam borç`,
    loans: `${formatMoney(c.totalLoanDebt)} kalan borç`,
    fixed: `${formatMoney(c.totalFixedExpense)} aylık sabit gider`,
    transactions: `${state.transactions.length} kayıt`,
  };
  return map[state.activeSection] || "";
}

function renderActiveTable() {
  switch (state.activeSection) {
    case "calendar": return renderCalendarTable();
    case "cash": return renderCashTable();
    case "cards": return renderCardsTable();
    case "loans": return renderLoansTable();
    case "fixed": return renderFixedTable();
    case "transactions": return renderTransactionsTable();
    default: return "";
  }
}

function renderCalendarTable() {
  const rows = getPaymentCalendar();

  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Ödeme</th>
            <th>Banka</th>
            <th>Tür</th>
            <th>Minimum / Tutar</th>
            <th>Tam Borç</th>
            <th>Durum</th>
            <th>Not</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((item) => `
            <tr>
              <td>${item.windowText ? `Her ay ${item.windowText}` : formatDate(item.date)}</td>
              <td><strong>${item.title}</strong></td>
              <td>${item.bank === "—" ? "—" : `<span class="row-title">${bankLogo(item.bank)} ${bankName(item.bank)}</span>`}</td>
              <td>${item.type}</td>
              <td>${item.minimum == null ? pill("Girilmedi", "red") : moneyCell(item.minimum)}</td>
              <td>${moneyCell(item.full)}</td>
              <td>${pill(item.status.label, item.status.tone)}</td>
              <td>${item.note}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCashTable() {
  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Banka / Hesap</th>
            <th>Tür</th>
            <th>Kullanılabilir Bakiye</th>
            <th>Kasaya Dahil</th>
          </tr>
        </thead>
        <tbody>
          ${state.cashAccounts.map((item) => `
            <tr>
              <td><span class="row-title">${bankLogo(item.bank)} <strong>${bankName(item.bank)}</strong> · ${item.name}</span></td>
              <td>${item.type}</td>
              <td>${moneyCell(item.balance)}</td>
              <td>${pill(item.includedInCash ? "Evet" : "Hayır", item.includedInCash ? "green" : "red")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCardsTable() {
  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Kart</th>
            <th>Limit</th>
            <th>Kullanılabilir Limit</th>
            <th>Toplam Borç</th>
            <th>Minimum Ödeme</th>
            <th>Son Ödeme</th>
            <th>Kullanım</th>
          </tr>
        </thead>
        <tbody>
          ${state.creditCards.map((item) => {
            const used = Math.max(0, Number(item.limit || 0) - Number(item.availableLimit || 0));
            const ratio = percent(used, item.limit);
            return `
              <tr>
                <td>
                  <span class="row-title">
                    ${bankLogo(item.bank)}
                    <span><strong>${item.name}</strong><br><span style="color:var(--muted)">${bankName(item.bank)} · **** ${item.last4}</span></span>
                    <img class="network" src="${networks[item.network] || ""}" alt="${item.network}">
                  </span>
                </td>
                <td>${moneyCell(item.limit)}</td>
                <td>${moneyCell(item.availableLimit)}</td>
                <td>${moneyCell(item.totalDebt)}</td>
                <td>${item.minimumPayment == null ? pill("Girilmedi", "red") : moneyCell(item.minimumPayment)}</td>
                <td>${formatDate(item.dueDate)}</td>
                <td><div class="progress"><span style="width:${ratio}%"></span></div><span style="color:var(--muted); font-size:12px;">%${Math.round(ratio)}</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderLoansTable() {
  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Kredi</th>
            <th>Kalan Borç</th>
            <th>Taksit</th>
            <th>Kalan Taksit</th>
            <th>Sonraki Ödeme</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          ${state.loans.map((item) => {
            const s = statusForDate(item.nextPaymentDate);
            return `
              <tr>
                <td><span class="row-title">${bankLogo(item.bank)} <strong>${bankName(item.bank)}</strong> · ${item.name}</span></td>
                <td>${moneyCell(item.remainingDebt)}</td>
                <td>${moneyCell(item.monthlyInstallment)}</td>
                <td>${item.remainingInstallments}</td>
                <td>${formatDate(item.nextPaymentDate)}</td>
                <td>${pill(s.label, s.tone)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderFixedTable() {
  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Gider</th>
            <th>Kategori</th>
            <th>Tutar</th>
            <th>Ödeme Aralığı</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          ${state.fixedExpenses.map((item) => {
            const s = statusForWindow(item.windowStartDay, item.windowEndDay);
            return `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td>
                  <input class="input" style="max-width:150px; padding:9px;" type="number" min="0" step="0.01" value="${item.amount}" onchange="updateFixedAmount('${item.id}', this.value)" />
                </td>
                <td>Her ay ${item.windowStartDay}-${item.windowEndDay}</td>
                <td>${pill(item.status === "paid" ? "Ödendi" : s.label, item.status === "paid" ? "green" : s.tone)}</td>
                <td>
                  <button class="secondary-btn" onclick="markFixedPaid('${item.id}')">Ödendi</button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function updateFixedAmount(id, value) {
  const expense = state.fixedExpenses.find((item) => item.id === id);
  if (!expense) return;
  expense.amount = Number(value || 0);
  saveState();
  render();
}

function markFixedPaid(id) {
  const expense = state.fixedExpenses.find((item) => item.id === id);
  if (!expense) return;
  expense.status = "paid";
  state.transactions.unshift({
    id: crypto.randomUUID(),
    date: todayISO(),
    type: "Sabit gider ödendi",
    title: expense.name,
    amount: expense.amount,
    note: "Manuel ödendi işaretlendi",
  });
  saveState();
  render();
}

function renderTransactionsTable() {
  if (!state.transactions.length) {
    return `<div class="empty">Henüz işlem yok. Yeni işlem eklediğinde tarih otomatik bugünün tarihi gelir.</div>`;
  }

  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>İşlem</th>
            <th>Tutar</th>
            <th>Not</th>
          </tr>
        </thead>
        <tbody>
          ${state.transactions.map((item) => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td><strong>${item.type}</strong><br><span style="color:var(--muted)">${item.title || ""}</span></td>
              <td>${moneyCell(item.amount)}</td>
              <td>${item.note || "—"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function openTransactionModal() {
  const root = document.querySelector("#app");
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.id = "transactionModal";
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-head">
        <div>
          <h2>İşlem Ekle</h2>
          <p>Tarih otomatik bugün gelir. Geçmiş işlem girmek istersen manuel değiştir.</p>
        </div>
        <button class="icon-btn" onclick="closeTransactionModal()">×</button>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>İşlem Türü</label>
          <select class="select" id="txType" onchange="refreshTransactionTargets()">
            <option value="cash_expense">Banka kartı / nakit harcama</option>
            <option value="credit_card_expense">Kredi kartı harcaması</option>
            <option value="credit_card_payment">Kredi kartı ödemesi</option>
            <option value="loan_payment">Kredi taksiti ödemesi</option>
            <option value="income">Gelir girişi</option>
            <option value="fixed_expense_payment">Sabit gider ödemesi</option>
          </select>
        </div>

        <div class="field">
          <label>Tarih</label>
          <input class="input" id="txDate" type="date" value="${todayISO()}" />
        </div>

        <div class="field">
          <label>Tutar</label>
          <input class="input" id="txAmount" type="number" min="0" step="0.01" placeholder="0,00" />
        </div>

        <div class="field">
          <label>Kaynak Hesap</label>
          <select class="select" id="txCashAccount">
            ${state.cashAccounts.map((item) => `<option value="${item.id}">${bankName(item.bank)} · ${item.name}</option>`).join("")}
          </select>
        </div>

        <div class="field full" id="txTargetWrap"></div>

        <div class="field full">
          <label>Açıklama</label>
          <input class="input" id="txNote" placeholder="Örn: Market, kart ödemesi, kira..." />
        </div>
      </div>

      <div class="modal-actions">
        <button class="secondary-btn" onclick="closeTransactionModal()">Vazgeç</button>
        <button class="primary-btn" style="width:auto;" onclick="submitTransaction()">Kaydet</button>
      </div>
    </div>
  `;
  root.appendChild(modal);
  refreshTransactionTargets();
}

function closeTransactionModal() {
  document.querySelector("#transactionModal")?.remove();
}

function refreshTransactionTargets() {
  const type = document.querySelector("#txType")?.value;
  const wrap = document.querySelector("#txTargetWrap");
  if (!wrap) return;

  if (type === "credit_card_expense" || type === "credit_card_payment") {
    wrap.innerHTML = `
      <label>Kredi Kartı</label>
      <select class="select" id="txTarget">
        ${state.creditCards.map((item) => `<option value="${item.id}">${bankName(item.bank)} · ${item.name}</option>`).join("")}
      </select>
    `;
  } else if (type === "loan_payment") {
    wrap.innerHTML = `
      <label>Kredi</label>
      <select class="select" id="txTarget">
        ${state.loans.map((item) => `<option value="${item.id}">${bankName(item.bank)} · ${item.name}</option>`).join("")}
      </select>
    `;
  } else if (type === "fixed_expense_payment") {
    wrap.innerHTML = `
      <label>Sabit Gider</label>
      <select class="select" id="txTarget">
        ${state.fixedExpenses.map((item) => `<option value="${item.id}">${item.name}</option>`).join("")}
      </select>
    `;
  } else {
    wrap.innerHTML = `
      <label>Kasa Etkisi</label>
      <input class="input" value="${type === "income" ? "Kasa artar" : "Kasa azalır"}" disabled />
    `;
  }
}

function submitTransaction() {
  const type = document.querySelector("#txType").value;
  const date = document.querySelector("#txDate").value || todayISO();
  const amount = Number(document.querySelector("#txAmount").value || 0);
  const note = document.querySelector("#txNote").value || "";
  const cashAccountId = document.querySelector("#txCashAccount").value;
  const targetId = document.querySelector("#txTarget")?.value;

  if (!amount || amount <= 0) {
    alert("Lütfen geçerli bir tutar gir.");
    return;
  }

  const cash = state.cashAccounts.find((item) => item.id === cashAccountId);
  let title = note || "İşlem";
  let typeLabel = "";

  if (type === "cash_expense") {
    if (cash) cash.balance -= amount;
    typeLabel = "Banka kartı / nakit harcama";
    title = note || "Nakit harcama";
  }

  if (type === "income") {
    if (cash) cash.balance += amount;
    typeLabel = "Gelir girişi";
    title = note || "Gelir";
  }

  if (type === "credit_card_expense") {
    const card = state.creditCards.find((item) => item.id === targetId);
    if (card) {
      card.totalDebt += amount;
      card.availableLimit = Math.max(0, Number(card.availableLimit || 0) - amount);
      title = `${card.name} harcaması`;
    }
    typeLabel = "Kredi kartı harcaması";
  }

  if (type === "credit_card_payment") {
    const card = state.creditCards.find((item) => item.id === targetId);
    if (cash) cash.balance -= amount;
    if (card) {
      card.totalDebt = Math.max(0, Number(card.totalDebt || 0) - amount);
      card.availableLimit = Math.min(Number(card.limit || 0), Number(card.availableLimit || 0) + amount);
      if (card.minimumPayment != null) {
        card.minimumPayment = Math.max(0, Number(card.minimumPayment || 0) - amount);
      }
      title = `${card.name} ödemesi`;
    }
    typeLabel = "Kredi kartı ödemesi";
  }

  if (type === "loan_payment") {
    const loan = state.loans.find((item) => item.id === targetId);
    if (cash) cash.balance -= amount;
    if (loan) {
      loan.remainingDebt = Math.max(0, Number(loan.remainingDebt || 0) - amount);
      if (amount >= Number(loan.monthlyInstallment || 0) && loan.remainingInstallments > 0) {
        loan.remainingInstallments -= 1;
      }
      title = `${loan.name} ödemesi`;
    }
    typeLabel = "Kredi taksiti ödemesi";
  }

  if (type === "fixed_expense_payment") {
    const fixed = state.fixedExpenses.find((item) => item.id === targetId);
    if (cash) cash.balance -= amount;
    if (fixed) {
      fixed.status = "paid";
      fixed.amount = amount;
      title = `${fixed.name} ödemesi`;
    }
    typeLabel = "Sabit gider ödemesi";
  }

  state.transactions.unshift({
    id: crypto.randomUUID(),
    date,
    type: typeLabel,
    title,
    amount,
    note,
  });

  saveState();
  closeTransactionModal();
  render();
}

function renderDashboard() {
  return `
    <main class="dashboard">
      ${renderTopbar()}
      ${renderSummary()}
      <section class="split">
        ${renderSection()}
        ${renderNotices()}
      </section>
    </main>
  `;
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = `<div class="app-shell">${state.isLoggedIn ? renderDashboard() : renderLogin()}</div>`;
}

render();
