var child_proc = require('child_process');
var os = require('os');
var fs = require('fs');
var path = require('path');

//------------------------------------------------------------------------------

//Launch Ganache client
var cmd = getCommand('ganache-cli');
var ganache = child_proc.spawn(cmd, [
		'--defaultBalanceEther', '100',
		'--blockTime', '1', //<<---- REQUIRED
		//'--gasPrice', '20000000000',
		//'--gasLimit', '90000',
		'--accounts', '10',
		'--port', '8456'
	], {
		stdio: 'ignore',
		detached: true
	});
if (!ganache) {
	console.log("Error: Cannot launch Ganache");
	process.exit(1);
}

//Launch Truffle Test
cmd = getCommand('truffle');
var truffle_test = child_proc.spawn(cmd, [
		'test',
		'--compile-all',
		'--network', 'ganache_for_test'
	], {
		 stdio: 'inherit'
	});
if (!truffle_test) {
	killProcess(ganache.pid);
	console.log("Error: Cannot launch Truffle test");
	process.exit(1);
}

truffle_test.on('exit', function (code) {
	killProcess(ganache.pid);
	process.exit(code);
});

//------------------------------------------------------------------------------

function getCommand(appName)
{
	var command = (os.platform() == 'win32') ? (appName + '.cmd') : appName;

	return __dirname + path.sep + 'node_modules' + path.sep + '.bin' + path.sep + command;
}

function killProcess(pid)
{
	if (os.platform() == 'win32') {
		try {
			child_proc.execSync('taskkill.exe /f /t /pid ' + pid.toString());
		}
		catch (err) {
			//console.log(err.toString());
		}
	}
	else {
		try {
			child_proc.execSync('kill -9 ' + pid.toString());
		}
		catch (err) {
			//console.log(err.toString());
		}
	}
}
