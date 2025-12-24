// (function() {
// // Жёсткая очистка всех favicon-тегов
//     const removeAllIcons = () => {
//     document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"], meta[name*="icon"]').forEach(el => el.remove());
    
//     // Особые случаи для разных браузеров
//     const blankIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"></svg>';
//     document.head.insertAdjacentHTML('beforeend', `
//         <link rel="icon" href="${blankIcon}" type="image/svg+xml">
//         <link rel="shortcut icon" href="${blankIcon}">
//     `);
//     };
    
//     // 2. Динамическая вставка новых иконок из Telegram
//     const updateIcons = () => {
//     removeAllIcons();
//     const timestamp = Date.now();
//     const username = 'onikeloyan';
    
//     const avatarUrl = `https://t.me/i/userpic/320/${username}.jpg?force_cache=${timestamp}`;

//     const icon = document.createElement('link');
//     icon.rel = 'icon';
//     icon.href = avatarUrl;
//     document.head.appendChild(icon);

    
//     // 3. Принудительный ререндер в особых случаях
//     setTimeout(() => {
//         const temp = document.createElement('div');
//         temp.innerHTML = '<!-- forced rerender -->';
//         document.head.appendChild(temp);
//         temp.remove();
//     }, 100);
//     };
    
//     // Первичная загрузка + обновление каждые 6 часов
//     document.addEventListener('DOMContentLoaded', updateIcons);
//     setInterval(updateIcons, 2 * 60 * 60 * 1000);
// })();

(function() {
    // Конфигурация
    const CONFIG = {
        sourceImage: 'home/media/main_photo.jpg', // Путь к исходному изображению
        faviconSizes: [16, 32, 64, 128, 256], // Размеры favicon
        appleTouchSize: 180 // Размер для Apple Touch
    };
    
    // Создание favicon заданного размера
    const createFavicon = (imageUrl, size) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    canvas.width = size;
                    canvas.height = size;
                    
                    // Включаем сглаживание для лучшего качества
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Очищаем и рисуем
                    ctx.clearRect(0, 0, size, size);
                    ctx.drawImage(img, 0, 0, size, size);
                    
                    resolve({
                        size: size,
                        dataUrl: canvas.toDataURL('image/png')
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = reject;
            img.src = imageUrl;
        });
    };
    
    // Создание .ico файла (мультиразмерный)
    const createIcoFile = async (favicons) => {
        // Для простоты возвращаем самую большую favicon
        // В реальном проекте можно использовать библиотеку для создания .ico
        return favicons.sort((a, b) => b.size - a.size)[0].dataUrl;
    };
    
    // Установка favicon в документ
    const setFavicons = (favicons) => {
        // Удаляем старые иконки
        document.querySelectorAll('link[rel*="icon"], link[rel*="apple-touch-icon"]').forEach(el => el.remove());
        
        // Добавляем favicon разных размеров
        favicons.forEach(({ size, dataUrl }) => {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = dataUrl;
            link.sizes = `${size}x${size}`;
            link.type = 'image/png';
            document.head.appendChild(link);
        });
        
        // Добавляем favicon для Apple
        const appleIcon = favicons.find(f => f.size === CONFIG.appleTouchSize) || 
                          favicons.sort((a, b) => Math.abs(a.size - CONFIG.appleTouchSize) - 
                                                   Math.abs(b.size - CONFIG.appleTouchSize))[0];
        
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = appleIcon.dataUrl;
        appleLink.sizes = `${appleIcon.size}x${appleIcon.size}`;
        document.head.appendChild(appleLink);
    };
    
    // Основная функция
    const generateAndSetFavicons = async () => {
        try {
            console.log('Создание favicon из изображения...');
            
            // Создаем favicon всех размеров
            const faviconPromises = CONFIG.faviconSizes.map(size => 
                createFavicon(CONFIG.sourceImage, size)
            );
            
            const favicons = await Promise.all(faviconPromises);
            
            // Устанавливаем favicon
            setFavicons(favicons);
            
            console.log('Favicon успешно созданы:', favicons.map(f => `${f.size}x${f.size}`).join(', '));
            
        } catch (error) {
            console.error('Ошибка создания favicon:', error);
            
            // Fallback на стандартные иконки
            const fallbackLink = document.createElement('link');
            fallbackLink.rel = 'icon';
            fallbackLink.href = 'home/media/main_photo.jpg';
            document.head.appendChild(fallbackLink);
        }
    };
    
    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generateAndSetFavicons);
    } else {
        generateAndSetFavicons();
    }
})();