document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loaded');
    const preloader = document.querySelector('.preloader');
    const content = document.querySelector('.content');

    // Список классов с градиентами
    const gradients = [
        'gradient-1',
        'gradient-2',
        'gradient-3',
        'gradient-4'
    ];

    // Выбираем случайный градиент
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    preloader.classList.add(randomGradient);

    // Показываем прелоадер только при первом заходе/перезагрузке
    if (performance.navigation.type === 0 || performance.navigation.type === 1) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                content.style.display = 'block';
            }, 500);
        }, 3000);
    } else {
        preloader.style.display = 'none';
        content.style.display = 'block';
    }
});

