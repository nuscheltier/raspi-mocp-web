var fs = require('fs');

var playlistFunctions = {
    playlist: [],
    directoryMp3: "",
    directoryPlaylist: "",
    addMp3: function(filename) { //The filename needs to be /a/b/c/d.mp3
        var place = filename.split("/", filename.split("/").length - 1);
            place.shift();
            place = place.join("/");
        var entry = {
            name: filename,
            place: place
        }
        this.playlist.push(entry);
    },
    delMp3: function(id) {
        playlist.splice(id, 1);
    },
    loadPlaylist: function(filename, callback) {
    },
    savePlaylist: function(filename, directory, callback) {
        //directory = directory || this.directoryPlaylist;
        if(typeof directory === 'function') { callback = directory; }
        directory = typeof directory !== 'function'
            ? directory || this.directoryPlaylist
            : this.directoryPlaylist;
    },
    showMp3Directory: function(directory, callback) {
        console.log(directory);
        if(typeof directory === 'function') { callback = directory; }
        directory = typeof directory !== 'function'
            ? directory || this.directoryMp3
            : this.directoryMp3;
        fs.readdir(directory, function(err, files) {
            files = files.map(function(x) { return directory + "/" + x; });
            callback(err, files);
        });
    },
    changeMp3Directory: function(folder, directory) {
        directory = directory || this.directoryMp3;
        return directory + "/" + folder;
    },
    /*isDirectory: function(filehandle, callback) {
        fs.stat(filehandle, function(err, stats) {
            var is = stats.isDirectory ? 1 : stats.isFile ? 2 : 0; // 1 - Directory, 2 - File, 0 - nothing
            callback(is);
        });
    }*/
    isDirectory: function(filehandle) {
        var stat = fs.statSync(filehandle);
        return stat.isDirectory() ? 1 : stat.isFile() ? 2 : 0;
    },
    m3uToJson: function(filename, callback) { //perhaps we shouldn't show the user the filehandle? TODO
        fs.readFile(filename, function(err, data) {
            /*var playlistData = data.split("\r\n");
            playlistData.shift();
            console.log(playlistData);*/
            data = data.toString();
            var playlistData = data.split("\r\n");
            playlistData.shift();
            if(playlistData[playlistData.length - 1] === '') {playlistData.pop();}
            var playlistDataObject = {};
            for(var i = 0; i < playlistData.length; i++) {
                if(i % 2 === 0) {
                    playlistDataObject[i / 2 >> 0] = {
                        name: playlistData[i].split(",")[1],
                        file: playlistData[i+1]
                    };
                }
            }
            callback(playlistDataObject);
        });
    },
    jsonToM3u: function(playlist, filename, callback) {
        var data = '#EXTM3U\r\n',
            keys = Object.keys(playlist);
        console.log(playlist);
        for(var i = 0; i < keys.length; i++) {
            data += '#EXTINF:0,' + playlist[keys[i]].filename + '\r\n';
            data += this.directoryMp3 + playlist[keys[i]].fileplace + '\r\n';
        }
        fs.writeFile(this.directoryPlaylist + '/' + filename, data, function(err) {
            callback(err);
        });
    }
};

module.exports = playlistFunctions;
