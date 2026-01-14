const { Events, EmbedBuilder } = require('discord.js');
const LogsSchema = require('../../Database/Schemas/logs');

module.exports = {
    name: Events.GuildRoleCreate,
    async execute(role) {
        if (!role.guild) return;

        const data = await LogsSchema.findOne({ guildId: role.guild.id });
        if (!data || !data.types.includes('roles') && !data.types.includes('all')) return;

        const channel = role.guild.channels.cache.get(data.channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('> Role Created')
            .addFields(
                { name: '> Name', value: `> ${role.name}`, inline: true },
                { name: '> ID', value: `> ${role.id}`, inline: true },
                { name: '> Color', value: `> ${role.hexColor}`, inline: true }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => { });
    }
};
