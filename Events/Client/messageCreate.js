const { getPrefix } = require('../../Handlers/prefixHandler');
const AFKSchema = require("../../Database/Schemas/afk");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: "messageCreate",
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;

        const mentionedUsers = message.mentions.users;

        if (mentionedUsers.size > 0) {
            for (const [userId, user] of mentionedUsers) {
                const afkUser = await AFKSchema.findOne({ userId: userId });

                if (afkUser) {
                    const mentionEmbed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`<@${userId}> is afk for: **${afkUser.reason}**, pls do not disturb.`);

                    await message.channel.send({ embeds: [mentionEmbed] });
                }
            }
        }

        const authorAFK = await AFKSchema.findOne({ userId: message.author.id });

        if (authorAFK) {
            const timeAway = Date.now() - authorAFK.timestamp;
            const seconds = Math.floor(timeAway / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            let timeString = '';
            if (days > 0) timeString += `${days} days `;
            if (hours % 24 > 0) timeString += `${hours % 24} horus `;
            if (minutes % 60 > 0) timeString += `${minutes % 60} minutes `;
            if (seconds % 60 > 0) timeString += `${seconds % 60} seconds `;

            await AFKSchema.findOneAndDelete({ userId: message.author.id });

            const welcomeBackEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`👋 ${message.author}: Welcome back, you were away for **${timeString}**`);

            await message.channel.send({ embeds: [welcomeBackEmbed] });
        }

        const prefix = await getPrefix(message.guild.id);

        const botMention = message.mentions.users.first();
        if (botMention && botMention.id === client.user.id) {
            if (message.content.trim() === `<@${client.user.id}>`) {
                const prefixEmbed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setTitle(':magic_wand: ▸ Prefix')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`> My prefix for the server is: \`${prefix}\`\n> You can use \`${prefix}help\`  to see all my commands.`);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Support')
                            .setURL('https://discord.gg/XVtaGhjNZC')
                            .setStyle(ButtonStyle.Link),
                        new ButtonBuilder()
                            .setLabel('Invite')
                            .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}`)
                            .setStyle(ButtonStyle.Link)
                    );

                return message.channel.send({ embeds: [prefixEmbed], components: [row] });
            }

            const args = message.content.split(/ +/);
            const mentionIndex = args.findIndex(arg => arg === `<@${client.user.id}>`);
            if (mentionIndex !== 0) return;
            args.shift();
            if (args.length === 0) return;

            const commandName = args.shift().toLowerCase();
            const command = client.prefixes.get(commandName);

            if (!command) return;

            try {
                await command.execute(message, args);
            } catch (error) {
                console.error(error);
                message.reply('There was an error executing that command.');
            }
            return;
        }

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.prefixes.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error executing that command.');
        }
    },
};
