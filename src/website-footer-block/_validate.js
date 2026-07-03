const fs = require('fs');
const content = fs.readFileSync(__dirname + '/block.json', 'utf8');
try {
  JSON.parse(content);
  console.log('OK valid JSON');
} catch (e) {
  console.error('INVALID JSON:', e.message);
  process.exit(1);
}
