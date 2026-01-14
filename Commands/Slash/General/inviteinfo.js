const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inviteinfo')
        .setDescription('Get server information through its vanity URL')
        .addStringOption(option =>
            option
                .setName('vanity')
                .setDescription('Server vanity URL')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({
                content: 'This command can only be used in a server.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
            return interaction.reply({
                content: 'I need the **Embed Links** permission.',
                flags: MessageFlags.Ephemeral
            });
        }

        const vanityURL = interaction.options.getString('vanity');

        try {
            const response = await fetch(
                `https://discord.com/api/v10/invites/${vanityURL}?with_counts=true&with_expiration=true`
            );
            const invite = await response.json();

            if (!response.ok || !invite.guild) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription('Invite not found')
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const guildCreatedAt = new Date(invite.guild.id / 4194304 + 1420070400000);
            const guildCreatedTimestamp = Math.floor(guildCreatedAt.getTime() / 1000);

            const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Very High'];
            const verificationLevel =
                verificationLevels[invite.guild.verification_level] || 'Unknown';

            const channelTypes = {
                0: 'Text',
                2: 'Voice',
                4: 'Category',
                5: 'Announcement',
                13: 'Stage',
                14: 'Forum'
            };
            const channelType = channelTypes[invite.channel.type] || 'Unknown';

            let iconURL = null;
            if (invite.guild.icon) {
                const isGif = invite.guild.icon.startsWith('a_');
                iconURL = `https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}.${isGif ? 'gif' : 'png'}?size=1024`;
            }

            let bannerURL = null;
            if (invite.guild.banner) {
                const isGif = invite.guild.banner.startsWith('a_');
                bannerURL = `https://cdn.discordapp.com/banners/${invite.guild.id}/${invite.guild.banner}.${isGif ? 'gif' : 'png'}?size=1024`;
            }

            const description = `
**ID:** \`${invite.guild.id}\`
**Created:** <t:${guildCreatedTimestamp}:F>
**Members:** ${invite.approximate_member_count.toLocaleString()}
**Members Online:** ${invite.approximate_presence_count.toLocaleString()}
**Verification Level:** ${verificationLevel}

**Channel Name:** ${invite.channel.name} (\`${channelType}\`)
**Channel ID:** \`${invite.channel.id}\`
            `;

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle(`Invite Info: ${invite.guild.name}`)
                .setDescription(description);

            if (iconURL) embed.setThumbnail(iconURL);
            if (bannerURL) embed.setImage(bannerURL);

            await interaction.reply({ embeds: [embed] });

        } catch {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('Invite not found')
                ],
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
