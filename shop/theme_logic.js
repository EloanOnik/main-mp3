const menuToggle = document.getElementById('menu__toggle');
const otherElement = document.getElementById('theme-toggle-container');

// Функция проверки горизонтального мобильного экрана
function isMobileLandscape() {
  return window.matchMedia('(orientation: landscape) and (max-width: 900px)').matches;
}

// Изначальная позиция
otherElement.style.transform = 'translateX(-60rem)';

menuToggle.addEventListener('change', () => {
  if (menuToggle.checked) {
    // Только для горизонтального мобильного экрана - 2.5rem, для остальных - 0
    otherElement.style.transform = isMobileLandscape() ? 'translateX(-2.5rem)' : 'translateX(0rem)';
  } else {
    otherElement.style.transform = 'translateX(-15rem)';
  }
});

// Обновляем при повороте экрана
window.addEventListener('resize', () => {
  if (menuToggle.checked) {
    otherElement.style.transform = isMobileLandscape() ? 'translateX(-2.5rem)' : 'translateX(0rem)';
  }
});