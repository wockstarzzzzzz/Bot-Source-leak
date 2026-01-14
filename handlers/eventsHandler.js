const { loadFiles } = require("../Functions/fileLoader");
const Table = require('cli-table3');

async function loadEvents(client) {
    const eventTable = new Table({
        head: ['Event', 'Status'],
        colWidths: [25, 8],
    });

    await client.events.clear();
    const Files = await loadFiles("Events");

    Files.forEach((file) => {
        const event = require(file);
        const execute = (...args) => event.execute(...args, client);
        client.events.set(event.name, execute);

        if (event.rest) {
            event.once
                ? client.rest.once(event.name, execute)
                : client.rest.on(event.name, execute);
        } else {
            event.once
                ? client.once(event.name, execute)
                : client.on(event.name, execute);
        }

        eventTable.push([event.name, "ㅤ✅"]);
    });

    console.log(eventTable.toString());
}

module.exports = { loadEvents };
