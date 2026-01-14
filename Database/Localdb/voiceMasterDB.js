const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "voicemaster.json");

function load() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, "{}");
        return {};
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function save(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function set(guildId, config) {
    const data = load();
    data[guildId] = config;
    save(data);
}

function get(guildId) {
    const data = load();
    return data[guildId] || null;
}

function remove(guildId) {
    const data = load();
    delete data[guildId];
    save(data);
}

module.exports = { set, get, remove };
