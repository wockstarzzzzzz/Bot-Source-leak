const { loadCommands } = require("../../Handlers/slashHandler");
const { loadPrefixes } = require("../../Handlers/prefixHandler");
const { ActivityType, Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {

        loadCommands(client);
        loadPrefixes(client);

        const activities = [
            { name: '🔗 dsc.gg/lowest', type: ActivityType.Custom },
        ];

        let currentIndex = 0;

        setInterval(() => {
            const activity = activities[currentIndex];
            client.user.setPresence({
                activities: [activity],
                status: 'online',
            });

            currentIndex = (currentIndex + 1) % activities.length;
        }, 10000);


        client.on('messageCreate', async message => {
            if (message.author.bot) return;

            if (message.content.toLowerCase() === 'pg') {
                try {
                    const messages = await message.channel.messages.fetch({ limit: 100 });

                    const userMessages = messages
                        .filter(msg => msg.author.id === message.author.id)
                        .map(msg => msg.id);

                    if (userMessages.length > 0) {

                        await message.channel.bulkDelete(userMessages, true)
                            .catch(() => {  });
                    }
                } catch {

                }
            }
        });
    }
};
