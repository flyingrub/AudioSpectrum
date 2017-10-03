let HEIGHT = 400;
let MARGIN_TOP = 280;

function visualInit() {
    canvas.width  = window.innerWidth;
    canvas.height = HEIGHT;
    ctx = canvas.getContext('2d');
    window.requestAnimationFrame(drawFFT);
}

function drawFFT() {
    ctx.clearRect(0, 0, window.innerWidth, HEIGHT);
    let margin = 40;
    ctx.fillStyle = 'white';
    ctx.font = '11px monospace';
    audio.detectBeat();

    let freqMin = audio.sampleRate / audio.bufferLength;
    let freqMax = audio.sampleRate / 2;
    let freqBinStep = (freqMax-freqMin) / audio.bufferLength;

    toLog = (i) => {
        return (freqMax * Math.log(i) / (Math.log(10) * audio.bufferLength)) + freqMin;
    }

    xPos = (i) => {
        return freqMin * toLog(i) - freqMin * toLog(1);
    }

    let xMin = margin;
    let xMax = window.innerWidth - margin;

    let xRatio = (xMax - xMin) / xPos(audio.bufferLength);

    xPosWithRatio = (i) => {
        return xPos(i) * xRatio - xPos(1) * xRatio + xMin;
    }

    xFromFreq = (freq) => {
        let offset = freq / freqBinStep;
        let x = xPosWithRatio(offset -1);
        return x;
    }

    drawFreqText = (freq) => {
        let x = xFromFreq(freq);
        let text = Math.round(freq);
        let metrics = ctx.measureText(text);
        ctx.fillRect(x, MARGIN_TOP, 1, 5);
        ctx.fillText(text, x - (metrics.width / 2) , 300);
    }

    lineYFromIndex = (i) => {
        return MARGIN_TOP -audio.freq[i-1];
    }

    for(let i = 1; i < audio.bufferLength; i++) {
       //ctx.fillRect(xPosWithRatio(i), MARGIN_TOP, 1, -audio.freq[i-1]);
    }

    for (let i = 1; i<4; i++) {
        for (let j = 1; j < 10; j++) {
            if (i == 1 && j == 2) {
                continue; // Skip the first 20hz
            }
            let freq = j * Math.pow(10, i);
            let x = xFromFreq(freq);
            ctx.fillRect(x, MARGIN_TOP, 1, 5);
            if (j == 1 || j == 5 || j == 2) {
                drawFreqText(freq);
            }
        }
    }

    ctx.beginPath();
    let firstX = xPosWithRatio(1);
    ctx.moveTo(firstX, MARGIN_TOP);
    ctx.lineTo(firstX, lineYFromIndex(1));
    for (let i = 2; i < audio.bufferLength - 2; i++) {
        let x = xPosWithRatio(i);
        let y = lineYFromIndex(i);
        let xc = (x + xPosWithRatio(i + 1)) / 2;
        let yc = (y + lineYFromIndex(i+1)) / 2;
        ctx.quadraticCurveTo(x, y, xc, yc);
    }
    ctx.lineTo(xPosWithRatio(audio.bufferLength - 1), MARGIN_TOP);
    ctx.lineTo(firstX, MARGIN_TOP);
    ctx.fill();

    drawFreqText(freqMin);
    drawFreqText(freqMax);

    window.requestAnimationFrame(drawFFT);
}
