'use strict';
const net = require('net');
const readline = require('readline');
const path = require('path');

// Change this to 2 if it fails for you
// This should NOT be greater than 6
const pingMultiplier = 6;

// How fast the script should ping CS for data
// The lower this is the more processing power it requires. 
// Keep at ~15 for decent resource usage
// This should NOT be greater than 40
const scriptPingRate = 17

const TICK_RATE = 64;
const PING_DELIMITER = ' ms : ';

let previous = {};
let counter = 0;

let explosionTime = 0;
let ping = 1;
let username = 'unnamed';
let lastHurt;
let hurt = 0;
let on = false;

// Bind keypad 0 (ins) to toggle the script
const sendOnConnect = `developer 1;
con_filter_enable 2;
con_filter_text "Bomb: ";
bind "KP_INS" "echo toggleSocket"
`;

const onChange = data => { 
	const hasPrevious = data.Name in previous;
	const isDifferent = !hasPrevious || previous[data.Name].In !== data.In ;

	// if data haven't changed since the last update, do nothing
	if (!isDifferent) {
		return;
	}

	if (data.Name === 'bomb_planted') {
		previous[data.Name] = data;

		if (counter === 2) {
			explosionTime = Date.now() + 40000 - pingMultiplier * ping - 1;
		}
	} else if ( data.Name === 'player_hurt' ){
		if ( counter === 2 ) {
			lastHurt = lastHurt === undefined ? previous[data.Name].In : ( data.In - previous[data.Name].In );
			hurt = lastHurt;
		}
		previous[data.Name] = data;
	} else if (data.Name === 'round_start') {
		previous[data.Name] = data;

		if (counter === 2) {
			explosionTime = 0;
			hurt = 0;
			socket.write(`-use\n`);
		}
	}
};

const COMMAND = 'net_dumpeventstats';
const WANTED = {
	Name: 'string',
	Out: 'number',
	In: 'number',
	OutBits: 'number',
	InBits: 'number',
	OutSize: 'number',
	InSize: 'number',
	Notes: 'string'
};

const WANTED_KEYS = Object.keys(WANTED);
const WANTED_STRING = WANTED_KEYS.join(' ');
const WANTED_LENGTH = WANTED_KEYS.length;
const whitespaceRegExp = /\s{2,}/g;

const port = Number(process.argv[2] || 0);
if (process.argv.length !== 3 || !port) {
	console.error(`Usage: node ${path.basename(process.argv[1])} [port]`);
	return;
}

const socket = net.connect(port, '127.0.0.1', async () => {
	console.log('Connected! Press CTRL+C to abort.');

	socket.write(`${sendOnConnect}\nname\n`);

	const reader = readline.createInterface({
		input: socket,
		crlfDelay: Infinity
	});

	let reading = false;

	for await (const line of reader) {
		const processedLine = line.replace(whitespaceRegExp, ' ').trim();
		
		// get player ping and register it
		if (processedLine.startsWith(`"name" = "`)) {
			const end = `" ( def. "unnamed" ) archive server_can_execute user ss`;
			username = processedLine.slice(10, processedLine.indexOf(end));
		} else if (processedLine.includes(PING_DELIMITER)) {
			const data = processedLine.split(PING_DELIMITER);
			
			if (data[1] === username) {
				ping = Number(data[0]);
			}
		} 
		
		// player toggled the script on/off
		if (processedLine === 'toggleSocket') {
			on = !on;
		}
		else
		{
			if (reading) {
				const parsedLine = processedLine.split(' ');

				if (parsedLine.length !== WANTED_LENGTH) {
					reading = false;
					continue;
				}

				const object = {};

				for (let index = 0; index < WANTED_KEYS.length; index++) {
					const key = WANTED_KEYS[index];
					const type = WANTED[key];

					if (type === 'string') {
						object[key] = parsedLine[index];
					} else if (type === 'number') {
						object[key] = Number(parsedLine[index]);

						if (Number.isNaN(object[key])) {
							reading = false;
						}
					}
				}

				if (reading) {
					onChange(object);
				}
			}
		
			if (processedLine === WANTED_STRING) {
				if (counter < 2) {
					counter++;
				}

				reading = true;
			}
		}
	}
});

let lastPingTime = 0;
let dt = 0;

setInterval(() => {
	dt = Date.now();
	const diff = explosionTime > 0 ? (Math.max(explosionTime - dt, 0) / 1000).toFixed(3) : 0;
	let pingCommand = '';
	let x = previous['player_hurt'] === undefined ? 0 : previous['player_hurt'].In;

	if ((dt - lastPingTime) > 2000) {
		lastPingTime = dt;
		pingCommand = 'ping\n';
	}
	
	// reset the number of hurt players in this tick+num_ms
	if ((dt - lastPingTime) > 1500) {
		hurt = 0;
	}
	
	// if the script is supposed to be running
	if ( on )
	{
		socket.write(`clear\n${pingCommand}${COMMAND}\necho "Bomb: ${diff}s -- Players last hit: ${lastHurt} -- Hit now: ${hurt}\n"`);
	}
}, Math.floor( (1000*scriptPingRate) / TICK_RATE)).unref();

socket.setEncoding('utf8');