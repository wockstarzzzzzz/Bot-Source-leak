const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const emojis = require('../../../emojis.json')
const axios = require('axios');
const { profileImage } = require('discord-arts');

const badgeToEmojiMap = {
    'ACTIVE_DEVELOPER': '<:activedeveloper:1320072333402308669>',
    'APPLICATION_AUTOMOD': '<:automod:1320072220910813225>',
    'APPLICATION_STORE': '<:premiumbot:1320072526390362143>',
    'BUGHUNTER_LEVEL_1': '<:discordbughunter1:1320072420303962112>',
    'BUGHUNTER_LEVEL_2': '<:discordbughunter2:1320072409042124820>',
    'DISCORD_CERTIFIED_MODERATOR': '<:discordmod:1320072395595321434>',
    'DISCORD_EMPLOYEE': '<:discordstaff:1320072459457789963>',
    'EARLY_SUPPORTER': '<:discordearlysupporter:1320072380500152390>',
    'EARLY_VERIFIED_BOT_DEVELOPER': '<:discordbotdev:1320072432450539573>',
    'HOUSE_BALANCE': '<:hypesquadbalance:1320072295032819772>',
    'HOUSE_BRAVERY': '<:hypesquadbravery:1320072306256515123>',
    'HOUSE_BRILLIANCE': '<:hypesquadbrilliance:1320072281384423444>',
    'HYPESQUAD_EVENTS': '<:hypesquadevents:1325145253098819716>',
    'LEGACY_USERNAME': '<:username:1320072492739596379>',
    'NITRO': '<:discordnitro:1320072736860541019>',
    'PARTNERED_SERVER_OWNER': '<:discordpartner:1320072366444904610>',
    'APPLICATION_COMMAND': '<:supportscommands:1320072207766126685>',
    'QUEST_COMPLETED': '<:quest:1320072507482574971>',
    'NITRO_BRONZE': '<:bronze:1340468584643825869>',
    'NITRO_SILVER': '<:silver:1340468595104415794>',
    'NITRO_GOLD': '<:gold:1340468606550671390>',
    'NITRO_PLATINUM': '<:platinum:1340468627052302418>',
    'NITRO_DIAMOND': '<:diamond:1340468656978661466>',
    'NITRO_EMERALD': '<:emerald:1340468670123479140>',
    'NITRO_RUBY': '<:ruby:1340468683780128828>',
    'NITRO_FIRE': '<:opal:1340468696295936010>',
    'BOOSTER_1': '<:boost1:1320072559756316714>',
    'BOOSTER_2': '<:boost2:1320072576277545102>',
    'BOOSTER_3': '<:boost3:1320072593658613911>',
    'BOOSTER_6': '<:boost6:1320072611430006804>',
    'BOOSTER_9': '<:boost9:1320072639309545512>',
    'BOOSTER_12': '<:boost12:1320072694808580098>',
    'BOOSTER_15': '<:boost15:1320072659056464023>',
    'BOOSTER_18': '<:boost18:1320072674546024458>',
    'BOOSTER_24': '<:boost24:1320072706863136808>',
};

module.exports = {
    name: 'userinfo',
    aliases: ['ui', 'user', 'whois'],
    cat: 'info',
    description: 'Muestra información detallada sobre un usuario',
    async execute(message, args) {
        const embedColor = '#2b2d31';

        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks)) {
            return;
        }

        try {
            let targetUser = args[0]
                ? message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null)
                : message.author;

            if (!targetUser) {
                return message.channel.send('Usuario no encontrado.');
            }

            const guildMember = await message.guild.members.fetch(targetUser.id).catch(() => null);

            const { data: userData } = await axios.get(`https://discord.com/api/v10/users/${targetUser.id}`, {
                headers: { Authorization: `Bot ${message.client.token}` }
            });

            let userBadges = '';
            try {
                const { data } = await axios.get(`https://discord-arts.asure.dev/v1/user/${targetUser.id}`);
                if (data?.data?.assets?.badges) {
                    userBadges = data.data.assets.badges.map(b => badgeToEmojiMap[b.name] || '').join('');
                }
            } catch {
            }

            const presenceStatusMode = guildMember?.presence?.status || 'offline';

            let attachment;
            try {
                const buffer = await profileImage(targetUser.id, {
                    badgesFrame: true,
                    moreBackgroundBlur: true,
                    backgroundBrightness: 100,
                    presenceStatus: presenceStatusMode
                });
                attachment = new AttachmentBuilder(buffer, { name: 'profile.png' });
            } catch {
                attachment = null;
            }

            let linksValue = `[User](https://discord.com/users/${targetUser.id}) ∙ [Avatar](${targetUser.displayAvatarURL({ dynamic: true, size: 1024 })})`;
            if (userData.banner) {
                const bannerUrl = `https://cdn.discordapp.com/banners/${targetUser.id}/${userData.banner}${userData.banner.startsWith('a_') ? '.gif' : '.png'}?size=1024`;
                linksValue += ` ∙ [Banner](${bannerUrl})`;
            }

            let desc = `${guildMember?.displayName || targetUser.username}`;
            if (userBadges) desc += ` ∙ ${userBadges}`;
            desc = `### ${desc}\n`;

            if (guildMember?.presence?.activities?.length) {
                const spotify = guildMember.presence.activities.find(a => a.type === 2 && a.name === 'Spotify');
                if (spotify) {
                    desc += `${emojis.spotify} Listening to **[${spotify.details}](https://open.spotify.com/track/${spotify.syncId})**\n`;
                }
            }

            let datesValue = `> **Created**: <t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`;
            if (guildMember) {
                datesValue += `\n> **Joined**: <t:${Math.floor(guildMember.joinedTimestamp / 1000)}:R>`;
                if (guildMember.premiumSince) {
                    datesValue += `\n> **Boosted**: <t:${Math.floor(guildMember.premiumSince.getTime() / 1000)}:R>`;
                }
            }

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setAuthor({ name: `${targetUser.username} (${targetUser.id})` })
                .setDescription(desc)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }))
                .addFields(
                    { name: '__Links__', value: linksValue },
                    { name: '__Dates__', value: datesValue }
                );

            if (attachment) {
                embed.setImage('attachment://profile.png');
            }

            await message.channel.send({
                embeds: [embed],
                files: attachment ? [attachment] : []
            });

        } catch (error) {
            console.error('Error en userinfo:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription('Hubo un error al obtener la información del usuario.');
            await message.channel.send({ embeds: [errorEmbed] });
        }
    },
};
