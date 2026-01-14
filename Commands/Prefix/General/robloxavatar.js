const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const noblox = require('noblox.js');

module.exports = {
    name: 'robloxavatar',
    description: 'Roblox avatar',
    aliases: ['rbxavatar', 'rbxav'],
    cat: 'general',
    async execute(message, args) {

        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks)) {

            return;
        }

        try {
            const username = args[0];
            if (!username) {
                return message.reply({ 
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription('¡Proporcione un nombre de usuario de Roblox!')
                    ] 
                });
            }

            const userId = await noblox.getIdFromUsername(username);
            const avatarUrl = await noblox.getPlayerThumbnail(userId, 250, 'png', false, 'body');

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle(`${username}'s Avatar`)
                .setImage(avatarUrl[0].imageUrl);

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('An error occurred while fetching the avatar. Please check the username and try again.')
                ] 
            });
        }
    },
};
