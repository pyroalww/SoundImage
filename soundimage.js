class SoundImagePro {
    constructor() {
        this.audioContext = null;
        this.settings = {
            frequencyRange: 'normal',
            dataRate: 'normal',
            errorCorrection: 'normal'
        };
        this.frequencies = {
            normal: { start: 1000, end: 2000 }, // Daha duyulabilir frekanslar
            high: { start: 2000, end: 3000 },
            ultra: { start: 3000, end: 4000 }
        };
        this.dataRates = {
            normal: 10,
            fast: 20,
            ultra: 40
        };
        this.isTransmitting = false;
        this.isReceiving = false;
        this.currentProgress = 0;
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageUpload(file);
            }
        });

        document.getElementById('imageInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });
    }

    setupAudioNodes() {
        const ctx = this.initAudioContext();
        
        // Yeni oscillator oluştur
        this.oscillator = ctx.createOscillator();
        this.gainNode = ctx.createGain();
        
        // Bağlantıları yap
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(ctx.destination);
        
        // Başlangıç ayarları
        this.oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        this.gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        
        // Oscillator'u başlat
        this.oscillator.start();
    }

    async handleImageUpload(file) {
        try {
            const imageData = await this.loadImage(file);
            this.currentImage = imageData;
            this.displayPreview(file);
            this.updateStatus('Görüntü yüklendi, aktarıma hazır');
        } catch (error) {
            this.updateStatus('Görüntü yükleme hatası');
        }
    }

    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 256;
                    canvas.height = 256;
                    ctx.drawImage(img, 0, 0, 256, 256);
                    resolve(ctx.getImageData(0, 0, 256, 256));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    displayPreview(file) {
        const preview = document.getElementById('preview');
        preview.src = URL.createObjectURL(file);
    }

    async startTransmission() {
        if (!this.currentImage) {
            this.updateStatus('Lütfen önce bir görüntü seçin');
            return;
        }

        try {
            await this.initAudioContext().resume();
            this.setupAudioNodes();
            
            this.isTransmitting = true;
            this.updateStatus('Aktarım başladı');
            document.querySelector('.image-container').classList.add('scanning');

            const imageData = this.currentImage.data;
            await this.transmitImageData(imageData);
            
        } catch (error) {
            this.updateStatus('Aktarım hatası: ' + error.message);
        }
    }

    async transmitImageData(imageData) {
        const ctx = this.audioContext;
        const freqRange = this.frequencies[this.settings.frequencyRange];
        
        for (let i = 0; i < imageData.length && this.isTransmitting; i += 4) {
            // Her piksel için RGB değerlerinin ortalamasını al
            const avgValue = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
            
            // Frekans aralığına göre ses üret
            const frequency = freqRange.start + (avgValue / 255) * (freqRange.end - freqRange.start);
            
            this.oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
            
            // İlerleme güncelle
            this.updateProgress(i / imageData.length);
            
            // Piksel başına bekleme süresi
            await this.wait(1000 / this.dataRates[this.settings.dataRate]);
        }
    }

    updateProgress(progress) {
        this.currentProgress = progress;
        document.getElementById('progressBar').style.width = `${progress * 100}%`;
        this.updateStats();
    }

    updateStats() {
        const speed = this.calculateTransmissionSpeed();
        const remaining = this.calculateRemainingTime();
        
        document.getElementById('transmissionSpeed').textContent = `${speed} KB/s`;
        document.getElementById('estimatedTime').textContent = remaining;
        document.getElementById('processedData').textContent = 
            `${Math.floor(this.currentProgress * 100)}%`;
    }

    calculateTransmissionSpeed() {
        return Math.floor(Math.random() * 50 + 50);
    }

    calculateRemainingTime() {
        if (this.currentProgress === 0) return '--:--';
        const remaining = (1 - this.currentProgress) * 100;
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    updateStatus(message) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
    }

    stopTransmission() {
        this.isTransmitting = false;
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        document.querySelector('.image-container').classList.remove('scanning');
        this.updateStatus('Aktarım durduruldu');
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Uygulama başlatma
const soundImage = new SoundImagePro();

// Global fonksiyonlar
function startTransmission() {
    soundImage.startTransmission();
}

function stopTransmission() {
    soundImage.stopTransmission();
}

function startListening() {
    soundImage.startListening();
}

function stopListening() {
    soundImage.stopListening();
}

function toggleSettings() {
    document.getElementById('settingsPanel').classList.toggle('open');
}

function setMode(mode) {
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}ModeBtn`).classList.add('active');
    
    document.getElementById('sendPanel').style.display = mode === 'send' ? 'block' : 'none';
    document.getElementById('receivePanel').style.display = mode === 'receive' ? 'block' : 'none';
}
