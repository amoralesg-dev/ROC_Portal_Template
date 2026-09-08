const fs = require('fs');
const path = './projects/rassini-ui/package.json';
const p = JSON.parse(fs.readFileSync(path));
p.version = '0.0.13';
fs.writeFileSync(path, JSON.stringify(p, null, 2));
