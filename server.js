var http = require('http'),
    child = require('child_process'),
    url = require('url'),
    fs = require('fs'),
    exec = require('child_process').exec;

http.createServer(function(request, response){
    var uri = url.parse(request.url);
    switch(request.method) {
        case "GET":
        switch(uri.pathname) {
            case "/index":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('index', function(data) {
                    response.end(JSON.stringify(data));
                });
            break;
            case "/play":
                response.writeHead(200, {'content-type': 'application/json'});
                response.end('');
                ctrlServer('play');
            case "/next":
                response.writeHead(200, {'content-type': 'application/json'});
                response.end('');
                ctrlServer('next');
            break;
            case "/previous":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('previous');
                response.end('');
            break;
            case "/pause":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('pause');
                response.end('');
            break;
            case "/shuffle":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('shuffle');
                response.end('');
            break;
            case "/repeat":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('repeat');
                response.end('');
            break;
            case "/serverstart":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('serverstart');
                response.end('');
            break;
            case "/serverstop":
                response.writeHead(200, {'content-type': 'application/json'});
                ctrlServer('serverstop');
                response.end('');
            break;
            case "/mp3.js":
                var file = fs.createReadStream(__dirname + "/mp3.js");
                file.pipe(response);
            break;
            default:
                var file = fs.createReadStream(__dirname + "/index.html");
                file.pipe(response);
            break;
        }
        break;
        case "POST":
        break;
        default:
        break;
    }
}).listen(8081);

function ctrlServer(action, callback) {
    var response = "",
        mocpresp = {},
        action = action || "index",
        callback = callback || '';
    
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