##TCEC KIBITZER CHROME EXTENSION

Intro
-----

**This Google Chrome extension** is used to display information from your UCI chess engine. It displays information such as depth, seldepth, Principle variation etc.

Installation
------------

1. Clone/[Download](https://github.com/nssy/tcec-kibitzer/archive/master.zip) this repository into your machine.
2. To Install,
  - Open Google Chrome web browser and browse to the url [chrome://extensions](chrome://extensions)
  - Make sure you enable developer mode in Google Chrome [chrome://extensions](chrome://extensions).
  _This will now allow you to Load unpacked extension._
  - Then click on Load unpacked extension button and browse to the sub-folder Chrome of tcec-kibitzer
   _(Its in this repo that you've just downloaded)_.
  - You should now see a freshly installed Chrome extension called **TCEC Kibitzer**

Configure Chrome Extension
--------------------------

__Note:__ For most cases you will not need to do any extra configuration.

If for some reason your Web Service API is running on a different Machine (host),

Browse to the folder Chrome where you downloaded tcec-kibitzer...

Change the following settings in __Chrome/tcec-kibitzer.js__ file to suite your needs. (_With your favourite text editor of course_)
```javascript
// Web Service URL
var ws_url = 'http://localhost:2035';

// Distance in time (milliseconds)
// For fetching engine output from the Web Service API
// Its not recommeded to set this lower than 500
var interval = 1000;

```
Where localhost can be the ip address of your Web Service API and 2035 is the port.

_Ignore lines beginning with // sign (Comments)_

Usage
-----

If all went well, you can navigate to [TCEC Live Website](http://tcec.chessdom.com/live.php) .
 You will now see a new transparent window at the right bottom side of the page labelled TCEC Kibitzer.

Click on the blue start button to start analysis with the default engine. (Assuming [Web Service API](https://github.com/nssy/tcec-kibitzer/blob/master/Api/README.md) is up and running.)

__Note:__ Default engine is configured on the Web Service API side.

Once started, you will be able to choose any configured engine on the Web service API to analyze the current position on the board.
(A dropdown with the configured engines will appear at the to right corner).

__Quick Hint:__ Click on the title __TCEC Kibitzer__ to switch between minimalistic and full view.

