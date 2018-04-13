var spawn = require('child_process').spawn;
var os = require('os');
var fs = require('fs');
var path = require('path');

//------------------------------------------------------------------------------

var command = (os.platform() == 'win32') ? 'truffle.cmd' : 'truffle';

var action = 'compile';
if (process.argv.length > 2)
    action = process.argv[2];

var childProc = null;
if (action == 'compile') {
    //deleteBuildFolder();
    childProc = spawn(command, ["compile", "--compile-all"], {stdio: 'inherit'});
}
else if (action == 'migrate') {
    //deleteBuildFolder();
    childProc = spawn(command, ["migrate", "--reset"], {stdio: 'inherit'});
}
else {
    console.log("Error: Unknown \'action\' specified.");
}
if (childProc) {
    childProc.on('close', function (code) {
        process.exit(code);
    });
}
else {
    process.exit(1);
}

//------------------------------------------------------------------------------

function deleteBuildFolder() {
    var dirname = path.normalize(__dirname + path.sep);

    deleteFolderRecursive(dirname + 'build');
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            }
            else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
