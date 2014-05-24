#!/usr/bin/env python
# Author: NssY Wanyonyi
# Purpose: Create a Web Service for communication with Chess engine
# Date: 11th April 2014
# Works on Windows and Linux (should work on Mac but not tested)
# Requires Flask (http://flask.pocoo.org/)

from flask import Flask, request, jsonify
import sys, json
import engine

api = Flask(__name__)

# Defaults
# Change to 0.0.0.0 to listen on all network interfaces (insecure)
host = '127.0.0.1'

# This is the port that the API Service will listen on
port = 2035

# Default engine to start with in engines.json file
engine_no = 0

message = None
status = 0

# We get engines from engines.json file
try:
  enginesConfig = open('engines.json', 'r')
  engines = json.load(enginesConfig)
  enginesConfig.close()

  if not engines[0]:
    sys.stderr.write('No engines configured in engines.json\n')
    sys.exit(1)

except:
  sys.stderr.write('Missing/Invalid engines.json\n')
  sys.exit(1)

@api.route('/')
def index():
    return api.send_static_file("index.html")

@api.route('/init')
def init():
    return jsonify(status=status,
                   message="API is up and running. Select your engine and click start",
                   engine_no=engine_no,
                   engines=engines)

@api.route('/start', methods=['GET'])
def start():
    global engine_no
    if int(request.args['engine_no']):
        engine_no = int(request.args['engine_no'])
    status, engine_no, message = engine.startEngine(engines, engine_no)

    return jsonify(status=status,
                   message=message,
                   engine_no=engine_no,
                   engines=engines)

@api.route('/reset', methods=['GET'])
def resetEngine():
    status, message = engine.stop()
    return jsonify(status=status,
                   message=message)

@api.route('/engine', methods=['GET'])
def setEngine():
    engine_no = int(request.args['engine_no'])

    # Set engine
    status, engine_no, message = engine.startEngine(engines, engine_no)

    return jsonify(status=status,
                   message=message,
                   engine_no=engine_no,
                   engines=engines)

@api.route('/position', methods=['GET'])
def setPosition():
    fen     = request.args['fen']
    source  = request.args['source']

    status, message = engine.setPosition(str(fen))
    engine.go()

    return jsonify(status=status,
                   message=message,
                   fen=str(fen),
                   source=source)

@api.route('/notation')
def setNotationType():
    movetype = engine.cycleNotationType()

    return jsonify(status=1,
                   message="Notation type is now "+str(movetype))

@api.route('/output')
def output():
    d = engine.sendOutput()
    if any(d):
        message="..."
        status=1
    else:
        message=" "
        status=0
        d = False
    return jsonify(status=status,
                   message=message,
                   data=d)

if __name__ == '__main__':
    api.run(host = host, port = port, debug = True)
