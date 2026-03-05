const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching products...');
    const products = await prisma.product.findMany({
        where: {
            categoryId: { in: ['cat-fashion', 'cat-mens'] }
        },
        select: { id: true, name: true, categoryId: true, attributes: true }
    });
    console.log(`Found ${products.length} products in fashion/mens categories.`);

    let updated = 0;
    for (const p of products) {
        let attrs = p.attributes || {};
        if (typeof attrs === 'string') {
            try { attrs = JSON.parse(attrs); } catch (e) { attrs = {}; }
        }

        // If Size doesn't exist, we add it
        if (!attrs.Size) {
            if (p.categoryId === 'cat-fashion') {
                if (!p.name.includes('Saree')) {
                    attrs.Size = ["36 (S)", "38 (M)", "40 (L)", "42 (XL)", "44 (XXL)"];
                }
            } else if (p.categoryId === 'cat-mens') {
                if (p.name.includes('Jeans') || p.name.includes('Trouser') || p.name.includes('Pants') || p.name.includes('Shorts')) {
                    attrs.Size = ["30", "32", "34", "36", "38"];
                } else {
                    attrs.Size = ["M (38)", "L (40)", "XL (42)", "XXL (44)"];
                }
            }

            if (attrs.Size) {
                await prisma.product.update({
                    where: { id: p.id },
                    data: { attributes: attrs }
                });
                updated++;
                if (updated % 500 === 0) console.log(`Updated ${updated} products...`);
            }
        }
    }

    console.log(`✅ Successfully added sizes to ${updated} products.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
