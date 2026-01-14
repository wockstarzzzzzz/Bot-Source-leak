const noblox = require('noblox.js');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'roblox',
    aliases: ['rbx'],
    cat: 'general',
    description: 'Roblox profile',
    async execute(message, args) {
        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks)) {
            return;
        }

        try {
            const input = args[0];
            if (!input) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription('Please provide a Roblox username or user ID!')
                    .setColor('#2b2d31');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            let userId;
            if (isNaN(input)) {

                userId = await noblox.getIdFromUsername(input);
            } else {

                userId = input;
            }

            const userInfo = await noblox.getPlayerInfo({ userId: userId });
            const creationDate = `<t:${Math.floor(new Date(userInfo.joinDate).getTime() / 1000)}:D>`;
            const avatarUrl = await noblox.getPlayerThumbnail(userId, "420x420", "png", false, "Headshot");
            const bodyUrl = await noblox.getPlayerThumbnail(userId, "420x420", "png", false, "body");

            const profileEmbed = new EmbedBuilder()
                .setTitle(`@${userInfo.username}`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setColor('#2b2d31')
                .setThumbnail(bodyUrl[0].imageUrl)
                .addFields(
                    { 
                        name: '__Dates__',
                        value: `>>> **Name**:\`${userInfo.displayName}\`\n**Id**: \`${userId}\`\n**Created**: ${creationDate}`,
                        inline: true
                    },
                    { 
                        name: `__Stats__`,
                        value: `>>> **Friends**: \`${userInfo.friendCount?.toString() ?? '0'}\`\n**Following**: \`${userInfo.followingCount?.toString() ?? '0'}\`\n**Followers**: \`${userInfo.followerCount?.toString() ?? '0'}\``,
                        inline: true 
                    },
                );

            if (userInfo.blurb && userInfo.blurb.trim() !== '') {
                profileEmbed.setDescription(`> _${userInfo.blurb}_`);
            }

            const profileButton = new ButtonBuilder()
                .setLabel('Profile')
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setStyle(ButtonStyle.Link);

            const actionRow = new ActionRowBuilder().addComponents(profileButton);

            message.channel.send({ embeds: [profileEmbed], components: [actionRow] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setDescription('Could not find the Roblox profile.')
                .setColor('#2b2d31');
            message.channel.send({ embeds: [errorEmbed] });
        }
    },
};
