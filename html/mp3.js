window.onload = function() {
    var prev = document.getElementById('previous'),
        play = document.getElementById('play'),
        nowplay = document.getElementById('nowplaying'),
        pause = document.getElementById('pause'),
        forward = document.getElementById('forward'),
        shuffle = document.getElementById('shuffle'),
        repeat = document.getElementById('repeat'),
        //server
        serverstart = document.getElementById('serverstart'),
        serverstop = document.getElementById('serverstop'),
        serverstatus = document.getElementById('serverstatus'),
        //playlist
        playlistButton = document.getElementById('playlistButton'),
        playlistAdd = document.getElementById('playlistAdd'),
        playlist = document.getElementById('playlist'),
        addToPlaylist = document.getElementById('addToPlaylist'),
        savePlaylist = document.getElementById('savePlaylist'),
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
    playlistButton.onclick = function() {
        getJson('./mp3', function(text) {
            //console.log(text);
            getMp3(text);
        });
    };
    addToPlaylist.onclick = function() {
        var keys = Object.keys(tempPlaylist);
            keys.sort();
        if(keys.length > 0) {
            for(var i = 0; i < keys.length; i++) {
                var div = document.createElement('div'),
                    spanName = document.createElement('span'),
                    spanCheckbox = document.createElement('span');
                
                spanName.appendChild(document.createTextNode(tempPlaylist[keys[i]].filename));
                spanCheckbox.setAttribute('name', keys[i]);
                spanCheckbox.setAttribute('checked', true);

                div.appendChild(spanCheckbox);
                div.appendChild(spanName);

                playlist.appendChild(div);
            }
        }
    };
    savePlaylist.onclick = function() {
        postJson('./playlist', tempPlaylist);
    };
};

var tempPlaylist = {};

function getMp3(filelist, folder) {
    folder = folder || '';
    for(var i = 0; i < filelist.length; i++) {
        //making a new div
        if(document.getElementById(filelist[i])) { continue; }
        var div = document.createElement('div');
        div.setAttribute('id', folder + filelist[i]);
        div.innerHTML = filelist[i];
        if(!filelist[i].endsWith('.mp3')) {
            div.onclick = function(event) {
                //we have divs with click events on divs with click events. We don't want both of them to fire simultaneously
                event.stopPropagation();
                var id = this.getAttribute('id'),
                    clName = this.className;

                if(clName.split(' ').indexOf('opened') !== -1){
                    this.innerHTML = this.childNodes[0].textContent;
                    clName = clName.split(' ');
                    clName.splice(clName.indexOf('opened'), 1);
                    clName = clName.join(' ');
                    this.setAttribute('class', clName);
                } else {
                    this.setAttribute('class', this.className + 'opened ');
                    getJson('./mp3' + id, function(text) {
                        getMp3(text, id);
                    });
                }
            };
        } else if(filelist[i].endsWith('.mp3')) {
            div.onclick = function(event) { event.stopPropagation(); };

            var input = document.createElement('input');
            input.setAttribute('type', 'checkbox');
            input.innerHTML = div.innerHTML;
            input.setAttribute('name', filelist[i]);
            input.onchange = function(event) {
                var folder = this.parentNode.parentNode.parentNode.getAttribute('id'), //WARNING: If you change the mark up of the HTML, please be aware of this!
                    file = this.getAttribute('name');
                if(Object.keys(tempPlaylist).indexOf(folder + file) === -1) {
                    tempPlaylist[folder + file] = {
                        filename: file,
                        fileplace: folder + file //should be redundant
                    }
                } else {
                    delete tempPlaylist[folder + file];
                }
            };

            var span = document.createElement('span');
            span.appendChild(input);

            div.insertBefore(span, div.childNodes[0]);
        }
        if(!folder) {
            playlistAdd.appendChild(div);
        } else {
            document.getElementById(folder).appendChild(div);
        }
    }
}

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

function postJson(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    //TODO: Errorhandling - onreadystatechange
    xhr.send(JSON.stringify(data));
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