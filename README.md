snap-ev3dev
===========
A [Snap!](http://snap.berkeley.edu/) server and associated control blocks for [ev3dev](http://www.ev3dev.org/), written in JavaScript/Node.JS.

**NOTE:** This is just a test ATM, so functionality may not go past the proof-of-concept.

Running the server
---
To run the server, make sure that you have git installed on your brick (which must be running ev3dev) and clone down the repo:
```
root@ev3dev:~# sudo apt-get install git
root@ev3dev:~# git clone --recursive https://github.com/WasabiFan/snap-ev3dev.git
```
Then `cd` in to the folder and run the server with node:
```
root@ev3dev:~# cd snap-ev3dev
root@ev3dev:~# nodejs snap-server.js
```
You should now be able to access the Snap! environment by navigating to your EV3's IP address in your browser.

Using the ev3 functions in the web interface
---
Although I don't think I need to explain how the overall drag-and-drop experience works to anyone who's cloning this right now, I would like to highlight the important changes that I have made to the Snap! environment for this project.

To access the ev3dev control blocks (currently only one), open the web interface and click on "file (the paper icon) -> Libraries". In the box that appears, select "ev3dev control functions" to load the module. Now, you should find a new block under "sensing" for reading sensor values.

ev3dev.js
---
`ev3dev.js` is a built development version of the JS binding from [the official ev3dev language binding repo](https://github.com/ev3dev/ev3dev-lang/). Once the changes to the binding have been released to NPM, the dependency here can be shifted to the published module instead of using this separate file.
