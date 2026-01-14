const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const PrefixModel = require('../../../Database/Schemas/prefix');

module.exports = {
    name: 'botinfo',
    cat: 'general',
    aliases: ['bi', 'bot', 'about'],
    description: 'Get bot information',
    async execute(message, args) {
        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks)) {
            return;
        }

        try {
            let botUser;
            const myBotId = '1449779503546241197';

            if (message.mentions.users.first()) {
                botUser = message.mentions.users.first();
            } else if (args[0]) {
                try {
                    botUser = await message.client.users.fetch(args[0]);
                } catch (error) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder().setColor('#2b2d31').setDescription('Could not find a bot with that ID.')]
                    });
                }
            } else {
                botUser = await message.client.users.fetch(myBotId);
            }

            if (!botUser.bot) {
                return message.channel.send({
                    embeds: [new EmbedBuilder().setColor('#2b2d31').setDescription('The provided user is not a bot.')]
                });
            }

            const uptime = message.client.uptime;
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

            const uptimeString = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

            const botCreatedAt = `<t:${Math.floor(message.client.user.createdTimestamp / 1000)}:R>`;

            if (botUser.id === myBotId) {
                const countLinesAndFiles = (dirPath) => {
                    let totalLines = 0;
                    let totalFiles = 0;

                    const countRecursive = (currentPath) => {
                        const files = fs.readdirSync(currentPath);

                        files.forEach(file => {
                            const fullPath = path.join(currentPath, file);
                            const stat = fs.statSync(fullPath);

                            if (stat.isDirectory()) {
                                if (file === 'node_modules') return;
                                countRecursive(fullPath);
                            } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.json'))) {
                                totalFiles++;
                                const content = fs.readFileSync(fullPath, 'utf-8');
                                totalLines += content.split('\n').length;
                            }
                        });
                    };

                    countRecursive(dirPath);
                    return { totalFiles, totalLines };
                };

                const projectStats = countLinesAndFiles(path.join(__dirname, '..'));

                let serverPrefix = ',';
                try {
                    const prefixDoc = await PrefixModel.findOne({ guildId: message.guild.id });
                    if (prefixDoc) {
                        serverPrefix = prefixDoc.prefix;
                    }
                } catch (error) {
                    console.error('Error fetching server prefix:', error);
                }


                const cpuUsage = (os.loadavg()[0] * 100 / os.cpus().length).toFixed(2);
                const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2); 

                const embed = new EmbedBuilder()
                    .setThumbnail(botUser.displayAvatarURL())
                    .setAuthor({ name: botUser.username, iconURL: botUser.displayAvatarURL() })
                    .setDescription(`Developed and maintained by [Alone Team](https://discord.gg/XVtaGhjNZC)\nUtilizing \`${projectStats.totalFiles}\` commands\nWritten in \`${projectStats.totalLines.toLocaleString()}\` lines of JavaScript.`)
                    .addFields(
                        {
                            name: "Bot",
                            value: `>>> **Users**: \`${message.client.users.cache.size}\`\n**Servers**: \`${message.client.guilds.cache.size}\`\n**Created**: ${botCreatedAt}`,
                            inline: true
                        },
                        {
                            name: "System",
                            value: `>>> **CPU**: \`${cpuUsage}%\`\n**Memory**: \`${memoryUsage} GB\`\n**Launched**: <t:${Math.floor((Date.now() - message.client.uptime) / 1000)}:R>`,
                            inline: true
                        }
                    )
                    .setColor('#2b2d31');

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Support')
                            .setURL('https://discord.gg/XVtaGhjNZC')
                            .setStyle(ButtonStyle.Link),
                        new ButtonBuilder()
                            .setLabel('Invite')
                            .setURL(`https://discord.com/oauth2/authorize?client_id=${message.client.user.id}`)
                            .setStyle(ButtonStyle.Link)
                    );

                return message.channel.send({ embeds: [embed], components: [row] });
            }


            try {
                const response = await axios.get(`https://discord.com/api/v10/applications/${botUser.id}/rpc`, {
                    headers: {
                        'Authorization': `Bot ${message.client.token}`
                    }
                });

                const botInfo = response.data;

                let requiredPermissions = botInfo.install_params?.permissions || '70368744177655';
                const permissionsObj = new PermissionsBitField(BigInt(requiredPermissions));
                const readablePermissions = permissionsObj.toArray().map(perm => `\`${perm}\``).join(', ');

                const botDescription = botInfo.description || 'No description available.';
                const botTerms = botInfo.terms_of_service_url || null;
                const botPrivacyPolicy = botInfo.privacy_policy_url || null;

                const inviteLink = `https://discord.com/oauth2/authorize?client_id=${botUser.id}&permissions=${requiredPermissions}&scope=bot%20applications.commands`;

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setAuthor({ name: botUser.username, iconURL: botUser.displayAvatarURL() })
                    .setThumbnail(botUser.displayAvatarURL())
                    .setDescription(botDescription)
                    .setFooter({
                        text: `Requested by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true }),
                    });

                if (botTerms || botPrivacyPolicy) {
                    embed.addFields(
                        { 
                            name: 'Links', 
                            value: `${botTerms ? `[Terms of Service](${botTerms})\n` : ''}${botPrivacyPolicy ? `[Privacy Policy](${botPrivacyPolicy})` : ''}`, 
                            inline: true 
                        }
                    );
                }

                embed.addFields(
                    { 
                        name: 'Bot', 
                        value: `Application is ${botInfo.bot_public ? 'public' : 'private'}.\n[Invite App](${inviteLink})`, 
                        inline: true 
                    }
                );

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Add to Server')
                            .setStyle(ButtonStyle.Link)
                            .setURL(inviteLink)
                    );

                return message.channel.send({ embeds: [embed], components: [row] });

            } catch (error) {
                console.error('Error getting bot information:', error);
                return message.channel.send({
                    embeds: [new EmbedBuilder().setColor('#8dd6ff').setDescription('There was an error getting detailed information about the bot.')]
                });
            }

        } catch (error) {
            console.error('Failed to process botinfo command:', error);
            return message.channel.send({
                embeds: [new EmbedBuilder().setColor('#8dd6ff').setDescription('An unexpected error occurred.')]
            });
        }
    },
};