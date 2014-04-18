TCEC Kibitzer
=============

If you're a fun of computer chess tournaments like me, then you've probably
heard of **TCEC** or **T** horesen **C** hess **E** ngines **C** ompetition which is a live chess
tournament organized and maintained by Martin Thoresen in cooperation with
Chessdom Arena.
Check out the [TCEC Live Website](http://tcec.chessdom.com/live.php) here.

**TCEC Kibitzer** is a set of tools that can be used to help you analyze the current
chess game running at TCEC in realtime using your own computer running a
UCI chess engine in the background. The analysis is then displayed directly on the
TCEC live page website.

###OVERVIEW
The whole setup involves:

1. A google-chrome extension.
2. A web service running in the background. (Using Python/Flask)
3. Of course your UCI Chess engine.