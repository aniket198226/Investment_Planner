// ===== CATEGORY RULES =====
// Strings → substring match. RegExp → regex test. Categories checked in order.
const CATEGORY_RULES = {
  income: [
    'salary', 'sal/', 'sal ', 'payroll', 'neft cr', 'imps cr', 'credit interest',
    'interest credit', 'dividend', 'cashback', 'reward', 'freelance', 'consulting',
    'invoice', 'payment received', 'rent received', 'rental income', 'commission',
    'bonus', 'arrear',
  ],
  emi: [
    /\bemi\b/i,          // word-boundary: prevents "premi-um" and "muscl-emi-nd" false hits
    'loan repayment', 'home loan', 'car loan', 'auto loan',
    'personal loan', 'education loan', 'mortgage', 'equated monthly',
  ],
  investment: [
    'mutual fund', /\bmf\b/i, 'sip', 'nps', 'ppf', 'elss',
    /\bfd\b/i, 'fixed deposit',
    /\brd\b/i, 'recurring deposit',   // word-boundary: prevents "stan-d-ard c" false hits
    'stocks', 'shares', 'demat', 'zerodha', 'groww',
    'upstox', 'kuvera', 'coin', 'lic', 'insurance premium', 'ulip', 'gold bond',
    /\bsgb\b/i, /\betf\b/i, 'nifty', 'sensex',
    'eba/mfp',       // ICICI Direct mutual fund purchases (EBA Electronic Bank Account)
    'icici prud',    // ICICI Prudential insurance premium
    'ebixcash',      // LIC / insurance platform used by ICICI & others
    'coindcx',       // Crypto exchange alternate spelling
    'wazirx', 'coinswitch', 'angelone', 'angel broking', 'hdfc sec',
  ],
  expense: [
    'grocery', 'groceries', 'supermarket', 'bigbasket', 'blinkit', 'swiggy',
    'zomato', 'uber', 'ola', 'rapido', 'metro', 'irctc', 'airline', 'flight',
    'hotel', 'restaurant', 'food', 'electricity', 'water bill', 'gas bill',
    'internet', 'broadband', 'mobile recharge', 'dth', 'subscription', 'netflix',
    'amazon prime', 'spotify', 'hotstar', 'school fee', 'college fee', 'tuition',
    'medical', 'hospital', 'pharmacy', 'doctor', 'petrol', 'diesel', 'fuel',
    'cash withdrawal', 'shopping', 'amazon', 'flipkart', 'myntra', 'reliance',
    'dmart', 'maintenance', 'society', 'rent paid', 'house rent', 'pg rent',
    'credit card', 'cc bill', 'card payment',
    // Additional patterns from real bank statement analysis
    'cash wdl',       // ICICI ATM / NFS / CAM / VAT cash withdrawal format
    'atm/', 'cam/',   // ATM and Cash-at-branch prefixes
    'dtax',           // Direct Tax / Income Tax payment via GIB
    'airindia', 'air india', 'indigo', 'spicejet', 'vistara', 'goair',
    'makemytrip', 'cleartrip', 'staymaster', 'oyo',
    'airbnb',         // Airbnb VIN card debit
    'unicef', 'donation',
    'cred',           // CRED app credit card bill payment
    'jiomart', 'zepto', 'dunzo', 'instamart', 'bbnow',
    'pinelabs',       // Pine Labs POS terminal
    'paytm',          // Paytm merchant payments (VIN prefix)
  ],
};

// ===== COLUMN ALIASES =====
// Covers HDFC, SBI, ICICI, Axis, Kotak, Yes Bank, PNB, BOB, Canara, Paytm, Fi, Jupiter, etc.
const COL_MAP = {
  date: [
    'date', 'txn date', 'tran date', 'trans date', 'transaction date',
    'value date', 'value dt', 'posting date', 'book date', 'entry date',
    'transaction dt', 'cheque date',
  ],
  description: [
    'description', 'narration', 'particulars', 'remarks', 'details',
    'transaction details', 'txn remarks', 'transaction remarks', 'trans details',
    'transaction narration', 'chq/ref', 'reference', 'merchant', 'note',
    'beneficiary', 'transaction particulars', 'utr', 'payment details',
  ],
  debit: [
    'debit', 'withdrawal', 'withdrawl', 'debit amount', 'withdrawal amount',
    'amount (dr)', 'withdrawal amt', 'debit amt', 'withdrawal (dr)',
    'dr amount', 'debit (inr)', 'withdrawal (inr)', 'paid out', 'money out',
    'dr', 'debits', 'withdrawals',
  ],
  credit: [
    'credit', 'deposit', 'credit amount', 'deposit amount',
    'amount (cr)', 'deposit amt', 'credit amt', 'deposit (cr)',
    'cr amount', 'credit (inr)', 'deposit (inr)', 'paid in', 'money in',
    'cr', 'credits', 'deposits',
  ],
  balance: [
    'balance', 'closing balance', 'running balance', 'avail bal', 'available balance',
    'balance amt', 'closing bal', 'balance (inr)', 'ledger balance', 'bal',
  ],
  // Single-column amount fallback
  amount: [
    'amount', 'transaction amount', 'txn amount', 'trans amount', 'net amount',
    'tran amount',
  ],
  // Dr/Cr type indicator (paired with single amount column)
  drcr: [
    'type', 'dr/cr', 'cr/dr', 'debit/credit', 'txn type', 'transaction type',
    'd/c', 'indicator', 'dr cr', 'crdr',
  ],
};

// ===== ASSET CLASSES — full Indian investment universe =====
// Returns are illustrative long-run assumptions; all are editable by the user.
const ASSET_CLASSES = [
  // Direct Equity
  { key: 'eq_large',       label: 'Large Cap Stocks',           category: 'Direct Equity',          defaultReturn: 12,   risk: 'High'      },
  { key: 'eq_mid',         label: 'Mid Cap Stocks',             category: 'Direct Equity',          defaultReturn: 16,   risk: 'High'      },
  { key: 'eq_small',       label: 'Small Cap Stocks',           category: 'Direct Equity',          defaultReturn: 20,   risk: 'Very High' },
  { key: 'eq_micro',       label: 'Micro Cap Stocks',           category: 'Direct Equity',          defaultReturn: 24,   risk: 'Very High' },
  // Equity Mutual Funds
  { key: 'mf_large',       label: 'Large Cap Fund',             category: 'Equity Mutual Funds',    defaultReturn: 11,   risk: 'High'      },
  { key: 'mf_mid',         label: 'Mid Cap Fund',               category: 'Equity Mutual Funds',    defaultReturn: 15,   risk: 'High'      },
  { key: 'mf_small',       label: 'Small Cap Fund',             category: 'Equity Mutual Funds',    defaultReturn: 18,   risk: 'Very High' },
  { key: 'mf_flexi',       label: 'Flexi Cap / Multi Cap',      category: 'Equity Mutual Funds',    defaultReturn: 13,   risk: 'High'      },
  { key: 'mf_largmid',     label: 'Large & Mid Cap Fund',       category: 'Equity Mutual Funds',    defaultReturn: 13,   risk: 'High'      },
  { key: 'mf_elss',        label: 'ELSS (Tax Saving)',          category: 'Equity Mutual Funds',    defaultReturn: 13,   risk: 'High'      },
  { key: 'mf_index',       label: 'Index Fund (Nifty 50)',      category: 'Equity Mutual Funds',    defaultReturn: 12,   risk: 'High'      },
  { key: 'mf_intl',        label: 'International / Global',     category: 'Equity Mutual Funds',    defaultReturn: 11,   risk: 'High'      },
  { key: 'mf_sectoral',    label: 'Sectoral / Thematic',        category: 'Equity Mutual Funds',    defaultReturn: 14,   risk: 'Very High' },
  // Debt / Guaranteed
  { key: 'debt_ppf',       label: 'PPF',                        category: 'Debt / Guaranteed',      defaultReturn: 7.1,  risk: 'Very Low'  },
  { key: 'debt_pf',        label: 'EPF / PF',                   category: 'Debt / Guaranteed',      defaultReturn: 8.1,  risk: 'Very Low'  },
  { key: 'debt_nps_eq',    label: 'NPS — Equity (Tier I)',      category: 'Debt / Guaranteed',      defaultReturn: 11,   risk: 'Medium'    },
  { key: 'debt_nps_d',     label: 'NPS — Debt (Tier I)',        category: 'Debt / Guaranteed',      defaultReturn: 8.5,  risk: 'Low'       },
  { key: 'debt_ssy',       label: 'Sukanya Samriddhi Yojana',   category: 'Debt / Guaranteed',      defaultReturn: 8.2,  risk: 'Very Low'  },
  { key: 'debt_scss',      label: 'Senior Citizen Savings',     category: 'Debt / Guaranteed',      defaultReturn: 8.2,  risk: 'Very Low'  },
  { key: 'debt_rbi',       label: 'RBI Floating Rate Bonds',    category: 'Debt / Guaranteed',      defaultReturn: 8.05, risk: 'Very Low'  },
  { key: 'debt_potd',      label: 'Post Office Time Deposit',   category: 'Debt / Guaranteed',      defaultReturn: 7.5,  risk: 'Very Low'  },
  { key: 'fd_bank',        label: 'Bank Fixed Deposit',         category: 'Debt / Guaranteed',      defaultReturn: 7,    risk: 'Very Low'  },
  { key: 'fd_corp',        label: 'Corporate Fixed Deposit',    category: 'Debt / Guaranteed',      defaultReturn: 8,    risk: 'Low'       },
  { key: 'debt_gsec',      label: 'Government Securities',      category: 'Debt / Guaranteed',      defaultReturn: 7.3,  risk: 'Very Low'  },
  // Debt Mutual Funds
  { key: 'dmf_liquid',     label: 'Liquid Fund',                category: 'Debt Mutual Funds',      defaultReturn: 6.8,  risk: 'Very Low'  },
  { key: 'dmf_ultrashort', label: 'Ultra Short Duration',       category: 'Debt Mutual Funds',      defaultReturn: 7.2,  risk: 'Very Low'  },
  { key: 'dmf_short',      label: 'Short Duration Fund',        category: 'Debt Mutual Funds',      defaultReturn: 7.5,  risk: 'Low'       },
  { key: 'dmf_corp',       label: 'Corporate Bond Fund',        category: 'Debt Mutual Funds',      defaultReturn: 8,    risk: 'Low'       },
  { key: 'dmf_bpsu',       label: 'Banking & PSU Fund',         category: 'Debt Mutual Funds',      defaultReturn: 7.8,  risk: 'Low'       },
  { key: 'dmf_gilt',       label: 'Gilt Fund',                  category: 'Debt Mutual Funds',      defaultReturn: 8,    risk: 'Low'       },
  { key: 'dmf_credit',     label: 'Credit Risk Fund',           category: 'Debt Mutual Funds',      defaultReturn: 9,    risk: 'Medium'    },
  { key: 'dmf_long',       label: 'Long Duration Fund',         category: 'Debt Mutual Funds',      defaultReturn: 8.5,  risk: 'Low'       },
  // Real Estate
  { key: 're_resi',        label: 'Residential Property',       category: 'Real Estate',            defaultReturn: 9,    risk: 'Medium'    },
  { key: 're_comm',        label: 'Commercial Property',        category: 'Real Estate',            defaultReturn: 10,   risk: 'Medium'    },
  { key: 're_reit',        label: 'REITs',                      category: 'Real Estate',            defaultReturn: 9,    risk: 'Medium'    },
  { key: 're_invit',       label: 'InvITs',                     category: 'Real Estate',            defaultReturn: 9.5,  risk: 'Medium'    },
  // Gold & Precious Metals
  { key: 'gold_sgb',       label: 'Sovereign Gold Bond (SGB)',  category: 'Gold & Precious Metals', defaultReturn: 10,   risk: 'Medium'    },
  { key: 'gold_etf',       label: 'Gold ETF',                   category: 'Gold & Precious Metals', defaultReturn: 9.5,  risk: 'Medium'    },
  { key: 'gold_phys',      label: 'Physical Gold',              category: 'Gold & Precious Metals', defaultReturn: 9,    risk: 'Medium'    },
  { key: 'silver',         label: 'Silver ETF / Physical',      category: 'Gold & Precious Metals', defaultReturn: 11,   risk: 'Medium'    },
  // Crypto
  { key: 'crypto_btc',     label: 'Bitcoin (BTC)',              category: 'Crypto',                 defaultReturn: 20,   risk: 'Extreme'   },
  { key: 'crypto_eth',     label: 'Ethereum (ETH)',             category: 'Crypto',                 defaultReturn: 22,   risk: 'Extreme'   },
  { key: 'crypto_top10',   label: 'Top 10 Altcoins',            category: 'Crypto',                 defaultReturn: 18,   risk: 'Extreme'   },
  { key: 'crypto_others',  label: 'Other Altcoins',             category: 'Crypto',                 defaultReturn: 15,   risk: 'Extreme'   },
  // Alternatives
  { key: 'alt_p2p',        label: 'P2P Lending',                category: 'Alternatives',           defaultReturn: 11,   risk: 'High'      },
  { key: 'alt_ulip',       label: 'ULIP (after charges)',        category: 'Alternatives',           defaultReturn: 9,    risk: 'Medium'    },
  { key: 'alt_pms',        label: 'PMS / AIF',                  category: 'Alternatives',           defaultReturn: 14,   risk: 'High'      },
  { key: 'alt_angel',      label: 'Angel / Startup Investing',  category: 'Alternatives',           defaultReturn: 20,   risk: 'Extreme'   },
  { key: 'alt_preipo',     label: 'Unlisted / Pre-IPO Shares',  category: 'Alternatives',           defaultReturn: 18,   risk: 'Very High' },
];

// ===== STATE =====
let pieChart = null;
let bankData  = null; // populated from bank statement analysis, consumed by planner

// Asset classes the user has opted into — starts empty, user selects via checkbox panel
const DEFAULT_SELECTED_KEYS = new Set([
  'mf_large', 'mf_mid', 'mf_flexi', 'debt_pf', 'debt_ppf', 'gold_sgb', 'fd_bank',
]);
let selectedAssetKeys = new Set();

// ===== AUTH STATE =====
const GOOGLE_CLIENT_ID = '316752082804-ip1no3g1ikg7ihvkfhavhkotl8s006qd.apps.googleusercontent.com';

let currentUser    = null;
let authToken      = null;
let pendingPlan    = null; // plan loaded at login, applied when planner opens
let allPlans       = [];   // all saved plans for the logged-in user
let currentPlanId  = null; // ID of the currently loaded plan
let currentPlanName = null;

// Restore session from localStorage on page load
(function restoreSession() {
  try {
    const raw = localStorage.getItem('corpusplan_auth');
    if (!raw) return;
    const { token, user } = JSON.parse(raw);
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) { localStorage.removeItem('corpusplan_auth'); return; }
    authToken   = token;
    currentUser = user;
    fetchAllPlans().then(plans => {
      allPlans = plans;
      if (plans.length) pendingPlan = plans[0].data;
      renderMyPlans();
    });
  } catch { localStorage.removeItem('corpusplan_auth'); }
})();

// ===== AUTH FUNCTIONS =====
async function handleGoogleCredential(response) {
  try {
    const res  = await fetch('/api/auth', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ idToken: response.credential }),
    });
    const data = await res.json();
    if (!data.token) throw new Error(data.error || 'Login failed');

    authToken   = data.token;
    currentUser = data.user;
    localStorage.setItem('corpusplan_auth', JSON.stringify({ token: data.token, user: data.user }));
    renderAuthNav();

    allPlans = await fetchAllPlans();
    if (allPlans.length) pendingPlan = allPlans[0].data;
    renderMyPlans();

    const first = currentUser.name.split(' ')[0];
    showPlannerToast(
      allPlans.length
        ? `Welcome back, ${first}! Your saved plans are ready.`
        : `Welcome, ${first}! Sign-in successful.`,
      'success'
    );
  } catch (err) {
    console.error('Login error:', err);
    showPlannerToast('Sign-in failed. Please try again.');
  }
}

function signOut() {
  authToken       = null;
  currentUser     = null;
  pendingPlan     = null;
  allPlans        = [];
  currentPlanId   = null;
  currentPlanName = null;
  bankData        = null;
  clearDashboardAccess();
  localStorage.removeItem('corpusplan_auth');
  if (typeof google !== 'undefined') google.accounts.id.disableAutoSelect();

  // Reset planner state
  selectedAssetKeys = new Set();
  resetPlannerInputs();

  // Reset goals state
  goals = [];
  localStorage.removeItem('corpusplan_goals');
  const surplusEl = document.getElementById('goals-surplus');
  if (surplusEl) surplusEl.value = '';
  renderGoalCategoryGrid();
  renderGoalsList();
  document.getElementById('goals-results')?.classList.add('hidden');

  // Navigate back to home screen
  document.getElementById('planner-screen').classList.add('hidden');
  document.getElementById('dashboard-screen').classList.add('hidden');
  document.getElementById('goals-screen')?.classList.add('hidden');
  document.getElementById('upload-screen').classList.remove('hidden');

  renderAuthNav();
  renderMyPlans();
  showPlannerToast('Signed out successfully.', 'success');
}

function resetPlannerInputs() {
  const ids = [
    'p-annual-income','p-annual-expenses','p-annual-emi','p-emi-years',
    'p-current-age','p-retirement-age','p-life-expectancy',
    'p-income-growth','p-inflation','p-invest-pct',
  ];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('projection-output')?.classList.add('hidden');
  // Re-render selector and table to show empty state
  if (document.getElementById('asset-selector-panel')) {
    renderAssetSelector();
    renderCorpusTable();
  }
}

function renderAuthNav() {
  const area = document.getElementById('auth-nav-area');
  if (!area) return;
  if (currentUser) {
    area.innerHTML = `
      <div class="auth-user-chip">
        <img src="${currentUser.picture}" class="auth-avatar" alt="${currentUser.name}">
        <span class="auth-name">${currentUser.name.split(' ')[0]}</span>
        <button class="auth-signout" onclick="signOut()">Sign out</button>
      </div>`;
  } else {
    area.innerHTML = '<div id="google-signin-btn"></div>';
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'filled_black', size: 'medium', text: 'signin_with', shape: 'rectangular' }
      );
    }
  }
}

function initGoogleAuth() {
  if (typeof google === 'undefined' || !google.accounts) return;
  google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
  renderAuthNav();
}

// ===== PLAN SAVE / LOAD =====
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function fetchAllPlans() {
  if (!authToken) return [];
  try {
    const res = await fetch('/api/plans', { headers: { Authorization: `Bearer ${authToken}` } });
    const { plans } = await res.json();
    return plans || [];
  } catch { return []; }
}

async function savePlanWithName(name, planId) {
  if (!authToken) return;
  try {
    const data = collectPlanData();
    const res = await fetch('/api/plans', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body:    JSON.stringify({ data, name, planId }),
    });
    const result = await res.json();
    currentPlanId   = result.planId;
    currentPlanName = name;
    allPlans = await fetchAllPlans();
    renderMyPlans();
    showPlannerToast(`Plan "${name}" saved.`, 'success');
  } catch { showPlannerToast('Could not save plan — please try again.'); }
}

function openSavePlanDialog() {
  if (!authToken) { showPlannerToast('Please sign in to save your plan.'); return; }
  const modal = document.getElementById('save-plan-modal');
  const input = document.getElementById('save-plan-name-input');
  if (input) input.value = currentPlanName || '';
  modal?.classList.remove('hidden');
  setTimeout(() => input?.focus(), 50);
}

function closeSavePlanDialog() {
  document.getElementById('save-plan-modal')?.classList.add('hidden');
}

async function confirmSavePlan() {
  const input = document.getElementById('save-plan-name-input');
  const name  = input?.value.trim();
  if (!name) { input?.focus(); showPlannerToast('Please enter a plan name.'); return; }
  // If same name as current loaded plan, update it; otherwise create new
  const matchingPlan = allPlans.find(p => p.name === name);
  const planId = matchingPlan ? matchingPlan._id : (currentPlanName === name ? currentPlanId : null);
  closeSavePlanDialog();
  await savePlanWithName(name, planId || null);
}

async function deleteSavedPlan(planId) {
  if (!confirm('Delete this plan? This cannot be undone.')) return;
  try {
    await fetch(`/api/plans?id=${planId}`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (currentPlanId === planId) { currentPlanId = null; currentPlanName = null; }
    allPlans = await fetchAllPlans();
    renderMyPlans();
    showPlannerToast('Plan deleted.', 'success');
  } catch { showPlannerToast('Could not delete plan.'); }
}

function loadSavedPlanById(planId) {
  const plan = allPlans.find(p => p._id === planId);
  if (!plan) return;
  currentPlanId   = planId;
  currentPlanName = plan.name;
  pendingPlan     = plan.data;
  document.getElementById('upload-screen').classList.add('hidden');
  document.getElementById('planner-screen').classList.remove('hidden');
  initPlanner();
  showPlannerToast(`"${plan.name}" loaded.`, 'success');
}

function renderMyPlans() {
  const section = document.getElementById('my-plans-section');
  if (!section) return;
  if (!currentUser || !allPlans.length) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');
  const grid = document.getElementById('my-plans-grid');
  if (!grid) return;
  grid.innerHTML = allPlans.map(p => {
    const date       = new Date(p.updatedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    const assetCount = p.data?.selectedAssetKeys?.length || 0;
    const goalCount  = p.data?.goalPlan?.goals?.length || 0;
    return `
      <div class="plan-card">
        <div class="plan-card-header">
          <div class="plan-card-name">${escHtml(p.name)}</div>
          <button class="plan-card-delete" onclick="deleteSavedPlan('${p._id}')" title="Delete plan">✕</button>
        </div>
        <div class="plan-card-meta">
          <span>${goalCount ? `🎯 ${goalCount} goal${goalCount !== 1 ? 's' : ''} · ` : ''}${assetCount} asset class${assetCount !== 1 ? 'es' : ''}</span>
          <span>Saved ${date}</span>
        </div>
        <button class="btn-outline plan-card-load" onclick="loadSavedPlanById('${p._id}')">Load Plan →</button>
      </div>`;
  }).join('');
}

function collectPlanData() {
  const corpus = {};
  ASSET_CLASSES.filter(a => selectedAssetKeys.has(a.key)).forEach((a) => {
    corpus[a.key] = {
      current: parseFloat(document.getElementById(`corpus-${a.key}`)?.value) || 0,
      alloc:   parseFloat(document.getElementById(`alloc-${a.key}`)?.value)  || 0,
      ret:     parseFloat(document.getElementById(`return-${a.key}`)?.value) || a.defaultReturn,
    };
  });
  return {
    selectedAssetKeys: [...selectedAssetKeys],
    corpus,
    personal: {
      currentAge:     parseInt(document.getElementById('p-current-age')?.value)     || 35,
      retirementAge:  parseInt(document.getElementById('p-retirement-age')?.value)  || 60,
      lifeExpectancy: parseInt(document.getElementById('p-life-expectancy')?.value) || 80,
      incomeGrowth:   parseFloat(document.getElementById('p-income-growth')?.value) || 9,
      inflation:      parseFloat(document.getElementById('p-inflation')?.value)     || 9,
      investPct:      parseFloat(document.getElementById('p-invest-pct')?.value)    || 10,
    },
    snapshot: {
      income:   parseFormattedInput('p-annual-income'),
      expenses: parseFormattedInput('p-annual-expenses'),
      emi:      parseFormattedInput('p-annual-emi'),
      emiYears: parseInt(document.getElementById('p-emi-years')?.value) || 0,
    },
    goalPlan: {
      monthlySurplus: parseFormattedInput('goals-surplus') || 0,
      goals: goals.map(g => ({ ...g })),
    },
  };
}

async function applyPlanData(data) {
  if (!data) return;
  selectedAssetKeys = new Set(data.selectedAssetKeys || []);
  renderAssetSelector();
  renderCorpusTable();
  // Let the DOM update before filling in values
  await new Promise(r => setTimeout(r, 0));
  if (data.corpus) {
    Object.entries(data.corpus).forEach(([key, val]) => {
      const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      setV(`corpus-${key}`, val.current || 0);
      setV(`alloc-${key}`,  val.alloc   || 0);
      setV(`return-${key}`, val.ret     || 0);
    });
  }
  if (data.personal) {
    const p = data.personal;
    const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    setV('p-current-age',     p.currentAge);
    setV('p-retirement-age',  p.retirementAge);
    setV('p-life-expectancy', p.lifeExpectancy);
    setV('p-income-growth',   p.incomeGrowth);
    setV('p-inflation',       p.inflation);
    setV('p-invest-pct',      p.investPct);
  }
  if (data.snapshot) {
    const s = data.snapshot;
    const setFmt = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = fmtInput(v); };
    setFmt('p-annual-income',   s.income);
    setFmt('p-annual-expenses', s.expenses);
    setFmt('p-annual-emi',      s.emi);
    const ey = document.getElementById('p-emi-years');
    if (ey && s.emiYears) ey.value = s.emiYears;
  }
  if (data.goalPlan && Array.isArray(data.goalPlan.goals)) {
    goals = data.goalPlan.goals.map(g => ({ ...g }));
    goalIdCounter = Math.max(0, ...goals.map(g => g.id || 0));
    const surplusEl = document.getElementById('goals-surplus');
    if (surplusEl && data.goalPlan.monthlySurplus) surplusEl.value = fmtInput(data.goalPlan.monthlySurplus);
    renderGoalCategoryGrid();
    renderGoalsList();
    saveGoalsLocal();
  }
  updateCorpusTotals();
}

// ===== UTILS =====
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const pct = (part, total) => (total ? ((part / total) * 100).toFixed(1) + '%' : '0%');

function resolveColumns(headers) {
  const lower = headers.map((h) => String(h).trim().toLowerCase());
  const resolved = {};
  for (const [key, aliases] of Object.entries(COL_MAP)) {
    let idx = -1;
    for (const alias of aliases) {
      if (idx !== -1) break;
      // Exact match first, then substring match
      idx = lower.findIndex((h) => h === alias);
      if (idx === -1) idx = lower.findIndex((h) => h.includes(alias));
    }
    resolved[key] = idx;
  }
  return resolved;
}

function parseAmount(str) {
  if (str === null || str === undefined || str === '') return 0;
  // Strip currency symbols, commas, spaces; keep digits, dot, minus
  const cleaned = String(str).replace(/[^0-9.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

// Handles DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-Mon-YYYY, Mon DD YYYY, etc.
function parseDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();

  // DD-MM-YYYY or DD/MM/YYYY
  let m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (m) return new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`);

  // YYYY-MM-DD (ISO)
  m = s.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/);
  if (m) return new Date(s);

  // DD-Mon-YYYY  or  DD Mon YYYY  (e.g. 05-Jan-2025)
  m = s.match(/^(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{4})$/);
  if (m) return new Date(`${m[1]} ${m[2]} ${m[3]}`);

  // DD/MM/YY
  m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})$/);
  if (m) {
    const year = parseInt(m[3]) + (parseInt(m[3]) < 50 ? 2000 : 1900);
    return new Date(`${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`);
  }

  // Let the browser try (handles "Jan 5, 2025", ISO strings, etc.)
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

// ===== HEADER ROW AUTO-DETECTION =====
const _DATE_HINTS   = ['date', 'dt', 'txn', 'tran', 'posting', 'value'];
const _AMOUNT_HINTS = ['debit', 'credit', 'withdrawal', 'deposit', 'amount', '(dr)', '(cr)', 'balance'];

function findHeaderRow(rawRows) {
  for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
    const cells = rawRows[i].map((c) => String(c ?? '').toLowerCase().trim());
    const hasDate   = cells.some((c) => _DATE_HINTS.some((t) => c.includes(t)));
    const hasAmount = cells.some((c) => _AMOUNT_HINTS.some((t) => c.includes(t)));
    if (hasDate && hasAmount) return i;
  }
  // Fallback: first row with 3+ non-empty non-numeric text cells (likely a header)
  for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
    const textCells = rawRows[i].filter((c) => {
      const s = String(c ?? '').trim();
      return s && isNaN(s);
    });
    if (textCells.length >= 3) return i;
  }
  return 0;
}

// Convert raw array-of-arrays into PapaParse-style { meta, data } using the detected header row
function buildResults(rawRows) {
  const headerIdx = findHeaderRow(rawRows);
  const headers   = rawRows[headerIdx].map((c) => String(c ?? '').trim());
  const data = rawRows
    .slice(headerIdx + 1)
    .filter((row) => row.some((c) => String(c ?? '').trim() !== ''))
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
      return obj;
    });
  return { meta: { fields: headers }, data };
}

function categorise(description) {
  const desc = (description || '').toLowerCase();
  for (const [cat, rules] of Object.entries(CATEGORY_RULES)) {
    for (const rule of rules) {
      const hit = rule instanceof RegExp ? rule.test(desc) : desc.includes(rule);
      if (hit) return cat;
    }
  }
  return 'others';
}

// ===== NON-INCOME CREDIT DETECTION =====

// Credits whose descriptions contain these → excluded from income
const NON_INCOME_CREDIT_KEYWORDS = [
  'rtgs return', 'neft return', 'imps return',  // bank-returned failed transactions
  '/return/', 'return-',                          // ICICI failed-RTGS format ("/RETURN///")
  'refund', 'rfnd', 'rvsl',                       // merchant refunds & payment reversals
  'reversal', 'chargeback', 'bounce',
  'dishonour', 'dishonored', 'recall', 'rfd/',
];

// These keywords on a credit always mean income, even if a non-income keyword also matches
const CREDIT_INCOME_OVERRIDES = [
  'itdtax', 'income tax refund',  // IT refunds are income
  'int.pd', 'interest paid',      // savings account interest
  'dividend', 'div ',             // stock dividends
];

// Extract the loan recipient name embedded in debit descriptions like
// "BIL/NEFT/.../Loan/Kishore pu/STATE BANK OFI"
function extractLoanRecipient(desc) {
  const parts = String(desc || '').toLowerCase().split('/');
  const idx   = parts.findIndex((p) => p.trim() === 'loan');
  return idx !== -1 && parts[idx + 1] ? parts[idx + 1].trim() : null;
}

// Extract sender name from NEFT/RTGS/IMPS credit descriptions:
// "NEFT-BankRef-SenderName-AccountNo-..." → "SenderName"
function extractCreditSenderName(desc) {
  const m = String(desc || '').match(/^(?:NEFT|RTGS|IMPS)-[^-]+-([^-/]+)/i);
  return m ? m[1].trim().toLowerCase() : null;
}

// Classify a credit as 'income' or 'non_income'.
// loanMap: { firstWordOfRecipient → loanAmount } built from debit descriptions.
function creditCategory(desc, amount, loanMap) {
  const d = String(desc || '').toLowerCase();

  // Income overrides win unconditionally (IT refund, dividends, interest)
  if (CREDIT_INCOME_OVERRIDES.some((kw) => d.includes(kw))) return 'income';

  // Explicit non-income keywords (refunds, failed-transaction returns, reversals)
  if (NON_INCOME_CREDIT_KEYWORDS.some((kw) => d.includes(kw))) return 'non_income';

  // Loan principal return: credit amount exactly matches a prior personal loan debit
  // and the sender name matches the loan recipient.
  const sender = extractCreditSenderName(desc);
  if (sender) {
    const firstWord = sender.split(/\s+/)[0];
    const loanAmt   = loanMap[firstWord];
    if (loanAmt && Math.abs(amount - loanAmt) < 1) return 'non_income';
  }

  return 'income';
}

// ===== PARSE CSV =====
// Use raw (no-header) mode so we can detect the real header row ourselves
function parseCSV(file, callback) {
  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: false,
    complete: (results) => {
      try { callback(null, buildResults(results.data)); }
      catch (e) { callback(e); }
    },
    error: (err) => callback(err),
  });
}

// ===== PARSE EXCEL =====
function parseExcel(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: false });
      const sheet    = workbook.Sheets[workbook.SheetNames[0]];
      // header:1 gives array-of-arrays; raw:false formats all cells as strings
      const rawRows  = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
      if (!rawRows.length) { callback(new Error('Excel sheet appears to be empty.')); return; }
      callback(null, buildResults(rawRows));
    } catch (err) {
      callback(err);
    }
  };
  reader.onerror = () => callback(new Error('Failed to read file.'));
  reader.readAsArrayBuffer(file);
}

// ===== PROCESS DATA =====
function processRows(results) {
  const headers = results.meta.fields || [];
  const cols    = resolveColumns(headers);

  // Must have a date column
  if (cols.date === -1) {
    throw new Error(
      `Could not find a Date column. Columns detected: [${headers.join(', ')}]. ` +
      'Expected a column named Date, Txn Date, Transaction Date, Value Date, etc.'
    );
  }

  // Must have either separate debit/credit columns OR a single amount column
  const hasSeparate = cols.debit !== -1 || cols.credit !== -1;
  const hasSingle   = cols.amount !== -1;
  if (!hasSeparate && !hasSingle) {
    throw new Error(
      `Could not find Debit/Credit columns. Columns detected: [${headers.join(', ')}]. ` +
      'Expected Debit/Withdrawal and Credit/Deposit columns, or a single Amount column.'
    );
  }

  const dateKey    = headers[cols.date];
  const descKey    = cols.description !== -1 ? headers[cols.description] : null;
  const debitKey   = cols.debit   !== -1 ? headers[cols.debit]   : null;
  const creditKey  = cols.credit  !== -1 ? headers[cols.credit]  : null;
  const balanceKey = cols.balance !== -1 ? headers[cols.balance] : null;
  const amountKey  = cols.amount  !== -1 ? headers[cols.amount]  : null;
  const drcrKey    = cols.drcr    !== -1 ? headers[cols.drcr]    : null;

  // ── Pass 1: build loan-recipient map from debit descriptions ──────────────
  // Finds debits like "BIL/NEFT/.../Loan/Kishore pu/..." and records the
  // recipient first-word → amount so we can match the repayment credit later.
  const loanMap = {};
  results.data.forEach((row) => {
    const desc  = descKey ? String(row[descKey] ?? '') : '';
    const debit = parseAmount(debitKey ? row[debitKey] : (hasSingle ? row[amountKey] : 0));
    if (debit <= 0) return;
    const recipient = extractLoanRecipient(desc);
    if (recipient) {
      const key = recipient.split(/\s+/)[0];
      if (!loanMap[key] || loanMap[key] < debit) loanMap[key] = debit;
    }
  });

  // ── Pass 2: categorise every transaction ──────────────────────────────────
  const monthlyMap = {};

  results.data.forEach((row) => {
    const rawDate = row[dateKey];
    if (!rawDate || String(rawDate).trim() === '') return;

    const dateObj = parseDate(String(rawDate));
    if (!dateObj || isNaN(dateObj)) return;

    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    const desc     = descKey ? String(row[descKey] ?? '') : '';

    let debit  = 0;
    let credit = 0;

    if (hasSeparate) {
      debit  = parseAmount(debitKey  ? row[debitKey]  : 0);
      credit = parseAmount(creditKey ? row[creditKey] : 0);
    } else {
      const amt       = parseAmount(row[amountKey]);
      const indicator = drcrKey ? String(row[drcrKey] ?? '').toLowerCase().trim() : '';
      if (indicator && (indicator.includes('cr') || indicator === 'c' || indicator === 'deposit')) {
        credit = Math.abs(amt);
      } else if (indicator && (indicator.includes('dr') || indicator === 'd' || indicator === 'debit')) {
        debit = Math.abs(amt);
      } else {
        if (amt >= 0) credit = amt; else debit = Math.abs(amt);
      }
    }

    const balance = balanceKey ? parseAmount(row[balanceKey]) : null;

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        month: monthKey,
        firstBalance: balance,
        lastBalance:  balance,
        income: 0, nonIncomeCredits: 0,
        expense: 0, emi: 0, investment: 0,
        totalCredit: 0, totalDebit: 0,
        rows: [],
      };
    }

    const m = monthlyMap[monthKey];
    if (balance !== null) {
      if (m.firstBalance === null) m.firstBalance = balance;
      m.lastBalance = balance;
    }

    m.totalCredit += credit;
    m.totalDebit  += debit;

    if (credit > 0) {
      if (creditCategory(desc, credit, loanMap) === 'income') {
        m.income += credit;
      } else {
        m.nonIncomeCredits += credit;
      }
    }

    if (debit > 0) {
      const cat = categorise(desc);
      m[cat === 'others' ? 'expense' : cat] += debit;
    }

    m.rows.push({ date: rawDate, desc, debit, credit, balance });
  });

  return monthlyMap;
}

function aggregateTotals(monthlyMap) {
  const months = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
  const totals = { income: 0, nonIncomeCredits: 0, expense: 0, emi: 0, investment: 0 };
  months.forEach((m) => {
    totals.income           += m.income;
    totals.nonIncomeCredits += m.nonIncomeCredits;
    totals.expense          += m.expense;
    totals.emi              += m.emi;
    totals.investment       += m.investment;
  });
  return { months, totals };
}

// ===== RENDER DASHBOARD =====
function renderDashboard(monthlyMap, fileName) {
  const { months, totals } = aggregateTotals(monthlyMap);
  const numMonths = months.length || 1;

  // Average monthly values
  const avg = {
    income:     totals.income     / numMonths,
    expense:    totals.expense    / numMonths,
    emi:        totals.emi        / numMonths,
    investment: totals.investment / numMonths,
  };

  const totalOutflow = totals.expense + totals.emi + totals.investment;
  const savings      = totals.income - totalOutflow;
  const savingsRate  = totals.income ? (savings / totals.income) * 100 : 0;

  // Header meta
  const start = months[0]?.month;
  const end   = months[months.length - 1]?.month;
  document.getElementById('dash-meta').textContent =
    `${fileName} · ${numMonths} month${numMonths !== 1 ? 's' : ''} (${start} → ${end})`;

  // Summary cards
  const cards = [
    { key: 'income',     label: 'Total Income',   value: totals.income,     sub: `Avg ${fmt(avg.income)}/mo` },
    { key: 'expense',    label: 'Total Expenses', value: totals.expense,    sub: `Avg ${fmt(avg.expense)}/mo` },
    { key: 'emi',        label: 'EMI Payments',   value: totals.emi,        sub: `Avg ${fmt(avg.emi)}/mo` },
    { key: 'investment', label: 'Investments',    value: totals.investment, sub: `Avg ${fmt(avg.investment)}/mo` },
  ];

  document.getElementById('summary-strip').innerHTML = cards.map((c) => `
    <div class="summary-card ${c.key}">
      <span class="summary-label">${c.label}</span>
      <span class="summary-value">${fmt(c.value)}</span>
      <span class="summary-sub">${c.sub}</span>
    </div>
  `).join('');

  // Insight note
  const sr = savingsRate.toFixed(1);
  const srTag = savings >= 0
    ? `<span class="tag positive">+${sr}% savings rate</span>`
    : `<span class="tag negative">${sr}% deficit</span>`;

  const nonIncomeNote = totals.nonIncomeCredits > 0
    ? `<br><span style="color:var(--text-muted);font-size:.875rem;">
        ℹ️ <strong>${fmt(totals.nonIncomeCredits)}</strong> excluded from income
        (refunds, failed-transaction returns, and loan principal repayments detected automatically).
       </span>`
    : '';

  document.getElementById('insight-note').innerHTML = `
    <strong>Summary:</strong> Over the analysed period of <strong>${numMonths} month${numMonths !== 1 ? 's' : ''}</strong>,
    your average monthly income was <strong>${fmt(avg.income)}</strong> and average monthly expense (excluding EMI &amp; investments)
    was <strong>${fmt(avg.expense)}</strong>. EMI obligations averaged <strong>${fmt(avg.emi)}</strong>/mo
    and investments averaged <strong>${fmt(avg.investment)}</strong>/mo.
    Your effective savings (income minus all outflows) amount to <strong>${fmt(savings)}</strong>
    over the period &mdash; ${srTag}.${nonIncomeNote}
  `;

  // Pie chart
  renderPieChart(totals, totalOutflow);

  // Cash flow table
  renderCashFlowTable(months);

  // Store for planner
  bankData = {
    monthlyIncome:     avg.income,
    monthlyExpenses:   avg.expense,
    monthlyEMI:        avg.emi,
    monthlyInvestment: avg.investment,
  };

  // Expose ways back to this analysis: nav link + home-page banner
  document.getElementById('nav-dashboard')?.classList.remove('hidden');
  const banner = document.getElementById('home-dashboard-banner');
  if (banner) {
    banner.classList.remove('hidden');
    document.getElementById('home-dash-banner-meta').textContent =
      `${fileName} · ${numMonths} month${numMonths !== 1 ? 's' : ''} analysed · avg income ${fmt(avg.income)}/mo`;
  }

  // Switch screens
  showDashboardScreen();
}

function showDashboardScreen() {
  if (!bankData) return;
  ['upload-screen', 'planner-screen', 'goals-screen'].forEach(s =>
    document.getElementById(s)?.classList.add('hidden'));
  document.getElementById('dashboard-screen').classList.remove('hidden');
  window.scrollTo({ top: 0 });
}

function clearDashboardAccess() {
  document.getElementById('nav-dashboard')?.classList.add('hidden');
  document.getElementById('home-dashboard-banner')?.classList.add('hidden');
}

// ===== PIE CHART =====
const CHART_COLORS = {
  income:     '#00d4aa',
  expense:    '#ff6584',
  emi:        '#ffa94d',
  investment: '#6c63ff',
};

function renderPieChart(totals, totalOutflow) {
  const labels = ['Income', 'Expenses', 'EMI', 'Investments'];
  const keys   = ['income', 'expense', 'emi', 'investment'];
  const data   = keys.map((k) => totals[k]);
  const colors = keys.map((k) => CHART_COLORS[k]);
  const total  = data.reduce((a, b) => a + b, 0);

  if (pieChart) pieChart.destroy();

  const ctx = document.getElementById('pie-chart').getContext('2d');
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#1a1d27',
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${fmt(ctx.raw)}  (${pct(ctx.raw, total)})`,
          },
        },
      },
    },
  });

  // Custom legend
  document.getElementById('chart-legend').innerHTML = keys.map((k, i) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${colors[i]}"></div>
      <span class="legend-label">${labels[i]}</span>
      <span class="legend-value" style="color:${colors[i]}">${fmt(data[i])}</span>
      <span class="legend-pct">${pct(data[i], total)}</span>
    </div>
  `).join('');
}

// ===== CASH FLOW TABLE =====
function renderCashFlowTable(months) {
  let runningBalance = null;

  const rows = months.map((m) => {
    // Opening balance: try to use first recorded balance minus first credit/debit
    // Fallback to running balance from previous month
    const opening = runningBalance !== null
      ? runningBalance
      : (m.firstBalance !== null ? m.firstBalance - m.totalCredit + m.totalDebit : 0);

    const closing   = opening + m.totalCredit - m.totalDebit;
    runningBalance   = closing;

    const net = m.totalCredit - m.totalDebit;

    const [year, mon] = m.month.split('-');
    const label = new Date(year, mon - 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' });

    return `
      <tr>
        <td>${label}</td>
        <td>${fmt(opening)}</td>
        <td class="positive">${fmt(m.totalCredit)}</td>
        <td class="negative">${fmt(m.totalDebit)}</td>
        <td class="${net >= 0 ? 'positive' : 'negative'}">${fmt(net)}</td>
      </tr>
    `;
  });

  // Totals row
  const totalCredit  = months.reduce((s, m) => s + m.totalCredit, 0);
  const totalDebit   = months.reduce((s, m) => s + m.totalDebit, 0);
  const totalNet     = totalCredit - totalDebit;

  document.getElementById('cashflow-body').innerHTML = rows.join('') + `
    <tr style="font-weight:700; border-top: 2px solid var(--border);">
      <td>Total</td>
      <td>—</td>
      <td class="positive">${fmt(totalCredit)}</td>
      <td class="negative">${fmt(totalDebit)}</td>
      <td class="${totalNet >= 0 ? 'positive' : 'negative'}">${fmt(totalNet)}</td>
    </tr>
  `;
}

// ===== UPLOAD HANDLING =====
function handleFile(file) {
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  if (!['csv', 'xls', 'xlsx'].includes(ext)) {
    showError('Unsupported file type. Please upload a CSV, XLS, or XLSX file.');
    return;
  }

  document.getElementById('upload-error').classList.add('hidden');

  const onParsed = (err, results) => {
    if (err) { showError('Failed to parse file: ' + err.message); return; }
    if (!results.data.length) { showError('The file appears to be empty.'); return; }
    try {
      const monthlyMap = processRows(results);
      if (!Object.keys(monthlyMap).length) {
        showError('No valid transactions found. Please check your file format.');
        return;
      }
      renderDashboard(monthlyMap, file.name);
    } catch (e) {
      showError(e.message);
    }
  };

  if (ext === 'csv') {
    parseCSV(file, onParsed);
  } else {
    parseExcel(file, onParsed);
  }
}

function showError(msg) {
  const el = document.getElementById('upload-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  const dropZone  = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const resetBtn  = document.getElementById('reset-btn');

  // Home-page option cards
  document.getElementById('select-upload-btn').addEventListener('click', () => {
    document.getElementById('upload-section').classList.remove('hidden');
    document.getElementById('opt-upload-card').classList.add('home-option-card--active');
    document.getElementById('opt-manual-card').classList.remove('home-option-card--active');
    document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('manual-btn').addEventListener('click', manualEntry);
  document.getElementById('goals-btn').addEventListener('click', openGoalsScreen);

  // Site nav
  document.getElementById('nav-home').addEventListener('click', () => {
    ['dashboard-screen', 'planner-screen', 'goals-screen'].forEach(s =>
      document.getElementById(s)?.classList.add('hidden'));
    document.getElementById('upload-screen').classList.remove('hidden');
    window.scrollTo({ top: 0 });
  });
  document.getElementById('nav-dashboard').addEventListener('click', showDashboardScreen);
  document.getElementById('home-dash-banner-btn').addEventListener('click', showDashboardScreen);
  document.getElementById('nav-goals').addEventListener('click', openGoalsScreen);
  document.getElementById('nav-retirement').addEventListener('click', () => {
    ['upload-screen', 'dashboard-screen', 'goals-screen'].forEach(s =>
      document.getElementById(s)?.classList.add('hidden'));
    document.getElementById('planner-screen').classList.remove('hidden');
    initPlanner();
    window.scrollTo({ top: 0 });
  });

  // Goals screen
  document.getElementById('goals-back-btn').addEventListener('click', () => {
    document.getElementById('goals-screen').classList.add('hidden');
    document.getElementById('upload-screen').classList.remove('hidden');
    window.scrollTo({ top: 0 });
  });
  document.getElementById('goals-calc-btn').addEventListener('click', calculateGoalPlan);

  browseBtn.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('click', (e) => { if (e.target !== browseBtn) fileInput.click(); });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    bankData = null;
    clearDashboardAccess();
    document.getElementById('upload-screen').classList.remove('hidden');
    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('upload-error').classList.add('hidden');
    document.getElementById('upload-section').classList.remove('hidden');
    if (pieChart) { pieChart.destroy(); pieChart = null; }
  });

  document.getElementById('planner-btn').addEventListener('click', () => {
    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('planner-screen').classList.remove('hidden');
    initPlanner();
  });

  document.getElementById('planner-back-btn').addEventListener('click', () => {
    document.getElementById('planner-screen').classList.add('hidden');
    if (bankData) {
      document.getElementById('dashboard-screen').classList.remove('hidden');
    } else {
      document.getElementById('upload-screen').classList.remove('hidden');
    }
  });

  document.getElementById('calculate-btn').addEventListener('click', calculateProjection);
});

function manualEntry() {
  bankData = null;
  clearDashboardAccess();
  document.getElementById('upload-screen').classList.add('hidden');
  document.getElementById('planner-screen').classList.remove('hidden');
  initPlanner();
}

// ===== INVESTMENT PLANNER =====

function initPlanner() {
  renderAssetSelector();
  renderCorpusTable();
  renderPlannerSnapshot();

  // Restore saved plan if the user is logged in and one was fetched
  if (pendingPlan) { applyPlanData(pendingPlan); pendingPlan = null; }

  // Pre-fill investment % from bank data, then auto-allocate
  if (bankData && bankData.monthlyIncome > 0) {
    const pct = (bankData.monthlyInvestment / bankData.monthlyIncome * 100).toFixed(1);
    document.getElementById('p-invest-pct').value = pct;
  }
  allocateEqually();

  // Comma-formatting for editable snapshot inputs
  attachFormattedInputHandlers('p-annual-income');
  attachFormattedInputHandlers('p-annual-expenses');
  attachFormattedInputHandlers('p-annual-emi');

  // Re-allocate (and validate) whenever income, expenses, EMI, or invest % changes
  document.getElementById('p-invest-pct').addEventListener('input', allocateEqually);
  document.getElementById('p-annual-income')?.addEventListener('input', allocateEqually);
  document.getElementById('p-annual-expenses')?.addEventListener('input', allocateEqually);
  document.getElementById('p-annual-emi')?.addEventListener('input', allocateEqually);

  // Hide any previous projection
  document.getElementById('projection-output').classList.add('hidden');
}

function fmtInput(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function parseFormattedInput(id) {
  const el = document.getElementById(id);
  return el ? (parseFloat(el.value.replace(/[^0-9.]/g, '')) || 0) : 0;
}

function attachFormattedInputHandlers(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('focus', () => {
    const raw = parseFloat(el.value.replace(/[^0-9.]/g, '')) || 0;
    el.value = raw || '';
  });
  el.addEventListener('blur', () => {
    const raw = parseFloat(el.value.replace(/[^0-9.]/g, '')) || 0;
    if (raw) el.value = fmtInput(raw);
  });
}

function getAnnualIncome() {
  return parseFormattedInput('p-annual-income') || (bankData?.monthlyIncome || 0) * 12;
}

function getAnnualExpenses() {
  return parseFormattedInput('p-annual-expenses') || (bankData?.monthlyExpenses || 0) * 12;
}

function getAnnualEMI() {
  return parseFormattedInput('p-annual-emi') || (bankData?.monthlyEMI || 0) * 12;
}

let _investmentBlocked = false;

function allocateEqually() {
  const investPctInput = document.getElementById('p-invest-pct');
  const income   = getAnnualIncome();
  const expenses = getAnnualExpenses();
  const emi      = getAnnualEMI();

  const blocked = income > 0 && (expenses + emi) >= income;

  if (blocked) {
    if (!_investmentBlocked) {
      showPlannerToast('Expenses are more than Income. Additional Investment not possible.');
      _investmentBlocked = true;
    }
    investPctInput.disabled = true;
    investPctInput.value    = 0;
    ASSET_CLASSES.filter(a => selectedAssetKeys.has(a.key)).forEach((a) => {
      const inp = document.getElementById(`alloc-${a.key}`);
      if (inp) inp.value = 0;
    });
    updateCorpusTotals();
    return;
  }

  if (_investmentBlocked) _investmentBlocked = false;
  investPctInput.disabled = false;

  // Cap invest % to surplus available after expenses + EMI
  const surplus    = income - expenses - emi;
  const maxPct     = income > 0 ? (surplus / income) * 100 : 100;
  investPctInput.max = maxPct.toFixed(1);

  let investPct = parseFloat(investPctInput.value) || 0;
  if (investPct > maxPct) {
    investPct = parseFloat(maxPct.toFixed(1));
    investPctInput.value = investPct;
    showPlannerToast(`Investment capped at ${investPct.toFixed(1)}% — cannot exceed surplus after expenses & EMI.`);
  }

  const totalInvest  = income * (investPct / 100);
  const selectedList = ASSET_CLASSES.filter(a => selectedAssetKeys.has(a.key));
  const perAsset     = selectedList.length > 0 ? Math.round(totalInvest / selectedList.length) : 0;
  selectedList.forEach((a) => {
    const inp = document.getElementById(`alloc-${a.key}`);
    if (inp) inp.value = perAsset;
  });
  updateCorpusTotals();
}

function showPlannerToast(msg, type = 'error') {
  let toast = document.getElementById('planner-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'planner-toast';
    toast.className = 'planner-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = type === 'success' ? '#00a67d' : '#ff4060';
  toast.classList.add('planner-toast--show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('planner-toast--show'), 4500);
}

function renderPlannerSnapshot() {
  const el = document.getElementById('planner-statement-summary');

  if (!bankData) {
    const ytr = (parseInt(document.getElementById('p-retirement-age')?.value) || 60)
              - (parseInt(document.getElementById('p-current-age')?.value)    || 35);
    el.innerHTML = `
      <div class="statement-mini-strip">
        <div class="statement-mini-card">
          <div class="statement-mini-label">Annual Income</div>
          <input type="text" id="p-annual-income" class="snapshot-income-input" placeholder="e.g. 12,00,000">
          <div class="statement-mini-sub">Enter your annual income</div>
        </div>
        <div class="statement-mini-card">
          <div class="statement-mini-label">Annual Expenses</div>
          <input type="text" id="p-annual-expenses" class="snapshot-expense-input" placeholder="e.g. 6,00,000">
          <div class="statement-mini-sub">Excluding EMI &amp; investments</div>
        </div>
        <div class="statement-mini-card">
          <div class="statement-mini-label">Annual EMI</div>
          <input type="text" id="p-annual-emi" class="snapshot-emi-input" placeholder="e.g. 1,80,000">
          <div class="statement-mini-sub emi-tenure-row">
            Paid off after&nbsp;
            <input type="number" id="p-emi-years" class="emi-years-input"
              value="${ytr}" min="0" max="${ytr}">&nbsp;yrs
          </div>
        </div>
      </div>`;
    return;
  }

  const annual = {
    income:     bankData.monthlyIncome     * 12,
    expenses:   bankData.monthlyExpenses   * 12,
    emi:        bankData.monthlyEMI        * 12,
    investment: bankData.monthlyInvestment * 12,
  };
  annual.surplus = annual.income - annual.expenses - annual.emi - annual.investment;
  const monthlySurplus = bankData.monthlyIncome - bankData.monthlyExpenses - bankData.monthlyEMI - bankData.monthlyInvestment;

  const investPct = bankData.monthlyIncome > 0
    ? (bankData.monthlyInvestment / bankData.monthlyIncome * 100).toFixed(1)
    : 0;
  const surplusColor = annual.surplus >= 0 ? 'var(--income)' : 'var(--expense)';
  const surplusLabel = annual.surplus >= 0 ? 'Surplus' : 'Deficit';
  const yearsToRetirement = (parseInt(document.getElementById('p-retirement-age')?.value) || 60)
                          - (parseInt(document.getElementById('p-current-age')?.value)    || 35);

  el.innerHTML = `
    <div class="statement-mini-strip">
      <div class="statement-mini-card">
        <div class="statement-mini-label">Annual Income (editable)</div>
        <input type="text" id="p-annual-income" class="snapshot-income-input"
          value="${fmtInput(annual.income)}">
        <div class="statement-mini-sub">From statement: ${fmt(annual.income)}</div>
      </div>
      <div class="statement-mini-card">
        <div class="statement-mini-label">Annual Expenses (editable)</div>
        <input type="text" id="p-annual-expenses" class="snapshot-expense-input"
          value="${fmtInput(annual.expenses)}">
        <div class="statement-mini-sub">From statement: ${fmt(annual.expenses)}</div>
      </div>
      <div class="statement-mini-card">
        <div class="statement-mini-label">Annual EMI (editable)</div>
        <input type="text" id="p-annual-emi" class="snapshot-emi-input"
          value="${fmtInput(annual.emi)}">
        <div class="statement-mini-sub emi-tenure-row">
          Paid off after&nbsp;
          <input type="number" id="p-emi-years" class="emi-years-input"
            value="${yearsToRetirement}" min="0" max="${yearsToRetirement}">&nbsp;yrs
        </div>
      </div>
      <div class="statement-mini-card">
        <div class="statement-mini-label">Annual Investment</div>
        <div class="statement-mini-value" style="color:var(--investment)">${fmt(annual.investment)}</div>
        <div class="statement-mini-sub">${investPct}% of income</div>
      </div>
      <div class="statement-mini-card">
        <div class="statement-mini-label">${surplusLabel}</div>
        <div class="statement-mini-value" style="color:${surplusColor}">${fmt(Math.abs(annual.surplus))}</div>
        <div class="statement-mini-sub">${fmt(Math.abs(monthlySurplus))}/mo avg</div>
      </div>
    </div>
  `;
}

// ===== ASSET SELECTOR =====
const RISK_COLORS = {
  'Very Low': '#00d4aa',
  'Low':      '#6ab87a',
  'Medium':   '#ffa94d',
  'High':     '#ff7b6b',
  'Very High':'#ff6584',
  'Extreme':  '#d94040',
};

function renderAssetSelector() {
  const panel = document.getElementById('asset-selector-panel');
  if (!panel) return;

  const categories = [...new Set(ASSET_CLASSES.map(a => a.category))];
  let html = '<div class="asset-selector-grid">';
  categories.forEach((cat) => {
    html += `<div class="asset-selector-category"><div class="asset-cat-header">${cat}</div>`;
    ASSET_CLASSES.filter(a => a.category === cat).forEach((a) => {
      const checked = selectedAssetKeys.has(a.key) ? 'checked' : '';
      const color   = RISK_COLORS[a.risk] || '#8b90a7';
      html += `<label class="asset-checkbox-row${checked ? ' asset-checkbox-row--checked' : ''}">
        <input type="checkbox" data-key="${a.key}" ${checked}
          onchange="toggleAssetClass('${a.key}', this.checked)">
        <span class="asset-cb-label">${a.label}</span>
        <span class="asset-risk-badge" style="color:${color};border-color:${color};background:${color}1a">${a.risk}</span>
      </label>`;
    });
    html += '</div>';
  });
  html += '</div>';
  panel.innerHTML = html;
  // Always open the panel when the planner first loads
  panel.classList.remove('hidden');
  const chevron = document.getElementById('selector-chevron');
  if (chevron) chevron.textContent = '▾';
  updateSelectorCount();
}

function toggleAssetClass(key, checked) {
  if (checked) selectedAssetKeys.add(key);
  else         selectedAssetKeys.delete(key);
  const label = document.querySelector(`.asset-checkbox-row input[data-key="${key}"]`)?.closest('label');
  if (label) label.classList.toggle('asset-checkbox-row--checked', checked);
  renderCorpusTable();
  updateSelectorCount();
  allocateEqually(); // redistributes invest % equally across newly selected set
}

function updateSelectorCount() {
  const el = document.getElementById('asset-selector-count');
  const n  = selectedAssetKeys.size;
  if (el) el.textContent = `${n} asset class${n !== 1 ? 'es' : ''} selected`;
}

function toggleAssetSelectorPanel() {
  const panel   = document.getElementById('asset-selector-panel');
  const chevron = document.getElementById('selector-chevron');
  if (!panel) return;
  const closing = !panel.classList.contains('hidden');
  panel.classList.toggle('hidden', closing);
  if (chevron) chevron.textContent = closing ? '▸' : '▾';
}

// ===== CORPUS TABLE =====
function renderCorpusTable() {
  // Snapshot existing input values so they survive a re-render
  const saved = {};
  ASSET_CLASSES.forEach((a) => {
    const cur = document.getElementById(`corpus-${a.key}`);
    const alc = document.getElementById(`alloc-${a.key}`);
    const ret = document.getElementById(`return-${a.key}`);
    if (cur || alc || ret) {
      saved[a.key] = {
        cur: cur?.value ?? '0',
        alc: alc?.value ?? '0',
        ret: ret?.value ?? String(a.defaultReturn),
      };
    }
  });

  const tbody    = document.getElementById('corpus-tbody');
  const selected = ASSET_CLASSES.filter(a => selectedAssetKeys.has(a.key));
  const cats     = [...new Set(selected.map(a => a.category))];

  let html = '';
  if (!selected.length) {
    html = `<tr><td colspan="4">
      <div class="corpus-empty-state">
        <div class="corpus-empty-icon">☝️</div>
        <div class="corpus-empty-title">No asset classes selected yet</div>
        <div class="corpus-empty-desc">Use <strong>Choose your investments</strong> above to pick the asset classes you hold. They'll appear here as a table for you to fill in current values.</div>
      </div>
    </td></tr>`;
  } else {
    cats.forEach((cat) => {
      html += `<tr class="cat-row"><td colspan="4">${cat}</td></tr>`;
      selected.filter(a => a.category === cat).forEach((a) => {
        const sv  = saved[a.key] || {};
        const cur = sv.cur ?? '0';
        const alc = sv.alc ?? '0';
        const ret = sv.ret ?? String(a.defaultReturn);
        const rColor = RISK_COLORS[a.risk] || '#8b90a7';
        html += `<tr>
          <td style="padding-left:24px">
            ${a.label}
            <span class="table-risk-dot" style="background:${rColor}" title="${a.risk} risk"></span>
          </td>
          <td class="num-col">
            <input type="number" id="corpus-${a.key}" class="corpus-input"
              min="0" step="1000" value="${cur}" placeholder="0" oninput="updateCorpusTotals()">
          </td>
          <td class="num-col">
            <input type="number" id="alloc-${a.key}" class="corpus-input"
              min="0" step="1000" value="${alc}" placeholder="0" oninput="updateCorpusTotals()">
          </td>
          <td class="num-col">
            <input type="number" id="return-${a.key}" class="corpus-input return-input"
              min="0" max="200" step="0.5" value="${ret}" oninput="updateCorpusTotals()">%
          </td>
        </tr>`;
      });
    });
  }
  tbody.innerHTML = html;
}

function updateCorpusTotals() {
  let totalCurrent = 0;
  let totalAlloc   = 0;
  let weightedSum  = 0;
  ASSET_CLASSES.filter(a => selectedAssetKeys.has(a.key)).forEach((a) => {
    const cur = parseFloat(document.getElementById(`corpus-${a.key}`)?.value) || 0;
    const alc = parseFloat(document.getElementById(`alloc-${a.key}`)?.value)  || 0;
    const ret = parseFloat(document.getElementById(`return-${a.key}`)?.value) || 0;
    totalCurrent += cur;
    totalAlloc   += alc;
    weightedSum  += (cur + alc) * ret;
  });
  const combined = totalCurrent + totalAlloc;
  const wavg = combined > 0 ? (weightedSum / combined).toFixed(1) : '—';
  document.getElementById('corpus-total-cell').textContent  = fmt(totalCurrent);
  document.getElementById('alloc-total-cell').textContent   = fmt(totalAlloc);
  document.getElementById('corpus-return-cell').textContent = combined > 0 ? `${wavg}%` : '—';
}

function getCorpusInputs() {
  let totalCurrent = 0;
  let totalAlloc   = 0;
  let weightedSum  = 0;
  ASSET_CLASSES.filter(a => selectedAssetKeys.has(a.key)).forEach((a) => {
    const cur = parseFloat(document.getElementById(`corpus-${a.key}`)?.value) || 0;
    const alc = parseFloat(document.getElementById(`alloc-${a.key}`)?.value)  || 0;
    const ret = parseFloat(document.getElementById(`return-${a.key}`)?.value) || 0;
    totalCurrent += cur;
    totalAlloc   += alc;
    weightedSum  += (cur + alc) * (ret / 100);
  });
  const combined = totalCurrent + totalAlloc;
  const weightedReturn = combined > 0 ? weightedSum / combined : 0.12;
  // totalCorpus is current value only — annual alloc is added each year via income × investRate
  return { totalCorpus: totalCurrent, annualAlloc: totalAlloc, weightedReturn };
}

function calculateProjection() {
  const currentAge     = parseInt(document.getElementById('p-current-age').value)     || 35;
  const retirementAge  = parseInt(document.getElementById('p-retirement-age').value)  || 60;
  const lifeExpectancy = parseInt(document.getElementById('p-life-expectancy').value) || 80;

  if (retirementAge <= currentAge) {
    alert('Retirement age must be greater than current age.');
    return;
  }
  if (lifeExpectancy <= retirementAge) {
    alert('Life expectancy must be greater than retirement age.');
    return;
  }

  const incomeGrowth = (parseFloat(document.getElementById('p-income-growth').value) || 9) / 100;
  const inflation    = (parseFloat(document.getElementById('p-inflation').value)      || 9) / 100;
  const investRate   = (parseFloat(document.getElementById('p-invest-pct').value)     || 10) / 100;

  const { totalCorpus, annualAlloc, weightedReturn } = getCorpusInputs();

  // Annual income — editable by user in snapshot, else from bank statement
  const annualIncome0   = getAnnualIncome();
  const annualExpenses0 = getAnnualExpenses();
  const annualEMI       = getAnnualEMI();

  const currentYear       = new Date().getFullYear();
  const yearsToRetirement = retirementAge - currentAge;
  const emiYearsInput     = document.getElementById('p-emi-years')?.value;
  const emiYears          = emiYearsInput !== '' && emiYearsInput != null
                              ? parseInt(emiYearsInput)
                              : yearsToRetirement;
  let corpus = totalCorpus;

  // ── Accumulation (pre-retirement) ──
  const preRows = [];
  for (let y = 0; y < yearsToRetirement; y++) {
    const income      = annualIncome0   * Math.pow(1 + incomeGrowth, y);
    const expenses    = annualExpenses0 * Math.pow(1 + inflation, y);
    const emiThisYear = y < emiYears ? annualEMI : 0;
    const investment  = income * investRate;
    const returnAmt   = corpus * weightedReturn;
    const closing     = corpus + returnAmt + investment;

    preRows.push({
      year: currentYear + y,
      age:  currentAge  + y,
      income,
      expenses: expenses + emiThisYear,
      investment,
      returnAmt,
      closing,
    });
    corpus = closing;
  }

  // ── Drawdown (post-retirement) ──
  // Living expenses at the point of retirement (no EMI — assumed paid off)
  const expensesAtRetirement = annualExpenses0 * Math.pow(1 + inflation, yearsToRetirement);
  const postRows = [];

  for (let y = 0; y < (lifeExpectancy - retirementAge); y++) {
    const opening   = corpus;
    const expenses  = expensesAtRetirement * Math.pow(1 + inflation, y);
    const netCorpus = opening - expenses;
    const returnAmt = Math.max(netCorpus, 0) * weightedReturn;
    const rawClose  = netCorpus + returnAmt;
    const isNeg     = rawClose < 0;
    const closing   = Math.max(rawClose, 0);

    postRows.push({
      year: currentYear + yearsToRetirement + y,
      age:  retirementAge + y,
      opening,
      expenses,
      returnAmt,
      closing,
      isNeg,
    });
    corpus = closing;
  }

  renderProjectionTables(preRows, postRows);
  document.getElementById('projection-output').classList.remove('hidden');
  document.getElementById('projection-output').scrollIntoView({ behavior: 'smooth', block: 'start' });

}

function renderProjectionTables(preRows, postRows) {
  document.getElementById('pre-retirement-tbody').innerHTML = preRows.map((r) => `
    <tr>
      <td>${r.year}</td>
      <td>${r.age}</td>
      <td class="num-col positive">${fmt(r.income)}</td>
      <td class="num-col negative">${fmt(r.expenses)}</td>
      <td class="num-col positive">${fmt(r.investment)}</td>
      <td class="num-col positive">${fmt(r.returnAmt)}</td>
      <td class="num-col" style="font-weight:600">${fmt(r.closing)}</td>
    </tr>
  `).join('');

  document.getElementById('post-retirement-tbody').innerHTML = postRows.map((r) => `
    <tr${r.isNeg ? ' class="out-of-money"' : ''}>
      <td>${r.year}</td>
      <td>${r.age}</td>
      <td class="num-col">${fmt(r.opening)}</td>
      <td class="num-col negative">${fmt(r.expenses)}</td>
      <td class="num-col positive">${fmt(r.returnAmt)}</td>
      <td class="num-col" style="font-weight:600">${fmt(r.closing)}</td>
      <td>${r.isNeg
        ? '<span class="badge-warn">⚠️ Out of Money</span>'
        : '<span class="badge-ok">✓ Funded</span>'}</td>
    </tr>
  `).join('');
}

// ===== GOOGLE AUTH INIT =====
// Runs after GIS script loads (defer)
window.addEventListener('load', () => {
  // Small delay to ensure GIS script is initialised
  setTimeout(initGoogleAuth, 300);
});

// =====================================================================
// ===== GOAL-BASED PLANNER =====
// =====================================================================

// Category defaults per spec: inflation (midpoint of documented range),
// a sensible default horizon, and a starter name. All editable by the user.
const GOAL_CATEGORIES = [
  { key: 'House',      icon: '🏠', label: 'House',      inflation: 6.5, horizon: 7,  defaultName: 'House down payment' },
  { key: 'Car',        icon: '🚗', label: 'Car',        inflation: 4.5, horizon: 4,  defaultName: 'New car' },
  { key: 'Education',  icon: '🎓', label: 'Education',  inflation: 11,  horizon: 12, defaultName: "Child's education" },
  { key: 'Wedding',    icon: '💍', label: 'Wedding',    inflation: 9,   horizon: 6,  defaultName: 'Wedding' },
  { key: 'Vacation',   icon: '✈️', label: 'Vacation',   inflation: 5.5, horizon: 3,  defaultName: 'Dream vacation' },
  { key: 'Retirement', icon: '🏖️', label: 'Retirement', inflation: 6,   horizon: 25, defaultName: 'Retirement corpus' },
  { key: 'Custom',     icon: '⭐', label: 'Custom',     inflation: 6,   horizon: 5,  defaultName: 'Custom goal' },
];

const RISK_RETURN_PRESETS = [
  { key: 'conservative', label: 'Conservative (debt-heavy)', rate: 7 },
  { key: 'balanced',     label: 'Balanced (hybrid)',         rate: 10 },
  { key: 'aggressive',   label: 'Aggressive (equity-heavy)', rate: 12 },
];

const GOAL_COLORS = ['#6c63ff', '#00d4aa', '#ffa94d', '#ff6584', '#4dabf7', '#e599f7', '#94d82d', '#ffd43b'];

// ===== GOAL STATE =====
let goals = [];           // Goal objects (see spec §1)
let goalIdCounter = 0;
let goalStackedChart = null;
let goalGrowthChart = null;

function goalCategory(key) {
  return GOAL_CATEGORIES.find(c => c.key === key) || GOAL_CATEGORIES[GOAL_CATEGORIES.length - 1];
}

// ===== GOAL CALCULATION ENGINE (spec §2) =====

// a) Future value of the goal (inflation-adjusted target)
function goalFV(targetAmountToday, inflationRate, years) {
  return targetAmountToday * Math.pow(1 + inflationRate / 100, years);
}

// b) Future value of savings already earmarked
function existingFV(currentSavings, expectedReturnRate, years) {
  return currentSavings * Math.pow(1 + expectedReturnRate / 100, years);
}

// c) Required monthly SIP to close the gap (annuity-due closed form)
function requiredSIP(fvGap, expectedReturnRate, years) {
  if (fvGap <= 0) return 0;
  const months = Math.round(years * 12);
  if (months <= 0) return Infinity;
  const mr = expectedReturnRate / 100 / 12;
  if (mr === 0) return fvGap / months;
  return fvGap / ((((Math.pow(1 + mr, months) - 1) / mr)) * (1 + mr));
}

// FV of a step-up SIP: contributions at the start of each month, SIP grows
// by stepUpPercent every 12 months. Matches the annuity-due closed form when
// stepUpPercent = 0.
function stepUpSipFV(startSip, stepUpPercent, expectedReturnRate, years) {
  const mr = expectedReturnRate / 100 / 12;
  let bal = 0;
  let sip = startSip;
  for (let y = 0; y < years; y++) {
    for (let m = 0; m < 12; m++) bal = (bal + sip) * (1 + mr);
    sip *= 1 + stepUpPercent / 100;
  }
  return bal;
}

// Solve for the starting SIP of a step-up plan via binary search (spec §2c).
function requiredSIPStepUp(fvGap, stepUpPercent, expectedReturnRate, years) {
  if (fvGap <= 0) return 0;
  if (years <= 0) return Infinity;
  let lo = 0, hi = 10000000; // ₹0 – ₹1 Cr/month search window
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (stepUpSipFV(mid, stepUpPercent, expectedReturnRate, years) < fvGap) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Full per-goal computation. Returns {years, fvGoal, fvExisting, fvGap, requiredMonthly}.
function computeGoal(g, currentYear) {
  const years = g.targetYear - currentYear;
  const fvGoalV = goalFV(g.targetAmountToday, g.inflationRate, years);
  const fvExistingV = existingFV(g.currentSavings, g.expectedReturnRate, years);
  const fvGap = Math.max(0, fvGoalV - fvExistingV);
  const requiredMonthly = g.stepUpPercent > 0
    ? requiredSIPStepUp(fvGap, g.stepUpPercent, g.expectedReturnRate, years)
    : requiredSIP(fvGap, g.expectedReturnRate, years);
  return { ...g, years, fvGoal: fvGoalV, fvExisting: fvExistingV, fvGap, requiredMonthly };
}

// ===== MULTI-GOAL AGGREGATION & REBALANCING (spec §3) =====
function computeGoalPlan(surplus, currentYear) {
  const computed = goals.map(g => computeGoal(g, currentYear));
  const totalRequired = computed.reduce((s, c) => s + c.requiredMonthly, 0);
  const hasSurplus = surplus > 0;
  const allFunded = hasSurplus && totalRequired <= surplus;

  // Fund goals in priority order (1 = first) until surplus is exhausted
  const sorted = [...computed].sort((a, b) => (a.priority - b.priority) || (a.years - b.years));
  let remaining = hasSurplus ? surplus : 0;
  sorted.forEach((c) => {
    c.allocated = Math.min(c.requiredMonthly, remaining);
    remaining = Math.max(0, remaining - c.allocated);
    c.funded = c.allocated >= c.requiredMonthly - 0.5;
    if (hasSurplus && !c.funded) c.suggestions = buildRebalanceSuggestions(c, c.allocated, currentYear);
  });

  return { computed, sorted, totalRequired, surplus, hasSurplus, allFunded };
}

// Rebalancing suggestions for a goal whose required SIP exceeds its available
// share of the surplus: extend horizon, reduce target, or (clearly labelled
// higher-risk, never auto-applied) increase expected return.
function buildRebalanceSuggestions(c, avail, currentYear) {
  const out = [];

  if (avail <= 0) {
    out.push({ type: 'none', text: 'No surplus is left after funding higher-priority goals. Lower another goal\'s priority, trim its target, or increase your monthly surplus.' });
    return out;
  }

  const sipAt = (years, rate) => {
    const fvG = goalFV(c.targetAmountToday, c.inflationRate, years);
    const fvE = existingFV(c.currentSavings, rate, years);
    const gap = Math.max(0, fvG - fvE);
    return c.stepUpPercent > 0
      ? requiredSIPStepUp(gap, c.stepUpPercent, rate, years)
      : requiredSIP(gap, rate, years);
  };

  // 1) Extend target_year — smallest extension that makes the goal fit
  for (let extra = 1; extra <= 40; extra++) {
    if (sipAt(c.years + extra, c.expectedReturnRate) <= avail) {
      out.push({
        type: 'extend',
        text: `Extend the target by ${extra} year${extra > 1 ? 's' : ''} (to ${currentYear + c.years + extra}) — the SIP then fits in your remaining ${fmt(avail)}/mo.`,
      });
      break;
    }
  }

  // 2) Reduce target_amount_today — FV is linear in the starting SIP,
  //    so scale the gap by avail/required.
  if (c.requiredMonthly > 0 && isFinite(c.requiredMonthly)) {
    const factor = avail / c.requiredMonthly;
    const newFvGoal = c.fvExisting + c.fvGap * factor;
    const newTarget = newFvGoal / Math.pow(1 + c.inflationRate / 100, c.years);
    const reduction = c.targetAmountToday - newTarget;
    if (newTarget > 0 && reduction > 0) {
      out.push({
        type: 'reduce',
        text: `Reduce the target by ${fmtCompact(reduction)} (to ${fmtCompact(newTarget)} in today's money) to fit your remaining surplus.`,
      });
    }
  }

  // 3) Increase expected_return_rate — manual, higher-risk option only
  {
    let lo = c.expectedReturnRate, hi = 18, found = null;
    if (sipAt(c.years, hi) <= avail) {
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (sipAt(c.years, mid) <= avail) { found = mid; hi = mid; } else lo = mid;
      }
    }
    if (found !== null) {
      out.push({
        type: 'risk',
        text: `A more aggressive allocation returning ~${found.toFixed(1)}% p.a. would fit — ⚠️ higher risk: markets may not deliver this; not a default recommendation.`,
      });
    }
  }

  return out;
}

// ===== GOAL STATE HELPERS =====
function saveGoalsLocal() {
  try {
    localStorage.setItem('corpusplan_goals', JSON.stringify({
      goals,
      surplus: parseFormattedInput('goals-surplus') || 0,
    }));
  } catch { /* storage full / private mode — non-fatal */ }
}

function loadGoalsLocal() {
  try {
    const raw = localStorage.getItem('corpusplan_goals');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.goals) && data.goals.length) {
      goals = data.goals;
      goalIdCounter = Math.max(0, ...goals.map(g => g.id));
      const surplusEl = document.getElementById('goals-surplus');
      if (surplusEl && !surplusEl.value && data.surplus) surplusEl.value = fmtInput(data.surplus);
    }
  } catch { /* corrupt local state — start fresh */ }
}

function addGoal(categoryKey) {
  const cat = goalCategory(categoryKey);
  const currentYear = new Date().getFullYear();

  // Retirement pre-fill from the shared financial profile: ~25× annual expenses
  let targetAmount = 0;
  if (categoryKey === 'Retirement') {
    const annualExpenses = getAnnualExpenses();
    if (annualExpenses > 0) targetAmount = Math.round(annualExpenses * 25);
  }

  goals.push({
    id: ++goalIdCounter,
    name: cat.defaultName,
    category: cat.key,
    targetAmountToday: targetAmount,
    targetYear: currentYear + cat.horizon,
    inflationRate: cat.inflation,
    currentSavings: 0,
    monthlyContribution: 0,
    expectedReturnRate: 10,
    stepUpPercent: 0,
    priority: goals.length + 1,
  });
  renderGoalCategoryGrid();
  renderGoalsList();
  saveGoalsLocal();
  document.getElementById('goals-results')?.classList.add('hidden');
  const card = document.getElementById(`goal-card-${goalIdCounter}`);
  card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function removeGoal(id) {
  goals = goals.filter(g => g.id !== id);
  renderGoalCategoryGrid();
  renderGoalsList();
  saveGoalsLocal();
  document.getElementById('goals-results')?.classList.add('hidden');
}

const GOAL_NUMERIC_FIELDS = new Set([
  'targetAmountToday', 'targetYear', 'inflationRate', 'currentSavings',
  'monthlyContribution', 'expectedReturnRate', 'stepUpPercent', 'priority',
]);

function updateGoalField(id, field, value) {
  const g = goals.find(x => x.id === id);
  if (!g) return;
  g[field] = GOAL_NUMERIC_FIELDS.has(field)
    ? (parseFloat(String(value).replace(/[^0-9.\-]/g, '')) || 0)
    : value;
  saveGoalsLocal();
}

function setGoalRiskPreset(id, presetKey) {
  const preset = RISK_RETURN_PRESETS.find(p => p.key === presetKey);
  if (!preset) return;
  updateGoalField(id, 'expectedReturnRate', preset.rate);
  const input = document.getElementById(`goal-return-${id}`);
  if (input) input.value = preset.rate;
}

function formatGoalAmountInput(el) {
  const raw = parseFloat(el.value.replace(/[^0-9.]/g, '')) || 0;
  el.value = raw ? fmtInput(raw) : '';
}

// ===== GOALS UI (spec §4) =====
function openGoalsScreen() {
  ['upload-screen', 'dashboard-screen', 'planner-screen'].forEach(s =>
    document.getElementById(s)?.classList.add('hidden'));
  document.getElementById('goals-screen').classList.remove('hidden');
  initGoals();
  window.scrollTo({ top: 0 });
}

function initGoals() {
  if (!goals.length) loadGoalsLocal();
  renderGoalCategoryGrid();
  prefillGoalSurplus();
  renderGoalsList();

  const surplusEl = document.getElementById('goals-surplus');
  if (surplusEl && !surplusEl.dataset.wired) {
    surplusEl.dataset.wired = '1';
    attachFormattedInputHandlers('goals-surplus');
    surplusEl.addEventListener('input', saveGoalsLocal);
  }
}

function prefillGoalSurplus() {
  const el = document.getElementById('goals-surplus');
  const src = document.getElementById('goals-surplus-source');
  if (!el) return;
  if (!el.value && bankData && bankData.monthlyIncome > 0) {
    const surplus = Math.max(0, Math.round(bankData.monthlyIncome - bankData.monthlyExpenses - bankData.monthlyEMI));
    el.value = fmtInput(surplus);
    if (src) src.textContent = '· pre-filled from your bank statement';
  } else if (src && !el.value) {
    src.textContent = '';
  }
}

function renderGoalCategoryGrid() {
  const grid = document.getElementById('goal-category-grid');
  if (!grid) return;
  grid.innerHTML = GOAL_CATEGORIES.map((cat) => {
    const count = goals.filter(g => g.category === cat.key).length;
    return `
      <button class="goal-cat-card${count ? ' goal-cat-card--active' : ''}" onclick="addGoal('${cat.key}')">
        ${count ? `<span class="goal-cat-count">${count}</span>` : ''}
        <span class="goal-cat-icon">${cat.icon}</span>
        <span class="goal-cat-label">${cat.label}</span>
        <span class="goal-cat-add">+ Add</span>
      </button>`;
  }).join('');
}

function renderGoalsList() {
  const section = document.getElementById('goals-list-section');
  const list = document.getElementById('goals-list');
  if (!section || !list) return;

  if (!goals.length) {
    section.classList.add('hidden');
    list.innerHTML = '';
    return;
  }
  section.classList.remove('hidden');
  const showPriority = goals.length > 1;

  list.innerHTML = goals.map((g) => {
    const cat = goalCategory(g.category);
    return `
    <div class="goal-detail-card" id="goal-card-${g.id}">
      <div class="goal-detail-header">
        <span class="goal-detail-icon">${cat.icon}</span>
        <input type="text" class="goal-name-input" value="${escHtml(g.name)}" maxlength="60"
          oninput="updateGoalField(${g.id}, 'name', this.value)">
        <span class="goal-cat-chip">${cat.label}</span>
        ${showPriority ? `
          <label class="goal-priority-wrap" title="1 = funded first when surplus falls short">
            Priority
            <input type="number" class="goal-priority-input" min="1" max="${goals.length}" value="${g.priority}"
              oninput="updateGoalField(${g.id}, 'priority', this.value)">
          </label>` : ''}
        <button class="goal-remove-btn" onclick="removeGoal(${g.id})" title="Remove goal">✕</button>
      </div>
      <div class="goal-detail-grid">
        <div class="form-row">
          <label>Target Amount (today's ₹)</label>
          <input type="text" class="form-input" value="${g.targetAmountToday ? fmtInput(g.targetAmountToday) : ''}" placeholder="e.g. 25,00,000"
            oninput="updateGoalField(${g.id}, 'targetAmountToday', this.value)" onblur="formatGoalAmountInput(this)">
        </div>
        <div class="form-row">
          <label>Target Year</label>
          <input type="number" class="form-input" min="${new Date().getFullYear() + 1}" max="2100" value="${g.targetYear}"
            oninput="updateGoalField(${g.id}, 'targetYear', this.value)">
        </div>
        <div class="form-row">
          <label>Inflation (% p.a.)</label>
          <input type="number" class="form-input" min="0" max="20" step="0.5" value="${g.inflationRate}"
            oninput="updateGoalField(${g.id}, 'inflationRate', this.value)">
        </div>
        <div class="form-row">
          <label>Current Savings for this goal (₹)</label>
          <input type="text" class="form-input" value="${g.currentSavings ? fmtInput(g.currentSavings) : ''}" placeholder="0"
            oninput="updateGoalField(${g.id}, 'currentSavings', this.value)" onblur="formatGoalAmountInput(this)">
        </div>
        <div class="form-row">
          <label>Current Monthly SIP toward it (₹)</label>
          <input type="text" class="form-input" value="${g.monthlyContribution ? fmtInput(g.monthlyContribution) : ''}" placeholder="0"
            oninput="updateGoalField(${g.id}, 'monthlyContribution', this.value)" onblur="formatGoalAmountInput(this)">
        </div>
        <div class="form-row">
          <label>Expected Return (% p.a.)</label>
          <div class="goal-return-row">
            <input type="number" id="goal-return-${g.id}" class="form-input" min="0" max="30" step="0.5" value="${g.expectedReturnRate}"
              oninput="updateGoalField(${g.id}, 'expectedReturnRate', this.value)">
            <select class="goal-risk-select" onchange="setGoalRiskPreset(${g.id}, this.value)" title="Risk profile preset">
              <option value="">Preset…</option>
              ${RISK_RETURN_PRESETS.map(p => `<option value="${p.key}"${p.rate === g.expectedReturnRate ? ' selected' : ''}>${p.label} · ${p.rate}%</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <details class="goal-advanced"${g.stepUpPercent ? ' open' : ''}>
        <summary>Advanced — annual SIP step-up</summary>
        <div class="form-row goal-stepup-row">
          <label>Step-up (% increase in SIP per year)</label>
          <input type="number" class="form-input" min="0" max="25" step="1" value="${g.stepUpPercent}"
            oninput="updateGoalField(${g.id}, 'stepUpPercent', this.value)">
        </div>
      </details>
    </div>`;
  }).join('');
}

// ===== RESULTS (spec §4 step 3–4) =====
function calculateGoalPlan() {
  if (!goals.length) { showPlannerToast('Add at least one goal first.'); return; }
  const currentYear = new Date().getFullYear();

  for (const g of goals) {
    if (!g.targetAmountToday || g.targetAmountToday <= 0) {
      showPlannerToast(`"${g.name}" needs a target amount.`);
      document.getElementById(`goal-card-${g.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!g.targetYear || g.targetYear <= currentYear) {
      showPlannerToast(`"${g.name}" needs a target year after ${currentYear}.`);
      document.getElementById(`goal-card-${g.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  }

  const surplus = parseFormattedInput('goals-surplus') || 0;
  const plan = computeGoalPlan(surplus, currentYear);

  renderGoalSummary(plan);
  renderGoalResultCards(plan);
  renderGoalStackedChart(plan, currentYear);
  renderGoalTimeline(plan);
  renderGoalGrowthChart(plan, currentYear);

  const results = document.getElementById('goals-results');
  results.classList.remove('hidden');
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  saveGoalsLocal();
}

function fmtCompact(n) {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L';
  return fmt(n);
}

function renderGoalSummary(plan) {
  const el = document.getElementById('goals-summary-card');
  if (!el) return;
  const { totalRequired, surplus, hasSurplus, allFunded } = plan;
  const pctUsed = hasSurplus ? Math.min(100, (totalRequired / surplus) * 100) : 0;
  const over = hasSurplus && totalRequired > surplus;

  let verdict;
  if (!hasSurplus) {
    verdict = `<span class="goal-verdict goal-verdict--info">ℹ️ Enter your monthly surplus above to check affordability &amp; get rebalancing suggestions.</span>`;
  } else if (allFunded) {
    verdict = `<span class="goal-verdict goal-verdict--ok">✓ All goals fit — you have ${fmt(surplus - totalRequired)}/mo to spare.</span>`;
  } else {
    verdict = `<span class="goal-verdict goal-verdict--warn">⚠️ Required SIP exceeds your surplus by ${fmt(totalRequired - surplus)}/mo — see per-goal suggestions below.</span>`;
  }

  el.innerHTML = `
    <h2 class="card-title">Combined Plan Summary</h2>
    <div class="goal-summary-strip">
      <div class="goal-summary-stat">
        <div class="goal-summary-label">Total Required SIP</div>
        <div class="goal-summary-value" style="color:${over ? 'var(--expense)' : 'var(--accent)'}">${fmt(totalRequired)}<span class="goal-summary-unit">/mo</span></div>
      </div>
      <div class="goal-summary-stat">
        <div class="goal-summary-label">Available Surplus</div>
        <div class="goal-summary-value" style="color:var(--income)">${hasSurplus ? fmt(surplus) : '—'}<span class="goal-summary-unit">${hasSurplus ? '/mo' : ''}</span></div>
      </div>
      <div class="goal-summary-stat">
        <div class="goal-summary-label">Goals</div>
        <div class="goal-summary-value">${plan.computed.length}</div>
      </div>
    </div>
    ${hasSurplus ? `
    <div class="goal-progress-track">
      <div class="goal-progress-fill${over ? ' goal-progress-fill--over' : ''}" style="width:${pctUsed}%"></div>
    </div>
    <div class="goal-progress-caption">${fmt(totalRequired)} of ${fmt(surplus)} monthly surplus ${over ? 'needed (over budget)' : 'used'}</div>` : ''}
    <div class="goal-verdict-row">${verdict}</div>
  `;
}

function renderGoalResultCards(plan) {
  const wrap = document.getElementById('goals-result-cards');
  if (!wrap) return;

  wrap.innerHTML = plan.sorted.map((c) => {
    const cat = goalCategory(c.category);
    const idx = plan.computed.findIndex(g => g.id === c.id);
    const color = GOAL_COLORS[idx % GOAL_COLORS.length];

    let badge;
    if (!plan.hasSurplus) badge = '';
    else if (c.funded) badge = '<span class="badge-ok">✓ Fundable</span>';
    else if (c.allocated > 0) badge = '<span class="badge-warn">⚠️ Partially funded</span>';
    else badge = '<span class="badge-warn">⚠️ Unfunded</span>';

    const contribution = c.monthlyContribution || 0;
    const delta = c.requiredMonthly - contribution;
    const contribNote = contribution > 0
      ? (delta <= 0.5
          ? `<div class="goal-contrib-note goal-contrib-note--ok">Your current SIP of ${fmt(contribution)}/mo already covers this goal.</div>`
          : `<div class="goal-contrib-note">You currently invest ${fmt(contribution)}/mo — increase by ${fmt(delta)}/mo to stay on track.</div>`)
      : '';

    const suggestions = (c.suggestions && c.suggestions.length)
      ? `<div class="goal-suggestions">
           <div class="goal-suggestions-title">How to make it fit</div>
           ${c.suggestions.map(s => `<div class="goal-suggestion goal-suggestion--${s.type}">${s.text}</div>`).join('')}
         </div>`
      : '';

    return `
    <div class="card goal-result-card" style="border-top: 3px solid ${color}">
      <div class="goal-result-head">
        <span class="goal-detail-icon">${cat.icon}</span>
        <div class="goal-result-name">${escHtml(c.name)}</div>
        ${badge}
      </div>
      <div class="goal-result-sip">
        ${isFinite(c.requiredMonthly) ? fmt(c.requiredMonthly) : '—'}<span class="goal-summary-unit">/mo required</span>
      </div>
      <div class="goal-result-facts">
        <div><span>Target (today)</span><strong>${fmtCompact(c.targetAmountToday)}</strong></div>
        <div><span>Target in ${c.targetYear} (@ ${c.inflationRate}% infl.)</span><strong>${fmtCompact(c.fvGoal)}</strong></div>
        <div><span>Existing savings will grow to</span><strong>${fmtCompact(c.fvExisting)}</strong></div>
        <div><span>Gap to fund</span><strong>${fmtCompact(c.fvGap)}</strong></div>
        <div><span>Horizon</span><strong>${c.years} yr${c.years !== 1 ? 's' : ''} @ ${c.expectedReturnRate}% return${c.stepUpPercent ? ` · ${c.stepUpPercent}% step-up` : ''}</strong></div>
        ${plan.hasSurplus && !c.funded ? `<div><span>Allocated from surplus</span><strong>${fmt(c.allocated)}/mo</strong></div>` : ''}
      </div>
      ${contribNote}
      ${suggestions}
    </div>`;
  }).join('');
}

// Per-year SIP for a goal (step-up applied annually); yearOffset 0 = this year.
function goalSipInYear(c, yearOffset) {
  if (!isFinite(c.requiredMonthly)) return 0;
  if (yearOffset >= c.years) return 0;
  return c.requiredMonthly * Math.pow(1 + c.stepUpPercent / 100, yearOffset);
}

function renderGoalStackedChart(plan, currentYear) {
  const canvas = document.getElementById('goals-stacked-chart');
  if (!canvas) return;
  const maxYears = Math.max(...plan.computed.map(c => c.years));
  const labels = Array.from({ length: maxYears }, (_, i) => String(currentYear + i));

  const datasets = plan.computed.map((c, i) => ({
    label: c.name,
    data: labels.map((_, y) => Math.round(goalSipInYear(c, y))),
    backgroundColor: GOAL_COLORS[i % GOAL_COLORS.length],
    borderRadius: 3,
  }));

  if (goalStackedChart) goalStackedChart.destroy();
  goalStackedChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { color: 'rgba(46,50,71,.5)' }, ticks: { color: '#8b90a7' } },
        y: { stacked: true, grid: { color: 'rgba(46,50,71,.5)' }, ticks: { color: '#8b90a7', callback: v => fmtCompact(v) } },
      },
      plugins: {
        legend: { labels: { color: '#e8eaf0' } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}/mo` } },
      },
    },
  });
}

function renderGoalTimeline(plan) {
  const el = document.getElementById('goals-timeline');
  if (!el) return;
  const sorted = [...plan.computed].sort((a, b) => a.targetYear - b.targetYear);
  el.innerHTML = `<div class="goal-timeline">` + sorted.map((c) => {
    const idx = plan.computed.findIndex(g => g.id === c.id);
    const color = GOAL_COLORS[idx % GOAL_COLORS.length];
    const cat = goalCategory(c.category);
    const badge = !plan.hasSurplus ? ''
      : c.funded ? '<span class="badge-ok">✓ Fundable</span>'
      : '<span class="badge-warn">⚠️ Needs rebalancing</span>';
    return `
      <div class="goal-timeline-item">
        <div class="gt-year" style="color:${color}">${c.targetYear}</div>
        <div class="gt-line"><span class="gt-dot" style="background:${color}"></span></div>
        <div class="gt-body">
          <div class="gt-name">${cat.icon} ${escHtml(c.name)} ${badge}</div>
          <div class="gt-meta">${fmtCompact(c.fvGoal)} needed · ${c.years} yr${c.years !== 1 ? 's' : ''} away · SIP ${isFinite(c.requiredMonthly) ? fmt(c.requiredMonthly) : '—'}/mo</div>
        </div>
      </div>`;
  }).join('') + `</div>`;
}

function renderGoalGrowthChart(plan, currentYear) {
  const canvas = document.getElementById('goals-growth-chart');
  if (!canvas) return;
  const maxYears = Math.max(...plan.computed.map(c => c.years));
  const labels = Array.from({ length: maxYears + 1 }, (_, i) => String(currentYear + i));

  const datasets = plan.computed.map((c, i) => {
    const mr = c.expectedReturnRate / 100 / 12;
    const data = [Math.round(c.currentSavings)];
    let bal = c.currentSavings;
    let sip = isFinite(c.requiredMonthly) ? c.requiredMonthly : 0;
    for (let y = 0; y < c.years; y++) {
      for (let m = 0; m < 12; m++) bal = (bal + sip) * (1 + mr);
      sip *= 1 + c.stepUpPercent / 100;
      data.push(Math.round(bal));
    }
    return {
      label: c.name,
      data,
      borderColor: GOAL_COLORS[i % GOAL_COLORS.length],
      backgroundColor: GOAL_COLORS[i % GOAL_COLORS.length] + '22',
      tension: 0.3,
      pointRadius: 2,
      spanGaps: false,
    };
  });

  if (goalGrowthChart) goalGrowthChart.destroy();
  goalGrowthChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(46,50,71,.5)' }, ticks: { color: '#8b90a7' } },
        y: { grid: { color: 'rgba(46,50,71,.5)' }, ticks: { color: '#8b90a7', callback: v => fmtCompact(v) } },
      },
      plugins: {
        legend: { labels: { color: '#e8eaf0' } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } },
      },
    },
  });
}
