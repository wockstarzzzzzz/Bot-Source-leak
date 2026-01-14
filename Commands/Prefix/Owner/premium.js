const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../emojis.json')
const fs = require('fs').promises;
const path = require('path');

const PREMIUM_FILE = path.join(__dirname, '../../../Database/Localdb/premium.json');

async function ensureFileExists() {
    try {
        try {
            await fs.access(PREMIUM_FILE);
            const content = await fs.readFile(PREMIUM_FILE, 'utf8');
            if (!content || content.trim() === '') {
                await fs.writeFile(PREMIUM_FILE, JSON.stringify([], null, 2));
            } else {
                try {
                    JSON.parse(content);
                } catch {
                    await fs.writeFile(PREMIUM_FILE, JSON.stringify([], null, 2));
                }
            }
        } catch {
            await fs.mkdir(path.dirname(PREMIUM_FILE), { recursive: true });
            await fs.writeFile(PREMIUM_FILE, JSON.stringify([], null, 2));
        }
    } catch {
        return [];
    }
}

async function loadPremiumUsers() {
    try {
        await ensureFileExists();
        const data = await fs.readFile(PREMIUM_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function savePremiumUsers(users) {
    try {
        await fs.writeFile(PREMIUM_FILE, JSON.stringify(users, null, 2));
    } catch {

    }
}

module.exports = {
    name: 'premium',
    description: 'Manage premium users',
    aliases: ['vip','donor'],
    cat: 'owner',
    async execute(message, args) {
        const ownerIds = ['344131223230087177', '763141886834769980', '1436451809903382599'];

        if (!ownerIds.includes(message.author.id)) {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.deny}`)
                    .setDescription(`${emojis.deny} You do not have permission to use this command.`)]
            }).catch(() => {});
            return;
        }

        if (!args.length) {
            await showAllPremiumUsers(message);
            return;
        }

        const subCommand = args[0].toLowerCase();
        const targetUser = args[1];

        if (!targetUser && subCommand !== 'show') {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.deny}`)
                    .setDescription(`${emojis.deny} You must provide an add/remove option then the user ID.`)]
            }).catch(() => {});
            return;
        }

        const userId = message.mentions.users.first()?.id || targetUser;

        switch (subCommand) {
            case 'add':
                await addPremiumUser(message, userId);
                break;
            case 'remove':
                await removePremiumUser(message, userId);
                break;
            case 'show':
                if (targetUser) {
                    await showPremiumUser(message, userId);
                } else {
                    await showAllPremiumUsers(message);
                }
                break;
            default:
                message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(`${config.deny}`)
                        .setDescription(`${emojis.deny} Invalid subcommand. Use \`add\`, \`remove\` or \`show\`.`)
                    ]
                }).catch(() => {});
        }
    }
};

async function addPremiumUser(message, userId) {
    try {
        const users = await loadPremiumUsers();
        if (users.some(user => user.id === userId)) {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.deny}`)
                    .setDescription(`${emojis.deny} This user is already premium.`)]
            }).catch(() => {});
            return;
        }

        const timestamp = Date.now();
        users.push({ id: userId, addedAt: timestamp });
        await savePremiumUsers(users);

        const user = await message.client.users.fetch(userId).catch(() => null);
        if (user) {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.approve}`)
                    .setTitle(`${emojis.approve} New User Premium`)
                    .setDescription(`**Name**: \`${user.tag}\`\n**ID**: \`${userId}\`\n**Dates**: <t:${Math.floor(timestamp/1000)}:d>`)]
            }).catch(() => {});
        }
    } catch {

    }
}

async function removePremiumUser(message, userId) {
    try {
        const users = await loadPremiumUsers();
        const userIndex = users.findIndex(user => user.id === userId);

        if (userIndex === -1) {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.deny}`)
                    .setDescription(`${emojis.deny} This user is not premium.`)]
            }).catch(() => {});
            return;
        }

        users.splice(userIndex, 1);
        await savePremiumUsers(users);

        const user = await message.client.users.fetch(userId).catch(() => null);
        if (user) {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.approve}`)
                    .setTitle(`${emojis.approve} Premium User Deleted`)
                    .setDescription(`**Name**: \`${user.tag}\`\n**ID**: \`${userId}\``)]
            }).catch(() => {});
        }
    } catch {

    }
}

async function showPremiumUser(message, userId) {
    try {
        const users = await loadPremiumUsers();
        const premiumUser = users.find(user => user.id === userId);

        if (!premiumUser) {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.deny}`)
                    .setDescription(`${emojis.deny} This user is not premium.`)]
            }).catch(() => {});
            return;
        }

        const user = await message.client.users.fetch(userId).catch(() => null);
        if (user) {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .addFields({ name: 'Info Premium', value: `> **Name**:\`${user.tag}\`\n> **ID**:\`${userId}\`\n> **Dates**: <t:${Math.floor(premiumUser.addedAt/1000)}:D>`, inline: false })]
            }).catch(() => {});
        }
    } catch {

    }
}

async function showAllPremiumUsers(message) {
    try {
        const users = await loadPremiumUsers();
        
        if (!users.length) {
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(`${config.deny}`)
                    .setDescription(`${emojis.deny} There are no registered premium users.`)]
            }).catch(() => {});
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(`${config.approve}`)
            .setTitle(`${emojis.approve} Premium Users`);

        const usersList = await Promise.all(users.map(async (user) => {
            const discordUser = await message.client.users.fetch(user.id).catch(() => null);
            return discordUser 
                ? `**Name**:\`${discordUser.tag}\`\n**ID**: \`${user.id}\`\n**Dates**: <t:${Math.floor(user.addedAt/1000)}:D>\n------------------\n`
                : `**Unknown User**\n**ID**: \`${user.id}\`\n**Dates**: <t:${Math.floor(user.addedAt/1000)}:D>\n`;
        }));

        embed.setDescription(usersList.join('\n'));
        message.reply({ embeds: [embed] }).catch(() => {});
    } catch {

    }
}