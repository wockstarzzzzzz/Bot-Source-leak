const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: 'roleinfo',
    cat: 'general',
    aliases: ['ri', 'rolinfo'],
    description: 'role info',
    async execute(message, args) {

        if (!message.channel.permissionsFor(message.guild.members.me).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
            return; 
        }

        let role;
        
        if (message.mentions.roles.size > 0) {
            role = message.mentions.roles.first();
        } else if (args.length > 0) {
            role = message.guild.roles.cache.get(args[0]) || 
                   message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());
        } else {
            const memberRoles = message.member.roles.cache
                .filter(r => r.id !== message.guild.id)
                .sort((a, b) => b.position - a.position);

            role = memberRoles.first();
        }

        if (!role) {
            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription("> You don't have any roles to display information about.")
                .setFooter({ 
                    text: message.author.tag,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                });
            return message.reply({ embeds: [embed] });
        }

        function formatDate(date) {
            return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
        }

        function getKeyPermissions(role) {
            const keyPerms = {
                Administrator: role.permissions.has('Administrator'),
                ManageGuild: role.permissions.has('ManageGuild'),
                ManageRoles: role.permissions.has('ManageRoles'),
                ManageChannels: role.permissions.has('ManageChannels'),
                ManageMessages: role.permissions.has('ManageMessages'),
                KickMembers: role.permissions.has('KickMembers'),
                BanMembers: role.permissions.has('BanMembers'),
                MentionEveryone: role.permissions.has('MentionEveryone')
            };

            
            return Object.entries(keyPerms)
                .filter(([_, has]) => has)
                .map(([perm]) => perm)
                .join(', ') || 'None';
        }

        let roleEmoji = '';
        if (role.unicodeEmoji) {
            roleEmoji = `\n• Emoji: ${role.unicodeEmoji}`;
        } else if (role.tags?.emoji) {
            const emoji = message.guild.emojis.cache.get(role.tags.emoji);
            if (emoji) roleEmoji = `\n• Emoji: ${emoji}`;
        }

        const embed = new EmbedBuilder()
            .setColor(role.color || '#2b2d31')
            .setTitle(`Role Information: ${role.name}`)
            .addFields(
                {
                    name: '__Information__',
                    value: `>>> - **Role**: ${role}\n- **ID**: \`${role.id}\`\n- **Created**: ${formatDate(role.createdAt)}\n- **Position**: \`${role.position}\` of \`${message.guild.roles.cache.size}\`${roleEmoji}`,
                    inline: true
                },
                {
                    name: '__Role Settings__',
                    value: `>>> - **Color**: \`${role.hexColor.toUpperCase()}\`\n- **Hoisted**: \`${role.hoist ? 'Yes' : 'No'}\`\n- **Mentionable**: \`${role.mentionable ? 'Yes' : 'No'}\`\n- **Integrated**: \`${role.managed ? 'Yes' : 'No'}\``,
                    inline: true
                },
                {
                    name: '__Permissions__',
                    value: `\`${getKeyPermissions(role)}\``,
                    inline: false
                },
                {
                    name: '__Statistics__',
                    value: `>>> - **Members**: \`${role.members.size}\`\n- **Bot role**: \`${role.managed ? 'Yes' : 'No'}\`\n- **Icon**: \`${role.icon ? 'Yes' : 'No'}\`\n- **Tags**: \`${role.tags ? 'Yes' : 'No'}\``,
                    inline: true
                },
                {
                    name: '__Display__',
                    value: `>>> - **Displayed separately**: \`${role.hoist ? 'Yes' : 'No'}\`\n- **Allow mentions**: \`${role.mentionable ? 'Yes' : 'No'}\``,
                    inline: true
                }
            )
            .setFooter({ 
                text: message.author.tag,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        if (role.icon) {
            embed.setThumbnail(role.iconURL({ dynamic: true }));
        }

        await message.channel.send({ embeds: [embed] });
    }
};