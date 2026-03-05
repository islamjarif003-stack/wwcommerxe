const fs = require('fs');
const path = require('path');

function replaceCurrency(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            replaceCurrency(path.join(dir, file.name));
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
            const filePath = path.join(dir, file.name);
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('৳')) {
                // To avoid multiple replaces if run multiple times, check first
                if (content.includes('$/৳') || content.includes('$ / ৳')) continue;
                content = content.replace(/৳/g, '$ / ৳');
                fs.writeFileSync(filePath, content);
                console.log('Updated', filePath);
            }
        }
    }
}

replaceCurrency(path.join(__dirname, 'src'));
