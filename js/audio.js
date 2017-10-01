class Audio {

    init(player) {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        let audioContext = new AudioContext();

        this.player = player;
        // Source
        let audioSource = audioContext.createMediaElementSource(player);
        audioSource.connect(audioContext.destination);

        // Analyser
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 4096;
        this.analyser.smoothingTimeConstant = 0.5;
        this.analyser.maxDecibels = 0;
        this.analyser.minDecibels = -100;
        this.sampleRate = audioContext.sampleRate;
        audioSource.connect(this.analyser);
        this.bufferLength = this.analyser.frequencyBinCount;
    }

    load(url) {
        this.player.setAttribute('src', url);
        this.player.load();
        this.player.play();
    }

    detectBeat() {
        this.freq = new Uint8Array(this.bufferLength);
        this.analyser.getByteFrequencyData(this.freq);
    }
}
