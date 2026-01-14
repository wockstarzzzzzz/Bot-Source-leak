const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../emojis.json')
const config = require('../../../config.json')

const ownerIds = ['344131223230087177', '763141886834769980', '1436451809903382599'];

module.exports = {
    name: 'leaveserver',
    cat: 'owner',
    aliases: ['leave', 'exitserver'],
    description: 'para sacar el bot de servers',
    async execute(message, args) {

        if (!ownerIds.includes(message.author.id)) {
            return;
        }

        try {

            if (!args[0]) {
                return message.channel.send('Debes proporcionar el ID del servidor.');
            }


            const guild = message.client.guilds.cache.get(args[0]);
            
            if (!guild) {
                return message.channel.send('No se encontró el servidor.');
            }

            const guildName = guild.name;
            

            await guild.leave();
            
            const embed = new EmbedBuilder()
                .setColor(`${config.approve}`)
                .setDescription(`${emojis.approve} Expulsado exitosamente:\n\n> **${guildName}**ㅤㅤID: \`${args[0]}\``)
                .setFooter({ text: `Servidores restantes: ${message.client.guilds.cache.size}` });

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error sacar bot de servers:', error);
            message.channel.send('Error al intentar salir del servidor.');
        }
    },
};