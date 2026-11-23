/**
 * 아쿠아리움 (Aquarium) 퍼즐 게임 엔진
 * HTML5 Canvas & Web Audio API 기반
 */

// ==========================================================================
// 1. Web Audio API 사운드 합성기 (효과음)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playWater() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // 청량한 물방울 소리 (Bubble Pop)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playCross() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // 가벼운 클릭 소리 (Tick)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playClear() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // 빈칸 전환 소리
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // 승리 아르페지오 (C5 - E5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.09;
      const duration = 0.35;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // 부드러운 저음 실패음
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }
}

// ==========================================================================
// 2. 컨페티 (색종이) 파티클 애니메이션
// ==========================================================================
class ConfettiAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire() {
    this.particles = [];
    const colors = ['#00b4d8', '#48cae4', '#90e0ef', '#06d6a0', '#ffd166', '#ef476f', '#ffffff'];
    const count = 120;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: this.canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 16 - 4,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        opacity: 1
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let active = false;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      if (p.y > this.canvas.height * 0.4) {
        p.opacity -= 0.008;
      }

      if (p.opacity > 0 && p.y < this.canvas.height + 50) {
        active = true;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        this.ctx.restore();
      }
    }

    if (active) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ==========================================================================
// 3. 메인 게임 컨트롤러
// ==========================================================================
class AquariumGame {
  constructor() {
    this.sound = new SoundFX();
    this.confetti = new ConfettiAnimation('confettiCanvas');

    // 상태 변수
    this.currentPuzzleIndex = 1; // 1번 퍼즐 기본 (0은 연습문제)
    this.unlockedLevel = 1;      // 기본 1단계만 해금! (요구사항 1)
    this.clearedPuzzles = new Set();
    this.userGrid = [];          // [r][c] -> 0: 빈칸, 1: 물, 2: X
    this.undoStack = [];
    this.inputMode = 'water';    // 'water' or 'cross'
    this.isDragging = false;
    this.dragTargetValue = null;
    this.bgmPlaying = false;

    this.initDOM();
    this.initBGM();
    this.initBubbles();
    this.loadProgress();
    this.initEvents();
    this.renderPracticePreview();
  }

  // DOM 요소 캐싱
  initDOM() {
    this.screens = {
      start: document.getElementById('startScreen'),
      rules: document.getElementById('rulesScreen'),
      game: document.getElementById('gameScreen'),
      ending: document.getElementById('endingScreen')
    };

    this.boardGrid = document.getElementById('boardGrid');
    this.puzzleTitle = document.getElementById('puzzleTitle');
    this.puzzleProgress = document.getElementById('puzzleProgress');
    this.stageSelectModal = document.getElementById('stageSelectModal');
    this.successModal = document.getElementById('successModal');
    this.errorToast = document.getElementById('errorToast');
    this.lockToast = document.getElementById('lockToast');
    this.lockToastMsg = document.getElementById('lockToastMsg');
    this.btnSoundToggle = document.getElementById('btnSoundToggle');
    this.btnBgmToggle = document.getElementById('btnBgmToggle');
    this.bgmAudio = document.getElementById('bgmAudio');
  }

  // 배경음악(BGM) 초기화 및 무한 루프 설정
  initBGM() {
    if (!this.bgmAudio) return;
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.45; // 편안한 배경음악 음량

    // 첫 인터랙션 시 자동 재생 (브라우저 자동재생 정책 대응)
    const startAudioOnFirstClick = () => {
      this.sound.init();
      if (!this.bgmPlaying) {
        this.playBGM();
      }
      window.removeEventListener('click', startAudioOnFirstClick);
      window.removeEventListener('keydown', startAudioOnFirstClick);
      window.removeEventListener('touchstart', startAudioOnFirstClick);
    };

    window.addEventListener('click', startAudioOnFirstClick);
    window.addEventListener('keydown', startAudioOnFirstClick);
    window.addEventListener('touchstart', startAudioOnFirstClick);
  }

  playBGM() {
    if (!this.bgmAudio) return;
    this.bgmAudio.play().then(() => {
      this.bgmPlaying = true;
      if (this.btnBgmToggle) this.btnBgmToggle.textContent = '🎵';
    }).catch(() => {
      // 재생 차단 시 무시
    });
  }

  pauseBGM() {
    if (!this.bgmAudio) return;
    this.bgmAudio.pause();
    this.bgmPlaying = false;
    if (this.btnBgmToggle) this.btnBgmToggle.textContent = '🔇';
  }

  toggleBGM() {
    if (this.bgmPlaying) {
      this.pauseBGM();
    } else {
      this.playBGM();
    }
  }

  // 배경 부유 물방울 생성
  initBubbles() {
    const container = document.getElementById('bubblesContainer');
    const bubbleCount = 20;

    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.random() * 22 + 8;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDuration = `${Math.random() * 10 + 8}s`;
      bubble.style.animationDelay = `${Math.random() * 8}s`;
      container.appendChild(bubble);
    }
  }

  // 화면 전환
  showScreen(screenName) {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    if (this.screens[screenName]) {
      this.screens[screenName].classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 이벤트 리스너 등록
  // ==========================================================================
  initEvents() {
    // 1. 시작 화면 버튼들
    document.getElementById('btnStartGame').addEventListener('click', () => {
      this.playBGM();
      this.showScreen('rules'); // 게임 시작 시 규칙 화면 먼저 안내
    });

    document.getElementById('btnShowRulesFromStart').addEventListener('click', () => {
      this.playBGM();
      this.showScreen('rules');
    });

    document.getElementById('btnOpenStageSelectStart').addEventListener('click', () => {
      this.playBGM();
      this.openStageSelectModal();
    });

    // 2. 규칙 화면 버튼들
    document.getElementById('btnCloseRules').addEventListener('click', () => {
      this.showScreen('start');
    });

    document.getElementById('btnPlayPractice').addEventListener('click', () => {
      this.loadPuzzle(0); // 연습문제
      this.showScreen('game');
    });

    document.getElementById('btnGoToGame').addEventListener('click', () => {
      // 사용자가 현재 도달한 단계(최대 unlockedLevel)로 진입
      this.loadPuzzle(this.unlockedLevel || 1);
      this.showScreen('game');
    });

    // 3. 게임 화면 헤더 버튼들
    document.getElementById('btnHome').addEventListener('click', () => {
      this.showScreen('start');
    });

    document.getElementById('btnOpenRulesInGame').addEventListener('click', () => {
      this.showScreen('rules');
    });

    document.getElementById('btnOpenStageSelect').addEventListener('click', () => {
      this.openStageSelectModal();
    });

    this.btnBgmToggle.addEventListener('click', () => {
      this.toggleBGM();
    });

    this.btnSoundToggle.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.btnSoundToggle.textContent = this.sound.enabled ? '🔊' : '🔈';
    });

    document.getElementById('btnUndo').addEventListener('click', () => {
      this.undo();
    });

    document.getElementById('btnReset').addEventListener('click', () => {
      this.resetCurrentGrid();
    });

    // 4. 모드 토글 (모바일 / 터치 모드)
    const btnWater = document.getElementById('btnModeWater');
    const btnCross = document.getElementById('btnModeCross');

    btnWater.addEventListener('click', () => {
      this.inputMode = 'water';
      btnWater.classList.add('active');
      btnCross.classList.remove('active');
    });

    btnCross.addEventListener('click', () => {
      this.inputMode = 'cross';
      btnCross.classList.add('active');
      btnWater.classList.remove('active');
    });

    // 5. 하단 액션 버튼들
    document.getElementById('btnPrevPuzzle').addEventListener('click', () => {
      if (this.currentPuzzleIndex > 1) {
        this.loadPuzzle(this.currentPuzzleIndex - 1);
      } else if (this.currentPuzzleIndex === 1) {
        this.loadPuzzle(0); // 연습문제
      }
    });

    // [다음 ▶] 버튼: 다음 단계가 잠겨있으면 이동 불가! (요구사항 1)
    document.getElementById('btnNextPuzzle').addEventListener('click', () => {
      if (this.currentPuzzleIndex === 0) {
        this.loadPuzzle(1);
      } else if (this.currentPuzzleIndex < 19) {
        const nextStage = this.currentPuzzleIndex + 1;
        if (nextStage <= this.unlockedLevel) {
          this.loadPuzzle(nextStage);
        } else {
          // 아직 클리어하지 않음 -> 잠금 알림!
          this.sound.playError();
          this.showLockToast(`${this.currentPuzzleIndex}단계를 먼저 통과해야 ${nextStage}단계로 갈 수 있습니다!`);
        }
      }
    });

    document.getElementById('btnCheckAnswer').addEventListener('click', () => {
      this.checkAnswer();
    });

    // 6. 모달 이벤트
    document.getElementById('btnCloseStageModal').addEventListener('click', () => {
      this.stageSelectModal.classList.remove('active');
    });
    this.stageSelectModal.querySelector('.modal-backdrop').addEventListener('click', () => {
      this.stageSelectModal.classList.remove('active');
    });

    document.getElementById('btnStayOnPuzzle').addEventListener('click', () => {
      this.successModal.classList.remove('active');
    });

    // 정답 모달에서 [다음 단계로 이동] 클릭
    document.getElementById('btnNextPuzzleModal').addEventListener('click', () => {
      this.successModal.classList.remove('active');
      if (this.currentPuzzleIndex === 0) {
        this.loadPuzzle(1);
      } else if (this.currentPuzzleIndex < 19) {
        this.loadPuzzle(this.currentPuzzleIndex + 1);
      } else {
        // 19개 모두 완성 -> 엔딩
        this.showScreen('ending');
      }
    });

    // 7. 엔딩 화면 버튼
    document.getElementById('btnRestartFromBeginning').addEventListener('click', () => {
      this.loadPuzzle(1);
      this.showScreen('game');
    });
    document.getElementById('btnOpenStageSelectEnding').addEventListener('click', () => {
      this.openStageSelectModal();
    });

    // 8. 전역 마우스 업 (드래그 종료)
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.dragTargetValue = null;
    });

    // 9. 보드 내 우클릭 브라우저 메뉴 전역 방지 (contextmenu 방지 필수)
    this.boardGrid.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  // ==========================================================================
  // 로컬 스토리지 진행상황 저장/로드 (잠금 해제 유지)
  // ==========================================================================
  saveProgress() {
    try {
      localStorage.setItem('aquarium_unlocked_level', this.unlockedLevel.toString());
      localStorage.setItem('aquarium_cleared', JSON.stringify([...this.clearedPuzzles]));
    } catch (e) {}
  }

  loadProgress() {
    try {
      const savedUnlocked = localStorage.getItem('aquarium_unlocked_level');
      if (savedUnlocked) {
        this.unlockedLevel = Math.max(1, parseInt(savedUnlocked, 10));
      } else {
        this.unlockedLevel = 1;
      }

      const data = localStorage.getItem('aquarium_cleared');
      if (data) {
        const arr = JSON.parse(data);
        this.clearedPuzzles = new Set(arr);
      }
    } catch (e) {
      this.unlockedLevel = 1;
    }
  }

  // ==========================================================================
  // 4. 퍼즐 로드 및 보드 렌더링
  // ==========================================================================
  loadPuzzle(index) {
    if (!PUZZLES[index]) return;
    this.currentPuzzleIndex = index;
    const puzzle = PUZZLES[index];
    const N = puzzle.size;

    // 타이틀 갱신
    if (index === 0) {
      this.puzzleTitle.textContent = "연습 문제";
      this.puzzleProgress.textContent = "(튜토리얼)";
    } else {
      this.puzzleTitle.textContent = `${index}번 퍼즐`;
      this.puzzleProgress.textContent = `(${index} / 19)`;
    }

    // 그리드 초기화 (0: 빈칸, 1: 물, 2: X)
    this.userGrid = Array.from({ length: N }, () => Array(N).fill(0));
    this.undoStack = [];

    // 동적 셀 크기 계산 (반응형)
    let cellSize = 50;
    const maxBoardWidth = Math.min(window.innerWidth - 60, 680);
    const availableCellWidth = Math.floor(maxBoardWidth / (N + 1.2));
    if (N === 10) {
      cellSize = Math.min(42, Math.max(30, availableCellWidth));
    } else {
      cellSize = Math.min(54, Math.max(38, availableCellWidth));
    }
    document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);

    this.renderBoard();
    this.updateHintCounters();
    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    const btnNext = document.getElementById('btnNextPuzzle');
    const btnPrev = document.getElementById('btnPrevPuzzle');

    if (btnPrev) {
      btnPrev.disabled = (this.currentPuzzleIndex === 0);
    }

    if (btnNext) {
      if (this.currentPuzzleIndex === 19) {
        btnNext.disabled = true;
      } else if (this.currentPuzzleIndex === 0) {
        btnNext.disabled = false;
      } else {
        // 다음 단계가 아직 잠겨있으면 비활성화 스타일 또는 비활성화
        btnNext.disabled = (this.currentPuzzleIndex + 1 > this.unlockedLevel);
      }
    }
  }

  renderBoard() {
    const puzzle = PUZZLES[this.currentPuzzleIndex];
    const N = puzzle.size;
    this.boardGrid.innerHTML = '';

    // CSS Grid Template: (N+1) x (N+1)
    this.boardGrid.style.gridTemplateColumns = `var(--cell-size) repeat(${N}, var(--cell-size))`;
    this.boardGrid.style.gridTemplateRows = `var(--cell-size) repeat(${N}, var(--cell-size))`;

    // 1. (0, 0) 탑 레프트 코너 빈칸
    const cornerCell = document.createElement('div');
    cornerCell.className = 'hint-cell corner-cell';
    this.boardGrid.appendChild(cornerCell);

    // 2. (0, c) 열 힌트 숫자
    for (let c = 0; c < N; c++) {
      const colHint = document.createElement('div');
      colHint.className = 'hint-cell col-hint';
      colHint.id = `col-hint-${c}`;
      colHint.textContent = puzzle.colHints[c];
      this.boardGrid.appendChild(colHint);
    }

    // 3. 행별 렌더링
    for (let r = 0; r < N; r++) {
      // 행 힌트
      const rowHint = document.createElement('div');
      rowHint.className = 'hint-cell row-hint';
      rowHint.id = `row-hint-${r}`;
      rowHint.textContent = puzzle.rowHints[r];
      this.boardGrid.appendChild(rowHint);

      // 퍼즐 셀들
      for (let c = 0; c < N; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        // 수족관 벽 판정
        const curTank = puzzle.aquariumGrid[r][c];

        // Top Wall
        if (r === 0 || puzzle.aquariumGrid[r - 1][c] !== curTank) {
          cell.classList.add('wall-top');
        } else {
          cell.classList.add('no-wall-top');
        }

        // Bottom Wall
        if (r === N - 1 || puzzle.aquariumGrid[r + 1][c] !== curTank) {
          cell.classList.add('wall-bottom');
        } else {
          cell.classList.add('no-wall-bottom');
        }

        // Left Wall
        if (c === 0 || puzzle.aquariumGrid[r][c - 1] !== curTank) {
          cell.classList.add('wall-left');
        } else {
          cell.classList.add('no-wall-left');
        }

        // Right Wall
        if (c === N - 1 || puzzle.aquariumGrid[r][c + 1] !== curTank) {
          cell.classList.add('wall-right');
        } else {
          cell.classList.add('no-wall-right');
        }

        // 마우스 & 터치 조작 연결
        this.bindCellEvents(cell, r, c);

        this.boardGrid.appendChild(cell);
      }
    }
  }

  // ==========================================================================
  // 5. 셀 조작 및 마우스/터치 처리 (요구사항 2: 좌클릭=물, 우클릭=X)
  // ==========================================================================
  bindCellEvents(cell, r, c) {
    // 마우스 다운 이벤트
    cell.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.sound.init();

      let targetVal;
      // 요구사항 2:
      // "왼쪽버튼과 오른쪽 버튼의 기능을 바꿔주면 좋을거 같아."
      // => 왼쪽 버튼 (button === 0): 아쿠아리움을 채우는 버튼 (물 채우기 💧)
      // => 오른쪽 버튼 (button === 2): 채워지지 않는다고 X를 할 수 있는 버튼 (❌)
      if (e.button === 0) {
        // [마우스 왼쪽 클릭] -> 물(1) 채우기 / 빈칸(0) 토글
        targetVal = (this.userGrid[r][c] === 1) ? 0 : 1;
      } else if (e.button === 2) {
        // [마우스 오른쪽 클릭] -> X(2) 표시 / 빈칸(0) 토글
        targetVal = (this.userGrid[r][c] === 2) ? 0 : 2;
      } else {
        return;
      }

      this.isDragging = true;
      this.dragTargetValue = targetVal;
      this.applyCellValue(r, c, targetVal);
    });

    // 드래그 연속 그리기 (마우스 엔터)
    cell.addEventListener('mouseenter', () => {
      if (this.isDragging && this.dragTargetValue !== null) {
        this.applyCellValue(r, c, this.dragTargetValue);
      }
    });

    // 모바일 터치 이벤트
    cell.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.sound.init();
      // 터치 모드: 상단 토글 상태에 따라 물 또는 X
      const targetVal = (this.inputMode === 'water')
        ? (this.userGrid[r][c] === 1 ? 0 : 1)
        : (this.userGrid[r][c] === 2 ? 0 : 2);

      this.isDragging = true;
      this.dragTargetValue = targetVal;
      this.applyCellValue(r, c, targetVal);
    }, { passive: false });

    cell.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const targetElem = document.elementFromPoint(touch.clientX, touch.clientY);
      if (targetElem && targetElem.classList.contains('cell')) {
        const tr = parseInt(targetElem.dataset.r, 10);
        const tc = parseInt(targetElem.dataset.c, 10);
        if (!isNaN(tr) && !isNaN(tc)) {
          this.applyCellValue(tr, tc, this.dragTargetValue);
        }
      }
    }, { passive: false });
  }

  applyCellValue(r, c, value) {
    if (this.userGrid[r][c] === value) return; // 동일 상태면 패스

    // Undo 스택에 이전 상태 저장
    this.undoStack.push({
      r, c,
      prevVal: this.userGrid[r][c]
    });

    this.userGrid[r][c] = value;
    this.updateCellDOM(r, c, value);

    // 효과음 재생
    if (value === 1) this.sound.playWater();
    else if (value === 2) this.sound.playCross();
    else this.sound.playClear();

    this.updateHintCounters();
  }

  updateCellDOM(r, c, value) {
    const cell = this.boardGrid.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if (!cell) return;

    cell.classList.remove('water', 'cross');
    if (value === 1) cell.classList.add('water');
    else if (value === 2) cell.classList.add('cross');
  }

  // 힌트 카운터 실시간 시각적 피드백
  updateHintCounters() {
    const puzzle = PUZZLES[this.currentPuzzleIndex];
    const N = puzzle.size;

    // 1. 열(Col) 물 개수 체크
    for (let c = 0; c < N; c++) {
      let count = 0;
      for (let r = 0; r < N; r++) {
        if (this.userGrid[r][c] === 1) count++;
      }
      const colHintElem = document.getElementById(`col-hint-${c}`);
      if (colHintElem) {
        colHintElem.classList.remove('fulfilled', 'exceeded');
        if (count === puzzle.colHints[c]) {
          colHintElem.classList.add('fulfilled');
        } else if (count > puzzle.colHints[c]) {
          colHintElem.classList.add('exceeded');
        }
      }
    }

    // 2. 행(Row) 물 개수 체크
    for (let r = 0; r < N; r++) {
      let count = 0;
      for (let c = 0; c < N; c++) {
        if (this.userGrid[r][c] === 1) count++;
      }
      const rowHintElem = document.getElementById(`row-hint-${r}`);
      if (rowHintElem) {
        rowHintElem.classList.remove('fulfilled', 'exceeded');
        if (count === puzzle.rowHints[r]) {
          rowHintElem.classList.add('fulfilled');
        } else if (count > puzzle.rowHints[r]) {
          rowHintElem.classList.add('exceeded');
        }
      }
    }
  }

  // 되돌리기 (Undo)
  undo() {
    if (this.undoStack.length === 0) return;
    const action = this.undoStack.pop();
    this.userGrid[action.r][action.c] = action.prevVal;
    this.updateCellDOM(action.r, action.c, action.prevVal);
    this.updateHintCounters();
    this.sound.playClear();
  }

  // 현재 퍼즐 초기화
  resetCurrentGrid() {
    const puzzle = PUZZLES[this.currentPuzzleIndex];
    const N = puzzle.size;
    this.userGrid = Array.from({ length: N }, () => Array(N).fill(0));
    this.undoStack = [];

    const cells = this.boardGrid.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('water', 'cross'));

    this.updateHintCounters();
    this.sound.playClear();
  }

  // ==========================================================================
  // 6. 정답 확인 및 단계 해금 (요구사항 1)
  // ==========================================================================
  checkAnswer() {
    const puzzle = PUZZLES[this.currentPuzzleIndex];
    const N = puzzle.size;

    // 판정 기준: 물(1)의 위치가 solution과 정확히 일치하는지 (X는 무시)
    let isCorrect = true;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const userWater = (this.userGrid[r][c] === 1);
        const correctWater = (puzzle.solution[r][c] === 1);
        if (userWater !== correctWater) {
          isCorrect = false;
          break;
        }
      }
      if (!isCorrect) break;
    }

    if (isCorrect) {
      // 정답!
      this.sound.playSuccess();
      this.confetti.fire();
      this.clearedPuzzles.add(this.currentPuzzleIndex);

      // 요구사항 1: 통과 시 다음 단계 해금!
      if (this.currentPuzzleIndex > 0) {
        this.unlockedLevel = Math.max(this.unlockedLevel, this.currentPuzzleIndex + 1);
      }
      this.saveProgress();
      this.updateNavigationButtons();

      const successMsg = document.getElementById('successMessage');
      if (this.currentPuzzleIndex === 0) {
        successMsg.textContent = "연습 문제를 성공적으로 풀었습니다! 이제 1단계에 도전해보세요!";
      } else if (this.currentPuzzleIndex === 19) {
        successMsg.textContent = "마지막 19단계 마스터 퍼즐까지 모두 풀었습니다! 대단합니다!";
      } else {
        successMsg.textContent = `${this.currentPuzzleIndex}단계를 완벽하게 통과했습니다! ${this.currentPuzzleIndex + 1}단계가 열렸습니다.`;
      }

      this.successModal.classList.add('active');
    } else {
      // 오답!
      // 답은 공개하지 않고, 상태를 유지하며 다시 시도
      this.sound.playError();
      this.showErrorToast();

      const wrapper = document.querySelector('.puzzle-wrapper');
      wrapper.classList.remove('shake');
      void wrapper.offsetWidth;
      wrapper.classList.add('shake');
    }
  }

  // 오답 알림 토스트
  showErrorToast() {
    this.errorToast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.errorToast.classList.remove('show');
    }, 3200);
  }

  // 잠금 알림 토스트 (요구사항 1)
  showLockToast(msg) {
    if (this.lockToastMsg && msg) {
      this.lockToastMsg.textContent = msg;
    }
    this.lockToast.classList.add('show');
    clearTimeout(this.lockToastTimeout);
    this.lockToastTimeout = setTimeout(() => {
      this.lockToast.classList.remove('show');
    }, 3200);
  }

  // ==========================================================================
  // 7. 규칙 화면 내 연습 문제 예시 렌더링
  // ==========================================================================
  renderPracticePreview() {
    const practice = PUZZLES[0]; // 연습문제 (6x6)
    const N = practice.size;

    const probGrid = document.getElementById('practiceProblemGrid');
    const solGrid = document.getElementById('practiceSolutionGrid');
    if (!probGrid || !solGrid) return;

    probGrid.style.gridTemplateColumns = `repeat(${N}, 26px)`;
    probGrid.style.gridTemplateRows = `repeat(${N}, 26px)`;
    solGrid.style.gridTemplateColumns = `repeat(${N}, 26px)`;
    solGrid.style.gridTemplateRows = `repeat(${N}, 26px)`;

    probGrid.innerHTML = '';
    solGrid.innerHTML = '';

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const curTank = practice.aquariumGrid[r][c];

        // 문제 셀
        const pCell = document.createElement('div');
        pCell.className = 'mini-cell';
        this.applyMiniWalls(pCell, practice, r, c, curTank);
        probGrid.appendChild(pCell);

        // 정답 셀
        const sCell = document.createElement('div');
        sCell.className = 'mini-cell';
        this.applyMiniWalls(sCell, practice, r, c, curTank);
        if (practice.solution[r][c] === 1) {
          sCell.classList.add('water');
        }
        solGrid.appendChild(sCell);
      }
    }
  }

  applyMiniWalls(cell, puzzle, r, c, curTank) {
    const N = puzzle.size;
    const borderThick = '2px solid #ffffff';
    const borderThin = '1px dashed rgba(255,255,255,0.2)';

    cell.style.borderTop = (r === 0 || puzzle.aquariumGrid[r - 1][c] !== curTank) ? borderThick : borderThin;
    cell.style.borderBottom = (r === N - 1 || puzzle.aquariumGrid[r + 1][c] !== curTank) ? borderThick : borderThin;
    cell.style.borderLeft = (c === 0 || puzzle.aquariumGrid[r][c - 1] !== curTank) ? borderThick : borderThin;
    cell.style.borderRight = (c === N - 1 || puzzle.aquariumGrid[r][c + 1] !== curTank) ? borderThick : borderThin;
  }

  // ==========================================================================
  // 8. 단계 선택 모달 (요구사항 1: 통과하지 못한 단계는 잠금!)
  // ==========================================================================
  openStageSelectModal() {
    const practiceList = document.getElementById('stagePracticeList');
    const list6x6 = document.getElementById('stageList6x6');
    const list10x10 = document.getElementById('stageList10x10');

    practiceList.innerHTML = '';
    list6x6.innerHTML = '';
    list10x10.innerHTML = '';

    // 1. 연습 문제 (튜토리얼은 언제든 열려있음)
    const pBtn = document.createElement('div');
    pBtn.className = 'stage-item unlocked';
    if (this.currentPuzzleIndex === 0) pBtn.classList.add('current');
    if (this.clearedPuzzles.has(0)) pBtn.classList.add('cleared');
    pBtn.textContent = "연습 문제 (6x6 튜토리얼)";
    pBtn.addEventListener('click', () => {
      this.loadPuzzle(0);
      this.stageSelectModal.classList.remove('active');
      this.showScreen('game');
    });
    practiceList.appendChild(pBtn);

    // 2. 6x6 퍼즐 (1단계 ~ 16단계)
    for (let i = 1; i <= 16; i++) {
      const btn = document.createElement('div');
      const isUnlocked = (i <= this.unlockedLevel);

      btn.className = 'stage-item ' + (isUnlocked ? 'unlocked' : 'locked');
      if (this.currentPuzzleIndex === i) btn.classList.add('current');
      if (this.clearedPuzzles.has(i)) btn.classList.add('cleared');

      if (isUnlocked) {
        btn.textContent = `${i}`;
        btn.addEventListener('click', () => {
          this.loadPuzzle(i);
          this.stageSelectModal.classList.remove('active');
          this.showScreen('game');
        });
      } else {
        // 잠긴 단계 (요구사항 1: 단계를 푸는 사람이 선택하지 못하게 함)
        btn.innerHTML = `${i} <span class="lock-icon">🔒</span>`;
        btn.addEventListener('click', () => {
          this.sound.playError();
          this.showLockToast(`${i - 1}단계를 먼저 클리어해야 ${i}단계를 플레이할 수 있습니다!`);
        });
      }
      list6x6.appendChild(btn);
    }

    // 3. 10x10 퍼즐 (17단계 ~ 19단계)
    for (let i = 17; i <= 19; i++) {
      const btn = document.createElement('div');
      const isUnlocked = (i <= this.unlockedLevel);

      btn.className = 'stage-item ' + (isUnlocked ? 'unlocked' : 'locked');
      if (this.currentPuzzleIndex === i) btn.classList.add('current');
      if (this.clearedPuzzles.has(i)) btn.classList.add('cleared');

      if (isUnlocked) {
        btn.textContent = `${i}`;
        btn.addEventListener('click', () => {
          this.loadPuzzle(i);
          this.stageSelectModal.classList.remove('active');
          this.showScreen('game');
        });
      } else {
        btn.innerHTML = `${i} <span class="lock-icon">🔒</span>`;
        btn.addEventListener('click', () => {
          this.sound.playError();
          this.showLockToast(`${i - 1}단계를 먼저 클리어해야 ${i}단계를 플레이할 수 있습니다!`);
        });
      }
      list10x10.appendChild(btn);
    }

    this.stageSelectModal.classList.add('active');
  }
}

// DOM 준비 시 게임 인스턴스 실행
window.addEventListener('DOMContentLoaded', () => {
  window.game = new AquariumGame();
});
