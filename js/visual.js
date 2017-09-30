function visualInit() {
    let canvas = document.getElementById('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = 400;
    ctx = canvas.getContext('2d');
    window.requestAnimationFrame(drawFFT);
}

function drawFFT() {
    ctx.clearRect(0, 0, window.innerWidth, 300);
    padding = 40;
    ctx.fillStyle = 'black';
    ctx.font = '11px monospace';
    audio.detectBeat();

    let width = audio.bufferLength;
    let xMin = audio.sampleRate / audio.bufferLength;
    let xMax = audio.sampleRate / 2;
    let xRatio = xMax / xMin;
    let xStep = (xMax-xMin) / width;


    toLog = (i) => {
        return (xMax * Math.log(i) / (Math.log(10) * audio.bufferLength) ) + xMin;
    }

    xPos = (i) => {
        return xMin * toLog(i) - xMin * toLog(1) + padding;
    }

    drawFreqText = (freq) => {
        let offset = freq / xStep;
        let x = xPos(offset -1)
        let text = Math.round(freq);
        let metrics = ctx.measureText(text);
        ctx.fillRect(x, 280, 1, 5);
        ctx.fillText(text, x - (metrics.width / 2) , 300);
    }

    for(var i = 1; i < audio.bufferLength; i++) {
        ctx.fillRect(xPos(i), 280, 1, -audio.freq[i-1]);
    }


    for (var i=12; i >= 0; i--) {
        let freq = xMin * Math.pow(10, i/4);
        drawFreqText(freq);
    }

    drawFreqText(xMin);

    window.requestAnimationFrame(drawFFT);
}

var ctx;
var audio = new Audio();
var player = document.getElementById('player');
try {
    audio.init(player);
    audio.load("https://onde.xyz/pbb");
    visualInit();
} catch (e) {
    console.log(e)
    alert("error");
}
