const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const LogsSchema = require('../../Database/Schemas/logs');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        const data = await LogsSchema.findOne({ guildId: message.guild.id });
        if (!data || !data.types.includes('messages') && !data.types.includes('all')) return;

        const channel = message.guild.channels.cache.get(data.channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('Message Deleted')
            .addFields(
                { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Channel', value: `${message.channel}`, inline: true },
                { name: 'Content', value: message.content || 'No content (embed/attachment)', inline: false }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => { });
    }
};
