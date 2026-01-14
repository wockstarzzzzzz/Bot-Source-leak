const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'legacybadges',
    aliases: ['lb'],
    cat: 'general',
    description: 'Displays a Boost Badges image',
    execute(message) {

        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks)) {

            return;
        }

        try {


            const embed = new EmbedBuilder()
                .setTitle('legacy badges.')
                .setColor('#2b2d31')
                .setImage('https://betterdiscord.app/Image/667');

            message.channel.send({ embeds: [embed] });
        } catch (error) {

        }
    }
};