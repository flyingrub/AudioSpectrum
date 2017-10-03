window.addEventListener('drop', (e) => {
    e.preventDefault();
    var files = e.dataTransfer.files
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        audio.loadFromLocal(file);
    }
}, false)

window.addEventListener('dragover', (e) => {
    e.preventDefault();
}, false)

window.onresize = (ev) => {
    canvas.width  = window.innerWidth;
}

var ctx;
var audio = new Audio();
let canvas = document.getElementById('canvas');
var player = document.getElementById('player');
try {
    audio.init(player);
    audio.load("https://onde.xyz/pbb");
    visualInit();
} catch (e) {
    console.log(e)
    alert("error");
}
