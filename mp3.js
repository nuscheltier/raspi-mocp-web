window.onload = function() {
    var prev = document.getElementById('previous'),
        play = document.getElementById('play'),
        nowplay = document.getElementById('nowplaying'),
        pause = document.getElementById('pause'),
        forward = document.getElementById('forward'),
        shuffle = document.getElementById('shuffle'),
        repeat = document.getElementById('repeat'),
        serverstart = document.getElementById('serverstart'),
        serverstop = document.getElementById('serverstop'),
        serverstatus = document.getElementById('serverstatus'),
        serverrunning = false,
        refreshInfo;

    getJson('./index', function(text) {
        if(typeof text.artist !== 'undefined') { //server is already running
            serverrunning = serverStatus(serverrunning, true);
            refreshInfo = setInterval(function() {
                getJson('./index', function(text) {
                    updatePlayInfo(text, nowplay);
                });
            }, 5000);
            updatePlayInfo(text, nowplay);
        }
    });

    play.onclick = function() {
        console.log(serverrunning);
        if(serverrunning) {
            getJson('./play', function(text) {
            });
            setTimeout(function() {
                getJson('./index', function(text) {
                    updatePlayInfo(text, nowplay);
                });
            }, 1000);
        }
    };
    prev.onclick = function() {
        if(serverrunning) {
            getJson('./previous', function(text) {
            });
            setTimeout(function() {
                getJson('./index', function(text) {
                    updatePlayInfo(text, nowplay);
                });
            }, 500);
        }
    };
    pause.onclick = function() {
        if(serverrunning) {
            getJson('./pause', function(text) {
            });
        }
    };
    forward.onclick = function() {
        if(serverrunning) {
            getJson('./next', function(text) {
            });
            setTimeout(function() {
                getJson('./index', function(text) {
                    updatePlayInfo(text, nowplay);
                });
            }, 500);
        }
    };
    shuffle.onclick = function() {
        if(serverrunning) {
            getJson('./shuffle', function(text) {
            });
        }
    };
    repeat.onclick = function() {
        if(serverrunning) {
            getJson('./repeat', function(text) {
            });
        }
    };
    serverstop.onclick = function() {
        if(serverrunning) {
            getJson('./serverstop', function(text) {
                serverrunning = serverStatus(serverrunning, true);
            });
            clearInterval(refreshInfo);
        }
    };
    serverstart.onclick = function() {
        if(!serverrunning) {
            getJson('./serverstart', function(text) {
                serverrunning = serverStatus(serverrunning, true);
            });
            refreshInfo = setInterval(function() {
                getJson('./index', function(text) {
                    updatePlayInfo(text, nowplay);
                });
            }, 5000);
        }
    };
};

function getJson(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            var text = '';
            if(xhr.responseText !== '') {
                text = JSON.parse(xhr.responseText);
            }
            callback(text);
        }
    };
    xhr.send(null);
}

function serverStatus(server, toggle) {
    toggle = toggle || false;
    serverstatus.innerHTML = '';
    if(toggle) { server = server ? false : true; }
    serverstatus.innerHTML = server ? 'running' : 'not working';
    return server;
}

function updatePlayInfo(id3object, nowplay) {
    if(typeof id3object.artist !== 'undefined') {
        nowplay.innerHTML = '';
        nowplay.innerHTML = id3object.artist + ' - ' + id3object.title + ' ' + id3object.current + '/' + id3object.totaltime;
    }
}