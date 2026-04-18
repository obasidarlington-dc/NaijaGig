require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'kene@tutamail.com';
  const password = 'Admin234'; //yup, my password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Delete existing user with same email (to avoid conflict)
  await prisma.user.deleteMany({ where: { email } });

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });
  console.log('Admin user created:', admin.email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());