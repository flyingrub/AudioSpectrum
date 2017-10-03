class Audio {

    init(player) {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        this.audioContext = new AudioContext();

        this.player = player;
        // Source
        this.currentAudioSource = this.audioContext.createMediaElementSource(player);
        this.currentAudioSource.connect(this.audioContext.destination);

        // Analyser
        this.analyser = this.audioContext.createAnalyser();
        this.setFFTSize(4096 * 2)
        this.analyser.smoothingTimeConstant = 0.5;
        this.analyser.maxDecibels = 0;
        this.analyser.minDecibels = -100;
        this.sampleRate = this.audioContext.sampleRate;
        this.currentAudioSource.connect(this.analyser);
    }

    setFFTSize(size) {
        this.analyser.fftSize = size;
        this.bufferLength = this.analyser.frequencyBinCount;
    }

    load(url) {
        this.player.setAttribute('src', url);
        this.player.load();
        this.player.play();
    }

    loadFromLocal(file) {
        let reader = new FileReader();
        reader.addEventListener('load', function(e) {
            let data = e.target.result;
            audio.audioContext.decodeAudioData(data,
                (buffer) => audio.playFromFile(buffer)
            );
        });
        reader.readAsArrayBuffer(file);
    }

    playFromFile(buffer) {
        this.currentAudioSource.disconnect();
        this.currentAudioSource = this.audioContext.createBufferSource();
        this.currentAudioSource.connect(this.audioContext.destination);
        this.currentAudioSource.connect(this.analyser);
        this.currentAudioSource.buffer = buffer;
        this.currentAudioSource.start(0);
    }

    detectBeat() {
        this.freq = new Uint8Array(this.bufferLength);
        this.analyser.getByteFrequencyData(this.freq);
    }
}
