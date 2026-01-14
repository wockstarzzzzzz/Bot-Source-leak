const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'minecraftskin',
    aliases: ['mcskin', 'skin'],
    description: 'Minecraft skin',
    async execute(message, args) {

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
            return;
        }

        const username = args[0];
        if (!username) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setTitle('Minecraft Skin Command')
                        .setDescription('This command is to see a Minecraft skin.\n```Syntax: ,minecraftskin [username]\nExample: ,minecraftskin VegettaGaymer```')
                ]
            });
        }

        try {
            const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);

            if (!mojangResponse.ok) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription('Could not find a Minecraft account with that username.')
                    ]
                });
            }

            const mojangData = await mojangResponse.json();
            const uuid = mojangData.id;
            const skinURL = `https://visage.surgeplay.com/full/256/${uuid}`;

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle(`${mojangData.name}`)
                .setURL(`https://laby.net/@${uuid}`)
                .setImage(skinURL)
                .setFooter({
                    text: `Requested by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true }),
                });

            return message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('An error occurred while fetching the Minecraft skin.')
                ]
            });
        }
    }
};
