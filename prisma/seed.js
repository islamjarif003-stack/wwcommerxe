// prisma/seed.js  ← main seed (delegates to seed-demo.js)
// Run: npm run seed
// OR:  node prisma/seed.js
const { execSync } = require('child_process');
console.log('Delegating to seed-demo.js (no db.json needed)...');
execSync('node prisma/seed-demo.js', { stdio: 'inherit', cwd: __dirname + '/..' });
