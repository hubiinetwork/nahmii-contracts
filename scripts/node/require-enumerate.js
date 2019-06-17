const nReadlines = require('n-readlines');
const path = require('path');
const fs = require('fs').promises;
const debug = require('debug')('require-enumerate');

async function enumerateFiles(...fileNames) {
    let options;
    if (!(typeof (fileNames[fileNames.length - 1]) === 'string' || fileNames[fileNames.length - 1] instanceof String))
        options = fileNames.pop();

    return Promise.all(fileNames.map(fn => enumerateFile(fn, options)));
}

async function enumerateFile(inputFile, options = {}) {
    const inputLiner = new nReadlines(inputFile);

    const quote = (options.defaultQuote) || '"';

    let inputLine, outputLine, inputLineNo = 0;
    const outputLines = [];
    while (inputLine = inputLiner.next()) {
        [inputLineNo, outputLine] = processLine(inputFile, inputLine.toString(), inputLiner, inputLineNo, quote);

        outputLines.push(outputLine);
    }

    if (options.backupDir)
        await createBackup(inputFile, options.backupDir);

    return fs.writeFile(inputFile, outputLines.join('\n'));
}

function processLine(file, line, liner, lineNo, quote) {
    if (!/^\s*require\(/.test(line)) {
        return [++lineNo, line];
    }

    let wrapsCount = 0;
    while (!/\);\s*$/.test(line)) {
        ++wrapsCount;
        line += '\n' + liner.next().toString();
    }

    const enumerator = `[${path.basename(file)}:${++lineNo}]`;

    const reMsgMltLn = /(.*require[\w\W\s]*['"][^\[]*)(?:\[[^\]]*\])?(['"])(\n\s*\);)/;
    const reMsgSglLn = /(.*require[\w\W\s]*['"][^\[]*)(?:\[[^\]]*\])?(['"])(\s*\);)/;
    const reNoMsgMltLn = /(.*require[\w\W\s]*[^'"])(\n\s*\);)/;
    const reNoMsgSglLn = /(.*require[\w\W\s]*[^'"])(\s*\);)/;

    let newLine;
    if (reMsgMltLn.test(line)) {
        const result = reMsgMltLn.exec(line);
        newLine = `${result[1]} ${enumerator}${result[2]}${result[3]}`;
    } else if (reMsgSglLn.test(line)) {
        const result = reMsgSglLn.exec(line);
        newLine = `${result[1]}${enumerator}${result[2]}${result[3]}`;
    } else if (reNoMsgMltLn.test(line)) {
        const result = reNoMsgMltLn.exec(line);
        newLine = `${result[1]},\n${quote}${enumerator}${quote}${result[2]}`;
    } else if (reNoMsgSglLn.test(line)) {
        const result = reNoMsgSglLn.exec(line);
        newLine = `${result[1]}, ${quote}${enumerator}${quote}${result[2]}`;
    } else
        throw Error(`Failed replacement at line ${lineNo} of ${file}: '${line}'`);

    if (line != newLine)
        debug(`Update in ${file}:${lineNo}`);

    lineNo += wrapsCount;

    return [lineNo, newLine];
}

async function createBackup(inputFile, backupDir) {
    if (!(await fs.stat(backupDir).catch(e => {
        if (e.code === "ENOENT") return false;
        throw e;
    })))
        await fs.mkdir(backupDir, {recursive: true});

    const backupFile = `${backupDir.replace(/\/$/, '')}/${path.basename(inputFile)}`;

    debug(`Create backup of ${inputFile} at ${backupFile}`);

    return fs.copyFile(inputFile, backupFile);
}

module.exports = enumerateFiles;