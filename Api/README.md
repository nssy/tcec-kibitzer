##TCEC KIBITZER API
Intro
-----

The API consists of 3 python files and an engine configuration file.
By default the API runs on [http://127.0.0.1:2035](http://127.0.0.1:2035) and uses __JSON__ to communicate.

It is used to send and receive information between the Browser extension and your loaded UCI chess engine.

Installation
------------

1. Clone/[Download](https://github.com/nssy/tcec-kibitzer/archive/master.zip) this repository into your machine.

2. Install Python and Flask. _(Preferably python version 2.7 or above)_.

  - On linux, python is probably available from your distribution's package manager.
  - For Windows & Mac, check out [This Link](https://www.python.org/download/) to get started.

  In addition to Python, you will need to install [Flask](http://flask.pocoo.org/) which is the microframework for Python that is used here for the Web Service.
  After Python is correctly installed, you can add its location to your enviroment path,
  then you can install Flask from terminal/cmd with the command:

```sh
  pip install Flask
```

 - If python is not in your environment path, you can still install Flask.
 Example for Windows with Python 3.4

```
  C:\Python34\Scripts\pip.exe install Flask
```

API Service Configuration
-------------------------

Browse to the Api folder of tcec-kibitzer

Change the following settings in __api.py__ file to suite your needs
(_open 'with your favourite text editor of course' and start somewhere on line 15_)
```python
# Change to 0.0.0.0 to listen on all network interfaces (insecure)
host = '127.0.0.1'

# This is the port that the API Service will listen on
port = 2035

# Default engine to start with in engines.json file
engine_no = 0
```
_Ignore lines beginning with # sign (Comments)_

__Note:__

 - For most cases you will not need to change the host and port settings.
 - You will however need to configure your engines correctly as shown below.

Engines Configuration
---------------------

__Note:__
When changing __engine_no__ in the Above file __api.py__, first engine starts with 0

__Illustration:__
__0__ -> __first engine__
__1__ -> __second engine__

and so on.

Below is an overview of how to set the engines.
Edit the file __engines.json__ to add/configure your uci chess engines.

Here is a valid __engines.json__
```javascript
[
	{
		"name": "Stockfish DD (win)",
		"path": "engines/stockfish_DD_x64.exe",
		"uci_options": {
			"Threads": 1,
			"Hash": 256
		}
	},
	{
		"name": "Stockfish DD (linux)",
		"path": "engines/stockfish_DD_x64",
		"uci_options": {
			"Threads": 1,
			"Hash": 512
		}
	},
	{
		"name": "Komodo 5 (win)",
		"path": "engines/komodo.exe",
		"comment": "Please download this engine manually from komodo website",
		"uci_options": {
			"Threads": 1,
			"Hash": 256
		}
	},
	{
		"name": "Houdini 1.5 (win)",
		"path": "engines/houdini.exe",
		"comment": "Please download this engine manually from houdini website",
		"uci_options": {
			"Threads": 1,
			"Hash": 256
		}
	}
]
```

__Note:__ Please make sure at least the default engine has valid settings.
The default here is Stockfish DD Windows version
as indicated below.
```python
# Default engine to start with in engines.json file
engine_no = 0
```
_(This is at the top of api.py file)_

Usage
-----

__Note:__ Multiple client connections to the API Server are not supported and will result in undesirable output from the server.

To start the Web Service API

- open terminal/command shell window in the Api folder path
- run the command

_Assuming python is in your environment path:_
```sh
python api.py
```
_Otherwise you will need to specify python together with its path when calling api.py_

Example for Windows _(Where python is installed in **C:\python34** folder)_
```sh
C:\python34\python.exe api.py
```

API calls
---------

#### `GET /`

#### `GET /start` Start engine analysis

#### `GET /reset` Stop engine analysis

#### `GET /engine` Change engine

#### `GET /position` Set position to be analyzed

#### `GET /notation` Change notation type

#### `GET /output` Fetch engine output
