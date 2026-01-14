const { loadFiles } = require("../Functions/fileLoader");
const Table = require('cli-table3');

async function loadCommands(client) {
    const commandTable = new Table({
        head: ['Slash Command', 'Status'],
        colWidths: [25, 8],
    });

    await client.commands.clear();
    const commandsArray = [];

    const Files = await loadFiles("Commands/Slash");
    Files.forEach((file) => {
        const command = require(file);
        client.commands.set(command.data.name, command);
        commandsArray.push(command.data.toJSON());
        commandTable.push([command.data.name, "ㅤ✅"]);
    });

    client.application.commands.set(commandsArray);


    console.log(commandTable.toString());
    
}

module.exports = { loadCommands };
