const fs = require('fs');
const path = require('path');

function revertCurrency(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            revertCurrency(path.join(dir, file.name));
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
            const filePath = path.join(dir, file.name);
            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;
            if (content.includes('$ / ৳')) {
                content = content.replace(/\$ \/ ৳/g, '৳');
                changed = true;
            }
            if (content.includes('$/৳')) {
                content = content.replace(/\$\/৳/g, '৳');
                changed = true;
            }
            if (changed) {
                fs.writeFileSync(filePath, content);
                console.log('Reverted', filePath);
            }
        }
    }
}

revertCurrency(path.join(__dirname, 'src'));
