# raspi-mocp-web
A web frontend for mocp on raspberry pi implemented in Node.js.

## Requirements
It should work on any system that has the following software installed:

 * node.js (v 0.10.29)
 * [MOCP](http://moc.daper.net/)
 
Depending on your system, `package-manager install nodejs mocp` should be enough, e.g.

``` bash
sudo apt install nodejs mocp
```

## Usage
Switch to the project directory and run

```bash
nodejs ./server.js
```

Afterwards, head over to your browser and visit http://localhost:8081. The default port can be changed in the server.js file.
