class MP3Player {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.shuffleMode = false;
        this.repeatMode = false;
        
        // Элементы DOM (УБИРАЕМ volumeSlider)
        this.elements = {
            playBtn: document.getElementById('play-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
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
    
    init() {
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
        
        // Инициализация событий
        this.bindEvents();
        
        // Создание списка плейлиста
        this.renderPlaylist();
        
        // Загрузка первого трека
        this.loadTrack(0);
        
        // Устанавливаем фиксированную громкость (например, 70%)
        this.audio.volume = 0.7;
        
        // Инициализация фона
        this.initBackground();
    }
    
    initBackground() {
        // Удаляем старые оверлеи если есть
        const oldOverlay = document.getElementById('blur-overlay');
        if (oldOverlay) oldOverlay.remove();
        
        const oldDarkOverlay = document.getElementById('dark-overlay');
        if (oldDarkOverlay) oldDarkOverlay.remove();
        
        // Создаем размытый оверлей
        const blurOverlay = document.createElement('div');
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
            transition: opacity 0.8s ease;
        `;
        document.body.appendChild(blurOverlay);
        
        // Создаем темный оверлей для контраста
        const darkOverlay = document.createElement('div');
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
            transition: opacity 0.8s ease;
        `;
        document.body.appendChild(darkOverlay);
        
        // Устанавливаем начальный фон (первый трек)
        if (this.playlist.length > 0) {
            this.updateBackground(this.playlist[0].cover);
        }
    }
    
    updateBackground(imageUrl) {
        // Плавно скрываем старый фон
        const blurOverlay = document.getElementById('blur-overlay');
        const darkOverlay = document.getElementById('dark-overlay');
        
        if (blurOverlay) blurOverlay.style.opacity = '0.7';
        if (darkOverlay) darkOverlay.style.opacity = '0.8';
        
        // Устанавливаем новое фоновое изображение
        document.body.style.backgroundImage = `url('${imageUrl}')`;
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.transition = 'background-image 0.8s ease-in-out';
        
        // Плавно показываем оверлеи
        setTimeout(() => {
            if (blurOverlay) {
                blurOverlay.style.opacity = '1';
                blurOverlay.style.backdropFilter = 'blur(25px)';
                blurOverlay.style.webkitBackdropFilter = 'blur(25px)';
            }
            if (darkOverlay) darkOverlay.style.opacity = '1';
        }, 100);
    }
    
    bindEvents() {
        // Кнопки управления
        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.prevBtn.addEventListener('click', () => this.prev());
        this.elements.nextBtn.addEventListener('click', () => this.next());
        
        // Прогресс трека
        this.elements.progressContainer.addEventListener('click', (e) => {
            const width = this.elements.progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = this.audio.duration;
            
            if (duration && !isNaN(duration)) {
                this.audio.currentTime = (clickX / width) * duration;
                this.updateProgress();
            }
        });
        
        // События аудио
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('error', (e) => {
            console.error('Ошибка загрузки аудио:', e);
            this.updateStatus("Ошибка загрузки трека. Проверьте ссылку на файл.");
        });
    }
    
    renderPlaylist() {
        this.elements.playlistEl.innerHTML = '';
        
        this.playlist.forEach((track, index) => {
            const li = document.createElement('li');
            
            li.innerHTML = `
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-duration">${track.duration || '--:--'}</div>
            `;
            
            li.addEventListener('click', () => {
                this.loadTrack(index);
                this.play();
            });
            
            if (index === this.currentTrackIndex) {
                li.classList.add('active');
            }
            
            this.elements.playlistEl.appendChild(li);
        });
    }
    
    loadTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentTrackIndex = index;
            const track = this.playlist[index];
            
            try {
                this.audio.src = track.src;
                this.elements.currentSongEl.textContent = track.title;
                this.elements.currentArtistEl.textContent = track.artist;
                
                // Устанавливаем обложку в плеере
                if (track.cover && this.elements.coverImage) {
                    this.elements.coverImage.src = track.cover;
                    this.elements.coverImage.alt = `${track.title} - ${track.artist}`;
                }
                
                // ОБНОВЛЯЕМ ФОН С РАЗМЫТИЕМ
                if (track.cover) {
                    this.updateBackground(track.cover);
                }
                
                // Обновление активного элемента в плейлисте
                const items = this.elements.playlistEl.querySelectorAll('li');
                items.forEach((item, i) => {
                    item.classList.toggle('active', i === index);
                });
                
                // Если было воспроизведение, продолжаем
                if (this.isPlaying) {
                    this.play();
                }
                
                this.updateStatus(`Загружен: ${track.title} - ${track.artist}`);
            } catch (error) {
                console.error('Ошибка загрузки трека:', error);
                this.updateStatus(`Ошибка загрузки: ${track.title}`);
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
                this.updateStatus("Воспроизведение...");
            })
            .catch(error => {
                console.error('Ошибка воспроизведения:', error);
                this.updateStatus("Ошибка воспроизведения. Проверьте доступ к аудио файлу.");
            });
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.elements.playBtn.style.display = 'flex';
        this.elements.pauseBtn.style.display = 'none';
        this.elements.albumCover.classList.remove('playing');
        this.updateStatus("Пауза");
    }
    
    prev() {
        let newIndex = this.currentTrackIndex - 1;
        if (newIndex < 0) {
            newIndex = this.playlist.length - 1;
        }
        this.loadTrack(newIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    next() {
        let newIndex = this.currentTrackIndex + 1;
        if (newIndex >= this.playlist.length) {
            newIndex = 0;
        }
        this.loadTrack(newIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    updateProgress() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.elements.progressBar.style.width = `${percent}%`;
            
            // Обновление времени
            this.elements.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    updateDuration() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
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
        }
    }
    
    // Метод для добавления треков динамически
    addTrack(track) {
        this.playlist.push(track);
        this.renderPlaylist();
        this.updateStatus(`Добавлен трек: ${track.title}`);
    }
}

// Инициализация плеера при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const player = new MP3Player();
    window.player = player;
});