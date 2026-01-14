const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'jumbo',
    cat: 'general',
    description: 'jumbo comando',
    async execute(message, args) {

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
            return;
        }


        const emojiInput = args[0];
        if (!emojiInput) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`${message.author}: you must provide a emoji.`),
                ],
            });
        }


        const emojiMatch = emojiInput.match(/<a?:\w+:(\d+)>/);
        if (!emojiMatch) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`${message.author}: please provide a valid emoji.`),
                ],
            });
        }

        const emojiId = emojiMatch[1];
        const isAnimated = emojiInput.startsWith('<a');
        const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}?size=2048`;


        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setImage(emojiURL);


        message.channel.send({ embeds: [embed] });
    },
};
