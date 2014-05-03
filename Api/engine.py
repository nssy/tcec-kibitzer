#!/usr/bin/env python
# Author: NssY Wanyonyi
# Purpose: communication with Chess engine
# Date: 11th April 2014
# Works on Windows and Linux (should work on mac but not tested)
# Requires ChessBoard (included here)
# Special thanks to John Eriksson (http://arainyday.se/projects/python/ChessBoard/)
#
import subprocess, re, atexit
from threading import Thread
from time import sleep
from ChessBoard import ChessBoard

eng = None
t = None
stopped = True
output = {}
resetOutput = True
side = '' # w for white and b for black
currFEN = ''
notation = {0:'Direct', 1:'SAN', 2:'LAN'}
notationType = 1
MultiPV = 5

cb = ChessBoard()

# Patterns to match from the engine info line
r1 = re.compile('\scp\s([\-]?\d+)')
r2 = re.compile('\smate\s([\-]?\d+)')
r3 = re.compile('\sdepth\s(\d+)')
r4 = re.compile('\sseldepth\s(\d+)')
r5 = re.compile('\scurrmove\s([\w]+)')
r6 = re.compile('\scurrmovenumber\s(\d+)')
r7 = re.compile('\snps\s(\d+)')
r8 = re.compile('\stime\s(\d+)')
r9 = re.compile('\smultipv\s(\d+)')
r10 = re.compile('\spv\s([\w\s]+)')
r11 = re.compile('(upperbound)')
r12 = re.compile('(lowerbound)')
r13 = re.compile('\stbhits\s(\d+)')

def iteritems(d):
    # Standardize dictionary iteration in both python 2 and 3
    try:
         return d.iteritems()
    except AttributeError:
         return d.items()

def movesNotation(fen, moves, type=1):
	""" Takes fen and pv moves and converts to:
    AN  = 0     # g4-e3
    SAN = 1     # Bxe3
    LAN = 2     # Bg4xe3
	"""
	# Reasons in case of failure to add move
	reasons = ['INVALID_MOVE', 'INVALID_COLOR', 'INVALID_FROM_LOCATION', 'INVALID_TO_LOCATION', 'MUST_SET_PROMOTION', 'GAME_IS_OVER', 'AMBIGUOUS_MOVE']

	formatted = ''
	m = moves.split()
	mvNo = int(fen.split()[5])

	cb.resetBoard()
	cb.setFEN(fen)

	for i in range(len(m)):
		if cb.addTextMove(m[i]):
			if (cb.getTurn()):
				formatted += str(mvNo)+'.' + str(cb.getLastTextMove(type)) + ' '
				mvNo += 1
			else:
				if i == 0:
					formatted += str(mvNo)+'...'
				formatted += str(cb.getLastTextMove(type)) + ' '
		else:
			print('ChessBoard.py failed to add ', m[i], reasons[cb.getReason()])
			return False, formatted
	return True, formatted

def go():
	global resetOutput
	resetOutput = True
	uci('go infinite')

def parseOutput():
	"""
	Reads engine output and converts to a dictionary
	"""
	global output
	global eng
	global resetOutput
	global stopped
	score = {}
	pv = {}
	bounds = {}
	fen = ''

	while True:
		if stopped:
			print('output parser stopped .....')
			sleep(1)
			continue

		if eng.poll():
			print("\nEngine stopped .....")
			break

		# Clear all pv info
		if resetOutput:
			try:
				output.clear()
				pv = {}
				bounds = {}
				score = {}
				eng.stdout.flush()
				print('- - cleared output')
				resetOutput = False

			except:
				print('Failed to clear ')

		line = eng.stdout.readline().decode().rstrip()

		# Match pattern with current engine info line
		m1 = r1.search(line)
		m2 = r2.search(line)
		m3 = r3.search(line)
		m4 = r4.search(line)
		m5 = r5.search(line)
		m6 = r6.search(line)
		m7 = r7.search(line)
		m8 = r8.search(line)
		m9 = r9.search(line)
		m10 = r10.search(line)
		m11 = r11.search(line)
		m12 = r12.search(line)
		m13 = r13.search(line)

		if m3:
			output["depth"] = int(m3.group(1))
		if m4:
			output["seldepth"] = int(m4.group(1))
		if m5:
			output["currmove"] = str(m5.group(1))
		if m6:
			output["currmoveno"] = int(m6.group(1))
		if m7:
			output["nps"] = int(m7.group(1))
		if m8:
				output["time"] = int(m8.group(1))/1000.00
		if m9:
			# MultiPV mode
			i = int(m9.group(1))
			if i <= MultiPV:
				if m10:
					pv[i] = m10.group(1)

				if m2: # Mate score found
					if int(m2.group(1)) < 0:
						if side == 'w':
							# White would show -M3 for Mate in 3
							score[i] = '-M'+str(abs(int(m2.group(1))))
						if side == 'b':
							# Black would show M3 for Mate in 3
							score[i] = 'M'+str(abs(int(m2.group(1))))
					else:
						if side == 'w':
							# White would show M3 for Mate in 3
							score[i] = 'M'+str(m2.group(1))
						if side == 'b':
							# Black would show -M3 for Mate in 3
							score[i] = '-M'+str(m2.group(1))

				else: # usual score
					if m1:
						score[i] = int(m1.group(1))/100.00
						if side == 'b':
							score[i] *= -1 # White based score
				if m11:
					bounds[i] = 1
				elif m12:
					bounds[i] = -1
				else:
					bounds[i] = 0
		else:
			# SinglePV mode
			if m10:
				pv[1] = m10.group(1)

			# TODO: Fix ugly repetition
			if m2: # Mate score found
				if int(m2.group(1)) < 0:
					if side == 'w':
						# White would show -M3 for Mate in 3
						score[1] = '-M'+str(m2.group(1))
					if side == 'b':
						# Black would show M3 for Mate in 3
						score[1] = 'M'+str(m2.group(1))
				else:
					if side == 'w':
						# White would show M3 for Mate in 3
						score[1] = 'M'+str(m2.group(1))
					if side == 'b':
						# Black would show -M3 for Mate in 3
						score[1] = '-M'+str(m2.group(1))

			else: # usual score
				if m1:
					score[1] = int(m1.group(1))/100.00
			if m11:
				bounds[1] = 1
			elif m12:
				bounds[1] = -1
			else:
				bounds[1] = 0

		if m13:
			output["tbhits"] = int(m13.group(1))

		output["pv"] = pv
		output["score"] = score
		output["bounds"] = bounds
		#print(line)
		#print(output)
		#eng.stdout.flush()

def uci(command):
    print('engine << '+command)
    eng.stdin.write((command+'\n').encode('utf-8'))
    eng.stdin.flush()

def setOption(name, value):
	command = 'setoption name '+str(name)+' value '+str(value)
	uci(command)

def startEngine(config):
	global stopped
	global t
	global eng
	uciOptions = config['uci_options']

	# Stop existing engine
	stopped = True
	if eng:
		try:
			stop()
			uci('quit')
		except:
			return False, 'Failed to stop current engine..'

	# Start new engine
	try:
		eng = subprocess.Popen([config['path']], stdin=subprocess.PIPE, stdout=subprocess.PIPE, bufsize=0)
	except subprocess.CalledProcessError as e:
		return False, 'Could not start the engine specified'

	lst = eng.stdout.readline().decode().rstrip().split()
	engine = lst[0]+' '+lst[1]

	# Start output parser thread
	if not t:
		t = Thread(target=parseOutput)
		t.daemon = True
		t.start()

	print('engine >> ' + engine)

	for k, v in iteritems(uciOptions):
		setOption(k, v)

	# Default MultiPV
	setOption('MultiPV', MultiPV)

	stopped = False
	return True, 'Engine is now set to '+engine

def setPosition(fen):
	global side
	global currFEN
	global resetOutput

	try:
		stop()
		resetOutput = True
		currFEN = fen

		if "w" in fen:
			side = 'w'
		else:
			side = 'b'
		uci('position fen ' + fen)
	except:
		return False, "Unable to set new position"

	return True, "New position set"

def stop():
	try:
		global output
		uci('stop')
		resetOutput = True
	except:
		return False, 'Failed to stop engine'

	return True, 'Engine stopped'

def sendOutput():
	global resetOutput
	if notationType > 0:
		try:
			fen = currFEN
			pvNotation = {}
			output2 = output.copy()
			pv = output2['pv']

			for k,v in iteritems(pv):
				status, pvNotation[k] = movesNotation(fen, pv[k], notationType)

				if not status:
					resetOutput = True
			output2['pv'] = pvNotation
			return output2

		except:
			print(notationType, 'skipping pv notation conversion for now')

	return output

def cycleNotationType():
	global notationType
	if notationType < 2:
		notationType += 1
	else:
		notationType = 0
	return notation[notationType]

@atexit.register
def houseKeeping():
	try:
		if eng:
			uci('quit')
			eng.terminate()
			print('Gracefully exited ......')
	except:
		print("Engine already exited .....")

	sleep(1)
	print('    exiting .......')
