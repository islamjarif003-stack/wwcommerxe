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

    if (content.includes('৳') && !content.includes('usePrice')) {
        // Find last import
        const importMatch = content.match(/import .* from ['"].*['"];?\r?\n/g);
        if (importMatch) {
            const lastImport = importMatch[importMatch.length - 1];
            content = content.replace(lastImport, lastImport + 'import { usePrice } from "@/hooks/usePrice";\n');
        }

        // Add hook inside default export function
        if (content.includes('export default function')) {
            content = content.replace(/(export default function \w+[^)]+\)\s*\{)/, '$1\n    const { formatPrice } = usePrice();');
        } else if (content.includes('export function')) {
            content = content.replace(/(export function \w+[^)]+\)\s*\{)/, '$1\n    const { formatPrice } = usePrice();');
        }
    }

    // Replace string literals with formatPrice
    content = content.replace(/["']৳(\d+)["']/g, 'formatPrice($1)');
    content = content.replace(/`৳(\d+)`/g, 'formatPrice($1)');

    // Replace interpolations
    content = content.replace(/`৳\$\{([^}]+)\}`/g, 'formatPrice($1)');
    content = content.replace(/৳\$\{([^}]+)\}/g, '${formatPrice($1)}');

    // Replace ৳{xxx} syntax
    content = content.replace(/৳\{([^}]+)\}/g, '{formatPrice($1)}');

    // Replace literal ৳xxx outside quotes (like in JSX text) -> {formatPrice(xxx)}
    content = content.replace(/৳(\d+)/g, '{formatPrice($1)}');
    content = content.replace(/৳\s(\d+)/g, '{formatPrice($1)}');

    fs.writeFileSync(filePath, content);
    console.log('Processed', f);
});
