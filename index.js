const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { User, Message, GuildMember, ThreadMember } = Partials;
const mongoose = require("mongoose");
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');
require('dotenv').config();

const client = new Client({
    shards: getInfo().SHARDS, 
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
    ],
    partials: [User, Message, GuildMember, ThreadMember]
});

client.cluster = new ClusterClient(client);

const { loadEvents } = require("./Handlers/eventsHandler");

client.events = new Collection();
client.commands = new Collection();
client.prefixs = new Collection();


(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`[CLUSTER ${client.cluster.id}] Conectado a MONGODB.`);
    } catch (error) {
        console.error(`[CLUSTER ${client.cluster.id}] Error MONGODB:`, error);
    }
})();

loadEvents(client);

require(`./Handlers/anticrash`)(client);

client.login(process.env.TOKEN);