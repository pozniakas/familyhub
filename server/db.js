const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

function read() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { entities: [], items: [], tasks: [] };
  }
}

function write(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
