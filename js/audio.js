class Audio {

    init(player) {
        this.bassTimeline = [];
        this.kickTimeline = [];
        this.midTimeline = [];
        this.highTimeline = [];
        this.volumeTimeline = [];

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
        this.freqMax = this.sampleRate / 2;
        this.freqBinStep = this.freqMax / this.bufferLength;
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
        this.freq[0] = 0; //DC offset

        let bass = [],
            kick = [],
            mid = [],
            high = [];
        for(let i = 0; i < this.bufferLength; i++) {
            let freq = this.freqBinStep * i;

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
        let addToTimeline = (timeline, val) => {
            timeline.unshift(val);
            if (timeline.length > 3000) {
                timeline.pop();
            }
        }
        let addAverageToTimeline = (timeline, array) => {
            let sum = array.reduce(function(a, b) { return a + b; });
            let average =  sum / array.length;
            addToTimeline(timeline, average);
        }
        addAverageToTimeline(this.bassTimeline, bass);
        addAverageToTimeline(this.kickTimeline, kick);
        addAverageToTimeline(this.midTimeline, mid);
        addAverageToTimeline(this.highTimeline, high);
        let index = 1;
        let currentVolume = (this.bassTimeline[index] + this.kickTimeline[index]) / 2
                            + this.midTimeline[index] * 0.5
                            + this.highTimeline[index] * 1.5;
        currentVolume /= 2
        addToTimeline(this.volumeTimeline, currentVolume);
    }
}


function rgb2hsv () {
    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}


