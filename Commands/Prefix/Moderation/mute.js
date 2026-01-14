const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const emojis = require('../../../emojis.json');
const config = require('../../../config.json');

module.exports = {
    name: "mute",
    cat: 'mod',
    description: "Mutes a user using Discord timeout with a specified duration and reason.",
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.warning}`)
                .setDescription("You don't have permission to mute members.");
            return message.reply({ embeds: [errorEmbed] });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.warning}`)
                .setDescription("I don't have permission to mute members.");
            return message.reply({ embeds: [errorEmbed] });
        }

        if (args.length < 2) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("Usage: !mute <@user or ID> <time> [reason]");
            return message.reply({ embeds: [errorEmbed] });
        }

        let member;
        try {
            const userId = args[0].replace(/[<@!>]/g, '');
            member = message.mentions.members.first() || await message.guild.members.fetch(userId);
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("Couldn't find that user.");
            return message.reply({ embeds: [errorEmbed] });
        }

        if (!member.moderatable) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("I can't mute that user.");
            return message.reply({ embeds: [errorEmbed] });
        }

        if (member.id === message.author.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("You can't mute yourself.");
            return message.reply({ embeds: [errorEmbed] });
        }

        const timeStr = args[1];
        const timeoutMs = parseTime(timeStr);
        if (!timeoutMs) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("Invalid time format. Use e.g., 30m, 1h, 2d.");
            return message.reply({ embeds: [errorEmbed] });
        }

        if (timeoutMs > 28 * 24 * 60 * 60 * 1000) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("Timeout duration can't exceed 28 days.");
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(2).join(' ') || "No reason provided";

        try {
            await member.timeout(timeoutMs, reason);

            const embed = new EmbedBuilder()
                .setColor(`${config.approve}`)
                .setTitle("User Muted")
                .setDescription(`**User:** <@${member.id}>\n**Duration:** ${timeStr}\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("Failed to mute the user.");
            return message.reply({ embeds: [errorEmbed] });
        }
    }
};

function parseTime(timeStr) {
    const regex = /^(\d+)([smhd])$/i;
    const match = timeStr.match(regex);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 's': return amount * 1000;
        case 'm': return amount * 60 * 1000;
        case 'h': return amount * 60 * 60 * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000;
        default: return null;
    }
}