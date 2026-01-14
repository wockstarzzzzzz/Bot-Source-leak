const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ping',
    aliases: [],
    cat: 'general',
    description: 'Displays the bot\'s latency.',
    async execute(message) {


        try {

            const botPermissionsInChannel = message.channel.permissionsFor(message.client.user);
            if (!botPermissionsInChannel || !botPermissionsInChannel.has(PermissionsBitField.Flags.EmbedLinks)) {

                return;
            }

            const ping = Math.round(message.client.ws.ping);
            const embedMessage = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`> Latency is \`${ping}ms\``);

            await message.channel.send({ embeds: [embedMessage] });
        } catch (error) {
            console.error('Error in ping command:', error);
        }
    },
};