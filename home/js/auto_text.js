const rawText = "Сияй, чёрт возьми";
const speed = 40;
let i = 0;

function typeText() {
  const el = document.getElementById("auto_text");
  el.textContent = rawText.slice(0, i);
  i++;
  if (i <= rawText.length) {
    setTimeout(typeText, speed);
  }
}

window.onload = function() {
  setTimeout(typeText, 3000); // Запуск через 3 секунды
};