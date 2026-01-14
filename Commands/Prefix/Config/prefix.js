const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const emojis = require('../../../emojis.json')
const Guild = require('../../../Database/Schemas/prefix');

module.exports = {
    name: 'prefix',
    cat: 'config',
    description: 'Set or reset the server prefix',
    async execute(message, args) {
        try {

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
                try {
                    await message.author.send({
                        content: `I need the \`Embed Links\` permission in ${message.guild.name} to use the prefix command. Please make sure I have the correct permissions and try again.`
                    });
                } catch {

                }
                return;
            }

            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(`${config.warning}`)
                        .setDescription(`${emojis.warning} You require \`Manage Guild\` permissions to change the server prefix.`)
                    ]
                }).catch(() => {});
            }

            if (!args.length) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle('Prefix Command')
                        .setDescription('This command can set a guild custom prefix.\n```\nSyntax: prefix <action> <prefix>\nExample: prefix set !\nExample: prefix reset```')
                        .setColor('#2f3136')
                    ]
                }).catch(() => {});
            }

            const action = args[0].toLowerCase();

            if (action === 'set') {
                if (!args[1]) {
                    return message.reply({
                        embeds: [new EmbedBuilder()
                            .setColor(`${config.deny}`)
                            .setDescription(`${emojis.deny} You must provide a prefix to set.`)
                        ]
                    }).catch(() => {});
                }

                const newPrefix = args[1];

                if (newPrefix.length > 3) {
                    return message.reply({
                        embeds: [new EmbedBuilder()
                            .setColor(`${config.deny}`)
                            .setDescription(`${emojis.deny} You cannot set more than three characters as a prefix.`)
                        ]
                    }).catch(() => {});
                }

                if (args[2]) {
                    return message.reply({
                        embeds: [new EmbedBuilder()
                            .setColor(`${config.deny}`)
                            .setDescription(`${emojis.deny} You cannot set a second argument as a prefix.`)
                        ]
                    }).catch(() => {});
                }

                try {
                    await Guild.findOneAndUpdate(
                        { guildId: message.guild.id },
                        { prefix: newPrefix },
                        { upsert: true, new: true }
                    );

                    return message.reply({
                        embeds: [new EmbedBuilder()
                            .setColor(`${config.approve}`)
                            .setDescription(`${emojis.approve} Guild prefix has been set to - \`${newPrefix}\``)
                        ]
                    }).catch(() => {});
                } catch {
                    return;
                }
            }

            if (action === 'reset') {
                const defaultPrefix = ',';
                
                try {
                    await Guild.findOneAndUpdate(
                        { guildId: message.guild.id },
                        { prefix: defaultPrefix },
                        { upsert: true, new: true }
                    );

                    return message.reply({
                        embeds: [new EmbedBuilder()
                            .setColor(`${config.approve}`)
                            .setDescription(`${emojis.approve} Successfully reset the guild prefix to - \`${defaultPrefix}\``)
                        ]
                    }).catch(() => {});
                } catch {
                    return;
                }
            }

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.deny}`)
                    .setDescription(`${emojis.deny} Invalid action. Use \`prefix\` for help.`)
                ]
            }).catch(() => {});

        } catch {
            return;
        }
    },
};