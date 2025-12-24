class MP3Player {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.shuffleMode = false;
        this.repeatMode = false;
        
        // Элементы DOM
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
        
        // Устанавливаем фиксированную громкость
        this.audio.volume = 0.7;
        
        // Инициализация фона
        this.initBackground();
    }
    
    initBackground() {
        // УДАЛЯЕМ ВСЕ СТАРЫЕ СЛОИ
        const oldLayers = document.querySelectorAll('#bg-layer, #blur-layer, #bg-layer-1, #bg-layer-2');
        oldLayers.forEach(layer => layer.remove());
        
        // Создаем ДВА слоя для плавного перехода
        const bgLayer1 = document.createElement('div');
        bgLayer1.id = 'bg-layer-1';
        bgLayer1.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: cover;
            background-attachment: fixed;
            opacity: 1;
            transition: opacity 0.8s ease-in-out;
            z-index: -2;
            pointer-events: none;
        `;
        
        const bgLayer2 = document.createElement('div');
        bgLayer2.id = 'bg-layer-2';
        bgLayer2.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: cover;
            background-attachment: fixed;
            opacity: 0;
            transition: opacity 0.8s ease-in-out;
            z-index: -2;
            pointer-events: none;
        `;
        
        // Слой размытия
        const blurLayer = document.createElement('div');
        blurLayer.id = 'blur-layer';
        blurLayer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            background: rgba(0, 0, 0, 0.25);
            z-index: -1;
            pointer-events: none;
        `;
        
        // Добавляем слои
        document.body.appendChild(bgLayer1);
        document.body.appendChild(bgLayer2);
        document.body.appendChild(blurLayer);
        
        // Устанавливаем стили для body
        document.body.style.cssText = `
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        `;
        
        // Устанавливаем начальный фон
        if (this.playlist.length > 0) {
            const img = new Image();
            img.onload = () => {
                bgLayer1.style.backgroundImage = `url('${this.playlist[0].cover}')`;
            };
            img.src = this.playlist[0].cover;
        }
    }
    
    // ПРОСТОЙ метод для смены фона с плавным переходом
    updateBackground(imageUrl) {
        const bgLayer1 = document.getElementById('bg-layer-1');
        const bgLayer2 = document.getElementById('bg-layer-2');
        
        if (!bgLayer1 || !bgLayer2) {
            // Если слоев нет - создаем их
            this.initBackground();
            return;
        }
        
        // Предзагрузка изображения
        const img = new Image();
        
        img.onload = () => {
            // Определяем какой слой активен сейчас
            const activeLayer = bgLayer1.style.opacity === '1' ? bgLayer1 : bgLayer2;
            const inactiveLayer = activeLayer === bgLayer1 ? bgLayer2 : bgLayer1;
            
            // Устанавливаем новое изображение на неактивный слой
            inactiveLayer.style.backgroundImage = `url('${imageUrl}')`;
            
            // Плавно показываем неактивный слой и скрываем активный
            setTimeout(() => {
                inactiveLayer.style.opacity = '1';
                activeLayer.style.opacity = '0';
            }, 10);
        };
        
        img.onerror = () => {
            console.warn('Не удалось загрузить фон:', imageUrl);
            // Устанавливаем градиент
            const activeLayer = bgLayer1.style.opacity === '1' ? bgLayer1 : bgLayer2;
            activeLayer.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        };
        
        img.src = imageUrl;
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
        
        // Восстановление фона
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.restoreBackground();
            }
        });
    }
    
    // Упрощенный метод восстановления фона
    restoreBackground() {
        const currentTrack = this.playlist[this.currentTrackIndex];
        if (currentTrack && currentTrack.cover) {
            // Просто обновляем фон
            this.updateBackground(currentTrack.cover);
        }
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
                
                // ОБНОВЛЯЕМ ФОН С ПЛАВНЫМ ПЕРЕХОДОМ
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
                
            } catch (error) {
                console.error('Ошибка загрузки трека:', error);
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
    
    addTrack(track) {
        this.playlist.push(track);
        this.renderPlaylist();
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const player = new MP3Player();
    window.player = player;
});