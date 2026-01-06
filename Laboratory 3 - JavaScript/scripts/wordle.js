const words = ["table", "chair", "piano", "mouse", "house", "plant", "brain", "cloud", "beach", "fruit"];
let word = "";
let tries = 0;
let gameOver = false;
let stats = {
    played: 0,
    wins: 0,
    streak: 0
};

window.onload = function () {
    const board = document.getElementById('board');
    const guessButton = document.getElementById('guessButton');
    const guessInput = document.getElementById('guessInput');
    const newGameButton = document.getElementById('newGameButton');
    const messageEl = document.getElementById('message');

    function initGame() {
        board.innerHTML = '';
        word = words[Math.floor(Math.random() * words.length)];
        tries = 0;
        gameOver = false;
        guessInput.value = '';
        guessInput.disabled = false;
        guessButton.style.display = 'inline-block';
        newGameButton.style.display = 'none';
        messageEl.textContent = '';
        
        for (let i = 0; i < 6; i++) {
            let row = document.createElement('div');
            row.classList.add('row');
            board.append(row);
            for (let j = 0; j < 5; j++) {
                let cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-column', j);
                row.append(cell);
            }
        }
    }

    function updateStats(won) {
        stats.played++;
        if (won) {
            stats.wins++;
            stats.streak++;
        } else {
            stats.streak = 0;
        }
        document.getElementById('games-played').textContent = stats.played;
        document.getElementById('win-percent').textContent = Math.round((stats.wins / stats.played) * 100);
        document.getElementById('current-streak').textContent = stats.streak;
    }

    function handleGuess() {
        if (gameOver) return;
        
        let guess = guessInput.value.toLowerCase();
        if (guess.length !== 5) {
            messageEl.textContent = "Word must be 5 letters!";
            return;
        }
        messageEl.textContent = "";

        let wordArr = word.split('');
        let guessArr = guess.split('');
        let results = new Array(5).fill('red');
        let wordMask = new Array(5).fill(false);
        let guessMask = new Array(5).fill(false);

        for (let i = 0; i < 5; i++) {
            if (guessArr[i] === wordArr[i]) {
                results[i] = 'green';
                wordMask[i] = true;
                guessMask[i] = true;
            }
        }

        for (let i = 0; i < 5; i++) {
            if (guessMask[i]) continue;
            for (let j = 0; j < 5; j++) {
                if (!wordMask[j] && guessArr[i] === wordArr[j]) {
                    results[i] = 'yellow';
                    wordMask[j] = true;
                    break;
                }
            }
        }

        for (let i = 0; i < 5; i++) {
            let cell = document.querySelector(`[data-row="${tries}"][data-column="${i}"]`);
            cell.textContent = guess[i];
            setTimeout(() => {
                cell.classList.add('flip');
                cell.classList.add(results[i]);
            }, i * 100);
        }

        if (guess === word) {
            gameOver = true;
            messageEl.textContent = "You won! 🎉";
            updateStats(true);
            endGame();
        } else if (tries === 5) {
            gameOver = true;
            messageEl.textContent = `Game Over. Word was: ${word.toUpperCase()}`;
            updateStats(false);
            endGame();
        }
        tries++;
        guessInput.value = '';
    }

    function endGame() {
        guessInput.disabled = true;
        guessButton.style.display = 'none';
        newGameButton.style.display = 'inline-block';
    }

    guessButton.addEventListener('click', handleGuess);
    newGameButton.addEventListener('click', initGame);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGuess();
    });

    initGame();
}