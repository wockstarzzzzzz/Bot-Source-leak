const owners = new Map();

function set(channelId, userId) {
  owners.set(channelId, userId);
}

function get(channelId) {
  return owners.get(channelId);
}

function remove(channelId) {
  owners.delete(channelId);
}

module.exports = { set, get, remove };
