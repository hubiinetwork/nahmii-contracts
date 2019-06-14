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

    const reNoMsg = /(.*require.*[^'"])\);/;
    const reMsg = /(.*require[\w\W\s]*['"][^\]]*?)\s*(?:\[.*\])?(['"][\w\W\s]*)/;

    let newLine;
    if (reNoMsg.test(line)) {
        const result = reNoMsg.exec(line);
        newLine = `${result[1]}, ${quote}${enumerator}${quote});`;
    } else if (reMsg.test(line)) {
        const result = reMsg.exec(line);
        newLine = `${result[1]} ${enumerator}${result[2]}`;
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