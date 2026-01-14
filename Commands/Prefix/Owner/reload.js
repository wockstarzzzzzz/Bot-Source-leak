const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../emojis.json')
const config = require('../../../config.json')
const { loadCommands } = require('../../../Handlers/slashHandler');
const { loadPrefixes } = require('../../../Handlers/prefixHandler');
const { loadFiles } = require('../../../Functions/fileLoader');

module.exports = {
    name: 'reload',
    aliases: ['rl'],
    description: 'Reload all bot components',
    cat: 'owner',
    async execute(message, args) {
        const ownerIds = ['344131223230087177', '763141886834769980', '1436451809903382599'];

        if (!ownerIds.includes(message.author.id)) {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.warning}`)
                    .setDescription(`${emojis.warning} Only bot owners can use this command.`)]
            }).catch(() => {});
            return;
        }

        let msg;
        try {
            const loadingEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`${emojis.loading} Reloading all bot components...`);

            msg = await message.reply({ embeds: [loadingEmbed] }).catch(() => null);
        } catch {

        }

        try {
            message.client.commands.clear();
            message.client.prefixes.clear();

            const eventNames = [...message.client.eventNames()];
            for (const eventName of eventNames) {
                message.client.removeAllListeners(eventName);
            }

            const reloadSteps = [
                { name: 'Slash Commands', func: async () => await loadCommands(message.client) },
                { name: 'Prefix Commands', func: async () => await loadPrefixes(message.client) },
                { name: 'Events', func: async () => await loadEvents(message.client) }
            ];

            const results = [];
            for (const step of reloadSteps) {
                try {
                    await step.func();
                    results.push(`${emojis.approve} ${step.name}`);
                } catch {
                    results.push(`${emojis.deny} ${step.name}`);
                }
            }

            if (msg) {
                const successEmbed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setDescription(results.join('\n'))
                    .setTimestamp();

                msg.edit({ embeds: [successEmbed] }).catch(() => {});
            }
        } catch {
            if (msg) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(`${config.deny}`)
                    .setTitle(`${emojis.deny} Error in reloading`)
                    .setDescription('An error occurred during the reload process.')
                    .setTimestamp();

                msg.edit({ embeds: [errorEmbed] }).catch(() => {});
            }
        }
    }
};

async function loadEvents(client) {
    try {
        const Files = await loadFiles("Events");

        for (const file of Files) {
            try {
                delete require.cache[require.resolve(file)];
                const event = require(file);

                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
            } catch {

            }
        }
    } catch {

    }
}
