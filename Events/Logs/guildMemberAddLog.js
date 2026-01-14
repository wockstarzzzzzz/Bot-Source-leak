const { Events, EmbedBuilder } = require('discord.js');
const LogsSchema = require('../../Database/Schemas/logs');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const data = await LogsSchema.findOne({ guildId: member.guild.id });
        if (!data || !data.types.includes('members') && !data.types.includes('all')) return;

        const channel = member.guild.channels.cache.get(data.channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('> Member Joined')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: '> User', value: `> ${member.user.tag} (${member.id})`, inline: true },
                { name: '> Account Created', value: `> <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '> Member Count', value: `> ${member.guild.memberCount}`, inline: false }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => { });
    }
};
