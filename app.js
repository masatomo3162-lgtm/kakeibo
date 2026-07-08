(() => {
  'use strict';

  const APP_VERSION = '2.0.0';
  const STORAGE_KEY = 'jun_kakeibo_expense_v200';
  const OLD_STORAGE_KEYS = [
    'jun_kakeibo_mvp_v100', 'jun_kakeibo_mvp_v050', 'jun_kakeibo_mvp_v041', 'jun_kakeibo_mvp_v040',
    'jun_kakeibo_mvp_v030', 'jun_kakeibo_mvp_v020', 'jun_kakeibo_mvp_v010'
  ];

  const paymentMethods = ['現金', 'カード', '電子マネー', '口座引き落とし', 'その他'];
  const phases = ['単身期', '同居準備期', '家族生活期'];
  const savingTypeLabels = { envelope: '目的別封筒貯金', bank: '目的別銀行貯金' };
  const goalTypeLabels = { experience: 'やりたいこと', wish: '欲しいもの', reserve: '備えるお金' };

  const defaultCategoryNames = [
    '食費', '外食', '日用品', '医療', '交通', '車', '通信費', '光熱費', '保険', '税金',
    'ウイスキー', 'ゲーム', '映画・サブスク', '旅行', '家電', '趣味', '交際費',
    'まいちゃん関連', 'ななちゃん関連', '教育費', '家族費', 'その他'
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
    { id: 'method_three', emoji: '🗡️', title: '支払い三刀流', description: '現金・カード・電子マネーなど3種類以上を使う。', target: 3, current: (f) => f.methodCount },
    { id: 'memo_ten', emoji: '✍️', title: '未来の自分への伝言', description: 'メモ付き支出を10件登録する。後で見返す自分が助かる。', target: 10, current: (f) => f.memoEntries },
    { id: 'compare_ready', emoji: '⚖️', title: '比較の天秤を置いた', description: '比較できる2か月以上の支出を登録する。', target: 2, current: (f) => f.monthCount },
    { id: 'year_compare_ready', emoji: '📆', title: '前年比較の扉', description: '2年分以上の支出年がある。去年との比較準備OK。', target: 2, current: (f) => f.yearCount },
    { id: 'family_phase', emoji: '👨‍👩‍👧', title: '家族モード観測開始', description: '家族生活期の支出を1件登録する。増えた支出が見える。', target: 1, current: (f) => f.familyEntries },
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
    paymentMethodInput: $('#paymentMethodInput'), phaseInput: $('#phaseInput'), peopleInput: $('#peopleInput'), memoInput: $('#memoInput'), newCategoryInput: $('#newCategoryInput'), saveButton: $('#saveButton'), clearButton: $('#clearButton'),
    monthTotalTop: $('#monthTotalTop'),
    leftTypeInput: $('#leftTypeInput'), rightTypeInput: $('#rightTypeInput'), leftMonthInput: $('#leftMonthInput'), rightMonthInput: $('#rightMonthInput'), leftYearInput: $('#leftYearInput'), rightYearInput: $('#rightYearInput'), leftPhaseInput: $('#leftPhaseInput'), rightPhaseInput: $('#rightPhaseInput'),
    leftTitle: $('#leftTitle'), rightTitle: $('#rightTitle'), leftTotal: $('#leftTotal'), rightTotal: $('#rightTotal'), leftStats: $('#leftStats'), rightStats: $('#rightStats'), diffLabel: $('#diffLabel'), diffTotal: $('#diffTotal'), diffComment: $('#diffComment'), categoryCompare: $('#categoryCompare'), methodCompare: $('#methodCompare'),
    historyMonthInput: $('#historyMonthInput'), historyCategoryFilter: $('#historyCategoryFilter'), historyMethodFilter: $('#historyMethodFilter'), historyTotal: $('#historyTotal'), historyCount: $('#historyCount'), expenseList: $('#expenseList'),
    goalForm: $('#goalForm'), goalIdInput: $('#goalIdInput'), goalTitleInput: $('#goalTitleInput'), goalTargetInput: $('#goalTargetInput'), goalManualInput: $('#goalManualInput'), goalDueInput: $('#goalDueInput'), goalTypeInput: $('#goalTypeInput'), goalMemoInput: $('#goalMemoInput'), goalSaveButton: $('#goalSaveButton'), goalClearButton: $('#goalClearButton'), goalList: $('#goalList'), goalsTargetTotal: $('#goalsTargetTotal'), goalsCurrentTotal: $('#goalsCurrentTotal'), goalsRemainingTotal: $('#goalsRemainingTotal'), goalsAchievedCount: $('#goalsAchievedCount'),
    savingForm: $('#savingForm'), savingIdInput: $('#savingIdInput'), savingNameInput: $('#savingNameInput'), savingTypeInput: $('#savingTypeInput'), savingBalanceInput: $('#savingBalanceInput'), savingTargetInput: $('#savingTargetInput'), savingGoalInput: $('#savingGoalInput'), savingMemoInput: $('#savingMemoInput'), savingSaveButton: $('#savingSaveButton'), savingClearButton: $('#savingClearButton'), savingList: $('#savingList'), envelopeSavingTotal: $('#envelopeSavingTotal'), bankSavingTotal: $('#bankSavingTotal'), savingTotal: $('#savingTotal'), linkedSavingCount: $('#linkedSavingCount'),
    achievementMonthInput: $('#achievementMonthInput'), achievementUnlockedCount: $('#achievementUnlockedCount'), achievementRecordDays: $('#achievementRecordDays'), achievementStreak: $('#achievementStreak'), achievementRank: $('#achievementRank'), nextAchievementList: $('#nextAchievementList'), achievementList: $('#achievementList'),
    exportExpensesCsvButton: $('#exportExpensesCsvButton'), exportGoalsCsvButton: $('#exportGoalsCsvButton'), exportSavingsCsvButton: $('#exportSavingsCsvButton'), importExpensesCsvInput: $('#importExpensesCsvInput'), importGoalsCsvInput: $('#importGoalsCsvInput'), importSavingsCsvInput: $('#importSavingsCsvInput'),
    categoryForm: $('#categoryForm'), categoryIdInput: $('#categoryIdInput'), categoryNameInput: $('#categoryNameInput'), categorySaveButton: $('#categorySaveButton'), categoryClearButton: $('#categoryClearButton'), categoryList: $('#categoryList'), resetAllButton: $('#resetAllButton')
  };

  init();

  function init() {
    ensureState();
    const today = new Date();
    const thisMonth = monthKey(today);
    els.dateInput.value = dateKey(today);
    els.historyMonthInput.value = thisMonth;
    els.achievementMonthInput.value = thisMonth;
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
    els.phaseInput.addEventListener('change', () => {
      if (els.phaseInput.value === '家族生活期' && Number(els.peopleInput.value || 1) < 2) els.peopleInput.value = 3;
      if (els.phaseInput.value === '単身期') els.peopleInput.value = 1;
    });

    [els.leftTypeInput, els.rightTypeInput].forEach((input) => input.addEventListener('change', () => { renderCompareControls(); renderCompare(); }));
    [els.leftMonthInput, els.rightMonthInput, els.leftYearInput, els.rightYearInput, els.leftPhaseInput, els.rightPhaseInput].forEach((input) => input.addEventListener('change', renderCompare));
    $$('.quick-buttons [data-preset]').forEach((button) => button.addEventListener('click', () => setComparePreset(button.dataset.preset)));

    [els.historyMonthInput, els.historyCategoryFilter, els.historyMethodFilter].forEach((input) => input.addEventListener('change', renderHistory));
    els.goalForm.addEventListener('submit', handleGoalSubmit);
    els.goalClearButton.addEventListener('click', resetGoalForm);
    els.savingForm.addEventListener('submit', handleSavingSubmit);
    els.savingClearButton.addEventListener('click', resetSavingForm);
    els.achievementMonthInput.addEventListener('change', renderAchievements);

    els.exportExpensesCsvButton.addEventListener('click', () => downloadCsv('支出', expensesToRows(state.expenses), `kakeibo-expenses_${stamp()}.csv`));
    els.exportGoalsCsvButton.addEventListener('click', () => downloadCsv('目標', goalsToRows(state.goals), `kakeibo-goals_${stamp()}.csv`));
    els.exportSavingsCsvButton.addEventListener('click', () => downloadCsv('貯金', savingsToRows(state.savings), `kakeibo-savings_${stamp()}.csv`));
    els.importExpensesCsvInput.addEventListener('change', (e) => importCsvFile(e, importExpenses));
    els.importGoalsCsvInput.addEventListener('change', (e) => importCsvFile(e, importGoals));
    els.importSavingsCsvInput.addEventListener('change', (e) => importCsvFile(e, importSavings));

    els.categoryForm.addEventListener('submit', handleCategorySubmit);
    els.categoryClearButton.addEventListener('click', resetCategoryForm);
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
      expenses: [],
      goals: [],
      savings: [],
      achievementsSeen: []
    };
  }

  function migrateOldState(parsed) {
    const fallback = createFallbackState();
    const categoryNames = unique([
      ...defaultCategoryNames,
      ...(Array.isArray(parsed.categories) ? parsed.categories.map((cat) => cat.name || cat.category || cat) : [])
    ].map((name) => String(name || '').trim()).filter(Boolean));
    const categories = categoryNames.map((name, index) => ({ id: createId('cat'), name, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() }));

    const expenses = (Array.isArray(parsed.expenses) ? parsed.expenses : Array.isArray(parsed.transactions) ? parsed.transactions : [])
      .map((item) => normalizeExpense(item, categories)).filter(Boolean);
    const goals = (Array.isArray(parsed.goals) ? parsed.goals : []).map(normalizeGoal).filter(Boolean);
    const savings = (Array.isArray(parsed.savings) ? parsed.savings : []).map((item) => normalizeSaving(item, goals)).filter(Boolean);

    return normalizeState({ ...fallback, categories, expenses, goals, savings, achievementsSeen: Array.isArray(parsed.achievementsSeen) ? parsed.achievementsSeen : [] });
  }

  function normalizeState(raw) {
    const fallback = createFallbackState();
    const categories = Array.isArray(raw?.categories) ? raw.categories.map(normalizeCategory).filter(Boolean) : fallback.categories;
    const finalCategories = mergeCategories(categories, fallback.categories);
    const goals = Array.isArray(raw?.goals) ? raw.goals.map(normalizeGoal).filter(Boolean) : [];
    const savings = Array.isArray(raw?.savings) ? raw.savings.map((item) => normalizeSaving(item, goals)).filter(Boolean) : [];
    const expenses = Array.isArray(raw?.expenses) ? raw.expenses.map((item) => normalizeExpense(item, finalCategories)).filter(Boolean) : [];
    return {
      version: APP_VERSION,
      categories: finalCategories,
      expenses,
      goals,
      savings,
      achievementsSeen: Array.isArray(raw?.achievementsSeen) ? raw.achievementsSeen.map(normalizeAchievementSeen).filter(Boolean) : []
    };
  }

  function ensureState() {
    state = normalizeState(state);
    saveState();
  }

  function saveState() {
    state.version = APP_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function switchTab(tabName) {
    els.tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === tabName));
    els.panels.forEach((panel) => panel.classList.toggle('is-active', panel.id === `tab-${tabName}`));
    if (tabName === 'compare') renderCompare();
    if (tabName === 'achievements') renderAchievements();
  }

  function renderAll() {
    renderCategorySelects();
    renderTopTotal();
    renderCompareControls();
    renderCompare();
    renderHistoryFilters();
    renderHistory();
    renderGoalSelects();
    renderGoals();
    renderSavings();
    renderCategories();
    renderAchievements();
    saveState();
  }

  function handleExpenseSubmit(event) {
    event.preventDefault();
    const amount = Number(els.amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) return showToast('金額を入力してください。');
    const category = getCategory(els.categoryInput.value) || state.categories[0];
    const phase = phases.includes(els.phaseInput.value) ? els.phaseInput.value : '単身期';
    const peopleCount = Math.max(1, Math.round(Number(els.peopleInput.value || 1)));
    const payload = {
      date: els.dateInput.value,
      amount: Math.round(amount),
      categoryId: category.id,
      categoryName: category.name,
      paymentMethod: normalizePaymentMethod(els.paymentMethodInput.value),
      phase,
      peopleCount,
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
    resetExpenseForm({ keepDate: true, keepCategory: true, keepPhase: true });
    renderAll();
  }

  function resetExpenseForm(options = {}) {
    const keepDate = els.dateInput.value;
    const keepCategory = els.categoryInput.value;
    const keepPhase = els.phaseInput.value;
    const keepPeople = els.peopleInput.value;
    els.expenseForm.reset();
    els.editId.value = '';
    els.saveButton.textContent = '保存';
    els.dateInput.value = options.keepDate ? keepDate : dateKey(new Date());
    if (options.keepCategory && getCategory(keepCategory)) els.categoryInput.value = keepCategory;
    if (options.keepPhase && phases.includes(keepPhase)) els.phaseInput.value = keepPhase;
    els.peopleInput.value = options.keepPhase ? keepPeople : (els.phaseInput.value === '家族生活期' ? 3 : 1);
  }

  function editExpense(id) {
    const item = state.expenses.find((expense) => expense.id === id);
    if (!item) return;
    els.editId.value = item.id;
    els.dateInput.value = item.date;
    els.amountInput.value = item.amount;
    els.categoryInput.value = item.categoryId;
    els.paymentMethodInput.value = item.paymentMethod;
    els.phaseInput.value = item.phase || '単身期';
    els.peopleInput.value = item.peopleCount || 1;
    els.memoInput.value = item.memo || '';
    els.saveButton.textContent = '更新';
    switchTab('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteExpense(id) {
    if (!confirm('この支出を削除しますか？')) return;
    state.expenses = state.expenses.filter((item) => item.id !== id);
    renderAll();
    showToast('支出を削除しました。');
  }

  function handleNewCategoryInline() {
    const name = els.newCategoryInput.value.trim();
    if (!name) return;
    const category = addCategoryIfMissing(name);
    els.newCategoryInput.value = '';
    renderCategorySelects();
    els.categoryInput.value = category.id;
    renderCategories();
    showToast(`カテゴリ「${category.name}」を追加しました。`);
  }

  function renderCategorySelects() {
    const options = state.categories.map((cat) => `<option value="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</option>`).join('');
    els.categoryInput.innerHTML = options;
  }

  function renderTopTotal() {
    const total = sum(filterByMonth(state.expenses, monthKey(new Date())).map((item) => item.amount));
    els.monthTotalTop.textContent = formatYen(total);
  }

  function setComparePreset(type) {
    const today = new Date();
    if (type === 'month') {
      els.leftTypeInput.value = 'month';
      els.rightTypeInput.value = 'month';
      els.leftMonthInput.value = monthKey(addMonths(today, -1));
      els.rightMonthInput.value = monthKey(today);
    } else if (type === 'year') {
      els.leftTypeInput.value = 'year';
      els.rightTypeInput.value = 'year';
      els.leftYearInput.value = String(today.getFullYear() - 1);
      els.rightYearInput.value = String(today.getFullYear());
    } else if (type === 'phase') {
      els.leftTypeInput.value = 'phase';
      els.rightTypeInput.value = 'phase';
      els.leftPhaseInput.value = '単身期';
      els.rightPhaseInput.value = '家族生活期';
    }
    renderCompareControls();
    renderCompare();
  }

  function renderCompareControls() {
    ['left', 'right'].forEach((side) => {
      const type = els[`${side}TypeInput`].value;
      $$(`.${side}-field`).forEach((field) => field.classList.add('is-hidden'));
      $$(`.${side}-field.${type}-field`).forEach((field) => field.classList.remove('is-hidden'));
    });
  }

  function renderCompare() {
    const left = getCompareResult('left');
    const right = getCompareResult('right');
    renderCompareCard('left', left);
    renderCompareCard('right', right);
    const diff = right.total - left.total;
    els.diffLabel.textContent = `${right.title} − ${left.title}`;
    els.diffTotal.textContent = formatSignedYen(diff);
    els.diffTotal.className = diff > 0 ? 'negative' : diff < 0 ? 'positive' : '';
    els.diffComment.textContent = diff > 0 ? `右側の方が ${formatYen(diff)} 多いです。原因カテゴリを下で確認。` : diff < 0 ? `右側の方が ${formatYen(Math.abs(diff))} 少ないです。この差を維持できるか確認。` : '支出額は同じです。内訳の違いを確認しましょう。';
    renderCompareTable(els.categoryCompare, left, right, 'categoryName');
    renderCompareTable(els.methodCompare, left, right, 'paymentMethod');
  }

  function getCompareResult(side) {
    const type = els[`${side}TypeInput`].value;
    let title = '';
    let items = [];
    if (type === 'month') {
      const month = els[`${side}MonthInput`].value || monthKey(new Date());
      title = formatMonthLabel(month);
      items = filterByMonth(state.expenses, month);
    } else if (type === 'year') {
      const year = Number(els[`${side}YearInput`].value) || new Date().getFullYear();
      title = `${year}年`;
      items = state.expenses.filter((item) => item.date.startsWith(`${year}-`));
    } else {
      const phase = els[`${side}PhaseInput`].value;
      title = phase;
      items = state.expenses.filter((item) => item.phase === phase);
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
    const avgPeople = average(items.map((item) => Math.max(1, Number(item.peopleCount || 1)))) || 1;
    const perPersonMonthAvg = months ? Math.round(monthAvg / avgPeople) : Math.round(total / avgPeople);
    return { title, type, items, total, count, months, days, avgPerEntry, monthAvg, dailyAvg, avgPeople, perPersonMonthAvg };
  }

  function renderCompareCard(side, result) {
    els[`${side}Title`].textContent = result.title;
    els[`${side}Total`].textContent = formatYen(result.total);
    els[`${side}Stats`].innerHTML = [
      ['件数', `${result.count}件`],
      ['記録日数', `${result.days}日`],
      ['月平均', formatYen(result.monthAvg || result.total)],
      ['1日平均', formatYen(result.dailyAvg)],
      ['平均人数', `${formatNumber(result.avgPeople, 1)}人`],
      ['1人あたり月平均', formatYen(result.perPersonMonthAvg)]
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  }

  function renderCompareTable(target, left, right, key) {
    const leftMap = groupSum(left.items, key);
    const rightMap = groupSum(right.items, key);
    const labels = unique([...Object.keys(leftMap), ...Object.keys(rightMap)]).sort((a, b) => (rightMap[b] || 0) - (rightMap[a] || 0));
    if (!labels.length) {
      target.innerHTML = '<p class="hint">比較できるデータがありません。</p>';
      return;
    }
    target.innerHTML = `<table><thead><tr><th>項目</th><th>${escapeHtml(left.title)}</th><th>${escapeHtml(right.title)}</th><th>差額</th></tr></thead><tbody>${labels.map((label) => {
      const l = leftMap[label] || 0;
      const r = rightMap[label] || 0;
      const d = r - l;
      return `<tr><td>${escapeHtml(label)}</td><td>${formatYen(l)}</td><td>${formatYen(r)}</td><td class="${d > 0 ? 'negative' : d < 0 ? 'positive' : ''}">${formatSignedYen(d)}</td></tr>`;
    }).join('')}</tbody></table>`;
  }

  function renderHistoryFilters() {
    els.historyCategoryFilter.innerHTML = '<option value="">すべて</option>' + state.categories.map((cat) => `<option value="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</option>`).join('');
    els.historyMethodFilter.innerHTML = '<option value="">すべて</option>' + paymentMethods.map((method) => `<option value="${escapeHtml(method)}">${escapeHtml(method)}</option>`).join('');
  }

  function renderHistory() {
    const month = els.historyMonthInput.value;
    const categoryId = els.historyCategoryFilter.value;
    const method = els.historyMethodFilter.value;
    const list = state.expenses
      .filter((item) => !month || monthKey(item.date) === month)
      .filter((item) => !categoryId || item.categoryId === categoryId)
      .filter((item) => !method || item.paymentMethod === method)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    const total = sum(list.map((item) => item.amount));
    els.historyTotal.textContent = formatYen(total);
    els.historyCount.textContent = `${list.length}件`;
    els.expenseList.innerHTML = list.length ? list.map((item) => `
      <article class="transaction-item">
        <div class="item-main">
          <strong>${escapeHtml(item.categoryName)} ${formatYen(item.amount)}</strong>
          <div class="meta">${escapeHtml(item.date)} / ${escapeHtml(item.paymentMethod)} / ${escapeHtml(item.phase || '単身期')}・${Number(item.peopleCount || 1)}人${item.memo ? ` / ${escapeHtml(item.memo)}` : ''}</div>
        </div>
        <div class="item-actions">
          <button type="button" class="icon-button" data-edit-expense="${escapeHtml(item.id)}">編集</button>
          <button type="button" class="icon-button" data-delete-expense="${escapeHtml(item.id)}">削除</button>
        </div>
      </article>
    `).join('') : '<p class="hint">この条件の履歴はありません。</p>';
    $$('[data-edit-expense]').forEach((button) => button.addEventListener('click', () => editExpense(button.dataset.editExpense)));
    $$('[data-delete-expense]').forEach((button) => button.addEventListener('click', () => deleteExpense(button.dataset.deleteExpense)));
  }

  function handleGoalSubmit(event) {
    event.preventDefault();
    const title = els.goalTitleInput.value.trim();
    const targetAmount = Number(els.goalTargetInput.value);
    const manualAmount = Number(els.goalManualInput.value || 0);
    if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) return showToast('目標名と目標金額を入力してください。');
    const payload = {
      title,
      targetAmount: Math.round(targetAmount),
      manualAmount: Number.isFinite(manualAmount) && manualAmount > 0 ? Math.round(manualAmount) : 0,
      dueDate: els.goalDueInput.value,
      type: ['experience', 'wish', 'reserve'].includes(els.goalTypeInput.value) ? els.goalTypeInput.value : 'experience',
      memo: els.goalMemoInput.value.trim(),
      updatedAt: nowIso()
    };
    const id = els.goalIdInput.value;
    if (id) {
      const goal = state.goals.find((item) => item.id === id);
      if (!goal) return showToast('編集対象が見つかりません。');
      Object.assign(goal, payload);
      showToast('目標を更新しました。');
    } else {
      state.goals.push({ id: createId('goal'), ...payload, createdAt: nowIso() });
      showToast('目標を保存しました。');
    }
    resetGoalForm();
    renderAll();
  }

  function renderGoalSelects() {
    const options = '<option value="">連結しない</option>' + state.goals.map((goal) => `<option value="${escapeHtml(goal.id)}">${escapeHtml(goal.title)}</option>`).join('');
    els.savingGoalInput.innerHTML = options;
  }

  function renderGoals() {
    const withProgress = state.goals.map((goal) => ({ ...goal, progress: getGoalProgress(goal.id) }));
    const targetTotal = sum(withProgress.map((goal) => goal.targetAmount));
    const currentTotal = sum(withProgress.map((goal) => Math.min(goal.targetAmount, goal.progress.currentAmount)));
    const remainingTotal = sum(withProgress.map((goal) => Math.max(0, goal.targetAmount - goal.progress.currentAmount)));
    const achievedCount = withProgress.filter((goal) => goal.progress.currentAmount >= goal.targetAmount).length;
    els.goalsTargetTotal.textContent = formatYen(targetTotal);
    els.goalsCurrentTotal.textContent = formatYen(currentTotal);
    els.goalsRemainingTotal.textContent = formatYen(remainingTotal);
    els.goalsAchievedCount.textContent = `${achievedCount}件`;
    els.goalList.innerHTML = withProgress.length ? withProgress.map((goal) => renderGoalItem(goal)).join('') : '<p class="hint">目標はまだありません。</p>';
    $$('[data-edit-goal]').forEach((button) => button.addEventListener('click', () => editGoal(button.dataset.editGoal)));
    $$('[data-delete-goal]').forEach((button) => button.addEventListener('click', () => deleteGoal(button.dataset.deleteGoal)));
  }

  function renderGoalItem(goal) {
    const ratio = goal.targetAmount ? Math.min(100, Math.round(goal.progress.currentAmount / goal.targetAmount * 100)) : 0;
    const linkedNames = goal.progress.linkedSavings.map((saving) => saving.name).join('、') || '連結なし';
    return `<article class="goal-item">
      <div class="goal-top"><div><strong>${escapeHtml(goal.title)}</strong><div class="meta">${escapeHtml(goalTypeLabels[goal.type] || goal.type)} / 期限：${goal.dueDate || '未設定'} / 貯金連結：${escapeHtml(linkedNames)}</div></div><span class="pill">${ratio}%</span></div>
      <div class="progress"><span style="width:${ratio}%"></span></div>
      <div class="meta">現在 ${formatYen(goal.progress.currentAmount)} / 目標 ${formatYen(goal.targetAmount)} / 残り ${formatYen(Math.max(0, goal.targetAmount - goal.progress.currentAmount))}${goal.memo ? ` / ${escapeHtml(goal.memo)}` : ''}</div>
      <div class="item-actions"><button type="button" class="icon-button" data-edit-goal="${escapeHtml(goal.id)}">編集</button><button type="button" class="icon-button" data-delete-goal="${escapeHtml(goal.id)}">削除</button></div>
    </article>`;
  }

  function editGoal(id) {
    const goal = state.goals.find((item) => item.id === id);
    if (!goal) return;
    els.goalIdInput.value = goal.id;
    els.goalTitleInput.value = goal.title;
    els.goalTargetInput.value = goal.targetAmount;
    els.goalManualInput.value = goal.manualAmount || 0;
    els.goalDueInput.value = goal.dueDate || '';
    els.goalTypeInput.value = goal.type;
    els.goalMemoInput.value = goal.memo || '';
    els.goalSaveButton.textContent = '目標を更新';
    switchTab('goals');
  }

  function deleteGoal(id) {
    if (!confirm('この目標を削除しますか？\n連結中の貯金は「連結しない」に戻ります。')) return;
    state.goals = state.goals.filter((item) => item.id !== id);
    state.savings.forEach((saving) => { if (saving.goalId === id) saving.goalId = ''; });
    renderAll();
    showToast('目標を削除しました。');
  }

  function resetGoalForm() {
    els.goalForm.reset();
    els.goalIdInput.value = '';
    els.goalManualInput.value = '0';
    els.goalSaveButton.textContent = '目標を保存';
  }

  function handleSavingSubmit(event) {
    event.preventDefault();
    const name = els.savingNameInput.value.trim();
    const balance = Number(els.savingBalanceInput.value || 0);
    const targetAmount = Number(els.savingTargetInput.value || 0);
    if (!name || !Number.isFinite(balance) || balance < 0) return showToast('貯金名と残高を入力してください。');
    const payload = {
      name,
      type: ['envelope', 'bank'].includes(els.savingTypeInput.value) ? els.savingTypeInput.value : 'envelope',
      balance: Math.round(balance),
      targetAmount: Number.isFinite(targetAmount) && targetAmount > 0 ? Math.round(targetAmount) : 0,
      goalId: state.goals.some((goal) => goal.id === els.savingGoalInput.value) ? els.savingGoalInput.value : '',
      memo: els.savingMemoInput.value.trim(),
      updatedAt: nowIso()
    };
    const id = els.savingIdInput.value;
    if (id) {
      const saving = state.savings.find((item) => item.id === id);
      if (!saving) return showToast('編集対象が見つかりません。');
      Object.assign(saving, payload);
      showToast('貯金を更新しました。');
    } else {
      state.savings.push({ id: createId('save'), ...payload, createdAt: nowIso() });
      showToast('貯金を保存しました。');
    }
    resetSavingForm();
    renderAll();
  }

  function renderSavings() {
    const envelopeTotal = sum(state.savings.filter((item) => item.type === 'envelope').map((item) => item.balance));
    const bankTotal = sum(state.savings.filter((item) => item.type === 'bank').map((item) => item.balance));
    const linkedCount = state.savings.filter((item) => item.goalId).length;
    els.envelopeSavingTotal.textContent = formatYen(envelopeTotal);
    els.bankSavingTotal.textContent = formatYen(bankTotal);
    els.savingTotal.textContent = formatYen(envelopeTotal + bankTotal);
    els.linkedSavingCount.textContent = `${linkedCount}件`;
    els.savingList.innerHTML = state.savings.length ? state.savings.map((saving) => renderSavingItem(saving)).join('') : '<p class="hint">目的別貯金はまだありません。</p>';
    $$('[data-edit-saving]').forEach((button) => button.addEventListener('click', () => editSaving(button.dataset.editSaving)));
    $$('[data-delete-saving]').forEach((button) => button.addEventListener('click', () => deleteSaving(button.dataset.deleteSaving)));
  }

  function renderSavingItem(saving) {
    const goal = state.goals.find((item) => item.id === saving.goalId);
    const target = saving.targetAmount || goal?.targetAmount || 0;
    const ratio = target ? Math.min(100, Math.round(saving.balance / target * 100)) : 0;
    return `<article class="saving-item">
      <div class="saving-top"><div><strong>${escapeHtml(saving.name)}</strong><div class="meta">${escapeHtml(savingTypeLabels[saving.type] || saving.type)} / 連結：${goal ? escapeHtml(goal.title) : 'なし'}</div></div><span class="pill">${formatYen(saving.balance)}</span></div>
      ${target ? `<div class="progress"><span style="width:${ratio}%"></span></div><div class="meta">目安 ${formatYen(target)} / ${ratio}%</div>` : ''}
      ${saving.memo ? `<div class="meta">${escapeHtml(saving.memo)}</div>` : ''}
      <div class="item-actions"><button type="button" class="icon-button" data-edit-saving="${escapeHtml(saving.id)}">編集</button><button type="button" class="icon-button" data-delete-saving="${escapeHtml(saving.id)}">削除</button></div>
    </article>`;
  }

  function editSaving(id) {
    const saving = state.savings.find((item) => item.id === id);
    if (!saving) return;
    els.savingIdInput.value = saving.id;
    els.savingNameInput.value = saving.name;
    els.savingTypeInput.value = saving.type;
    els.savingBalanceInput.value = saving.balance;
    els.savingTargetInput.value = saving.targetAmount || 0;
    els.savingGoalInput.value = saving.goalId || '';
    els.savingMemoInput.value = saving.memo || '';
    els.savingSaveButton.textContent = '貯金を更新';
    switchTab('savings');
  }

  function deleteSaving(id) {
    if (!confirm('この貯金項目を削除しますか？')) return;
    state.savings = state.savings.filter((item) => item.id !== id);
    renderAll();
    showToast('貯金を削除しました。');
  }

  function resetSavingForm() {
    els.savingForm.reset();
    els.savingIdInput.value = '';
    els.savingBalanceInput.value = '0';
    els.savingTargetInput.value = '0';
    els.savingSaveButton.textContent = '貯金を保存';
  }

  function getGoalProgress(goalId) {
    const goal = state.goals.find((item) => item.id === goalId);
    const linkedSavings = state.savings.filter((item) => item.goalId === goalId);
    const linkedAmount = sum(linkedSavings.map((item) => item.balance));
    return {
      currentAmount: (goal?.manualAmount || 0) + linkedAmount,
      linkedSavings,
      linkedAmount
    };
  }

  function renderAchievements() {
    const facts = buildAchievementFacts(els.achievementMonthInput.value || monthKey(new Date()));
    const newlyUnlocked = [];
    achievementDefinitions.forEach((def) => {
      const current = Number(def.current(facts) || 0);
      const already = state.achievementsSeen.some((item) => item.id === def.id);
      if (!already && current >= def.target) {
        state.achievementsSeen.push({ id: def.id, achievedAt: nowIso() });
        newlyUnlocked.push(def.title);
      }
    });
    if (newlyUnlocked.length) saveState();

    const unlockedIds = new Set(state.achievementsSeen.map((item) => item.id));
    const unlockedCount = achievementDefinitions.filter((def) => unlockedIds.has(def.id)).length;
    els.achievementUnlockedCount.textContent = `${unlockedCount}/${achievementDefinitions.length}`;
    els.achievementRecordDays.textContent = `${facts.recordDays}日`;
    els.achievementStreak.textContent = `${facts.bestStreak}日`;
    els.achievementRank.textContent = rankForUnlocked(unlockedCount);

    const items = achievementDefinitions.map((def) => {
      const current = Math.min(Number(def.current(facts) || 0), def.target);
      const unlocked = unlockedIds.has(def.id) || current >= def.target;
      return { def, current, unlocked };
    });
    els.nextAchievementList.innerHTML = items.filter((item) => !item.unlocked).sort((a, b) => (b.current / b.def.target) - (a.current / a.def.target)).slice(0, 5).map(renderAchievementItem).join('') || '<p class="hint">すべて解除済みです。すごい。</p>';
    els.achievementList.innerHTML = items.map(renderAchievementItem).join('');
  }

  function renderAchievementItem(item) {
    const ratio = Math.min(100, Math.round(item.current / item.def.target * 100));
    return `<article class="achievement-item ${item.unlocked ? 'unlocked' : ''}">
      <div class="achievement-emoji">${item.unlocked ? '✅' : item.def.emoji}</div>
      <div><div class="achievement-title">${escapeHtml(item.def.title)}</div><div class="meta">${escapeHtml(item.def.description)}</div><div class="achievement-progress">${item.current}/${item.def.target}</div><div class="progress"><span style="width:${ratio}%"></span></div></div>
    </article>`;
  }

  function buildAchievementFacts(month) {
    const monthItems = filterByMonth(state.expenses, month);
    const totalEntries = state.expenses.length;
    const dates = unique(state.expenses.map((item) => item.date)).sort();
    return {
      totalEntries,
      julyEntries: state.expenses.filter((item) => monthKey(item.date) === '2026-07').length,
      recordDays: unique(monthItems.map((item) => item.date)).length,
      bestStreak: calcBestStreak(dates),
      categoryCount: unique(monthItems.map((item) => item.categoryName)).length,
      methodCount: unique(monthItems.map((item) => item.paymentMethod)).length,
      memoEntries: state.expenses.filter((item) => item.memo).length,
      monthCount: unique(state.expenses.map((item) => monthKey(item.date))).length,
      yearCount: unique(state.expenses.map((item) => item.date.slice(0, 4))).length,
      familyEntries: state.expenses.filter((item) => item.phase === '家族生活期' || Number(item.peopleCount || 1) >= 2).length,
      whiskyEntries: state.expenses.filter((item) => item.categoryName.includes('ウイスキー')).length,
      gameEntries: state.expenses.filter((item) => item.categoryName.includes('ゲーム')).length,
      goalCount: state.goals.length,
      savingCount: state.savings.length,
      linkedSavingCount: state.savings.filter((item) => item.goalId).length,
      goalAchievedCount: state.goals.filter((goal) => getGoalProgress(goal.id).currentAmount >= goal.targetAmount).length
    };
  }

  function handleCategorySubmit(event) {
    event.preventDefault();
    const name = els.categoryNameInput.value.trim();
    if (!name) return showToast('カテゴリ名を入力してください。');
    const id = els.categoryIdInput.value;
    if (id) {
      const category = state.categories.find((item) => item.id === id);
      if (!category) return showToast('編集対象が見つかりません。');
      if (state.categories.some((item) => item.name === name && item.id !== id)) return showToast('同じカテゴリ名があります。');
      const oldName = category.name;
      category.name = name;
      category.updatedAt = nowIso();
      state.expenses.forEach((expense) => { if (expense.categoryId === id || expense.categoryName === oldName) { expense.categoryId = id; expense.categoryName = name; } });
      showToast('カテゴリを更新しました。');
    } else {
      addCategoryIfMissing(name);
      showToast('カテゴリを追加しました。');
    }
    resetCategoryForm();
    renderAll();
  }

  function renderCategories() {
    els.categoryList.innerHTML = state.categories.map((cat) => `<div class="category-chip"><strong>${escapeHtml(cat.name)}</strong><div class="item-actions"><button type="button" class="icon-button" data-edit-category="${escapeHtml(cat.id)}">編集</button><button type="button" class="icon-button" data-delete-category="${escapeHtml(cat.id)}">削除</button></div></div>`).join('');
    $$('[data-edit-category]').forEach((button) => button.addEventListener('click', () => editCategory(button.dataset.editCategory)));
    $$('[data-delete-category]').forEach((button) => button.addEventListener('click', () => deleteCategory(button.dataset.deleteCategory)));
  }

  function editCategory(id) {
    const category = state.categories.find((item) => item.id === id);
    if (!category) return;
    els.categoryIdInput.value = category.id;
    els.categoryNameInput.value = category.name;
    els.categorySaveButton.textContent = 'カテゴリを更新';
  }

  function deleteCategory(id) {
    if (state.categories.length <= 1) return showToast('カテゴリは最低1つ必要です。');
    const category = getCategory(id);
    if (!category) return;
    if (state.expenses.some((expense) => expense.categoryId === id)) return showToast('使用中のカテゴリは削除できません。先に履歴を編集してください。');
    if (!confirm(`カテゴリ「${category.name}」を削除しますか？`)) return;
    state.categories = state.categories.filter((item) => item.id !== id);
    renderAll();
    showToast('カテゴリを削除しました。');
  }

  function resetCategoryForm() {
    els.categoryForm.reset();
    els.categoryIdInput.value = '';
    els.categorySaveButton.textContent = 'カテゴリを保存';
  }

  function importExpenses(rows) {
    const imported = rowsToObjects(rows).map((obj) => normalizeExpense(obj, state.categories)).filter(Boolean);
    mergeByIdOrSignature(state.expenses, imported, expenseSignature);
    renderAll();
    showToast(`支出CSVから${imported.length}件読み込みました。`);
  }

  function importGoals(rows) {
    const imported = rowsToObjects(rows).map(normalizeGoal).filter(Boolean);
    mergeByIdOrSignature(state.goals, imported, (goal) => `${goal.title}|${goal.targetAmount}|${goal.dueDate}`);
    renderAll();
    showToast(`目標CSVから${imported.length}件読み込みました。`);
  }

  function importSavings(rows) {
    const imported = rowsToObjects(rows).map((obj) => normalizeSaving(obj, state.goals)).filter(Boolean);
    mergeByIdOrSignature(state.savings, imported, (saving) => `${saving.name}|${saving.type}`);
    renderAll();
    showToast(`貯金CSVから${imported.length}件読み込みました。`);
  }

  function importCsvFile(event, handler) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = decodeText(reader.result);
        const rows = parseCsv(text);
        handler(rows);
      } catch (error) {
        console.error(error);
        showToast('CSVの読み込みに失敗しました。');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function expensesToRows(items) {
    return [
      ['id', 'date', 'amount', 'category', 'payment_method', 'phase', 'people_count', 'memo', 'created_at', 'updated_at'],
      ...items.map((item) => [item.id, item.date, item.amount, item.categoryName, item.paymentMethod, item.phase, item.peopleCount, item.memo, item.createdAt, item.updatedAt])
    ];
  }

  function goalsToRows(items) {
    return [
      ['id', 'title', 'target_amount', 'manual_amount', 'due_date', 'type', 'memo', 'created_at', 'updated_at'],
      ...items.map((item) => [item.id, item.title, item.targetAmount, item.manualAmount || 0, item.dueDate || '', item.type, item.memo || '', item.createdAt, item.updatedAt])
    ];
  }

  function savingsToRows(items) {
    return [
      ['id', 'name', 'type', 'balance', 'target_amount', 'linked_goal_title', 'linked_goal_id', 'memo', 'created_at', 'updated_at'],
      ...items.map((item) => [item.id, item.name, item.type, item.balance, item.targetAmount || 0, getGoal(item.goalId)?.title || '', item.goalId || '', item.memo || '', item.createdAt, item.updatedAt])
    ];
  }

  function resetAllData() {
    if (!confirm('全データを初期化しますか？\nCSVを書き出していないデータは戻せません。')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = createFallbackState();
    const today = new Date();
    const thisMonth = monthKey(today);
    els.dateInput.value = dateKey(today);
    els.historyMonthInput.value = thisMonth;
    els.achievementMonthInput.value = thisMonth;
    resetExpenseForm();
    resetGoalForm();
    resetSavingForm();
    resetCategoryForm();
    setComparePreset('month');
    renderAll();
    showToast('初期化しました。');
  }

  function normalizeExpense(item, categories) {
    const date = String(item.date || item['日付'] || '').slice(0, 10);
    const amount = parseAmount(item.amount ?? item['金額']);
    if (!date || !Number.isFinite(amount) || amount <= 0) return null;
    const categoryName = String(item.category || item.categoryName || item.category_name || item['カテゴリ'] || 'その他').trim() || 'その他';
    const category = findOrCreateCategoryInList(categories, categoryName);
    const guessedMethod = guessMethodFromOldItem(item);
    let method = item.paymentMethod || item.payment_method || item['支払方法'] || item.method || '';
    if (guessedMethod === 'カード' || guessedMethod === '口座引き落とし') method = guessedMethod;
    if (!method) method = guessedMethod;
    return {
      id: item.id || createId('exp'),
      date,
      amount: Math.round(amount),
      categoryId: category.id,
      categoryName: category.name,
      paymentMethod: normalizePaymentMethod(method),
      phase: phases.includes(item.phase) ? item.phase : phases.includes(item['生活フェーズ']) ? item['生活フェーズ'] : '単身期',
      peopleCount: Math.max(1, Math.round(Number(item.peopleCount || item.people_count || item['生活人数'] || 1))),
      memo: String(item.memo || item['メモ'] || '').trim(),
      createdAt: item.createdAt || item.created_at || nowIso(),
      updatedAt: item.updatedAt || item.updated_at || nowIso()
    };
  }

  function normalizeGoal(item) {
    const title = String(item?.title || item?.name || item?.['タイトル'] || '').trim();
    const targetAmount = parseAmount(item?.targetAmount ?? item?.target_amount ?? item?.target ?? item?.['目標金額']);
    if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) return null;
    const manualAmount = parseAmount(item?.manualAmount ?? item?.manual_amount ?? item?.currentAmount ?? item?.current_amount ?? item?.savedAmount ?? item?.['手入力済み額'] ?? 0);
    const type = ['experience', 'wish', 'reserve'].includes(item?.type) ? item.type : normalizeGoalType(item?.type || item?.['種類']);
    return { id: item.id || createId('goal'), title, targetAmount: Math.round(targetAmount), manualAmount: Number.isFinite(manualAmount) && manualAmount > 0 ? Math.round(manualAmount) : 0, dueDate: String(item.dueDate || item.due_date || item['目標時期'] || '').slice(0, 10), type, memo: String(item.memo || item['メモ'] || '').trim(), createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() };
  }

  function normalizeSaving(item, goals) {
    const name = String(item?.name || item?.title || item?.['名称'] || '').trim();
    const balance = parseAmount(item?.balance ?? item?.['残高']);
    if (!name || !Number.isFinite(balance) || balance < 0) return null;
    const typeText = String(item.type || item['種類'] || '').toLowerCase();
    const type = typeText.includes('bank') || typeText.includes('銀行') ? 'bank' : 'envelope';
    const targetAmount = parseAmount(item.targetAmount ?? item.target_amount ?? item['目安・上限額'] ?? 0);
    const goalById = goals.find((goal) => goal.id === item.goalId || goal.id === item.linked_goal_id);
    const goalByTitle = goals.find((goal) => goal.title === item.linked_goal_title || goal.title === item['連結する目標']);
    return { id: item.id || createId('save'), name, type, balance: Math.round(balance), targetAmount: Number.isFinite(targetAmount) && targetAmount > 0 ? Math.round(targetAmount) : 0, goalId: goalById?.id || goalByTitle?.id || '', memo: String(item.memo || item['メモ'] || '').trim(), createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() };
  }

  function normalizeCategory(raw) {
    const name = String(raw?.name || raw?.category || raw || '').trim();
    if (!name) return null;
    return { id: raw?.id || createId('cat'), name, sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 999), createdAt: raw?.createdAt || raw?.created_at || nowIso(), updatedAt: raw?.updatedAt || raw?.updated_at || nowIso() };
  }

  function normalizeAchievementSeen(item) {
    if (typeof item === 'string') return { id: item, achievedAt: nowIso() };
    if (!item?.id) return null;
    return { id: item.id, achievedAt: item.achievedAt || item.achieved_at || nowIso() };
  }

  function mergeCategories(primary, secondary) {
    const byName = new Map();
    [...primary, ...secondary].forEach((item, index) => {
      const cat = normalizeCategory(item);
      if (!cat) return;
      if (!byName.has(cat.name)) byName.set(cat.name, { ...cat, sortOrder: Number.isFinite(Number(cat.sortOrder)) ? Number(cat.sortOrder) : index });
    });
    return [...byName.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ja'));
  }

  function addCategoryIfMissing(name) {
    const normalized = String(name || '').trim();
    let category = state.categories.find((item) => item.name === normalized);
    if (!category) {
      category = { id: createId('cat'), name: normalized, sortOrder: state.categories.length, createdAt: nowIso(), updatedAt: nowIso() };
      state.categories.push(category);
      saveState();
    }
    return category;
  }

  function findOrCreateCategoryInList(categories, name) {
    let category = categories.find((item) => item.name === name);
    if (!category) {
      category = { id: createId('cat'), name, sortOrder: categories.length, createdAt: nowIso(), updatedAt: nowIso() };
      categories.push(category);
    }
    return category;
  }

  function getCategory(id) { return state.categories.find((item) => item.id === id); }
  function getGoal(id) { return state.goals.find((item) => item.id === id); }
  function normalizePaymentMethod(value) {
    const text = String(value || '').trim();
    if (paymentMethods.includes(text)) return text;
    if (text.includes('現金') || text.includes('財布') || text.includes('封筒')) return '現金';
    if (text.includes('カード') || text.toLowerCase().includes('card') || text.includes('クレ')) return 'カード';
    if (text.includes('電子') || text.includes('Pay') || text.includes('nanaco') || text.includes('Su') || text.includes('QR') || text.includes('キャッシュレス')) return '電子マネー';
    if (text.includes('引') || text.includes('銀行') || text.includes('口座')) return '口座引き落とし';
    return 'その他';
  }

  function guessMethodFromOldItem(item) {
    const accountType = String(item.accountType || '').toLowerCase();
    const accountName = String(item.accountName || item.account_name || item['支払元'] || '');
    if (accountType === 'card' || accountName.includes('カード')) return 'カード';
    if (accountType === 'cashless' || accountName.includes('Pay') || accountName.includes('nanaco')) return '電子マネー';
    if (accountType === 'bank' || accountName.includes('銀行')) return '口座引き落とし';
    return item.paymentMethod || '現金';
  }

  function normalizeGoalType(value) {
    const text = String(value || '');
    if (text.includes('欲')) return 'wish';
    if (text.includes('備')) return 'reserve';
    return 'experience';
  }

  function filterByMonth(items, month) { return items.filter((item) => monthKey(item.date) === month); }
  function groupSum(items, key) {
    return items.reduce((map, item) => {
      const label = item[key] || '未分類';
      map[label] = (map[label] || 0) + Number(item.amount || 0);
      return map;
    }, {});
  }
  function sum(values) { return values.reduce((total, value) => total + (Number(value) || 0), 0); }
  function average(values) { const nums = values.map(Number).filter(Number.isFinite); return nums.length ? sum(nums) / nums.length : 0; }
  function unique(list) { return [...new Set(list.filter((item) => item !== undefined && item !== null && String(item) !== ''))]; }
  function parseAmount(value) { return Number(String(value ?? '').replace(/[¥,円,\s]/g, '')); }
  function monthKey(value) { return typeof value === 'string' ? value.slice(0, 7) : dateKey(value).slice(0, 7); }
  function dateKey(date) { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function addMonths(date, diff) { const d = new Date(date); d.setMonth(d.getMonth() + diff); return d; }
  function formatMonthLabel(month) { if (!month) return '-'; const [y, m] = month.split('-'); return `${y}年${Number(m)}月`; }
  function formatYen(value) { return `¥${Math.round(Number(value) || 0).toLocaleString('ja-JP')}`; }
  function formatSignedYen(value) { const n = Math.round(Number(value) || 0); return `${n > 0 ? '+' : n < 0 ? '-' : ''}${formatYen(Math.abs(n))}`; }
  function formatNumber(value, digits = 0) { return Number(value || 0).toLocaleString('ja-JP', { maximumFractionDigits: digits, minimumFractionDigits: digits }); }
  function createId(prefix) { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
  function nowIso() { return new Date().toISOString(); }
  function stamp() { return new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-'); }
  function safeParse(raw) { try { return JSON.parse(raw); } catch { return null; } }
  function expenseSignature(item) { return `${item.date}|${item.amount}|${item.categoryName}|${item.paymentMethod}|${item.memo}`; }

  function calcBestStreak(dates) {
    if (!dates.length) return 0;
    let best = 1;
    let current = 1;
    for (let i = 1; i < dates.length; i += 1) {
      const prev = new Date(dates[i - 1]);
      const currentDate = new Date(dates[i]);
      const diffDays = Math.round((currentDate - prev) / 86400000);
      if (diffDays === 1) current += 1;
      else if (diffDays > 1) current = 1;
      best = Math.max(best, current);
    }
    return best;
  }

  function rankForUnlocked(count) {
    if (count >= 20) return '家計簿の守護者';
    if (count >= 15) return '生活ログ司令官';
    if (count >= 10) return 'レシートハンター';
    if (count >= 5) return '記録係主任';
    if (count >= 1) return '見習い記録係';
    return '未開始';
  }

  function mergeByIdOrSignature(target, imported, signatureFn) {
    imported.forEach((item) => {
      const indexById = target.findIndex((existing) => existing.id && item.id && existing.id === item.id);
      const indexBySig = target.findIndex((existing) => signatureFn(existing) === signatureFn(item));
      const index = indexById >= 0 ? indexById : indexBySig;
      if (index >= 0) target[index] = { ...target[index], ...item, updatedAt: nowIso() };
      else target.push(item);
    });
  }

  function rowsToObjects(rows) {
    if (!rows.length) return [];
    const header = rows[0].map((cell) => String(cell || '').trim());
    return rows.slice(1).filter((row) => row.some((cell) => String(cell || '').trim())).map((row) => Object.fromEntries(header.map((key, index) => [key, row[index] ?? ''])));
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    const input = String(text || '').replace(/^\uFEFF/, '');
    for (let i = 0; i < input.length; i += 1) {
      const char = input[i];
      const next = input[i + 1];
      if (char === '"') {
        if (inQuotes && next === '"') { cell += '"'; i += 1; }
        else inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(cell); cell = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i += 1;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else {
        cell += char;
      }
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  function csvEscape(value) {
    const text = String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function rowsToCsv(rows) { return rows.map((row) => row.map(csvEscape).join(',')).join('\r\n'); }
  function downloadCsv(label, rows, filename) {
    const blob = new Blob(['\uFEFF' + rowsToCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`${label}CSVを書き出しました。`);
  }

  function decodeText(buffer) {
    const bytes = new Uint8Array(buffer);
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch { return new TextDecoder('shift_jis').decode(bytes); }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 2400);
  }

  window.__kakeiboDebug = { getState: () => state, renderAll, setComparePreset };
})();
