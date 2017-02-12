var http = require('http'),
    child = require('child_process'),
    url = require('url'),
    fs = require('fs'),
    exec = require('child_process').exec,
    serverconfig = require('./config.json'),
    playlist = require('./playlist.js'),
    playlists = [];

    playlist.directoryPlaylist = serverconfig.directoryPlaylist,
    playlist.directoryMp3 = serverconfig.directoryMp3;

    var playlistsArray = fs.readdirSync(playlist.directoryPlaylist);
    for(var i = 0; i < playlistsArray.length; i++) {
        playlists.push({
            name: playlistsArray[i].split(".")[0],
            file: playlist.directoryPlaylist + "/" + playlistsArray[i]
        });
    }

    var urlEscapeCharacters = {
        "%20": ' ',
        "%26": '&',
        "%3C": '<',
        "%3E": '>',
        "%22": '"',
        "%23": '#',
        "%24": '$',
        "%25": '%',
        "%27": "'",
        "%2B": '+',
        "%2C": ',',
        //"%2F": '/', for perfection's sake
        "%3A": ':',
        "%3B": ';',
        "%3D": '=',
        "%3F": '?',
        "%40": '@',
        "%5B": '[',
        "%5C": '\\',
        "%5D": ']',
        "%5E": '^',
        "%60": '`',
        "%7B": '{',
        "%7C": '|',
        "%7D": '}',
        "%7E": '~'
    }

http.createServer(function(request, response){
    var uri = url.parse(request.url);
        uri = uri.pathname.split("/");
        uri.shift();

    switch(request.method) {
        case "GET":
        switch(uri[0]) {
            case "index":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('index', function(data) {
                    response.end(JSON.stringify(data));
                });
            break;
            case "playlist":
                response.writeHead(200, {'content-type': 'application/json'});
                if(uri.length === 1) { // /playlist
                    /*fs.readdir(playlist.directoryPlaylist, function(err, file) { // we don't necesserily need the full path for the playlists; it could very well just be a unique identifier and a name so that the server can recognizie and load the specified playlist
                        var returnArray = [];
                        for(var i = 0; i < file.length; i++) {
                            file[i] = playlist.directoryPlaylist + "/" + file[i];
                            if(playlist.isDirectory(file[i]) === 2) {
                                returnArray.push(file[i]);
                            }
                        }
                        response.end(JSON.stringify(returnArray));
                    });*/
                    var returnArray = [];
                    for (var i = 0; i < playlists.length; i++) {
                        returnArray.push({
                            id: i,
                            name: playlists[i].name
                        });
                    }
                    response.end(JSON.stringify(returnArray));
                } else { // /playlist/<id>
                    var id = uri[1];
                    playlist.m3uToJson(playlists[id].file, function(data) {
                        /*var helper = [];
                        for(var i = 0; i < data.length; i++) {
                            helper.push({data[i].name});
                            response.write(JSON.stringify(helper));
                        }*/
                        response.end(JSON.stringify(data));
                    })
                }
            break;
            /*
                This case could be transformed into a simple one:
                The Server itself loads all mp3s into a Array or Object and just sends one JSON message to the Client.
                This way the communication between the Server and Client would be reduced to a minimum (especially if the Client wants to add all mp3) and
                the latency regarding seeing all mp3s would be reduced since it would be only one transaction.
            */
            case "mp3": //mp3 - Directory
                response.writeHead(200, {'content-type': 'application/json'});
                //TODO: Simplify
                if(uri.length < 2) { // /mp3
                    playlist.showMp3Directory(serverconfig.directoryMp3, function(error, files) {
                        if(error) { console.log(error); }
                        response.end(JSON.stringify(files.map(function(x) {return x.split(serverconfig.directoryMp3)[1];})));
                    });
                } else { // /mp3/just/another/folder
                    var directory = uri;
                        directory.shift();
                    
                    directory = directory.join('/');
                    var uEC_keys = Object.keys(urlEscapeCharacters);
                    for(var i = 0; i < uEC_keys.length; i++) { // Escape Characters from the URL and find them on the Pi
                        directory = directory.replace(new RegExp(uEC_keys[i], 'gi'), urlEscapeCharacters[uEC_keys[i]]);
                    }

                    playlist.showMp3Directory(serverconfig.directoryMp3 + '/' + directory, function(error, files) {
                        if(error) {console.log(error); }
                        response.end(JSON.stringify(files.map(function(x) {return x.split(serverconfig.directoryMp3 + '/' + directory)[1]})));
                    });
                }
            break;
            case "play":
                // /play
                response.writeHead(200, {'content-type': 'application/json'});
                response.end('');
                if(uri.length < 2) {
                    ctrlServer('play');
                } else { // /play/<id>
                    ctrlServer('queue', '/opt/mp3/Diverse/test.mp3');
                }
            case "next":
                response.writeHead(200, {'content-type': 'application/json'});
                response.end('');
                ctrlServer('next');
            break;
            case "previous":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('previous');
                response.end('');
            break;
            case "pause":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('pause');
                response.end('');
            break;
            case "shuffle":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('shuffle');
                response.end('');
            break;
            case "repeat":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('repeat');
                response.end('');
            break;
            case "serverstart":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('serverstart');
                response.end('');
            break;
            case "serverstop":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('serverstop');
                response.end('');
            break;
            /*case "mp3.js":
                var file = fs.createReadStream(__dirname + "/mp3.js");
                file.pipe(response);
            break;*/
            default:
                var file = htmlFile(uri[0]);
                file.pipe(response);
            break;
        }
        break;
        case "POST":
            switch(uri[0]) {
                case "playlist":
                    var playlistName = '',
                        body = '';
                    if(uri.length === 1) { // /playlist
                        playlistName = 'default.m3u';
                    } else {
                        playlistName = uri[1] + '.m3u';
                    }
                    //playlist.jsonToM3u()
                    request.on('data', function(chunk) {
                        body += chunk;
                    });
                    request.on('end', function() {
                        //console.log(body);
                        playlist.jsonToM3u(JSON.parse(body), playlistName, function(err) {});
                    });
                break;
                default:
                break;
            }
        break;
        case "DELETE":
        break;
        default:
        break;
    }
}).listen(serverconfig.serverPort);

function htmlFile(name) {
    name = name || 'index.html';
    return fs.existsSync(__dirname + "/html/" + name)
        ? fs.createReadStream(__dirname + "/html/" + name)
        : fs.createReadStream(__dirname + "/html/index.html")
}

function ctrlServer(action, callback, file) {
    var response = "",
        mocpresp = {},
        action = action || "index",
        //callback = callback || '';
        callback,
        file = file || '';
        if(typeof callback !== 'function') { file = callback; callback = '' } else { callback = callback; } //should also work as ? :
    
    switch(action) {
        case "index":
            var child = exec('mocp -i', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
                callback(mocpTranslate(stdout));
            });
        break;
        case "play":
            var child = exec('mocp -p', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
            });
        break;
        case "queue":
            var child = exec('mocp -f', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
                var child2 = exec('mocp -q ' + file, function(error, stdout, stderr) {
                    if(error !== null) {
                        console.log(error);
                    }
                });
            });
        break;
        case "next":
            var child = exec('mocp -f', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
            });
        break;
        case "previous":
            var child = exec('mocp -r', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
            });
        break;
        case "pause":
            var child = exec('mocp -G', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
            });
        break;
        case "shuffle":
            var child = exec('mocp -t shuffle', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
            });
        break;
        case "repeat":
            var child = exec('mocp -t repeat', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
            });
        break;
        case "serverstart":
            var child = exec('mocp -S', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
            });
        break;
        case "serverstop":
            var child = exec('mocp -x', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log(error);
                }
            });
        break;
        default:
        break;
    }
}

function mocpTranslate(buffer) {
    var text = buffer.toString(),
        resp = {};

    var textArr = text.split('\n');
    for(var i = 0; i < textArr.length; i++) {
        if(textArr[i].indexOf('SongTitle:') === 0) {
            resp.title = textArr[i].split(":")[1].trim();
            if(resp.title === '') { resp.title = "?"; }
        } else if (textArr[i].indexOf('TotalTime:') === 0) {
            var helpArr = textArr[i].split(":");
            helpArr.shift();
            helpArr = helpArr.join(":");
            resp.totaltime = helpArr.trim();
        } else if (textArr[i].indexOf('Artist:') === 0) {
            resp.artist = textArr[i].split(":")[1].trim();
            if(resp.artist === '') { resp.artist = "?"; }
        } else if (textArr[i].indexOf('CurrentTime:') === 0) {
            var helpArr = textArr[i].split(":");
            helpArr.shift();
            helpArr = helpArr.join(":");
            resp.current = helpArr.trim(); 
        }
    }
    //console.log(resp);
    return resp;
}
