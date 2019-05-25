const enumerate = require('./require-enumerate');
const argv = require('yargs')
    .usage('Usage: node $0 [options]')
    .example('node $0 -b backup-contracts')
    .describe('b', 'Backup directory')
    .alias('b', 'backup-dir')
    .nargs('b', 1)
    .help('h')
    .alias('h', 'help')
    .argv;

const inputFiles = require('../../package').requireEnumerate.map(f => `contracts/${f}`);

(async () => {
    try {
        await enumerate(...inputFiles, {backupDir: argv.b});
    } catch (e) {
        console.error(e);
    }
})();
