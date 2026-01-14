const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const BoostSchema = require('../../Database/Schemas/boost');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        try {

            if (!oldMember.premiumSince && newMember.premiumSince) {
                const data = await BoostSchema.findOne({ guildId: newMember.guild.id });
                if (!data) return;

                const channel = newMember.guild.channels.cache.get(data.channelId);
                if (!channel) return;

                const botMember = await newMember.guild.members.fetch(newMember.client.user.id);
                const requiredPermissions = [
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.EmbedLinks
                ];

                if (!botMember.permissionsIn(channel).has(requiredPermissions)) return;

                const context = {
                    user: newMember.user,
                    member: newMember,
                    channel: channel,
                    guild: newMember.guild,
                    guildAvatar: newMember.avatar
                };

                const boostMessage = replaceVariables(data.message, context);

                if (data.message.startsWith('{embed}')) {
                    const { embed, content } = parseEmbed(boostMessage);
                    if (embed) {
                        await channel.send({ content: content || null, embeds: [embed] });
                    }
                } else {
                    await channel.send(boostMessage);
                }
            }
        } catch (error) {
            console.error(`Error in boost event: ${error.message}`);
        }
    },
};



function parseEmbed(rawMessage) {
    try {
        const parts = rawMessage.split('$v');
        const embed = new EmbedBuilder();
        let normalMessage = null;

        for (const part of parts) {
            if (part.startsWith('{message:')) {
                normalMessage = part.slice(9, -1).trim();
            } else if (part.startsWith('{title:')) {
                embed.setTitle(part.slice(7, -1).trim());
            } else if (part.startsWith('{description:')) {
                embed.setDescription(part.slice(13, -1).trim());
            } else if (part.startsWith('{color:')) {
                embed.setColor(part.slice(7, -1).trim());
            } else if (part.startsWith('{image:')) {
                embed.setImage(part.slice(7, -1).trim());
            } else if (part.startsWith('{thumbnail:')) {
                embed.setThumbnail(part.slice(11, -1).trim());
            } else if (part.startsWith('{author:')) {
                const [name, icon, url] = part.slice(8, -1).split('&&');
                embed.setAuthor({ name: name.trim(), iconURL: icon?.trim(), url: url?.trim() });
            } else if (part.startsWith('{field:')) {
                const [name, value] = part.slice(7, -1).split('&&');
                embed.addFields({ name: name.trim(), value: value.trim(), inline: true });
            } else if (part.startsWith('{footer:')) {
                const [text, icon] = part.slice(8, -1).split('&&');
                embed.setFooter({ text: text.trim(), iconURL: icon?.trim() });
            } else if (part.startsWith('{timestamp:')) {
                const timestamp = part.slice(11, -1).trim();
                if (!isNaN(timestamp)) {
                    embed.setTimestamp(Number(timestamp));
                }
            } else if (part.trim() === '{timestamp}') {
                embed.setTimestamp();
            }
        }

        return { embed, content: normalMessage };
    } catch (error) {
        console.error('Error embed:', error);
        return { embed: null, content: null };
    }
}

function replaceVariables(template, context) {
    return template
        .replace(/{user}/g, `${context.user.username}#${context.user.discriminator}`)
        .replace(/{user\.id}/g, context.user.id)
        .replace(/{user\.mention}/g, `<@${context.user.id}>`)
        .replace(/{user\.name}/g, context.user.username)
        .replace(/{user\.tag}/g, context.user.discriminator)
        .replace(/{user\.avatar}/g, context.user.displayAvatarURL({ dynamic: true }))
        .replace(/{user\.guild_avatar}/g, context.guildAvatar || context.user.displayAvatarURL({ dynamic: true }))
        .replace(/{user\.display_avatar}/g, context.user.displayAvatarURL({ dynamic: true }))
        .replace(/{user\.joined_at}/g, `<t:${Math.floor(context.member.joinedTimestamp / 1000)}:F>`)
        .replace(/{user\.joined_at_timestamp}/g, `${Math.floor(context.member.joinedTimestamp / 1000)}`)
        .replace(/{user\.created_at}/g, `<t:${Math.floor(context.user.createdTimestamp / 1000)}:F>`)
        .replace(/{user\.created_at_timestamp}/g, `${Math.floor(context.user.createdTimestamp / 1000)}`)
        .replace(/{user\.display_name}/g, context.member.displayName)
        .replace(/{user\.boost}/g, context.member.premiumSince ? 'Yes' : 'No')
        .replace(/{user\.boost_since}/g, context.member.premiumSince ? `<t:${Math.floor(context.member.premiumSinceTimestamp / 1000)}:F>` : 'N/A')
        .replace(/{user\.color}/g, context.member.displayHexColor || '#FFFFFF')
        .replace(/{user\.top_role}/g, context.member.roles.highest.name || 'N/A')
        .replace(/{user\.role_list}/g, context.member.roles.cache.map(role => role.name).join(', ') || 'N/A')
        .replace(/{user\.role_text_list}/g, context.member.roles.cache.map(role => `<@&${role.id}>`).join(', ') || 'N/A')
        .replace(/{user\.bot}/g, context.user.bot ? 'Yes' : 'No')
        .replace(/{user\.join_position}/g, context.joinPosition || 'Unknown')
        .replace(/{user\.join_position_suffix}/g, context.joinPositionSuffix || 'Unknown')
        .replace(/{channel\.name}/g, context.channel.name)
        .replace(/{channel\.id}/g, context.channel.id)
        .replace(/{channel\.mention}/g, `<#${context.channel.id}>`)
        .replace(/{channel\.topic}/g, context.channel.topic || 'No topic set')
        .replace(/{channel\.type}/g, context.channel.type)
        .replace(/{channel\.category_id}/g, context.channel.parentId || '')
        .replace(/{channel\.category_name}/g, context.channel.parent?.name || '')
        .replace(/{channel\.position}/g, context.channel.position.toString())
        .replace(/{channel\.slowmode_delay}/g, context.channel.rateLimitPerUser?.toString() || '0')
        .replace(/{guild\.name}/g, context.guild.name)
        .replace(/{guild\.id}/g, context.guild.id)
        .replace(/{guild\.count}/g, context.guild.memberCount.toString())
        .replace(/{guild\.region}/g, context.guild.region || 'Unknown')
        .replace(/{guild\.shard}/g, context.guild.shardId?.toString() || '')
        .replace(/{guild\.owner_id}/g, context.guild.ownerId)
        .replace(/{guild\.created_at}/g, `<t:${Math.floor(context.guild.createdTimestamp / 1000)}:F>`)
        .replace(/{guild\.created_at_timestamp}/g, `${Math.floor(context.guild.createdTimestamp / 1000)}`)
        .replace(/{guild\.emoji_count}/g, context.guild.emojis.cache.size.toString())
        .replace(/{guild\.role_count}/g, context.guild.roles.cache.size.toString())
        .replace(/{guild\.boost_count}/g, context.guild.premiumSubscriptionCount?.toString() || '0')
        .replace(/{guild\.boost_tier}/g, context.guild.premiumTier?.toString() || 'No Level')
        .replace(/{guild\.preferred_locale}/g, context.guild.preferredLocale || '')
        .replace(/{guild\.key_features}/g, context.guild.features.join(', ') || '')
        .replace(/{guild\.icon}/g, context.guild.iconURL({ dynamic: true }) || '')
        .replace(/{guild\.banner}/g, context.guild.bannerURL({ dynamic: true }) || '')
        .replace(/{guild\.splash}/g, context.guild.splashURL({ dynamic: true }) || '')
        .replace(/{guild\.discovery}/g, context.guild.discoverySplashURL({ dynamic: true }) || '')
        .replace(/{guild\.max_presences}/g, context.guild.maximumPresences?.toString() || 'Unknown')
        .replace(/{guild\.max_members}/g, context.guild.maximumMembers?.toString() || 'Unknown')
        .replace(/{guild\.max_video_channel_users}/g, context.guild.maxVideoChannelUsers?.toString() || 'Unknown')
        .replace(/{guild\.afk_timeout}/g, context.guild.afkTimeout?.toString() || 'Unknown')
        .replace(/{guild\.afk_channel}/g, context.guild.afkChannel?.name || 'N/A')
        .replace(/{guild\.channels}/g, context.guild.channels.cache.map(ch => ch.name).join(', ') || 'N/A')
        .replace(/{guild\.channels_count}/g, context.guild.channels.cache.size.toString())
        .replace(/{guild\.text_channels}/g, context.guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').map(ch => ch.name).join(', ') || 'N/A')
        .replace(/{guild\.text_channels_count}/g, context.guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').size.toString())
        .replace(/{guild\.voice_channels}/g, context.guild.channels.cache.filter(ch => ch.type === 'GUILD_VOICE').map(ch => ch.name).join(', ') || 'N/A')
        .replace(/{guild\.voice_channels_count}/g, context.guild.channels.cache.filter(ch => ch.type === 'GUILD_VOICE').size.toString())
        .replace(/{guild\.category_channels}/g, context.guild.channels.cache.filter(ch => ch.type === 'GUILD_CATEGORY').map(ch => ch.name).join(', ') || 'N/A')
        .replace(/{guild\.category_channels_count}/g, context.guild.channels.cache.filter(ch => ch.type === 'GUILD_CATEGORY').size.toString())
        .replace(/{date\.now}/g, new Date().toLocaleString('en-US', { timeZone: 'PST' }))
        .replace(/{date\.utc_timestamp}/g, Math.floor(Date.now() / 1000).toString())
        .replace(/{date\.now_proper}/g, new Date().toLocaleString('en-US', { timeZone: 'PST', month: 'long', day: 'numeric', year: 'numeric' }))
        .replace(/{time\.now}/g, new Date().toLocaleTimeString('en-US', { hour12: true, timeZone: 'PST' }))
        .replace(/{time\.now_military}/g, new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'PST' }))
        .replace(/{date\.utc_now}/g, new Date().toISOString())
        .replace(/{date\.utc_now_proper}/g, new Date().toLocaleString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }))
        .replace(/{time\.utc_now}/g, new Date().toLocaleTimeString('en-US', { hour12: true, timeZone: 'UTC' }))
        .replace(/{time\.utc_now_military}/g, new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }));
}

function getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    if (j == 1 && k != 11) return number + "st";
    if (j == 2 && k != 12) return number + "nd";
    if (j == 3 && k != 13) return number + "rd";
    return number + "th";
}