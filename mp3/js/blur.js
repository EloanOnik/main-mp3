
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация - установим фон первой песни при загрузке
    updateBackgroundWithBlur('./image/Посетитель снов.png');
    
    // Функция для обновления фона с размытием
    function updateBackgroundWithBlur(imageUrl) {
        // 1. Устанавливаем основное фоновое изображение
        document.body.style.backgroundImage = `url('${imageUrl}')`;
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.transition = 'background-image 0.8s ease-in-out';
        
        // 2. Добавляем размытый оверлей поверх фона
        let blurOverlay = document.getElementById('blur-overlay');
        
        if (!blurOverlay) {
            // Создаем оверлей, если его нет
            blurOverlay = document.createElement('div');
            blurOverlay.id = 'blur-overlay';
            blurOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                background: rgba(0, 0, 0, 0.15);
                z-index: -1;
                pointer-events: none;
            `;
            document.body.appendChild(blurOverlay);
        }
        
        // 3. Добавляем темный оверлей для контраста
        let darkOverlay = document.getElementById('dark-overlay');
        
        if (!darkOverlay) {
            darkOverlay = document.createElement('div');
            darkOverlay.id = 'dark-overlay';
            darkOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.2);
                z-index: -1;
                pointer-events: none;
            `;
            document.body.appendChild(darkOverlay);
        }
    }
    
    // 3. Делаем функцию доступной глобально, чтобы script.js мог ее вызывать
    window.updateBackgroundWithBlur = updateBackgroundWithBlur;
});