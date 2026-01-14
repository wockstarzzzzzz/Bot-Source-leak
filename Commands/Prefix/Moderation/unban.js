const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const emojis = require('../../../emojis.json')

module.exports = {
    name: "unban",
    aliases: ["ub"],
    cat: 'mod',
    description: "Unban a user from the server",
    execute: async (message, args) => {

        const hasSendPermissions = message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.SendMessages);
        const hasEmbedPermissions = message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.EmbedLinks);


        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            if (hasSendPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.deny} You don't have permission to unban members.`)
                    ]
                });
            }
            return;
        }

        if (!args[0]) {
            if (hasSendPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setTitle('Unban Command')
                        .setDescription('This command can unban users.\n```Syntax: ,unban <user_id>\nUsage: ,unban 1230582800773580659```')
                    ]
                });
            }
            return;
        }

        try {
            const bans = await message.guild.bans.fetch();
            let reason = args.slice(1).join(' ') || 'No reason provided';

            const userId = args[0];
            const bannedUser = bans.get(userId);

            if (!bannedUser) {
                if (hasSendPermissions) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription(`> ${emojis.warning} I couldn't find that user in the ban list.`)
                        ]
                    });
                }
                return;
            }

            await message.guild.members.unban(userId, `${message.author.tag} | ${reason}`);

            if (hasSendPermissions && hasEmbedPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.approve} Successfully **Unbanned** ${bannedUser.user.tag}`)
                    ]
                });
            }
        } catch (err) {
            console.error(err);
            if (hasSendPermissions && hasEmbedPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.warning} An error occurred while trying to unban the user. Check my permissions.`)
                    ]
                });
            }
        }
    }
};
