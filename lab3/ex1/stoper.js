const display = document.getElementById('timer');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const resetBtn = document.getElementById('reset');

let seconds = 0;
let timerFuncHolder = null;

function formatTime(seconds){
    let mins = Math.floor(seconds/60);
    let secs = seconds % 60;
    if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}min ${secs}s`;
}

startBtn.addEventListener('click', () => {
    if(timerFuncHolder !== null) return;

    timerFuncHolder = setInterval(() => {
        seconds++;
        display.textContent = formatTime(seconds);
    },1000);
});

stopBtn.addEventListener('click', ()=>{
    clearInterval(timerFuncHolder);
    timerFuncHolder = null;
})

resetBtn.addEventListener('click', ()=>{
    clearInterval(timerFuncHolder);
    timerFuncHolder = null;
    seconds = 0;
    display.textContent = formatTime(seconds);
})
