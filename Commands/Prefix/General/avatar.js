const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'avatar',
    aliases: ['av', 'pic'],
    cat: 'general',
    description: 'Get the avatar of a user by mention or ID',
    async execute(message, args) {

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
            return;
        }

        let user;
        if (message.mentions.users.first()) {
            user = message.mentions.users.first();
        } else if (args[0]) {
            try {
                user = await message.client.users.fetch(args[0]);
            } catch {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription(`${message.author}: user not found`),
                    ],
                });
            }
        } else {
            user = message.author;
        }

        const member = message.guild.members.cache.get(user.id) || (await message.guild.members.fetch(user.id).catch(() => null));
        const globalAvatar = user.displayAvatarURL({ dynamic: true, size: 1024 });
        const serverAvatar = member?.avatar ? member.displayAvatarURL({ dynamic: true, size: 1024 }) : null;

        const description = serverAvatar ? `**[Server Avatar](${serverAvatar}) ∙ [Global Avatar](${globalAvatar})**` : null;

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`${user.tag}'s Avatar`)
            .setImage(globalAvatar);

        if (description) embed.setDescription(description);

        message.channel.send({ embeds: [embed] });
    },
};
