const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild, client) {

        const defaultChannel = guild.systemChannel || guild.channels.cache.find(
            channel =>
                channel.type === 0 &&
                channel.permissionsFor(guild.members.me).has('SendMessages')
        );

        if (!defaultChannel) return;

        const botName = client.user.username;

        const embed = new EmbedBuilder()
            .setColor('#2f3136')
            .setAuthor({
                name: `${botName} is now in your server!`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`## [Need Help?](https://alone.vercel.app/)\nJoin our [support server](https://discord.gg/XVtaGhjNZC) for help`)
            .addFields(
                {
                    name: `${botName}'s default prefix is set to \`,\``,
                    value:
                        '> To change the prefix use `,prefix set (prefix)`\n' +
                        `> Ensure the bot's role is within the guild's top 5 roles for ${botName} to function correctly`,
                    inline: false
                }
            );

        try {
            await defaultChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Could not send the welcome embed to the server ${guild.name}:`, error);
        }
    },
};
