const child_proc = require('child_process');
const os = require('os');
const path = require('path');

//------------------------------------------------------------------------------

// Launch ganache-cli (https://github.com/trufflesuite/ganache-cli)
let cmd = getCommand('ganache-cli');
const ganache = child_proc.spawn(cmd, [
    //'--defaultBalanceEther', '100',
    //'--blockTime', '1', //<<---- REQUIRED
    //'--gasPrice', '20000000000',
    '--gasLimit', '6000000',
    //'--accounts', '10',
    '--mnemonic', 'dead fish racket soul plunger dirty boats cracker mammal nicholas cage',
    '--port', '8456'
], {
    stdio: 'ignore',
    detached: true
});

if (!ganache) {
    console.log('Error: Cannot launch \'ganache-cli\'');
    process.exit(1);
} else
    console.log(`Started ganache-cli (pid ${ganache.pid})`);

// Launch Truffle Test
cmd = getCommand('truffle');
const truffle = child_proc.spawn(cmd, [
    'test',
    '--compile-all',
    '--network', 'ganache-cli-for-test'
], {
    stdio: 'inherit'
});

if (!truffle) {
    killProcess(ganache);
    console.log('Error: Cannot launch \'truffle test\'');
    process.exit(1);
}

truffle.on('exit', function (code) {
    killProcess(ganache);
    process.exit(code);
});

//------------------------------------------------------------------------------

function getCommand(appName) {
    const command = (os.platform() == 'win32') ? (appName + '.cmd') : appName;
    return __dirname + path.sep + 'node_modules' + path.sep + '.bin' + path.sep + command;
}

function killProcess(process) {
    if (os.platform() == 'win32') {
        try {
            child_proc.execSync('taskkill.exe /f /t /pid ' + process.pid.toString());
        }
        catch (err) {
            //console.log(err.toString());
        }
    }
    else {
        process.kill('SIGKILL');
        //try {
        //    child_proc.execSync('kill -9 ' + pid.toString());
        //}
        //catch (err) {
        //    //console.log(err.toString());
        //}
    }
}
