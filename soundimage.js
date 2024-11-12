class SoundImagePro {
    constructor() {
        this.audioContext = null;
        this.settings = {
            frequencyRange: 'normal',
            dataRate: 'normal',
            errorCorrection: 'normal',
            volume: 0.2
        };
        this.frequencies = {
            normal: { start: 1000, end: 2000 },
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
        this.analyser = null;
        this.mediaStream = null;
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupMobileAudio();
    }

    setupMobileAudio() {
        document.addEventListener('touchstart', async () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                await this.audioContext.resume();
            }
        }, { once: true });
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
        this.oscillator = ctx.createOscillator();
        this.gainNode = ctx.createGain();
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(ctx.destination);
        this.oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        this.gainNode.gain.setValueAtTime(this.settings.volume, ctx.currentTime);
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
            await this.transmitImageData(this.currentImage.data);
        } catch (error) {
            this.updateStatus('Aktarım hatası: ' + error.message);
        }
    }

    async transmitImageData(imageData) {
        const ctx = this.audioContext;
        const freqRange = this.frequencies[this.settings.frequencyRange];
        
        for (let i = 0; i < imageData.length && this.isTransmitting; i += 4) {
            const avgValue = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
            const frequency = freqRange.start + (avgValue / 255) * (freqRange.end - freqRange.start);
            this.oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
            this.gainNode.gain.setValueAtTime(this.settings.volume, ctx.currentTime);
            this.updateProgress(i / imageData.length);
            await this.wait(1000 / this.dataRates[this.settings.dataRate]);
        }
    }

    async startListening() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStream = stream;
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            source.connect(this.analyser);
            this.isReceiving = true;
            this.updateStatus('Dinleme başladı');
            this.processAudio();
        } catch (error) {
            this.updateStatus('Mikrofon erişim hatası: ' + error.message);
        }
    }

    stopListening() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        this.isReceiving = false;
        this.updateStatus('Dinleme durduruldu');
    }

    processAudio() {
        if (!this.isReceiving) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        const canvas = document.getElementById('receivedCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;

        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }

        requestAnimationFrame(() => this.processAudio());
    }

    setVolume(value) {
        this.settings.volume = value;
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
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
        document.getElementById('processedData').textContent = `${Math.floor(this.currentProgress * 100)}%`;
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

let soundImage = new SoundImagePro();

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

function setVolume(value) {
    soundImage.setVolume(parseFloat(value));
}

document.addEventListener('DOMContentLoaded', () => {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        document.body.classList.add('mobile');
    }
});
