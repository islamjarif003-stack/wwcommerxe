const fs = require('fs');
const path = require('path');

const files = [
    'src/components/ProductCard.tsx',
    'src/components/CartDrawer.tsx',
    'src/app/track/page.tsx',
    'src/app/products/[slug]/page.tsx',
    'src/app/page.tsx',
    'src/app/checkout/page.tsx',
    'src/app/category/[slug]/page.tsx',
    'src/app/admin/products/page.tsx',
    'src/app/admin/users/page.tsx',
    'src/app/admin/settings/page.tsx',
    'src/app/admin/page.tsx',
    'src/app/admin/orders/page.tsx',
    'src/app/admin/delivery/page.tsx',
    'src/app/admin/ai/page.tsx',
    'src/app/account/orders/page.tsx',
    'src/components/Navbar.tsx',
];

files.forEach(f => {
    let filePath = path.join(__dirname, f);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // ONLY add if it hasn't been added successfully!
    if (!content.includes('const { formatPrice } = usePrice();') && content.includes('formatPrice')) {
        if (content.match(/export default function \w+\s*\([^)]*\)\s*\{/)) {
            content = content.replace(/(export default function \w+\s*\([^)]*\)\s*\{)/, '$1\n    const { formatPrice } = usePrice();');
        } else if (content.match(/export function \w+\s*\([^)]*\)\s*\{/)) {
            content = content.replace(/(export function \w+\s*\([^)]*\)\s*\{)/, '$1\n    const { formatPrice } = usePrice();');
        }
        fs.writeFileSync(filePath, content);
        console.log('Fixed hook in', f);
    }
});
