const captchaBtn = document.getElementById('captcha-btn');
const overlay = document.getElementById('captcha-overlay');
const spinner = document.getElementById('spinner');
const video = document.getElementById('ricky');

captchaBtn.addEventListener('click', function() {
spinner.style.display = 'block';

setTimeout(() => {
video.play();

overlay.style.opacity = '0';
overlay.style.visibility = 'hidden';
}, 300);});
// I am so evil