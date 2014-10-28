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

ev3dev.js
---
`ev3dev.js` is a built development version of the JS binding from [the official ev3dev language binding repo](https://github.com/ev3dev/ev3dev-lang/). Once the changes to the binding have been released to NPM, the dependency here can be shifted to the published module instead of using this separate file.