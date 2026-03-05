// prisma/generate-10k-products.js
// Inserts 10,000+ realistic products into PostgreSQL using Prisma createMany
// Usage: node prisma/generate-10k-products.js
// Options: node prisma/generate-10k-products.js --count=10000

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const args = process.argv.slice(2);
const TOTAL = parseInt((args.find(a => a.startsWith('--count=')) || '--count=10000').split('=')[1]);
const BATCH = 300; // createMany batch size

// ─── DATA POOLS ──────────────────────────────────────────────────────────────
const ADJECTIVES = [
    'Premium', 'Ultra', 'Royal', 'Classic', 'Modern', 'Elegant', 'Stylish', 'Trendy',
    'Original', 'Authentic', 'Signature', 'Luxury', 'Comfort', 'Smart', 'Slim', 'Soft',
    'Heavy-Duty', 'Lightweight', 'Eco-Friendly', 'Handcrafted', 'Artisan', 'Vintage',
    'Contemporary', 'Minimalist', 'Bold', 'Vibrant', 'Fresh', 'Pure', 'Natural',
    'Organic', 'Durable', 'Professional', 'Advanced', 'Essential', 'Special Edition',
    'Imported', 'Exclusive', 'Designer', 'Trendsetter', 'Elite',
];

const BRANDS = [
    'Aarong', 'Richman', 'Ecstasy', 'Yellow', 'Cats Eye', 'Sailor', 'Westecs',
    'Le Reve', 'Rang Bangladesh', 'Infinity', 'Banglar Taat', 'Arshi', 'Rang',
    'Baseus', 'realme', 'Xiaomi', 'JBL', 'Anker', 'Haylou',
    'Neutrogena', 'Garnier', 'Himalaya', 'Parachute', 'Ponds',
    'Some By Mi', 'Cosrx', 'Innisfree', 'The Face Shop',
    'Prestige', 'Tefal', 'Philips', 'Walton', 'Singer',
    'Lego', 'Fisher Price', 'Hasbro',
    'Unbranded', 'Generic', 'House Brand',
];

const CAT_DATA = {
    'cat-fashion': {
        items: ['Printed Kurti', 'Embroidered Salwar', 'Chiffon Saree', 'Cotton Frock', 'Linen Kurti',
            'Georgette Saree', 'Woolen Shawl', 'Denim Jacket', 'Maxi Dress', 'Party Dress',
            'Anarkali Suit', 'Palazzo Pants', 'Leggings', 'Night Suit', 'Pyjama Set',
            'Blouse Piece', 'Petticoat', 'Hijab', 'Abaya', 'Kaftan', 'Tunic Top', 'Wrap Dress'],
        tags: ['women', 'fashion', 'clothing', 'eid', 'casual', 'formal', 'ethnic'],
        img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=70',
    },
    'cat-mens': {
        items: ['Panjabi', 'Formal Shirt', 'Casual Shirt', 'T-Shirt', 'Polo Shirt', 'Hoodie',
            'Jeans', 'Trouser', 'Cargo Pants', 'Shorts', 'Blazer', 'Sherwani',
            'Fatua', 'Vest', 'Undergarment Set', 'Jogger Pants', 'Sweatshirt', 'Jacket'],
        tags: ['men', 'fashion', 'clothing', 'eid', 'casual', 'formal', 'panjabi'],
        img: 'https://images.unsplash.com/photo-1614252296683-34f75c01ca12?w=400&q=70',
    },
    'cat-electronics': {
        items: ['TWS Earbuds', 'Neckband', 'Headphone', 'Bluetooth Speaker', 'Smart Watch',
            'Mobile Charger', 'Power Bank', 'USB Cable', 'Phone Case', 'Screen Protector',
            'Memory Card', 'Pen Drive', 'Webcam', 'Mouse', 'Keyboard', 'Phone Holder',
            'Ring Light', 'Laptop Cooling Pad', 'USB Hub', 'Selfie Stick'],
        tags: ['electronics', 'gadgets', 'tech', 'wireless', 'charging', 'audio'],
        img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=70',
    },
    'cat-beauty': {
        items: ['Face Serum', 'Moisturizer', 'Sunscreen', 'Face Wash', 'Toner', 'Eye Cream',
            'Lip Balm', 'Foundation', 'Concealer', 'Mascara', 'Eyeliner', 'Lipstick',
            'Blush', 'Setting Powder', 'BB Cream', 'Hair Serum', 'Hair Mask',
            'Shampoo', 'Conditioner', 'Body Lotion', 'Body Wash', 'Perfume'],
        tags: ['beauty', 'skincare', 'makeup', 'cosmetics', 'glow', 'natural'],
        img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=70',
    },
    'cat-home': {
        items: ['Non-Stick Pan', 'Cooking Pot', 'Pressure Cooker', 'Rice Cooker', 'Blender',
            'Toaster', 'Electric Kettle', 'Air Fryer', 'Chopping Board', 'Knife Set',
            'Spice Rack', 'Storage Container', 'Lunch Box', 'Water Bottle', 'Bed Sheet',
            'Pillow Cover', 'Comforter', 'Curtain', 'Wall Clock', 'Photo Frame',
            'Vase', 'Candle', 'Doormat', 'Laundry Basket', 'Ironing Board'],
        tags: ['home', 'kitchen', 'household', 'decor', 'cooking', 'storage'],
        img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70',
    },
    'cat-kids': {
        items: ['Building Blocks', 'Puzzle', 'Board Game', 'Stuffed Animal', 'Action Figure',
            'Doll', 'Remote Control Car', 'Coloring Book', 'Educational Toy', 'Baby Rattle',
            'Kids T-Shirt', 'Baby Romper', 'Kids Jeans', 'School Bag', 'Water Bottle',
            'Lunch Box', 'Pencil Case', 'Stationery Set', 'Crayon Set', 'Clay Set'],
        tags: ['kids', 'toys', 'children', 'baby', 'educational', 'gift'],
        img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=70',
    },
};

const MODIFIERS = [
    'Regular Fit', 'Slim Fit', 'Relaxed Fit', 'Combo Pack', 'Set of 2',
    'Premium Quality', 'New Arrival', 'Best Seller', 'Editor Pick',
    '2024 Edition', 'Limited Edition', 'Imported',
];

const MATERIALS = [
    'Cotton', 'Silk', 'Linen', 'Polyester', 'Wool Blend', 'Jersey',
    'Denim', 'Chiffon', 'Georgette', 'Leather', 'Stainless Steel',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = d => new Date(Date.now() - d * 86400000);

const slugMap = new Map();
function uniqueSlug(base) {
    const clean = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 55);
    const n = (slugMap.get(clean) || 0) + 1;
    slugMap.set(clean, n);
    return n === 1 ? clean : `${clean}-${n}`;
}

const skuSet = new Set();
function uniqueSKU(prefix, i) {
    const s = `WW-${prefix}-${String(i).padStart(6, '0')}`;
    if (skuSet.has(s)) { skuSet.add(s + 'x'); return s + 'x'; }
    skuSet.add(s);
    return s;
}

function buildProduct(i, catId) {
    const cat = CAT_DATA[catId] || CAT_DATA['cat-fashion'];
    const adj = pick(ADJECTIVES);
    const item = pick(cat.items);
    const hasMod = Math.random() > 0.5;
    const hasMat = Math.random() > 0.6;
    const mod = hasMod ? ` – ${pick(MODIFIERS)}` : '';
    const mat = hasMat ? ` (${pick(MATERIALS)})` : '';
    const name = `${adj} ${item}${mod}${mat}`;

    const basePrice = rand(150, 9500);
    const hasDiscount = Math.random() > 0.35;
    const comparePrice = hasDiscount ? Math.round(basePrice * (1.15 + Math.random() * 0.5)) : null;
    const stock = rand(0, 800);
    const soldCount = rand(0, 3000);
    const rating = parseFloat((3.4 + Math.random() * 1.6).toFixed(1));
    const demandScore = Math.min(100, Math.round(soldCount / 30 + rating * 4 + Math.random() * 15));
    const prefix = catId.replace('cat-', '').slice(0, 4).toUpperCase();

    return {
        name,
        slug: uniqueSlug(name),
        sku: uniqueSKU(prefix, i),
        categoryId: catId,
        brand: pick(BRANDS),
        description: `${name} — Premium quality product. Fast delivery across Bangladesh. 100% original.`,
        shortDescription: `${adj} ${item} at best price`,
        basePrice,
        comparePrice,
        stock,
        lowStockThreshold: 5,
        images: [cat.img],
        tags: cat.tags,
        attributes: {},
        isActive: Math.random() > 0.04,
        isFeatured: Math.random() > 0.93,
        isDigital: false,
        rating,
        reviewCount: rand(0, 800),
        soldCount,
        viewCount: soldCount * rand(3, 20),
        demandScore,
        performanceScore: Math.round(demandScore * 0.85),
        createdAt: daysAgo(rand(1, 730)),
        updatedAt: daysAgo(rand(0, 30)),
    };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log(`\n⚡ Generating ${TOTAL.toLocaleString()} products...\n`);

    // Get supported category IDs
    const allCats = await prisma.$queryRaw`SELECT id FROM "Category" WHERE "isActive" = true`;
    const catIds = allCats.map(c => c.id).filter(id => CAT_DATA[id]);

    if (catIds.length === 0) {
        console.error('❌ No categories found. Run: node prisma/seed-demo.js first');
        process.exit(1);
    }
    console.log(`📁 Categories: ${catIds.join(', ')}\n`);

    const before = await prisma.product.count();
    const startTime = Date.now();
    let inserted = 0;

    // ── Batch insert loop ─────────────────────────────────────────────────────
    while (inserted < TOTAL) {
        const batchSize = Math.min(BATCH, TOTAL - inserted);
        const data = [];

        for (let b = 0; b < batchSize; b++) {
            const catId = catIds[(inserted + b) % catIds.length];
            data.push(buildProduct(inserted + b + 1, catId));
        }

        try {
            await prisma.product.createMany({ data, skipDuplicates: true });
            inserted += batchSize;
        } catch (e) {
            // On conflict, try one-by-one
            for (const d of data) {
                try { await prisma.product.create({ data: d }); inserted++; }
                catch { inserted++; } // skip duplicate
            }
        }

        // Progress bar
        const pct = Math.round((inserted / TOTAL) * 100);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = Math.round(inserted / Math.max(0.1, parseFloat(elapsed)));
        const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
        process.stdout.write(`\r   [${bar}] ${pct}%  ${inserted.toLocaleString()}/${TOTAL.toLocaleString()}  ${rate}/sec  ${elapsed}s  `);
    }

    console.log('\n');
    const after = await prisma.product.count();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('═══════════════════════════════════════');
    console.log(`✅ Done in ${elapsed}s`);
    console.log(`   Before: ${before.toLocaleString()}`);
    console.log(`   After:  ${after.toLocaleString()}`);
    console.log(`   Added:  ${(after - before).toLocaleString()}`);
    console.log('═══════════════════════════════════════\n');
}

main()
    .catch(e => { console.error('\n❌', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
