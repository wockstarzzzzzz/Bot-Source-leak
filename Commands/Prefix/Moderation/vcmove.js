const { PermissionsBitField, EmbedBuilder, ChannelType } = require("discord.js");
const emojis = require('../../../emojis.json');

module.exports = {
    name: 'vcmove',
    ownerPermit: false,
    adminPermit: true,
    punitop: false,
    cat: 'mod',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.deny} You don't have permission to move members.`);
            return message.reply({ embeds: [embed] });
        }

        const botMember = message.guild.members.me;
        if (!botMember.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.deny} I don't have permission to move members.`);
            return message.reply({ embeds: [embed] });
        }

        let member = message.mentions.members.first();
        
        if (!member && args[0]) {
            const userId = args[0].replace(/[<@!>]/g, '');
            member = message.guild.members.cache.get(userId);
        }

        if (!member) {
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.warning} You must mention a user or provide their ID.`);
            return message.reply({ embeds: [embed] });
        }

        if (!member.voice.channel) {
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.warning} ${member} is not in a voice channel.`);
            return message.reply({ embeds: [embed] });
        }

        if (member.user.bot) {
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.warning} I cannot move bots.`);
            return message.reply({ embeds: [embed] });
        }

        let voiceChannel;
        
        if (args[1] && args[1].startsWith('<#') && args[1].endsWith('>')) {
            const channelId = args[1].slice(2, -1);
            voiceChannel = message.guild.channels.cache.get(channelId);
        }
        else if (args[1] && args[1].includes('discord.com/channels/')) {
            const channelId = args[1].split('/').pop();
            voiceChannel = message.guild.channels.cache.get(channelId);
        }
        else if (args[1]) {
            voiceChannel = message.guild.channels.cache.get(args[1]);
        }
        else if (args[1]) {
            voiceChannel = message.guild.channels.cache.find(channel => 
                channel.name.toLowerCase().includes(args[1].toLowerCase()) && 
                channel.type === ChannelType.GuildVoice
            );
        }

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.warning} Please provide a valid voice channel (mention, ID, or name).`);
            return message.reply({ embeds: [embed] });
        }

        if (voiceChannel.type !== ChannelType.GuildVoice) {
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.warning} ${voiceChannel} is not a voice channel.`);
            return message.reply({ embeds: [embed] });
        }

        const botPermissions = voiceChannel.permissionsFor(botMember);
        if (!botPermissions.has(PermissionsBitField.Flags.Connect) || 
            !botPermissions.has(PermissionsBitField.Flags.ViewChannel)) {
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.warning} I don't have permission to connect to ${voiceChannel}.`);
            return message.reply({ embeds: [embed] });
        }

        if (voiceChannel.userLimit > 0 && voiceChannel.members.size >= voiceChannel.userLimit) {
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.warning} ${voiceChannel} is full.`);
            return message.reply({ embeds: [embed] });
        }

        try {
            await member.voice.setChannel(voiceChannel);
            
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.approve} ${member} has been moved to ${voiceChannel}.`);
            return message.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error moving member:', error);
            
            const embed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`${emojis.warning} Unable to move ${member}. Error: ${error.message}`);
            return message.reply({ embeds: [embed] });
        }
    },
};