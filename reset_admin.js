const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
    const prisma = new PrismaClient();
    const hashedPassword = bcrypt.hashSync('admin123', 10);

    await prisma.user.update({
        where: { email: 'admin@wwcommerce.com' },
        data: { password: hashedPassword }
    });

    console.log('Password for admin@wwcommerce.com reset to: admin123');
}

main().catch(console.error).finally(() => process.exit(0));
