import './style.css';

// -----------------------------------------
// アプリケーションの状態管理
// -----------------------------------------
const state = {
  name: 'たま',
  bg: 'morning',
  catSpeedPace: 'normal', // fast, normal, slow
  isInitialized: false,
  
  // 猫の種類
  catType: 'normal', // normal, cute, tsundere
  
  // 猫の状態
  catState: 'walk', // walk, sit, sleep, stretch, yawn
  catX: 45, // 画面幅に対するパーセンテージ（0-85%）
  catY: 15,
  catBaseX: 45,
  catBaseY: 15,
  catDirection: 'right', // left, right
  facingDirection: 'right', // left, right (顔の向き)
  catSpeed: 0.04, // 1フレームあたりの移動割合
};

// 背景画像ごとの猫の自然な配置座標リスト
const catPositions = {
  morning: [
    { x: 20, y: 15 }, // 床（左）
    { x: 45, y: 12 }, // 床（中央）
    { x: 75, y: 15 }, // 床（右）
    { x: 40, y: 35 }, // ソファ（座面左）
    { x: 55, y: 35 }  // ソファ（座面右）
  ],
  day: [
    { x: 25, y: 15 }, // 畳（左）
    { x: 40, y: 15 }, // 畳（中央）
    { x: 60, y: 25 }, // 畳（奥・テーブル右側手前）
    { x: 25, y: 40 }, // 縁側（左）
    { x: 50, y: 40 }, // 縁側（中央）
    { x: 75, y: 40 }  // 縁側（右）
  ],
  night: [
    { x: 18, y: 10 }, // 床（肉球マット）
    { x: 45, y: 28 }, // ベッド（掛け布団中央）
    { x: 60, y: 22 }, // ベッド（掛け布団右側）
    { x: 30, y: 40 }, // ベッド（枕元付近）
    { x: 80, y: 10 }  // 床（右サイドテーブル手前）
  ]
};

// 動作切り替え間隔を秒数からミリ秒に変換して取得する
function getBehaviorInterval(pace) {
  switch (pace) {
    case 'fast': return 4000;
    case 'slow': return 15000;
    case 'normal':
    default:
      return 8000;
  }
}

// 猫の性格（タイプ）ごとの吹き出しメッセージ
const catReactions = {
  normal: [
    'にゃー',
    'なでてくれてありがとう',
    'そばにいるよ',
    'ごろごろ……',
    'あったかいにゃあ',
    'しっぽがぴくぴくする'
  ],
  cute: [
    'にゃんっ',
    'もっとなでて〜',
    'うれしいにゃ',
    'いっしょにいてね',
    'ふにゃ〜',
    'ごろごろ……あまえんぼさんだにゃ'
  ],
  tsundere: [
    'べ、別にうれしくないし',
    '……もう少しなら、なでてもいいよ',
    'ふん、悪くないね',
    'そばにいてもいいけど？',
    'な、なにするのさっ',
    '……べ、べつにゴロゴロなんて言ってない！'
  ]
};

// 猫の性格（タイプ）ごとの今日の一言メッセージ
const catDailyMessages = {
  normal: [
    '今日もおつかれさま。よくがんばったね。',
    'ちょっと一息いれて、お茶でも飲まない？',
    'がんばりすぎちゃうあなたへ。少し休もう。',
    '何もしなくても、私はいつでもここにいるからね。',
    'ゆっくり深呼吸してみて。すーはー。'
  ],
  cute: [
    'きょうもおつかれさまだにゃ！なでなでして〜！',
    'いっしょにあそぼ？おやつもたべたいにゃあ。',
    'がんばるあなたちゃん、だーいすきっ！',
    'ここにずっといるから、どこにもいっちゃやだにゃ。',
    'ふわぁ……いっしょにおひるねしよ？'
  ],
  tsundere: [
    'ふん、今日もお疲れさま。……体、壊さないようにしなさいよね。',
    'ちょっと、働きすぎじゃない？……べ、別に心配してるわけじゃないけど。',
    'たまには休んだら？私だって、暇つぶし相手がいないと退屈だし。',
    'な、何よ。私がここにいてあげるんだから、元気出しなさいよね。',
    'ぼーっとする時間も必要でしょ。……横、空けておいてあげたから。'
  ]
};



// -----------------------------------------
// DOM要素の取得
// -----------------------------------------
const roomContainer = document.getElementById('room-container');
const roomBg = document.getElementById('room-bg');
const roomBgOverlay = document.getElementById('room-bg-overlay');
const catElement = document.getElementById('cat');
const catImg = document.getElementById('cat-img');
const catNameVal = document.getElementById('cat-name-val');
const catBubble = document.getElementById('cat-bubble');
const bubbleText = document.getElementById('bubble-text');

const dailyMessageContainer = document.getElementById('daily-message-container');
const dailyMessageText = document.getElementById('daily-message-text');
const btnCloseMessage = document.getElementById('btn-close-message');
const btnSettings = document.getElementById('btn-settings');

// モーダル関連
const setupModal = document.getElementById('setup-modal');
const setupCatNameInput = document.getElementById('setup-cat-name');
const btnSetupStart = document.getElementById('btn-setup-start');

const settingsModal = document.getElementById('settings-modal');
const settingsCatNameInput = document.getElementById('settings-cat-name');
const btnSettingsSave = document.getElementById('btn-settings-save');
const btnSettingsClose = document.getElementById('btn-settings-close');

// -----------------------------------------
// ローカルストレージ連携
// -----------------------------------------
function loadSettings() {
  const name = localStorage.getItem('neko_name');
  const catType = localStorage.getItem('neko_type');
  const speed = localStorage.getItem('neko_speed');
  const isInitialized = localStorage.getItem('neko_is_initialized');

  if (isInitialized === 'true') {
    state.name = name || 'たま';
    state.catType = catType || 'normal';
    state.catSpeedPace = speed || 'normal';
    state.isInitialized = true;
  }
}

function saveSettings() {
  localStorage.setItem('neko_name', state.name);
  localStorage.setItem('neko_type', state.catType);
  localStorage.setItem('neko_speed', state.catSpeedPace);
  localStorage.setItem('neko_is_initialized', state.isInitialized ? 'true' : 'false');
}

// 背景ごとの候補座標から現在地に近い位置を優先して選択し反映する
function selectRandomPosition(forceAll = false) {
  const positions = catPositions[state.bg] || catPositions['morning'];
  if (!positions || positions.length === 0) return;

  const currentX = state.catX;
  const currentY = state.catY;

  // 各候補への距離を計算
  const candidates = positions.map(pos => {
    const dx = pos.x - currentX;
    const dy = pos.y - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { pos, distance };
  });

  let selectedPos = null;

  if (forceAll) {
    // 初期化や背景切り替え時は、一番近い適正座標を選択してゆっくり移動させる
    candidates.sort((a, b) => a.distance - b.distance);
    selectedPos = candidates[0].pos;
  } else {
    // 距離が35%以下の候補に絞り込む（ほぼ同じ位置は除く）
    const nearCandidates = candidates.filter(c => c.distance <= 35 && c.distance > 1);

    if (nearCandidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * nearCandidates.length);
      selectedPos = nearCandidates[randomIndex].pos;
    } else {
      // 近くに候補がなければ一番近い候補を選択
      candidates.sort((a, b) => a.distance - b.distance);
      selectedPos = candidates[0].pos;
    }
  }

  state.catBaseX = selectedPos.x;
  state.catBaseY = selectedPos.y;
  state.catX = selectedPos.x;
  state.catY = selectedPos.y;

  // 移動先の方向に応じて猫の向きを決定（ほとんど横移動がない場合はランダム）
  const dx = selectedPos.x - currentX;
  if (Math.abs(dx) > 2) {
    state.catDirection = dx > 0 ? 'right' : 'left';
  } else {
    state.catDirection = Math.random() < 0.5 ? 'left' : 'right';
  }

  // 歩行移動時のみ顔の向きを更新する（x座標の移動方向に基づく）
  if (dx > 0) {
    state.facingDirection = 'right';
  } else if (dx < 0) {
    state.facingDirection = 'left';
  }
}

// -----------------------------------------
// UI表示の更新
// -----------------------------------------
function updateUI() {
  // 名前表示の更新
  catNameVal.textContent = state.name;
  
  // 背景の更新
  roomBg.className = `room-bg bg-${state.bg} active`;
  
  // 夜間オーバーレイの適用
  if (state.bg === 'night') {
    roomBgOverlay.classList.add('night-active');
  } else {
    roomBgOverlay.classList.remove('night-active');
  }

  // 猫の画像の更新
  if (catImg) {
    catImg.src = `/images/${state.catType}_${state.catState}.png`;
    catImg.alt = `${state.name} (${state.catType} - ${state.catState})`;
  }

  // 猫の座標をUI（CSS位置）に反映
  if (catElement) {
    catElement.style.left = `${state.catX}%`;
    catElement.style.bottom = `${state.catY}%`;
    
    // 猫の移動速度ペースクラスの適用
    catElement.classList.remove('pace-fast', 'pace-normal', 'pace-slow');
    catElement.classList.add(`pace-${state.catSpeedPace}`);

    // 顔の向きクラスの適用
    catElement.classList.remove('facing-left', 'facing-right');
    catElement.classList.add(`facing-${state.facingDirection}`);
  }

  // 設定フォームの同期
  settingsCatNameInput.value = state.name;

  // 猫タイプセレクターのactive切り替え
  document.querySelectorAll('.cat-type-selector').forEach(selector => {
    selector.querySelectorAll('.cat-type-btn').forEach(btn => {
      if (btn.dataset.catType === state.catType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  });

  // 猫動きセレクターのactive切り替え
  document.querySelectorAll('.cat-speed-selector').forEach(selector => {
    selector.querySelectorAll('.cat-speed-btn').forEach(btn => {
      if (btn.dataset.catSpeed === state.catSpeedPace) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  });
}

// -----------------------------------------
// 初回起動処理
// -----------------------------------------
function checkFirstRun() {
  if (!state.isInitialized) {
    setupModal.classList.remove('hidden');
  } else {
    updateUI();
    showDailyMessage();
  }
}

function showDailyMessage() {
  const type = state.catType || 'normal';
  const messages = catDailyMessages[type] || catDailyMessages['normal'];
  const randomIndex = Math.floor(Math.random() * messages.length);
  dailyMessageText.textContent = messages[randomIndex].replace('あなた', state.name + 'の友達');
  dailyMessageContainer.classList.remove('hidden');
}

// -----------------------------------------
// 猫の自律行動制御 (ゲームループ)
// -----------------------------------------
let lastTime = 0;
let behaviorTimer = 0;
let bubbleTimer = 0;

function setCatState(newState) {
  // 古いクラスを削除
  catElement.classList.remove('walk', 'sit', 'sleep', 'stretch', 'yawn');
  
  state.catState = newState;
  catElement.classList.add(newState);

  // UIを更新して画像を切り替え
  updateUI();
}

// 行動のランダム決定
function decideNextBehavior() {
  let nextBehavior = state.catState;
  while (nextBehavior === state.catState) {
    const rand = Math.random();
    if (rand < 0.35) {
      nextBehavior = 'walk';
    } else if (rand < 0.6) {
      nextBehavior = 'sit';
    } else if (rand < 0.75) {
      nextBehavior = 'yawn';
    } else if (rand < 0.9) {
      nextBehavior = 'sleep';
    } else {
      nextBehavior = 'stretch';
    }
  }

  // 歩く（walk）状態に切り替わるときのみ、新しい自然な座標をランダム選択する
  if (nextBehavior === 'walk') {
    selectRandomPosition(false);
  }

  setCatState(nextBehavior);
  
  // 次の行動までの時間をセット
  if (nextBehavior === 'stretch' || nextBehavior === 'yawn') {
    behaviorTimer = 3000; // アニメーションの長さに合わせる
  } else {
    behaviorTimer = getBehaviorInterval(state.catSpeedPace);
  }
}

// アニメーションループ
function updateCat(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  // 自律行動切り替えのカウントダウン
  if (state.isInitialized) {
    behaviorTimer -= delta;
    if (behaviorTimer <= 0) {
      decideNextBehavior();
    }
  }

  // 歩行状態のときの移動処理
  if (state.catState === 'walk') {
    // CSS transition (left, bottom) によって自動かつスムーズに移動するため、JSでの毎フレーム更新は不要です。
  }

  requestAnimationFrame(updateCat);
}

// -----------------------------------------
// タップアクション（なでる）
// -----------------------------------------
let isBubbleActive = false;

function strokeCat() {
  // ジャンプエフェクト
  catElement.classList.remove('jump');
  // リフローを起こしてアニメーションを再トリガー
  void catElement.offsetWidth;
  catElement.classList.add('jump');

  // 吹き出し表示
  const type = state.catType || 'normal';
  const reactions = catReactions[type] || catReactions['normal'];
  const randReact = reactions[Math.floor(Math.random() * reactions.length)];
  bubbleText.textContent = randReact;
  catBubble.classList.remove('hidden');
  
  if (isBubbleActive) {
    clearTimeout(bubbleTimer);
  }
  isBubbleActive = true;

  bubbleTimer = setTimeout(() => {
    catBubble.classList.add('hidden');
    isBubbleActive = false;
  }, 2000);

  // なでられたら座る（寝ている場合はたまに起きる）
  if (state.catState === 'sleep' && Math.random() < 0.5) {
    setCatState('sit');
    behaviorTimer = 4000;
  } else if (state.catState === 'walk') {
    setCatState('sit');
    behaviorTimer = 4000;
  }
}

// -----------------------------------------
// イベントリスナーのセットアップ
// -----------------------------------------
function setupEventListeners() {
  // 初回起動モーダル内の猫の種類選択
  document.querySelectorAll('#setup-modal .cat-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#setup-modal .cat-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.catType = btn.dataset.catType;
    });
  });

  // 初回起動モーダル内の猫の動き選択
  document.querySelectorAll('#setup-modal .cat-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#setup-modal .cat-speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.catSpeedPace = btn.dataset.catSpeed;
      updateUI();
    });
  });

  // 初回起動スタートボタン
  btnSetupStart.addEventListener('click', () => {
    const enteredName = setupCatNameInput.value.trim();
    state.name = enteredName || 'たま';
    state.isInitialized = true;

    // 即座に動作間隔タイマーを新しいペースに対応させる
    behaviorTimer = getBehaviorInterval(state.catSpeedPace);

    saveSettings();
    updateUI();
    
    setupModal.classList.add('hidden');
    showDailyMessage();
    decideNextBehavior();
  });

  // 設定ボタンクリック
  btnSettings.addEventListener('click', () => {
    updateUI();
    settingsModal.classList.remove('hidden');
  });

  // 設定モーダル内の猫の種類選択
  document.querySelectorAll('#settings-modal .cat-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#settings-modal .cat-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.catType = btn.dataset.catType;
      updateUI();
    });
  });

  // 設定モーダル内の猫の動き選択
  document.querySelectorAll('#settings-modal .cat-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#settings-modal .cat-speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.catSpeedPace = btn.dataset.catSpeed;
      updateUI();
    });
  });

  // 設定保存ボタン
  btnSettingsSave.addEventListener('click', () => {
    const enteredName = settingsCatNameInput.value.trim();
    state.name = enteredName || state.name;

    // 即座に動作間隔タイマーを新しいペースに対応させる
    if (state.catState !== 'stretch' && state.catState !== 'yawn') {
      behaviorTimer = getBehaviorInterval(state.catSpeedPace);
    }

    saveSettings();
    updateUI();
    showDailyMessage();
    settingsModal.classList.add('hidden');
  });

  // 設定閉じるボタン
  const closeModal = () => {
    // 変更を保存せずに閉じるので、設定を再読み込みしてUIを同期
    loadSettings();
    updateUI();
    settingsModal.classList.add('hidden');
  };
  btnSettingsClose.addEventListener('click', closeModal);
  
  // なでなでアクション
  catElement.addEventListener('click', (e) => {
    e.stopPropagation();
    strokeCat();
  });

  // 今日の一言を閉じる
  btnCloseMessage.addEventListener('click', () => {
    dailyMessageContainer.classList.add('hidden');
  });
}

// -----------------------------------------
// 時刻判定による背景の自動切り替え
// -----------------------------------------
function updateBackgroundByTime() {
  const now = new Date();
  const hours = now.getHours();
  let newBg = 'day';

  if (hours >= 5 && hours < 11) {
    newBg = 'morning';
  } else if (hours >= 11 && hours < 18) {
    newBg = 'day';
  } else {
    newBg = 'night';
  }

  if (state.bg !== newBg) {
    state.bg = newBg;
    selectRandomPosition(true); // 背景切り替え時に新しい位置をランダム選択
    updateUI();
  }
}

// -----------------------------------------
// 初期化
// -----------------------------------------
function init() {
  loadSettings();
  updateBackgroundByTime(); // 起動時に現在時刻で背景を判定
  selectRandomPosition(true);   // 起動時の初期位置を決定
  setupEventListeners();
  checkFirstRun();
  
  // 定期タイマー（1分間隔）で背景を自動更新
  setInterval(updateBackgroundByTime, 60000);
  
  // 猫のアニメーションループ開始
  requestAnimationFrame(updateCat);
}

// 起動
init();
