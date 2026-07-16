(() => {
  'use strict';

  const APP_VERSION = '2.5.1';
  // 保存データは後方互換で拡張しているためv240のキーを維持（既存データをそのまま引き継ぐ）
  const STORAGE_KEY = 'jun_kakeibo_expense_v240';
  const OLD_STORAGE_KEYS = [
    'jun_kakeibo_expense_v230',
    'jun_kakeibo_expense_v220',
    'jun_kakeibo_expense_v210',
    'jun_kakeibo_expense_v200',
    'jun_kakeibo_mvp_v100', 'jun_kakeibo_mvp_v050', 'jun_kakeibo_mvp_v041', 'jun_kakeibo_mvp_v040',
    'jun_kakeibo_mvp_v030', 'jun_kakeibo_mvp_v020', 'jun_kakeibo_mvp_v010'
  ];

  const paymentMethods = ['現金', 'カード', '電子マネー', '口座引き落とし', 'その他'];
  const phases = ['旧生活', '新生活'];
  const savingTypeLabels = { envelope: '目的別封筒貯金', bank: '目的別銀行貯金' };
  const goalTypeLabels = { experience: 'やりたいこと', wish: '欲しいもの', reserve: '備えるお金' };

  const defaultCategoryNames = [
    '食費', '外食費', '日用品費', '衣料品費', '車・ガソリン代', '交通費', '通信費', '教育費', '医療費', '水道光熱費',
    '保険料', '税金', '旅行費', '娯楽費', '衛生費', '酒代', 'ゲーム代', '映画・サブスク', '小型家電', '大型家電', 'その他'
  ];

  const defaultStoreNames = [
    'トライアル', 'セブンイレブン', 'ローソン', 'セイコーマート', 'イオン', 'ツルハ',
    '楽天市場', 'Amazon', 'ガソリンスタンド', '病院・薬局', '公共料金', 'その他'
  ];


  const defaultBudgetItems = [
    ['お小遣い', 30000], ['食費', 50000], ['娯楽費', 15000], ['外食費', 12000],
    ['酒代', 10000], ['日用品費', 12000], ['ゲーム代', 5000], ['映画・サブスク', 5000]
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

    { id: 'budget_first', emoji: '📊', title: '予算管理、始動', description: '予算項目を1つ登録する。今月の上限が見えるようになった。', target: 1, current: (f) => f.budgetCount },
    { id: 'allowance_first', emoji: '🛡️', title: 'お小遣い防衛ライン', description: 'お小遣いからの支出を1件登録する。自分のお金と家計を分ける第一歩。', target: 1, current: (f) => f.allowanceEntries },
    { id: 'budget_food', emoji: '🍚', title: '食費を見張る者', description: '食費の予算を設定する。スーパーの支出が見えやすくなる。', target: 1, current: (f) => f.foodBudgetSet },
    { id: 'budget_fun', emoji: '🎪', title: '娯楽費監査官', description: '娯楽費の予算を設定する。楽しみ費も味方につける。', target: 1, current: (f) => f.funBudgetSet },
    { id: 'budget_calm', emoji: '🟢', title: 'まだ慌てる時間じゃない', description: '対象月に70%未満で収まっている予算枠が1つある。', target: 1, current: (f) => f.safeBudgetCount },
    { id: 'budget_close', emoji: '🟡', title: 'ギリギリの節約術', description: '対象月に90%以上100%未満の予算枠が1つある。攻めすぎ注意。', target: 1, current: (f) => f.nearBudgetCount },
    { id: 'budget_over', emoji: '🔴', title: '赤信号突破', description: '対象月に予算オーバーした枠が1つある。次月の作戦会議だ。', target: 1, current: (f) => f.overBudgetCount },
    { id: 'split_first', emoji: '✂️', title: '仕分けの第一歩', description: 'レシート分割入力を1回使う。混ざった支出をほどいた。', target: 1, current: (f) => f.splitReceiptGroups },
    { id: 'split_trial', emoji: '🛒', title: 'トライアル仕分け職人', description: 'トライアルの買い物を分割入力する。食費の水増しを防いだ。', target: 1, current: (f) => f.trialSplitGroups },
    { id: 'split_whisky', emoji: '🥃', title: 'ウイスキー分離成功', description: '分割入力で酒・ウイスキー系の支出を登録する。琥珀色を食費から救出。', target: 1, current: (f) => f.whiskySplitEntries },
    { id: 'split_match', emoji: '✅', title: 'レシート照合ヨシ', description: 'レシート合計と内訳合計が一致した分割入力を保存する。', target: 1, current: (f) => f.matchedSplitGroups },

    { id: 'pretend_first', emoji: '💰', title: '使ったつもり貯金、始動', description: '我慢できた支出を1件記録する。買わない力も資産だ。', target: 1, current: (f) => f.pretendCount },
    { id: 'pretend_month_5000', emoji: '🧱', title: '今月の防波堤5,000円', description: '対象月の使ったつもり貯金が5,000円を超える。浪費の波を止めた。', target: 5000, current: (f) => f.pretendMonthTotal },
    { id: 'pretend_lifetime_30000', emoji: '🏆', title: '我慢の金メダル3万円', description: '累計の使ったつもり貯金が30,000円を超える。これはもう立派な成果。', target: 30000, current: (f) => f.pretendLifetimeTotal },
    { id: 'pretend_whisky', emoji: '🥃', title: '琥珀色の誘惑に勝利', description: 'ウイスキー・酒系の支出を踏みとどまる。飲まなかった一本が未来に化ける。', target: 1, current: (f) => f.pretendWhiskyCount },
    { id: 'pretend_game', emoji: '🎮', title: '課金ボタン寸止め', description: 'ゲーム課金・ゲーム系の支出を踏みとどまる。クリック前に勝った。', target: 1, current: (f) => f.pretendGameCount },
    { id: 'pretend_used', emoji: '🌈', title: '我慢を幸せに変換', description: '貯めたつもりのお金を価値ある使い道として記録する。節約が報われた瞬間。', target: 1, current: (f) => f.pretendUseCount },
    { id: 'goal_first', emoji: '🚩', title: '目標の旗を立てた', description: '目標を1件登録する。支出記録が未来の予定とつながる。', target: 1, current: (f) => f.goalCount },
    { id: 'saving_first', emoji: '🏦', title: '目的別貯金、開封', description: '目的別貯金を1件登録する。封筒か銀行かは自由。', target: 1, current: (f) => f.savingCount },
    { id: 'linked_saving', emoji: '🔗', title: '目標と貯金が合体', description: '目標と貯金を1件連結する。進捗が自動で見える。', target: 1, current: (f) => f.linkedSavingCount },
    { id: 'goal_achieved', emoji: '🎉', title: '目標の宝箱を開けた', description: '目標を1件達成する。記録が行動につながった証拠。', target: 1, current: (f) => f.goalAchievedCount }
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  let state = loadState();
  let toastTimer = null;
  let pendingImportRows = [];

  const els = {
    tabs: $$('.tab'), panels: $$('.panel'), toast: $('#toast'),
    expenseForm: $('#expenseForm'), editId: $('#editId'), dateInput: $('#dateInput'), amountInput: $('#amountInput'), categoryInput: $('#categoryInput'),
    storeInput: $('#storeInput'), paymentMethodInput: $('#paymentMethodInput'), phaseInput: $('#phaseInput'), memoInput: $('#memoInput'), newCategoryInput: $('#newCategoryInput'), newStoreInput: $('#newStoreInput'), saveButton: $('#saveButton'), clearButton: $('#clearButton'),
    budgetInput: $('#budgetInput'), allowanceInput: $('#allowanceInput'), splitModeInput: $('#splitModeInput'), receiptTotalInput: $('#receiptTotalInput'), splitLineList: $('#splitLineList'), splitLineTotal: $('#splitLineTotal'), splitDiffTotal: $('#splitDiffTotal'), splitDiffMessage: $('#splitDiffMessage'), addSplitLineButton: $('#addSplitLineButton'), splitEntryPanel: $('#splitEntryPanel'),
    monthTotalTop: $('#monthTotalTop'),
    paymentsMonthInput: $('#paymentsMonthInput'), paymentsPhaseInput: $('#paymentsPhaseInput'), paymentsTotal: $('#paymentsTotal'), paymentsCount: $('#paymentsCount'), paymentsAverage: $('#paymentsAverage'), paymentsLargest: $('#paymentsLargest'), paymentsLargestLabel: $('#paymentsLargestLabel'), paymentsMonthLabel: $('#paymentsMonthLabel'), paymentsMethodBreakdown: $('#paymentsMethodBreakdown'), paymentsCategoryBreakdown: $('#paymentsCategoryBreakdown'), paymentsStoreBreakdown: $('#paymentsStoreBreakdown'), paymentsList: $('#paymentsList'),
    budgetMonthInput: $('#budgetMonthInput'), budgetLimitTotal: $('#budgetLimitTotal'), budgetUsedTotal: $('#budgetUsedTotal'), budgetRemainTotal: $('#budgetRemainTotal'), budgetOverCount: $('#budgetOverCount'), budgetCardList: $('#budgetCardList'),
    leftTypeInput: $('#leftTypeInput'), rightTypeInput: $('#rightTypeInput'), leftMonthInput: $('#leftMonthInput'), rightMonthInput: $('#rightMonthInput'), leftYearInput: $('#leftYearInput'), rightYearInput: $('#rightYearInput'), leftPhaseInput: $('#leftPhaseInput'), rightPhaseInput: $('#rightPhaseInput'),
    leftTitle: $('#leftTitle'), rightTitle: $('#rightTitle'), leftTotal: $('#leftTotal'), rightTotal: $('#rightTotal'), leftStats: $('#leftStats'), rightStats: $('#rightStats'), diffLabel: $('#diffLabel'), diffTotal: $('#diffTotal'), diffComment: $('#diffComment'), categoryCompare: $('#categoryCompare'), methodCompare: $('#methodCompare'), storeCompare: $('#storeCompare'), budgetCompare: $('#budgetCompare'),
    historyMonthInput: $('#historyMonthInput'), historyCategoryFilter: $('#historyCategoryFilter'), historyStoreFilter: $('#historyStoreFilter'), historyMethodFilter: $('#historyMethodFilter'), historyTotal: $('#historyTotal'), historyCount: $('#historyCount'), expenseList: $('#expenseList'),
    goalForm: $('#goalForm'), goalIdInput: $('#goalIdInput'), goalTitleInput: $('#goalTitleInput'), goalTargetInput: $('#goalTargetInput'), goalManualInput: $('#goalManualInput'), goalDueInput: $('#goalDueInput'), goalTypeInput: $('#goalTypeInput'), goalMemoInput: $('#goalMemoInput'), goalSavingsInputList: $('#goalSavingsInputList'), goalSaveButton: $('#goalSaveButton'), goalClearButton: $('#goalClearButton'), goalList: $('#goalList'), goalsTargetTotal: $('#goalsTargetTotal'), goalsCurrentTotal: $('#goalsCurrentTotal'), goalsRemainingTotal: $('#goalsRemainingTotal'), goalsAchievedCount: $('#goalsAchievedCount'),
    savingForm: $('#savingForm'), savingIdInput: $('#savingIdInput'), savingNameInput: $('#savingNameInput'), savingTypeInput: $('#savingTypeInput'), savingBalanceInput: $('#savingBalanceInput'), savingTargetInput: $('#savingTargetInput'), savingGoalInput: $('#savingGoalInput'), savingMemoInput: $('#savingMemoInput'), savingSaveButton: $('#savingSaveButton'), savingClearButton: $('#savingClearButton'), savingList: $('#savingList'), envelopeSavingTotal: $('#envelopeSavingTotal'), bankSavingTotal: $('#bankSavingTotal'), savingTotal: $('#savingTotal'), linkedSavingCount: $('#linkedSavingCount'),
    pretendMonthInput: $('#pretendMonthInput'), pretendMonthTotal: $('#pretendMonthTotal'), pretendYearTotal: $('#pretendYearTotal'), pretendLifetimeTotal: $('#pretendLifetimeTotal'), pretendUsedTotal: $('#pretendUsedTotal'), pretendRemainingTotal: $('#pretendRemainingTotal'), pretendMeterFill: $('#pretendMeterFill'), pretendForm: $('#pretendForm'), pretendIdInput: $('#pretendIdInput'), pretendDateInput: $('#pretendDateInput'), pretendAmountInput: $('#pretendAmountInput'), pretendCategoryInput: $('#pretendCategoryInput'), pretendThingInput: $('#pretendThingInput'), pretendPlanInput: $('#pretendPlanInput'), pretendMemoInput: $('#pretendMemoInput'), pretendSaveButton: $('#pretendSaveButton'), pretendClearButton: $('#pretendClearButton'), pretendUseForm: $('#pretendUseForm'), pretendUseIdInput: $('#pretendUseIdInput'), pretendUseDateInput: $('#pretendUseDateInput'), pretendUseAmountInput: $('#pretendUseAmountInput'), pretendUsePurposeInput: $('#pretendUsePurposeInput'), pretendUseMemoInput: $('#pretendUseMemoInput'), pretendUseSaveButton: $('#pretendUseSaveButton'), pretendUseClearButton: $('#pretendUseClearButton'), pretendRankingList: $('#pretendRankingList'), pretendUseList: $('#pretendUseList'), pretendHistoryCount: $('#pretendHistoryCount'), pretendHistoryList: $('#pretendHistoryList'),
    achievementMonthInput: $('#achievementMonthInput'), achievementUnlockedCount: $('#achievementUnlockedCount'), achievementRecordDays: $('#achievementRecordDays'), achievementStreak: $('#achievementStreak'), achievementRank: $('#achievementRank'), nextAchievementList: $('#nextAchievementList'), achievementList: $('#achievementList'),
    statementCsvInput: $('#statementCsvInput'), importPhaseInput: $('#importPhaseInput'), importFileSummary: $('#importFileSummary'), importDetectedCount: $('#importDetectedCount'), importRegisterCount: $('#importRegisterCount'), importReviewCount: $('#importReviewCount'), importExcludedCount: $('#importExcludedCount'), importRowList: $('#importRowList'), importRowsEmpty: $('#importRowsEmpty'), importSelectedButton: $('#importSelectedButton'), clearImportButton: $('#clearImportButton'), selectRegisterableButton: $('#selectRegisterableButton'), excludeAllImportButton: $('#excludeAllImportButton'), importRuleCount: $('#importRuleCount'), resetImportRulesButton: $('#resetImportRulesButton'),
    exportBackupCsvButton: $('#exportBackupCsvButton'), importBackupCsvInput: $('#importBackupCsvInput'),
    categoryForm: $('#categoryForm'), categoryIdInput: $('#categoryIdInput'), categoryNameInput: $('#categoryNameInput'), categorySaveButton: $('#categorySaveButton'), categoryClearButton: $('#categoryClearButton'), categoryList: $('#categoryList'),
    storeForm: $('#storeForm'), storeIdInput: $('#storeIdInput'), storeNameInput: $('#storeNameInput'), storeSaveButton: $('#storeSaveButton'), storeClearButton: $('#storeClearButton'), storeList: $('#storeList'),
    budgetForm: $('#budgetForm'), budgetIdInput: $('#budgetIdInput'), budgetNameInput: $('#budgetNameInput'), budgetLimitInput: $('#budgetLimitInput'), budgetEnabledInput: $('#budgetEnabledInput'), budgetSaveButton: $('#budgetSaveButton'), budgetClearButton: $('#budgetClearButton'), budgetList: $('#budgetList'),
    resetAllButton: $('#resetAllButton')
  };

  init();

  function init() {
    ensureState();
    const today = new Date();
    const thisMonth = monthKey(today);
    els.dateInput.value = dateKey(today);
    els.historyMonthInput.value = thisMonth;
    els.paymentsMonthInput.value = thisMonth;
    els.budgetMonthInput.value = thisMonth;
    els.pretendMonthInput.value = thisMonth;
    els.pretendDateInput.value = dateKey(today);
    els.pretendUseDateInput.value = dateKey(today);
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
    els.allowanceInput.addEventListener('change', handleAllowanceToggle);
    els.budgetInput.addEventListener('change', syncAllowanceFromBudget);
    els.categoryInput.addEventListener('change', syncBudgetFromCategory);
    els.splitModeInput.addEventListener('change', handleSplitModeToggle);
    els.receiptTotalInput.addEventListener('input', updateSplitTotals);
    els.addSplitLineButton.addEventListener('click', () => addSplitLine());
    els.newCategoryInput.addEventListener('change', handleNewCategoryInline);
    els.newStoreInput.addEventListener('change', handleNewStoreInline);

    [els.paymentsMonthInput, els.paymentsPhaseInput].forEach((input) => input.addEventListener('change', renderMonthlyPayments));

    [els.leftTypeInput, els.rightTypeInput].forEach((input) => input.addEventListener('change', () => { renderCompareControls(); renderCompare(); }));
    [els.leftMonthInput, els.rightMonthInput, els.leftYearInput, els.rightYearInput, els.leftPhaseInput, els.rightPhaseInput].forEach((input) => input.addEventListener('change', renderCompare));
    $$('.quick-buttons [data-preset]').forEach((button) => button.addEventListener('click', () => setComparePreset(button.dataset.preset)));

    [els.historyMonthInput, els.historyCategoryFilter, els.historyStoreFilter, els.historyMethodFilter].forEach((input) => input.addEventListener('change', renderHistory));
    els.budgetMonthInput.addEventListener('change', renderBudgetsDashboard);
    els.goalForm.addEventListener('submit', handleGoalSubmit);
    els.goalClearButton.addEventListener('click', resetGoalForm);
    els.savingForm.addEventListener('submit', handleSavingSubmit);
    els.savingClearButton.addEventListener('click', resetSavingForm);
    els.pretendForm.addEventListener('submit', handlePretendSubmit);
    els.pretendClearButton.addEventListener('click', resetPretendForm);
    els.pretendUseForm.addEventListener('submit', handlePretendUseSubmit);
    els.pretendUseClearButton.addEventListener('click', resetPretendUseForm);
    els.pretendMonthInput.addEventListener('change', renderPretendSavings);
    els.achievementMonthInput.addEventListener('change', renderAchievements);

    els.statementCsvInput.addEventListener('change', handleStatementFiles);
    els.importPhaseInput.addEventListener('change', () => { pendingImportRows.forEach((row) => { row.phase = els.importPhaseInput.value; }); renderImportRows(); });
    els.importRowList.addEventListener('change', handleImportRowChange);
    els.importSelectedButton.addEventListener('click', importSelectedTransactions);
    els.clearImportButton.addEventListener('click', clearPendingImports);
    els.selectRegisterableButton.addEventListener('click', selectRegisterableRows);
    els.excludeAllImportButton.addEventListener('click', excludeAllImportRows);
    els.resetImportRulesButton.addEventListener('click', resetImportRules);

    els.exportBackupCsvButton.addEventListener('click', () => downloadCsv('一括バックアップ', backupToRows(), `kakeibo-backup_${stamp()}.csv`));
    els.importBackupCsvInput.addEventListener('change', (e) => importCsvFile(e, importBackup));

    els.categoryForm.addEventListener('submit', handleCategorySubmit);
    els.categoryClearButton.addEventListener('click', resetCategoryForm);
    els.storeForm.addEventListener('submit', handleStoreSubmit);
    els.storeClearButton.addEventListener('click', resetStoreForm);
    els.budgetForm.addEventListener('submit', handleBudgetSubmit);
    els.budgetClearButton.addEventListener('click', resetBudgetForm);
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
      budgets: defaultBudgetItems.map(([name, monthlyLimit], index) => ({ id: createId('budget'), name, monthlyLimit, enabled: true, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() })),
      expenses: [], goals: [], savings: [], pretendSavings: [], pretendUses: [], importRules: [], achievementsSeen: []
    };
  }

  function migrateOldState(parsed) {
    const fallback = createFallbackState();
    const categoryNames = unique([...defaultCategoryNames, ...(Array.isArray(parsed.categories) ? parsed.categories.map((cat) => canonicalizeCategoryName(cat.name || cat.category || cat)) : [])].map((name) => String(name || '').trim()).filter(Boolean));
    const storeNames = unique([...defaultStoreNames, ...(Array.isArray(parsed.stores) ? parsed.stores.map((store) => store.name || store.store || store) : [])].map((name) => String(name || '').trim()).filter(Boolean));
    const categories = applyDefaultCategoryOrder(categoryNames.map((name, index) => ({ id: createId('cat'), name, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() })), true);
    const stores = storeNames.map((name, index) => ({ id: createId('store'), name, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() }));
    const budgetItems = Array.isArray(parsed.budgets) ? parsed.budgets : Array.isArray(parsed.budgetItems) ? parsed.budgetItems : [];
    // ユーザーの予算設定を優先してデフォルトと統合（順序はデフォルトに固定）
    const budgets = applyDefaultBudgetOrder(mergeBudgets(budgetItems.map(normalizeBudget).filter(Boolean), createFallbackState().budgets), true);
    const expenses = (Array.isArray(parsed.expenses) ? parsed.expenses : Array.isArray(parsed.transactions) ? parsed.transactions : []).map((item) => normalizeExpense(item, categories, stores, budgets)).filter(Boolean);
    const goals = (Array.isArray(parsed.goals) ? parsed.goals : []).map(normalizeGoal).filter(Boolean);
    const savings = (Array.isArray(parsed.savings) ? parsed.savings : []).map((item) => normalizeSaving(item, goals)).filter(Boolean);
    const pretendSavings = (Array.isArray(parsed.pretendSavings) ? parsed.pretendSavings : []).map(normalizePretendSaving).filter(Boolean);
    const pretendUses = (Array.isArray(parsed.pretendUses) ? parsed.pretendUses : []).map(normalizePretendUse).filter(Boolean);
    return normalizeState({ ...fallback, categories, stores, budgets, expenses, goals, savings, pretendSavings, pretendUses, importRules: Array.isArray(parsed.importRules) ? parsed.importRules : [], achievementsSeen: Array.isArray(parsed.achievementsSeen) ? parsed.achievementsSeen : [] });
  }

  function normalizeState(raw) {
    const fallback = createFallbackState();
    // 通常ロードではデフォルト項目を再注入しない（削除したカテゴリ・予算が復活するのを防ぐ）。
    // デフォルトの注入・並び替えは旧バージョンからの移行時（migrateOldState）のみ行う。
    const categories = Array.isArray(raw?.categories) ? raw.categories.map(normalizeCategory).filter(Boolean) : [];
    const stores = Array.isArray(raw?.stores) ? raw.stores.map(normalizeStore).filter(Boolean) : [];
    const finalCategories = categories.length ? mergeByName(categories, []) : fallback.categories;
    const finalStores = stores.length ? mergeByName(stores, []) : fallback.stores;
    const budgets = Array.isArray(raw?.budgets) ? mergeBudgets(raw.budgets.map(normalizeBudget).filter(Boolean), []) : fallback.budgets;
    const goals = Array.isArray(raw?.goals) ? raw.goals.map(normalizeGoal).filter(Boolean) : [];
    const savings = Array.isArray(raw?.savings) ? raw.savings.map((item) => normalizeSaving(item, goals)).filter(Boolean) : [];
    const expenses = Array.isArray(raw?.expenses) ? raw.expenses.map((item) => normalizeExpense(item, finalCategories, finalStores, budgets)).filter(Boolean) : [];
    const pretendSavings = Array.isArray(raw?.pretendSavings) ? raw.pretendSavings.map(normalizePretendSaving).filter(Boolean) : [];
    const pretendUses = Array.isArray(raw?.pretendUses) ? raw.pretendUses.map(normalizePretendUse).filter(Boolean) : [];
    const importRules = Array.isArray(raw?.importRules) ? raw.importRules.map(normalizeImportRule).filter(Boolean) : [];
    return { version: APP_VERSION, categories: finalCategories, stores: finalStores, budgets, expenses, goals, savings, pretendSavings, pretendUses, importRules, achievementsSeen: Array.isArray(raw?.achievementsSeen) ? raw.achievementsSeen.map(normalizeAchievementSeen).filter(Boolean) : [] };
  }

  function ensureState() { state = normalizeState(state); saveState(); }
  function saveState() { state.version = APP_VERSION; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  function switchTab(tabName) {
    els.tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === tabName));
    els.panels.forEach((panel) => panel.classList.toggle('is-active', panel.id === `tab-${tabName}`));
    if (tabName === 'import') renderImportRows();
    if (tabName === 'payments') renderMonthlyPayments();
    if (tabName === 'budget') renderBudgetsDashboard();
    if (tabName === 'compare') renderCompare();
    if (tabName === 'pretend') renderPretendSavings();
    if (tabName === 'achievements') renderAchievements();
  }

  function renderAll() {
    renderCategorySelects(); renderStoreSelects(); renderBudgetSelects(); renderSplitLines(); renderTopTotal(); renderMonthlyPayments(); renderBudgetsDashboard(); renderCompareControls(); renderCompare();
    renderHistoryFilters(); renderHistory(); renderGoalSelects(); renderGoals(); renderSavings(); renderPretendSavings();
    renderCategories(); renderStores(); renderBudgetSettings(); renderAchievements(); renderImportRows(); saveState();
  }


  // ---------- v2.5.0 カード・決済CSV明細取込 ----------
  async function handleStatementFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const parsedRows = [];
    const summaries = [];
    for (const file of files) {
      try {
        const text = decodeText(await file.arrayBuffer());
        const result = parseStatementCsv(parseCsv(text), file.name);
        parsedRows.push(...result.rows);
        summaries.push(`${result.label} ${result.rows.length}件`);
      } catch (error) {
        console.error(error);
        summaries.push(`${file.name}：未対応または読込失敗`);
      }
    }
    pendingImportRows = parsedRows;
    pendingImportRows.forEach((row, index) => { row.order = index; });
    resolvePendingImportDuplicates();
    pendingImportRows.forEach((row) => { row.phase = els.importPhaseInput.value; });
    els.importFileSummary.innerHTML = `<strong>${files.length}ファイルを確認しました</strong><span>${escapeHtml(summaries.join(' ／ '))}</span>`;
    event.target.value = '';
    renderImportRows();
    showToast(`${pendingImportRows.length}件の明細を検出しました。登録前に確認してください。`);
  }

  function parseStatementCsv(rows, filename) {
    const format = detectStatementFormat(rows);
    if (!format) throw new Error(`未対応CSV: ${filename}`);
    const parsers = {
      paypay_transactions: parsePayPayTransactions,
      paypay_card: parsePayPayCard,
      rakuten_card: parseRakutenCard,
      kabu_card: parseKabuCard,
      ucs_card: parseUcsCard
    };
    const result = parsers[format](rows, filename);
    result.rows = result.rows.map((item, index) => buildImportRow(item, index));
    return result;
  }

  function detectStatementFormat(rows) {
    const all = rows.slice(0, 15).map((row) => row.map((cell) => normalizeHeader(cell)).join('|')).join('\n');
    if (all.includes('取引日') && all.includes('出金金額(円)') && all.includes('取引内容') && all.includes('取引番号')) return 'paypay_transactions';
    if (all.includes('利用日/キャンセル日') && all.includes('利用店名・商品名')) return 'paypay_card';
    if (all.includes('支払方法コード') && all.includes('加盟店名称')) return 'ucs_card';
    if (all.includes('ご利用日') && all.includes('ご利用先など')) return 'kabu_card';
    if (all.includes('利用日') && all.includes('利用店名・商品名') && all.includes('支払総額')) return 'rakuten_card';
    return '';
  }

  function findStatementHeader(rows, required) {
    return rows.findIndex((row) => {
      const cells = row.map(normalizeHeader);
      return required.every((key) => cells.includes(normalizeHeader(key)));
    });
  }

  function statementObjects(rows, headerIndex) {
    if (headerIndex < 0) return [];
    const header = rows[headerIndex].map((cell) => String(cell || '').trim());
    return rows.slice(headerIndex + 1).filter((row) => row.some((cell) => String(cell || '').trim())).map((row, rowIndex) => ({
      ...Object.fromEntries(header.map((key, index) => [key, row[index] ?? ''])),
      __rowIndex: rowIndex
    }));
  }

  function parsePayPayTransactions(rows, filename) {
    const index = findStatementHeader(rows, ['取引日', '出金金額（円）', '取引内容', '取引先', '取引番号']);
    const items = statementObjects(rows, index).map((obj) => {
      const content = String(obj['取引内容'] || '').trim();
      const amount = parseAmount(obj['出金金額（円）']);
      const rawStore = String(obj['取引先'] || '').trim();
      const methodDetail = String(obj['取引方法'] || '').trim();
      const dateTime = normalizeStatementDateTime(obj['取引日']);
      const excluded = content !== '支払い' || !Number.isFinite(amount) || amount <= 0;
      return {
        sourceType: 'paypay_transactions', sourceLabel: 'PayPay利用履歴', sourceFile: filename,
        date: dateTime.slice(0, 10), dateTime, amount: Number.isFinite(amount) ? Math.round(amount) : 0,
        rawStore, paymentMethod: /クレジット|カード/i.test(methodDetail) ? 'カード' : '電子マネー', paymentDetail: methodDetail, externalId: String(obj['取引番号'] || '').trim(),
        componentAmounts: extractComponentAmounts(methodDetail, amount), excluded,
        reason: excluded ? (content === '支払い' ? '金額を確認できない明細' : `${content}のため支出対象外`) : '',
        originalIndex: obj.__rowIndex
      };
    });
    const active = items.filter((item) => !item.excluded).sort((a, b) => a.dateTime.localeCompare(b.dateTime));
    const grouped = [];
    active.forEach((item) => {
      const key = merchantKey(normalizeKnownStore(item.rawStore));
      const time = new Date(item.dateTime.replace(' ', 'T')).getTime();
      const existing = grouped.find((group) => group.merchantKey === key && Math.abs(group.time - time) <= 5000);
      if (existing) {
        existing.amount += item.amount;
        existing.componentAmounts = unique([...existing.componentAmounts, ...item.componentAmounts, item.amount]);
        existing.externalId = [existing.externalId, item.externalId].filter(Boolean).join('|');
        existing.paymentDetail = unique([existing.paymentDetail, item.paymentDetail]).join(' / ');
        existing.rawStore = chooseLongerMerchant(existing.rawStore, item.rawStore);
      } else grouped.push({ ...item, merchantKey: key, time });
    });
    const merged = grouped.map(({ merchantKey: _key, time: _time, ...item }) => item);
    return { label: 'PayPay利用履歴', rows: merged };
  }

  function parsePayPayCard(rows, filename) {
    const index = findStatementHeader(rows, ['利用日/キャンセル日', '利用店名・商品名', '利用金額']);
    const result = statementObjects(rows, index).map((obj) => statementCardItem({
      sourceType: 'paypay_card', sourceLabel: 'PayPayカード', sourceFile: filename,
      date: obj['利用日/キャンセル日'], rawStore: obj['利用店名・商品名'], amount: obj['利用金額'],
      paymentMethod: 'カード', paymentDetail: `${obj['決済方法'] || ''} ${obj['支払区分'] || ''}`.trim(),
      originalIndex: obj.__rowIndex
    }));
    return { label: 'PayPayカード', rows: result };
  }

  function parseRakutenCard(rows, filename) {
    const index = findStatementHeader(rows, ['利用日', '利用店名・商品名', '利用金額']);
    const result = statementObjects(rows, index).map((obj) => statementCardItem({
      sourceType: 'rakuten_card', sourceLabel: '楽天カード', sourceFile: filename,
      date: obj['利用日'], rawStore: obj['利用店名・商品名'], amount: obj['利用金額'],
      paymentMethod: 'カード', paymentDetail: String(obj['支払方法'] || '').trim(), originalIndex: obj.__rowIndex
    }));
    return { label: '楽天カード', rows: result };
  }

  function parseKabuCard(rows, filename) {
    const index = findStatementHeader(rows, ['ご利用日', 'ご利用先など', 'ご利用金額(￥)']);
    const result = statementObjects(rows, index).map((obj) => statementCardItem({
      sourceType: 'kabu_card', sourceLabel: 'KABU＆カード', sourceFile: filename,
      date: obj['ご利用日'], rawStore: obj['ご利用先など'], amount: obj['ご利用金額(￥)'],
      paymentMethod: 'カード', paymentDetail: String(obj['支払区分'] || '').trim(), originalIndex: obj.__rowIndex
    }));
    return { label: 'KABU＆カード', rows: result };
  }

  function parseUcsCard(rows, filename) {
    const index = findStatementHeader(rows, ['支払方法コード', '利用日', '加盟店名称', '利用金額']);
    const result = statementObjects(rows, index).map((obj) => statementCardItem({
      sourceType: 'ucs_card', sourceLabel: 'UCSカード', sourceFile: filename,
      date: obj['利用日'], rawStore: obj['加盟店名称'], amount: obj['利用金額'],
      paymentMethod: 'カード', paymentDetail: String(obj['支払方法'] || '').trim(), originalIndex: obj.__rowIndex
    }));
    return { label: 'UCSカード', rows: result };
  }

  function statementCardItem(item) {
    const amount = parseAmount(item.amount);
    const rawStore = String(item.rawStore || '').trim();
    const excluded = isNonExpenseMerchant(rawStore) || !Number.isFinite(amount) || amount <= 0;
    return {
      ...item, date: normalizeStatementDate(item.date), amount: Number.isFinite(amount) ? Math.round(amount) : 0,
      rawStore, externalId: `${item.sourceType}|${normalizeStatementDate(item.date)}|${merchantKey(rawStore)}|${Math.round(amount || 0)}|${item.originalIndex}`,
      componentAmounts: Number.isFinite(amount) ? [Math.round(amount)] : [], excluded,
      reason: excluded ? (isNonExpenseMerchant(rawStore) ? 'チャージ・投資などの資産移動' : '金額を確認できない明細') : ''
    };
  }

  function buildImportRow(item, index) {
    const classification = { ...classifyImportedMerchant(item) };
    if (!state.categories.some((category) => category.name === classification.categoryName)) {
      classification.categoryName = state.categories.some((category) => category.name === 'その他') ? 'その他' : state.categories[0]?.name || 'その他';
      classification.budgetName = '';
      classification.needsReview = true;
      classification.reason = '保存済みカテゴリが見つからないため再確認が必要です';
    }
    if (classification.budgetName && !state.budgets.some((budget) => budget.name === classification.budgetName && budget.enabled !== false)) classification.budgetName = '';
    const action = item.excluded || classification.action === 'exclude' ? 'exclude' : 'register';
    const status = item.excluded || classification.action === 'exclude' ? 'excluded' : classification.needsReview ? 'review' : 'auto';
    return {
      id: createId('import'), ...item, storeName: classification.storeName, merchantKey: merchantKey(item.rawStore), duplicateStoreKey: merchantKey(classification.storeName),
      categoryName: classification.categoryName, budgetName: classification.budgetName, paymentMethod: classification.paymentMethod || item.paymentMethod,
      phase: els.importPhaseInput?.value || '旧生活', action, status, needsReview: status === 'review',
      reason: item.reason || classification.reason, learnRule: false,
      memo: classification.memo || buildImportMemo(item), order: index, initialAction: action, initialStatus: status
    };
  }

  function classifyImportedMerchant(item) {
    const key = merchantKey(item.rawStore);
    const saved = state.importRules.find((rule) => rule.merchantKey === key && (rule.sourceType === item.sourceType || rule.sourceType === '*'));
    if (saved) return { ...saved, needsReview: false, reason: '保存済みルールを適用' };
    const text = normalizeMerchantText(item.rawStore);
    const builtIns = [
      { re: /netflix/i, storeName: 'Netflix', categoryName: '映画・サブスク', budgetName: '映画・サブスク' },
      { re: /steam/i, storeName: 'Steam', categoryName: 'ゲーム代', budgetName: 'ゲーム代' },
      { re: /ソフトバンク/i, storeName: 'ソフトバンク', categoryName: '通信費', budgetName: '' },
      { re: /リトルファミリ[ー-]?.*保険/i, storeName: 'リトルファミリー少額短期保険', categoryName: '保険料', budgetName: '' },
      { re: /歯科|医院|病院|クリニック|薬局/i, storeName: normalizeKnownStore(text), categoryName: '医療費', budgetName: '' }
    ];
    const hit = builtIns.find((rule) => rule.re.test(text));
    if (hit) return { ...hit, paymentMethod: item.paymentMethod, action: 'register', needsReview: false, reason: '店名から自動分類' };
    return {
      storeName: normalizeKnownStore(text), categoryName: 'その他', budgetName: '', paymentMethod: item.paymentMethod,
      action: 'register', needsReview: true, reason: '購入内容を店名だけでは判定できません'
    };
  }

  function normalizeKnownStore(value) {
    const text = normalizeMerchantText(value);
    const known = [
      [/^dcm(?:\s|-|$)/i, 'DCM'], [/セイコーマート/i, 'セイコーマート'], [/サツドラ/i, 'サツドラ'],
      [/ニトリ/i, 'ニトリ'], [/ドン.?キホーテ/i, 'MEGAドン・キホーテ'], [/yahoo!?ショッピング/i, 'Yahoo!ショッピング'],
      [/yahoo!?フリマ|ヤフーフリマ/i, 'Yahoo!フリマ'], [/楽天24/i, '楽天24'], [/楽天.*年会費/i, '楽天カード年会費'],
      [/福田歯科医院/i, '福田歯科医院'], [/リトルファミリ[ー-]?/i, 'リトルファミリー少額短期保険'],
      [/netflix/i, 'Netflix'], [/steam/i, 'Steam'], [/ソフトバンク/i, 'ソフトバンク']
    ];
    const found = known.find(([re]) => re.test(text));
    return found ? found[1] : text || 'その他';
  }

  function resolvePendingImportDuplicates() {
    const activePayPay = pendingImportRows.filter((row) => row.sourceType === 'paypay_transactions' && row.action === 'register');
    const matchedPendingPayPay = new Set();
    const matchedExistingPayPay = new Set();
    const matchedExistingCard = new Set();
    pendingImportRows.forEach((row) => {
      const exactExisting = state.expenses.some((expense) => expense.sourceType === row.sourceType && expense.externalId && expense.externalId === row.externalId);
      if (exactExisting) return markImportDuplicate(row, '同じCSV明細を登録済みです');
      if (row.sourceType === 'paypay_card' && row.action === 'register') {
        const pendingCandidate = activePayPay.find((paypay) => !matchedPendingPayPay.has(paypay.id) && isPayPayCardMatch(paypay, row));
        if (pendingCandidate) { matchedPendingPayPay.add(pendingCandidate.id); return markImportDuplicate(row, 'PayPay利用履歴側に同じ買い物があります'); }
        const existingCandidate = state.expenses.find((expense) => expense.sourceType === 'paypay_transactions' && !matchedExistingPayPay.has(expense.id) && isExistingPayPayMatch(expense, row));
        if (existingCandidate) { matchedExistingPayPay.add(existingCandidate.id); return markImportDuplicate(row, 'PayPay利用履歴側に同じ買い物があります'); }
      }
      if (row.sourceType === 'paypay_transactions' && row.action === 'register') {
        const existingCard = state.expenses.find((expense) => expense.sourceType === 'paypay_card' && !matchedExistingCard.has(expense.id) && isExistingCardMatch(expense, row));
        if (existingCard) { matchedExistingCard.add(existingCard.id); return markImportReplacement(row, existingCard, '登録済みのPayPayカード明細を、金額情報が詳しいPayPay利用履歴へ置き換えます'); }
      }
      const samePending = row.externalId ? pendingImportRows.find((other) => other !== row && other.order < row.order && other.sourceType === row.sourceType && other.externalId === row.externalId) : null;
      if (samePending) markImportDuplicate(row, '選択したCSV内で重複しています');
    });
  }

  function isPayPayCardMatch(paypay, card) {
    if ((paypay.duplicateStoreKey || merchantKey(paypay.storeName)) !== (card.duplicateStoreKey || merchantKey(card.storeName))) return false;
    if (Math.abs(daysBetween(paypay.date, card.date)) > 20) return false;
    return paypay.amount === card.amount || (paypay.componentAmounts || []).includes(card.amount);
  }

  function isExistingPayPayMatch(expense, card) {
    const key = merchantKey(expense.storeName || expense.rawStore);
    const cardKey = card.duplicateStoreKey || merchantKey(card.storeName);
    if (key !== cardKey || Math.abs(daysBetween(expense.date, card.date)) > 20) return false;
    const components = Array.isArray(expense.componentAmounts) ? expense.componentAmounts : parseIdList(expense.componentAmounts).map(Number);
    return Number(expense.amount) === card.amount || components.includes(card.amount);
  }

  function isExistingCardMatch(expense, paypay) {
    const expenseKey = merchantKey(expense.storeName || expense.rawStore);
    const paypayKey = paypay.duplicateStoreKey || merchantKey(paypay.storeName);
    if (expenseKey !== paypayKey || Math.abs(daysBetween(expense.date, paypay.date)) > 20) return false;
    const components = Array.isArray(paypay.componentAmounts) ? paypay.componentAmounts : [];
    return Number(expense.amount) === paypay.amount || components.includes(Number(expense.amount));
  }

  function markImportDuplicate(row, reason) {
    row.action = 'exclude'; row.status = 'duplicate'; row.needsReview = false; row.reason = reason;
  }

  function markImportReplacement(row, expense, reason) {
    row.storeName = expense.storeName || row.storeName;
    row.duplicateStoreKey = merchantKey(row.storeName);
    row.categoryName = expense.categoryName || row.categoryName;
    row.budgetName = expense.budgetName || row.budgetName;
    row.paymentMethod = expense.paymentMethod || row.paymentMethod;
    row.phase = normalizePhase(expense.phase || row.phase);
    row.memo = String(expense.memo || row.memo || '').trim();
    row.action = 'register'; row.status = 'replace'; row.needsReview = false; row.reason = reason; row.replaceExpenseId = expense.id;
  }

  function handleImportRowChange(event) {
    const target = event.target;
    const row = pendingImportRows.find((item) => item.id === target.dataset.importId);
    const field = target.dataset.importField;
    if (!row || !field) return;
    if (field === 'learnRule') row.learnRule = target.checked;
    else row[field] = target.value;
    if (field === 'categoryName') {
      const sameBudget = findBudgetByName(target.value);
      row.budgetName = sameBudget?.enabled === false ? '' : sameBudget?.name || '';
      const budgetSelect = target.closest('.import-row')?.querySelector('[data-import-field="budgetName"]');
      if (budgetSelect) budgetSelect.value = row.budgetName;
    }
    if (['storeName', 'categoryName', 'budgetName', 'paymentMethod'].includes(field)) {
      row.needsReview = false;
      if (row.action === 'register') { row.status = 'manual'; row.reason = '手動確認済み'; }
    }
    if (field === 'action' && target.value === 'register' && ['excluded', 'duplicate'].includes(row.status)) {
      row.status = 'manual'; row.reason = '手動で登録対象に変更'; row.needsReview = false;
    }
    updateImportRowElement(row, target.closest('.import-row'));
    updateImportSummary();
  }

  function updateImportRowElement(row, element) {
    if (!element) return;
    element.className = `import-row status-${row.status}${row.action === 'exclude' ? ' is-not-registering' : ''}`;
    const label = element.querySelector('.import-status');
    const reason = element.querySelector('.import-reason');
    const statusLabels = { auto: '自動分類', review: '要確認', excluded: '対象外', duplicate: '重複候補', replace: '置換予定', manual: '確認済み' };
    if (label) { label.className = `import-status ${row.status}`; label.textContent = statusLabels[row.status] || row.status; }
    if (reason) reason.textContent = row.reason || '';
  }

  function updateImportSummary() {
    const total = pendingImportRows.length;
    const register = pendingImportRows.filter((row) => row.action === 'register').length;
    const review = pendingImportRows.filter((row) => row.action === 'register' && row.needsReview).length;
    const excluded = total - register;
    els.importDetectedCount.textContent = `${total}件`;
    els.importRegisterCount.textContent = `${register}件`;
    els.importReviewCount.textContent = `${review}件`;
    els.importExcludedCount.textContent = `${excluded}件`;
    els.importRuleCount.textContent = `${state.importRules.length}件`;
    els.importRowsEmpty.classList.toggle('is-hidden', total > 0);
    els.importSelectedButton.disabled = register === 0;
  }

  function renderImportRows() {
    if (!els.importRowList) return;
    updateImportSummary();
    els.importRowList.innerHTML = pendingImportRows.map(renderImportRow).join('');
  }

  function renderImportRow(row) {
    const categories = state.categories.map((item) => `<option value="${escapeHtml(item.name)}" ${item.name === row.categoryName ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
    const budgets = ['<option value="">予算枠なし</option>', ...state.budgets.filter((item) => item.enabled !== false).map((item) => `<option value="${escapeHtml(item.name)}" ${item.name === row.budgetName ? 'selected' : ''}>${escapeHtml(item.name)}</option>`)].join('');
    const methods = paymentMethods.map((method) => `<option value="${escapeHtml(method)}" ${method === row.paymentMethod ? 'selected' : ''}>${escapeHtml(method)}</option>`).join('');
    const statusLabels = { auto: '自動分類', review: '要確認', excluded: '対象外', duplicate: '重複候補', replace: '置換予定', manual: '確認済み' };
    return `<article class="import-row status-${escapeHtml(row.status)}${row.action === 'exclude' ? ' is-not-registering' : ''}">
      <div class="import-row-top">
        <div><span class="pill">${escapeHtml(row.sourceLabel)}</span><strong>${escapeHtml(row.rawStore || '名称なし')}</strong><span class="meta">${escapeHtml(row.date)} ／ ${escapeHtml(row.sourceFile)}</span></div>
        <div class="import-amount"><strong>${formatYen(row.amount)}</strong><span class="import-status ${escapeHtml(row.status)}">${escapeHtml(statusLabels[row.status] || row.status)}</span></div>
      </div>
      <p class="import-reason">${escapeHtml(row.reason || '')}</p>
      <div class="grid three import-edit-grid">
        <label><span>登録</span><select data-import-id="${escapeHtml(row.id)}" data-import-field="action"><option value="register" ${row.action === 'register' ? 'selected' : ''}>家計簿へ登録</option><option value="exclude" ${row.action === 'exclude' ? 'selected' : ''}>登録しない</option></select></label>
        <label><span>利用日</span><input type="date" value="${escapeHtml(row.date)}" data-import-id="${escapeHtml(row.id)}" data-import-field="date"></label>
        <label><span>統一後の店名</span><input value="${escapeHtml(row.storeName)}" data-import-id="${escapeHtml(row.id)}" data-import-field="storeName"></label>
        <label><span>カテゴリ</span><select data-import-id="${escapeHtml(row.id)}" data-import-field="categoryName">${categories}</select></label>
        <label><span>予算枠</span><select data-import-id="${escapeHtml(row.id)}" data-import-field="budgetName">${budgets}</select></label>
        <label><span>支払方法</span><select data-import-id="${escapeHtml(row.id)}" data-import-field="paymentMethod">${methods}</select></label>
        <label><span>生活フェーズ</span><select data-import-id="${escapeHtml(row.id)}" data-import-field="phase"><option value="旧生活" ${row.phase === '旧生活' ? 'selected' : ''}>旧生活</option><option value="新生活" ${row.phase === '新生活' ? 'selected' : ''}>新生活</option></select></label>
        <label class="import-memo-field"><span>メモ</span><input value="${escapeHtml(row.memo || '')}" data-import-id="${escapeHtml(row.id)}" data-import-field="memo"></label>
        <label class="check-label import-learn-field"><span>次回の自動化</span><label class="check-row"><input type="checkbox" ${row.learnRule ? 'checked' : ''} data-import-id="${escapeHtml(row.id)}" data-import-field="learnRule"><span>次回もこの分類を使う</span></label></label>
      </div>
    </article>`;
  }

  function importSelectedTransactions() {
    const selected = pendingImportRows.filter((row) => row.action === 'register');
    if (!selected.length) return showToast('登録予定の明細がありません。');
    let added = 0; let replaced = 0; let skipped = 0;
    selected.forEach((row) => {
      if (!row.date || !row.storeName || !row.categoryName || !Number.isFinite(Number(row.amount)) || Number(row.amount) <= 0) { skipped += 1; return; }
      if (state.expenses.some((expense) => expense.sourceType === row.sourceType && expense.externalId && expense.externalId === row.externalId)) { skipped += 1; return; }
      const category = addCategoryIfMissing(row.categoryName);
      const store = addStoreIfMissing(row.storeName);
      const budget = state.budgets.find((item) => item.name === row.budgetName);
      const replacement = row.replaceExpenseId ? state.expenses.find((expense) => expense.id === row.replaceExpenseId) : null;
      const payload = {
        date: row.date, amount: Math.round(Number(row.amount)), categoryId: category.id, categoryName: category.name,
        storeId: store.id, storeName: store.name, paymentMethod: normalizePaymentMethod(row.paymentMethod), phase: normalizePhase(row.phase),
        isAllowanceExpense: budget?.name === 'お小遣い', budgetId: budget?.id || '', budgetName: budget?.name || '', receiptGroupId: '', receiptTotal: '',
        memo: String(row.memo || '').trim(), sourceType: row.sourceType, sourceLabel: row.sourceLabel, sourceFile: row.sourceFile,
        externalId: row.externalId, rawStore: row.rawStore, merchantKey: row.merchantKey, componentAmounts: row.componentAmounts || [], updatedAt: nowIso()
      };
      if (replacement) { Object.assign(replacement, payload); replaced += 1; }
      else { state.expenses.push({ id: createId('exp'), ...payload, createdAt: nowIso() }); added += 1; }
      if (row.learnRule) saveImportRule(row);
    });
    pendingImportRows.filter((row) => row.action === 'exclude' && row.learnRule).forEach(saveImportRule);
    const firstMonth = selected[0] ? monthKey(selected[0].date) : '';
    pendingImportRows = [];
    if (firstMonth) { els.historyMonthInput.value = firstMonth; els.paymentsMonthInput.value = firstMonth; }
    renderAll();
    switchTab('payments');
    showToast(`${added}件を追加しました。${replaced ? `${replaced}件はPayPay利用履歴へ置き換えました。` : ''}${skipped ? `${skipped}件は重複・入力不足で見送りました。` : ''}`);
  }

  function saveImportRule(row) {
    const rule = normalizeImportRule({
      id: createId('importrule'), sourceType: row.sourceType, merchantKey: row.merchantKey,
      storeName: row.storeName, categoryName: row.categoryName, budgetName: row.budgetName,
      paymentMethod: row.paymentMethod, action: row.action, createdAt: nowIso(), updatedAt: nowIso()
    });
    if (!rule) return;
    const existing = state.importRules.find((item) => item.sourceType === rule.sourceType && item.merchantKey === rule.merchantKey);
    if (existing) Object.assign(existing, rule, { id: existing.id, updatedAt: nowIso() });
    else state.importRules.push(rule);
  }

  function clearPendingImports() {
    pendingImportRows = [];
    els.importFileSummary.innerHTML = '<strong>まだCSVを選択していません</strong><span>カード会社ごとの形式を自動判定します。</span>';
    renderImportRows();
  }

  function selectRegisterableRows() {
    pendingImportRows.forEach((row) => {
      row.action = row.initialAction === 'register' ? 'register' : 'exclude';
    });
    renderImportRows();
  }

  function excludeAllImportRows() { pendingImportRows.forEach((row) => { row.action = 'exclude'; }); renderImportRows(); }

  function resetImportRules() {
    if (!state.importRules.length) return showToast('保存済みの店名ルールはありません。');
    if (!confirm('保存した店名・分類ルールをすべて初期化しますか？\n登録済みの支出データは消えません。')) return;
    state.importRules = []; saveState(); renderImportRows(); showToast('店名ルールを初期化しました。');
  }

  function buildImportMemo(item) {
    const detail = String(item.paymentDetail || '').trim();
    return detail ? `CSV取込：${item.sourceLabel} / ${detail}` : `CSV取込：${item.sourceLabel}`;
  }

  function normalizeHeader(value) { return normalizeMerchantText(value).replace(/[（）]/g, (char) => char === '（' ? '(' : ')'); }
  function normalizeMerchantText(value) { return String(value || '').normalize('NFKC').replace(/[‐‑‒–—―－]/g, '-').replace(/\s+/g, ' ').trim(); }
  function merchantKey(value) { return normalizeMerchantText(value).toLowerCase().replace(/[!！'"“”‘’・.,，。()（）\[\]\s_-]/g, ''); }
  function chooseLongerMerchant(a, b) { return normalizeMerchantText(a).length >= normalizeMerchantText(b).length ? a : b; }
  function isNonExpenseMerchant(value) { return /チャージ|投信積立|証券.*積立|ポイント運用|ポイント.*獲得/i.test(normalizeMerchantText(value)); }
  function normalizeStatementDate(value) {
    const text = normalizeMerchantText(value);
    const compact = text.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
    const match = text.match(/(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);
    return match ? `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}` : '';
  }
  function normalizeStatementDateTime(value) {
    const text = normalizeMerchantText(value);
    const date = normalizeStatementDate(text);
    const time = text.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    return `${date} ${time ? `${String(time[1]).padStart(2, '0')}:${time[2]}:${time[3]}` : '00:00:00'}`;
  }
  function extractComponentAmounts(detail, total) {
    const values = Array.from(String(detail || '').matchAll(/([\d,]+)円/g)).map((match) => parseAmount(match[1])).filter((value) => Number.isFinite(value) && value > 0).map(Math.round);
    if (Number.isFinite(Number(total)) && Number(total) > 0) values.push(Math.round(Number(total)));
    return unique(values);
  }
  function daysBetween(a, b) { return Math.round((new Date(`${a}T00:00:00`) - new Date(`${b}T00:00:00`)) / 86400000); }

  function handleExpenseSubmit(event) {
    event.preventDefault();
    if (els.splitModeInput.checked) return handleSplitExpenseSubmit();
    const amount = Number(els.amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) return showToast('金額を入力してください。');
    const category = getCategory(els.categoryInput.value) || state.categories[0];
    const store = getStore(els.storeInput.value) || state.stores[0];
    const budget = getBudget(els.budgetInput.value);
    const phase = normalizePhase(els.phaseInput.value);
    const isAllowance = Boolean(els.allowanceInput.checked);
    const payload = {
      date: els.dateInput.value,
      amount: Math.round(amount),
      categoryId: category.id, categoryName: category.name,
      storeId: store.id, storeName: store.name,
      paymentMethod: normalizePaymentMethod(els.paymentMethodInput.value),
      phase,
      isAllowanceExpense: isAllowance,
      budgetId: budget?.id || '',
      budgetName: budget?.name || '',
      receiptGroupId: '',
      receiptTotal: '',
      memo: els.memoInput.value.trim(),
      updatedAt: nowIso()
    };
    if (!payload.date) return showToast('日付を入力してください。');
    const editId = els.editId.value;
    if (editId) {
      const existing = state.expenses.find((item) => item.id === editId);
      if (!existing) return showToast('編集対象が見つかりません。');
      // 分割レシート由来の項目は、通常編集してもグループ情報とレシート合計を維持する
      const { receiptGroupId, receiptTotal, ...editablePayload } = payload;
      Object.assign(existing, editablePayload);
      showToast('支出を更新しました。');
    } else {
      state.expenses.push({ id: createId('exp'), ...payload, createdAt: nowIso() });
      showToast('支出を保存しました。');
    }
    resetExpenseForm({ keepDate: true, keepCategory: true, keepStore: true, keepPhase: true });
    renderAll();
  }

  function handleSplitExpenseSubmit() {
    const date = els.dateInput.value;
    if (!date) return showToast('日付を入力してください。');
    const store = getStore(els.storeInput.value) || state.stores[0];
    const phase = normalizePhase(els.phaseInput.value);
    const paymentMethod = normalizePaymentMethod(els.paymentMethodInput.value);
    const rows = collectSplitRows().filter((row) => row.amount > 0);
    if (rows.length < 2) return showToast('分割入力は2行以上入力してください。');
    const receiptTotal = Math.round(Number(els.receiptTotalInput.value || 0));
    const lineTotal = sum(rows.map((row) => row.amount));
    if (receiptTotal > 0 && receiptTotal !== lineTotal && !confirm(`レシート合計と内訳合計に差額があります。\nレシート合計：${formatYen(receiptTotal)}\n内訳合計：${formatYen(lineTotal)}\nこのまま保存しますか？`)) return;
    const groupId = createId('receipt');
    rows.forEach((row) => {
      const category = getCategory(row.categoryId) || state.categories[0];
      const budget = getBudget(row.budgetId);
      state.expenses.push({
        id: createId('exp'), date, amount: row.amount,
        categoryId: category.id, categoryName: category.name,
        storeId: store.id, storeName: store.name,
        paymentMethod, phase,
        isAllowanceExpense: row.isAllowanceExpense,
        budgetId: budget?.id || '', budgetName: budget?.name || '',
        receiptGroupId: groupId,
        receiptTotal: receiptTotal || lineTotal,
        memo: row.memo,
        createdAt: nowIso(), updatedAt: nowIso()
      });
    });
    resetExpenseForm({ keepDate: true, keepStore: true, keepPhase: true });
    showToast(`分割レシートを${rows.length}件保存しました。`);
    renderAll();
  }

  function collectSplitRows() {
    return $$('.split-line').map((line) => {
      const amount = Math.round(Number(line.querySelector('[data-split-amount]')?.value || 0));
      const categoryId = line.querySelector('[data-split-category]')?.value || state.categories[0]?.id || '';
      const budgetId = line.querySelector('[data-split-budget]')?.value || '';
      const isAllowanceExpense = Boolean(line.querySelector('[data-split-allowance]')?.checked);
      const memo = line.querySelector('[data-split-memo]')?.value.trim() || '';
      return { amount, categoryId, budgetId, isAllowanceExpense, memo };
    });
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
    els.budgetInput.value = '';
    els.allowanceInput.checked = false;
    els.splitModeInput.checked = false;
    els.receiptTotalInput.value = '';
    renderSplitLines();
    handleSplitModeToggle();
  }

  function editExpense(id) {
    const item = state.expenses.find((expense) => expense.id === id);
    if (!item) return;
    els.splitModeInput.checked = false;
    handleSplitModeToggle();
    els.editId.value = item.id; els.dateInput.value = item.date; els.amountInput.value = item.amount;
    els.categoryInput.value = item.categoryId; els.storeInput.value = item.storeId; els.paymentMethodInput.value = item.paymentMethod;
    els.phaseInput.value = normalizePhase(item.phase); els.memoInput.value = item.memo || '';
    els.budgetInput.value = item.budgetId || '';
    els.allowanceInput.checked = Boolean(item.isAllowanceExpense);
    els.saveButton.textContent = '更新';
    switchTab('input'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteExpense(id) {
    if (!confirm('この支出を削除しますか？')) return;
    state.expenses = state.expenses.filter((item) => item.id !== id);
    renderAll(); showToast('支出を削除しました。');
  }

  function handleAllowanceToggle() {
    if (!els.allowanceInput.checked) return;
    const allowance = findBudgetByName('お小遣い');
    if (allowance) els.budgetInput.value = allowance.id;
  }

  function syncAllowanceFromBudget() {
    const budget = getBudget(els.budgetInput.value);
    els.allowanceInput.checked = budget?.name === 'お小遣い';
  }

  function handleSplitModeToggle() {
    const enabled = Boolean(els.splitModeInput.checked);
    els.splitEntryPanel.classList.toggle('is-hidden', !enabled);
    $$('.normal-entry-only').forEach((el) => el.classList.toggle('is-hidden', enabled));
    els.amountInput.required = !enabled;
    els.categoryInput.required = !enabled;
    if (enabled && $$('.split-line').length < 2) renderSplitLines();
    updateSplitTotals();
  }

  function renderSplitLines(rows = null) {
    const lineRows = rows || [createBlankSplitLine(), createBlankSplitLine()];
    els.splitLineList.innerHTML = lineRows.map((row, index) => renderSplitLine(row, index)).join('');
    bindSplitLineEvents();
    updateSplitTotals();
  }

  function renderSplitLine(row, index) {
    const categoryOptions = state.categories.map((cat) => `<option value="${escapeHtml(cat.id)}" ${row.categoryId === cat.id ? 'selected' : ''}>${escapeHtml(cat.name)}</option>`).join('');
    const budgetOptions = budgetOptionsHtml(row.budgetId);
    return `<div class="split-line" data-index="${index}">
      <div class="split-line-head"><strong>内訳${index + 1}</strong><button type="button" class="icon-button" data-remove-split="${index}">削除</button></div>
      <div class="grid two compact">
        <label><span>金額</span><input type="number" data-split-amount inputmode="numeric" min="0" step="1" value="${escapeHtml(row.amount || '')}" placeholder="例：5000"></label>
        <label><span>カテゴリ</span><select data-split-category>${categoryOptions}</select></label>
      </div>
      <div class="grid two compact">
        <label><span>予算枠</span><select data-split-budget>${budgetOptions}</select></label>
        <label class="check-label"><span>出どころ</span><label class="check-row"><input type="checkbox" data-split-allowance ${row.isAllowanceExpense ? 'checked' : ''}><span>お小遣いから</span></label></label>
      </div>
      <label><span>メモ</span><input data-split-memo value="${escapeHtml(row.memo || '')}" placeholder="例：食品 / ウイスキー"></label>
    </div>`;
  }

  function bindSplitLineEvents() {
    $$('[data-split-amount], [data-split-budget], [data-split-allowance], [data-split-memo]').forEach((input) => input.addEventListener('input', updateSplitTotals));
    $$('[data-split-category]').forEach((input) => input.addEventListener('change', (event) => {
      const line = event.target.closest('.split-line');
      if (!line || line.querySelector('[data-split-allowance]')?.checked) return;
      const cat = getCategory(event.target.value);
      const budget = cat ? findBudgetByName(cat.name) : null;
      if (budget && budget.enabled !== false) line.querySelector('[data-split-budget]').value = budget.id;
      updateSplitTotals();
    }));
    $$('[data-split-allowance]').forEach((input) => input.addEventListener('change', (event) => {
      if (!event.target.checked) return;
      const line = event.target.closest('.split-line');
      const allowance = findBudgetByName('お小遣い');
      if (allowance) line.querySelector('[data-split-budget]').value = allowance.id;
      updateSplitTotals();
    }));
    $$('[data-split-budget]').forEach((input) => input.addEventListener('change', (event) => {
      const line = event.target.closest('.split-line');
      const budget = getBudget(event.target.value);
      line.querySelector('[data-split-allowance]').checked = budget?.name === 'お小遣い';
    }));
    $$('[data-remove-split]').forEach((button) => button.addEventListener('click', () => removeSplitLine(Number(button.dataset.removeSplit))));
  }

  function addSplitLine() {
    const rows = collectSplitRows();
    rows.push(createBlankSplitLine());
    renderSplitLines(rows);
  }

  function removeSplitLine(index) {
    const rows = collectSplitRows();
    if (rows.length <= 2) return showToast('分割入力は最低2行必要です。');
    rows.splice(index, 1);
    renderSplitLines(rows);
  }

  function createBlankSplitLine() {
    return { amount: '', categoryId: state.categories[0]?.id || '', budgetId: '', isAllowanceExpense: false, memo: '' };
  }

  function updateSplitTotals() {
    if (!els.splitLineTotal) return;
    const lineTotal = sum(collectSplitRows().map((row) => row.amount));
    const receiptTotal = Math.round(Number(els.receiptTotalInput.value || 0));
    const diff = receiptTotal ? lineTotal - receiptTotal : 0;
    els.splitLineTotal.textContent = formatYen(lineTotal);
    els.splitDiffTotal.textContent = receiptTotal ? formatSignedYen(diff) : formatYen(0);
    els.splitDiffTotal.className = !receiptTotal ? '' : diff === 0 ? 'positive' : 'negative';
    els.splitDiffMessage.textContent = !receiptTotal ? 'レシート合計を入れると照合できます' : diff === 0 ? '✅ レシート合計と一致' : '⚠ レシート合計と内訳合計が一致していません';
  }

  function handleNewCategoryInline() {
    const name = els.newCategoryInput.value.trim();
    if (!name) return;
    const category = addCategoryIfMissing(name);
    els.newCategoryInput.value = '';
    renderCategorySelects(); renderSplitLines(collectSplitRows()); els.categoryInput.value = category.id; renderCategories();
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

  function syncBudgetFromCategory() {
    if (els.allowanceInput.checked) return;
    const category = getCategory(els.categoryInput.value);
    const budget = category ? findBudgetByName(category.name) : null;
    if (budget && budget.enabled !== false) els.budgetInput.value = budget.id;
  }
  function renderStoreSelects() { els.storeInput.innerHTML = state.stores.map((store) => `<option value="${escapeHtml(store.id)}">${escapeHtml(store.name)}</option>`).join(''); }

  function renderTopTotal() {
    const total = sum(filterByMonth(state.expenses, monthKey(new Date())).map((item) => item.amount));
    els.monthTotalTop.textContent = formatYen(total);
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
    renderCompareTable(els.budgetCompare, left, right, 'budgetName');
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

  // ---------- v2.5.1 月の支払い ----------
  function renderMonthlyPayments() {
    if (!els.paymentsMonthInput) return;
    const month = els.paymentsMonthInput.value || monthKey(new Date());
    const phase = els.paymentsPhaseInput.value;
    const items = state.expenses
      .filter((item) => monthKey(item.date) === month)
      .filter((item) => !phase || normalizePhase(item.phase) === phase)
      .sort((a, b) => b.date.localeCompare(a.date) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    const total = sum(items.map((item) => item.amount));
    const largest = items.reduce((max, item) => !max || Number(item.amount) > Number(max.amount) ? item : max, null);
    els.paymentsTotal.textContent = formatYen(total);
    els.paymentsCount.textContent = `${items.length}件`;
    els.paymentsAverage.textContent = formatYen(items.length ? Math.round(total / items.length) : 0);
    els.paymentsLargest.textContent = formatYen(largest?.amount || 0);
    els.paymentsLargestLabel.textContent = largest ? `${largest.storeName || 'その他'} / ${largest.date}` : '-';
    els.paymentsMonthLabel.textContent = `${formatMonthLabel(month)}${phase ? `・${phase}` : ''}`;
    renderPaymentBreakdown(els.paymentsMethodBreakdown, items, 'paymentMethod');
    renderPaymentBreakdown(els.paymentsCategoryBreakdown, items, 'categoryName');
    renderPaymentBreakdown(els.paymentsStoreBreakdown, items, 'storeName', 8);
    renderPaymentDayList(items);
  }

  function renderPaymentBreakdown(target, items, key, limit = 12) {
    const groups = groupSum(items, key);
    const rows = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, limit);
    const total = sum(items.map((item) => item.amount));
    if (!rows.length) { target.innerHTML = '<p class="hint">この月のデータはありません。</p>'; return; }
    target.innerHTML = rows.map(([label, amount]) => {
      const percent = total ? Math.round(amount / total * 100) : 0;
      return `<div class="payment-breakdown-row"><div><strong>${escapeHtml(label)}</strong><span>${percent}%</span></div><em>${formatYen(amount)}</em><div class="payment-breakdown-bar"><span style="width:${Math.min(100, percent)}%"></span></div></div>`;
    }).join('');
  }

  function renderPaymentDayList(items) {
    if (!items.length) { els.paymentsList.innerHTML = '<p class="hint">この月に登録された支払いはありません。</p>'; return; }
    const groups = items.reduce((map, item) => { (map[item.date] ||= []).push(item); return map; }, {});
    els.paymentsList.innerHTML = Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).map(([date, dayItems]) => {
      const dayTotal = sum(dayItems.map((item) => item.amount));
      return `<section class="payment-day"><div class="payment-day-head"><strong>${escapeHtml(formatJapaneseDate(date))}</strong><span>${dayItems.length}件 / ${formatYen(dayTotal)}</span></div><div class="payment-day-items">${dayItems.map(renderMonthlyPaymentItem).join('')}</div></section>`;
    }).join('');
    $$('[data-payment-edit]').forEach((button) => button.addEventListener('click', () => editExpense(button.dataset.paymentEdit)));
  }

  function renderMonthlyPaymentItem(item) {
    const source = item.sourceLabel || (item.sourceType ? 'CSV取込' : '手入力');
    const tags = [item.categoryName || '未分類', item.paymentMethod || 'その他', item.budgetName ? `予算:${item.budgetName}` : '', normalizePhase(item.phase), source].filter(Boolean);
    return `<article class="payment-item"><div><strong>${escapeHtml(item.storeName || 'その他')}</strong><div class="meta">${tags.map(escapeHtml).join(' / ')}${item.memo ? ` / ${escapeHtml(item.memo)}` : ''}</div></div><div class="payment-item-side"><strong>${formatYen(item.amount)}</strong><button type="button" class="icon-button small" data-payment-edit="${escapeHtml(item.id)}">編集</button></div></article>`;
  }

  function formatJapaneseDate(date) {
    const match = String(date || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return date || '-';
    const value = new Date(`${date}T00:00:00`);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${Number(match[2])}月${Number(match[3])}日（${weekdays[value.getDay()]}）`;
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
    els.expenseList.innerHTML = list.length ? list.map((item) => renderExpenseItem(item)).join('') : '<p class="hint">この条件の履歴はありません。</p>';
    $$('[data-edit-expense]').forEach((button) => button.addEventListener('click', () => editExpense(button.dataset.editExpense)));
    $$('[data-delete-expense]').forEach((button) => button.addEventListener('click', () => deleteExpense(button.dataset.deleteExpense)));
  }


  function renderExpenseItem(item) {
    const tags = [item.date, item.paymentMethod, item.storeName || 'その他', normalizePhase(item.phase)];
    if (item.budgetName) tags.push(`予算:${item.budgetName}`);
    if (item.isAllowanceExpense) tags.push('お小遣い');
    if (item.receiptGroupId) tags.push(`分割レシート${item.receiptTotal ? ` 合計${formatYen(item.receiptTotal)}` : ''}`);
    if (item.memo) tags.push(item.memo);
    return `<article class="transaction-item ${item.receiptGroupId ? 'split-history-item' : ''}"><div class="item-main"><strong>${escapeHtml(item.categoryName)} ${formatYen(item.amount)}</strong><div class="meta">${tags.map(escapeHtml).join(' / ')}</div></div><div class="item-actions"><button type="button" class="icon-button" data-edit-expense="${escapeHtml(item.id)}">編集</button><button type="button" class="icon-button" data-delete-expense="${escapeHtml(item.id)}">削除</button></div></article>`;
  }

  function handleGoalSubmit(event) {
    event.preventDefault();
    const title = els.goalTitleInput.value.trim(); const targetAmount = Number(els.goalTargetInput.value); const manualAmount = Number(els.goalManualInput.value || 0);
    if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) return showToast('目標名と目標金額を入力してください。');
    const savingIds = selectedGoalSavingIds();
    const payload = { title, targetAmount: Math.round(targetAmount), manualAmount: Number.isFinite(manualAmount) && manualAmount > 0 ? Math.round(manualAmount) : 0, dueDate: els.goalDueInput.value, type: ['experience', 'wish', 'reserve'].includes(els.goalTypeInput.value) ? els.goalTypeInput.value : 'experience', savingIds, memo: els.goalMemoInput.value.trim(), updatedAt: nowIso() };
    const id = els.goalIdInput.value;
    if (id) { const goal = state.goals.find((item) => item.id === id); if (!goal) return showToast('編集対象が見つかりません。'); Object.assign(goal, payload); showToast('目標を更新しました。'); }
    else { state.goals.push({ id: createId('goal'), ...payload, createdAt: nowIso() }); showToast('目標を保存しました。'); }
    resetGoalForm(); renderAll();
  }

  function renderGoalSelects() {
    els.savingGoalInput.innerHTML = '<option value="">連結しない</option>' + state.goals.map((goal) => `<option value="${escapeHtml(goal.id)}">${escapeHtml(goal.title)}</option>`).join('');
    renderGoalSavingsCheckboxes(currentGoalSavingIds());
  }

  function renderGoalSavingsCheckboxes(selectedIds = []) {
    if (!els.goalSavingsInputList) return;
    if (!state.savings.length) { els.goalSavingsInputList.innerHTML = '<p class="hint">目的別貯金を登録すると、ここで貯金先として選べます。</p>'; return; }
    const selected = new Set(selectedIds);
    els.goalSavingsInputList.innerHTML = state.savings.map((saving) => `<label class="check-row saving-check"><input type="checkbox" data-goal-saving="${escapeHtml(saving.id)}" ${selected.has(saving.id) ? 'checked' : ''}><span>${escapeHtml(saving.name)} <small>${escapeHtml(savingTypeLabels[saving.type] || saving.type)} / ${formatYen(saving.balance)}</small></span></label>`).join('');
  }

  function currentGoalSavingIds() { const id = els.goalIdInput.value; const goal = id ? state.goals.find((item) => item.id === id) : null; return Array.isArray(goal?.savingIds) ? goal.savingIds : []; }
  function selectedGoalSavingIds() { return $$('[data-goal-saving]:checked').map((input) => input.dataset.goalSaving).filter((id) => state.savings.some((saving) => saving.id === id)); }

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
    const linkedNames = goal.progress.linkedSavings.map((saving) => saving.name);
    return `<article class="goal-item"><div class="item-main"><strong>${escapeHtml(goal.title)}</strong><div class="meta">${escapeHtml(goalTypeLabels[goal.type] || goal.type)} / 目標 ${formatYen(goal.targetAmount)} / 現在 ${formatYen(current)} / 残り ${formatYen(remaining)}${goal.dueDate ? ` / ${escapeHtml(goal.dueDate)}まで` : ''}${linkedNames.length ? ` / 貯金先：${escapeHtml(linkedNames.join('・'))}` : ''}</div><div class="progress"><span style="width:${percent}%"></span></div>${goal.memo ? `<p>${escapeHtml(goal.memo)}</p>` : ''}</div><div class="item-actions"><button type="button" class="icon-button" data-edit-goal="${escapeHtml(goal.id)}">編集</button><button type="button" class="icon-button" data-delete-goal="${escapeHtml(goal.id)}">削除</button></div></article>`;
  }

  function editGoal(id) {
    const goal = state.goals.find((item) => item.id === id); if (!goal) return;
    els.goalIdInput.value = goal.id; els.goalTitleInput.value = goal.title; els.goalTargetInput.value = goal.targetAmount; els.goalManualInput.value = goal.manualAmount || 0; els.goalDueInput.value = goal.dueDate || ''; els.goalTypeInput.value = goal.type; els.goalMemoInput.value = goal.memo || ''; renderGoalSavingsCheckboxes(Array.isArray(goal.savingIds) ? goal.savingIds : []); els.goalSaveButton.textContent = '目標を更新'; switchTab('goals');
  }
  function deleteGoal(id) { if (!confirm('この目標を削除しますか？')) return; state.goals = state.goals.filter((item) => item.id !== id); state.savings.forEach((saving) => { if (saving.goalId === id) saving.goalId = ''; }); renderAll(); showToast('目標を削除しました。'); }
  function resetGoalForm() { els.goalForm.reset(); els.goalIdInput.value = ''; els.goalManualInput.value = '0'; renderGoalSavingsCheckboxes([]); els.goalSaveButton.textContent = '目標を保存'; }

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
    const envelopeTotal = sum(state.savings.filter((item) => item.type === 'envelope').map((item) => item.balance)); const bankTotal = sum(state.savings.filter((item) => item.type === 'bank').map((item) => item.balance)); const linkedCount = state.savings.filter((item) => item.goalId || state.goals.some((goal) => Array.isArray(goal.savingIds) && goal.savingIds.includes(item.id))).length;
    els.envelopeSavingTotal.textContent = formatYen(envelopeTotal); els.bankSavingTotal.textContent = formatYen(bankTotal); els.savingTotal.textContent = formatYen(envelopeTotal + bankTotal); els.linkedSavingCount.textContent = `${linkedCount}件`;
    els.savingList.innerHTML = state.savings.length ? state.savings.map(renderSavingItem).join('') : '<p class="hint">目的別貯金はまだありません。</p>';
    $$('[data-edit-saving]').forEach((button) => button.addEventListener('click', () => editSaving(button.dataset.editSaving)));
    $$('[data-delete-saving]').forEach((button) => button.addEventListener('click', () => deleteSaving(button.dataset.deleteSaving)));
  }

  function renderSavingItem(saving) {
    const linkedGoals = state.goals.filter((item) => item.id === saving.goalId || (Array.isArray(item.savingIds) && item.savingIds.includes(saving.id))); const goal = linkedGoals[0]; const target = saving.targetAmount || goal?.targetAmount || 0; const percent = target ? Math.min(100, Math.round(saving.balance / target * 100)) : 0; const goalText = linkedGoals.length ? ` / 目標：${escapeHtml(linkedGoals.map((item) => item.title).join('・'))}` : '';
    return `<article class="saving-item"><div class="item-main"><strong>${escapeHtml(saving.name)}</strong><div class="meta">${escapeHtml(savingTypeLabels[saving.type] || saving.type)} / 残高 ${formatYen(saving.balance)}${target ? ` / 目安 ${formatYen(target)}` : ''}${goalText}</div>${target ? `<div class="progress"><span style="width:${percent}%"></span></div>` : ''}${saving.memo ? `<p>${escapeHtml(saving.memo)}</p>` : ''}</div><div class="item-actions"><button type="button" class="icon-button" data-edit-saving="${escapeHtml(saving.id)}">編集</button><button type="button" class="icon-button" data-delete-saving="${escapeHtml(saving.id)}">削除</button></div></article>`;
  }

  function editSaving(id) { const saving = state.savings.find((item) => item.id === id); if (!saving) return; els.savingIdInput.value = saving.id; els.savingNameInput.value = saving.name; els.savingTypeInput.value = saving.type; els.savingBalanceInput.value = saving.balance; els.savingTargetInput.value = saving.targetAmount || 0; els.savingGoalInput.value = saving.goalId || ''; els.savingMemoInput.value = saving.memo || ''; els.savingSaveButton.textContent = '貯金を更新'; switchTab('savings'); }
  function deleteSaving(id) { if (!confirm('この貯金項目を削除しますか？')) return; state.savings = state.savings.filter((item) => item.id !== id); state.goals.forEach((goal) => { if (Array.isArray(goal.savingIds) && goal.savingIds.includes(id)) { goal.savingIds = goal.savingIds.filter((savingId) => savingId !== id); goal.updatedAt = nowIso(); } }); renderAll(); showToast('貯金を削除しました。'); }
  function resetSavingForm() { els.savingForm.reset(); els.savingIdInput.value = ''; els.savingBalanceInput.value = '0'; els.savingTargetInput.value = '0'; els.savingSaveButton.textContent = '貯金を保存'; }


  function handlePretendSubmit(event) {
    event.preventDefault();
    const date = els.pretendDateInput.value;
    const amount = Number(els.pretendAmountInput.value);
    const category = els.pretendCategoryInput.value.trim();
    const thing = els.pretendThingInput.value.trim();
    if (!date || !Number.isFinite(amount) || amount <= 0 || !category || !thing) return showToast('日付・金額・ジャンル・我慢したものを入力してください。');
    const payload = {
      date,
      amount: Math.round(amount),
      category,
      thing,
      plannedUse: els.pretendPlanInput.value.trim(),
      memo: els.pretendMemoInput.value.trim(),
      updatedAt: nowIso()
    };
    const id = els.pretendIdInput.value;
    if (id) {
      const item = state.pretendSavings.find((entry) => entry.id === id);
      if (!item) return showToast('編集対象が見つかりません。');
      Object.assign(item, payload);
      showToast('使ったつもり貯金を更新しました。');
    } else {
      state.pretendSavings.push({ id: createId('pretend'), ...payload, createdAt: nowIso() });
      showToast('使ったつもり貯金を保存しました。');
    }
    resetPretendForm({ keepDate: true, keepCategory: true });
    renderAll();
  }

  function handlePretendUseSubmit(event) {
    event.preventDefault();
    const date = els.pretendUseDateInput.value;
    const amount = Number(els.pretendUseAmountInput.value);
    const purpose = els.pretendUsePurposeInput.value.trim();
    if (!date || !Number.isFinite(amount) || amount <= 0 || !purpose) return showToast('使った日・金額・使い道を入力してください。');
    const payload = {
      date,
      amount: Math.round(amount),
      purpose,
      memo: els.pretendUseMemoInput.value.trim(),
      updatedAt: nowIso()
    };
    const id = els.pretendUseIdInput.value;
    if (id) {
      const item = state.pretendUses.find((entry) => entry.id === id);
      if (!item) return showToast('編集対象が見つかりません。');
      Object.assign(item, payload);
      showToast('価値ある使い道を更新しました。');
    } else {
      state.pretendUses.push({ id: createId('pretenduse'), ...payload, createdAt: nowIso() });
      showToast('価値ある使い道を保存しました。');
    }
    resetPretendUseForm({ keepDate: true });
    renderAll();
  }

  function resetPretendForm(options = {}) {
    const keepDate = els.pretendDateInput.value;
    const keepCategory = els.pretendCategoryInput.value;
    els.pretendForm.reset();
    els.pretendIdInput.value = '';
    els.pretendDateInput.value = options.keepDate ? keepDate : dateKey(new Date());
    if (options.keepCategory) els.pretendCategoryInput.value = keepCategory;
    els.pretendSaveButton.textContent = 'つもり貯金を保存';
  }

  function resetPretendUseForm(options = {}) {
    const keepDate = els.pretendUseDateInput.value;
    els.pretendUseForm.reset();
    els.pretendUseIdInput.value = '';
    els.pretendUseDateInput.value = options.keepDate ? keepDate : dateKey(new Date());
    els.pretendUseSaveButton.textContent = '使った記録を保存';
  }

  function renderPretendSavings() {
    const month = els.pretendMonthInput.value || monthKey(new Date());
    const year = month.slice(0, 4);
    const monthItems = state.pretendSavings.filter((item) => monthKey(item.date) === month);
    const yearItems = state.pretendSavings.filter((item) => item.date.startsWith(`${year}-`));
    const lifetimeTotal = sum(state.pretendSavings.map((item) => item.amount));
    const usedTotal = sum(state.pretendUses.map((item) => item.amount));
    const remaining = lifetimeTotal - usedTotal;
    els.pretendMonthTotal.textContent = formatYen(sum(monthItems.map((item) => item.amount)));
    els.pretendYearTotal.textContent = formatYen(sum(yearItems.map((item) => item.amount)));
    els.pretendLifetimeTotal.textContent = formatYen(lifetimeTotal);
    els.pretendUsedTotal.textContent = formatYen(usedTotal);
    els.pretendRemainingTotal.textContent = formatYen(remaining);
    const fill = lifetimeTotal ? Math.max(0, Math.min(100, Math.round(remaining / lifetimeTotal * 100))) : 0;
    els.pretendMeterFill.style.width = `${fill}%`;
    renderPretendRanking(monthItems);
    renderPretendHistory(monthItems);
    renderPretendUses();
  }

  function renderPretendRanking(items) {
    const ranking = Object.entries(groupPretendByCategory(items)).sort((a, b) => b[1].amount - a[1].amount);
    if (!ranking.length) { els.pretendRankingList.innerHTML = '<p class="hint">この月のつもり貯金はまだありません。</p>'; return; }
    els.pretendRankingList.innerHTML = `<table><thead><tr><th>ジャンル</th><th>回数</th><th>我慢額</th></tr></thead><tbody>${ranking.map(([name, data]) => `<tr><td>${escapeHtml(name)}</td><td>${data.count}回</td><td>${formatYen(data.amount)}</td></tr>`).join('')}</tbody></table>`;
  }

  function groupPretendByCategory(items) {
    return items.reduce((map, item) => {
      const key = item.category || '未分類';
      if (!map[key]) map[key] = { amount: 0, count: 0 };
      map[key].amount += Number(item.amount || 0);
      map[key].count += 1;
      return map;
    }, {});
  }

  function renderPretendHistory(items) {
    const list = [...items].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    els.pretendHistoryCount.textContent = `${list.length}件`;
    els.pretendHistoryList.innerHTML = list.length ? list.map(renderPretendItem).join('') : '<p class="hint">この月の履歴はありません。</p>';
    $$('[data-edit-pretend]').forEach((button) => button.addEventListener('click', () => editPretend(button.dataset.editPretend)));
    $$('[data-delete-pretend]').forEach((button) => button.addEventListener('click', () => deletePretend(button.dataset.deletePretend)));
  }

  function renderPretendItem(item) {
    const meta = [item.date, item.category, item.plannedUse ? `回したい先:${item.plannedUse}` : '', item.memo].filter(Boolean).map(escapeHtml).join(' / ');
    return `<article class="transaction-item pretend-item"><div class="item-main"><strong>${escapeHtml(item.thing)} ${formatYen(item.amount)}</strong><div class="meta">${meta}</div></div><div class="item-actions"><button type="button" class="icon-button" data-edit-pretend="${escapeHtml(item.id)}">編集</button><button type="button" class="icon-button" data-delete-pretend="${escapeHtml(item.id)}">削除</button></div></article>`;
  }

  function renderPretendUses() {
    const list = [...state.pretendUses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 12);
    els.pretendUseList.innerHTML = list.length ? list.map(renderPretendUseItem).join('') : '<p class="hint">まだ価値ある使い道の記録はありません。</p>';
    $$('[data-edit-pretend-use]').forEach((button) => button.addEventListener('click', () => editPretendUse(button.dataset.editPretendUse)));
    $$('[data-delete-pretend-use]').forEach((button) => button.addEventListener('click', () => deletePretendUse(button.dataset.deletePretendUse)));
  }

  function renderPretendUseItem(item) {
    const meta = [item.date, item.memo].filter(Boolean).map(escapeHtml).join(' / ');
    return `<article class="transaction-item pretend-use-item"><div class="item-main"><strong>${escapeHtml(item.purpose)} ${formatYen(item.amount)}</strong><div class="meta">${meta}</div></div><div class="item-actions"><button type="button" class="icon-button" data-edit-pretend-use="${escapeHtml(item.id)}">編集</button><button type="button" class="icon-button" data-delete-pretend-use="${escapeHtml(item.id)}">削除</button></div></article>`;
  }

  function editPretend(id) {
    const item = state.pretendSavings.find((entry) => entry.id === id); if (!item) return;
    els.pretendIdInput.value = item.id; els.pretendDateInput.value = item.date; els.pretendAmountInput.value = item.amount; els.pretendCategoryInput.value = item.category; els.pretendThingInput.value = item.thing; els.pretendPlanInput.value = item.plannedUse || ''; els.pretendMemoInput.value = item.memo || ''; els.pretendSaveButton.textContent = 'つもり貯金を更新'; switchTab('pretend'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function editPretendUse(id) {
    const item = state.pretendUses.find((entry) => entry.id === id); if (!item) return;
    els.pretendUseIdInput.value = item.id; els.pretendUseDateInput.value = item.date; els.pretendUseAmountInput.value = item.amount; els.pretendUsePurposeInput.value = item.purpose; els.pretendUseMemoInput.value = item.memo || ''; els.pretendUseSaveButton.textContent = '使った記録を更新'; switchTab('pretend'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deletePretend(id) { if (!confirm('この使ったつもり貯金を削除しますか？')) return; state.pretendSavings = state.pretendSavings.filter((item) => item.id !== id); renderAll(); showToast('つもり貯金を削除しました。'); }
  function deletePretendUse(id) { if (!confirm('この使い道の記録を削除しますか？')) return; state.pretendUses = state.pretendUses.filter((item) => item.id !== id); renderAll(); showToast('使い道の記録を削除しました。'); }

  function getGoalProgress(goalId) { const goal = state.goals.find((item) => item.id === goalId); const ids = new Set(Array.isArray(goal?.savingIds) ? goal.savingIds : []); const linkedSavings = state.savings.filter((item) => item.goalId === goalId || ids.has(item.id)); const linkedAmount = sum(linkedSavings.map((item) => item.balance)); return { currentAmount: (goal?.manualAmount || 0) + linkedAmount, linkedSavings, linkedAmount }; }

  function renderBudgetSelects() {
    if (!els.budgetInput) return;
    els.budgetInput.innerHTML = '<option value="">予算対象外</option>' + state.budgets.filter((budget) => budget.enabled !== false).map((budget) => `<option value="${escapeHtml(budget.id)}">${escapeHtml(budget.name)}</option>`).join('');
    $$('[data-split-budget]').forEach((select) => { const current = select.value; select.innerHTML = budgetOptionsHtml(current); if (getBudget(current)) select.value = current; });
  }

  function budgetOptionsHtml(selectedId = '') {
    return '<option value="">予算対象外</option>' + state.budgets.filter((budget) => budget.enabled !== false).map((budget) => `<option value="${escapeHtml(budget.id)}" ${selectedId === budget.id ? 'selected' : ''}>${escapeHtml(budget.name)}</option>`).join('');
  }

  function renderBudgetsDashboard() {
    const month = els.budgetMonthInput.value || monthKey(new Date());
    const stats = getBudgetStats(month);
    els.budgetLimitTotal.textContent = formatYen(stats.limitTotal);
    els.budgetUsedTotal.textContent = formatYen(stats.usedTotal);
    els.budgetRemainTotal.textContent = formatYen(stats.remainTotal);
    els.budgetOverCount.textContent = `${stats.overCount}件`;
    els.budgetCardList.innerHTML = stats.items.length ? stats.items.map(renderBudgetCard).join('') : '<div class="card"><p class="hint">予算項目がありません。設定から追加してください。</p></div>';
  }

  function getBudgetStats(month) {
    const activeBudgets = state.budgets.filter((budget) => budget.enabled !== false);
    const monthItems = filterByMonth(state.expenses, month).filter((item) => item.budgetId);
    const items = activeBudgets.map((budget) => {
      const used = sum(monthItems.filter((item) => item.budgetId === budget.id || item.budgetName === budget.name).map((item) => item.amount));
      const limit = Math.max(0, Number(budget.monthlyLimit || 0));
      const remaining = limit - used;
      const rate = limit > 0 ? used / limit * 100 : used > 0 ? 100 : 0;
      return { budget, used, limit, remaining, rate, status: budgetStatus(rate, limit, used) };
    });
    return {
      items,
      limitTotal: sum(items.map((item) => item.limit)),
      usedTotal: sum(items.map((item) => item.used)),
      remainTotal: sum(items.map((item) => item.remaining)),
      overCount: items.filter((item) => item.status.key === 'over').length
    };
  }

  function budgetStatus(rate, limit, used) {
    if (!limit && used > 0) return { key: 'over', label: '🔥 予算未設定で使用あり' };
    if (rate >= 100) return { key: 'over', label: '🔥 予算オーバー' };
    if (rate >= 90) return { key: 'danger', label: '🚨 残りわずか' };
    if (rate >= 70) return { key: 'warn', label: '⚠ そろそろ注意' };
    return { key: 'safe', label: '✅ 通常ペース' };
  }

  function renderBudgetCard(item) {
    const percent = item.limit > 0 ? Math.min(120, Math.round(item.rate)) : item.used > 0 ? 100 : 0;
    const remainLabel = item.remaining >= 0 ? `残り ${formatYen(item.remaining)}` : `超過 ${formatYen(Math.abs(item.remaining))}`;
    return `<article class="budget-card ${escapeHtml(item.status.key)}">
      <div class="budget-card-top"><div><strong>${escapeHtml(item.budget.name)}</strong><span>${escapeHtml(item.status.label)}</span></div><em>${Math.round(item.rate)}%</em></div>
      <div class="budget-amounts"><div><span>月予算</span><strong>${formatYen(item.limit)}</strong></div><div><span>使用済み</span><strong>${formatYen(item.used)}</strong></div><div><span>${item.remaining >= 0 ? '残り' : '超過'}</span><strong class="${item.remaining < 0 ? 'negative' : 'positive'}">${formatYen(Math.abs(item.remaining))}</strong></div></div>
      <div class="progress budget-progress"><span style="width:${Math.min(100, percent)}%"></span></div>
      <p class="hint">${escapeHtml(remainLabel)}</p>
    </article>`;
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
    const budgetStats = getBudgetStats(month);
    const splitGroups = unique(state.expenses.filter((item) => item.receiptGroupId).map((item) => item.receiptGroupId));
    const trialSplitGroups = unique(state.expenses.filter((item) => item.receiptGroupId && (item.storeName || '').includes('トライアル')).map((item) => item.receiptGroupId));
    const matchedSplitGroups = splitGroups.filter((groupId) => {
      const group = state.expenses.filter((item) => item.receiptGroupId === groupId);
      const total = Number(group[0]?.receiptTotal || 0);
      return total > 0 && total === sum(group.map((item) => item.amount));
    });
    return {
      totalEntries,
      julyEntries: state.expenses.filter((item) => monthKey(item.date) === '2026-07').length,
      recordDays: unique(monthItems.map((item) => item.date)).length,
      bestStreak: calcBestStreak(dates),
      categoryCount: unique(monthItems.map((item) => item.categoryName)).length,
      storeCount: unique(monthItems.map((item) => item.storeName)).length,
      totalStoreCount: unique(state.expenses.map((item) => item.storeName)).length,
      methodCount: unique(monthItems.map((item) => item.paymentMethod)).length,
      memoEntries: state.expenses.filter((item) => item.memo).length,
      monthCount: unique(state.expenses.map((item) => monthKey(item.date))).length,
      yearCount: unique(state.expenses.map((item) => item.date.slice(0, 4))).length,
      newLifeEntries: state.expenses.filter((item) => normalizePhase(item.phase) === '新生活').length,
      whiskyEntries: state.expenses.filter((item) => item.categoryName.includes('ウイスキー') || item.categoryName.includes('酒')).length,
      gameEntries: state.expenses.filter((item) => item.categoryName.includes('ゲーム')).length,
      budgetCount: state.budgets.length,
      allowanceEntries: state.expenses.filter((item) => item.isAllowanceExpense).length,
      foodBudgetSet: state.budgets.some((item) => item.name.includes('食費') && Number(item.monthlyLimit) > 0) ? 1 : 0,
      funBudgetSet: state.budgets.some((item) => item.name.includes('娯楽') && Number(item.monthlyLimit) > 0) ? 1 : 0,
      safeBudgetCount: budgetStats.items.filter((item) => item.limit > 0 && item.used > 0 && item.rate < 70).length,
      nearBudgetCount: budgetStats.items.filter((item) => item.limit > 0 && item.rate >= 90 && item.rate < 100).length,
      overBudgetCount: budgetStats.items.filter((item) => item.status.key === 'over').length,
      splitReceiptGroups: splitGroups.length,
      trialSplitGroups: trialSplitGroups.length,
      whiskySplitEntries: state.expenses.filter((item) => item.receiptGroupId && (item.categoryName.includes('ウイスキー') || item.categoryName.includes('酒'))).length,
      matchedSplitGroups: matchedSplitGroups.length,
      pretendCount: state.pretendSavings.length,
      pretendUseCount: state.pretendUses.length,
      pretendMonthTotal: sum(filterByMonth(state.pretendSavings, month).map((item) => item.amount)),
      pretendLifetimeTotal: sum(state.pretendSavings.map((item) => item.amount)),
      pretendWhiskyCount: state.pretendSavings.filter((item) => `${item.category} ${item.thing}`.includes('ウイスキー') || `${item.category} ${item.thing}`.includes('酒')).length,
      pretendGameCount: state.pretendSavings.filter((item) => `${item.category} ${item.thing}`.includes('ゲーム') || `${item.category} ${item.thing}`.includes('課金')).length,
      goalCount: state.goals.length,
      savingCount: state.savings.length,
      linkedSavingCount: state.savings.filter((item) => item.goalId || state.goals.some((goal) => Array.isArray(goal.savingIds) && goal.savingIds.includes(item.id))).length,
      goalAchievedCount: state.goals.filter((goal) => getGoalProgress(goal.id).currentAmount >= goal.targetAmount).length
    };
  }

  function handleCategorySubmit(event) {
    event.preventDefault(); const name = canonicalizeCategoryName(els.categoryNameInput.value.trim()); if (!name) return showToast('カテゴリ名を入力してください。'); const id = els.categoryIdInput.value;
    if (id) { const category = state.categories.find((item) => item.id === id); if (!category) return showToast('編集対象が見つかりません。'); if (state.categories.some((item) => item.name === name && item.id !== id)) return showToast('同じカテゴリ名があります。'); const oldName = category.name; category.name = name; category.updatedAt = nowIso(); state.expenses.forEach((expense) => { if (expense.categoryId === id || expense.categoryName === oldName) { expense.categoryId = id; expense.categoryName = name; } }); state.budgets.forEach((budget) => { if (budget.name === oldName) { budget.name = name; budget.updatedAt = nowIso(); } }); showToast('カテゴリを更新しました。'); }
    else { addCategoryIfMissing(name); showToast('カテゴリを追加しました。'); }
    state.categories = resequenceByOrder(state.categories); resetCategoryForm(); renderAll();
  }
  function renderCategories() {
    const sorted = [...state.categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ja'));
    els.categoryList.innerHTML = sorted.map((cat, index) => `<div class="category-chip"><strong><span class="pill">${index + 1}</span> ${escapeHtml(cat.name)}</strong><div class="item-actions"><button type="button" class="icon-button" data-move-category="${escapeHtml(cat.id)}" data-dir="-1">↑</button><button type="button" class="icon-button" data-move-category="${escapeHtml(cat.id)}" data-dir="1">↓</button><button type="button" class="icon-button" data-edit-category="${escapeHtml(cat.id)}">編集</button><button type="button" class="icon-button" data-delete-category="${escapeHtml(cat.id)}">削除</button></div></div>`).join('');
    $$('[data-edit-category]').forEach((button) => button.addEventListener('click', () => editCategory(button.dataset.editCategory)));
    $$('[data-delete-category]').forEach((button) => button.addEventListener('click', () => deleteCategory(button.dataset.deleteCategory)));
    $$('[data-move-category]').forEach((button) => button.addEventListener('click', () => moveCategory(button.dataset.moveCategory, Number(button.dataset.dir))));
  }
  function editCategory(id) { const category = state.categories.find((item) => item.id === id); if (!category) return; els.categoryIdInput.value = category.id; els.categoryNameInput.value = category.name; els.categorySaveButton.textContent = 'カテゴリを更新'; }
  function moveCategory(id, dir) { const list = [...state.categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ja')); const index = list.findIndex((item) => item.id === id); const to = index + dir; if (index < 0 || to < 0 || to >= list.length) return; [list[index], list[to]] = [list[to], list[index]]; list.forEach((item, order) => { item.sortOrder = order; item.updatedAt = nowIso(); }); state.categories = list; renderAll(); }
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


  function handleBudgetSubmit(event) {
    event.preventDefault();
    const name = canonicalizeBudgetName(els.budgetNameInput.value.trim());
    const monthlyLimit = Number(els.budgetLimitInput.value || 0);
    if (!name) return showToast('予算名を入力してください。');
    if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) return showToast('月予算額は0円以上で入力してください。');
    const id = els.budgetIdInput.value;
    const enabled = els.budgetEnabledInput.value !== 'false';
    if (id) {
      const budget = state.budgets.find((item) => item.id === id);
      if (!budget) return showToast('編集対象が見つかりません。');
      if (state.budgets.some((item) => item.name === name && item.id !== id)) return showToast('同じ予算名があります。');
      const oldName = budget.name;
      Object.assign(budget, { name, monthlyLimit: Math.round(monthlyLimit), enabled, updatedAt: nowIso() });
      state.expenses.forEach((expense) => { if (expense.budgetId === id || expense.budgetName === oldName) { expense.budgetId = id; expense.budgetName = name; } });
      showToast('予算項目を更新しました。');
    } else {
      if (state.budgets.some((item) => item.name === name)) return showToast('同じ予算名があります。');
      state.budgets.push({ id: createId('budget'), name, monthlyLimit: Math.round(monthlyLimit), enabled, sortOrder: state.budgets.length, createdAt: nowIso(), updatedAt: nowIso() });
      showToast('予算項目を追加しました。');
    }
    resetBudgetForm(); renderAll();
  }

  function renderBudgetSettings() {
    const sorted = [...state.budgets].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ja'));
    els.budgetList.innerHTML = sorted.map((budget, index) => `<div class="category-chip"><strong><span class="pill">${index + 1}</span> ${escapeHtml(budget.name)} <span class="pill">${formatYen(budget.monthlyLimit || 0)}</span> ${budget.enabled === false ? '<span class="pill">OFF</span>' : ''}</strong><div class="item-actions"><button type="button" class="icon-button" data-move-budget="${escapeHtml(budget.id)}" data-dir="-1">↑</button><button type="button" class="icon-button" data-move-budget="${escapeHtml(budget.id)}" data-dir="1">↓</button><button type="button" class="icon-button" data-edit-budget="${escapeHtml(budget.id)}">編集</button><button type="button" class="icon-button" data-delete-budget="${escapeHtml(budget.id)}">削除</button></div></div>`).join('');
    $$('[data-edit-budget]').forEach((button) => button.addEventListener('click', () => editBudget(button.dataset.editBudget)));
    $$('[data-delete-budget]').forEach((button) => button.addEventListener('click', () => deleteBudget(button.dataset.deleteBudget)));
    $$('[data-move-budget]').forEach((button) => button.addEventListener('click', () => moveBudget(button.dataset.moveBudget, Number(button.dataset.dir))));
  }

  function editBudget(id) {
    const budget = getBudget(id); if (!budget) return;
    els.budgetIdInput.value = budget.id; els.budgetNameInput.value = budget.name; els.budgetLimitInput.value = budget.monthlyLimit || 0; els.budgetEnabledInput.value = budget.enabled === false ? 'false' : 'true'; els.budgetSaveButton.textContent = '予算を更新';
  }

  function moveBudget(id, dir) { const list = [...state.budgets].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ja')); const index = list.findIndex((item) => item.id === id); const to = index + dir; if (index < 0 || to < 0 || to >= list.length) return; [list[index], list[to]] = [list[to], list[index]]; list.forEach((item, order) => { item.sortOrder = order; item.updatedAt = nowIso(); }); state.budgets = list; renderAll(); }

  function deleteBudget(id) {
    const budget = getBudget(id); if (!budget) return;
    if (state.expenses.some((expense) => expense.budgetId === id)) return showToast('使用中の予算項目は削除できません。先に履歴を編集してください。');
    if (!confirm(`予算「${budget.name}」を削除しますか？`)) return;
    state.budgets = state.budgets.filter((item) => item.id !== id);
    renderAll(); showToast('予算項目を削除しました。');
  }

  function resetBudgetForm() { els.budgetForm.reset(); els.budgetIdInput.value = ''; els.budgetLimitInput.value = ''; els.budgetEnabledInput.value = 'true'; els.budgetSaveButton.textContent = '予算を保存'; }

  function importBackup(rows) {
    const objects = rowsToObjects(rows); if (!objects.length) return showToast('読み込めるデータがありません。');
    if (!('section' in objects[0])) { importExpenses(rows); return; }
    const applyImportedOrder = (list, imported) => imported.forEach((item) => { const existing = list.find((entry) => entry.name === item.name); const order = Number(item.sortOrder); if (existing && Number.isFinite(order) && order !== 999) existing.sortOrder = order; });
    const importedCategories = objects.filter((obj) => obj.section === 'category').map(normalizeCategory).filter(Boolean);
    applyImportedOrder(state.categories, importedCategories);
    state.categories = mergeByName(state.categories, importedCategories);
    const importedStores = objects.filter((obj) => obj.section === 'store').map(normalizeStore).filter(Boolean);
    applyImportedOrder(state.stores, importedStores);
    state.stores = mergeByName(state.stores, importedStores);
    const importedBudgets = objects.filter((obj) => obj.section === 'budget').map(normalizeBudget).filter(Boolean);
    importedBudgets.forEach((imported) => {
      const existing = state.budgets.find((budget) => budget.id === imported.id || budget.name === imported.name);
      if (existing) Object.assign(existing, { name: imported.name, monthlyLimit: imported.monthlyLimit, enabled: imported.enabled, updatedAt: nowIso() });
      else state.budgets.push({ ...imported, sortOrder: Number.isFinite(Number(imported.sortOrder)) && Number(imported.sortOrder) !== 999 ? Number(imported.sortOrder) : state.budgets.length });
    });
    state.budgets = resequenceByOrder(state.budgets);
    const importedGoals = objects.filter((obj) => obj.section === 'goal').map(normalizeGoal).filter(Boolean);
    mergeByIdOrSignature(state.goals, importedGoals, (goal) => `${goal.title}|${goal.targetAmount}|${goal.dueDate}`);
    const importedSavings = objects.filter((obj) => obj.section === 'saving').map((obj) => normalizeSaving(obj, state.goals)).filter(Boolean);
    mergeByIdOrSignature(state.savings, importedSavings, (saving) => `${saving.name}|${saving.type}`);
    const importedPretendSavings = objects.filter((obj) => obj.section === 'pretend_saving').map(normalizePretendSaving).filter(Boolean);
    mergeByIdOrSignature(state.pretendSavings, importedPretendSavings, pretendSignature);
    const importedPretendUses = objects.filter((obj) => obj.section === 'pretend_use').map(normalizePretendUse).filter(Boolean);
    mergeByIdOrSignature(state.pretendUses, importedPretendUses, pretendUseSignature);
    const importedRules = objects.filter((obj) => obj.section === 'import_rule').map(normalizeImportRule).filter(Boolean);
    importedRules.forEach((rule) => { const existing = state.importRules.find((item) => item.sourceType === rule.sourceType && item.merchantKey === rule.merchantKey); if (existing) Object.assign(existing, rule); else state.importRules.push(rule); });
    const importedExpenses = objects.filter((obj) => obj.section === 'expense').map((obj) => normalizeExpense(obj, state.categories, state.stores, state.budgets)).filter(Boolean);
    mergeByIdOrSignature(state.expenses, importedExpenses, expenseSignature);
    renderAll(); showToast(`一括CSVを読み込みました。支出${importedExpenses.length}件・目標${importedGoals.length}件・貯金${importedSavings.length}件・つもり貯金${importedPretendSavings.length}件・使い道${importedPretendUses.length}件・予算${importedBudgets.length}件・店名ルール${importedRules.length}件`);
  }

  function importExpenses(rows) { const imported = rowsToObjects(rows).map((obj) => normalizeExpense(obj, state.categories, state.stores, state.budgets)).filter(Boolean); mergeByIdOrSignature(state.expenses, imported, expenseSignature); renderAll(); showToast(`支出CSVから${imported.length}件読み込みました。`); }

  function importCsvFile(event, handler) {
    const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader();
    reader.onload = () => { try { const text = decodeText(reader.result); const rows = parseCsv(text); handler(rows); } catch (error) { console.error(error); showToast('CSVの読み込みに失敗しました。'); } finally { event.target.value = ''; } };
    reader.readAsArrayBuffer(file);
  }

  function backupToRows() {
    const header = ['section', 'id', 'date', 'amount', 'category', 'payment_method', 'store', 'phase', 'budget_name', 'budget_id', 'is_allowance_expense', 'receipt_group_id', 'receipt_total', 'title', 'target_amount', 'manual_amount', 'due_date', 'type', 'balance', 'monthly_limit', 'enabled', 'sort_order', 'linked_goal_title', 'linked_goal_id', 'linked_saving_titles', 'linked_saving_ids', 'thing', 'planned_use', 'purpose', 'memo', 'source_type', 'source_label', 'source_file', 'external_id', 'raw_store', 'merchant_key', 'component_amounts', 'rule_action', 'created_at', 'updated_at'];
    const rows = [header];
    const pushRow = (data) => rows.push(header.map((key) => data[key] ?? ''));
    state.expenses.forEach((item) => pushRow({ section: 'expense', id: item.id, date: item.date, amount: item.amount, category: item.categoryName, payment_method: item.paymentMethod, store: item.storeName, phase: normalizePhase(item.phase), budget_name: item.budgetName || '', budget_id: item.budgetId || '', is_allowance_expense: item.isAllowanceExpense ? 'true' : 'false', receipt_group_id: item.receiptGroupId || '', receipt_total: item.receiptTotal || '', memo: item.memo || '', source_type: item.sourceType || '', source_label: item.sourceLabel || '', source_file: item.sourceFile || '', external_id: item.externalId || '', raw_store: item.rawStore || '', merchant_key: item.merchantKey || '', component_amounts: Array.isArray(item.componentAmounts) ? item.componentAmounts.join(' | ') : item.componentAmounts || '', created_at: item.createdAt, updated_at: item.updatedAt }));
    state.goals.forEach((item) => { const linked = getGoalProgress(item.id).linkedSavings; pushRow({ section: 'goal', id: item.id, title: item.title, target_amount: item.targetAmount, manual_amount: item.manualAmount || 0, due_date: item.dueDate || '', type: item.type, linked_saving_titles: linked.map((saving) => saving.name).join(' | '), linked_saving_ids: (item.savingIds || []).join(' | '), memo: item.memo || '', created_at: item.createdAt, updated_at: item.updatedAt }); });
    state.savings.forEach((item) => pushRow({ section: 'saving', id: item.id, title: item.name, target_amount: item.targetAmount || 0, type: item.type, balance: item.balance, linked_goal_title: getGoal(item.goalId)?.title || '', linked_goal_id: item.goalId || '', memo: item.memo || '', created_at: item.createdAt, updated_at: item.updatedAt }));
    state.pretendSavings.forEach((item) => pushRow({ section: 'pretend_saving', id: item.id, date: item.date, amount: item.amount, category: item.category, thing: item.thing, planned_use: item.plannedUse || '', memo: item.memo || '', created_at: item.createdAt, updated_at: item.updatedAt }));
    state.pretendUses.forEach((item) => pushRow({ section: 'pretend_use', id: item.id, date: item.date, amount: item.amount, purpose: item.purpose, memo: item.memo || '', created_at: item.createdAt, updated_at: item.updatedAt }));
    state.categories.forEach((item) => pushRow({ section: 'category', id: item.id, category: item.name, sort_order: item.sortOrder, created_at: item.createdAt, updated_at: item.updatedAt }));
    state.stores.forEach((item) => pushRow({ section: 'store', id: item.id, store: item.name, sort_order: item.sortOrder, created_at: item.createdAt, updated_at: item.updatedAt }));
    state.budgets.forEach((item) => pushRow({ section: 'budget', id: item.id, budget_name: item.name, budget_id: item.id, title: item.name, monthly_limit: item.monthlyLimit, enabled: item.enabled ? 'true' : 'false', sort_order: item.sortOrder, created_at: item.createdAt, updated_at: item.updatedAt }));
    state.importRules.forEach((item) => pushRow({ section: 'import_rule', id: item.id, source_type: item.sourceType, merchant_key: item.merchantKey, store: item.storeName, category: item.categoryName, budget_name: item.budgetName || '', payment_method: item.paymentMethod || '', rule_action: item.action || 'register', created_at: item.createdAt, updated_at: item.updatedAt }));
    return rows;
  }

  function expensesToRows(items) { return [['id', 'date', 'amount', 'category', 'payment_method', 'store', 'phase', 'budget_name', 'budget_id', 'is_allowance_expense', 'receipt_group_id', 'receipt_total', 'memo', 'created_at', 'updated_at'], ...items.map((item) => [item.id, item.date, item.amount, item.categoryName, item.paymentMethod, item.storeName, normalizePhase(item.phase), item.budgetName || '', item.budgetId || '', item.isAllowanceExpense ? 'true' : 'false', item.receiptGroupId || '', item.receiptTotal || '', item.memo, item.createdAt, item.updatedAt])]; }

  function resetAllData() {
    if (!confirm('全データを初期化しますか？\nCSVを書き出していないデータは戻せません。')) return;
    localStorage.removeItem(STORAGE_KEY); state = createFallbackState(); pendingImportRows = []; const today = new Date(); const thisMonth = monthKey(today);
    els.dateInput.value = dateKey(today); els.historyMonthInput.value = thisMonth; els.paymentsMonthInput.value = thisMonth; els.budgetMonthInput.value = thisMonth; els.pretendMonthInput.value = thisMonth; els.pretendDateInput.value = dateKey(today); els.pretendUseDateInput.value = dateKey(today); els.achievementMonthInput.value = thisMonth; resetExpenseForm(); resetGoalForm(); resetSavingForm(); resetPretendForm(); resetPretendUseForm(); resetCategoryForm(); resetStoreForm(); resetBudgetForm(); setComparePreset('month'); renderAll(); showToast('初期化しました。');
  }

  function normalizeExpense(item, categories, stores, budgets) {
    const date = String(item.date || item['日付'] || '').slice(0, 10); const amount = parseAmount(item.amount ?? item['金額']); if (!date || !Number.isFinite(amount) || amount <= 0) return null;
    const categoryName = canonicalizeCategoryName(String(item.category || item.categoryName || item.category_name || item['カテゴリ'] || 'その他').trim() || 'その他'); const category = findOrCreateNamedInList(categories, categoryName, 'cat');
    const storeName = String(item.store || item.storeName || item.store_name || item.shop || item.shop_name || item['お店'] || item['店舗'] || item['支払先'] || guessStoreFromMemo(item.memo || item['メモ']) || 'その他').trim() || 'その他'; const store = findOrCreateNamedInList(stores, storeName, 'store');
    const guessedMethod = guessMethodFromOldItem(item); let method = item.paymentMethod || item.payment_method || item['支払方法'] || item.method || '';
    if (guessedMethod === 'カード' || guessedMethod === '口座引き落とし') method = guessedMethod; if (!method) method = guessedMethod;
    const budgetNameRaw = canonicalizeBudgetName(String(item.budgetName || item.budget_name || item.budget || item['予算枠'] || '').trim());
    const budgetIdRaw = String(item.budgetId || item.budget_id || '').trim();
    const budget = (budgets || []).find((entry) => entry.id === budgetIdRaw || entry.name === budgetNameRaw);
    const allowanceRaw = item.isAllowanceExpense ?? item.is_allowance_expense ?? item['お小遣いから支出'] ?? false;
    const isAllowanceExpense = allowanceRaw === true || String(allowanceRaw).toLowerCase() === 'true' || String(allowanceRaw) === '1' || String(allowanceRaw).includes('はい');
    const receiptGroupId = String(item.receiptGroupId || item.receipt_group_id || '').trim();
    const receiptTotal = parseAmount(item.receiptTotal ?? item.receipt_total ?? 0);
    const componentRaw = item.componentAmounts ?? item.component_amounts ?? '';
    const componentAmounts = Array.isArray(componentRaw) ? componentRaw.map(Number).filter(Number.isFinite) : parseIdList(componentRaw).map(Number).filter(Number.isFinite);
    return { id: item.id || createId('exp'), date, amount: Math.round(amount), categoryId: category.id, categoryName: category.name, storeId: store.id, storeName: store.name, paymentMethod: normalizePaymentMethod(method), phase: normalizePhase(item.phase || item['生活フェーズ']), isAllowanceExpense, budgetId: budget?.id || '', budgetName: budget?.name || budgetNameRaw || '', receiptGroupId, receiptTotal: Number.isFinite(receiptTotal) && receiptTotal > 0 ? Math.round(receiptTotal) : '', memo: String(item.memo || item['メモ'] || '').trim(), sourceType: String(item.sourceType || item.source_type || '').trim(), sourceLabel: String(item.sourceLabel || item.source_label || '').trim(), sourceFile: String(item.sourceFile || item.source_file || '').trim(), externalId: String(item.externalId || item.external_id || '').trim(), rawStore: String(item.rawStore || item.raw_store || '').trim(), merchantKey: String(item.merchantKey || item.merchant_key || '').trim(), componentAmounts, createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() };
  }

  function normalizeGoal(item) { const title = String(item?.title || item?.name || item?.['タイトル'] || '').trim(); const targetAmount = parseAmount(item?.targetAmount ?? item?.target_amount ?? item?.target ?? item?.['目標金額']); if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) return null; const manualAmount = parseAmount(item?.manualAmount ?? item?.manual_amount ?? item?.currentAmount ?? item?.current_amount ?? item?.savedAmount ?? item?.['手入力済み額'] ?? 0); const type = ['experience', 'wish', 'reserve'].includes(item?.type) ? item.type : normalizeGoalType(item?.type || item?.['種類']); const savingIds = parseIdList(item?.savingIds ?? item?.saving_ids ?? item?.linked_saving_ids ?? item?.['貯金先ID'] ?? ''); return { id: item.id || createId('goal'), title, targetAmount: Math.round(targetAmount), manualAmount: Number.isFinite(manualAmount) && manualAmount > 0 ? Math.round(manualAmount) : 0, dueDate: String(item.dueDate || item.due_date || item['目標時期'] || '').slice(0, 10), type, savingIds, memo: String(item.memo || item['メモ'] || '').trim(), createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() }; }
  function normalizeSaving(item, goals) { const name = String(item?.name || item?.title || item?.['名称'] || '').trim(); const balance = parseAmount(item?.balance ?? item?.['残高']); if (!name || !Number.isFinite(balance) || balance < 0) return null; const typeText = String(item.type || item['種類'] || '').toLowerCase(); const type = typeText.includes('bank') || typeText.includes('銀行') ? 'bank' : 'envelope'; const targetAmount = parseAmount(item.targetAmount ?? item.target_amount ?? item['目安・上限額'] ?? 0); const goalById = goals.find((goal) => goal.id === item.goalId || goal.id === item.linked_goal_id); const goalByTitle = goals.find((goal) => goal.title === item.linked_goal_title || goal.title === item['連結する目標']); return { id: item.id || createId('save'), name, type, balance: Math.round(balance), targetAmount: Number.isFinite(targetAmount) && targetAmount > 0 ? Math.round(targetAmount) : 0, goalId: goalById?.id || goalByTitle?.id || '', memo: String(item.memo || item['メモ'] || '').trim(), createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() }; }

  function normalizePretendSaving(item) {
    const date = String(item?.date || item?.['日付'] || '').slice(0, 10);
    const amount = parseAmount(item?.amount ?? item?.['金額']);
    const category = String(item?.category || item?.['ジャンル'] || item?.type || 'その他').trim() || 'その他';
    const thing = String(item?.thing || item?.title || item?.['何に使おうとしてやめた'] || item?.['タイトル'] || '').trim();
    if (!date || !Number.isFinite(amount) || amount <= 0 || !thing) return null;
    return { id: item.id || createId('pretend'), date, amount: Math.round(amount), category, thing, plannedUse: String(item.plannedUse || item.planned_use || item['代わりに何へ回したい'] || '').trim(), memo: String(item.memo || item['メモ'] || '').trim(), createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() };
  }

  function normalizePretendUse(item) {
    const date = String(item?.date || item?.['日付'] || '').slice(0, 10);
    const amount = parseAmount(item?.amount ?? item?.['金額']);
    const purpose = String(item?.purpose || item?.['使い道'] || item?.title || '').trim();
    if (!date || !Number.isFinite(amount) || amount <= 0 || !purpose) return null;
    return { id: item.id || createId('pretenduse'), date, amount: Math.round(amount), purpose, memo: String(item.memo || item['メモ'] || '').trim(), createdAt: item.createdAt || item.created_at || nowIso(), updatedAt: item.updatedAt || item.updated_at || nowIso() };
  }

  function normalizeCategory(raw) { const name = canonicalizeCategoryName(String(raw?.name || raw?.category || raw || '').trim()); if (!name) return null; return { id: raw?.id || createId('cat'), name, sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 999), createdAt: raw?.createdAt || raw?.created_at || nowIso(), updatedAt: raw?.updatedAt || raw?.updated_at || nowIso() }; }
  function normalizeStore(raw) { const name = String(raw?.name || raw?.store || raw?.storeName || raw?.shop || raw || '').trim(); if (!name) return null; return { id: raw?.id || createId('store'), name, sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 999), createdAt: raw?.createdAt || raw?.created_at || nowIso(), updatedAt: raw?.updatedAt || raw?.updated_at || nowIso() }; }
  function normalizeBudget(raw) { const name = canonicalizeBudgetName(String(raw?.name || raw?.budgetName || raw?.budget_name || raw?.title || raw?.['予算名'] || '').trim()); if (!name) return null; const monthlyLimit = parseAmount(raw?.monthlyLimit ?? raw?.monthly_limit ?? raw?.limit ?? raw?.monthly_amount ?? raw?.['月予算額'] ?? 0); const enabledText = String(raw?.enabled ?? raw?.['表示'] ?? 'true').toLowerCase(); return { id: raw?.id || raw?.budgetId || raw?.budget_id || createId('budget'), name, monthlyLimit: Number.isFinite(monthlyLimit) && monthlyLimit > 0 ? Math.round(monthlyLimit) : 0, enabled: !(enabledText === 'false' || enabledText === 'off' || enabledText === '0'), sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 999), createdAt: raw?.createdAt || raw?.created_at || nowIso(), updatedAt: raw?.updatedAt || raw?.updated_at || nowIso() }; }
  function normalizeImportRule(item) {
    const sourceType = String(item?.sourceType || item?.source_type || '*').trim() || '*';
    const key = String(item?.merchantKey || item?.merchant_key || '').trim();
    if (!key) return null;
    const action = String(item?.action || item?.rule_action || 'register') === 'exclude' ? 'exclude' : 'register';
    return { id: item?.id || createId('importrule'), sourceType, merchantKey: key, storeName: String(item?.storeName || item?.store || 'その他').trim() || 'その他', categoryName: canonicalizeCategoryName(String(item?.categoryName || item?.category || 'その他').trim() || 'その他'), budgetName: canonicalizeBudgetName(String(item?.budgetName || item?.budget_name || '').trim()), paymentMethod: normalizePaymentMethod(item?.paymentMethod || item?.payment_method || 'その他'), action, createdAt: item?.createdAt || item?.created_at || nowIso(), updatedAt: item?.updatedAt || item?.updated_at || nowIso() };
  }
  function normalizeAchievementSeen(item) { if (typeof item === 'string') return { id: item, achievedAt: nowIso() }; if (!item?.id) return null; return { id: item.id, achievedAt: item.achievedAt || item.achieved_at || nowIso() }; }

  function mergeByName(primary, secondary) { const byName = new Map(); [...primary, ...secondary].forEach((item, index) => { const norm = item?.name ? item : normalizeCategory(item); if (!norm?.name) return; if (!byName.has(norm.name)) byName.set(norm.name, { ...norm, sortOrder: Number.isFinite(Number(norm.sortOrder)) ? Number(norm.sortOrder) : index }); }); return [...byName.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ja')); }
  function mergeBudgets(primary, secondary) { const byName = new Map(); [...primary, ...secondary].forEach((item, index) => { const norm = normalizeBudget(item); if (!norm?.name) return; if (!byName.has(norm.name)) byName.set(norm.name, { ...norm, sortOrder: Number.isFinite(Number(norm.sortOrder)) ? Number(norm.sortOrder) : index }); }); return [...byName.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ja')); }
  function addCategoryIfMissing(name) { const normalized = canonicalizeCategoryName(String(name || '').trim()); let category = state.categories.find((item) => item.name === normalized); if (!category) { category = { id: createId('cat'), name: normalized, sortOrder: state.categories.length, createdAt: nowIso(), updatedAt: nowIso() }; state.categories.push(category); saveState(); } return category; }
  function addStoreIfMissing(name) { const normalized = String(name || '').trim(); let store = state.stores.find((item) => item.name === normalized); if (!store) { store = { id: createId('store'), name: normalized, sortOrder: state.stores.length, createdAt: nowIso(), updatedAt: nowIso() }; state.stores.push(store); saveState(); } return store; }
  function findOrCreateNamedInList(list, name, prefix) { let item = list.find((entry) => entry.name === name); if (!item) { item = { id: createId(prefix), name, sortOrder: list.length, createdAt: nowIso(), updatedAt: nowIso() }; list.push(item); } return item; }
  function getCategory(id) { return state.categories.find((item) => item.id === id); }
  function getStore(id) { return state.stores.find((item) => item.id === id); }
  function getBudget(id) { return state.budgets.find((item) => item.id === id); }
  function findBudgetByName(name) { return state.budgets.find((item) => item.name === name); }
  function getGoal(id) { return state.goals.find((item) => item.id === id); }


  function canonicalizeCategoryName(name) {
    const text = String(name || '').trim();
    const map = { '外食': '外食費', '日用品': '日用品費', '衣料品': '衣料品費', '服': '衣料品費', '車': '車・ガソリン代', '車・ガソリン': '車・ガソリン代', 'ガソリン': '車・ガソリン代', '交通': '交通費', '医療': '医療費', '光熱費': '水道光熱費', '水道光熱': '水道光熱費', '保険': '保険料', '旅行': '旅行費', '趣味': '娯楽費', 'ウイスキー': '酒代', '酒': '酒代', 'ゲーム': 'ゲーム代', '家電': '小型家電' };
    return map[text] || text;
  }

  function canonicalizeBudgetName(name) {
    const text = String(name || '').trim();
    const map = { '日用品': '日用品費', '外食': '外食費', '酒': '酒代', 'ウイスキー': '酒代', 'ゲーム': 'ゲーム代', '車・ガソリン': '車・ガソリン代' };
    return map[text] || text;
  }

  function resequenceByOrder(items) {
    return [...items].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || a.name.localeCompare(b.name, 'ja')).map((item, index) => ({ ...item, sortOrder: index }));
  }

  function applyDefaultCategoryOrder(items, forceDefault = false) {
    const byName = new Map();
    items.forEach((item) => { const norm = normalizeCategory(item); if (norm?.name && !byName.has(norm.name)) byName.set(norm.name, norm); });
    defaultCategoryNames.forEach((name, index) => {
      const item = byName.get(name);
      if (item && forceDefault) item.sortOrder = index;
      else if (!item) byName.set(name, { id: createId('cat'), name, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() });
    });
    return [...byName.values()].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || a.name.localeCompare(b.name, 'ja')).map((item, index) => ({ ...item, sortOrder: index }));
  }

  function applyDefaultBudgetOrder(items, forceDefault = false) {
    const byName = new Map();
    items.forEach((item) => { const norm = normalizeBudget(item); if (norm?.name && !byName.has(norm.name)) byName.set(norm.name, norm); });
    defaultBudgetItems.forEach(([name, monthlyLimit], index) => {
      const item = byName.get(name);
      if (item) { if (forceDefault) item.sortOrder = index; if (!Number.isFinite(Number(item.monthlyLimit))) item.monthlyLimit = monthlyLimit; }
      else byName.set(name, { id: createId('budget'), name, monthlyLimit, enabled: true, sortOrder: index, createdAt: nowIso(), updatedAt: nowIso() });
    });
    return [...byName.values()].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || a.name.localeCompare(b.name, 'ja')).map((item, index) => ({ ...item, sortOrder: index }));
  }

  function parseIdList(value) {
    if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
    return String(value || '').split(/[|,、\s]+/).map((item) => item.trim()).filter(Boolean);
  }

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
  function pretendSignature(item) { return `${item.date}|${item.amount}|${item.category}|${item.thing}|${item.memo}`; }
  function pretendUseSignature(item) { return `${item.date}|${item.amount}|${item.purpose}|${item.memo}`; }

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

  window.__kakeiboDebug = { getState: () => state, getPendingImports: () => pendingImportRows, parseStatementCsv, renderAll, renderMonthlyPayments, importSelectedTransactions, setComparePreset, setPendingImports: (rows) => { pendingImportRows = rows; pendingImportRows.forEach((row, index) => { row.order = index; }); resolvePendingImportDuplicates(); return pendingImportRows; } };
})();
