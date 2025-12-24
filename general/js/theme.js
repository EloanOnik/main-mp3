const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Проверяем, если тема уже была сохранена в localStorage
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-theme');
}

// Обработчик клика по кнопке
toggleButton.addEventListener('click', () => {
  body.classList.toggle('dark-theme');
  
  // Сохраняем выбор темы в localStorage
  if (body.classList.contains('dark-theme')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});