const { ClusterManager } = require('discord-hybrid-sharding');
const path = require('node:path');
require('dotenv').config();

const manager = new ClusterManager(path.join(__dirname, 'index.js'), {
    totalShards: 'auto',
    shardsPerClusters: 2,
    mode: 'worker', 
    token: process.env.TOKEN,
});

manager.on('clusterCreate', cluster => {
    console.log(`Launched Cluster ${cluster.id}`);
});

manager.spawn({ timeout: -1 }).then(() => {
    console.log('All clusters spawned.');
}).catch(err => {
    console.error('Error spawning clusters:', err);
});