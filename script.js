// generate sequencer grid -->

const sequencer = document.getElementById('sequencer');
const rows = 4;
const cols = 16;

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.addEventListener('click', () => {
            cell.classList.toggle('active');
        });
        sequencer.appendChild(cell);
    }
}

// loading audio samples -->

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {

    kick: 'sounds/kick.wav',
    snare: 'sounds/snare.wav',
    hihat: 'sounds/hihat.wav',
    clap: 'sounds/clap.wav',

};

const audioBuffers = {};

async function loadSounds() {
    for (let sound in sounds) {
        const response = await fetch(sounds[sound]);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffers[sound] = await audioContext.decodeAudioData(arrayBuffer);
    }
}

loadSounds(); 

// play the sequence using loop and 'setInterval'  -->

let isPlaying = false;
let currentStep = 0; 
let tempo = 120;
let intervalId = null;

function playSound(buffer) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
}

function playStep() {
    const cells = document.querySelectorAll(`[data-col='${currentStep}']`);
    cells.forEach(cell => {
        if (cell.classList.contains('active')) {
            const sound = Object.keys(sounds)[cell.dataset.row];
            playSound(audioBuffers[sound]);
        }
    });
    currentStep = (currentStep + 1) % cols;
}

document.getElementById('play').addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;
        currentStep = 0;
        intervalId = setInterval(playStep, (60 / tempo) * 1000);
    }
});

    // tempo control and other buttons--->

document.getElementById('tempo').addEventListener('input', (e) => {
    tempo = e.target.value;
    if (isPlaying) {
        clearInterval(intervalId);
        intervalId = setInterval(playStep, (60 / tempo) * 1000);
    }
});

document.getElementById('stop').addEventListener('click', () => {
    isPlaying = false;
    clearInterval(intervalId);
});

document.getElementById('clear').addEventListener('click', () => {
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('active'));
});