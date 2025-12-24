
const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: 'canvas',
    data: 'https://t.me/onikeloyan',
    dotsOptions: {
        type: 'rounded',
        color: '#000000',
    },
    backgroundOptions: {
        color: 'transparent',
    },
})

const qrDiv = document.getElementById('qr')
const gradientLayer = document.getElementById('gradient-layer')

qrCode.append(qrDiv)

// Получить canvas и применить маску
setTimeout(() => {
    const canvas = qrDiv.querySelector('canvas')
    if (canvas) {
        const dataUrl = canvas.toDataURL('image/png')
        gradientLayer.style.maskImage = `url(${dataUrl})`
        gradientLayer.style.webkitMaskImage = `url(${dataUrl})`
    }
}, 300)

// Плавно меняем угол градиента
document.addEventListener('mousemove', (e) => {
    const rect = qrDiv.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = e.clientX - centerX
    const dy = e.clientY - centerY

    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90

    // Преобразуем позицию мыши в проценты
    const percentX = e.clientX / window.innerWidth
    const percentY = e.clientY / window.innerHeight

    // Преобразуем в цвет через hls — удобно для градиентов
    const hue1 = Math.floor(percentX * 360)
    const hue2 = Math.floor(percentY * 360)

    const color1 = `hsl(${hue1}, 100%, 50%)`
    const color2 = `hsl(${hue2}, 100%, 50%)`

    gradientLayer.style.background = `linear-gradient(${angle}deg, ${color1}, ${color2})`
})

// Получаем элементы
var modal = document.getElementById("myModal");
var btn = document.getElementById("modalBtn");
var span = document.getElementsByClassName("close")[0];

// Открываем модальное окно при клике на кнопку
btn.onclick = function() {
    modal.style.display = "block";
}

// Закрываем модальное окно при клике на крестик
span.onclick = function() {
    modal.style.display = "none";
}

// Закрываем модальное окно при клике вне его области
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


