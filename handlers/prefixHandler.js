const { loadFiles } = require("../Functions/fileLoader");
const Table = require('cli-table3');
const Guild = require('../Database/Schemas/prefix');

async function loadPrefixes(client) {
    const prefixTable = new Table({
        head: ['Prefix Command', 'Status'],
        colWidths: [25, 8],
    });

    if (client.prefixes && typeof client.prefixes.clear === 'function') {
        await client.prefixes.clear();
    } else {
        client.prefixes = new Map();
    }

    const Files = await loadFiles("Commands/Prefix");
    Files.forEach((file) => {
        const prefix = require(file);
        if (prefix.name) {
            client.prefixes.set(prefix.name, prefix);
            prefixTable.push([prefix.name, "ㅤ✅"]);
        }

        if (prefix.aliases && Array.isArray(prefix.aliases)) {
            prefix.aliases.forEach((alias) => {
                client.prefixes.set(alias, prefix);
            });
        }
    });

    console.log(prefixTable.toString());
}

async function getPrefix(guildId) {
    let guildData = await Guild.findOne({ guildId });
    if (!guildData) {
        guildData = new Guild({ guildId });
        await guildData.save();
    }
    return guildData.prefix;
}

module.exports = { loadPrefixes, getPrefix };
