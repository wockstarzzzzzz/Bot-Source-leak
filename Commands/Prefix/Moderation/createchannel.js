const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'createchannel',
    aliases: ['createch', 'newchannel'],
    cat: 'mod',
    description: 'Create a new channel',
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


        if (!args[0] || !args[1]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setTitle('createchannel command')
                        .setDescription('This command can create channels\n\`\`\`Syntax: ,createchannel  [voice][text] [name]\nExample: ,createchannel voice developers\`\`\`')
                ]
            });
        }


        const type = args[0].toLowerCase();
        if (!['text', 'voice'].includes(type)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('Invalid channel type! Use `text` or `voice` as the first argument.')
                ]
            });
        }


        const name = args.slice(1).join(' ');
        if (!name || name.length > 100) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('Please provide a valid name.')
                ]
            });
        }


        try {
            const newChannel = await message.guild.channels.create({
                name,
                type: type === 'text' ? 0 : 2, 
                reason: `Channel created by ${message.author.tag}`
            });

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`${message.author}: Successfully created ${type === 'text' ? 'text' : 'voice'} channel: **${newChannel}**`)
                ]
            });
        } catch (error) {
            console.error(error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('An error occurred while trying to create the channel.')
                ]
            });
        }
    }
};
