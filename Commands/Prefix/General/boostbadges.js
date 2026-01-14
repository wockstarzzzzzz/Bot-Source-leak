const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'boostbadges',
    cat: 'general',
    aliases: ['bb'],
    description: 'Displays a Boost Badges image',
    execute(message) {

        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks)) {

            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setTitle('Boost Badges')
                .setColor('#2b2d31')
                .setImage('https://support.discord.com/hc/article_attachments/10928413771031');

            message.channel.send({ embeds: [embed] });
        } catch (error) {

        }
    }
};
