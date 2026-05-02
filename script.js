// --- STATE ---
const state = {
    grid: [],
    score: 0,
    bestClassic: parseInt(localStorage.getItem('bestClassic')) || 0,
    bestBlitz: parseInt(localStorage.getItem('bestBlitz')) || 0,
    mode: 'classic', 
    blitzInterval: 3, // actual seconds
    blitzRemaining: 0, // ms
    timerId: null,
    lastTime: null,
    isGameOver: false,
    theme: localStorage.getItem('theme') || 'light',
    bgm: localStorage.getItem('bgm') !== 'false',
    sfx: localStorage.getItem('sfx') !== 'false',
    leaderboard: JSON.parse(localStorage.getItem('leaderboard')) || { classic: [], blitz: [] }
};

const BLITZ_INTERVALS = [2, 3, 5, 10];

// --- DOM ELEMENTS ---
const screens = {
    home: document.getElementById('home-screen'),
    blitzConfig: document.getElementById('blitz-config-screen'),
    game: document.getElementById('game-screen'),
    leaderboard: document.getElementById('leaderboard-screen'),
    settings: document.getElementById('settings-screen')
};

const dom = {
    tileContainer: document.getElementById('tile-container'),
    score: document.getElementById('current-score'),
    best: document.getElementById('best-score'),
    gameMessage: document.getElementById('game-message'),
    messageText: document.getElementById('game-message-text'),
    finalScore: document.getElementById('final-score-display'),
    playerInput: document.getElementById('player-name'),
    timerContainer: document.getElementById('blitz-timer-container'),
    timerBar: document.getElementById('blitz-timer-bar'),
    intervalSlider: document.getElementById('blitz-interval-slider'),
    intervalDisplay: document.getElementById('interval-display'),
    modeLabel: document.getElementById('game-mode-label'),
    leaderboardContent: document.getElementById('leaderboard-content'),
    leaderboardExtraCol: document.getElementById('leaderboard-extra-col'),
    bgmToggle: document.getElementById('toggle-bgm'),
    bgmSlider: document.getElementById('bgm-slider'),
    sfxToggle: document.getElementById('toggle-sfx'),
    sfxSlider: document.getElementById('sfx-slider'),
    audioBgm: document.getElementById('audio-bgm'),
    audioHit: document.getElementById('audio-hit')
};

// --- INITIALIZATION ---
function init() {
    applyTheme(state.theme);
    updateSettingsUI();
    setupEventListeners();
    syncDimensions();
    showScreen('home');
    
    // Initial audio setup
    if (state.bgm) {
        document.addEventListener('click', startBgmOnce, { once: true });
    }
}

function startBgmOnce() {
    if (state.bgm) {
        dom.audioBgm.play().catch(e => console.log("BGM Autoplay blocked"));
    }
}

// --- DIMENSIONS SYNC ---
function syncDimensions() {
    const board = document.getElementById('main-game-board');
    if (!board) return;

    requestAnimationFrame(() => {
        const width = board.offsetWidth;
        if (width === 0) return;

        const isMobile = window.innerWidth < 768;
        const spacing = isMobile ? 10 : 15;

        document.documentElement.style.setProperty('--field-width', `${width}px`);
        document.documentElement.style.setProperty('--grid-spacing', `${spacing}px`);
    });
}

// --- SCREEN NAVIGATION ---
function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.add('hidden');
        screens[key].classList.remove('flex');
    });
    
    screens[screenName].classList.remove('hidden');
    if (screenName === 'home' || screenName === 'blitzConfig' || screenName === 'settings') {
        screens[screenName].classList.add('flex');
    }

    if (screenName === 'game') {
        syncDimensions();
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('text-[#8f7a66]', 'dark:text-[#a69380]', 'border-b-2', 'border-[#8f7a66]', 'pb-1');
        link.classList.add('text-stone-500', 'dark:text-stone-400');
    });
    const activeLink = document.getElementById(`nav-${screenName}`);
    if (activeLink) {
        activeLink.classList.remove('text-stone-500', 'dark:text-stone-400');
        activeLink.classList.add('text-[#8f7a66]', 'dark:text-[#a69380]', 'border-b-2', 'border-[#8f7a66]', 'pb-1');
    }
}

function startGame(mode, interval = 3) {
    state.mode = mode;
    state.blitzInterval = interval;
    state.score = 0;
    state.isGameOver = false;
    state.grid = Array(4).fill().map(() => Array(4).fill(0));
    
    updateBestScoreDisplay();
    dom.score.innerText = state.score;
    dom.gameMessage.classList.add('hidden');
    dom.tileContainer.innerHTML = '';
    dom.modeLabel.innerText = mode === 'classic' ? 'Classic Mode' : `Blitz Mode (${interval}s)`;

    if (mode === 'blitz') {
        dom.timerContainer.classList.remove('hidden');
        resetBlitzTimer();
    } else {
        dom.timerContainer.classList.add('hidden');
        stopBlitzTimer();
    }

    addRandomTile();
    addRandomTile();
    renderBoard();
    showScreen('game');

    if (mode === 'blitz') {
        startBlitzTimer();
    }
    
    if (state.bgm && dom.audioBgm.paused) {
        dom.audioBgm.play();
    }
}

// --- CORE MECHANICS ---
function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (state.grid[r][c] === 0) emptyCells.push({r, c});
        }
    }
    if (emptyCells.length > 0) {
        const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        state.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        playSfx();
        return {r, c, val: state.grid[r][c]};
    }
    return null;
}

function playSfx() {
    if (state.sfx) {
        dom.audioHit.currentTime = 0;
        dom.audioHit.play().catch(e => {});
    }
}

function move(direction) {
    if (state.isGameOver) return;

    let moved = false;
    let scoreGained = 0;
    const prevGrid = JSON.stringify(state.grid);

    let workingGrid = rotateGrid(state.grid, direction);

    for (let r = 0; r < 4; r++) {
        let row = workingGrid[r].filter(val => val !== 0);
        for (let c = 0; c < row.length - 1; c++) {
            if (row[c] === row[c + 1]) {
                row[c] *= 2;
                scoreGained += row[c];
                row.splice(c + 1, 1);
            }
        }
        while (row.length < 4) row.push(0);
        workingGrid[r] = row;
    }

    state.grid = restoreGrid(workingGrid, direction);

    if (JSON.stringify(state.grid) !== prevGrid) {
        moved = true;
        state.score += scoreGained;
        updateScore();
        addRandomTile();
        renderBoard();

        if (checkGameOver()) {
            handleGameOver();
        }
    }
}

function rotateGrid(grid, direction) {
    if (direction === 'Left') return JSON.parse(JSON.stringify(grid));
    if (direction === 'Right') return grid.map(row => [...row].reverse());
    if (direction === 'Up') return transpose(grid);
    if (direction === 'Down') return transpose(grid).map(row => [...row].reverse());
}

function restoreGrid(grid, direction) {
    if (direction === 'Left') return grid;
    if (direction === 'Right') return grid.map(row => [...row].reverse());
    if (direction === 'Up') return transpose(grid);
    if (direction === 'Down') return transpose(grid.map(row => [...row].reverse()));
}

function transpose(grid) {
    return grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
}

function checkGameOver() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (state.grid[r][c] === 0) return false;
            if (c < 3 && state.grid[r][c] === state.grid[r][c + 1]) return false;
            if (r < 3 && state.grid[r][c] === state.grid[r + 1][c]) return false;
        }
    }
    return true;
}

function handleGameOver() {
    state.isGameOver = true;
    stopBlitzTimer();
    dom.messageText.innerText = 'Game Over!';
    dom.finalScore.innerText = state.score.toLocaleString();
    dom.gameMessage.classList.remove('hidden');

    if (state.mode === 'classic' && state.score > state.bestClassic) {
        state.bestClassic = state.score;
        localStorage.setItem('bestClassic', state.bestClassic);
    } else if (state.mode === 'blitz' && state.score > state.bestBlitz) {
        state.bestBlitz = state.score;
        localStorage.setItem('bestBlitz', state.bestBlitz);
    }
}

// --- RENDER LOGIC ---
function renderBoard() {
    dom.tileContainer.innerHTML = '';
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (state.grid[r][c] !== 0) {
                const val = state.grid[r][c];
                const tile = document.createElement('div');
                
                let textColor = 'text-white';
                let fontSize = 'text-tile-default';
                let fontFamily = 'font-tile-default';

                if (val === 2) { bgColor = 'bg-tile-base'; textColor = 'text-[#776E65]'; }
                else if (val === 4) { bgColor = 'bg-tile-4'; textColor = 'text-[#776E65]'; }
                else if (val === 8) { bgColor = 'bg-tile-8'; textColor = 'text-white'; }
                else if (val === 16) { bgColor = 'bg-tile-16'; textColor = 'text-white'; fontSize = 'text-3xl'; }
                else if (val === 32) { bgColor = 'bg-tile-32'; textColor = 'text-white'; fontSize = 'text-3xl'; }
                else if (val === 64) { bgColor = 'bg-tile-64'; textColor = 'text-white'; fontSize = 'text-3xl'; }
                else if (val >= 128 && val < 1024) { bgColor = 'bg-[#edcf72]'; textColor = 'text-white'; fontSize = 'text-2xl'; }
                else if (val >= 1024 && val < 4096) { bgColor = 'bg-tile-gold'; textColor = 'text-white'; fontSize = 'text-xl'; }
                else if (val >= 4096) { bgColor = 'bg-tile-super'; textColor = 'text-white'; fontSize = 'text-tile-super'; fontFamily = 'font-tile-super'; }

                tile.className = `tile tile-position-${r + 1}-${c + 1} tile-new`;
                tile.innerHTML = `
                    <div class="tile-inner flex items-center justify-center w-full h-full ${bgColor} ${textColor} ${fontSize} ${fontFamily} font-bold rounded-lg shadow-sm">
                        ${val}
                    </div>
                `;
                dom.tileContainer.appendChild(tile);
            }
        }
    }
}

function updateScore() {
    dom.score.innerText = state.score;
}

function updateBestScoreDisplay() {
    dom.best.innerText = state.mode === 'classic' ? state.bestClassic : state.bestBlitz;
}

// --- BLITZ MODE LOGIC ---
function startBlitzTimer() {
    state.lastTime = performance.now();
    state.timerId = requestAnimationFrame(updateBlitzTimer);
}

function stopBlitzTimer() {
    if (state.timerId) cancelAnimationFrame(state.timerId);
    state.timerId = null;
}

function resetBlitzTimer() {
    state.blitzRemaining = state.blitzInterval * 1000;
    updateBlitzBar();
}

function updateBlitzTimer(time) {
    if (state.isGameOver || state.mode !== 'blitz') return;
    
    if (document.hidden) {
        state.lastTime = time;
        state.timerId = requestAnimationFrame(updateBlitzTimer);
        return;
    }

    const deltaTime = time - state.lastTime;
    state.lastTime = time;
    state.blitzRemaining -= deltaTime;

    if (state.blitzRemaining <= 0) {
        addRandomTile();
        renderBoard();
        if (checkGameOver()) {
            handleGameOver();
            return;
        }
        resetBlitzTimer();
    } else {
        updateBlitzBar();
    }

    state.timerId = requestAnimationFrame(updateBlitzTimer);
}

function updateBlitzBar() {
    const totalMs = state.blitzInterval * 1000;
    const percentage = Math.max(0, (state.blitzRemaining / totalMs) * 100);
    dom.timerBar.style.width = `${percentage}%`;
    
    if (percentage <= 20) {
        dom.timerBar.classList.add('bg-tile-64');
        dom.timerBar.classList.remove('bg-tile-8');
    } else {
        dom.timerBar.classList.remove('bg-tile-64');
        dom.timerBar.classList.add('bg-tile-8');
    }
}

// --- LEADERBOARD & SETTINGS ---
function saveScore() {
    const nameInput = dom.playerInput.value.trim() || 'Anonymous';
    const entry = {
        name: nameInput,
        score: state.score,
        mode: state.mode,
        interval: state.mode === 'blitz' ? state.blitzInterval : null,
        timestamp: new Date().toISOString()
    };

    if (state.mode === 'classic') {
        state.leaderboard.classic.push(entry);
        state.leaderboard.classic.sort((a, b) => b.score - a.score);
        state.leaderboard.classic = state.leaderboard.classic.slice(0, 10);
    } else {
        state.leaderboard.blitz.push(entry);
        state.leaderboard.blitz.sort((a, b) => b.score - a.score);
        state.leaderboard.blitz = state.leaderboard.blitz.slice(0, 10);
    }

    localStorage.setItem('leaderboard', JSON.stringify(state.leaderboard));
    renderLeaderboard(state.mode);
    showScreen('leaderboard');
}

function renderLeaderboard(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
        btn.classList.toggle('active-tab', btn.dataset.tab === tab);
    });

    dom.leaderboardExtraCol.innerText = tab === 'classic' ? 'Date' : 'Interval';
    const data = state.leaderboard[tab] || [];

    if (data.length === 0) {
        dom.leaderboardContent.innerHTML = '<tr><td colspan="4" class="px-6 py-10 text-center text-on-surface/50">No scores yet.</td></tr>';
        return;
    }

    let html = '';
    data.forEach((entry, index) => {
        const extra = tab === 'classic' ? new Date(entry.timestamp).toLocaleDateString() : `${entry.interval}s`;
        const isGold = index === 0;
        const bgClass = isGold ? 'bg-tile-gold/10' : 'bg-surface-variant/30';
        const rankColor = isGold ? 'text-tile-gold' : 'text-on-surface';
        const textColor = isGold ? 'text-on-surface' : 'text-on-surface';

        html += `
            <tr class="${bgClass} backdrop-blur-sm rounded-lg overflow-hidden transition-all hover:translate-x-1 duration-200">
                <td class="px-6 py-4 rounded-l-lg font-bold ${rankColor}">
                    <div class="flex items-center gap-2">
                        ${isGold ? '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">workspace_premium</span>' : ''}
                        ${index + 1}
                    </div>
                </td>
                <td class="px-6 py-4 font-semibold ${textColor}">${entry.name}</td>
                <td class="px-6 py-4 ${textColor}/70 text-[14px]">${extra}</td>
                <td class="px-6 py-4 rounded-r-lg text-right font-black ${textColor}">${entry.score.toLocaleString()}</td>
            </tr>
        `;
    });
    dom.leaderboardContent.innerHTML = html;
}

function applyTheme(themeName) {
    if (themeName === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
    state.theme = themeName;
    localStorage.setItem('theme', themeName);
    updateSettingsUI();
}

function updateSettingsUI() {
    if (!dom.bgmToggle) return;
    
    dom.bgmToggle.classList.toggle('bg-tile-gold', state.bgm);
    dom.bgmToggle.classList.toggle('bg-stone-400', !state.bgm);
    dom.bgmSlider.classList.toggle('translate-x-5', state.bgm);
    dom.bgmSlider.classList.toggle('translate-x-0', !state.bgm);

    dom.sfxToggle.classList.toggle('bg-tile-8', state.sfx);
    dom.sfxToggle.classList.toggle('bg-stone-400', !state.sfx);
    dom.sfxSlider.classList.toggle('translate-x-5', state.sfx);
    dom.sfxSlider.classList.toggle('translate-x-0', !state.sfx);

    const lightBtn = document.getElementById('btn-theme-light');
    const darkBtn = document.getElementById('btn-theme-dark');
    if (lightBtn && darkBtn) {
        if (state.theme === 'light') {
            lightBtn.classList.add('ring-2', 'ring-tile-gold');
            darkBtn.classList.remove('ring-2', 'ring-tile-gold');
        } else {
            darkBtn.classList.add('ring-2', 'ring-tile-gold');
            lightBtn.classList.remove('ring-2', 'ring-tile-gold');
        }
    }
    
    // Sync audio
    if (state.bgm) {
        if (dom.audioBgm.paused) dom.audioBgm.play().catch(e => {});
    } else {
        dom.audioBgm.pause();
    }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.getElementById('logo').addEventListener('click', () => showScreen('home'));
    document.getElementById('nav-classic').addEventListener('click', () => startGame('classic'));
    document.getElementById('nav-blitz').addEventListener('click', () => showScreen('blitzConfig'));
    document.getElementById('nav-leaderboard').addEventListener('click', () => {
        renderLeaderboard('classic');
        showScreen('leaderboard');
    });
    document.getElementById('nav-settings').addEventListener('click', () => showScreen('settings'));

    document.getElementById('btn-play-classic').addEventListener('click', () => startGame('classic'));
    document.getElementById('btn-play-blitz').addEventListener('click', () => showScreen('blitzConfig'));
    document.getElementById('btn-home-leaderboard').addEventListener('click', () => {
        renderLeaderboard('classic');
        showScreen('leaderboard');
    });
    document.getElementById('btn-home-settings').addEventListener('click', () => showScreen('settings'));

    dom.intervalSlider.addEventListener('input', (e) => {
        const val = BLITZ_INTERVALS[parseInt(e.target.value)];
        dom.intervalDisplay.innerText = `${val}s`;
    });
    document.getElementById('btn-start-blitz').addEventListener('click', () => {
        const interval = BLITZ_INTERVALS[parseInt(dom.intervalSlider.value)];
        startGame('blitz', interval);
    });
    document.getElementById('btn-back-home').addEventListener('click', () => showScreen('home'));

    document.getElementById('btn-restart').addEventListener('click', () => startGame(state.mode, state.blitzInterval));
    document.getElementById('btn-save-score').addEventListener('click', saveScore);
    document.getElementById('btn-try-again').addEventListener('click', () => startGame(state.mode, state.blitzInterval));
    document.getElementById('btn-quit').addEventListener('click', () => {
        stopBlitzTimer();
        showScreen('home');
    });

    document.querySelectorAll('.btn-back-home').forEach(btn => {
        btn.addEventListener('click', () => showScreen('home'));
    });
    document.querySelectorAll('.btn-go-leaderboard').forEach(btn => {
        btn.addEventListener('click', () => {
            renderLeaderboard('classic');
            showScreen('leaderboard');
        });
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            renderLeaderboard(e.target.dataset.tab);
        });
    });

    dom.bgmToggle.addEventListener('click', () => {
        state.bgm = !state.bgm;
        localStorage.setItem('bgm', state.bgm);
        updateSettingsUI();
    });
    dom.sfxToggle.addEventListener('click', () => {
        state.sfx = !state.sfx;
        localStorage.setItem('sfx', state.sfx);
        updateSettingsUI();
    });
    document.getElementById('btn-theme-light').addEventListener('click', () => applyTheme('light'));
    document.getElementById('btn-theme-dark').addEventListener('click', () => applyTheme('dark'));

    window.addEventListener('resize', syncDimensions);

    window.addEventListener('keydown', (e) => {
        if (state.isGameOver || screens.game.classList.contains('hidden')) return;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            move(e.key.replace('Arrow', ''));
        }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    const gameBoard = document.getElementById('game-screen');
    
    gameBoard.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});

    gameBoard.addEventListener('touchend', (e) => {
        if (state.isGameOver || screens.game.classList.contains('hidden')) return;
        
        let dx = e.changedTouches[0].screenX - touchStartX;
        let dy = e.changedTouches[0].screenY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > 30) move(dx > 0 ? 'Right' : 'Left');
        } else {
            if (Math.abs(dy) > 30) move(dy > 0 ? 'Down' : 'Up');
        }
    }, {passive: true});
}

// Start
init();
