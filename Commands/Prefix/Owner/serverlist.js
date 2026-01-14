const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const ownerIds = ['344131223230087177', '763141886834769980', '1436451809903382599'];

module.exports = {
    name: 'serverlist',
    cat: 'owner',
    aliases: ['listserver', 'sl', 'ls'],
    description: 'It displays a list of the servers where the bot is located.',
    async execute(message, args) {

        if (!ownerIds.includes(message.author.id)) {
            return;
        }

        try {

            const botPermissionsInChannel = message.channel.permissionsFor(message.client.user);
            if (!botPermissionsInChannel || !botPermissionsInChannel.has(PermissionsBitField.Flags.EmbedLinks)) {

                return;
            }

            const servers = message.client.guilds.cache.map(guild => {
                return `> **${guild.name}**ㅤㅤID: \`${guild.id}\``;
            });

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('Servers')
                .setDescription(servers.join('\n'))
                .setFooter({ text: `Total: ${message.client.guilds.cache.size}` });

            await message.channel.send({ embeds: [embed] });
        } catch (error) {

            console.error('Error in serverlist command:', error);
        }
    },
};