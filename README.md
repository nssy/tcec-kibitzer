TCEC Kibitzer
=============

If you're a fun of computer chess tournaments like me, then you've probably
heard of **TCEC** or __T__ horesen __C__ hess __E__ ngines __C__ ompetition which is a live chess
tournament organized and maintained by Martin Thoresen in cooperation with
Chessdom Arena.
Check out the [TCEC Live Website](http://tcec.chessdom.com/live.php) here.

**TCEC Kibitzer** is a set of tools that can be used to help you analyze the current
chess game running at TCEC in realtime using your own computer running a
UCI chess engine in the background. The analysis is then displayed on a semitransparent window directly on the
TCEC live page website.

OVERVIEW
--------

The whole setup involves:

1. A google-chrome extension.
2. A web service running in the background. (Using Python/Flask)
3. Of course your UCI Chess engine.

HOW IT WORKS
------------

1. **The Google Chrome extension** is used to directly display information from your UCI chess engine. It displays information such as depth, seldepth, Principle variation etc.

2. **The Web Service** (written in Python) is used to send and receive information
  between our google-chrome extension and our loaded UCI chess engine through a http port running on your computer (127.0.0.1:2035)
  Its possible to run web service from a remote machine host. (But this has not been tested)

3. **The UCI chess engine** will of course do the hard work of analysing the chess positions it gets from the live web page (through the Web Service).
  The information will then be sent back to the browser extension.

REQUIREMENTS
------------

  - Windows, Mac or Linux Box
  - Python & Flask (python Module)
  - Google Chrome web browser. (_Currently the only supported Web browser_)

INSTALLATION
------------

1. Clone or [download](https://github.com/nssy/tcec-kibitzer/archive/master.zip) this repository into your machine.
2. Install the Google Chrome extension.
   - You will need to open Google Chrome web browser and browse to the url chrome://extensions [chrome://extensions](chrome://extensions)
   - Make sure you enable __developer mode__ in Google Chrome [Chrome extensions settings](chrome://extensions). _This will now allow you to Load unpacked extension._
   - Then click on Load unpacked extension button and browse to the sub-folder Chrome of tcec-kibitzer
   _(Its in this repo that you've just downloaded)_.
   - You should now see a freshly installed Chrome extension called **TCEC Kibitzer**
3. Install Python and Flask. (_Preferably python version 2.7 or above_).
   - On linux, python is probably available from your distribution's package manager.
   - For Windows & Mac, check out [This Link](https://www.python.org/download/) to get started.

   In addition to Python, you will need to install [Flask](http://flask.pocoo.org/) which is the microframework for Python that we will use for the Web Service.
   If Python is correctly installed, you can add its location to your enviroment path,
   then you can install Flask from terminal/cmd with the command:

```sh
 pip install Flask
```

USAGE
-----

Once you have the above 3 requirements installed, [Configure your Engines](https://github.com/nssy/tcec-kibitzer/blob/master/Api/README.md)
then start the Web Service which by default will run on localhost port 2035

  - open terminal window in the api folder path
  - running the command

_Assuming python is in your environment path_
```sh
python api.py
```

With your google chrome browser, navigate to [TCEC Live Website](http://tcec.chessdom.com/live.php)

If all went well, you will see a new semitransparent window at the bottom right side of the page. Here you will be able to choose your configured engine to
analyze the current position on the board.

__Quick Hint:__ Click on the title __TCEC Kibitzer__ to switch between minimalistic and full view.

DOCUMENTATION
-------------

* [API Docs]
* [Browser addon Docs]

[API Docs]: https://github.com/nssy/tcec-kibitzer/blob/master/Api/README.md
[Browser addon Docs]: https://github.com/nssy/tcec-kibitzer/blob/master/Chrome/README.md

####Issues

Discovered a bug? Please create an issue [here](https://github.com/nssy/tcec-kibitzer/issues) on GitHub!

TERMS OF USE
------------

Use as you please. **TCEC Kibitzer** is not affiliated with [TCEC](http://tcec.chessdom.com) in any way.

CREDITS
-------

The API makes use of [ChessBoard.py](http://arainyday.se/projects/python/ChessBoard/) by [John Eriksson](http://arainyday.se/)

LICENSE
-------

TCEC KIBITZER is free, and distributed under the GNU General Public License **(GPLv3)**.

Checkout [LICENSE.txt](https://github.com/nssy/tcec-kibitzer/blob/master/LICENSE.txt)
