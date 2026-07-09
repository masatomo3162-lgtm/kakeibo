(() => {
  'use strict';

  const APP_VERSION = '2.2.0';
  const STORAGE_KEY = 'jun_kakeibo_expense_v210';
  const OLD_STORAGE_KEYS = [
    'jun_kakeibo_expense_v200',
    'jun_kakeibo_mvp_v100', 'jun_kakeibo_mvp_v050', 'jun_kakeibo_mvp_v041', 'jun_kakeibo_mvp_v040',
    'jun_kakeibo_mvp_v030', 'jun_kakeibo_mvp_v020', 'jun_kakeibo_mvp_v010'
  ];

  const paymentMethods = ['現金', 'カード', '電子マネー', '口座引き落とし', 'その他'];
  const phases = ['旧生活', '新生活'];
  const savingTypeLabels = { envelope: '目的別封筒貯金', bank: '目的別銀行貯金' };
  const goalTypeLabels = { experience: 'やりたいこと', wish: '欲しいもの', reserve: '備えるお金' };

  const defaultCategoryNames = [
    '食費', '外食', '日用品', '医療', '交通', '車', '通信費', '光熱費', '保険', '税金',
    'ウイスキー', 'ゲーム', '映画・サブスク', '旅行', '家電', '趣味', '交際費',
    'まいちゃん関連', 'ななちゃん関連', '教育費', '家族費', 'その他'
  ];

  const defaultStoreNames = [
    'トライアル', 'セブンイレブン', 'ローソン', 'セイコーマート', 'イオン', 'ツルハ',
    '楽天市場', 'Amazon', 'ガソリンスタンド', '病院・薬局', '公共料金', 'その他'
  ];

  const defaultPretendCategoryNames = [
    'ゲーム課金', 'コンビニ', '外食', 'お菓子・飲み物', 'ネット通販', 'サブスク', '趣味', 'タバコ', 'その他'
  ];

  const defaultDestinationNames = [
    'リフォーム資金', '太陽光・パワコン資金', 'NISA', '学資', '家族旅行', '車検代', '予備費', 'ウイスキー資金', 'その他'
  ];

  const achievementDefinitions = [
    { id: 'first_receipt', emoji: '🧾', title: 'レシート1枚目を捕獲', description: '支出を1件登録する。ここから生活ログ開始。', target: 1, current: (f) => f.totalEntries },
    { id: 'july_start', emoji: '🎋', title: '七月作戦、開始', description: '2026年7月分を1件登録する。正式運用のスタート地点。', target: 1, current: (f) => f.julyEntries },
    { id: 'three_days', emoji: '🔥', title: '三日坊主撃退', description: '対象月に3日分記録する。まずはここを超えたら勝ち。', target: 3, current: (f) => f.recordDays },
    { id: 'seven_days', emoji: '🗓️', title: '一週間の航海士', description: '対象月に7日分記録する。生活の海図が見えてくる。', target: 7, current: (f) => f.recordDays },
    { id: 'twenty_days', emoji: '🌕', title: '月の番人', description: '対象月に20日分記録する。月間支出の精度がかなり高い。', target: 20, current: (f) => f.recordDays },
    { id: 'ten_receipts', emoji: '📒', title: 'レシートハンター Lv.10', description: '合計10件登録する。もう試用では終わらない。', target: 10, current: (f) => f.totalEntries },
    { id: 'fifty_receipts', emoji: '🪄', title: '仕分けの魔法使い', description: '合計50件登録する。カテゴリ分けが身についてきた。', target: 50, current: (f) => f.totalEntries },
    { id: 'hundred_receipts', emoji: '👑', title: '家計簿の守護者', description: '合計100件登録する。家計の霧を晴らす番人。', target: 100, current: (f) => f.totalEntries },
    { id: 'streak_three', emoji: '⚡', title: '記録チェイン3', description: '3日連続で記録する。ゲームっぽく続ける最初の連鎖。', target: 3, current: (f) => f.bestStreak },
    { id: 'streak_seven', emoji: '🚀', title: '生活ログ・チェイン7', description: '7日連続で記録する。これはかなり強い継続力。', target: 7, current: (f) => f.bestStreak },
    { id: 'category_five', emoji: '🧭', title: '分類の地図職人', description: '対象月に5カテゴリ以上使う。支出の地形が見えてくる。', target: 5, current: (f) => f.categoryCount },
    { id: 'store_five', emoji: '🏪', title: 'お店マップ作成開始', description: '対象月に5店舗以上を記録する。どこで使ったか見えてくる。', target: 5, current: (f) => f.storeCount },
    { id: 'store_ten', emoji: '🛒', title: '買い物ルート解析班', description: '合計10店舗以上を登録する。生活圏の支出地図ができてくる。', target: 10, current: (f) => f.totalStoreCount },
    { id: 'method_three', emoji: '🗡️', title: '支払い三刀流', description: '現金・カード・電子マネーなど3種類以上を使う。', target: 3, current: (f) => f.methodCount },
    { id: 'memo_ten', emoji: '✍️', title: '未来の自分への伝言', description: 'メモ付き支出を10件登録する。後で見返す自分が助かる。', target: 10, current: (f) => f.memoEntries },
    { id: 'compare_ready', emoji: '⚖️', title: '比較の天秤を置いた', description: '比較できる2か月以上の支出を登録する。', target: 2, current: (f) => f.monthCount },
    { id: 'year_compare_ready', emoji: '📆', title: '前年比較の扉', description: '2年分以上の支出年がある。去年との比較準備OK。', target: 2, current: (f) => f.yearCount },
    { id: 'new_life_phase', emoji: '🏠', title: '新生活モード観測開始', description: '新生活の支出を1件登録する。変化の比較が始まる。', target: 1, current: (f) => f.newLifeEntries },
    { id: 'whisky_first', emoji: '🥃', title: '琥珀色の監査官', description: 'ウイスキーカテゴリで1件登録する。楽しみ費も見える化。', target: 1, current: (f) => f.whiskyEntries },
    { id: 'game_first', emoji: '🎮', title: '積みゲー管理局', description: 'ゲームカテゴリで1件登録する。趣味費も管理対象。', target: 1, current: (f) => f.gameEntries },
    { id: 'goal_first', emoji: '🚩', title: '目標の旗を立てた', description: '目標を1件登録する。支出記録が未来の予定とつながる。', target: 1, current: (f) => f.goalCount },
    { id: 'saving_first', emoji: '🏦', title: '目的別貯金、開封', description: '目的別貯金を1件登録する。封筒か銀行かは自由。', target: 1, current: (f) => f.savingCount },
    { id: 'linked_saving', emoji: '🔗', title: '目標と貯金が合体', description: '目標と貯金を1件連結する。進捗が自動で見える。', target: 1, current: (f) => f.linkedSavingCount },
    { id: 'goal_achieved', emoji: '🎉', title: '目標の宝箱を開けた', description: '目標を1件達成する。記録が行動につながった証拠。', target: 1, current: (f) => f.goalAchievedCount }
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  let state = loadState();
  let toastTimer = null;

  const els = {
    tabs: $$('.tab'), panels: $$('.panel'), toast: $('#toast'),
    expenseForm: $('#expenseForm'), editId: $('#editId'), dateInput: $('#dateInput'), amountInput: $('#amountInput'), categoryInput: $('#categoryInput'),
    storeInput: $('#storeInput'), paymentMethodInput: $('#paymentMethodInput'), phaseInput: $('#phaseInput'), memoInput: $('#memoInput'), newCategoryInput: $('#newCategoryInput'), newStoreInput: $('#newStoreInput'), saveButton: $('#saveButton'), clearButton: $('#clearButton'),
    monthTotalTop: $('#monthTotalTop'),
    leftTypeInput: $('#leftTypeInput'), rightTypeInput: $('#rightTypeInput'), leftMonthInput: $('#leftMonthInput'), rightMonthInput: $('#rightMonthInput'), leftYearInput: $('#leftYearInput'), rightYearInput: $('#rightYearInput'), leftPhaseInput: $('#leftPhaseInput'), rightPhaseInput: $('#rightPhaseInput'),
    leftTitle: $('#leftTitle'), rightTitle: $('#rightTitle'), leftTotal: $('#leftTotal'), rightTotal: $('#rightTotal'), leftStats: $('#leftStats'), rightStats: $('#rightStats'), diffLabel: $('#diffLabel'), diffTotal: $('#diffTotal'), diffComment: $('#diffComment'), categoryCompare: $('#categoryCompare'), methodCompare: $('#methodCompare'), storeCompare: $('#storeCompare'),
    historyMonthInput: $('#historyMonthInput'), historyCategoryFilter: $('#historyCategoryFilter'), historyStoreFilter: $('#historyStoreFilter'), historyMethodFilter: $('#historyMethodFilter'), historyTotal: $('#historyTotal'), historyCount: $('#historyCount'), expenseList: $('#expenseList'),
    goalForm: $('#goalForm'), goalIdInput: $('#goalIdInput'), goalTitleInput: $('#goalTitleInput'), goalTargetInput: $('#goalTargetInput'), goalManualInput: $('#goalManualInput'), goalDueInput: $('#goalDueInput'), goalTypeInput: $('#goalTypeInput'), goalMemoInput: $('#goalMemoInput'), goalSaveButton: $('#goalSaveButton'), goalClearButton: $('#goalClearButton'), goalList: $('#goalList'), goalsTargetTotal: $('#goalsTargetTotal'), goalsCurrentTotal: $('#goalsCurrentTotal'), goalsRemainingTotal: $('#goalsRemainingTotal'), goalsAchievedCount: $('#goalsAchievedCount'),
    savingForm: $('#savingForm'), savingIdInput: $('#savingIdInput'), savingNameInput: $('#savingNameInput'), savingTypeInput: $('#savingTypeInput'), savingBalanceInput: $('#savingBalanceInput'), savingTargetInput: $('#savingTargetInput'), savingGoalInput: $('#savingGoalInput'), savingMemoInput: $('#savingMemoInput'), savingSaveButton: $('#savingSaveButton'), savingClearButton: $('#savingClearButton'), savingList: $('#savingList'), envelopeSavingTotal: $('#envelopeSavingTotal'), bankSavingTotal: $('#bankSavingTotal'), savingTotal: $('#savingTotal'), linkedSavingCount: $('#linkedSavingCount'),
    achievementMonthInput: $('#achievementMonthInput'), achievementUnlockedCount: $('#achievementUnlockedCount'), achievementRecordDays: $('#achievementRecordDays'), achievementStreak: $('#achievementStreak'), achievementRank: $('#achievementRank'), nextAchievementList: $('#nextAchievementList'), achievementList: $('#achievementList'),
    exportBackupCsvButton: $('#exportBackupCsvButton'), importBackupCsvInput: $('#importBackupCsvInput'),
    categoryForm: $('#categoryForm'), categoryIdInput: $('#categoryIdInput'), categoryNameInput: $('#categoryNameInput'), categorySaveButton: $('#categorySaveButton'), categoryClearButton: $('#categoryClearButton'), categoryList: $('#categoryList'),
    storeForm: $('#storeForm'), storeIdInput: $('#storeIdInput'), storeNameInput: $('#storeNameInput'), storeSaveButton: $('#storeSaveButton'), storeClearButton: $('#storeClearButton'), storeList: $('#storeList'),
    resetAllButton: $('#resetAllButton'),
    pretendMonthTotalTop: $('#pretendMonthTotalTop'), pretendMonthTotal: $('#pretendMonthTotal'),
    pretendStatMonth: $('#pretendStatMonth'), pretendStatYear: $('#pretendStatYear'), pretendStatTotal: $('#pretendStatTotal'), pretendStatPace: $('#pretendStatPace'),
    pretendMessages: $('#pretendMessages'),
    pretendForm: $('#pretendForm'), pretendEditId: $('#pretendEditId'), pretendDateInput: $('#pretendDateInput'), pretendAmountInput: $('#pretendAmountInput'), pretendTitleInput: $('#pretendTitleInput'), pretendTitleSuggestions: $('#pretendTitleSuggestions'), pretendCategoryInput: $('#pretendCategoryInput'), pretendDestinationInput: $('#pretendDestinationInput'), pretendMemoInput: $('#pretendMemoInput'), pretendSaveButton: $('#pretendSaveButton'), pretendClearButton: $('#pretendClearButton'),
    pretendMonthChart: $('#pretendMonthChart'), pretendDestinationChart: $('#pretendDestinationChart'), pretendCategoryChart: $('#pretendCategoryChart'), pretendRanking: $('#pretendRanking'), pretendDestinationProgress: $('#pretendDestinationProgress'),
    pretendMonthFilter: $('#pretendMonthFilter'), pretendListTotal: $('#pretendListTotal'), pretendListCount: $('#pretendListCount'), pretendList: $('#pretendList'),
    pretendCategoryForm: $('#pretendCategoryForm'), pretendCategoryIdInput: $('#pretendCategoryIdInput'), pretendCategoryNameInput: $('#pretendCategoryNameInput'), pretendCategorySaveButton: $('#pretendCategorySaveButton'), pretendCategoryClearButton: $('#pretendCategoryClearButton'), pretendCategoryList: $('#pretendCategoryList'),
    destinationForm: $('#destinationForm'), destinationIdInput: $('#destinationIdInput'), destinationNameInput: $('#destinationNameInput'), destinationTargetInput: $('#destinationTargetInput'), destinationSaveButton: $('#destinationSaveButton'), destinationClearButton: $('#destinationClearButton'), destinationList: $('#destinationList'),
    pretendSampleButton: $('#pretendSampleButton'), pretendDeleteAllButton: $('#pretendDeleteAllButton')
  };

  init();

  function init() {
    ensureState();
    const today = new Date();
    const thisMonth = monthKey(today);
    els.dateInput.value = dateKey(today);
    els.historyMonthInput.value = thisMonth;
    els.achievementMonthInput.value = thisMonth;
    els.pretendDateInput.value = dateKey(today);
    els.pretendMonthFilter.value = '';
    setComparePreset('month');
    bindEvents();
    registerServiceWorker();
    renderAll();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Service Worker registration failed', error));
    }
  }

  function bindEvents() {
    els.tabs.forEach((tab) => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
    els.expenseForm.addEventListener('submit', handleExpenseSubmit);
    els.clearButton.addEventListener('click', resetExpenseForm);
    els.newCategoryInput.addEventListener('change', handleNewCategoryInline);
    els.newStoreInput.addEventListener('change', handleNewStoreInline);

    [els.leftTypeInput, els.rightTypeInput].forEach((input) => input.addEventListener('change', () => { renderCompareControls(); renderCompare(); }));
    [els.leftMonthInput, els.rightMonthInput, els.leftYearInput, els.rightYearInput, els.leftPhaseInput, els.rightPhaseInput].forEach((input) => input.addEventListener('change', renderCompare));
    $$('.quick-buttons [data-preset]').forEach((button) => button.addEventListener('click', () => setComparePreset(button.dataset.preset)));

    [els.historyMonthInput, els.historyCategoryFilter, els.historyStoreFilter, els.historyMethodFilter].forEach((input) => input.addEventListener('change', renderHistory));
    els.goalForm.addEventListener('submit', handleGoalSubmit);
    els.goalClearButton.addEventListener('click', resetGoalForm);
    els.savingForm.addEventListener('submit', handleSavingSubmit);
    els.savingClearButton.addEventListener('click', resetSavingForm);
    els.achievementMonthInput.addEventListener('change', renderAchievements);

    els.exportBackupCsvButton.addEventListener('click', () => downloadCsv('一括バックアップ', backupToRows(), `kakeibo-backup_${stamp()}.csv`));
    els.importBackupCsvInput.addEventListener('change', (e) => importCsvFile(e, importBackup));

    els.pretendForm.addEventListener('submit', handlePretendSubmit);
    els.pretendClearButton.addEventListener('click', () => resetPretendForm());
    els.pretendMonthFilter.addEventListener('change', renderPretendList);
    els.pretendCategoryForm.addEventListener('submit', handlePretendCategorySubmit);
    els.pretendCategoryClearButton.addEventListener('click', resetPretendCategoryForm);
    els.destinationForm.addEventListener('submit', handleDestinationSubmit);
    els.destinationClearButton.addEventListener('click', resetDestinationForm);
    els.pretendSampleButton.addEventListener('click', addPretendSampleData);
    els.pretendDeleteAllButton.addEventListener('click', deleteAllPretendData);

    els.categoryForm.addEventListener('submit', handleCategorySubmit);
    els.categoryClearButton.addEventListener('click', resetCategoryForm);
    els.storeForm.addEventListener('submit', handleStoreSubmit);
    els.storeClearButton.addEventListener('click', resetStoreForm);
    els.resetAllButton.addEventListener('click', resetAllData);
  }

  function loadState() {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return normalizeState(safeParse(current));
    for (const key of OLD_STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = safeParse(raw);
      if (parsed) return migrateOldState(parsed);
    }
    return createFallbackState();
  }

  function createFallbackState() {
    return {
      version: APP_VERSION,
      categories: defaultCategoryNames.map((name, index) => ({ id: createId('cat'), name, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() })),
      stores: defaultStoreNames.map((name, index) => ({ id: createId('store'), name, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() })),
      expenses: [], goals: [], savings: [], achievementsSeen: [],
      pretendSavings: [],
      pretendCategories: defaultPretendCategoryNames.map((name, index) => ({ id: createId('pcat'), name, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() })),
      destinations: defaultDestinationNames.map((name, index) => ({ id: createId('dest'), name, targetAmount: 0, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() }))
    };
  }

  function migrateOldState(parsed) {
    const fallback = createFallbackState();
    const categoryNames = unique([...defaultCategoryNames, ...(Array.isArray(parsed.categories) ? parsed.categories.map((cat) => cat.name || cat.category || cat) : [])].map((name) => String(name || '').trim()).filter(Boolean));
    const storeNames = unique([...defaultStoreNames, ...(Array.isArray(parsed.stores) ? parsed.stores.map((store) => store.name || store.store || store) : [])].map((name) => String(name || '').trim()).filter(Boolean));
    const categories = categoryNames.map((name, index) => ({ id: createId('cat'), name, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() }));
    const stores = storeNames.map((name, index) => ({ id: createId('store'), name, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() }));
    const expenses = (Array.isArray(parsed.expenses) ? parsed.expenses : Array.isArray(parsed.transactions) ? parsed.transactions : []).map((item) => normalizeExpense(item, categories, stores)).filter(Boolean);
    const goals = (Array.isArray(parsed.goals) ? parsed.goals : []).map(normalizeGoal).filter(Boolean);
    const savings = (Array.isArray(parsed.savings) ? parsed.savings : []).map((item) => normalizeSaving(item, goals)).filter(Boolean);
    return normalizeState({ ...fallback, categories, stores, expenses, goals, savings, achievementsSeen: Array.isArray(parsed.achievementsSeen) ? parsed.achievementsSeen : [] });
  }

  function normalizeState(raw) {
    const fallback = createFallbackState();
    const categories = Array.isArray(raw?.categories) ? raw.categories.map(normalizeCategory).filter(Boolean) : fallback.categories;
    const stores = Array.isArray(raw?.stores) ? raw.stores.map(normalizeStore).filter(Boolean) : fallback.stores;
    const finalCategories = mergeByName(categories, fallback.categories);
    const finalStores = mergeByName(stores, fallback.stores);
    const goals = Array.isArray(raw?.goals) ? raw.goals.map(normalizeGoal).filter(Boolean) : [];
    const savings = Array.isArray(raw?.savings) ? raw.savings.map((item) => normalizeSaving(item, goals)).filter(Boolean) : [];
    const expenses = Array.isArray(raw?.expenses) ? raw.expenses.map((item) => normalizeExpense(item, finalCategories, finalStores)).filter(Boolean) : [];
    const pretendCategories = mergeByName(Array.isArray(raw?.pretendCategories) ? raw.pretendCategories.map(normalizeCategory).filter(Boolean) : [], fallback.pretendCategories);
    const destinations = mergeDestinations(Array.isArray(raw?.destinations) ? raw.destinations.map(normalizeDestination).filter(Boolean) : [], fallback.destinations);
    const pretendSavings = Array.isArray(raw?.pretendSavings) ? raw.pretendSavings.map(normalizePretend).filter(Boolean) : [];
    pretendSavings.forEach((item) => {
      if (item.categoryName) findOrCreateNamedInList(pretendCategories, item.categoryName, 'pcat');
      if (item.destinationName && !destinations.some((dest) => dest.name === item.destinationName)) destinations.push({ id: createId('dest'), name: item.destinationName, targetAmount: 0, sortOrder: destinations.length, createdAt: nowIso(), updatedAt: nowIso() });
    });
    return { version: APP_VERSION, categories: finalCategories, stores: finalStores, expenses, goals, savings, achievementsSeen: Array.isArray(raw?.achievementsSeen) ? raw.achievementsSeen.map(normalizeAchievementSeen).filter(Boolean) : [], pretendSavings, pretendCategories, destinations };
  }

  function ensureState() { state = normalizeState(state); saveState(); }
  function saveState() { state.version = APP_VERSION; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  function switchTab(tabName) {
    els.tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === tabName));
    els.panels.forEach((panel) => panel.classList.toggle('is-active', panel.id === `tab-${tabName}`));
    if (tabName === 'compare') renderCompare();
    if (tabName === 'achievements') renderAchievements();
  }

  function renderAll() {
    renderCategorySelects(); renderStoreSelects(); renderTopTotal(); renderCompareControls(); renderCompare();
    renderHistoryFilters(); renderHistory(); renderGoalSelects(); renderGoals(); renderSavings();
    renderCategories(); renderStores(); renderAchievements();
    renderPretendSelects(); renderPretendStats(); renderPretendCharts(); renderPretendList(); renderPretendCategories(); renderDestinations();
    saveState();
  }

  function handleExpenseSubmit(event) {
    event.preventDefault();
    const amount = Number(els.amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) return showToast('金額を入力してください。');
    const category = getCategory(els.categoryInput.value) || state.categories[0];
    const store = getStore(els.storeInput.value) || state.stores[0];
    const phase = normalizePhase(els.phaseInput.value);
    const payload = {
      date: els.dateInput.value,
      amount: Math.round(amount),
      categoryId: category.id, categoryName: category.name,
      storeId: store.id, storeName: store.name,
      paymentMethod: normalizePaymentMethod(els.paymentMethodInput.value),
      phase,
      memo: els.memoInput.value.trim(),
      updatedAt: nowIso()
    };
    if (!payload.date) return showToast('日付を入力してください。');
    const editId = els.editId.value;
    if (editId) {
      const existing = state.expenses.find((item) => item.id === editId);
      if (!existing) return showToast('編集対象が見つかりません。');
      Object.assign(existing, payload);
      showToast('支出を更新しました。');
    } else {
      state.expenses.push({ id: createId('exp'), ...payload, createdAt: nowIso() });
      showToast('支出を保存しました。');
    }
    resetExpenseForm({ keepDate: true, keepCategory: true, keepStore: true, keepPhase: true });
    renderAll();
  }

  function resetExpenseForm(options = {}) {
    const keepDate = els.dateInput.value;
    const keepCategory = els.categoryInput.value;
    const keepStore = els.storeInput.value;
    const keepPhase = els.phaseInput.value;
    els.expenseForm.reset();
    els.editId.value = '';
    els.saveButton.textContent = '保存';
    els.dateInput.value = options.keepDate ? keepDate : dateKey(new Date());
    if (options.keepCategory && getCategory(keepCategory)) els.categoryInput.value = keepCategory;
    if (options.keepStore && getStore(keepStore)) els.storeInput.value = keepStore;
    if (options.keepPhase && phases.includes(keepPhase)) els.phaseInput.value = keepPhase;
  }

  function editExpense(id) {
    const item = state.expenses.find((expense) => expense.id === id);
    if (!item) return;
    els.editId.value = item.id; els.dateInput.value = item.date; els.amountInput.value = item.amount;
    els.categoryInput.value = item.categoryId; els.storeInput.value = item.storeId; els.paymentMethodInput.value = item.paymentMethod;
    els.phaseInput.value = normalizePhase(item.phase); els.memoInput.value = item.memo || '';
    els.saveButton.textContent = '更新';
    switchTab('input'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteExpense(id) {
    if (!confirm('この支出を削除しますか？')) return;
    state.expenses = state.expenses.filter((item) => item.id !== id);
    renderAll(); showToast('支出を削除しました。');
  }

  function handleNewCategoryInline() {
    const name = els.newCategoryInput.value.trim();
    if (!name) return;
    const category = addCategoryIfMissing(name);
    els.newCategoryInput.value = '';
    renderCategorySelects(); els.categoryInput.value = category.id; renderCategories();
    showToast(`カテゴリ「${category.name}」を追加しました。`);
  }

  function handleNewStoreInline() {
    const name = els.newStoreInput.value.trim();
    if (!name) return;
    const store = addStoreIfMissing(name);
    els.newStoreInput.value = '';
    renderStoreSelects(); els.storeInput.value = store.id; renderStores();
    showToast(`お店「${store.name}」を追加しました。`);
  }

  function renderCategorySelects() { els.categoryInput.innerHTML = state.categories.map((cat) => `<option value="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</option>`).join(''); }
  function renderStoreSelects() { els.storeInput.innerHTML = state.stores.map((store) => `<option value="${escapeHtml(store.id)}">${escapeHtml(store.name)}</option>`).join(''); }

  function renderTopTotal() {
    const thisMonth = monthKey(new Date());
    const total = sum(filterByMonth(state.expenses, thisMonth).map((item) => item.amount));
    els.monthTotalTop.textContent = formatYen(total);
    const pretendTotal = sum(filterByMonth(state.pretendSavings, thisMonth).map((item) => item.amount));
    els.pretendMonthTotalTop.textContent = formatYen(pretendTotal);
  }

  function setComparePreset(type) {
    const today = new Date();
    if (type === 'month') {
      els.leftTypeInput.value = 'month'; els.rightTypeInput.value = 'month';
      els.leftMonthInput.value = monthKey(addMonths(today, -1)); els.rightMonthInput.value = monthKey(today);
    } else if (type === 'year') {
      els.leftTypeInput.value = 'year'; els.rightTypeInput.value = 'year';
      els.leftYearInput.value = String(today.getFullYear() - 1); els.rightYearInput.value = String(today.getFullYear());
    } else if (type === 'phase') {
      els.leftTypeInput.value = 'phase'; els.rightTypeInput.value = 'phase';
      els.leftPhaseInput.value = '旧生活'; els.rightPhaseInput.value = '新生活';
    }
    renderCompareControls(); renderCompare();
  }

  function renderCompareControls() {
    ['left', 'right'].forEach((side) => {
      const type = els[`${side}TypeInput`].value;
      $$(`.${side}-field`).forEach((field) => field.classList.add('is-hidden'));
      $$(`.${side}-field.${type}-field`).forEach((field) => field.classList.remove('is-hidden'));
    });
  }

  function renderCompare() {
    const left = getCompareResult('left'); const right = getCompareResult('right');
    renderCompareCard('left', left); renderCompareCard('right', right);
    const diff = right.total - left.total;
    els.diffLabel.textContent = `${right.title} − ${left.title}`;
    els.diffTotal.textContent = formatSignedYen(diff);
    els.diffTotal.className = diff > 0 ? 'negative' : diff < 0 ? 'positive' : '';
    els.diffComment.textContent = diff > 0 ? `右側の方が ${formatYen(diff)} 多いです。カテゴリとお店を下で確認。` : diff < 0 ? `右側の方が ${formatYen(Math.abs(diff))} 少ないです。この差を維持できるか確認。` : '支出額は同じです。内訳の違いを確認しましょう。';
    renderCompareTable(els.categoryCompare, left, right, 'categoryName');
    renderCompareTable(els.methodCompare, left, right, 'paymentMethod');
    renderCompareTable(els.storeCompare, left, right, 'storeName');
  }

  function getCompareResult(side) {
    const type = els[`${side}TypeInput`].value;
    let title = ''; let items = [];
    if (type === 'month') {
      const month = els[`${side}MonthInput`].value || monthKey(new Date());
      title = formatMonthLabel(month); items = filterByMonth(state.expenses, month);
    } else if (type === 'year') {
      const year = Number(els[`${side}YearInput`].value) || new Date().getFullYear();
      title = `${year}年`; items = state.expenses.filter((item) => item.date.startsWith(`${year}-`));
    } else {
      const phase = normalizePhase(els[`${side}PhaseInput`].value);
      title = phase; items = state.expenses.filter((item) => normalizePhase(item.phase) === phase);
    }
    return buildSummary(title, type, items);
  }

  function buildSummary(title, type, items) {
    const total = sum(items.map((item) => item.amount));
    const count = items.length;
    const months = unique(items.map((item) => monthKey(item.date))).length || (type === 'month' ? 1 : 0);
    const days = unique(items.map((item) => item.date)).length;
    const avgPerEntry = count ? Math.round(total / count) : 0;
    const monthAvg = months ? Math.round(total / months) : 0;
    const dailyAvg = days ? Math.round(total / days) : 0;
    const storeCount = unique(items.map((item) => item.storeName)).length;
    return { title, type, items, total, count, months, days, avgPerEntry, monthAvg, dailyAvg, storeCount };
  }

  function renderCompareCard(side, result) {
    els[`${side}Title`].textContent = result.title;
    els[`${side}Total`].textContent = formatYen(result.total);
    els[`${side}Stats`].innerHTML = [
      ['件数', `${result.count}件`], ['記録日数', `${result.days}日`], ['月平均', formatYen(result.monthAvg || result.total)],
      ['1日平均', formatYen(result.dailyAvg)], ['平均単価', formatYen(result.avgPerEntry)], ['店舗数', `${result.storeCount}件`]
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  }

  function renderCompareTable(target, left, right, key) {
    const leftMap = groupSum(left.items, key); const rightMap = groupSum(right.items, key);
    const labels = unique([...Object.keys(leftMap), ...Object.keys(rightMap)]).sort((a, b) => (rightMap[b] || 0) - (rightMap[a] || 0));
    if (!labels.length) { target.innerHTML = '<p class="hint">比較できるデータがありません。</p>'; return; }
    target.innerHTML = `<table><thead><tr><th>項目</th><th>${escapeHtml(left.title)}</th><th>${escapeHtml(right.title)}</th><th>差額</th></tr></thead><tbody>${labels.map((label) => {
      const l = leftMap[label] || 0; const r = rightMap[label] || 0; const d = r - l;
      return `<tr><td>${escapeHtml(label)}</td><td>${formatYen(l)}</td><td>${formatYen(r)}</td><td class="${d > 0 ? 'negative' : d < 0 ? 'positive' : ''}">${formatSignedYen(d)}</td></tr>`;
    }).join('')}</tbody></table>`;
  }

  function renderHistoryFilters() {
    els.historyCategoryFilter.innerHTML = '<option value="">すべて</option>' + state.categories.map((cat) => `<option value="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</option>`).join('');
    els.historyStoreFilter.innerHTML = '<option value="">すべて</option>' + state.stores.map((store) => `<option value="${escapeHtml(store.id)}">${escapeHtml(store.name)}</option>`).join('');
    els.historyMethodFilter.innerHTML = '<option value="">すべて</option>' + paymentMethods.map((method) => `<option value="${escapeHtml(method)}">${escapeHtml(method)}</option>`).join('');
  }

  function renderHistory() {
    const month = els.historyMonthInput.value; const categoryId = els.historyCategoryFilter.value; const storeId = els.historyStoreFilter.value; const method = els.historyMethodFilter.value;
    const list = state.expenses.filter((item) => !month || monthKey(item.date) === month).filter((item) => !categoryId || item.categoryId === categoryId).filter((item) => !storeId || item.storeId === storeId).filter((item) => !method || item.paymentMethod === method).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    const total = sum(list.map((item) => item.amount));
    els.historyTotal.textContent = formatYen(total); els.historyCount.textContent = `${list.length}件`;
    els.expenseList.innerHTML = list.length ? list.map((item) => `<article class="transaction-item"><div class="item-main"><strong>${escapeHtml(item.categoryName)} ${formatYen(item.amount)}</strong><div class="meta">${escapeHtml(item.date)} / ${escapeHtml(item.paymentMethod)} / ${escapeHtml(item.storeName || 'その他')} / ${escapeHtml(normalizePhase(item.phase))}${item.memo ? ` / ${escapeHtml(item.memo)}` : ''}</div></div><div class="item-actions"><button type="button" class="icon-button" data-edit-expense="${escapeHtml(item.id)}">編集</button><button type="button" class="icon-button" data-delete-expense="${escapeHtml(item.id)}">削除</button></div></article>`).join('') : '<p class="hint">この条件の履歴はありません。</p>';
    $$('[data-edit-expense]').forEach((button) => button.addEventListener('click', () => editExpense(button.dataset.editExpense)));
    $$('[data-delete-expense]').forEach((button) => button.addEventListener('click', () => deleteExpense(button.dataset.deleteExpense)));
  }

  function handleGoalSubmit(event) {
    event.preventDefault();
    const title = els.goalTitleInput.value.trim(); const targetAmount = Number(els.goalTargetInput.value); const manualAmount = Number(els.goalManualInput.value || 0);
    if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) return showToast('目標名と目標金額を入力してください。');
    const payload = { title, targetAmount: Math.round(targetAmount), manualAmount: Number.isFinite(manualAmount) && manualAmount > 0 ? Math.round(manualAmount) : 0, dueDate: els.goalDueInput.value, type: ['experience', 'wish', 'reserve'].includes(els.goalTypeInput.value) ? els.goalTypeInput.value : 'experience', memo: els.goalMemoInput.value.trim(), updatedAt: nowIso() };
    const id = els.goalIdInput.value;
    if (id) { const goal = state.goals.find((item) => item.id === id); if (!goal) return showToast('編集対象が見つかりません。'); Object.assign(goal, payload); showToast('目標を更新しました。'); }
    else { state.goals.push({ id: createId('goal'), ...payload, createdAt: nowIso() }); showToast('目標を保存しました。'); }
    resetGoalForm(); renderAll();
  }

  function renderGoalSelects() { els.savingGoalInput.innerHTML = '<option value="">連結しない</option>' + state.goals.map((goal) => `<option value="${escapeHtml(goal.id)}">${escapeHtml(goal.title)}</option>`).join(''); }

  function renderGoals() {
    const withProgress = state.goals.map((goal) => ({ ...goal, progress: getGoalProgress(goal.id) }));
    const targetTotal = sum(withProgress.map((goal) => goal.targetAmount)); const currentTotal = sum(withProgress.map((goal) => goal.progress.currentAmount)); const remainingTotal = Math.max(0, targetTotal - currentTotal); const achievedCount = withProgress.filter((goal) => goal.progress.currentAmount >= goal.targetAmount).length;
    els.goalsTargetTotal.textContent = formatYen(targetTotal); els.goalsCurrentTotal.textContent = formatYen(currentTotal); els.goalsRemainingTotal.textContent = formatYen(remainingTotal); els.goalsAchievedCount.textContent = `${achievedCount}件`;
    els.goalList.innerHTML = withProgress.length ? withProgress.map(renderGoalItem).join('') : '<p class="hint">目標はまだありません。</p>';
    $$('[data-edit-goal]').forEach((button) => button.addEventListener('click', () => editGoal(button.dataset.editGoal)));
    $$('[data-delete-goal]').forEach((button) => button.addEventListener('click', () => deleteGoal(button.dataset.deleteGoal)));
  }

  function renderGoalItem(goal) {
    const current = goal.progress.currentAmount; const remaining = Math.max(0, goal.targetAmount - current); const percent = goal.targetAmount ? Math.min(100, Math.round(current / goal.targetAmount * 100)) : 0;
    return `<article class="goal-item"><div class="item-main"><strong>${escapeHtml(goal.title)}</strong><div class="meta">${escapeHtml(goalTypeLabels[goal.type] || goal.type)} / 目標 ${formatYen(goal.targetAmount)} / 現在 ${formatYen(current)} / 残り ${formatYen(remaining)}${goal.dueDate ? ` / ${escapeHtml(goal.dueDate)}まで` : ''}</div><div class="progress"><span style="width:${percent}%"></span></div>${goal.memo ? `<p>${escapeHtml(goal.memo)}</p>` : ''}</div><div class="item-actions"><button type="button" class="icon-button" data-edit-goal="${escapeHtml(goal.id)}">編集</button><button type="button" class="icon-button" data-delete-goal="${escapeHtml(goal.id)}">削除</button></div></article>`;
  }

  function editGoal(id) { const goal = state.goals.find((item) => item.id === id); if (!goal) return; els.goalIdInput.value = goal.id; els.goalTitleInput.value = goal.title; els.goalTargetInput.value = goal.targetAmount; els.goalManualInput.value = goal.manualAmount || 0; els.goalDueInput.value = goal.dueDate || ''; els.goalTypeInput.value = goal.type; els.goalMemoInput.value = goal.memo || ''; els.goalSaveButton.textContent = '目標を更新'; switchTab('goals'); }
  function deleteGoal(id) { if (!confirm('この目標を削除しますか？')) return; state.goals = state.goals.filter((item) => item.id !== id); state.savings.forEach((saving) => { if (saving.goalId === id) saving.goalId = ''; }); renderAll(); showToast('目標を削除しました。'); }
  function resetGoalForm() { els.goalForm.reset(); els.goalIdInput.value = ''; els.goalManualInput.value = '0'; els.goalSaveButton.textContent = '目標を保存'; }

  function handleSavingSubmit(event) {
    event.preventDefault();
    const name = els.savingNameInput.value.trim(); const balance = Number(els.savingBalanceInput.value); const targetAmount = Number(els.savingTargetInput.value || 0);
    if (!name || !Number.isFinite(balance) || balance < 0) return showToast('名称と残高を入力してください。');
    const payload = { name, type: ['envelope', 'bank'].includes(els.savingTypeInput.value) ? els.savingTypeInput.value : 'envelope', balance: Math.round(balance), targetAmount: Number.isFinite(targetAmount) && targetAmount > 0 ? Math.round(targetAmount) : 0, goalId: state.goals.some((goal) => goal.id === els.savingGoalInput.value) ? els.savingGoalInput.value : '', memo: els.savingMemoInput.value.trim(), updatedAt: nowIso() };
    const id = els.savingIdInput.value;
    if (id) { const saving = state.savings.find((item) => item.id === id); if (!saving) return showToast('編集対象が見つかりません。'); Object.assign(saving, payload); showToast('貯金を更新しました。'); }
    else { state.savings.push({ id: createId('save'), ...payload, createdAt: nowIso() }); showToast('貯金を保存しました。'); }
    resetSavingForm(); renderAll();
  }

  function renderSavings() {
    const envelopeTotal = sum(state.savings.filter((item) => item.type === 'envelope').map((item) => item.balance)); const bankTotal = sum(state.savings.filter((item) => item.type === 'bank').map((item) => item.balance)); const linkedCount = state.savings.filter((item) => item.goalId).length;
    els.envelopeSavingTotal.textContent = formatYen(envelopeTotal); els.bankSavingTotal.textContent = formatYen(bankTotal); els.savingTotal.textContent = formatYen(envelopeTotal + bankTotal); els.linkedSavingCount.textContent = `${linkedCount}件`;
    els.savingList.innerHTML = state.savings.length ? state.savings.map(renderSavingItem).join('') : '<p class="hint">目的別貯金はまだありません。</p>';
    $$('[data-edit-saving]').forEach((button) => button.addEventListener('click', () => editSaving(button.dataset.editSaving)));
    $$('[data-delete-saving]').forEach((button) => button.addEventListener('click', () => deleteSaving(button.dataset.deleteSaving)));
  }

  function renderSavingItem(saving) {
    const goal = state.goals.find((item) => item.id === saving.goalId); const target = saving.targetAmount || goal?.targetAmount || 0; const percent = target ? Math.min(100, Math.round(saving.balance / target * 100)) : 0;
    return `<article class="saving-item"><div class="item-main"><strong>${escapeHtml(saving.name)}</strong><div class="meta">${escapeHtml(savingTypeLabels[saving.type] || saving.type)} / 残高 ${formatYen(saving.balance)}${target ? ` / 目安 ${formatYen(target)}` : ''}${goal ? ` / 目標：${escapeHtml(goal.title)}` : ''}</div>${target ? `<div class="progress"><span style="width:${percent}%"></span></div>` : ''}${saving.memo ? `<p>${escapeHtml(saving.memo)}</p>` : ''}</div><div class="item-actions"><button type="button" class="icon-button" data-edit-saving="${escapeHtml(saving.id)}">編集</button><button type="button" class="icon-button" data-delete-saving="${escapeHtml(saving.id)}">削除</button></div></article>`;
  }

  function editSaving(id) { const saving = state.savings.find((item) => item.id === id); if (!saving) return; els.savingIdInput.value = saving.id; els.savingNameInput.value = saving.name; els.savingTypeInput.value = saving.type; els.savingBalanceInput.value = saving.balance; els.savingTargetInput.value = saving.targetAmount || 0; els.savingGoalInput.value = saving.goalId || ''; els.savingMemoInput.value = saving.memo || ''; els.savingSaveButton.textContent = '貯金を更新'; switchTab('savings'); }
  function deleteSaving(id) { if (!confirm('この貯金項目を削除しますか？')) return; state.savings = state.savings.filter((item) => item.id !== id); renderAll(); showToast('貯金を削除しました。'); }
  function resetSavingForm() { els.savingForm.reset(); els.savingIdInput.value = ''; els.savingBalanceInput.value = '0'; els.savingTargetInput.value = '0'; els.savingSaveButton.textContent = '貯金を保存'; }

  function getGoalProgress(goalId) { const goal = state.goals.find((item) => item.id === goalId); const linkedSavings = state.savings.filter((item) => item.goalId === goalId); const linkedAmount = sum(linkedSavings.map((item) => item.balance)); return { currentAmount: (goal?.manualAmount || 0) + linkedAmount, linkedSavings, linkedAmount }; }

  function handlePretendSubmit(event) {
    event.preventDefault();
    const amount = Number(els.pretendAmountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) return showToast('金額を入力してください。');
    const title = els.pretendTitleInput.value.trim();
    if (!title) return showToast('やめた支出名を入力してください。');
    if (!els.pretendDateInput.value) return showToast('日付を入力してください。');
    const payload = {
      date: els.pretendDateInput.value,
      title,
      amount: Math.round(amount),
      categoryName: els.pretendCategoryInput.value || '',
      destinationName: els.pretendDestinationInput.value || '',
      memo: els.pretendMemoInput.value.trim(),
      updatedAt: nowIso()
    };
    const editId = els.pretendEditId.value;
    if (editId) {
      const existing = state.pretendSavings.find((item) => item.id === editId);
      if (!existing) return showToast('編集対象が見つかりません。');
      Object.assign(existing, payload);
      showToast('使ったつもり貯金を更新しました。');
    } else {
      state.pretendSavings.push({ id: createId('pretend'), ...payload, createdAt: nowIso() });
      showToast(`${formatYen(payload.amount)}を未来に回しました。`);
    }
    resetPretendForm({ keepDate: true, keepCategory: true, keepDestination: true });
    renderAll();
  }

  function resetPretendForm(options = {}) {
    const keepDate = els.pretendDateInput.value;
    const keepCategory = els.pretendCategoryInput.value;
    const keepDestination = els.pretendDestinationInput.value;
    els.pretendForm.reset();
    els.pretendEditId.value = '';
    els.pretendSaveButton.textContent = '保存';
    els.pretendDateInput.value = options.keepDate && keepDate ? keepDate : dateKey(new Date());
    if (options.keepCategory) els.pretendCategoryInput.value = keepCategory;
    if (options.keepDestination) els.pretendDestinationInput.value = keepDestination;
  }

  function editPretend(id) {
    const item = state.pretendSavings.find((entry) => entry.id === id);
    if (!item) return;
    els.pretendEditId.value = item.id; els.pretendDateInput.value = item.date; els.pretendTitleInput.value = item.title; els.pretendAmountInput.value = item.amount;
    els.pretendCategoryInput.value = item.categoryName || ''; els.pretendDestinationInput.value = item.destinationName || ''; els.pretendMemoInput.value = item.memo || '';
    els.pretendSaveButton.textContent = '更新';
    switchTab('pretend'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deletePretend(id) {
    if (!confirm('この使ったつもり貯金を削除しますか？')) return;
    state.pretendSavings = state.pretendSavings.filter((item) => item.id !== id);
    renderAll(); showToast('削除しました。');
  }

  function renderPretendSelects() {
    els.pretendCategoryInput.innerHTML = '<option value="">未分類</option>' + state.pretendCategories.map((cat) => `<option value="${escapeHtml(cat.name)}">${escapeHtml(cat.name)}</option>`).join('');
    els.pretendDestinationInput.innerHTML = '<option value="">未定</option>' + state.destinations.map((dest) => `<option value="${escapeHtml(dest.name)}">${escapeHtml(dest.name)}</option>`).join('');
    const titles = unique(state.pretendSavings.map((item) => item.title));
    els.pretendTitleSuggestions.innerHTML = titles.map((title) => `<option value="${escapeHtml(title)}"></option>`).join('');
  }

  function renderPretendStats() {
    const today = new Date();
    const thisMonth = monthKey(today);
    const thisYear = String(today.getFullYear());
    const monthTotal = sum(filterByMonth(state.pretendSavings, thisMonth).map((item) => item.amount));
    const yearItems = state.pretendSavings.filter((item) => item.date.startsWith(`${thisYear}-`));
    const yearTotal = sum(yearItems.map((item) => item.amount));
    const grandTotal = sum(state.pretendSavings.map((item) => item.amount));
    const dayOfYear = Math.max(1, Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000));
    const pace = yearTotal > 0 ? Math.round(yearTotal / dayOfYear * 365) : 0;
    els.pretendMonthTotal.textContent = formatYen(monthTotal);
    els.pretendStatMonth.textContent = formatYen(monthTotal);
    els.pretendStatYear.textContent = formatYen(yearTotal);
    els.pretendStatTotal.textContent = formatYen(grandTotal);
    els.pretendStatPace.textContent = pace ? `約${formatYen(pace)}` : '¥0';
    renderPretendMessages({ monthTotal, yearTotal, grandTotal, pace });
  }

  function renderPretendMessages({ monthTotal, grandTotal, pace }) {
    const lines = [];
    if (monthTotal > 0) lines.push(`今月、${formatYen(monthTotal)}を未来に回しました。`);
    if (pace > 0) lines.push(`このペースなら、年間 約${formatYen(pace)} を守れます。`);
    const destTotals = groupPretendSum('destinationName');
    state.destinations.filter((dest) => dest.targetAmount > 0).slice(0, 3).forEach((dest) => {
      const current = destTotals[dest.name] || 0;
      if (current >= dest.targetAmount) lines.push(`「${dest.name}」の目標を達成しました！`);
      else if (current > 0) lines.push(`「${dest.name}」まであと${formatYen(dest.targetAmount - current)}。`);
    });
    if (grandTotal > 0 && lines.length < 4) lines.push(`累計 ${formatYen(grandTotal)} が未来に回っています。`);
    els.pretendMessages.innerHTML = lines.length
      ? lines.map((line) => `<p class="pretend-message">🌱 ${escapeHtml(line)}</p>`).join('')
      : '<p class="hint">今日の踏みとどまりを1件記録すると、ここに成果が表示されます。</p>';
  }

  function groupPretendSum(key) {
    return state.pretendSavings.reduce((map, item) => {
      const label = item[key] || (key === 'destinationName' ? '未定' : '未分類');
      map[label] = (map[label] || 0) + Number(item.amount || 0);
      return map;
    }, {});
  }

  function renderPretendCharts() {
    const byMonth = state.pretendSavings.reduce((map, item) => { const key = monthKey(item.date); map[key] = (map[key] || 0) + item.amount; return map; }, {});
    const months = Object.keys(byMonth).sort().slice(-12);
    renderBarChart(els.pretendMonthChart, months.map((month) => [formatMonthLabel(month), byMonth[month]]), 'まだ記録がありません。');
    const destEntries = Object.entries(groupPretendSum('destinationName')).sort((a, b) => b[1] - a[1]);
    renderBarChart(els.pretendDestinationChart, destEntries, '回した先の記録がありません。');
    const catEntries = Object.entries(groupPretendSum('categoryName')).sort((a, b) => b[1] - a[1]);
    renderBarChart(els.pretendCategoryChart, catEntries, 'カテゴリの記録がありません。');
    renderPretendRanking();
    renderDestinationProgress();
  }

  function renderBarChart(target, entries, emptyText) {
    if (!entries.length) { target.innerHTML = `<p class="hint">${escapeHtml(emptyText)}</p>`; return; }
    const max = Math.max(...entries.map(([, value]) => value), 1);
    target.innerHTML = entries.map(([label, value]) => {
      const percent = Math.max(2, Math.round(value / max * 100));
      return `<div class="bar-row"><span class="bar-label">${escapeHtml(label)}</span><div class="bar-track"><span class="bar-fill" style="width:${percent}%"></span></div><span class="bar-value">${formatYen(value)}</span></div>`;
    }).join('');
  }

  function renderPretendRanking() {
    const byTitle = state.pretendSavings.reduce((map, item) => { const entry = map[item.title] || { count: 0, total: 0 }; entry.count += 1; entry.total += item.amount; map[item.title] = entry; return map; }, {});
    const ranked = Object.entries(byTitle).sort((a, b) => b[1].count - a[1].count || b[1].total - a[1].total).slice(0, 10);
    els.pretendRanking.innerHTML = ranked.length
      ? ranked.map(([title, info], index) => `<div class="ranking-item"><span class="ranking-rank">${index + 1}位</span><strong>${escapeHtml(title)}</strong><span class="meta">${info.count}回 / ${formatYen(info.total)}</span></div>`).join('')
      : '<p class="hint">まだ記録がありません。</p>';
  }

  function renderDestinationProgress() {
    const destTotals = groupPretendSum('destinationName');
    const withTarget = state.destinations.filter((dest) => dest.targetAmount > 0);
    els.pretendDestinationProgress.innerHTML = withTarget.length
      ? withTarget.map((dest) => {
        const current = destTotals[dest.name] || 0;
        const percent = Math.min(100, Math.round(current / dest.targetAmount * 100));
        return `<article class="goal-item"><div class="item-main"><strong>${escapeHtml(dest.name)}</strong><div class="meta">${formatYen(current)} / ${formatYen(dest.targetAmount)}　${percent}%達成</div><div class="progress"><span style="width:${percent}%"></span></div></div></article>`;
      }).join('')
      : '<p class="hint">目標金額が設定された回した先はありません。</p>';
  }

  function renderPretendList() {
    const month = els.pretendMonthFilter.value;
    const list = state.pretendSavings
      .filter((item) => !month || monthKey(item.date) === month)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    els.pretendListTotal.textContent = formatYen(sum(list.map((item) => item.amount)));
    els.pretendListCount.textContent = `${list.length}件`;
    els.pretendList.innerHTML = list.length
      ? list.map((item) => `<article class="transaction-item"><div class="item-main"><strong>${escapeHtml(item.title)} ${formatYen(item.amount)}</strong><div class="meta">${escapeHtml(item.date)} / ${escapeHtml(item.categoryName || '未分類')} / 回した先：${escapeHtml(item.destinationName || '未定')}${item.memo ? ` / ${escapeHtml(item.memo)}` : ''}</div></div><div class="item-actions"><button type="button" class="icon-button" data-edit-pretend="${escapeHtml(item.id)}">編集</button><button type="button" class="icon-button" data-delete-pretend="${escapeHtml(item.id)}">削除</button></div></article>`).join('')
      : '<p class="hint">この条件の記録はありません。</p>';
    $$('[data-edit-pretend]').forEach((button) => button.addEventListener('click', () => editPretend(button.dataset.editPretend)));
    $$('[data-delete-pretend]').forEach((button) => button.addEventListener('click', () => deletePretend(button.dataset.deletePretend)));
  }

  function handlePretendCategorySubmit(event) {
    event.preventDefault();
    const name = els.pretendCategoryNameInput.value.trim();
    if (!name) return showToast('カテゴリ名を入力してください。');
    const id = els.pretendCategoryIdInput.value;
    if (id) {
      const category = state.pretendCategories.find((item) => item.id === id);
      if (!category) return showToast('編集対象が見つかりません。');
      if (state.pretendCategories.some((item) => item.name === name && item.id !== id)) return showToast('同じカテゴリ名があります。');
      const oldName = category.name;
      category.name = name; category.updatedAt = nowIso();
      state.pretendSavings.forEach((item) => { if (item.categoryName === oldName) item.categoryName = name; });
      showToast('カテゴリを更新しました。');
    } else {
      if (state.pretendCategories.some((item) => item.name === name)) return showToast('同じカテゴリ名があります。');
      state.pretendCategories.push({ id: createId('pcat'), name, sortOrder: state.pretendCategories.length, createdAt: nowIso(), updatedAt: nowIso() });
      showToast('カテゴリを追加しました。');
    }
    resetPretendCategoryForm(); renderAll();
  }

  function renderPretendCategories() {
    els.pretendCategoryList.innerHTML = state.pretendCategories.map((cat) => `<div class="category-chip"><strong>${escapeHtml(cat.name)}</strong><div class="item-actions"><button type="button" class="icon-button" data-edit-pcat="${escapeHtml(cat.id)}">編集</button><button type="button" class="icon-button" data-delete-pcat="${escapeHtml(cat.id)}">削除</button></div></div>`).join('');
    $$('[data-edit-pcat]').forEach((button) => button.addEventListener('click', () => editPretendCategory(button.dataset.editPcat)));
    $$('[data-delete-pcat]').forEach((button) => button.addEventListener('click', () => deletePretendCategory(button.dataset.deletePcat)));
  }

  function editPretendCategory(id) { const category = state.pretendCategories.find((item) => item.id === id); if (!category) return; els.pretendCategoryIdInput.value = category.id; els.pretendCategoryNameInput.value = category.name; els.pretendCategorySaveButton.textContent = 'カテゴリを更新'; }
  function deletePretendCategory(id) { const category = state.pretendCategories.find((item) => item.id === id); if (!category) return; if (state.pretendSavings.some((item) => item.categoryName === category.name)) return showToast('使用中のカテゴリは削除できません。先に記録を編集してください。'); if (!confirm(`カテゴリ「${category.name}」を削除しますか？`)) return; state.pretendCategories = state.pretendCategories.filter((item) => item.id !== id); renderAll(); showToast('カテゴリを削除しました。'); }
  function resetPretendCategoryForm() { els.pretendCategoryForm.reset(); els.pretendCategoryIdInput.value = ''; els.pretendCategorySaveButton.textContent = 'カテゴリを保存'; }

  function handleDestinationSubmit(event) {
    event.preventDefault();
    const name = els.destinationNameInput.value.trim();
    if (!name) return showToast('回した先の名前を入力してください。');
    const targetAmount = Number(els.destinationTargetInput.value || 0);
    const target = Number.isFinite(targetAmount) && targetAmount > 0 ? Math.round(targetAmount) : 0;
    const id = els.destinationIdInput.value;
    if (id) {
      const destination = state.destinations.find((item) => item.id === id);
      if (!destination) return showToast('編集対象が見つかりません。');
      if (state.destinations.some((item) => item.name === name && item.id !== id)) return showToast('同じ回した先があります。');
      const oldName = destination.name;
      destination.name = name; destination.targetAmount = target; destination.updatedAt = nowIso();
      state.pretendSavings.forEach((item) => { if (item.destinationName === oldName) item.destinationName = name; });
      showToast('回した先を更新しました。');
    } else {
      if (state.destinations.some((item) => item.name === name)) return showToast('同じ回した先があります。');
      state.destinations.push({ id: createId('dest'), name, targetAmount: target, sortOrder: state.destinations.length, createdAt: nowIso(), updatedAt: nowIso() });
      showToast('回した先を追加しました。');
    }
    resetDestinationForm(); renderAll();
  }

  function renderDestinations() {
    els.destinationList.innerHTML = state.destinations.map((dest) => `<div class="category-chip"><strong>${escapeHtml(dest.name)}</strong><span class="meta">${dest.targetAmount > 0 ? `目標 ${formatYen(dest.targetAmount)}` : '目標なし'}</span><div class="item-actions"><button type="button" class="icon-button" data-edit-dest="${escapeHtml(dest.id)}">編集</button><button type="button" class="icon-button" data-delete-dest="${escapeHtml(dest.id)}">削除</button></div></div>`).join('');
    $$('[data-edit-dest]').forEach((button) => button.addEventListener('click', () => editDestination(button.dataset.editDest)));
    $$('[data-delete-dest]').forEach((button) => button.addEventListener('click', () => deleteDestination(button.dataset.deleteDest)));
  }

  function editDestination(id) { const destination = state.destinations.find((item) => item.id === id); if (!destination) return; els.destinationIdInput.value = destination.id; els.destinationNameInput.value = destination.name; els.destinationTargetInput.value = destination.targetAmount || 0; els.destinationSaveButton.textContent = '回した先を更新'; }
  function deleteDestination(id) { const destination = state.destinations.find((item) => item.id === id); if (!destination) return; if (state.pretendSavings.some((item) => item.destinationName === destination.name)) return showToast('使用中の回した先は削除できません。先に記録を編集してください。'); if (!confirm(`回した先「${destination.name}」を削除しますか？`)) return; state.destinations = state.destinations.filter((item) => item.id !== id); renderAll(); showToast('回した先を削除しました。'); }
  function resetDestinationForm() { els.destinationForm.reset(); els.destinationIdInput.value = ''; els.destinationTargetInput.value = '0'; els.destinationSaveButton.textContent = '回した先を保存'; }

  function addPretendSampleData() {
    const today = dateKey(new Date());
    const samples = [
      { title: 'ホワサバ課金', amount: 150, categoryName: 'ゲーム課金', destinationName: 'リフォーム資金', memo: '少額だけど今月は我慢' },
      { title: 'コンビニお菓子', amount: 300, categoryName: 'コンビニ', destinationName: 'NISA', memo: '家にあるもので済ませた' },
      { title: 'タバコを吸ったつもり', amount: 500, categoryName: 'タバコ', destinationName: '車検代', memo: '吸ったつもり貯金' }
    ];
    samples.forEach((sample) => state.pretendSavings.push({ id: createId('pretend'), date: today, ...sample, createdAt: nowIso(), updatedAt: nowIso() }));
    renderAll(); showToast('サンプルデータを3件追加しました。');
  }

  function deleteAllPretendData() {
    if (!state.pretendSavings.length) return showToast('削除する記録がありません。');
    if (!confirm(`使ったつもり貯金の記録${state.pretendSavings.length}件をすべて削除しますか？\nカテゴリ・回した先の設定は残ります。`)) return;
    state.pretendSavings = [];
    renderAll(); showToast('使ったつもり貯金の記録を全削除しました。');
  }

  function renderAchievements() {
    const facts = buildAchievementFacts(els.achievementMonthInput.value || monthKey(new Date())); const newlyUnlocked = [];
    achievementDefinitions.forEach((def) => { const current = Number(def.current(facts) || 0); const already = state.achievementsSeen.some((item) => item.id === def.id); if (!already && current >= def.target) { state.achievementsSeen.push({ id: def.id, achievedAt: nowIso() }); newlyUnlocked.push(def.title); } });
    if (newlyUnlocked.length) saveState();
    const unlockedIds = new Set(state.achievementsSeen.map((item) => item.id)); const unlockedCount = achievementDefinitions.filter((def) => unlockedIds.has(def.id)).length;
    els.achievementUnlockedCount.textContent = `${unlockedCount}/${achievementDefinitions.length}`; els.achievementRecordDays.textContent = `${facts.recordDays}日`; els.achievementStreak.textContent = `${facts.bestStreak}日`; els.achievementRank.textContent = rankForUnlocked(unlockedCount);
    const items = achievementDefinitions.map((def) => { const current = Math.min(Number(def.current(facts) || 0), def.target); const unlocked = unlockedIds.has(def.id) || current >= def.target; return { def, current, unlocked }; });
    els.nextAchievementList.innerHTML = items.filter((item) => !item.unlocked).sort((a, b) => (b.current / b.def.target) - (a.current / a.def.target)).slice(0, 5).map(renderAchievementItem).join('') || '<p class="hint">すべて解除済みです。すごい。</p>';
    els.achievementList.innerHTML = items.map(renderAchievementItem).join('');
  }

  function renderAchievementItem(item) { const ratio = Math.min(100, Math.round(item.current / item.def.target * 100)); return `<article class="achievement-item ${item.unlocked ? 'unlocked' : ''}"><div class="achievement-emoji">${item.unlocked ? '✅' : item.def.emoji}</div><div><div class="achievement-title">${escapeHtml(item.def.title)}</div><div class="meta">${escapeHtml(item.def.description)}</div><div class="achievement-progress">${item.current}/${item.def.target}</div><div class="progress"><span style="width:${ratio}%"></span></div></div></article>`; }

  function buildAchievementFacts(month) {
    const monthItems = filterByMonth(state.expenses, month); const totalEntries = state.expenses.length; const dates = unique(state.expenses.map((item) => item.date)).sort();
    return { totalEntries, julyEntries: state.expenses.filter((item) => monthKey(item.date) === '2026-07').length, recordDays: unique(monthItems.map((item) => item.date)).length, bestStreak: calcBestStreak(dates), categoryCount: unique(monthItems.map((item) => item.categoryName)).length, storeCount: unique(monthItems.map((item) => item.storeName)).length, totalStoreCount: unique(state.expenses.map((item) => item.storeName)).length, methodCount: unique(monthItems.map((item) => item.paymentMethod)).length, memoEntries: state.expenses.filter((item) => item.memo).length, monthCount: unique(state.expenses.map((item) => monthKey(item.date))).length, yearCount: unique(state.expenses.map((item) => item.date.slice(0, 4))).length, newLifeEntries: state.expenses.filter((item) => normalizePhase(item.phase) === '新生活').length, whiskyEntries: state.expenses.filter((item) => item.categoryName.includes('ウイスキー')).length, gameEntries: state.expenses.filter((item) => item.categoryName.includes('ゲーム')).length, goalCount: state.goals.length, savingCount: state.savings.length, linkedSavingCount: state.savings.filter((item) => item.goalId).length, goalAchievedCount: state.goals.filter((goal) => getGoalProgress(goal.id).currentAmount >= goal.targetAmount).length };
  }

  function handleCategorySubmit(event) {
    event.preventDefault(); const name = els.categoryNameInput.value.trim(); if (!name) return showToast('カテゴリ名を入力してください。'); const id = els.categoryIdInput.value;
    if (id) { const category = state.categories.find((item) => item.id === id); if (!category) return showToast('編集対象が見つかりません。'); if (state.categories.some((item) => item.name === name && item.id !== id)) return showToast('同じカテゴリ名があります。'); const oldName = category.name; category.name = name; category.updatedAt = nowIso(); state.expenses.forEach((expense) => { if (expense.categoryId === id || expense.categoryName === oldName) { expense.categoryId = id; expense.categoryName = name; } }); showToast('カテゴリを更新しました。'); }
    else { addCategoryIfMissing(name); showToast('カテゴリを追加しました。'); }
    resetCategoryForm(); renderAll();
  }
  function renderCategories() { els.categoryList.innerHTML = state.categories.map((cat) => `<div class="category-chip"><strong>${escapeHtml(cat.name)}</strong><div class="item-actions"><button type="button" class="icon-button" data-edit-category="${escapeHtml(cat.id)}">編集</button><button type="button" class="icon-button" data-delete-category="${escapeHtml(cat.id)}">削除</button></div></div>`).join(''); $$('[data-edit-category]').forEach((button) => button.addEventListener('click', () => editCategory(button.dataset.editCategory))); $$('[data-delete-category]').forEach((button) => button.addEventListener('click', () => deleteCategory(button.dataset.deleteCategory))); }
  function editCategory(id) { const category = state.categories.find((item) => item.id === id); if (!category) return; els.categoryIdInput.value = category.id; els.categoryNameInput.value = category.name; els.categorySaveButton.textContent = 'カテゴリを更新'; }
  function deleteCategory(id) { if (state.categories.length <= 1) return showToast('カテゴリは最低1つ必要です。'); const category = getCategory(id); if (!category) return; if (state.expenses.some((expense) => expense.categoryId === id)) return showToast('使用中のカテゴリは削除できません。先に履歴を編集してください。'); if (!confirm(`カテゴリ「${category.name}」を削除しますか？`)) return; state.categories = state.categories.filter((item) => item.id !== id); renderAll(); showToast('カテゴリを削除しました。'); }
  function resetCategoryForm() { els.categoryForm.reset(); els.categoryIdInput.value = ''; els.categorySaveButton.textContent = 'カテゴリを保存'; }

  function handleStoreSubmit(event) {
    event.preventDefault(); const name = els.storeNameInput.value.trim(); if (!name) return showToast('お店名を入力してください。'); const id = els.storeIdInput.value;
    if (id) { const store = state.stores.find((item) => item.id === id); if (!store) return showToast('編集対象が見つかりません。'); if (state.stores.some((item) => item.name === name && item.id !== id)) return showToast('同じお店名があります。'); const oldName = store.name; store.name = name; store.updatedAt = nowIso(); state.expenses.forEach((expense) => { if (expense.storeId === id || expense.storeName === oldName) { expense.storeId = id; expense.storeName = name; } }); showToast('お店を更新しました。'); }
    else { addStoreIfMissing(name); showToast('お店を追加しました。'); }
    resetStoreForm(); renderAll();
  }
  function renderStores() { els.storeList.innerHTML = state.stores.map((store) => `<div class="category-chip"><strong>${escapeHtml(store.name)}</strong><div class="item-actions"><button type="button" class="icon-button" data-edit-store="${escapeHtml(store.id)}">編集</button><button type="button" class="icon-button" data-delete-store="${escapeHtml(store.id)}">削除</button></div></div>`).join(''); $$('[data-edit-store]').forEach((button) => button.addEventListener('click', () => editStore(button.dataset.editStore))); $$('[data-delete-store]').forEach((button) => button.addEventListener('click', () => deleteStore(button.dataset.deleteStore))); }
  function editStore(id) { const store = state.stores.find((item) => item.id === id); if (!store) return; els.storeIdInput.value = store.id; els.storeNameInput.value = store.name; els.storeSaveButton.textContent = 'お店を更新'; }
  function deleteStore(id) { if (state.stores.length <= 1) return showToast('お店は最低1つ必要です。'); const store = getStore(id); if (!store) return; if (state.expenses.some((expense) => expense.storeId === id)) return showToast('使用中のお店は削除できません。先に履歴を編集してください。'); if (!confirm(`お店「${store.name}」を削除しますか？`)) return; state.stores = state.stores.filter((item) => item.id !== id); renderAll(); showToast('お店を削除しました。'); }
  function resetStoreForm() { els.storeForm.reset(); els.storeIdInput.value = ''; els.storeSaveButton.textContent = 'お店を保存'; }

  function importBackup(rows) {
    const objects = rowsToObjects(rows); if (!objects.length) return showToast('読み込めるデータがありません。');
    if (!('section' in objects[0])) { importExpenses(rows); return; }
    const importedCategories = objects.filter((obj) => obj.section === 'category').map(normalizeCategory).filter(Boolean);
    state.categories = mergeByName(state.categories, importedCategories);
    const importedStores = objects.filter((obj) => obj.section === 'store').map(normalizeStore).filter(Boolean);
    state.stores = mergeByName(state.stores, importedStores);
    const importedGoals = objects.filter((obj) => obj.section === 'goal').map(normalizeGoal).filter(Boolean);
    mergeByIdOrSignature(state.goals, importedGoals, (goal) => `${goal.title}|${goal.targetAmount}|${goal.dueDate}`);
    const importedSavings = objects.filter((obj) => obj.section === 'saving').map((obj) => normalizeSaving(obj, state.goals)).filter(Boolean);
    mergeByIdOrSignature(state.savings, importedSavings, (saving) => `${saving.name}|${saving.type}`);
    const importedExpenses = objects.filter((obj) => obj.section === 'expense').map((obj) => normalizeExpense(obj, state.categories, state.stores)).filter(Boolean);
    mergeByIdOrSignature(state.expenses, importedExpenses, expenseSignature);
    const importedPretendCategories = objects.filter((obj) => obj.section === 'pretend_category').map(normalizeCategory).filter(Boolean);
    state.pretendCategories = mergeByName(state.pretendCategories, importedPretendCategories);
    const importedDestinations = objects.filter((obj) => obj.section === 'destination').map(normalizeDestination).filter(Boolean);
    state.destinations = mergeDestinations(importedDestinations, state.destinations);
    const importedPretend = objects.filter((obj) => obj.section === 'pretend_saving' || obj.type === 'pretend_saving').map(normalizePretend).filter(Boolean);
    mergeByIdOrSignature(state.pretendSavings, importedPretend, pretendSignature);
    state = normalizeState(state);
    renderAll(); showToast(`一括CSVを読み込みました。支出${importedExpenses.length}件・目標${importedGoals.length}件・貯金${importedSavings.length}件・つもり貯金${importedPretend.length}件`);
  }

  function importExpenses(rows) { const imported = rowsToObjects(rows).map((obj) => normalizeExpense(obj, state.categories, state.stores)).filter(Boolean); mergeByIdOrSignature(state.expenses, imported, expenseSignature); renderAll(); showToast(`支出CSVから${imported.length}件読み込みました。`); }

  function importCsvFile(event, handler) {
    const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader();
    reader.onload = () => { try { const text = decodeText(reader.result); const rows = parseCsv(text); handler(rows); } catch (error) { console.error(error); showToast('CSVの読み込みに失敗しました。'); } finally { event.target.value = ''; } };
    reader.readAsArrayBuffer(file);
  }

  function backupToRows() {
    const header = ['section', 'id', 'date', 'amount', 'category', 'payment_method', 'store', 'phase', 'title', 'target_amount', 'manual_amount', 'due_date', 'type', 'balance', 'linked_goal_title', 'linked_goal_id', 'memo', 'created_at', 'updated_at', 'destination'];
    const rows = [header];
    state.expenses.forEach((item) => rows.push(['expense', item.id, item.date, item.amount, item.categoryName, item.paymentMethod, item.storeName, normalizePhase(item.phase), '', '', '', '', '', '', '', '', item.memo || '', item.createdAt, item.updatedAt, '']));
    state.goals.forEach((item) => rows.push(['goal', item.id, '', '', '', '', '', '', item.title, item.targetAmount, item.manualAmount || 0, item.dueDate || '', item.type, '', '', '', item.memo || '', item.createdAt, item.updatedAt, '']));
    state.savings.forEach((item) => rows.push(['saving', item.id, '', '', '', '', '', '', item.name, item.targetAmount || 0, '', '', item.type, item.balance, getGoal(item.goalId)?.title || '', item.goalId || '', item.memo || '', item.createdAt, item.updatedAt, '']));
    state.categories.forEach((item) => rows.push(['category', item.id, '', '', item.name, '', '', '', '', '', '', '', '', '', '', '', '', item.createdAt, item.updatedAt, '']));
    state.stores.forEach((item) => rows.push(['store', item.id, '', '', '', '', item.name, '', '', '', '', '', '', '', '', '', '', item.createdAt, item.updatedAt, '']));
    state.pretendSavings.forEach((item) => rows.push(['pretend_saving', item.id, item.date, item.amount, item.categoryName || '', '', '', '', item.title, '', '', '', 'pretend_saving', '', '', '', item.memo || '', item.createdAt, item.updatedAt, item.destinationName || '']));
    state.pretendCategories.forEach((item) => rows.push(['pretend_category', item.id, '', '', item.name, '', '', '', '', '', '', '', '', '', '', '', '', item.createdAt, item.updatedAt, '']));
    state.destinations.forEach((item) => rows.push(['destination', item.id, '', '', '', '', '', '', item.name, item.targetAmount || 0, '', '', '', '', '', '', '', item.createdAt, item.updatedAt, '']));
    return rows;
  }

  function expensesToRows(items) { return [['id', 'date', 'amount', 'category', 'payment_method', 'store', 'phase', 'memo', 'created_at', 'updated_at'], ...items.map((item) => [item.id, item.date, item.amount, item.categoryName, item.paymentMethod, item.storeName, normalizePhase(item.phase), item.memo, item.createdAt, item.updatedAt])]; }

  function resetAllData() {
    if (!confirm('全データを初期化しますか？\nCSVを書き出していないデータは戻せません。')) return;
    localStorage.removeItem(STORAGE_KEY); state = createFallbackState(); const today = new Date(); const thisMonth = monthKey(today);
    els.dateInput.value = dateKey(today); els.historyMonthInput.value = thisMonth; els.achievementMonthInput.value = thisMonth; resetExpenseForm(); resetGoalForm(); resetSavingForm(); resetCategoryForm(); resetStoreForm(); resetPretendForm(); resetPretendCategoryForm(); resetDestinationForm(); els.pretendMonthFilter.value = ''; setComparePreset('month'); renderAll(); showToast('初期化しました。');
  }

  function normalizeExpense(item, categories, stores) {
    const date = String(item.date || item['日付'] || '').slice(0, 10); const amount = parseAmount(item.amount ?? item['金額']); if (!date || !Number.isFinite(amount) || amount <= 0) return null;
    const categoryName = String(item.category || item.categoryName || item.category_name || item['カテゴリ'] || 'その他').trim() || 'その他'; const category = findOrCreateNamedInList(categories, categoryName, 'cat');
    const storeName = String(item.store || item.storeName || item.store_name || item.shop || item.shop_name || item['お店'] || item['店舗'] || item['支払先'] || guessStoreFromMemo(item.memo || item['メモ']) || 'その他').trim() || 'その他'; const store = findOrCreateNamedInList(stores, storeName, 'store');
    const guessedMethod = guessMethodFromOldItem(item); let method = item.paymentMethod || item.payment_method || item['支払方法'] || item.method || '';
    if (guessedMethod === 'カード' || guessedMethod === '口座引き落とし') method = guessedMethod; if (!method) method = guessedMethod;
    return { id: item.id || createId('exp'), date, amount: Math.round(amount), categoryId: category.id, categoryName: category.name, storeId: store.id, storeName: store.name, paymentMethod: normalizePaymentMethod(method), phase: normalizePhase(item.phase || item['生活フェーズ']), memo: String(item.memo || item['メモ'] || '').trim(), createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() };
  }

  function normalizeGoal(item) { const title = String(item?.title || item?.name || item?.['タイトル'] || '').trim(); const targetAmount = parseAmount(item?.targetAmount ?? item?.target_amount ?? item?.target ?? item?.['目標金額']); if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) return null; const manualAmount = parseAmount(item?.manualAmount ?? item?.manual_amount ?? item?.currentAmount ?? item?.current_amount ?? item?.savedAmount ?? item?.['手入力済み額'] ?? 0); const type = ['experience', 'wish', 'reserve'].includes(item?.type) ? item.type : normalizeGoalType(item?.type || item?.['種類']); return { id: item.id || createId('goal'), title, targetAmount: Math.round(targetAmount), manualAmount: Number.isFinite(manualAmount) && manualAmount > 0 ? Math.round(manualAmount) : 0, dueDate: String(item.dueDate || item.due_date || item['目標時期'] || '').slice(0, 10), type, memo: String(item.memo || item['メモ'] || '').trim(), createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() }; }
  function normalizeSaving(item, goals) { const name = String(item?.name || item?.title || item?.['名称'] || '').trim(); const balance = parseAmount(item?.balance ?? item?.['残高']); if (!name || !Number.isFinite(balance) || balance < 0) return null; const typeText = String(item.type || item['種類'] || '').toLowerCase(); const type = typeText.includes('bank') || typeText.includes('銀行') ? 'bank' : 'envelope'; const targetAmount = parseAmount(item.targetAmount ?? item.target_amount ?? item['目安・上限額'] ?? 0); const goalById = goals.find((goal) => goal.id === item.goalId || goal.id === item.linked_goal_id); const goalByTitle = goals.find((goal) => goal.title === item.linked_goal_title || goal.title === item['連結する目標']); return { id: item.id || createId('save'), name, type, balance: Math.round(balance), targetAmount: Number.isFinite(targetAmount) && targetAmount > 0 ? Math.round(targetAmount) : 0, goalId: goalById?.id || goalByTitle?.id || '', memo: String(item.memo || item['メモ'] || '').trim(), createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() }; }
  function normalizePretend(item) {
    const date = String(item?.date || item?.['日付'] || '').slice(0, 10);
    const amount = parseAmount(item?.amount ?? item?.['金額']);
    const title = String(item?.title || item?.['やめた支出名'] || item?.name || '').trim();
    if (!date || !title || !Number.isFinite(amount) || amount <= 0) return null;
    return {
      id: item.id || createId('pretend'),
      date, title, amount: Math.round(amount),
      categoryName: String(item.categoryName || item.category || item['カテゴリ'] || '').trim(),
      destinationName: String(item.destinationName || item.destination || item['回した先'] || '').trim(),
      memo: String(item.memo || item['メモ'] || '').trim(),
      createdAt: item.createdAt || item.created_at || nowIso(),
      updatedAt: item.updatedAt || item.updated_at || nowIso()
    };
  }
  function normalizeDestination(raw) {
    const name = String(raw?.name || raw?.title || raw?.destination || raw?.['回した先'] || raw || '').trim();
    if (!name) return null;
    const targetAmount = parseAmount(raw?.targetAmount ?? raw?.target_amount ?? raw?.['目標金額'] ?? 0);
    return { id: raw?.id || createId('dest'), name, targetAmount: Number.isFinite(targetAmount) && targetAmount > 0 ? Math.round(targetAmount) : 0, sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 999), createdAt: raw?.createdAt || raw?.created_at || nowIso(), updatedAt: raw?.updatedAt || raw?.updated_at || nowIso() };
  }
  function mergeDestinations(primary, secondary) {
    const byName = new Map();
    [...primary, ...secondary].forEach((item, index) => {
      const norm = normalizeDestination(item);
      if (!norm?.name) return;
      if (!byName.has(norm.name)) byName.set(norm.name, { ...norm, sortOrder: Number.isFinite(Number(norm.sortOrder)) && Number(norm.sortOrder) !== 999 ? Number(norm.sortOrder) : index });
      else if (norm.targetAmount > 0 && !byName.get(norm.name).targetAmount) byName.get(norm.name).targetAmount = norm.targetAmount;
    });
    return [...byName.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ja'));
  }
  function pretendSignature(item) { return `${item.date}|${item.title}|${item.amount}|${item.destinationName}|${item.memo}`; }

  function normalizeCategory(raw) { const name = String(raw?.name || raw?.category || raw || '').trim(); if (!name) return null; return { id: raw?.id || createId('cat'), name, sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 999), createdAt: raw?.createdAt || raw?.created_at || nowIso(), updatedAt: raw?.updatedAt || raw?.updated_at || nowIso() }; }
  function normalizeStore(raw) { const name = String(raw?.name || raw?.store || raw?.storeName || raw?.shop || raw || '').trim(); if (!name) return null; return { id: raw?.id || createId('store'), name, sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 999), createdAt: raw?.createdAt || raw?.created_at || nowIso(), updatedAt: raw?.updatedAt || raw?.updated_at || nowIso() }; }
  function normalizeAchievementSeen(item) { if (typeof item === 'string') return { id: item, achievedAt: nowIso() }; if (!item?.id) return null; return { id: item.id, achievedAt: item.achievedAt || item.achieved_at || nowIso() }; }

  function mergeByName(primary, secondary) { const byName = new Map(); [...primary, ...secondary].forEach((item, index) => { const norm = item?.name ? item : normalizeCategory(item); if (!norm?.name) return; if (!byName.has(norm.name)) byName.set(norm.name, { ...norm, sortOrder: Number.isFinite(Number(norm.sortOrder)) ? Number(norm.sortOrder) : index }); }); return [...byName.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ja')); }
  function addCategoryIfMissing(name) { const normalized = String(name || '').trim(); let category = state.categories.find((item) => item.name === normalized); if (!category) { category = { id: createId('cat'), name: normalized, sortOrder: state.categories.length, createdAt: nowIso(), updatedAt: nowIso() }; state.categories.push(category); saveState(); } return category; }
  function addStoreIfMissing(name) { const normalized = String(name || '').trim(); let store = state.stores.find((item) => item.name === normalized); if (!store) { store = { id: createId('store'), name: normalized, sortOrder: state.stores.length, createdAt: nowIso(), updatedAt: nowIso() }; state.stores.push(store); saveState(); } return store; }
  function findOrCreateNamedInList(list, name, prefix) { let item = list.find((entry) => entry.name === name); if (!item) { item = { id: createId(prefix), name, sortOrder: list.length, createdAt: nowIso(), updatedAt: nowIso() }; list.push(item); } return item; }
  function getCategory(id) { return state.categories.find((item) => item.id === id); }
  function getStore(id) { return state.stores.find((item) => item.id === id); }
  function getGoal(id) { return state.goals.find((item) => item.id === id); }

  function normalizePaymentMethod(value) { const text = String(value || '').trim(); if (paymentMethods.includes(text)) return text; if (text.includes('現金') || text.includes('財布') || text.includes('封筒')) return '現金'; if (text.includes('カード') || text.toLowerCase().includes('card') || text.includes('クレ')) return 'カード'; if (text.includes('電子') || text.includes('Pay') || text.includes('nanaco') || text.includes('Su') || text.includes('QR') || text.includes('キャッシュレス')) return '電子マネー'; if (text.includes('引') || text.includes('銀行') || text.includes('口座')) return '口座引き落とし'; return 'その他'; }
  function normalizePhase(value) { const text = String(value || '').trim(); if (text === '新生活' || text === '家族生活期') return '新生活'; return '旧生活'; }
  function guessMethodFromOldItem(item) { const accountType = String(item.accountType || '').toLowerCase(); const accountName = String(item.accountName || item.account_name || item['支払元'] || ''); if (accountType === 'card' || accountName.includes('カード')) return 'カード'; if (accountType === 'cashless' || accountName.includes('Pay') || accountName.includes('nanaco')) return '電子マネー'; if (accountType === 'bank' || accountName.includes('銀行')) return '口座引き落とし'; return item.paymentMethod || '現金'; }
  function guessStoreFromMemo(memo) { const text = String(memo || ''); return defaultStoreNames.find((name) => name !== 'その他' && text.includes(name)) || ''; }
  function normalizeGoalType(value) { const text = String(value || ''); if (text.includes('欲')) return 'wish'; if (text.includes('備')) return 'reserve'; return 'experience'; }

  function filterByMonth(items, month) { return items.filter((item) => monthKey(item.date) === month); }
  function groupSum(items, key) { return items.reduce((map, item) => { const label = item[key] || '未分類'; map[label] = (map[label] || 0) + Number(item.amount || 0); return map; }, {}); }
  function sum(values) { return values.reduce((total, value) => total + (Number(value) || 0), 0); }
  function unique(list) { return [...new Set(list.filter((item) => item !== undefined && item !== null && String(item) !== ''))]; }
  function parseAmount(value) { return Number(String(value ?? '').replace(/[¥,円,\s]/g, '')); }
  function monthKey(value) { return typeof value === 'string' ? value.slice(0, 7) : dateKey(value).slice(0, 7); }
  function dateKey(date) { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function addMonths(date, diff) { const d = new Date(date); d.setMonth(d.getMonth() + diff); return d; }
  function formatMonthLabel(month) { if (!month) return '-'; const [y, m] = month.split('-'); return `${y}年${Number(m)}月`; }
  function formatYen(value) { return `¥${Math.round(Number(value) || 0).toLocaleString('ja-JP')}`; }
  function formatSignedYen(value) { const n = Math.round(Number(value) || 0); return `${n > 0 ? '+' : n < 0 ? '-' : ''}${formatYen(Math.abs(n))}`; }
  function createId(prefix) { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
  function nowIso() { return new Date().toISOString(); }
  function stamp() { return new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-'); }
  function safeParse(raw) { try { return JSON.parse(raw); } catch { return null; } }
  function expenseSignature(item) { return `${item.date}|${item.amount}|${item.categoryName}|${item.storeName}|${item.paymentMethod}|${item.memo}`; }

  function calcBestStreak(dates) { if (!dates.length) return 0; let best = 1; let current = 1; for (let i = 1; i < dates.length; i += 1) { const prev = new Date(dates[i - 1]); const currentDate = new Date(dates[i]); const diffDays = Math.round((currentDate - prev) / 86400000); if (diffDays === 1) current += 1; else if (diffDays > 1) current = 1; best = Math.max(best, current); } return best; }
  function rankForUnlocked(count) { if (count >= 20) return '家計簿の守護者'; if (count >= 15) return '生活ログ司令官'; if (count >= 10) return 'レシートハンター'; if (count >= 5) return '記録係主任'; if (count >= 1) return '見習い記録係'; return '未開始'; }
  function mergeByIdOrSignature(target, imported, signatureFn) { imported.forEach((item) => { const indexById = target.findIndex((existing) => existing.id && item.id && existing.id === item.id); const indexBySig = target.findIndex((existing) => signatureFn(existing) === signatureFn(item)); const index = indexById >= 0 ? indexById : indexBySig; if (index >= 0) target[index] = { ...target[index], ...item, updatedAt: nowIso() }; else target.push(item); }); }
  function rowsToObjects(rows) { if (!rows.length) return []; const header = rows[0].map((cell) => String(cell || '').trim()); return rows.slice(1).filter((row) => row.some((cell) => String(cell || '').trim())).map((row) => Object.fromEntries(header.map((key, index) => [key, row[index] ?? '']))); }
  function parseCsv(text) { const rows = []; let row = []; let cell = ''; let inQuotes = false; const input = String(text || '').replace(/^\uFEFF/, ''); for (let i = 0; i < input.length; i += 1) { const char = input[i]; const next = input[i + 1]; if (char === '"') { if (inQuotes && next === '"') { cell += '"'; i += 1; } else inQuotes = !inQuotes; } else if (char === ',' && !inQuotes) { row.push(cell); cell = ''; } else if ((char === '\n' || char === '\r') && !inQuotes) { if (char === '\r' && next === '\n') i += 1; row.push(cell); rows.push(row); row = []; cell = ''; } else { cell += char; } } if (cell || row.length) { row.push(cell); rows.push(row); } return rows; }
  function csvEscape(value) { const text = String(value ?? ''); return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
  function rowsToCsv(rows) { return rows.map((row) => row.map(csvEscape).join(',')).join('\r\n'); }
  function downloadCsv(label, rows, filename) { const blob = new Blob(['\uFEFF' + rowsToCsv(rows)], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); showToast(`${label}CSVを書き出しました。`); }
  function decodeText(buffer) { const bytes = new Uint8Array(buffer); try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return new TextDecoder('shift_jis').decode(bytes); } }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])); }
  function showToast(message) { els.toast.textContent = message; els.toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 2400); }

  window.__kakeiboDebug = { getState: () => state, renderAll, setComparePreset, backupToRows, importBackup, rowsToCsv, parseCsv, addPretendSampleData };
})();
