const fs = require('fs');

function createSampler() {
    const dir = './events';
    const map = new Map();

    return {
        mkdir: () => {
            fs.existsSync(dir) || fs.mkdirSync(dir);
        },

        write: (contract, event, log) => {
            map.has(contract) || map.set(contract, {});

            const contractObj = map.get(contract);

            contractObj[event] = log;

            fs.writeFileSync(`${dir}/${contract}.json`, JSON.stringify(contractObj, null, 2));
        }
    };
}

const sampler = createSampler();

module.exports = sampler;
