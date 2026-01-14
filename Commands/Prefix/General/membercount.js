const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'membercount',
    aliases: ['mc'],
    cat: 'general',
    description: 'member count',
    async execute(message, args) {
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
            return; 
        }

        let guild = message.guild;
        if (args[0]) {
            try {
                guild = await message.client.guilds.fetch(args[0]);
            } catch {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription(`${message.author}: server not found`),
                    ],
                });
            }
        }


        const totalMembers = guild.memberCount;
        const humans = guild.members.cache.filter(member => !member.user.bot).size;
        const bots = totalMembers - humans;


        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
            })
            .addFields(
                { name: 'Members', value: totalMembers.toString(), inline: true },
                { name: 'Humans', value: humans.toString(), inline: true },
                { name: 'Bots', value: bots.toString(), inline: true }
            );


        message.channel.send({ embeds: [embed] });
    },
};
