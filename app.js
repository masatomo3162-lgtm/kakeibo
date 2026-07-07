(() => {
  'use strict';

  const APP_VERSION = '1.0.0';
  const STORAGE_KEY = 'jun_kakeibo_mvp_v100';
  const OLD_STORAGE_KEYS = ['jun_kakeibo_mvp_v050', 'jun_kakeibo_mvp_v041', 'jun_kakeibo_mvp_v040', 'jun_kakeibo_mvp_v030', 'jun_kakeibo_mvp_v020', 'jun_kakeibo_mvp_v010'];

  const accountTypeLabels = {
    cash: '現金',
    envelope: '現金封筒',
    bank: '銀行口座',
    card: 'クレジットカード',
    cashless: '電子マネー・QR'
  };

  const goalTypeLabels = {
    experience: 'やりたいこと',
    wish: '欲しいもの',
    reserve: '備えるお金'
  };

  const goalPriorityLabels = {
    high: '最優先',
    medium: '通常',
    low: 'いつか'
  };

  const defaultCategories = [
    '食費', '外食', '日用品', '医療', '交通', '車', '通信費', '光熱費',
    '保険', '税金', 'ウイスキー', 'ゲーム', '映画・サブスク', '旅行',
    '家電', '趣味', '交際費', 'まいちゃん関連', 'ななちゃん関連', 'その他'
  ];

  const defaultAccounts = [
    { id: 'acct_wallet', name: '財布', type: 'cash', institution: '', withdrawalAccountId: '', includeInAssets: true, sortOrder: 0 },
    { id: 'acct_envelope_living', name: '現金封筒：生活費', type: 'envelope', institution: '手元現金', withdrawalAccountId: '', includeInAssets: true, sortOrder: 1 },
    { id: 'acct_envelope_food', name: '現金封筒：食費', type: 'envelope', institution: '手元現金', withdrawalAccountId: '', includeInAssets: true, sortOrder: 2 },
    { id: 'acct_envelope_fun', name: '現金封筒：楽しみ費', type: 'envelope', institution: '手元現金', withdrawalAccountId: '', includeInAssets: true, sortOrder: 3 },
    { id: 'acct_envelope_medical', name: '現金封筒：医療費', type: 'envelope', institution: '手元現金', withdrawalAccountId: '', includeInAssets: true, sortOrder: 4 },
    { id: 'acct_envelope_car', name: '現金封筒：車・ガソリン', type: 'envelope', institution: '手元現金', withdrawalAccountId: '', includeInAssets: true, sortOrder: 5 },
    { id: 'acct_envelope_reserve', name: '現金封筒：予備費', type: 'envelope', institution: '手元現金', withdrawalAccountId: '', includeInAssets: true, sortOrder: 6 },
    { id: 'acct_rakuten_bank', name: '楽天銀行', type: 'bank', institution: '楽天銀行', withdrawalAccountId: '', includeInAssets: true, sortOrder: 7 },
    { id: 'card_recruit', name: 'リクルートカード', type: 'card', institution: 'リクルート', withdrawalAccountId: 'acct_rakuten_bank', includeInAssets: false, sortOrder: 8 },
    { id: 'card_rakuten', name: '楽天カード', type: 'card', institution: '楽天カード', withdrawalAccountId: 'acct_rakuten_bank', includeInAssets: false, sortOrder: 9 },
    { id: 'card_kabu', name: 'KABUカード', type: 'card', institution: 'KABUカード', withdrawalAccountId: 'acct_rakuten_bank', includeInAssets: false, sortOrder: 10 },
    { id: 'card_seven', name: 'セブンカード', type: 'card', institution: 'セブンカード', withdrawalAccountId: 'acct_rakuten_bank', includeInAssets: false, sortOrder: 11 },
    { id: 'card_paypay', name: 'PayPayカード', type: 'card', institution: 'PayPayカード', withdrawalAccountId: 'acct_rakuten_bank', includeInAssets: false, sortOrder: 12 },
    { id: 'card_smbc', name: '三井住友カード', type: 'card', institution: '三井住友カード', withdrawalAccountId: 'acct_rakuten_bank', includeInAssets: false, sortOrder: 13 },
    { id: 'card_life', name: 'LIFEカード', type: 'card', institution: 'ライフカード', withdrawalAccountId: 'acct_rakuten_bank', includeInAssets: false, sortOrder: 14 },
    { id: 'card_donpen', name: 'ドンペンカード（UCS）', type: 'card', institution: 'UCS', withdrawalAccountId: 'acct_rakuten_bank', includeInAssets: false, sortOrder: 15 },
    { id: 'card_jcb_unknown', name: 'JCB系カード（要確認）', type: 'card', institution: 'JCB', withdrawalAccountId: 'acct_rakuten_bank', includeInAssets: false, sortOrder: 16 }
  ];

  const achievementDefinitions = [
    { id: 'first_expense', emoji: '🌱', title: '財布に記録の火を灯した', description: '支出を1件登録する。ここから家計管理のログが始まる。', target: 1, current: (f) => f.totalEntries },
    { id: 'july_start', emoji: '🎋', title: '七月作戦、開始', description: '2026年7月分の支出を1件登録する。正式運用のスタート地点。', target: 1, current: (f) => f.julyEntries },
    { id: 'three_entries', emoji: '🧾', title: 'レシート三連星', description: '対象月に支出を3件登録する。入力の型を体で覚えた。', target: 3, current: (f) => f.monthEntries },
    { id: 'ten_entries', emoji: '📒', title: 'レシートハンター Lv.10', description: '合計10件登録する。もう「試しただけ」では終わらない。', target: 10, current: (f) => f.totalEntries },
    { id: 'thirty_month_entries', emoji: '📚', title: '月間ログブック30', description: '対象月に30件登録する。生活の流れがかなり見える。', target: 30, current: (f) => f.monthEntries },
    { id: 'fifty_entries', emoji: '🪄', title: '仕分けの魔法使い', description: '合計50件登録する。分類と記録がだいぶ自然になってきた。', target: 50, current: (f) => f.totalEntries },
    { id: 'hundred_entries', emoji: '👑', title: '家計簿の守護者', description: '合計100件登録する。家計の霧を晴らす番人。', target: 100, current: (f) => f.totalEntries },
    { id: 'three_record_days', emoji: '🔥', title: '三日坊主に勝った日', description: '対象月に3日分の記録をつける。まずはここを超えれば十分。', target: 3, current: (f) => f.recordDays },
    { id: 'seven_record_days', emoji: '🗓️', title: '一週間の航海士', description: '対象月に7日分の記録をつける。家計の海図ができ始める。', target: 7, current: (f) => f.recordDays },
    { id: 'fourteen_record_days', emoji: '🏃', title: '半月スプリンター', description: '対象月に14日分の記録をつける。もう完全に生活ルーティン候補。', target: 14, current: (f) => f.recordDays },
    { id: 'twentyfive_record_days', emoji: '🌕', title: '月末の番人', description: '対象月に25日分の記録をつける。月の支出をかなり逃さない。', target: 25, current: (f) => f.recordDays },
    { id: 'streak_three', emoji: '⚡', title: '連続ログインボーナス', description: '3日連続で支出を記録する。ゲームっぽく続ける最初の連鎖。', target: 3, current: (f) => f.bestStreak },
    { id: 'streak_seven', emoji: '🚀', title: '生活ログ・チェイン7', description: '7日連続で支出を記録する。これはかなり強い継続力。', target: 7, current: (f) => f.bestStreak },
    { id: 'category_five', emoji: '🧭', title: '分類の地図職人', description: '対象月に5種類以上のカテゴリを使う。支出の地形が見えてくる。', target: 5, current: (f) => f.categoryCount },
    { id: 'category_ten', emoji: '🗂️', title: 'カテゴリ十傑', description: '対象月に10種類以上のカテゴリを使う。かなり細かく見えている。', target: 10, current: (f) => f.categoryCount },
    { id: 'account_three', emoji: '👛', title: '支払元トライアングル', description: '対象月に3種類以上の支払元を使う。現金・口座・カードの動きが見える。', target: 3, current: (f) => f.accountCount },
    { id: 'method_three', emoji: '🗡️', title: '支払い三刀流', description: '現金・キャッシュレス・引き落としをすべて使う。入力方法を一通り制覇。', target: 3, current: (f) => f.methodCount },
    { id: 'memo_ten', emoji: '✍️', title: '未来の自分への伝言', description: 'メモ付き支出を合計10件登録する。あとから見返した自分が助かる。', target: 10, current: (f) => f.memoEntries },
    { id: 'memo_thirty', emoji: '🪶', title: '記録官の羽ペン', description: 'メモ付き支出を合計30件登録する。支出の理由まで残せている。', target: 30, current: (f) => f.memoEntries },
    { id: 'envelope_first', emoji: '✉️', title: '現金封筒を開けし者', description: '現金封筒からの支出を1件登録する。封筒管理との接続準備OK。', target: 1, current: (f) => f.envelopeEntries },
    { id: 'direct_asset_first', emoji: '💸', title: '即時減少を見逃さない', description: '現金・封筒・銀行口座からの支出を1件登録する。資産反映の基本形。', target: 1, current: (f) => f.directEntries },
    { id: 'card_recorded', emoji: '💳', title: 'カード未払の可視化', description: 'クレジットカード支出を1件登録する。使った日と落ちる日を分けて見られる。', target: 1, current: (f) => f.cardEntries },
    { id: 'card_month_five', emoji: '🧮', title: 'カード利用の見張り番', description: '対象月にカード支出を5件登録する。未払の見える化が効いてくる。', target: 5, current: (f) => f.cardMonthEntries },
    { id: 'bank_settlement', emoji: '🏦', title: '楽天銀行ゲート開通', description: '楽天銀行CSVからカード精算を1件登録する。二重計上しない仕組みを使えた。', target: 1, current: (f) => f.settlementEntries },
    { id: 'settlement_five', emoji: '🛡️', title: '精算ハンター', description: 'カード精算記録を5件登録する。引き落としチェックがかなり進んだ。', target: 5, current: (f) => f.settlementEntries },
    { id: 'goal_first', emoji: '🚩', title: '目標の旗を立てた', description: '目標を1件登録する。家計簿が「未来の予定」とつながった。', target: 1, current: (f) => f.goalCount },
    { id: 'goal_three', emoji: '🗺️', title: '未来マップ作成中', description: '目標を3件登録する。旅行・家電・リフォームなどを並べて見られる。', target: 3, current: (f) => f.goalCount },
    { id: 'goal_achieved', emoji: '🎉', title: '目標の宝箱を開けた', description: '目標を1件達成する。記録がちゃんと行動につながった証拠。', target: 1, current: (f) => f.goalAchievedCount },
    { id: 'whisky_first', emoji: '🥃', title: '琥珀色の監査官', description: 'ウイスキーカテゴリで1件登録する。楽しみ費も見える化。', target: 1, current: (f) => f.whiskyEntries },
    { id: 'game_first', emoji: '🎮', title: '積みゲー管理局', description: 'ゲームカテゴリで1件登録する。趣味費もちゃんと味方につける。', target: 1, current: (f) => f.gameEntries },
    { id: 'medical_first', emoji: '🩺', title: '健康費レーダー起動', description: '医療カテゴリで1件登録する。体のメンテ費も家計に入れる。', target: 1, current: (f) => f.medicalEntries },
    { id: 'travel_first', emoji: '✈️', title: '旅費の滑走路', description: '旅行カテゴリで1件登録する。楽しみのための支出も計画に乗せる。', target: 1, current: (f) => f.travelEntries },
    { id: 'jcb_mystery', emoji: '🕵️', title: 'JCBの謎を捕獲', description: 'JCB系カード（要確認）の精算を1件登録する。あとでカード名を特定しよう。', target: 1, current: (f) => f.jcbUnknownSettlements }
  ];

  let state = loadState();

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const els = {
    tabs: $$('.tab'), panels: $$('.panel'),
    expenseForm: $('#expenseForm'), editId: $('#editId'), dateInput: $('#dateInput'), amountInput: $('#amountInput'),
    accountInput: $('#accountInput'), paymentMethodInput: $('#paymentMethodInput'), accountEffectBox: $('#accountEffectBox'),
    categoryInput: $('#categoryInput'), newCategoryInput: $('#newCategoryInput'), memoInput: $('#memoInput'), saveButton: $('#saveButton'), clearButton: $('#clearButton'),
    monthTotalTop: $('#monthTotalTop'), summaryMonthInput: $('#summaryMonthInput'), summaryTotal: $('#summaryTotal'), summaryCardTotal: $('#summaryCardTotal'), summarySettlementTotal: $('#summarySettlementTotal'),
    summaryDirectTotal: $('#summaryDirectTotal'), summaryCount: $('#summaryCount'), summaryDailyAvg: $('#summaryDailyAvg'),
    methodBreakdown: $('#methodBreakdown'), categoryBreakdown: $('#categoryBreakdown'), accountBreakdown: $('#accountBreakdown'), assetEffectBreakdown: $('#assetEffectBreakdown'),
    historyMonthInput: $('#historyMonthInput'), historyCategoryFilter: $('#historyCategoryFilter'), historyTotal: $('#historyTotal'), historyCount: $('#historyCount'), transactionList: $('#transactionList'),
    accountForm: $('#accountForm'), accountIdInput: $('#accountIdInput'), accountNameInput: $('#accountNameInput'), accountTypeInput: $('#accountTypeInput'),
    accountInstitutionInput: $('#accountInstitutionInput'), withdrawalWrap: $('#withdrawalWrap'), withdrawalAccountInput: $('#withdrawalAccountInput'),
    includeInAssetsInput: $('#includeInAssetsInput'), accountSaveButton: $('#accountSaveButton'), accountClearButton: $('#accountClearButton'), seedCardsButton: $('#seedCardsButton'), accountList: $('#accountList'),
    categoryForm: $('#categoryForm'), categoryNameInput: $('#categoryNameInput'), categoryList: $('#categoryList'),
    goalForm: $('#goalForm'), goalIdInput: $('#goalIdInput'), goalTitleInput: $('#goalTitleInput'), goalEmojiInput: $('#goalEmojiInput'),
    goalTargetInput: $('#goalTargetInput'), goalSavedInput: $('#goalSavedInput'), goalDueInput: $('#goalDueInput'), goalAccountInput: $('#goalAccountInput'),
    goalTypeInput: $('#goalTypeInput'), goalPriorityInput: $('#goalPriorityInput'), goalMemoInput: $('#goalMemoInput'), goalSaveButton: $('#goalSaveButton'), goalClearButton: $('#goalClearButton'),
    goalsTargetTotal: $('#goalsTargetTotal'), goalsSavedTotal: $('#goalsSavedTotal'), goalsRemainingTotal: $('#goalsRemainingTotal'), goalsAchievedCount: $('#goalsAchievedCount'), goalList: $('#goalList'),
    bankMonthInput: $('#bankMonthInput'), bankSettlementTotal: $('#bankSettlementTotal'), bankSettlementCount: $('#bankSettlementCount'), bankUnsettledTotal: $('#bankUnsettledTotal'), settlementList: $('#settlementList'),
    importBankCsvInput: $('#importBankCsvInput'), exportSettlementsCsvButton: $('#exportSettlementsCsvButton'), clearSettlementsButton: $('#clearSettlementsButton'),
    achievementMonthInput: $('#achievementMonthInput'), achievementUnlockedCount: $('#achievementUnlockedCount'), achievementTotalCount: $('#achievementTotalCount'),
    achievementRecordDays: $('#achievementRecordDays'), achievementMonthEntries: $('#achievementMonthEntries'), achievementBestStreak: $('#achievementBestStreak'),
    achievementTitleBox: $('#achievementTitleBox'), nextAchievementList: $('#nextAchievementList'), achievementList: $('#achievementList'),
    exportCsvButton: $('#exportCsvButton'), exportAccountsCsvButton: $('#exportAccountsCsvButton'), exportGoalsCsvButton: $('#exportGoalsCsvButton'),
    importCsvInput: $('#importCsvInput'), importGoalsCsvInput: $('#importGoalsCsvInput'), resetButton: $('#resetButton'), toast: $('#toast')
  };

  init();

  function init() {
    const today = new Date();
    const todayIso = toDateInputValue(today);
    const monthKey = todayIso.slice(0, 7);
    els.dateInput.value = todayIso;
    els.summaryMonthInput.value = monthKey;
    els.historyMonthInput.value = monthKey;
    if (els.bankMonthInput) els.bankMonthInput.value = monthKey;
    if (els.achievementMonthInput) els.achievementMonthInput.value = monthKey;
    bindEvents();
    renderAll();
    registerServiceWorker();
  }

  function bindEvents() {
    els.tabs.forEach((tab) => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
    els.expenseForm.addEventListener('submit', handleExpenseSubmit);
    els.clearButton.addEventListener('click', () => resetExpenseForm());
    els.accountInput.addEventListener('change', handleAccountChoiceChange);
    els.summaryMonthInput.addEventListener('change', renderSummary);
    els.historyMonthInput.addEventListener('change', renderHistory);
    els.historyCategoryFilter.addEventListener('change', renderHistory);
    if (els.bankMonthInput) els.bankMonthInput.addEventListener('change', renderBankSettlements);
    if (els.achievementMonthInput) els.achievementMonthInput.addEventListener('change', renderAchievements);
    els.accountForm.addEventListener('submit', handleAccountSubmit);
    els.accountTypeInput.addEventListener('change', renderWithdrawalVisibility);
    els.accountClearButton.addEventListener('click', resetAccountForm);
    els.seedCardsButton.addEventListener('click', () => { seedCreditCards(); renderAll(); showToast('主要クレカと楽天銀行を補充しました。'); });
    els.goalForm.addEventListener('submit', handleGoalSubmit);
    els.goalClearButton.addEventListener('click', resetGoalForm);
    els.categoryForm.addEventListener('submit', handleCategoryAdd);
    els.exportCsvButton.addEventListener('click', exportTransactionsCsv);
    els.exportAccountsCsvButton.addEventListener('click', exportAccountsCsv);
    els.exportGoalsCsvButton.addEventListener('click', exportGoalsCsv);
    els.importCsvInput.addEventListener('change', importTransactionsCsv);
    els.importGoalsCsvInput.addEventListener('change', importGoalsCsv);
    if (els.importBankCsvInput) els.importBankCsvInput.addEventListener('change', importRakutenBankCsv);
    if (els.exportSettlementsCsvButton) els.exportSettlementsCsvButton.addEventListener('click', exportSettlementsCsv);
    if (els.clearSettlementsButton) els.clearSettlementsButton.addEventListener('click', clearSettlements);
    els.resetButton.addEventListener('click', resetAllData);
  }

  function loadState() {
    const fallback = createFallbackState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return migrateState(JSON.parse(raw), fallback);

      for (const key of OLD_STORAGE_KEYS) {
        const oldRaw = localStorage.getItem(key);
        if (oldRaw) return migrateState(JSON.parse(oldRaw), fallback);
      }
      return fallback;
    } catch (error) {
      console.error('Failed to load state', error);
      return fallback;
    }
  }

  function createFallbackState() {
    return {
      version: APP_VERSION,
      categories: defaultCategories.map(makeCategory),
      accounts: defaultAccounts.map((account) => ({ ...account, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })),
      transactions: [],
      settlements: [],
      goals: [],
      achievementsSeen: []
    };
  }

  function migrateState(parsed, fallback) {
    const categoriesSource = Array.isArray(parsed.categories) ? parsed.categories : fallback.categories;
    const categories = categoriesSource.map((cat) => typeof cat === 'string' ? makeCategory(cat) : {
      id: cat.id || createId('cat'),
      name: String(cat.name || '').trim(),
      createdAt: cat.createdAt || new Date().toISOString()
    }).filter((cat) => cat.name);

    let accounts = Array.isArray(parsed.accounts) ? parsed.accounts.map(normalizeAccount).filter(Boolean) : [];

    if (!accounts.length && Array.isArray(parsed.sources)) {
      accounts = parsed.sources.map((source, index) => sourceToAccount(source, index)).filter(Boolean);
    }

    accounts = mergeAccounts(accounts, fallback.accounts);
    accounts = seedCreditCardsInList(accounts);

    const transactions = Array.isArray(parsed.transactions)
      ? parsed.transactions.map((tx) => normalizeTransaction(tx, accounts, categories)).filter(Boolean)
      : [];

    const goals = Array.isArray(parsed.goals)
      ? parsed.goals.map((goal) => normalizeGoal(goal, accounts)).filter(Boolean)
      : [];

    const settlements = Array.isArray(parsed.settlements)
      ? parsed.settlements.map((item) => normalizeSettlement(item, accounts)).filter(Boolean)
      : [];

    return {
      version: APP_VERSION,
      categories: uniqueByName([...categories, ...fallback.categories]),
      accounts: sortAccounts(accounts),
      transactions,
      settlements,
      goals,
      achievementsSeen: Array.isArray(parsed.achievementsSeen) ? parsed.achievementsSeen : []
    };
  }

  function normalizeAccount(account) {
    const name = String(account.name || account.account_name || '').trim();
    if (!name) return null;
    const type = normalizeAccountType(account.type || account.account_type || guessAccountType(name));
    return {
      id: account.id || account.account_id || createId('acct'),
      name,
      type,
      institution: String(account.institution || account.bank || '').trim(),
      withdrawalAccountId: account.withdrawalAccountId || account.withdrawal_account_id || account.withdrawal_account || '',
      includeInAssets: account.includeInAssets ?? account.include_in_assets ?? type !== 'card',
      sortOrder: Number.isFinite(Number(account.sortOrder ?? account.sort_order)) ? Number(account.sortOrder ?? account.sort_order) : 999,
      createdAt: account.createdAt || account.created_at || new Date().toISOString(),
      updatedAt: account.updatedAt || account.updated_at || new Date().toISOString()
    };
  }

  function sourceToAccount(source, index) {
    const name = String(source || '').trim();
    if (!name) return null;
    const type = guessAccountType(name);
    return {
      id: defaultAccounts.find((account) => account.name === name)?.id || createId('acct'),
      name,
      type,
      institution: type === 'bank' ? name : '',
      withdrawalAccountId: type === 'card' ? 'acct_rakuten_bank' : '',
      includeInAssets: type !== 'card',
      sortOrder: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function normalizeTransaction(item, accounts, categories) {
    const amount = Number(String(item.amount || item['金額'] || '').replace(/[¥,円\s]/g, ''));
    if (!item.date || !Number.isFinite(amount) || amount <= 0) return null;

    const categoryName = item.category || item.categoryName || item['カテゴリ'] || 'その他';
    let category = categories.find((cat) => cat.name === categoryName);
    if (!category) {
      category = makeCategory(categoryName);
      categories.push(category);
    }

    const accountId = item.accountId || item.account_id || findAccountByNameInList(accounts, item.account_name || item.paymentSource || item.payment_source || item['支払元'])?.id || accounts[0]?.id || 'acct_wallet';
    const account = accounts.find((candidate) => candidate.id === accountId) || accounts[0];

    return {
      id: item.id || createId('tx'),
      date: String(item.date).slice(0, 10),
      type: 'expense',
      amount: Math.round(amount),
      paymentMethod: item.paymentMethod || item.payment_method || item['支払方法'] || methodForAccount(account),
      accountId: account?.id || 'acct_wallet',
      accountName: account?.name || '財布',
      accountType: account?.type || 'cash',
      withdrawalAccountId: item.withdrawalAccountId || item.withdrawal_account_id || account?.withdrawalAccountId || '',
      categoryId: item.categoryId || category.id,
      categoryName: category.name,
      memo: item.memo || item['メモ'] || '',
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      updatedAt: item.updatedAt || item.updated_at || new Date().toISOString()
    };
  }



  function normalizeSettlement(item, accounts) {
    const amount = Number(String(item.amount || item['金額'] || '').replace(/[¥,円,\s]/g, ''));
    const date = String(item.date || item['日付'] || '').slice(0, 10);
    if (!date || !Number.isFinite(amount) || amount <= 0) return null;
    const bankAccount = getAccountFromList(accounts, item.bankAccountId || item.bank_account_id) || findAccountByNameInList(accounts, item.bankAccountName || item.bank_account_name || item['銀行口座']) || findAccountByNameInList(accounts, '楽天銀行') || accounts.find((account) => account.type === 'bank') || null;
    const cardAccount = getAccountFromList(accounts, item.cardAccountId || item.card_account_id) || findAccountByNameInList(accounts, item.cardAccountName || item.card_account_name || item['カード']) || accounts.find((account) => account.type === 'card') || null;
    if (!bankAccount || !cardAccount) return null;
    const description = String(item.description || item.memo || item['摘要'] || '').trim();
    return {
      id: item.id || createId('settle'),
      date,
      amount: Math.round(amount),
      bankAccountId: bankAccount.id,
      bankAccountName: bankAccount.name,
      cardAccountId: cardAccount.id,
      cardAccountName: cardAccount.name,
      description,
      source: item.source || '楽天銀行CSV',
      sourceKey: item.sourceKey || item.source_key || makeSettlementKey(date, Math.round(amount), cardAccount.id, description),
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      updatedAt: item.updatedAt || item.updated_at || new Date().toISOString()
    };
  }

  function normalizeGoal(goal, accounts) {
    const title = String(goal.title || goal.name || goal.goal_title || '').trim();
    const targetAmount = Number(String(goal.targetAmount ?? goal.target_amount ?? goal.target ?? '').replace(/[¥,円,\s]/g, ''));
    const currentAmount = Number(String(goal.currentAmount ?? goal.current_amount ?? goal.savedAmount ?? goal.saved_amount ?? goal.saved ?? 0).replace(/[¥,円,\s]/g, ''));
    if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) return null;
    const accountId = goal.accountId || goal.account_id || findAccountByNameInList(accounts, goal.account_name || goal.accountName)?.id || '';
    return {
      id: goal.id || createId('goal'),
      title,
      targetAmount: Math.round(targetAmount),
      currentAmount: Number.isFinite(currentAmount) && currentAmount > 0 ? Math.round(currentAmount) : 0,
      dueDate: String(goal.dueDate || goal.due_date || '').slice(0, 10),
      accountId: accountId && accounts.some((account) => account.id === accountId) ? accountId : '',
      type: normalizeGoalType(goal.type || goal.goal_type),
      priority: normalizeGoalPriority(goal.priority),
      emoji: String(goal.emoji || '').trim(),
      memo: String(goal.memo || goal.note || '').trim(),
      createdAt: goal.createdAt || goal.created_at || new Date().toISOString(),
      updatedAt: goal.updatedAt || goal.updated_at || new Date().toISOString()
    };
  }

  function saveState() {
    state.version = APP_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function renderAll() {
    ensureReferences();
    renderAccountSelects();
    renderCategorySelects();
    renderTopTotal();
    renderSummary();
    renderHistory();
    renderAccounts();
    renderGoals();
    renderBankSettlements();
    renderAchievements();
    renderSettings();
    renderWithdrawalVisibility();
    renderAccountEffect();
    saveState();
  }

  function ensureReferences() {
    state.categories = uniqueByName(state.categories.filter((cat) => cat && cat.name));
    state.accounts = sortAccounts(mergeAccounts(state.accounts.map(normalizeAccount).filter(Boolean), []));
    if (!state.accounts.length) state.accounts = createFallbackState().accounts;

    state.transactions.forEach((tx) => {
      const account = getAccount(tx.accountId) || findAccountByName(tx.accountName) || state.accounts[0];
      tx.accountId = account.id;
      tx.accountName = account.name;
      tx.accountType = account.type;
      tx.withdrawalAccountId = account.withdrawalAccountId || tx.withdrawalAccountId || '';
      const category = state.categories.find((cat) => cat.id === tx.categoryId) || findCategoryByName(tx.categoryName) || state.categories[0];
      tx.categoryId = category.id;
      tx.categoryName = category.name;
    });

    if (!Array.isArray(state.settlements)) state.settlements = [];
    state.settlements = state.settlements.map((item) => normalizeSettlement(item, state.accounts)).filter(Boolean);

    if (!Array.isArray(state.goals)) state.goals = [];
    state.goals = state.goals.map((goal) => normalizeGoal(goal, state.accounts)).filter(Boolean);
    if (!Array.isArray(state.achievementsSeen)) state.achievementsSeen = [];
  }

  function switchTab(tabName) {
    els.tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === tabName));
    els.panels.forEach((panel) => panel.classList.toggle('is-active', panel.id === `tab-${tabName}`));
  }

  function handleExpenseSubmit(event) {
    event.preventDefault();
    const amount = Number(els.amountInput.value);
    const date = els.dateInput.value;
    const account = getAccount(els.accountInput.value);
    const paymentMethod = els.paymentMethodInput.value;
    const memo = els.memoInput.value.trim();
    const editId = els.editId.value;

    if (!date) return showToast('日付を入力してください。');
    if (!Number.isFinite(amount) || amount <= 0) return showToast('金額は1円以上で入力してください。');
    if (!account) return showToast('支払元を選択してください。');

    let category = null;
    const newCategoryName = els.newCategoryInput.value.trim();
    if (newCategoryName) {
      category = addCategoryIfMissing(newCategoryName);
      els.categoryInput.value = category.id;
    } else {
      category = state.categories.find((cat) => cat.id === els.categoryInput.value);
    }
    if (!category) return showToast('カテゴリを選択してください。');

    const now = new Date().toISOString();
    const payload = {
      date,
      type: 'expense',
      amount: Math.round(amount),
      paymentMethod,
      accountId: account.id,
      accountName: account.name,
      accountType: account.type,
      withdrawalAccountId: account.withdrawalAccountId || '',
      categoryId: category.id,
      categoryName: category.name,
      memo,
      updatedAt: now
    };

    if (editId) {
      const existing = state.transactions.find((tx) => tx.id === editId);
      if (!existing) return showToast('編集対象が見つかりません。');
      Object.assign(existing, payload);
      showToast('支出を更新しました。');
    } else {
      state.transactions.push({ id: createId('tx'), ...payload, createdAt: now });
      showToast('支出を保存しました。');
    }

    resetExpenseForm({ keepDate: true, keepAccount: true });
    renderAll();
  }

  function handleAccountChoiceChange() {
    const account = getAccount(els.accountInput.value);
    if (account) els.paymentMethodInput.value = methodForAccount(account);
    renderAccountEffect();
  }

  function resetExpenseForm(options = {}) {
    const currentDate = els.dateInput.value;
    const currentAccountId = els.accountInput.value;
    els.expenseForm.reset();
    els.editId.value = '';
    els.saveButton.textContent = '保存';
    els.dateInput.value = options.keepDate ? currentDate : toDateInputValue(new Date());
    if (options.keepAccount && getAccount(currentAccountId)) els.accountInput.value = currentAccountId;
    else els.accountInput.value = state.accounts[0]?.id || '';
    const account = getAccount(els.accountInput.value);
    els.paymentMethodInput.value = methodForAccount(account);
    if (state.categories[0]) els.categoryInput.value = state.categories[0].id;
    renderAccountEffect();
  }

  function handleAccountSubmit(event) {
    event.preventDefault();
    const id = els.accountIdInput.value;
    const name = els.accountNameInput.value.trim();
    const type = els.accountTypeInput.value;
    const institution = els.accountInstitutionInput.value.trim();
    const withdrawalAccountId = type === 'card' ? els.withdrawalAccountInput.value : '';

    if (!name) return showToast('名称を入力してください。');
    if (state.accounts.some((account) => account.name === name && account.id !== id)) return showToast('同じ名称の支払元があります。');
    if (type === 'card' && !withdrawalAccountId) return showToast('カードの引き落とし先を選択してください。');

    const now = new Date().toISOString();
    if (id) {
      const account = getAccount(id);
      if (!account) return showToast('編集対象が見つかりません。');
      Object.assign(account, { name, type, institution, withdrawalAccountId, includeInAssets: els.includeInAssetsInput.checked, updatedAt: now });
      state.transactions.forEach((tx) => {
        if (tx.accountId === id) {
          tx.accountName = name;
          tx.accountType = type;
          tx.withdrawalAccountId = withdrawalAccountId;
          tx.paymentMethod = methodForAccount(account);
          tx.updatedAt = now;
        }
      });
      showToast('支払元を更新しました。');
    } else {
      state.accounts.push({
        id: createId('acct'), name, type, institution, withdrawalAccountId,
        includeInAssets: els.includeInAssetsInput.checked, sortOrder: nextSortOrder(), createdAt: now, updatedAt: now
      });
      showToast('支払元を追加しました。');
    }
    resetAccountForm();
    renderAll();
  }

  function resetAccountForm() {
    els.accountForm.reset();
    els.accountIdInput.value = '';
    els.accountTypeInput.value = 'cash';
    els.includeInAssetsInput.checked = true;
    els.accountSaveButton.textContent = '支払元を保存';
    renderAccountWithdrawalSelect();
    renderWithdrawalVisibility();
  }

  function editAccount(id) {
    const account = getAccount(id);
    if (!account) return;
    els.accountIdInput.value = account.id;
    els.accountNameInput.value = account.name;
    els.accountTypeInput.value = account.type;
    els.accountInstitutionInput.value = account.institution || '';
    els.includeInAssetsInput.checked = Boolean(account.includeInAssets);
    renderAccountWithdrawalSelect(account.id);
    els.withdrawalAccountInput.value = account.withdrawalAccountId || '';
    els.accountSaveButton.textContent = '支払元を更新';
    renderWithdrawalVisibility();
    switchTab('accounts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteAccount(id) {
    const account = getAccount(id);
    if (!account) return;
    const used = state.transactions.some((tx) => tx.accountId === id);
    if (used) return showToast('履歴で使っている支払元は削除できません。名称変更で対応してください。');
    if (state.accounts.length <= 1) return showToast('支払元は最低1つ必要です。');
    if (!confirm(`支払元「${account.name}」を削除しますか？`)) return;
    state.accounts = state.accounts.filter((item) => item.id !== id);
    state.accounts.forEach((item) => {
      if (item.withdrawalAccountId === id) item.withdrawalAccountId = '';
    });
    state.goals.forEach((goal) => { if (goal.accountId === id) goal.accountId = ''; });
    renderAll();
    showToast('支払元を削除しました。');
  }

  function moveAccount(id, direction) {
    const ordered = sortAccounts(state.accounts);
    const index = ordered.findIndex((account) => account.id === id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
    [ordered[index], ordered[targetIndex]] = [ordered[targetIndex], ordered[index]];
    ordered.forEach((account, idx) => { account.sortOrder = idx; account.updatedAt = new Date().toISOString(); });
    state.accounts = ordered;
    renderAll();
  }

  function renderAccountSelects() {
    const accountOptions = sortAccounts(state.accounts).map((account) => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)}（${accountTypeLabels[account.type] || account.type}）</option>`).join('');
    const current = els.accountInput.value;
    els.accountInput.innerHTML = accountOptions;
    if (getAccount(current)) els.accountInput.value = current;
    if (els.goalAccountInput) {
      const goalCurrent = els.goalAccountInput.value;
      els.goalAccountInput.innerHTML = '<option value="">未設定</option>' + accountOptions;
      if (getAccount(goalCurrent)) els.goalAccountInput.value = goalCurrent;
    }
    renderAccountWithdrawalSelect();
  }

  function renderAccountWithdrawalSelect(excludeId = '') {
    const bankAccounts = state.accounts.filter((account) => account.type === 'bank' && account.id !== excludeId);
    els.withdrawalAccountInput.innerHTML = bankAccounts.map((account) => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)}</option>`).join('');
    if (!els.withdrawalAccountInput.value && bankAccounts[0]) els.withdrawalAccountInput.value = bankAccounts[0].id;
  }

  function renderWithdrawalVisibility() {
    const isCard = els.accountTypeInput.value === 'card';
    els.withdrawalWrap.style.display = isCard ? 'block' : 'none';
    if (isCard && !els.withdrawalAccountInput.value) renderAccountWithdrawalSelect(els.accountIdInput.value);
    if (!els.accountIdInput.value) els.includeInAssetsInput.checked = !isCard;
  }

  function renderCategorySelects() {
    const options = state.categories.map((cat) => `<option value="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</option>`).join('');
    const currentCategory = els.categoryInput.value;
    els.categoryInput.innerHTML = options;
    if (state.categories.some((cat) => cat.id === currentCategory)) els.categoryInput.value = currentCategory;

    const historyCurrent = els.historyCategoryFilter.value || 'all';
    els.historyCategoryFilter.innerHTML = '<option value="all">すべて</option>' + options;
    els.historyCategoryFilter.value = state.categories.some((cat) => cat.id === historyCurrent) ? historyCurrent : 'all';
  }

  function renderTopTotal() {
    const month = toDateInputValue(new Date()).slice(0, 7);
    els.monthTotalTop.textContent = formatYen(sumTransactions(filterByMonth(state.transactions, month)));
  }

  function renderSummary() {
    const month = els.summaryMonthInput.value || toDateInputValue(new Date()).slice(0, 7);
    const transactions = filterByMonth(state.transactions, month);
    const total = sumTransactions(transactions);
    const cardTotal = sumTransactions(transactions.filter((tx) => getTxAccount(tx)?.type === 'card'));
    const directTotal = total - cardTotal;
    const settlementTotal = sumSettlements(filterByMonth(state.settlements || [], month));

    els.summaryTotal.textContent = formatYen(total);
    els.summaryCardTotal.textContent = formatYen(cardTotal);
    if (els.summarySettlementTotal) els.summarySettlementTotal.textContent = formatYen(settlementTotal);
    els.summaryDirectTotal.textContent = formatYen(directTotal);
    els.summaryCount.textContent = `${transactions.length}件`;
    els.summaryDailyAvg.textContent = formatYen(daysInMonth(month) ? Math.round(total / daysInMonth(month)) : 0);

    renderBreakdown(els.categoryBreakdown, groupCategorySum(transactions), total);
    renderBreakdown(els.accountBreakdown, groupAccountSum(transactions), total);
    renderBreakdown(els.methodBreakdown, groupSum(transactions, 'paymentMethod'), total);
    renderAssetEffectBreakdown(transactions);
  }

  function renderAssetEffectBreakdown(transactions) {
    if (!transactions.length) {
      els.assetEffectBreakdown.innerHTML = '<div class="empty">この月のデータはまだありません。</div>';
      return;
    }
    const map = new Map();
    transactions.forEach((tx) => {
      const account = getTxAccount(tx);
      const amount = Number(tx.amount || 0);
      if (account?.type === 'card') {
        const key = `${account.name} 未払`;
        map.set(key, (map.get(key) || 0) + amount);
      } else {
        const key = account?.name || tx.accountName || '支払元未設定';
        map.set(key, (map.get(key) || 0) - amount);
      }
    });
    const rows = [...map.entries()].map(([name, value]) => ({ name, total: value })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    els.assetEffectBreakdown.innerHTML = rows.map((row) => `
      <div class="breakdown-row">
        <div class="breakdown-meta">
          <span>${escapeHtml(row.name)}</span>
          <span>${row.total >= 0 ? '+' : ''}${formatYen(row.total)}</span>
        </div>
        <div class="bar"><span style="--w:${Math.min(100, Math.max(4, Math.round(Math.abs(row.total) / Math.max(1, maxAbs(rows)) * 100)))}%"></span></div>
      </div>
    `).join('');
  }

  function renderBreakdown(container, rows, total) {
    if (!rows.length) {
      container.innerHTML = '<div class="empty">この月のデータはまだありません。</div>';
      return;
    }
    container.innerHTML = rows.map((row) => {
      const percent = total > 0 ? Math.round((row.total / total) * 100) : 0;
      return `
        <div class="breakdown-row">
          <div class="breakdown-meta"><span>${escapeHtml(row.name)}</span><span>${formatYen(row.total)} <small>${percent}%</small></span></div>
          <div class="bar"><span style="--w:${percent}%"></span></div>
        </div>`;
    }).join('');
  }

  function renderHistory() {
    const month = els.historyMonthInput.value || toDateInputValue(new Date()).slice(0, 7);
    const categoryId = els.historyCategoryFilter.value || 'all';
    let transactions = filterByMonth(state.transactions, month);
    if (categoryId !== 'all') transactions = transactions.filter((tx) => tx.categoryId === categoryId);
    transactions.sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));

    els.historyTotal.textContent = formatYen(sumTransactions(transactions));
    els.historyCount.textContent = `${transactions.length}件`;
    if (!transactions.length) {
      els.transactionList.innerHTML = '<div class="empty">条件に合う支出はありません。</div>';
      return;
    }

    els.transactionList.innerHTML = transactions.map((tx) => {
      const account = getTxAccount(tx);
      const withdrawal = account?.type === 'card' ? getAccount(account.withdrawalAccountId)?.name || '引き落とし先未設定' : '';
      return `
        <article class="transaction-item" data-id="${escapeHtml(tx.id)}">
          <div class="transaction-date">${formatDateShort(tx.date)}</div>
          <div class="transaction-main">
            <strong>${escapeHtml(tx.categoryName || findCategoryName(tx.categoryId) || '未分類')}</strong>
            <small>${escapeHtml(tx.paymentMethod)} / ${escapeHtml(tx.accountName || account?.name || '支払元未設定')}${withdrawal ? ' → ' + escapeHtml(withdrawal) : ''}${tx.memo ? ' / ' + escapeHtml(tx.memo) : ''}</small>
          </div>
          <div>
            <div class="transaction-amount">${formatYen(tx.amount)}</div>
            <div class="row-actions">
              <button class="icon-button" data-action="edit" data-id="${escapeHtml(tx.id)}">編集</button>
              <button class="icon-button" data-action="delete" data-id="${escapeHtml(tx.id)}">削除</button>
            </div>
          </div>
        </article>`;
    }).join('');

    els.transactionList.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.action === 'edit') editTransaction(button.dataset.id);
        if (button.dataset.action === 'delete') deleteTransaction(button.dataset.id);
      });
    });
  }

  function renderAccounts() {
    const accounts = sortAccounts(state.accounts);
    els.accountList.innerHTML = accounts.map((account) => {
      const used = state.transactions.some((tx) => tx.accountId === account.id);
      const withdrawal = account.type === 'card' ? getAccount(account.withdrawalAccountId)?.name || '引き落とし先未設定' : '';
      return `
        <div class="editable-row account-card" data-id="${escapeHtml(account.id)}">
          <div class="account-main"><b class="account-name">${escapeHtml(account.name)}</b><span class="badge">${accountTypeLabels[account.type] || account.type}</span></div>
          <div class="account-meta">${escapeHtml(account.institution || 'メモなし')}${withdrawal ? ' / 引き落とし先：' + escapeHtml(withdrawal) : ''}${account.includeInAssets ? ' / 資産口座扱い' : ' / 未払・カード扱い'}</div>
          <div class="account-actions">
            <button class="ghost small" data-action="move-up" data-id="${escapeHtml(account.id)}">↑</button>
            <button class="ghost small" data-action="move-down" data-id="${escapeHtml(account.id)}">↓</button>
            <button class="ghost small" data-action="edit-account" data-id="${escapeHtml(account.id)}">編集</button>
            <button class="danger small" data-action="delete-account" data-id="${escapeHtml(account.id)}" ${used ? 'title="履歴で使用中のため削除不可"' : ''}>削除</button>
          </div>
        </div>`;
    }).join('');

    els.accountList.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        const action = button.dataset.action;
        if (action === 'edit-account') editAccount(id);
        if (action === 'delete-account') deleteAccount(id);
        if (action === 'move-up') moveAccount(id, 'up');
        if (action === 'move-down') moveAccount(id, 'down');
      });
    });
  }

  function renderSettings() {
    els.categoryList.innerHTML = state.categories.map((cat) => {
      const used = state.transactions.some((tx) => tx.categoryId === cat.id);
      return `
        <div class="editable-row" data-id="${escapeHtml(cat.id)}">
          <input value="${escapeHtml(cat.name)}" data-kind="category-name" data-id="${escapeHtml(cat.id)}">
          <button class="ghost small" data-action="rename-category" data-id="${escapeHtml(cat.id)}">保存</button>
          <button class="danger small" data-action="delete-category" data-id="${escapeHtml(cat.id)}" ${used ? 'title="使用中でも削除できます。履歴はその他に移します。"' : ''}>削除</button>
        </div>`;
    }).join('');
    els.categoryList.querySelectorAll('button[data-action]').forEach((button) => button.addEventListener('click', () => handleCategoryAction(button)));
  }

  function renderAccountEffect() {
    const account = getAccount(els.accountInput.value);
    if (!account) {
      els.accountEffectBox.textContent = '支払元を選んでください。';
      return;
    }
    const typeLabel = accountTypeLabels[account.type] || account.type;
    if (account.type === 'card') {
      const withdrawal = getAccount(account.withdrawalAccountId)?.name || '引き落とし先未設定';
      els.accountEffectBox.innerHTML = `<strong>${escapeHtml(account.name)}</strong> は ${escapeHtml(typeLabel)}。支出日はカード未払として記録し、引き落とし先は <strong>${escapeHtml(withdrawal)}</strong> としてCSVに残します。`;
    } else {
      els.accountEffectBox.innerHTML = `<strong>${escapeHtml(account.name)}</strong> は ${escapeHtml(typeLabel)}。総資産連携時は、この支払元から支出額を即時マイナスする想定です。`;
    }
  }


  function handleGoalSubmit(event) {
    event.preventDefault();
    const id = els.goalIdInput.value;
    const title = els.goalTitleInput.value.trim();
    const targetAmount = Number(els.goalTargetInput.value);
    const currentAmount = Number(els.goalSavedInput.value || 0);
    if (!title) return showToast('目標タイトルを入力してください。');
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) return showToast('目標金額は1円以上で入力してください。');
    if (!Number.isFinite(currentAmount) || currentAmount < 0) return showToast('現在の積立額は0円以上で入力してください。');

    const now = new Date().toISOString();
    const payload = {
      title,
      targetAmount: Math.round(targetAmount),
      currentAmount: Math.round(currentAmount),
      dueDate: els.goalDueInput.value || '',
      accountId: els.goalAccountInput.value || '',
      type: normalizeGoalType(els.goalTypeInput.value),
      priority: normalizeGoalPriority(els.goalPriorityInput.value),
      emoji: els.goalEmojiInput.value.trim(),
      memo: els.goalMemoInput.value.trim(),
      updatedAt: now
    };

    if (id) {
      const goal = state.goals.find((item) => item.id === id);
      if (!goal) return showToast('編集対象の目標が見つかりません。');
      Object.assign(goal, payload);
      showToast('目標を更新しました。');
    } else {
      state.goals.unshift({ id: createId('goal'), ...payload, createdAt: now });
      showToast('目標を追加しました。');
    }
    resetGoalForm();
    renderAll();
  }

  function resetGoalForm() {
    els.goalForm.reset();
    els.goalIdInput.value = '';
    els.goalTypeInput.value = 'experience';
    els.goalPriorityInput.value = 'medium';
    els.goalSaveButton.textContent = '目標を保存';
  }

  function renderGoals() {
    const goals = [...(state.goals || [])].sort((a, b) => {
      const priorityScore = { high: 0, medium: 1, low: 2 };
      return (priorityScore[a.priority] ?? 1) - (priorityScore[b.priority] ?? 1) || (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99') || b.createdAt.localeCompare(a.createdAt);
    });
    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
    const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.currentAmount || 0), 0);
    const remaining = goals.reduce((sum, goal) => sum + Math.max(0, Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0)), 0);
    const achieved = goals.filter((goal) => goalProgress(goal) >= 100).length;
    els.goalsTargetTotal.textContent = formatYen(totalTarget);
    els.goalsSavedTotal.textContent = formatYen(totalSaved);
    els.goalsRemainingTotal.textContent = formatYen(remaining);
    els.goalsAchievedCount.textContent = `${achieved}件`;

    if (!goals.length) {
      els.goalList.innerHTML = '<div class="empty">目標はまだありません。旅行・リフォーム・家電などを1つ登録してみてください。</div>';
      return;
    }

    els.goalList.innerHTML = goals.map((goal) => {
      const progress = goalProgress(goal);
      const account = getAccount(goal.accountId);
      const remainingAmount = Math.max(0, Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0));
      const monthly = monthlyNeeded(goal);
      const dueText = goal.dueDate ? `${formatDateJa(goal.dueDate)}まで` : '期限なし';
      const achievedClass = progress >= 100 ? ' achieved' : '';
      return `
        <article class="goal-card${achievedClass}" data-id="${escapeHtml(goal.id)}">
          <div class="goal-top">
            <div class="goal-title-wrap">
              <div class="goal-emoji">${escapeHtml(goal.emoji || defaultGoalEmoji(goal.type))}</div>
              <div>
                <h4>${escapeHtml(goal.title)}</h4>
                <small>${escapeHtml(goalTypeLabels[goal.type] || '目標')} / <span class="priority-${escapeHtml(goal.priority)}">${escapeHtml(goalPriorityLabels[goal.priority] || '通常')}</span></small>
              </div>
            </div>
            <span class="badge">${Math.min(100, Math.round(progress))}%</span>
          </div>
          <div class="goal-money"><strong>${formatYen(goal.currentAmount)}</strong><span>／ ${formatYen(goal.targetAmount)}・あと ${formatYen(remainingAmount)}</span></div>
          <div class="goal-progress"><span style="--w:${Math.min(100, Math.max(0, progress))}%"></span></div>
          <div class="goal-meta-grid">
            <div class="goal-meta-chip">${escapeHtml(account?.name || '保管先未設定')}</div>
            <div class="goal-meta-chip">${escapeHtml(dueText)}${monthly !== null && progress < 100 ? ` / 月々 ${formatYen(monthly)}` : ''}</div>
          </div>
          ${goal.memo ? `<p class="goal-note">${escapeHtml(goal.memo)}</p>` : ''}
          <div class="goal-actions">
            <button type="button" class="ghost small" data-action="edit-goal" data-id="${escapeHtml(goal.id)}">編集</button>
            <button type="button" class="danger small" data-action="delete-goal" data-id="${escapeHtml(goal.id)}">削除</button>
          </div>
        </article>`;
    }).join('');

    els.goalList.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.action === 'edit-goal') editGoal(button.dataset.id);
        if (button.dataset.action === 'delete-goal') deleteGoal(button.dataset.id);
      });
    });
  }

  function editGoal(id) {
    const goal = state.goals.find((item) => item.id === id);
    if (!goal) return;
    els.goalIdInput.value = goal.id;
    els.goalTitleInput.value = goal.title;
    els.goalEmojiInput.value = goal.emoji || '';
    els.goalTargetInput.value = goal.targetAmount;
    els.goalSavedInput.value = goal.currentAmount || 0;
    els.goalDueInput.value = goal.dueDate || '';
    els.goalAccountInput.value = getAccount(goal.accountId) ? goal.accountId : '';
    els.goalTypeInput.value = goal.type || 'experience';
    els.goalPriorityInput.value = goal.priority || 'medium';
    els.goalMemoInput.value = goal.memo || '';
    els.goalSaveButton.textContent = '目標を更新';
    switchTab('goals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteGoal(id) {
    const goal = state.goals.find((item) => item.id === id);
    if (!goal) return;
    if (!confirm(`目標「${goal.title}」を削除しますか？`)) return;
    state.goals = state.goals.filter((item) => item.id !== id);
    renderAll();
    showToast('目標を削除しました。');
  }

  function handleCategoryAdd(event) {
    event.preventDefault();
    const name = els.categoryNameInput.value.trim();
    if (!name) return;
    const category = addCategoryIfMissing(name);
    els.categoryNameInput.value = '';
    renderAll();
    showToast(`カテゴリ「${category.name}」を追加しました。`);
  }

  function handleCategoryAction(button) {
    if (button.dataset.action === 'rename-category') {
      const id = button.dataset.id;
      const input = els.categoryList.querySelector(`input[data-id="${cssEscape(id)}"]`);
      renameCategory(id, input.value.trim());
    }
    if (button.dataset.action === 'delete-category') deleteCategory(button.dataset.id);
  }

  function renameCategory(id, newName) {
    if (!newName) return showToast('カテゴリ名を入力してください。');
    const category = state.categories.find((cat) => cat.id === id);
    if (!category) return;
    if (state.categories.some((cat) => cat.id !== id && cat.name === newName)) return showToast('同じカテゴリ名がすでにあります。');
    category.name = newName;
    state.transactions.forEach((tx) => { if (tx.categoryId === id) tx.categoryName = newName; });
    renderAll();
    showToast('カテゴリ名を変更しました。');
  }

  function deleteCategory(id) {
    if (state.categories.length <= 1) return showToast('カテゴリは最低1つ必要です。');
    const category = state.categories.find((cat) => cat.id === id);
    if (!category) return;
    if (!confirm(`カテゴリ「${category.name}」を削除しますか？\nこのカテゴリの履歴は「その他」に移します。`)) return;
    let other = findCategoryByName('その他');
    if (!other || other.id === id) other = state.categories.find((cat) => cat.id !== id);
    state.transactions.forEach((tx) => {
      if (tx.categoryId === id) {
        tx.categoryId = other.id;
        tx.categoryName = other.name;
        tx.updatedAt = new Date().toISOString();
      }
    });
    state.categories = state.categories.filter((cat) => cat.id !== id);
    renderAll();
    showToast('カテゴリを削除しました。');
  }

  function editTransaction(id) {
    const tx = state.transactions.find((item) => item.id === id);
    if (!tx) return;
    els.editId.value = tx.id;
    els.dateInput.value = tx.date;
    els.amountInput.value = tx.amount;
    els.accountInput.value = tx.accountId;
    els.paymentMethodInput.value = tx.paymentMethod;
    els.categoryInput.value = tx.categoryId;
    els.newCategoryInput.value = '';
    els.memoInput.value = tx.memo || '';
    els.saveButton.textContent = '更新';
    renderAccountEffect();
    switchTab('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteTransaction(id) {
    const tx = state.transactions.find((item) => item.id === id);
    if (!tx) return;
    if (!confirm(`${formatDateShort(tx.date)} ${tx.categoryName} ${formatYen(tx.amount)} を削除しますか？`)) return;
    state.transactions = state.transactions.filter((item) => item.id !== id);
    renderAll();
    showToast('支出を削除しました。');
  }

  function exportTransactionsCsv() {
    const header = ['id', 'date', 'type', 'amount', 'payment_method', 'account_id', 'account_name', 'account_type', 'withdrawal_account', 'category', 'memo', 'asset_effect', 'created_at', 'updated_at'];
    const rows = state.transactions.slice().sort((a, b) => a.date.localeCompare(b.date)).map((tx) => {
      const account = getTxAccount(tx);
      const withdrawal = account?.type === 'card' ? getAccount(account.withdrawalAccountId)?.name || '' : '';
      return [
        tx.id, tx.date, tx.type || 'expense', tx.amount, tx.paymentMethod,
        tx.accountId, tx.accountName || account?.name || '', account?.type || tx.accountType || '', withdrawal,
        tx.categoryName || findCategoryName(tx.categoryId) || 'その他', tx.memo || '', assetEffectLabel(tx), tx.createdAt || '', tx.updatedAt || ''
      ];
    });
    downloadCsv(`kakeibo_${toDateInputValue(new Date()).replaceAll('-', '')}.csv`, [header, ...rows]);
    showToast('支出CSVを書き出しました。');
  }

  function exportAccountsCsv() {
    const header = ['id', 'name', 'type', 'type_label', 'institution', 'withdrawal_account_id', 'withdrawal_account_name', 'include_in_assets', 'sort_order', 'created_at', 'updated_at'];
    const rows = sortAccounts(state.accounts).map((account) => [
      account.id, account.name, account.type, accountTypeLabels[account.type] || account.type, account.institution || '',
      account.withdrawalAccountId || '', getAccount(account.withdrawalAccountId)?.name || '', account.includeInAssets ? 'true' : 'false',
      account.sortOrder ?? '', account.createdAt || '', account.updatedAt || ''
    ]);
    downloadCsv(`kakeibo_accounts_${toDateInputValue(new Date()).replaceAll('-', '')}.csv`, [header, ...rows]);
    showToast('支払元CSVを書き出しました。');
  }


  function exportGoalsCsv() {
    const header = ['id', 'title', 'type', 'priority', 'target_amount', 'current_amount', 'remaining_amount', 'progress_percent', 'due_date', 'account_id', 'account_name', 'emoji', 'memo', 'created_at', 'updated_at'];
    const rows = (state.goals || []).map((goal) => {
      const account = getAccount(goal.accountId);
      return [
        goal.id, goal.title, goal.type, goal.priority, goal.targetAmount, goal.currentAmount,
        Math.max(0, Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0)), Math.round(goalProgress(goal)), goal.dueDate || '',
        goal.accountId || '', account?.name || '', goal.emoji || '', goal.memo || '', goal.createdAt || '', goal.updatedAt || ''
      ];
    });
    downloadCsv(`kakeibo_goals_${toDateInputValue(new Date()).replaceAll('-', '')}.csv`, [header, ...rows]);
    showToast('目標CSVを書き出しました。');
  }

  function downloadCsv(filename, rows) {
    const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importTransactionsCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '').replace(/^\ufeff/, '');
        const parsed = parseCsv(text);
        const imported = rowsToTransactions(parsed);
        if (!imported.length) return showToast('読み込める支出データがありませんでした。');
        let added = 0;
        let updated = 0;
        imported.forEach((tx) => {
          const index = state.transactions.findIndex((item) => item.id === tx.id);
          if (index >= 0) { state.transactions[index] = tx; updated += 1; }
          else { state.transactions.push(tx); added += 1; }
        });
        renderAll();
        showToast(`支出CSVを読み込みました。追加${added}件・更新${updated}件`);
      } catch (error) {
        console.error(error);
        showToast('CSVの読み込みに失敗しました。形式を確認してください。');
      } finally {
        els.importCsvInput.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  }


  function importGoalsCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '').replace(/^\ufeff/, '');
        const parsed = parseCsv(text);
        const imported = rowsToGoals(parsed);
        if (!imported.length) return showToast('読み込める目標データがありませんでした。');
        let added = 0;
        let updated = 0;
        imported.forEach((goal) => {
          const index = state.goals.findIndex((item) => item.id === goal.id);
          if (index >= 0) { state.goals[index] = goal; updated += 1; }
          else { state.goals.push(goal); added += 1; }
        });
        renderAll();
        showToast(`目標CSVを読み込みました。追加${added}件・更新${updated}件`);
      } catch (error) {
        console.error(error);
        showToast('目標CSVの読み込みに失敗しました。形式を確認してください。');
      } finally {
        els.importGoalsCsvInput.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  }


  function renderBankSettlements() {
    if (!els.settlementList) return;
    const month = els.bankMonthInput?.value || toDateInputValue(new Date()).slice(0, 7);
    const settlements = filterByMonth(state.settlements || [], month).sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
    const settlementTotal = sumSettlements(settlements);
    const cardExpenseTotal = sumTransactions(filterByMonth(state.transactions || [], month).filter((tx) => getTxAccount(tx)?.type === 'card'));
    const diff = cardExpenseTotal - settlementTotal;

    els.bankSettlementTotal.textContent = formatYen(settlementTotal);
    els.bankSettlementCount.textContent = `${settlements.length}件`;
    els.bankUnsettledTotal.textContent = formatYen(diff);

    if (!settlements.length) {
      els.settlementList.innerHTML = '<div class="empty">この月のカード精算記録はありません。楽天銀行CSVを読み込むと、クレカ引き落としだけをここに登録します。</div>';
      return;
    }

    els.settlementList.innerHTML = settlements.map((item) => `
      <article class="settlement-item" data-id="${escapeHtml(item.id)}">
        <div class="settlement-date">${formatDateShort(item.date)}</div>
        <div class="settlement-main">
          <strong>${escapeHtml(item.cardAccountName || 'カード')}</strong>
          <small>${escapeHtml(item.bankAccountName || '銀行口座')}から精算 / ${escapeHtml(item.description || '明細なし')}</small>
        </div>
        <div class="settlement-side">
          <div class="settlement-amount">${formatYen(item.amount)}</div>
          <button class="icon-button" data-action="delete-settlement" data-id="${escapeHtml(item.id)}">削除</button>
        </div>
      </article>`).join('');

    els.settlementList.querySelectorAll('button[data-action="delete-settlement"]').forEach((button) => {
      button.addEventListener('click', () => deleteSettlement(button.dataset.id));
    });
  }


  function renderAchievements() {
    if (!els.achievementList) return;
    const facts = buildAchievementFacts();
    const results = achievementDefinitions.map((definition) => achievementResult(definition, facts));
    const unlocked = results.filter((item) => item.unlocked);
    const locked = results.filter((item) => !item.unlocked);

    els.achievementUnlockedCount.textContent = unlocked.length;
    els.achievementTotalCount.textContent = results.length;
    els.achievementRecordDays.textContent = `${facts.recordDays}日`;
    els.achievementMonthEntries.textContent = `${facts.monthEntries}件`;
    els.achievementBestStreak.textContent = `${facts.bestStreak}日`;
    renderAchievementTitle(facts, unlocked.length, results.length);
    renderNextAchievements(locked);

    els.achievementList.innerHTML = results.map((item) => `
      <article class="achievement-card ${item.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${escapeHtml(item.emoji)}</div>
        <div class="achievement-body">
          <div class="achievement-head">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="badge">${item.unlocked ? '解除済み' : `${Math.round(item.percent)}%`}</span>
          </div>
          <p>${escapeHtml(item.description)}</p>
          <div class="achievement-progress"><span style="--w:${Math.max(4, Math.min(100, item.percent))}%"></span></div>
          <small>${escapeHtml(item.progressText)}</small>
        </div>
      </article>`).join('');
  }

  function buildAchievementFacts() {
    const month = els.achievementMonthInput?.value || toDateInputValue(new Date()).slice(0, 7);
    const allTransactions = state.transactions || [];
    const monthTransactions = filterByMonth(allTransactions, month);
    const recordDaysSet = new Set(monthTransactions.map((tx) => tx.date).filter(Boolean));
    const categories = new Set(monthTransactions.map((tx) => tx.categoryName || findCategoryName(tx.categoryId)).filter(Boolean));
    const accounts = new Set(monthTransactions.map((tx) => tx.accountId || tx.accountName).filter(Boolean));
    const methods = new Set(monthTransactions.map((tx) => tx.paymentMethod).filter(Boolean));
    const directTypes = new Set(['cash', 'envelope', 'bank', 'cashless']);
    const categoryMatch = (tx, keyword) => String(tx.categoryName || findCategoryName(tx.categoryId) || '').includes(keyword);
    const settlements = state.settlements || [];
    return {
      month,
      totalEntries: allTransactions.length,
      monthEntries: monthTransactions.length,
      julyEntries: filterByMonth(allTransactions, '2026-07').length,
      recordDays: recordDaysSet.size,
      categoryCount: categories.size,
      accountCount: accounts.size,
      methodCount: methods.size,
      memoEntries: allTransactions.filter((tx) => String(tx.memo || '').trim()).length,
      envelopeEntries: allTransactions.filter((tx) => getTxAccount(tx)?.type === 'envelope').length,
      directEntries: allTransactions.filter((tx) => directTypes.has(getTxAccount(tx)?.type)).length,
      cardEntries: allTransactions.filter((tx) => getTxAccount(tx)?.type === 'card').length,
      cardMonthEntries: monthTransactions.filter((tx) => getTxAccount(tx)?.type === 'card').length,
      settlementEntries: settlements.length,
      settlementMonthEntries: filterByMonth(settlements, month).length,
      jcbUnknownSettlements: settlements.filter((item) => item.cardAccountId === 'card_jcb_unknown' || String(item.cardAccountName || '').includes('JCB系')).length,
      goalCount: (state.goals || []).length,
      goalAchievedCount: (state.goals || []).filter((goal) => goalProgress(goal) >= 100).length,
      whiskyEntries: allTransactions.filter((tx) => categoryMatch(tx, 'ウイスキー')).length,
      gameEntries: allTransactions.filter((tx) => categoryMatch(tx, 'ゲーム')).length,
      medicalEntries: allTransactions.filter((tx) => categoryMatch(tx, '医療')).length,
      travelEntries: allTransactions.filter((tx) => categoryMatch(tx, '旅行')).length,
      bestStreak: longestRecordStreak(allTransactions.map((tx) => tx.date).filter(Boolean))
    };
  }

  function achievementResult(definition, facts) {
    const current = Math.max(0, Number(definition.current(facts) || 0));
    const target = Math.max(1, Number(definition.target || 1));
    const percent = Math.min(100, Math.round((current / target) * 100));
    return {
      ...definition,
      current,
      percent,
      unlocked: current >= target,
      progressText: `${current}/${target}`
    };
  }

  function renderAchievementTitle(facts, unlockedCount, totalCount) {
    const ratio = totalCount ? unlockedCount / totalCount : 0;
    let title = '家計簿、開幕前夜';
    let message = 'まずは7月分の支出を1件。小さく始めて、続く形にする。';
    let emoji = '🌙';
    if (facts.totalEntries >= 1) { title = '記録の火が灯った'; message = '入力は始まった。あとは完璧より継続で勝てばいい。'; emoji = '🌱'; }
    if (facts.recordDays >= 3) { title = '三日坊主撃破'; message = 'ここまで来たら、もう「やれる側」に片足入ってる。'; emoji = '🔥'; }
    if (facts.recordDays >= 7) { title = '一週間の航海士'; message = '1週間分の記録は強い。家計のクセが見え始める。'; emoji = '🗓️'; }
    if (facts.bestStreak >= 7) { title = '生活ログ・チェイン7'; message = '7日連続は立派。自作アプリで習慣を作れている。'; emoji = '🚀'; }
    if (ratio >= 0.6) { title = '家計簿ギルド上級者'; message = '解除がかなり進んでいる。総資産アプリ連携の土台として十分強い。'; emoji = '🏅'; }
    if (ratio >= 0.9) { title = '家計簿の守護者'; message = 'ここまで来たら、もう家計簿が生活の一部。'; emoji = '👑'; }

    els.achievementTitleBox.innerHTML = `
      <div class="achievement-title-emoji">${emoji}</div>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(message)}</p>
      </div>`;
  }

  function renderNextAchievements(locked) {
    const next = locked.slice().sort((a, b) => b.percent - a.percent || a.target - b.target).slice(0, 3);
    if (!next.length) {
      els.nextAchievementList.innerHTML = '<div class="empty">全実績解除。これはもう完全に習慣化です。</div>';
      return;
    }
    els.nextAchievementList.innerHTML = next.map((item) => `
      <div class="next-achievement-row">
        <span>${escapeHtml(item.emoji)}</span>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.progressText)} / ${escapeHtml(item.description)}</small>
        </div>
      </div>`).join('');
  }

  function longestRecordStreak(dates) {
    const unique = [...new Set(dates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)))].sort();
    if (!unique.length) return 0;
    let best = 1;
    let current = 1;
    for (let i = 1; i < unique.length; i += 1) {
      const prev = new Date(`${unique[i - 1]}T00:00:00`);
      const next = new Date(`${unique[i]}T00:00:00`);
      const diffDays = Math.round((next - prev) / 86400000);
      if (diffDays === 1) current += 1;
      else current = 1;
      best = Math.max(best, current);
    }
    return best;
  }

  function importRakutenBankCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buffer = reader.result;
        const text = decodeCsvBuffer(buffer);
        const parsed = parseCsv(String(text || '').replace(/^\ufeff/, ''));
        const detected = rowsToRakutenBankSettlements(parsed);
        if (!detected.length) return showToast('クレカ引き落とし明細は検出できませんでした。摘要の文言を確認してください。');
        let added = 0;
        let skipped = 0;
        detected.forEach((item) => {
          const exists = state.settlements.some((old) => old.sourceKey === item.sourceKey || (old.date === item.date && old.cardAccountId === item.cardAccountId && Number(old.amount) === Number(item.amount) && old.description === item.description));
          if (exists) { skipped += 1; return; }
          state.settlements.push(item);
          added += 1;
        });
        renderAll();
        showToast(`楽天銀行CSVを処理しました。精算追加${added}件・重複スキップ${skipped}件`);
      } catch (error) {
        console.error(error);
        showToast('楽天銀行CSVの読み込みに失敗しました。CSV形式を確認してください。');
      } finally {
        els.importBankCsvInput.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function rowsToRakutenBankSettlements(rows) {
    if (!rows.length) return [];
    const headerIndex = findBankHeaderIndex(rows);
    if (headerIndex < 0) return [];
    const header = rows[headerIndex].map((cell) => String(cell || '').trim());
    const dataRows = rows.slice(headerIndex + 1);
    const bankAccount = findAccountByName('楽天銀行') || state.accounts.find((account) => account.type === 'bank');
    if (!bankAccount) return [];
    const now = new Date().toISOString();

    return dataRows.map((row) => {
      const obj = Object.fromEntries(header.map((key, index) => [key, row[index] ?? '']));
      const date = normalizeBankDate(valueByCandidates(obj, ['日付', '入出金日', '取引日', 'お取引日', '年月日', 'date']));
      const description = [
        valueByCandidates(obj, ['摘要', '内容', 'お取引内容', '取引内容', '明細', '備考', 'メモ', '摘要内容', 'description']),
        valueByCandidates(obj, ['依頼人名', '振込依頼人', '支払先', '加盟店名', '相手先'])
      ].filter(Boolean).join(' ').trim();
      const amount = extractWithdrawalAmount(obj);
      const card = detectCardFromDescription(description);
      if (!date || !amount || !card) return null;
      return {
        id: createId('settle'),
        date,
        amount,
        bankAccountId: bankAccount.id,
        bankAccountName: bankAccount.name,
        cardAccountId: card.id,
        cardAccountName: card.name,
        description,
        source: '楽天銀行CSV',
        sourceKey: makeSettlementKey(date, amount, card.id, description),
        createdAt: now,
        updatedAt: now
      };
    }).filter(Boolean);
  }

  function findBankHeaderIndex(rows) {
    return rows.findIndex((row) => {
      const text = row.map((cell) => String(cell || '').trim()).join('|');
      const hasDate = /日付|入出金日|取引日|お取引日|年月日|date/i.test(text);
      const hasDesc = /摘要|内容|取引|明細|description/i.test(text);
      const hasAmount = /出金|支払|金額|入金|amount|debit|withdrawal/i.test(text);
      return hasDate && hasDesc && hasAmount;
    });
  }

  function extractWithdrawalAmount(obj) {
    const debit = valueByCandidates(obj, ['出金', '出金額', 'お引出し金額', '引出金額', '支払金額', 'お支払い金額', '利用額', 'debit', 'withdrawal']);
    const debitAmount = parseMoney(debit);
    if (debitAmount > 0) return debitAmount;

    const income = valueByCandidates(obj, ['入金', '入金額', 'お預入れ金額', '預入金額', 'income', 'credit']);
    if (parseMoney(income) > 0) return 0;

    const generic = valueByCandidates(obj, ['金額', '取引金額', 'amount']);
    const signed = parseSignedMoney(generic);
    return signed < 0 ? Math.abs(signed) : 0;
  }

  function detectCardFromDescription(description) {
    const text = normalizeSearchText(description);
    if (!text) return null;
    const cardAccounts = state.accounts.filter((account) => account.type === 'card');
    const rules = [
      { id: 'card_smbc', names: ['三井住友カード'], keywords: ['三井住友カード', 'ミツイスミトモカード', 'ミツイスミトモカート', 'smbcカード', 'smbc card'] },
      { id: 'card_rakuten', names: ['楽天カード'], keywords: ['楽天カード', '楽天カードサービス', 'ラクテンカード', 'ラクテンカードサービス', 'rakutencard', 'rakuten card', 'ラクテンkc'] },
      { id: 'card_paypay', names: ['PayPayカード'], keywords: ['paypayカード', 'paypaycard', 'ペイペイカード', 'ＰＡＹＰＡＹカード', 'ワイジェイカード', 'yjカード'] },
      { id: 'card_life', names: ['LIFEカード', 'ライフカード'], keywords: ['lifeカード', 'ライフカード', 'lifecard'] },
      { id: 'card_donpen', names: ['ドンペンカード（UCS）', 'ドンペンカード'], keywords: ['ユーシーエス', 'ユシエス', 'ucs', 'ドンペンカード', 'majica donpen card'] },
      { id: 'card_jcb_unknown', names: ['JCB系カード（要確認）'], keywords: ['ジェーシービー', 'ジエシービー', 'jcb', 'シ゛エ－シ－ヒ゛－'] },
      { id: 'card_recruit', names: ['リクルートカード'], keywords: ['リクルートカード', 'リクルート', 'recruit'] },
      { id: 'card_kabu', names: ['KABUカード'], keywords: ['kabuカード', 'kabu', 'カブカード', 'カブコム', 'kabu.com'] },
      { id: 'card_seven', names: ['セブンカード'], keywords: ['セブンカード', 'セブン・カード', 'seven card', '7card', '7cs'] }
    ];

    for (const rule of rules) {
      if (!rule.keywords.some((keyword) => text.includes(normalizeSearchText(keyword)))) continue;
      return getAccount(rule.id) || rule.names.map(findAccountByName).find(Boolean) || cardAccounts.find((account) => rule.names.some((name) => account.name.includes(name.replace('カード', ''))));
    }

    return cardAccounts.find((account) => text.includes(normalizeSearchText(account.name)) || normalizeSearchText(account.name).replace('カード', '') && text.includes(normalizeSearchText(account.name).replace('カード', '')) ) || null;
  }

  function exportSettlementsCsv() {
    const header = ['id', 'date', 'amount', 'bank_account_id', 'bank_account_name', 'card_account_id', 'card_account_name', 'description', 'source', 'source_key', 'created_at', 'updated_at'];
    const rows = (state.settlements || []).slice().sort((a, b) => a.date.localeCompare(b.date)).map((item) => [
      item.id, item.date, item.amount, item.bankAccountId, item.bankAccountName, item.cardAccountId, item.cardAccountName,
      item.description || '', item.source || '楽天銀行CSV', item.sourceKey || '', item.createdAt || '', item.updatedAt || ''
    ]);
    downloadCsv(`kakeibo_card_settlements_${toDateInputValue(new Date()).replaceAll('-', '')}.csv`, [header, ...rows]);
    showToast('カード精算CSVを書き出しました。');
  }

  function deleteSettlement(id) {
    const item = (state.settlements || []).find((candidate) => candidate.id === id);
    if (!item) return;
    if (!confirm(`${formatDateShort(item.date)} ${item.cardAccountName} ${formatYen(item.amount)} の精算記録を削除しますか？`)) return;
    state.settlements = state.settlements.filter((candidate) => candidate.id !== id);
    renderAll();
    showToast('精算記録を削除しました。');
  }

  function clearSettlements() {
    const count = (state.settlements || []).length;
    if (!count) return showToast('削除する精算記録はありません。');
    if (!confirm(`カード精算記録${count}件をすべて削除しますか？\n支出履歴は削除されません。`)) return;
    state.settlements = [];
    renderAll();
    showToast('精算記録を全削除しました。');
  }

  function decodeCsvBuffer(buffer) {
    const bytes = new Uint8Array(buffer);
    const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (!hasMojibake(utf8)) return utf8;
    try { return new TextDecoder('shift_jis', { fatal: false }).decode(bytes); }
    catch (error) { return utf8; }
  }

  function hasMojibake(text) { return /�|縺|譁|荳|蜈|繧|鬆/.test(text); }

  function valueByCandidates(obj, candidates) {
    const entries = Object.entries(obj);
    for (const candidate of candidates) {
      const exact = entries.find(([key]) => normalizeHeaderKey(key) === normalizeHeaderKey(candidate));
      if (exact && String(exact[1] ?? '').trim()) return String(exact[1]).trim();
    }
    for (const candidate of candidates) {
      const partial = entries.find(([key]) => normalizeHeaderKey(key).includes(normalizeHeaderKey(candidate)) && String(obj[key] ?? '').trim());
      if (partial) return String(partial[1]).trim();
    }
    return '';
  }

  function normalizeHeaderKey(value) { return String(value || '').trim().toLowerCase().replace(/[\s　・･_\-]/g, ''); }

  function normalizeBankDate(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    const ymd = text.match(/(20\d{2}|19\d{2})[\/\-.年](\d{1,2})[\/\-.月](\d{1,2})/);
    if (ymd) return `${ymd[1]}-${String(Number(ymd[2])).padStart(2, '0')}-${String(Number(ymd[3])).padStart(2, '0')}`;
    const compact = text.match(/^(20\d{2}|19\d{2})(\d{2})(\d{2})$/);
    if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
    const slash = text.match(/^(\d{1,2})[\/\-.月](\d{1,2})日?$/);
    if (slash) {
      const year = new Date().getFullYear();
      return `${year}-${String(Number(slash[1])).padStart(2, '0')}-${String(Number(slash[2])).padStart(2, '0')}`;
    }
    return text.slice(0, 10);
  }

  function parseMoney(value) {
    const text = String(value || '').replace(/[¥￥円,\s　]/g, '').replace(/[▲△]/g, '-');
    const num = Number(text);
    return Number.isFinite(num) ? Math.abs(Math.round(num)) : 0;
  }

  function parseSignedMoney(value) {
    const text = String(value || '').replace(/[¥￥円,\s　]/g, '').replace(/[▲△]/g, '-');
    const num = Number(text);
    return Number.isFinite(num) ? Math.round(num) : 0;
  }

  function normalizeSearchText(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s　・･_\-.()（）]/g, '')
      .replace(/[ーｰ－−‐‑‒–—―]/g, '')
      .normalize('NFC');
  }
  function makeSettlementKey(date, amount, cardId, description) { return `${date}|${amount}|${cardId}|${normalizeSearchText(description).slice(0, 80)}`; }
  function sumSettlements(settlements) { return (settlements || []).reduce((sum, item) => sum + Number(item.amount || 0), 0); }

  function rowsToTransactions(parsed) {
    if (!parsed.length) return [];
    const [header, ...rows] = parsed;
    const normalizedHeader = header.map((cell) => cell.trim().toLowerCase());
    return rows.map((row) => {
      const obj = {};
      normalizedHeader.forEach((key, index) => { obj[key] = row[index] || ''; });
      const accountName = obj.account_name || obj.payment_source || obj['支払元'] || '財布';
      let account = obj.account_id ? getAccount(obj.account_id) : findAccountByName(accountName);
      if (!account) account = addAccountIfMissing(accountName, obj.account_type || guessAccountType(accountName));
      const category = addCategoryIfMissing(obj.category || obj['カテゴリ'] || 'その他');
      const amount = Number(String(obj.amount || obj['金額'] || '').replace(/[¥,円\s]/g, ''));
      if (!obj.date || !Number.isFinite(amount) || amount <= 0) return null;
      const now = new Date().toISOString();
      return {
        id: obj.id || createId('tx'), date: obj.date.slice(0, 10), type: 'expense', amount: Math.round(amount),
        paymentMethod: obj.payment_method || obj['支払方法'] || methodForAccount(account),
        accountId: account.id, accountName: account.name, accountType: account.type, withdrawalAccountId: account.withdrawalAccountId || '',
        categoryId: category.id, categoryName: category.name, memo: obj.memo || obj['メモ'] || '',
        createdAt: obj.created_at || now, updatedAt: obj.updated_at || now
      };
    }).filter(Boolean);
  }


  function rowsToGoals(rows) {
    if (!rows.length) return [];
    const header = rows[0].map((cell) => String(cell).trim());
    const dataRows = rows.slice(1);
    const now = new Date().toISOString();
    return dataRows.map((row) => {
      const obj = Object.fromEntries(header.map((key, index) => [key, row[index] ?? '']));
      const account = getAccount(obj.account_id) || findAccountByName(obj.account_name) || null;
      return normalizeGoal({
        id: obj.id || createId('goal'),
        title: obj.title || obj['タイトル'],
        type: obj.type || obj['種類'],
        priority: obj.priority || obj['優先度'],
        targetAmount: obj.target_amount || obj['目標金額'],
        currentAmount: obj.current_amount || obj.saved_amount || obj['現在の積立額'],
        dueDate: obj.due_date || obj['目標時期'],
        accountId: account?.id || '',
        emoji: obj.emoji || obj['絵文字'],
        memo: obj.memo || obj['メモ'],
        createdAt: obj.created_at || now,
        updatedAt: obj.updated_at || now
      }, state.accounts);
    }).filter(Boolean);
  }

  function resetAllData() {
    if (!confirm('全データを初期化しますか？\nCSVを書き出していないデータは戻せません。')) return;
    localStorage.removeItem(STORAGE_KEY);
    OLD_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    state = createFallbackState();
    els.summaryMonthInput.value = toDateInputValue(new Date()).slice(0, 7);
    els.historyMonthInput.value = toDateInputValue(new Date()).slice(0, 7);
    if (els.bankMonthInput) els.bankMonthInput.value = toDateInputValue(new Date()).slice(0, 7);
    if (els.achievementMonthInput) els.achievementMonthInput.value = toDateInputValue(new Date()).slice(0, 7);
    resetExpenseForm();
    resetAccountForm();
    resetGoalForm();
    renderAll();
    showToast('初期化しました。');
  }

  function seedCreditCards() { state.accounts = seedCreditCardsInList(state.accounts); }

  function seedCreditCardsInList(accounts) {
    const result = mergeAccounts(accounts, defaultAccounts.filter((account) => account.id === 'acct_rakuten_bank' || account.type === 'card'));
    const rakuten = result.find((account) => account.id === 'acct_rakuten_bank') || findAccountByNameInList(result, '楽天銀行');
    result.forEach((account) => { if (account.type === 'card' && !account.withdrawalAccountId && rakuten) account.withdrawalAccountId = rakuten.id; });
    return sortAccounts(result);
  }

  function addCategoryIfMissing(name) {
    const normalized = String(name || '').trim();
    let category = findCategoryByName(normalized);
    if (!category) {
      category = makeCategory(normalized);
      state.categories.push(category);
    }
    return category;
  }

  function addAccountIfMissing(name, type = 'cash') {
    const normalized = String(name || '').trim();
    let account = findAccountByName(normalized);
    if (!account) {
      account = { id: createId('acct'), name: normalized, type: normalizeAccountType(type), institution: '', withdrawalAccountId: '', includeInAssets: type !== 'card', sortOrder: nextSortOrder(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (account.type === 'card') account.withdrawalAccountId = getRakutenBankId();
      state.accounts.push(account);
    }
    return account;
  }

  function mergeAccounts(primary, secondary) {
    const byName = new Map();
    [...primary, ...secondary].forEach((raw) => {
      const account = normalizeAccount(raw);
      if (!account) return;
      if (!byName.has(account.name)) byName.set(account.name, account);
      else {
        const existing = byName.get(account.name);
        byName.set(account.name, { ...account, ...existing, id: existing.id || account.id, withdrawalAccountId: existing.withdrawalAccountId || account.withdrawalAccountId });
      }
    });
    return [...byName.values()].map((account, index) => ({ ...account, sortOrder: Number.isFinite(Number(account.sortOrder)) ? Number(account.sortOrder) : index }));
  }

  function sortAccounts(accounts) { return [...accounts].sort((a, b) => Number(a.sortOrder ?? 999) - Number(b.sortOrder ?? 999) || a.name.localeCompare(b.name, 'ja')); }
  function nextSortOrder() { return state.accounts.reduce((max, account) => Math.max(max, Number(account.sortOrder || 0)), -1) + 1; }
  function getAccount(id) { return state.accounts.find((account) => account.id === id); }
  function getTxAccount(tx) { return getAccount(tx.accountId) || findAccountByName(tx.accountName); }
  function findAccountByName(name) { return findAccountByNameInList(state.accounts, name); }
  function findAccountByNameInList(accounts, name) { return accounts.find((account) => account.name === String(name || '').trim()); }
  function getAccountFromList(accounts, id) { return accounts.find((account) => account.id === String(id || '')); }
  function findCategoryByName(name) { return state?.categories?.find((cat) => cat.name === String(name || '').trim()); }
  function findCategoryName(id) { return state?.categories?.find((cat) => cat.id === id)?.name; }


  function normalizeGoalType(type) {
    const value = String(type || '').toLowerCase();
    if (['experience', 'wish', 'reserve'].includes(value)) return value;
    const text = String(type || '');
    if (text.includes('欲しい')) return 'wish';
    if (text.includes('備')) return 'reserve';
    return 'experience';
  }

  function normalizeGoalPriority(priority) {
    const value = String(priority || '').toLowerCase();
    if (['high', 'medium', 'low'].includes(value)) return value;
    const text = String(priority || '');
    if (text.includes('最優先') || text.includes('高')) return 'high';
    if (text.includes('いつか') || text.includes('低')) return 'low';
    return 'medium';
  }

  function goalProgress(goal) {
    const target = Number(goal?.targetAmount || 0);
    if (target <= 0) return 0;
    return Math.min(100, Math.max(0, Number(goal.currentAmount || 0) / target * 100));
  }

  function monthlyNeeded(goal) {
    const remaining = Math.max(0, Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0));
    if (!goal.dueDate || remaining <= 0) return null;
    const months = monthsUntil(goal.dueDate);
    if (months <= 0) return remaining;
    return Math.ceil(remaining / months);
  }

  function monthsUntil(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString))) return 0;
    const today = new Date();
    const due = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(due.getTime()) || due < today) return 0;
    const months = (due.getFullYear() - today.getFullYear()) * 12 + (due.getMonth() - today.getMonth());
    return Math.max(1, months + 1);
  }

  function defaultGoalEmoji(type) {
    if (type === 'wish') return '🎁';
    if (type === 'reserve') return '🛡️';
    return '✨';
  }

  function normalizeAccountType(type) {
    const value = String(type || '').toLowerCase();
    if (['cash', 'envelope', 'bank', 'card', 'cashless'].includes(value)) return value;
    if (String(type).includes('封筒')) return 'envelope';
    if (String(type).includes('銀行')) return 'bank';
    if (String(type).includes('カード') || String(type).includes('クレジット')) return 'card';
    if (String(type).includes('電子') || String(type).includes('QR')) return 'cashless';
    return 'cash';
  }

  function guessAccountType(name) {
    const text = String(name || '');
    if (text.includes('カード')) return 'card';
    if (text.includes('銀行') || text.includes('口座')) return 'bank';
    if (text.includes('封筒')) return 'envelope';
    if (text.includes('PayPay') || text.includes('電子') || text.includes('QR')) return 'cashless';
    return 'cash';
  }

  function methodForAccount(account) {
    if (!account) return '現金';
    if (account.type === 'card' || account.type === 'cashless') return 'キャッシュレス';
    if (account.type === 'bank') return '引き落とし';
    return '現金';
  }

  function getRakutenBankId() { return findAccountByName('楽天銀行')?.id || 'acct_rakuten_bank'; }

  function assetEffectLabel(tx) {
    const account = getTxAccount(tx);
    if (account?.type === 'card') return `${account.name}未払 +${tx.amount} / 引き落とし先 ${getAccount(account.withdrawalAccountId)?.name || '未設定'}`;
    return `${account?.name || tx.accountName || '支払元'} -${tx.amount}`;
  }

  function filterByMonth(transactions, month) { return transactions.filter((tx) => tx.date && tx.date.startsWith(month)); }
  function sumTransactions(transactions) { return transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0); }

  function groupSum(transactions, key) {
    const map = new Map();
    transactions.forEach((tx) => { const name = tx[key] || '未設定'; map.set(name, (map.get(name) || 0) + Number(tx.amount || 0)); });
    return [...map.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
  }

  function groupCategorySum(transactions) {
    const map = new Map();
    transactions.forEach((tx) => { const name = tx.categoryName || findCategoryName(tx.categoryId) || '未分類'; map.set(name, (map.get(name) || 0) + Number(tx.amount || 0)); });
    return [...map.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
  }

  function groupAccountSum(transactions) {
    const map = new Map();
    transactions.forEach((tx) => { const account = getTxAccount(tx); const name = account?.name || tx.accountName || '支払元未設定'; map.set(name, (map.get(name) || 0) + Number(tx.amount || 0)); });
    return [...map.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
  }

  function maxAbs(rows) { return rows.reduce((max, row) => Math.max(max, Math.abs(row.total)), 0); }
  function daysInMonth(month) { if (!/^\d{4}-\d{2}$/.test(month)) return 0; const [year, m] = month.split('-').map(Number); return new Date(year, m, 0).getDate(); }
  function makeCategory(name) { return { id: createId('cat'), name: String(name).trim(), createdAt: new Date().toISOString() }; }
  function uniqueByName(categories) { const seen = new Set(); const result = []; categories.forEach((cat) => { const name = String(cat.name || '').trim(); if (!name || seen.has(name)) return; seen.add(name); result.push({ ...cat, name }); }); return result; }
  function createId(prefix) { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
  function toDateInputValue(date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }
  function formatYen(value) { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(Number(value || 0)); }
  function formatDateShort(dateString) { const [, month, day] = String(dateString).split('-'); return `${Number(month)}月${Number(day)}日`; }
  function formatDateJa(dateString) { const [year, month, day] = String(dateString).split('-'); return `${Number(year)}年${Number(month)}月${Number(day)}日`; }

  function escapeHtml(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }
  function cssEscape(value) { if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value); return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }
  function csvEscape(value) { const text = String(value ?? ''); if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`; return text; }

  function parseCsv(text) {
    const rows = []; let row = []; let cell = ''; let inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]; const next = text[i + 1];
      if (inQuotes) {
        if (char === '"' && next === '"') { cell += '"'; i += 1; }
        else if (char === '"') inQuotes = false;
        else cell += char;
        continue;
      }
      if (char === '"') inQuotes = true;
      else if (char === ',') { row.push(cell); cell = ''; }
      else if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (char !== '\r') cell += char;
    }
    row.push(cell); rows.push(row);
    return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
  }

  let toastTimer = null;
  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600);
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((error) => console.info('Service worker registration skipped:', error));
      });
    }
  }
})();
