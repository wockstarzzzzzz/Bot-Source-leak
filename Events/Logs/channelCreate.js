const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const LogsSchema = require('../../Database/Schemas/logs');

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        if (!channel.guild) return;

        const data = await LogsSchema.findOne({ guildId: channel.guild.id });
        if (!data || !data.types.includes('channels') && !data.types.includes('all')) return;

        const logChannel = channel.guild.channels.cache.get(data.channelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('> Channel Created')
            .addFields(
                { name: '> Name', value: `> ${channel.name}`, inline: true },
                { name: '> Type', value: `> ${channel.type}`, inline: true },
                { name: '> ID', value: `> ${channel.id}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => { });
    }
};
