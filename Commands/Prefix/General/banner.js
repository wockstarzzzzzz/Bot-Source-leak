const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'banner',
    aliases: ['bnr'],
    cat: 'general',
    description: 'Get the banner of a user by mention or ID',
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
        const serverBanner = member?.banner ? member.bannerURL({ dynamic: true, size: 1024 }) : null;

        try {
            const userData = await message.client.users.fetch(user.id, { force: true });
            const globalBanner = userData.bannerURL({ dynamic: true, size: 1024 }) || null;

            const bannerToShow = globalBanner || serverBanner;
            if (!bannerToShow) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription(`${message.author}: this user has no banner`),
                    ],
                });
            }


            const description = serverBanner && globalBanner ? `**[Server Banner](${serverBanner}) ∙ [Global Banner](${globalBanner})**` : null;

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle(`${user.tag}'s Banner`)
                .setImage(bannerToShow);

            if (description) embed.setDescription(description);

            message.channel.send({ embeds: [embed] });
        } catch {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`${message.author}: unable to fetch user banner`),
                ],
            });
        }
    },
};
