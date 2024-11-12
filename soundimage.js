<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SoundImage Pro - Ses ile Fotoğraf Aktarımı</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #2962ff;
            --secondary-color: #0039cb;
            --accent-color: #768fff;
            --success-color: #00c853;
            --error-color: #ff1744;
            --warning-color: #ffd600;
            --background-color: #f5f5f5;
            --text-primary: #212121;
            --text-secondary: #757575;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        body {
            background: var(--background-color);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .app-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 1rem;
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .header h1 {
            color: var(--primary-color);
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .header p {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        .mode-selector {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin: 2rem 0;
        }

        .mode-button {
            padding: 1rem 2rem;
            font-size: 1.1rem;
            border: none;
            border-radius: 50px;
            background: white;
            color: var(--primary-color);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .mode-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .mode-button.active {
            background: var(--primary-color);
            color: white;
        }

        .workspace {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin: 2rem 0;
        }

        .panel {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .image-container {
            position: relative;
            width: 100%;
            height: 500px;
            border: 3px dashed #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .preview-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .scan-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, 
                transparent, 
                var(--primary-color),
                transparent
            );
            box-shadow: 0 0 15px var(--primary-color);
            animation: scanning 2s linear infinite;
            opacity: 0;
        }

        .scanning .scan-line {
            opacity: 1;
        }

        @keyframes scanning {
            0% { top: 0; }
            100% { top: 100%; }
        }

        .controls {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }

        .control-button {
            flex: 1;
            padding: 1rem;
            border: none;
            border-radius: 8px;
            background: var(--primary-color);
            color: white;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .control-button:hover {
            background: var(--secondary-color);
        }

        .control-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .progress-container {
            margin-top: 1rem;
        }

        .progress-bar {
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }

        .progress {
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, 
                var(--primary-color), 
                var(--accent-color)
            );
            transition: width 0.3s ease;
        }

        .status-container {
            margin-top: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .status-text {
            font-size: 1rem;
            color: var(--text-secondary);
            text-align: center;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-top: 1rem;
        }

        .stat-card {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary-color);
        }

        .stat-label {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        .file-drop-zone {
            position: relative;
            width: 100%;
            height: 200px;
            border: 2px dashed #ccc;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .file-drop-zone:hover {
            border-color: var(--primary-color);
            background: rgba(41, 98, 255, 0.05);
        }

        .file-drop-zone i {
            font-size: 3rem;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }

        .file-input {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }

        .quality-indicator {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .tooltip {
            position: relative;
            display: inline-block;
        }

        .tooltip .tooltiptext {
            visibility: hidden;
            width: 200px;
            background-color: rgba(0,0,0,0.8);
            color: white;
            text-align: center;
            padding: 5px;
            border-radius: 6px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .tooltip:hover .tooltiptext {
            visibility: visible;
            opacity: 1;
        }

        .settings-panel {
            position: fixed;
            right: -300px;
            top: 0;
            width: 300px;
            height: 100%;
            background: white;
            padding: 2rem;
            box-shadow: -2px 0 5px rgba(0,0,0,0.1);
            transition: right 0.3s ease;
            z-index: 1000;
        }

        .settings-panel.open {
            right: 0;
        }

        .settings-toggle {
            position: fixed;
            right: 2rem;
            top: 2rem;
            background: var(--primary-color);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1001;
        }

        @media (max-width: 1200px) {
            .workspace {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .app-container {
                padding: 1rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    /* Mobil optimizasyonları */
    @media (max-width: 768px) {
        .app-container {
            padding: 0.5rem;
        }

        .header h1 {
            font-size: 1.8rem;
        }

        .mode-button {
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
        }

        .image-container {
            height: 300px;
        }

        .control-button {
            padding: 0.8rem;
            font-size: 0.9rem;
        }

        .stats-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }

        .stat-card {
            padding: 0.8rem;
        }

        .settings-panel {
            width: 100%;
            right: -100%;
        }

        .mobile .file-drop-zone {
            height: 150px;
        }

        .mobile .control-button {
            min-height: 44px;
        }
    }

    /* Dokunmatik hedef boyutları */
    .mobile button,
    .mobile input,
    .mobile select {
        min-height: 44px;
        min-width: 44px;
    }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="header">
            <h1><i class="fas fa-broadcast-tower"></i> SoundImage Pro</h1>
            <p>Gelişmiş Ses ile Fotoğraf Aktarım Sistemi</p>
        </div>

        <div class="mode-selector">
            <button class="mode-button" onclick="setMode('send')" id="sendModeBtn">
                <i class="fas fa-upload"></i> Gönderme Modu
            </button>
            <button class="mode-button" onclick="setMode('receive')" id="receiveModeBtn">
                <i class="fas fa-download"></i> Alma Modu
            </button>
        </div>

        <div class="workspace">
            <div class="panel" id="sendPanel">
                <h2><i class="fas fa-paper-plane"></i> Gönderici Panel</h2>
                <div class="file-drop-zone" id="dropZone">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Fotoğraf sürükle bırak veya seç</p>
                    <input type="file" class="file-input" id="imageInput" accept="image/*">
                </div>
                <div class="image-container">
                    <img id="preview" class="preview-image">
                    <div class="scan-line"></div>
                    <div class="quality-indicator">
                        <i class="fas fa-signal"></i>
                        <span id="signalQuality">100%</span>
                    </div>
                </div>
                <div class="controls">
                    <button class="control-button" id="startTransmitBtn" onclick="startTransmission()">
                        <i class="fas fa-play"></i> Başlat
                    </button>
                    <button class="control-button" id="pauseTransmitBtn" onclick="pauseTransmission()">
                        <i class="fas fa-pause"></i> Duraklat
                    </button>
                    <button class="control-button" id="stopTransmitBtn" onclick="stopTransmission()">
                        <i class="fas fa-stop"></i> Durdur
                    </button>
                </div>
            </div>

            <div class="panel" id="receivePanel">
                <h2><i class="fas fa-satellite-dish"></i> Alıcı Panel</h2>
                <div class="image-container">
                    <canvas id="receivedCanvas"></canvas>
                    <div class="scan-line"></div>
                    <div class="quality-indicator">
                        <i class="fas fa-wifi"></i>
                        <span id="receiveQuality">Bekleniyor</span>
                    </div>
                </div>
                <div class="controls">
                    <button class="control-button" id="startListenBtn" onclick="startListening()">
                        <i class="fas fa-headphones"></i> Dinlemeyi Başlat
                    </button>
                    <button class="control-button" id="stopListenBtn" onclick="stopListening()">
                        <i class="fas fa-stop-circle"></i> Dinlemeyi Durdur
                    </button>
                </div>
            </div>
        </div>

        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress" id="progressBar"></div>
            </div>
            <div class="status-container">
                <p class="status-text" id="status">Sistem Hazır</p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value" id="transmissionSpeed">0 KB/s</div>
                <div class="stat-label">Aktarım Hızı</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="processedData">0/0</div>
                <div class="stat-label">İşlenen Veri</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="estimatedTime">--:--</div>
                <div class="stat-label">Tahmini Süre</div>
            </div>
        </div>
    </div>

    <div class="settings-toggle" onclick="toggleSettings()">
        <i class="fas fa-cog"></i>
    </div>

    <div class="settings-panel" id="settingsPanel">
        <h3>Ayarlar</h3>
        <div class="settings-content">
            <div class="setting-item">
                <label>Frekans Aralığı</label>
                <select id="frequencyRange">
                    <option value="normal">Normal (18-19kHz)</option>
                    <option value="high">Yüksek (19-20kHz)</option>
                    <option value="ultra">Ultra (20-21kHz)</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Veri Hızı</label>
                <select id="dataRate">
                    <option value="normal">Normal</option>
                    <option value="fast">Hızlı</option>
                    <option value="ultra">Ultra Hızlı</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Hata Düzeltme</label>
                <select id="errorCorrection">
                    <option value="normal">Normal</option>
                    <option value="high">Yüksek</option>
                    <option value="ultra">Ultra</option>
                </select>
                <div class="setting-item">
                    <label>Ses Seviyesi</label>
                    <input type="range" 
                           id="volumeControl" 
                           min="0" 
                           max="1" 
                           step="0.1" 
                           value="0.2" 
                           onchange="setVolume(this.value)">
                </div>
            </div>
        </div>
    </div>

    <script src="soundimage.js"></script>
</body>
</html>
