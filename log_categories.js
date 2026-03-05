const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
    console.dir(categories, { depth: null });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
