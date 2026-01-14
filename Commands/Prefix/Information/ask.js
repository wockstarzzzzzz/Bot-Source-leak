const { EmbedBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');
const emojis = require('../../../emojis.json');
const config = require('../../../config.json');
require('dotenv').config();

const ai = new GoogleGenAI({
    apiKey: process.env.gemini
});

module.exports = {
    name: 'gemini',
    aliases: ['ask', 'askgpt', 'gpt'],
    async execute(message, args, prefix) {
        const prompt = args.join(' ');
        if (!prompt) {
            const helpEmbed = new EmbedBuilder()
                .setAuthor({
                    name: 'bender help',
                    iconURL: message.client.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle('**Command: ask**')
                .setColor('#3d3e42')
                .addFields([{
                    name: 'Ask a question using the Gemini API',
                    value: `\`\`\`Syntax: ${prefix}gemini (question)\nExample: ${prefix}gemini am i cute?\`\`\``
                }]);

            return message.channel.send({ embeds: [helpEmbed] });
        }

        if (!process.env.gemini) {
            return message.channel.send({
                content: `${emojis.warn} API key not found. Check your .env file.`,
                allowedMentions: { repliedUser: false }
            });
        }

        await message.channel.sendTyping();

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });

            const aiResponse = response.text.replace(
                new RegExp(`<@!?${message.author.id}>`, 'g'),
                message.author.username
            );

            await message.channel.send({
                content: aiResponse.length > 2000
                    ? aiResponse.slice(0, 1950) + '...'
                    : aiResponse,
                allowedMentions: { repliedUser: false }
            });

        } catch (error) {
            console.error(error);
            const api = new EmbedBuilder()
                .setColor(`${config.warning}`)
                .setDescription(`${emojis.warning} ${message.author}: **API** returned an error - try again later`);
            await message.channel.send({ embeds: [api] });
        }
    }
};
