const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const emojis = require('../../../emojis.json')

module.exports = {
    name: "ban",
    aliases: ["b"],
    description: "Ban a user from the server",
    cat: 'mod',
    execute: async (message, args) => {

        const hasSendPermissions = message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.SendMessages);
        const hasEmbedPermissions = message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.EmbedLinks);


        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            if (hasSendPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.warning} You don't have the required permissions to ban users.`)
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
                        .setTitle('Ban Command')
                        .setDescription('This command can ban users.\n```Syntax: ,ban <id or username>\nUsage: ,ban @user```')
                    ]
                });
            }
            return;
        }

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            if (hasSendPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.warning} Please provide a valid mention or ID.`)
                    ]
                });
            }
            return;
        }

        let reason = args.slice(1).join(' ') || 'No reason provided';

        if (user.id === message.guild.ownerId) {
            if (hasSendPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.deny} You cannot **Ban** the Server Owner.`)
                    ]
                });
            }
            return;
        }

        if (user.id === message.member.id) {
            if (hasSendPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.deny} You cannot **Ban** yourself.`)
                    ]
                });
            }
            return;
        }

        if (!user.bannable) {
            if (hasSendPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.warning} I cannot **Ban** that user. Check my role position and permissions.`)
                    ]
                });
            }
            return;
        }

        try {
            await message.guild.members.ban(user.id, { reason: `${message.author.tag} | ${reason}` });

            if (hasSendPermissions && hasEmbedPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.approve} Successfully **Banned** ${user.user.tag}`)
                    ]
                });
            }
        } catch (err) {
            console.error(err);
            if (hasSendPermissions && hasEmbedPermissions) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.approve} I couldn't **Ban** that user. Check my permissions.`)
                    ]
                });
            }
        }
    }
};
