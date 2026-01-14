const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'deletechannel',
    aliases: ['delchannel'],
    cat: 'mod',
    description: 'Delete channel',
    async execute(message, args) {

        if (!message.guild.members.me.permissions.has([PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.SendMessages])) {
            return;
        }


        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('You need the \`Manage Channels\` permission.')
                ]
            });
        }

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setTitle('delchannel command')
                        .setDescription('This command is to see minecraft skin\n\`\`\`Syntax: ,delchannel <id or name [mention]>\nExample: ,delchannel #general\`\`\`')
                ]
            });
        }


        let channel = 
            message.mentions.channels.first() || 
            message.guild.channels.cache.get(args[0]);

        if (!channel) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('Channel not found.')
                ]
            });
        }


        if (!channel.deletable) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('I cannot delete this channel.')
                ]
            });
        }


        try {
            await channel.delete();
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`${message.author}: Sucessfully Channel **${channel.name}** delete.`)
                ]
            });
        } catch (error) {
            console.error(error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('An error occurred while trying to delete the channel.')
                ]
            });
        }
    }
};
