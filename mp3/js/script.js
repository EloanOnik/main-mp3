class MP3Player {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.shuffleMode = false;
        this.repeatMode = false;
        this.preloadedImages = new Map(); // Кеширование загруженных изображений
        
        // Элементы DOM
        this.elements = {
            playBtn: document.getElementById('play-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            volumeSlider: document.getElementById('volume-slider'),
            progressBar: document.getElementById('progress-bar'),
            progressContainer: document.getElementById('progress-container'),
            currentTimeEl: document.getElementById('current-time'),
            durationEl: document.getElementById('duration'),
            currentSongEl: document.getElementById('current-song'),
            currentArtistEl: document.getElementById('current-artist'),
            playlistEl: document.getElementById('playlist'),
            coverImage: document.getElementById('cover-image'),
            albumCover: document.getElementById('album-cover'),
            statusMessage: document.getElementById('status-message')
        };
        
        this.init();
    }
    
    async init() {
        this.playlist = [
            {
                title: "Посетитель снов",
                artist: "whylovly",
                src: "./tracks/track1/whylovly - Посетитель снов.mp3",
                cover: "./tracks/track1/Посетитель снов.png",
                duration: "1:53"
            },
            {
                title: "Не лечи",
                artist: "Keendy",
                src: "./tracks/track2/Keendy - Не лечи.mp3",
                cover: "./tracks/track2/Не лечи.png",
                duration: "2:25"
            },
        ];
        
        // Предзагрузка всех обложек
        await this.preloadAllCovers();
        
        // Инициализация событий
        this.bindEvents();
        
        // Создание списка плейлиста
        this.renderPlaylist();
        
        // Загрузка первого трека
        this.loadTrack(0);
        
        // Установка громкости
        this.audio.volume = this.elements.volumeSlider.value;
        
        // Инициализация фона (ОДИН РАЗ при загрузке)
        this.initBackground();
    }
    
    // ОПТИМИЗАЦИЯ: Предзагрузка всех обложек
    async preloadAllCovers() {
        const preloadPromises = this.playlist.map((track, index) => {
            return new Promise((resolve) => {
                if (track.cover) {
                    const img = new Image();
                    img.onload = () => {
                        this.preloadedImages.set(track.cover, img);
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn(`Не удалось загрузить обложку: ${track.cover}`);
                        resolve();
                    };
                    img.src = track.cover;
                } else {
                    resolve();
                }
            });
        });
        
        await Promise.all(preloadPromises);
    }
    
    // ОПТИМИЗАЦИЯ: Инициализация фона один раз
    initBackground() {
        // Создаем ДВА слоя для плавного перехода
        const createBackgroundLayer = (id, zIndex) => {
            const layer = document.createElement('div');
            layer.id = id;
            layer.className = 'background-layer';
            layer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                background-attachment: fixed;
                z-index: ${zIndex};
                pointer-events: none;
                transition: opacity 0.5s ease;
                opacity: 0;
            `;
            return layer;
        };
        
        // Слой 1 - текущий фон
        this.bgLayer1 = createBackgroundLayer('bg-layer-1', -2);
        
        // Слой 2 - следующий фон (для перехода)
        this.bgLayer2 = createBackgroundLayer('bg-layer-2', -3);
        
        // Слой размытия (один на все время)
        const blurOverlay = document.createElement('div');
        blurOverlay.id = 'blur-overlay';
        blurOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            background: rgba(0, 0, 0, 0.2);
            z-index: -1;
            pointer-events: none;
        `;
        
        // Добавляем все слои
        document.body.appendChild(this.bgLayer1);
        document.body.appendChild(this.bgLayer2);
        document.body.appendChild(blurOverlay);
        
        // Устанавливаем начальный фон
        if (this.playlist.length > 0) {
            this.setBackgroundImage(this.playlist[0].cover);
        }
    }
    
    // ОПТИМИЗАЦИЯ: Быстрая смена фона
    setBackgroundImage(imageUrl, instant = false) {
        // Если изображение уже в кеше - используем его
        if (this.preloadedImages.has(imageUrl)) {
            const img = this.preloadedImages.get(imageUrl);
            
            // Создаем временный canvas для более быстрой отрисовки
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Используем canvas для фона (быстрее чем img.src)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            if (instant) {
                // Мгновенная замена (для первого трека)
                this.bgLayer1.style.backgroundImage = `url('${dataUrl}')`;
                this.bgLayer1.style.opacity = '1';
                this.bgLayer2.style.opacity = '0';
            } else {
                // Плавный переход
                if (this.bgLayer1.style.opacity === '1') {
                    // bgLayer1 активен, меняем на bgLayer2
                    this.bgLayer2.style.backgroundImage = `url('${dataUrl}')`;
                    this.bgLayer2.style.opacity = '1';
                    this.bgLayer1.style.opacity = '0';
                } else {
                    // bgLayer2 активен, меняем на bgLayer1
                    this.bgLayer1.style.backgroundImage = `url('${dataUrl}')`;
                    this.bgLayer1.style.opacity = '1';
                    this.bgLayer2.style.opacity = '0';
                }
            }
            
            // Освобождаем память
            canvas.width = 0;
            canvas.height = 0;
        } else {
            // Если нет в кеше - загружаем обычным способом
            const img = new Image();
            img.onload = () => {
                if (instant) {
                    this.bgLayer1.style.backgroundImage = `url('${imageUrl}')`;
                    this.bgLayer1.style.opacity = '1';
                } else {
                    if (this.bgLayer1.style.opacity === '1') {
                        this.bgLayer2.style.backgroundImage = `url('${imageUrl}')`;
                        this.bgLayer2.style.opacity = '1';
                        this.bgLayer1.style.opacity = '0';
                    } else {
                        this.bgLayer1.style.backgroundImage = `url('${imageUrl}')`;
                        this.bgLayer1.style.opacity = '1';
                        this.bgLayer2.style.opacity = '0';
                    }
                }
            };
            img.src = imageUrl;
        }
    }
    
    bindEvents() {
        // Упрощенный вариант обработчиков - удалены тяжелые операции
        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.prevBtn.addEventListener('click', () => this.prev());
        this.elements.nextBtn.addEventListener('click', () => this.next());
        
        this.elements.volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value;
        });
        
        // ОПТИМИЗАЦИЯ: Упрощенный обработчик прогресса
        let progressTimeout;
        this.elements.progressContainer.addEventListener('click', (e) => {
            const rect = this.elements.progressContainer.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            
            if (this.audio.duration) {
                this.audio.currentTime = percent * this.audio.duration;
            }
        });
        
        // Оптимизация: реже обновляем UI
        this.audio.addEventListener('timeupdate', () => {
            if (!progressTimeout) {
                progressTimeout = setTimeout(() => {
                    this.updateProgress();
                    progressTimeout = null;
                }, 50); // Обновляем каждые 50мс вместо каждого кадра
            }
        });
        
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.next());
        
        this.audio.addEventListener('error', (e) => {
            console.error('Ошибка аудио:', e);
            this.updateStatus("Ошибка загрузки трека");
        });
    }
    
    // ОПТИМИЗАЦИЯ: Более быстрый рендеринг плейлиста
    renderPlaylist() {
        // Используем DocumentFragment для массовой вставки
        const fragment = document.createDocumentFragment();
        
        this.playlist.forEach((track, index) => {
            const li = document.createElement('li');
            
            // Минимальный HTML
            li.innerHTML = `
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-duration">${track.duration || '--:--'}</div>
            `;
            
            // Делегирование событий на уровне плейлиста
            li.dataset.index = index;
            
            if (index === this.currentTrackIndex) {
                li.classList.add('active');
            }
            
            fragment.appendChild(li);
        });
        
        this.elements.playlistEl.innerHTML = '';
        this.elements.playlistEl.appendChild(fragment);
        
        // Один обработчик на весь плейлист
        this.elements.playlistEl.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (li && li.dataset.index) {
                const index = parseInt(li.dataset.index);
                this.loadTrack(index);
                this.play();
            }
        });
    }
    
    // ОПТИМИЗАЦИЯ: Быстрая загрузка трека
    loadTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentTrackIndex = index;
            const track = this.playlist[index];
            
            // ОПТИМИЗАЦИЯ: Минимальные DOM операции
            this.audio.src = track.src;
            this.elements.currentSongEl.textContent = track.title;
            this.elements.currentArtistEl.textContent = track.artist;
            
            // ОПТИМИЗАЦИЯ: Обложка в плеере
            if (track.cover && this.elements.coverImage) {
                // Используем кешированное изображение если есть
                if (this.preloadedImages.has(track.cover)) {
                    this.elements.coverImage.src = this.preloadedImages.get(track.cover).src;
                } else {
                    this.elements.coverImage.src = track.cover;
                }
            }
            
            // ОПТИМИЗАЦИЯ: Быстрая смена фона
            if (track.cover) {
                this.setBackgroundImage(track.cover);
            }
            
            // ОПТИМИЗАЦИЯ: Быстрое обновление активного элемента
            const items = this.elements.playlistEl.querySelectorAll('li');
            items.forEach((item, i) => {
                if (i === index) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Автовоспроизведение если уже играло
            if (this.isPlaying) {
                this.audio.play().catch(e => console.log('Автовоспроизведение отключено'));
            }
        }
    }
    
    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.elements.playBtn.style.display = 'none';
                this.elements.pauseBtn.style.display = 'flex';
                this.elements.albumCover.classList.add('playing');
            })
            .catch(error => {
                console.error('Ошибка воспроизведения:', error);
            });
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.elements.playBtn.style.display = 'flex';
        this.elements.pauseBtn.style.display = 'none';
        this.elements.albumCover.classList.remove('playing');
    }
    
    prev() {
        let newIndex = this.currentTrackIndex - 1;
        if (newIndex < 0) newIndex = this.playlist.length - 1;
        this.loadTrack(newIndex);
        if (this.isPlaying) this.audio.play();
    }
    
    next() {
        let newIndex = this.currentTrackIndex + 1;
        if (newIndex >= this.playlist.length) newIndex = 0;
        this.loadTrack(newIndex);
        if (this.isPlaying) this.audio.play();
    }
    
    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.elements.progressBar.style.width = `${percent}%`;
            this.elements.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    updateDuration() {
        if (this.audio.duration) {
            this.elements.durationEl.textContent = this.formatTime(this.audio.duration);
        }
    }
    
    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
    
    updateStatus(message) {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = message;
            // Автоматически скрываем через 2 секунды
            setTimeout(() => {
                this.elements.statusMessage.textContent = '';
            }, 2000);
        }
    }
    
    // Оптимизированное добавление трека
    async addTrack(track) {
        this.playlist.push(track);
        
        // Предзагрузка обложки
        if (track.cover) {
            await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.preloadedImages.set(track.cover, img);
                    resolve();
                };
                img.onerror = resolve;
                img.src = track.cover;
            });
        }
        
        // Перерендерим плейлист только если он видим
        if (this.elements.playlistEl.offsetParent !== null) {
            this.renderPlaylist();
        }
    }
}

// Быстрая инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Не блокируем основной поток
    setTimeout(() => {
        window.player = new MP3Player();
    }, 100);
});