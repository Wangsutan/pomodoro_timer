const { invoke } = window.__TAURI__.core;

// 请求通知权限，结果有两种：granted（允许）和denied（拒绝）
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    console.log('Notification permission granted');
  } else {
    console.log('Notification permission denied');
  }
});

// 定义发送通知的函数，分为有权限和无权限两种情况
function sendNotification(title, options) {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else {
    console.log('Notification permission not granted');
  }
}

let defaultMinutes = 25;  // 番茄时钟默认时间为25分钟
let seconds = defaultMinutes * 60;

// 关于运行状态的变量
let timer_interval = null;

// 更新倒计时时间的函数，更改网页上时间显示元素的内容
function updateTimerDisplay(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  document.getElementById('timer-display').textContent = `${minutes}:${remainingSeconds}`;
}

// 设置倒计时的辅助函数
function set_timer(minutes) {
  seconds = minutes * 60;
  updateTimerDisplay(seconds);
  updateProgressBar(seconds, seconds);
  clearInterval(timer_interval);
  timer_interval = null;
  const startButton = document.getElementById('start-btn');
  startButton.disabled = false;
}

function start_timer() {
  // 如果倒计时正在运行，则该函数什么也不做
  if (timer_interval) {
    return;
  }

  // 如果倒计时尚未运行，就开始正式处理
  const startButton = document.getElementById('start-btn');
  startButton.disabled = true;

  totalSeconds = seconds;
  timer_interval = setInterval(() => {
    seconds--;
    updateTimerDisplay(seconds);
    updateProgressBar(seconds, totalSeconds);
    // 如果倒计时完成
    if (seconds <= 0) {
      // 停止倒计时，提醒用户
      clearInterval(timer_interval);
      sendNotification('Timer Ended', { body: 'Your Pomodoro session has finished!' });
      playNotificationSound('alarm_tone.mp3');
      // 重置倒计时
      reset_timer();
    }
  }, 1000);
}

// 播放音乐，提醒用户
function playNotificationSound(music) {
  var audio = new Audio(music);
  audio.play();
}

// 重置倒计时为默认状态
function reset_timer() {
  set_timer(defaultMinutes)
}

// 更新进度条，改变其颜色
function updateProgressBar(seconds, totalSeconds) {
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = (seconds / totalSeconds) * 100;
  progressBar.style.width = `${progressPercent}%`;

  // 根据进度条百分比设置颜色
  if (progressPercent > 60) {
    progressBar.style.backgroundColor = 'green';
  } else if (progressPercent > 30) {
    progressBar.style.backgroundColor = 'yellow';
  } else {
    progressBar.style.backgroundColor = 'red';
  }
}

// 设定自定义的时间
function set_custom_timer() {
  const minutes = document.getElementById('timer-input').value;
  const minutesNumber = Number(minutes);
  if (Number.isInteger(minutesNumber) && minutesNumber > 0) {
    set_timer(minutes)
  } else {
    console.log('Please enter a valid number of minutes.');
  }
}

// 更新日期时间
function updateDateTimeDisplay() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  document.getElementById('date-display').textContent = now.toLocaleString(undefined, options);
}

// 切换既定的窗口尺寸
const size1 = { width: 300, height: 500 };
const size2 = { width: 300, height: 170 };
let currentSize = size2;

// 具体的切换窗口尺寸的函数，调用了Rust的API
async function toggleWindowSize() {
  await invoke('resize_window', currentSize);
  currentSize = currentSize === size1 ? size2 : size1;
}

document.getElementById('start-btn').addEventListener('click', start_timer);
document.getElementById('reset-btn').addEventListener('click', reset_timer);
document.getElementById('set-btn').addEventListener('click', set_custom_timer);
document.getElementById('toggle-size-btn').addEventListener('click', toggleWindowSize);
document.addEventListener('DOMContentLoaded', function () {
  updateProgressBar(seconds, seconds);
});

setInterval(updateDateTimeDisplay, 1000);
