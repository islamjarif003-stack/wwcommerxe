// prisma/seed-demo.js
// Run: node prisma/seed-demo.js
// Populates database with realistic Bangladesh e-commerce demo data
// Works WITHOUT any db.json file

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── HELPERS ─────────────────────────────────────────────
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uuid = () => require('crypto').randomUUID();
const daysAgo = (d) => new Date(Date.now() - d * 86400000);

async function main() {
    console.log('\n🚀 Starting WW Commerce demo seed...\n');

    // ─── 1. DELIVERY ZONES ──────────────────────────────────
    console.log('📦 Seeding delivery zones...');
    const zones = await Promise.all([
        prisma.deliveryZone.upsert({
            where: { id: 'zone-dhaka-city' },
            update: {},
            create: {
                id: 'zone-dhaka-city',
                name: 'Dhaka City',
                type: 'dhaka_city',
                districts: ['Dhaka'],
                areas: ['Mirpur', 'Gulshan', 'Dhanmondi', 'Banani', 'Mohammadpur', 'Uttara', 'Bashundhara', 'Motijheel'],
                baseCharge: 60,
                freeDeliveryThreshold: 1500,
                estimatedDays: 'Same day / Next day',
                couriers: ['Pathao', 'Steadfast'],
                courierPerformance: { Pathao: { successRate: 96, avgDays: 1 }, Steadfast: { successRate: 94, avgDays: 1 } },
                isActive: true,
            }
        }),
        prisma.deliveryZone.upsert({
            where: { id: 'zone-dhaka-district' },
            update: {},
            create: {
                id: 'zone-dhaka-district',
                name: 'Dhaka District (Outside City)',
                type: 'dhaka_district',
                districts: ['Dhaka', 'Narayanganj', 'Gazipur', 'Manikganj', 'Munshiganj', 'Narsingdi'],
                areas: [],
                baseCharge: 80,
                freeDeliveryThreshold: 2000,
                estimatedDays: '1–2 days',
                couriers: ['Steadfast', 'RedX'],
                courierPerformance: { Steadfast: { successRate: 91, avgDays: 2 } },
                isActive: true,
            }
        }),
        prisma.deliveryZone.upsert({
            where: { id: 'zone-outside-dhaka' },
            update: {},
            create: {
                id: 'zone-outside-dhaka',
                name: 'Outside Dhaka (All Bangladesh)',
                type: 'rest_of_bd',
                districts: ['Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Mymensingh', 'Rangpur', 'Comilla', 'Bogra', 'Jessore'],
                areas: [],
                baseCharge: 120,
                freeDeliveryThreshold: 3000,
                estimatedDays: '3–5 days',
                couriers: ['Pathao', 'RedX', 'Sundarban'],
                courierPerformance: { Pathao: { successRate: 88, avgDays: 4 } },
                isActive: true,
            }
        }),
    ]);
    console.log(`   ✅ ${zones.length} delivery zones created\n`);

    // ─── 2. CATEGORIES ──────────────────────────────────────
    console.log('📁 Seeding categories...');
    const catData = [
        { id: 'cat-fashion', name: "Women's Fashion", icon: '👗', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', desc: 'Latest trends in women\'s clothing, sarees, kurtis and more' },
        { id: 'cat-mens', name: "Men's Fashion", icon: '👔', img: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&q=80', desc: 'Shirts, panjabis, trousers and formal wear' },
        { id: 'cat-electronics', name: 'Electronics', icon: '📱', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', desc: 'Smartphones, laptops, earbuds and accessories' },
        { id: 'cat-beauty', name: 'Beauty & Skincare', icon: '💄', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80', desc: 'Skincare, makeup and personal care products' },
        { id: 'cat-home', name: 'Home & Kitchen', icon: '🏠', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', desc: 'Home decor, kitchen essentials and furniture' },
        { id: 'cat-kids', name: 'Kids & Babies', icon: '🧸', img: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80', desc: 'Toys, clothing and accessories for children' },
    ];

    const subCatData = [
        { name: 'Sarees & Kurtis', parentId: 'cat-fashion', icon: '🥻' },
        { name: 'Tops & Blouses', parentId: 'cat-fashion', icon: '👚' },
        { name: 'Ethnic Wear', parentId: 'cat-fashion', icon: '🪭' },
        { name: 'Panjabi & Shirts', parentId: 'cat-mens', icon: '🕌' },
        { name: 'T-Shirts & Casual', parentId: 'cat-mens', icon: '👕' },
        { name: 'Smartphones', parentId: 'cat-electronics', icon: '📱' },
        { name: 'Earbuds & Headphones', parentId: 'cat-electronics', icon: '🎧' },
        { name: 'Accessories', parentId: 'cat-electronics', icon: '🔌' },
        { name: 'Skincare', parentId: 'cat-beauty', icon: '🧴' },
        { name: 'Makeup', parentId: 'cat-beauty', icon: '💅' },
    ];

    for (let i = 0; i < catData.length; i++) {
        const c = catData[i];
        await prisma.category.upsert({
            where: { id: c.id },
            update: {},
            create: {
                id: c.id, name: c.name, slug: slug(c.name),
                description: c.desc, icon: c.icon, image: c.img,
                sortOrder: i, isActive: true,
            }
        });
    }

    for (let i = 0; i < subCatData.length; i++) {
        const s = subCatData[i];
        const subSlug = slug(s.name);
        const id = `sub-${subSlug}`;
        try {
            await prisma.category.upsert({
                where: { slug: subSlug },
                update: {},
                create: {
                    id, name: s.name, slug: subSlug,
                    icon: s.icon, parentId: s.parentId,
                    sortOrder: i, isActive: true,
                }
            });
        } catch (e) { /* skip duplicates */ }
    }
    console.log(`   ✅ ${catData.length} root + ${subCatData.length} sub-categories created\n`);

    // ─── 3. USERS ────────────────────────────────────────────
    console.log('👤 Seeding users...');
    const hashedPw = await bcrypt.hash('Admin@123', 10);
    const customerPw = await bcrypt.hash('Customer@123', 10);

    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'admin@wwcommerce.com' },
            update: {},
            create: {
                id: 'user-superadmin',
                name: 'Super Admin', email: 'admin@wwcommerce.com',
                password: hashedPw, role: 'SUPERADMIN',
                isActive: true, emailVerified: true,
                totalOrders: 0, totalSpent: 0, loyaltyPoints: 0,
                createdAt: daysAgo(120),
            }
        }),
        prisma.user.upsert({
            where: { email: 'manager@wwcommerce.com' },
            update: {},
            create: {
                id: 'user-manager',
                name: 'Store Manager', email: 'manager@wwcommerce.com',
                password: hashedPw, role: 'MANAGER',
                isActive: true, emailVerified: true,
                totalOrders: 0, totalSpent: 0, loyaltyPoints: 0,
                createdAt: daysAgo(90),
            }
        }),
        ...['Fatima Begum', 'Rashida Khanam', 'Mohammad Hossain', 'Karim Ahmed', 'Sumaiya Islam',
            'Rifat Hassan', 'Nusrat Jahan', 'Arif Mahmud', 'Shirin Akter', 'Hasan Ali'].map((name, i) =>
                prisma.user.upsert({
                    where: { email: `customer${i + 1}@example.com` },
                    update: {},
                    create: {
                        id: `user-cust-${i + 1}`,
                        name, email: `customer${i + 1}@example.com`,
                        password: customerPw, phone: `017${String(10000000 + i * 1111111).slice(0, 8)}`,
                        role: 'USER', isActive: true, emailVerified: i % 3 === 0,
                        totalOrders: rand(1, 15), totalSpent: rand(500, 25000), loyaltyPoints: rand(10, 500),
                        createdAt: daysAgo(rand(5, 180)),
                    }
                }).catch(() => ({ id: `user-cust-${i + 1}` }))
            )
    ]);
    console.log(`   ✅ ${users.length} users created\n   📧 Admin: admin@wwcommerce.com / Admin@123\n`);

    // ─── 4. PRODUCTS ─────────────────────────────────────────
    console.log('🛍️  Seeding products...');

    const productDefs = [
        // Women's Fashion
        { name: 'Premium Cotton Kurti - Floral Print', cat: 'cat-fashion', price: 799, compare: 1299, stock: 85, sold: 234, demand: 78, featured: true, images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80'], tags: ['kurti', 'cotton', 'eid', 'women'], brand: 'Aarong' },
        { name: 'Silk Saree - Jamdani Motif', cat: 'cat-fashion', price: 2499, compare: 3500, stock: 42, sold: 156, demand: 85, featured: true, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80'], tags: ['saree', 'silk', 'jamdani', 'wedding'], brand: 'Banglar Taat' },
        { name: 'A-Line Printed Dress', cat: 'cat-fashion', price: 1199, compare: 1799, stock: 60, sold: 98, demand: 62, featured: false, images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80'], tags: ['dress', 'casual', 'women'], brand: 'Yellow' },
        { name: 'Embroidered Salwar Kameez Set', cat: 'cat-fashion', price: 1899, compare: 2800, stock: 35, sold: 187, demand: 92, featured: true, images: ['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&q=80'], tags: ['salwar', 'embroidered', 'eid', 'formal'], brand: 'Aarong' },
        { name: 'Casual Top with Inner - Combo', cat: 'cat-fashion', price: 599, compare: 899, stock: 120, sold: 445, demand: 88, featured: true, images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&q=80'], tags: ['top', 'casual', 'combo', 'women'], brand: 'Richman' },

        // Men's Fashion
        { name: 'Premium Panjabi - Eid Special', cat: 'cat-mens', price: 1499, compare: 2200, stock: 55, sold: 312, demand: 95, featured: true, images: ['https://images.unsplash.com/photo-1614252296683-34f75c01ca12?w=500&q=80'], tags: ['panjabi', 'eid', 'men', 'festive'], brand: 'Aarong' },
        { name: 'Oxford Formal Shirt - Slim Fit', cat: 'cat-mens', price: 899, compare: 1400, stock: 75, sold: 203, demand: 71, featured: false, images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&q=80'], tags: ['shirt', 'formal', 'men', 'office'], brand: 'Ecstasy' },
        { name: 'Casual Polo T-Shirt - 6 Colors', cat: 'cat-mens', price: 449, compare: 699, stock: 200, sold: 567, demand: 90, featured: true, images: ['https://images.unsplash.com/photo-1561136594-7f68413baa99?w=500&q=80'], tags: ['polo', 'tshirt', 'casual', 'men'], brand: 'Richman' },
        { name: 'Jeans Trouser - Regular Fit', cat: 'cat-mens', price: 1199, compare: 1800, stock: 88, sold: 134, demand: 68, featured: false, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80'], tags: ['jeans', 'trouser', 'men', 'casual'], brand: 'Cats Eye' },

        // Electronics
        { name: 'Wireless Earbuds Pro - 30hr Battery', cat: 'cat-electronics', price: 1299, compare: 2499, stock: 45, sold: 423, demand: 96, featured: true, images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80'], tags: ['earbuds', 'wireless', 'bluetooth', 'tws'], brand: 'realme' },
        { name: 'Fast Charger 65W - Universal USB-C', cat: 'cat-electronics', price: 599, compare: 999, stock: 130, sold: 678, demand: 94, featured: true, images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80'], tags: ['charger', 'usbc', 'fast-charging', 'adapter'], brand: 'Baseus' },
        { name: 'Portable Power Bank 20000mAh', cat: 'cat-electronics', price: 1799, compare: 2800, stock: 62, sold: 289, demand: 85, featured: false, images: ['https://images.unsplash.com/photo-1609592806596-b8f2b3093e6e?w=500&q=80'], tags: ['powerbank', 'portable', 'charging', 'travel'], brand: 'Baseus' },
        { name: 'Smartwatch - Health & Fitness', cat: 'cat-electronics', price: 2299, compare: 3999, stock: 28, sold: 167, demand: 79, featured: true, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'], tags: ['smartwatch', 'fitness', 'health', 'bluetooth'], brand: 'Xiaomi' },

        // Beauty
        { name: 'Korean Glass Skin Serum Set', cat: 'cat-beauty', price: 999, compare: 1599, stock: 95, sold: 356, demand: 91, featured: true, images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80'], tags: ['serum', 'korean', 'skincare', 'glow'], brand: 'Some By Mi' },
        { name: 'Sunscreen SPF 50 PA+++ 50ml', cat: 'cat-beauty', price: 499, compare: 799, stock: 145, sold: 512, demand: 93, featured: true, images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80'], tags: ['sunscreen', 'spf50', 'skincare', 'uv'], brand: 'Neutrogena' },
        { name: 'Natural Rose Water Toner 200ml', cat: 'cat-beauty', price: 299, compare: 499, stock: 210, sold: 678, demand: 87, featured: false, images: ['https://images.unsplash.com/photo-1600857540786-49ac84b3a12c?w=500&q=80'], tags: ['toner', 'rosewater', 'natural', 'skincare'], brand: 'Gulab' },

        // Home & Kitchen
        { name: 'Premium Stainless Steel Cookware Set 5pcs', cat: 'cat-home', price: 2999, compare: 4500, stock: 25, sold: 89, demand: 74, featured: false, images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80'], tags: ['cookware', 'stainless', 'kitchen', 'set'], brand: 'Prestige' },
        { name: 'Rechargeable LED Desk Lamp', cat: 'cat-home', price: 799, compare: 1299, stock: 55, sold: 145, demand: 72, featured: false, images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80'], tags: ['lamp', 'led', 'desk', 'rechargeable'], brand: 'Philips' },

        // Kids
        { name: 'Educational Building Blocks 100pcs', cat: 'cat-kids', price: 699, compare: 1099, stock: 70, sold: 134, demand: 76, featured: false, images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&q=80'], tags: ['blocks', 'educational', 'kids', 'toys'], brand: 'Lego' },
        { name: 'Soft Plush Teddy Bear 50cm', cat: 'cat-kids', price: 499, compare: 799, stock: 95, sold: 223, demand: 80, featured: true, images: ['https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=500&q=80'], tags: ['teddy', 'plush', 'baby', 'gift'], brand: 'Fisher Price' },
    ];

    for (const p of productDefs) {
        const productSlug = slug(p.name);
        const sku = `WW-${productSlug.slice(0, 8).toUpperCase().replace(/-/g, '')}-${rand(100, 999)}`;
        await prisma.product.upsert({
            where: { slug: productSlug },
            update: { soldCount: p.sold, demandScore: p.demand, stock: p.stock },
            create: {
                name: p.name, slug: productSlug, sku,
                categoryId: p.cat,
                description: `${p.name} — Authentic product with quality guarantee. Fast delivery across Bangladesh.`,
                shortDescription: `Premium ${p.name.split(' ').slice(-2).join(' ')} with best price`,
                brand: p.brand, tags: p.tags, images: p.images,
                basePrice: p.price, comparePrice: p.compare,
                stock: p.stock, lowStockThreshold: 10,
                isActive: true, isFeatured: p.featured,
                rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
                reviewCount: rand(12, 340), soldCount: p.sold,
                viewCount: p.sold * rand(5, 15), demandScore: p.demand,
                performanceScore: Math.round((p.demand + p.sold / 10) / 2),
                seoTitle: `${p.name} — Best Price in Bangladesh | WW Commerce`,
                seoDescription: `Buy ${p.name} at best price. Free delivery in Dhaka. COD available.`,
                createdAt: daysAgo(rand(10, 180)),
            }
        }).catch(() => { }); // skip if sku conflict
    }
    console.log(`   ✅ ${productDefs.length} products created\n`);

    // ─── 5. SAMPLE ORDERS ────────────────────────────────────
    console.log('📋 Seeding sample orders...');
    const allProducts = await prisma.product.findMany({ take: 10 });
    const allZones = await prisma.deliveryZone.findMany();
    const customerIds = ['user-cust-1', 'user-cust-2', 'user-cust-3', 'user-cust-4', 'user-cust-5'];
    const statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'DELIVERED', 'DELIVERED'];
    const names = ['Fatima Begum', 'Rashida Khanam', 'Mohammad Hossain', 'Karim Ahmed', 'Sumaiya Islam',
        'Rifat Hassan', 'Nusrat Jahan', 'Arif Mahmud', 'Shirin Akter', 'Hasan Ali'];
    const phones = ['01711234567', '01811234568', '01911234569', '01511234570', '01611234571'];
    const districts = ['Dhaka', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'];

    let orderCount = 0;
    for (let i = 0; i < 35; i++) {
        const numItems = rand(1, 3);
        const items = [];
        let subtotal = 0;
        const usedProducts = new Set();

        for (let j = 0; j < numItems; j++) {
            let prod;
            do { prod = pick(allProducts); } while (usedProducts.has(prod.id));
            usedProducts.add(prod.id);
            const qty = rand(1, 3);
            const tp = prod.basePrice * qty;
            subtotal += tp;
            items.push({ productId: prod.id, name: prod.name, sku: prod.sku, image: prod.images[0] || null, quantity: qty, unitPrice: prod.basePrice, totalPrice: tp, attributes: {} });
        }

        const zone = pick(allZones);
        const deliveryCharge = zone.baseCharge;
        const total = subtotal + deliveryCharge;
        const status = pick(statusOptions);
        const distIdx = rand(0, 4);
        const createdDate = daysAgo(rand(0, 90));

        const orderNum = `WW-${String(Date.now()).slice(-6)}-${String(i).padStart(3, '0')}`;

        try {
            const order = await prisma.order.create({
                data: {
                    orderNumber: orderNum,
                    userId: i < 5 ? customerIds[i] : null,
                    customerName: names[distIdx],
                    customerPhone: phones[distIdx],
                    customerEmail: i < 5 ? `customer${distIdx + 1}@example.com` : null,
                    shippingAddress: { name: names[distIdx], phone: phones[distIdx], addressLine: `House ${rand(1, 99)}, Road ${rand(1, 20)}`, district: districts[distIdx], city: districts[distIdx] },
                    subtotal, deliveryCharge, discount: 0, total,
                    paymentMethod: pick(['COD', 'COD', 'COD', 'BKASH']),
                    paymentStatus: status === 'DELIVERED' ? 'PAID' : 'PENDING',
                    status: status,
                    deliveryZoneId: zone.id,
                    riskScore: rand(0, 30),
                    isFraudSuspect: false,
                    statusHistory: [{ status: 'PENDING', timestamp: createdDate.toISOString() }],
                    createdAt: createdDate,
                    updatedAt: createdDate,
                }
            });

            await prisma.orderItem.createMany({
                data: items.map(it => ({ ...it, orderId: order.id }))
            });
            orderCount++;
        } catch { }
        await new Promise(r => setTimeout(r, 10)); // avoid orderNum collision
    }
    console.log(`   ✅ ${orderCount} sample orders created\n`);

    // ─── 6. ADMIN SETTINGS ──────────────────────────────────
    console.log('⚙️  Seeding admin settings...');
    const settings = [
        { key: 'STORE_INFO', value: { storeName: 'WW Commerce', tagline: 'Quality Products · Fast Delivery', email: 'support@wwcommerce.com', phone: '01700-000000', address: 'Dhaka, Bangladesh', currency: 'BDT', currencySymbol: '৳' } },
        { key: 'SEO_GLOBALS', value: { metaTitle: 'WW Commerce — Best Online Shopping in Bangladesh', metaDesc: 'Shop 10,000+ products with fast delivery. COD available.' } },
        { key: 'PAYMENT_METHODS', value: { cod: true, bkash: true, nagad: false, online: false } },
    ];

    for (const s of settings) {
        await prisma.adminSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: { key: s.key, value: s.value } });
    }
    console.log(`   ✅ ${settings.length} admin settings saved\n`);

    // ─── SUMMARY ────────────────────────────────────────────
    const [uCount, cCount, pCount, oCount, zCount] = await Promise.all([
        prisma.user.count(), prisma.category.count(), prisma.product.count(),
        prisma.order.count(), prisma.deliveryZone.count(),
    ]);

    console.log('═══════════════════════════════════════');
    console.log('🎉  Seed completed successfully!\n');
    console.log(`   👤 Users:           ${uCount}`);
    console.log(`   📁 Categories:      ${cCount}`);
    console.log(`   🛍️  Products:        ${pCount}`);
    console.log(`   📋 Orders:          ${oCount}`);
    console.log(`   🚚 Delivery Zones:  ${zCount}`);
    console.log('─────────────────────────────────────');
    console.log('   📧 Admin login:  admin@wwcommerce.com');
    console.log('   🔑 Password:     Admin@123');
    console.log('═══════════════════════════════════════\n');
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
