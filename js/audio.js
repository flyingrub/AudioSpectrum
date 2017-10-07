class Audio {

    init(player) {
        this.bassTimeline = [];
        this.kickTimeline = [];
        this.midTimeline = [];
        this.highTimeline = [];

        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        this.audioContext = new AudioContext();

        this.player = player;
        // Source
        this.currentAudioSource = this.audioContext.createMediaElementSource(player);
        this.currentAudioSource.connect(this.audioContext.destination);

        // Analyser
        this.analyser = this.audioContext.createAnalyser();
        this.sampleRate = this.audioContext.sampleRate;
        this.setFFTSize(4096)
        this.analyser.smoothingTimeConstant = 0.5;
        this.analyser.maxDecibels = 0;
        this.analyser.minDecibels = -100;
        this.currentAudioSource.connect(this.analyser);
    }

    setFFTSize(size) {
        this.analyser.fftSize = size;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.freqMin = this.sampleRate / this.bufferLength;
        this.freqMax = this.sampleRate / 2;
        this.freqBinStep = (this.freqMax-this.freqMin) / this.bufferLength;
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

        let bass = [],
            kick = [],
            mid = [],
            high = [];
        for(let i = 0; i < this.bufferLength; i++) {
            let freq = this.freqMin + this.freqBinStep * i;
            if (freq < 100) {
                bass.push(this.freq[i]);
            } else if (freq < 200) {
                kick.push(this.freq[i])
            } else if (freq < 2000) {
                mid.push(this.freq[i]);
            } else {
                high.push(this.freq[i]);
            }
        }
        let addAverageToTimeline = (timeline, array) => {
            let sum = array.reduce(function(a, b) { return a + b; });
            let average =  sum / array.length;
            timeline.unshift(average);
            if (timeline.length > 3000) {
                timeline.pop();
            }
        }
        addAverageToTimeline(this.bassTimeline, bass);
        addAverageToTimeline(this.kickTimeline, kick);
        addAverageToTimeline(this.midTimeline, mid);
        addAverageToTimeline(this.highTimeline, high);
    }
}
