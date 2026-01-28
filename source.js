

//const aramaicWords = finalWords;
//const randomWord = aramaicWords[Math.floor(Math.random() * aramaicWords.length)];

function getDayOfYear(date = new Date()) {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day;
}

const randomWord = finalWords[getDayOfYear()%finalWords.length];

let current_row = 1
let current_letter = 1
let building_word = [];
let gameEnded = false;
let guessesString = ""

let colors = {
    'gray': 'rgb(120, 124, 126)',
    'yellow': 'rgb(201, 180, 88)',
    'green': 'rgb(106, 170, 100)'
}

function numberToWord (num) {
    switch (num) {
        case 1:
            return 'one';
        case 2:
            return 'two';
        case 3:
            return 'three';
        case 4:
            return 'four';
        case 5:
            return 'five';
        case 6:
            return 'six';
    }
}

let savedDate = readFromDevice('date');
const savedGusses = readFromDevice('guesses');
if (!savedGusses) {
    localStorage.removeItem('date');
    localStorage.removeItem('guesses');
    savedDate = null;
}

const today = new Date().toISOString().split('T')[0];
if (today !== savedDate) {
    localStorage.removeItem('date');
    localStorage.removeItem('guesses');
} else {
    guessesString += savedGusses;
    let oldGuesses = savedGusses.split(';');
    oldGuesses.pop(); // the .split adds one extra empty element in the array
    oldGuesses.forEach(element => {
        let letters = element.split(',');
        letter_number = 1
        let word = '';
        letters.forEach(letter => {
            let Char = letter.charAt(0);
            word += Char;
            let color = letter.slice(1);
            let row = numberToWord(current_row);
            let letterr = numberToWord(letter_number);
            let square = document.querySelector(`.game_row.${row} .square.${letterr}`);
            square.textContent = Char;
            drawLetter(Char, color);
            let tag = 'nothing';
            switch (color) {
                case 'yellow':
                    tag = 'near';
                    break;
                case 'green':
                    tag = 'exactly'
                    break;
            }
            square.classList.add(tag);
            letter_number++;
            if (word === randomWord) {
                endGame('win', timeout=0);
            }
        });
        current_row++;
    });
    if (current_row > 6) {
        endGame('lose', timeout=0);
    }
}

// Screen Keyboard
let chars = document.querySelectorAll('.char');
chars.forEach(element => {
    element.addEventListener('click', (event) => {
        if (gameEnded) {return;} // Make typing not avilable if the game has ended
        const key = element.textContent;

        const isHebrewLetter = /^[א-ת]$/.test(key);

        if (isHebrewLetter && current_letter <= 5) {
            let row = numberToWord(current_row);
            let letter = numberToWord(current_letter);
            let square = document.querySelector(`.game_row.${row} .square.${letter}`);
            square.textContent = key;
            building_word.push(key);
            current_letter++;
        }
    });
});

let backspaceButton = document.querySelector('.button.backspace');
backspaceButton.addEventListener('click', () => {
    if (current_letter > 1) {
        current_letter--;
    }
    let row = numberToWord(current_row);
    let letter = numberToWord(current_letter);
    let square = document.querySelector(`.game_row.${row} .square.${letter}`);
    square.textContent = '';
    building_word.pop();
});

let enterButton = document.querySelector('.button.enter');
enterButton.addEventListener('click', () => {
    if (current_letter === 6) {
        analayzeWord();
        current_row++;
        current_letter = 1;
        building_word = [];
        if (current_row > 6 && !gameEnded) {
            endGame('lose');
        }
    }
});

window.addEventListener('keydown', (event) => {
    if (gameEnded) {return;} // Make typing not avilable if the game has ended
    const key = event.key;

    const isHebrewLetter = /^[א-ת]$/.test(key);

    if (isHebrewLetter && current_letter <= 5) {
        let row = numberToWord(current_row);
        let letter = numberToWord(current_letter);
        let square = document.querySelector(`.game_row.${row} .square.${letter}`);
        square.textContent = key;
        building_word.push(key);
        current_letter++;
    } else if (key === "Backspace") {
        if (current_letter > 1) {
            current_letter--;
        }
        let row = numberToWord(current_row);
        let letter = numberToWord(current_letter);
        let square = document.querySelector(`.game_row.${row} .square.${letter}`);
        square.textContent = '';
        building_word.pop();
    } else if (key === "Enter" && current_letter === 6) {
        analayzeWord();
        current_row++;
        current_letter = 1;
        building_word = [];
        if (current_row > 6 && !gameEnded) {
            endGame('lose');
        }
    }
});

function endGame (status, timeout=1500) {
    gameEnded = true;
    const note = document.querySelector('.note');
    if (status === 'lose') {
        note.textContent = randomWord;
    } else if (status === 'win') {
        note.textContent = 'שכוייח!';
    }
    setTimeout(() => {
        note.classList.add('enter');
    }, timeout);
}

function scoreGuess(guessArray, correctArray) {
    // 2 = Green = Exactly
    // 1 = Yellow = Near
    // 0 = Gray = Nothing
    let scores = [0, 0, 0, 0, 0];
    let usedInCorrect = [false, false, false, false, false];
    let usedInGuess = [false, false, false, false, false];

    // Greens
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] === correctArray[i]) {
            scores[i] = 2;
            usedInCorrect[i] = true;
            usedInGuess[i] = true;
        }
    }

    // Yellow
    for (let i = 0; i < 5; i++) {
        if (usedInGuess[i]) continue; // Skip the greens
        for (let j = 0; j < 5; j++) {
            if (!usedInCorrect[j] && guessArray[i] === correctArray[j]) {
                scores[i] = 1;
                usedInCorrect[j] = true;
                break;
            }
        }
    }

    return scores;
}

function drawLetter (letter, color) {
    // Change the background color of a keyboard letter
    let divs = document.querySelectorAll('.char');
    // Find the letter on the keyboard
    divs.forEach(element => {
        if (element.textContent === letter) {
            if (element.style.backgroundColor !== 'rgb(201, 180, 88)' && element.style.backgroundColor !== 'rgb(106, 170, 100)') {
                element.style.backgroundColor = colors[color];
                element.style.color = 'white';
            }
        }
    });

}

function analayzeWord () {
    let word_arr = randomWord.split('');
    let scores = scoreGuess(building_word, word_arr);
    for (let i=1; i<6; i++) {
        let row = numberToWord(current_row);
        let letter = numberToWord(i);
        let square = document.querySelector(`.game_row.${row} .square.${letter}`);
        let tag = 'nothing';
        let color = 'gray';
        switch (scores[i-1]) {
            case 1:
                tag = 'near';
                color = 'yellow';
                break;
            case 2:
                tag = 'exactly';
                color = 'green';
                break;
        }
        guessesString += building_word[i-1];
        guessesString += color;
        if (i === 5) { guessesString += ';' } else { guessesString += ',' }
        saveToDevice('date', new Date().toISOString().split('T')[0]);
        saveToDevice('guesses', guessesString);
        setTimeout(() => {
            revealResult(square, tag);
            drawLetter(square.textContent, color)
        }, 200*(i-1));
    }
    if (scores.every(element => element === 2)) {
        endGame('win');
    }
}


async function revealResult(squareElement, tag) {
    // Fliping letter animation
    const hide = squareElement.animate([
        { transform: 'rotateX(0deg)' },
        { transform: 'rotateX(90deg)' }
    ], { duration: 300, fill: 'forwards', easing: 'ease-in' });

    await hide.finished;

    squareElement.classList.add(tag);

    squareElement.animate([
        { transform: 'rotateX(90deg)' },
        { transform: 'rotateX(0deg)' }
    ], { duration: 300, fill: 'forwards', easing: 'ease-out' });
}