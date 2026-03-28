// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Database seed başlıyor...')

  // Cleanup
  await prisma.user.deleteMany()
  
  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@printchain.io',
      passwordHash: '$2b$12$example_hash_here', // bcrypt hash
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  })

  // Demo brand
  const brandUser = await prisma.user.create({
    data: {
      email: 'brand@printchain.io',
      passwordHash: '$2b$12$example_hash_here',
      role: 'BRAND',
      profile: {
        create: {
          firstName: 'Koton',
          lastName: 'Brand',
        },
      },
      brand: {
        create: {
          name: 'Koton',
          logoUrl: 'https://example.com/koton-logo.png',
          kybStatus: 'APPROVED',
        },
      },
    },
  })

  console.log('✅ Seed tamamlandı!')
  console.log({ admin, brandUser })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
