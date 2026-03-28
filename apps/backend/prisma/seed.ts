// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed başlıyor...')

  // Cleanup
  await prisma.payout.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.design.deleteMany()
  await prisma.product.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.session.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('password123', 12)

  // --- Users ---
  await prisma.user.create({
    data: {
      email: 'admin@printchain.io',
      passwordHash: hash,
      role: 'ADMIN',
      profile: { create: { firstName: 'Admin', lastName: 'User' } },
    },
  })

  const brandUser = await prisma.user.create({
    data: {
      email: 'brand@printchain.io',
      passwordHash: hash,
      role: 'BRAND',
      profile: { create: { firstName: 'Koton', lastName: 'Brand' } },
      brand: {
        create: {
          name: 'Koton',
          logoUrl: 'https://picsum.photos/seed/koton/200/200',
          kybStatus: 'APPROVED',
        },
      },
    },
    include: { brand: true },
  })

  const designerUser = await prisma.user.create({
    data: {
      email: 'designer@printchain.io',
      passwordHash: hash,
      role: 'DESIGNER',
      profile: { create: { firstName: 'Ayşe', lastName: 'Tasarımcı', bio: 'Minimalist tasarım tutkunu' } },
    },
  })

  await prisma.user.create({
    data: {
      email: 'medine@printchain.io',
      passwordHash: hash,
      role: 'CUSTOMER',
      profile: { create: { firstName: 'Medine', lastName: 'Kaynak' } },
    },
  })

  const brand = brandUser.brand!

  // --- Products ---
  const tshirt = await prisma.product.create({
    data: {
      brandId: brand.id,
      name: 'Unisex T-Shirt',
      description: 'Pamuklu, rahat ve dayanıklı.',
      basePrice: 150,
      templateUrl: 'https://picsum.photos/seed/tshirt/600/600',
      printZones: JSON.stringify({ x: 150, y: 100, width: 300, height: 300 }),
      category: 'T-Shirt',
    },
  })

  const hoodie = await prisma.product.create({
    data: {
      brandId: brand.id,
      name: 'Oversized Hoodie',
      description: 'Oversize, kaşmir yumuşaklığında.',
      basePrice: 299,
      templateUrl: 'https://picsum.photos/seed/hoodie/600/600',
      printZones: JSON.stringify({ x: 170, y: 130, width: 260, height: 260 }),
      category: 'Hoodie',
    },
  })

  const totebag = await prisma.product.create({
    data: {
      brandId: brand.id,
      name: 'Canvas Tote Bag',
      description: 'Doğa dostu kanvas çanta.',
      basePrice: 89,
      templateUrl: 'https://picsum.photos/seed/totebag/600/600',
      printZones: JSON.stringify({ x: 120, y: 80, width: 360, height: 360 }),
      category: 'Aksesuar',
    },
  })

  // --- Designs ---
  const designs = [
    {
      title: 'Minimalist Ay',
      description: 'Sade çizgilerle ay motifi',
      ipfsHash: 'QmMinimalistAyHash001',
      previewUrl: 'https://picsum.photos/seed/design1/400/400',
      salePrice: 249,
      productId: tshirt.id,
    },
    {
      title: 'Geometrik Soyut',
      description: 'Renkli geometrik formlar',
      ipfsHash: 'QmGeometrikSoyutHash002',
      previewUrl: 'https://picsum.photos/seed/design2/400/400',
      salePrice: 349,
      productId: tshirt.id,
    },
    {
      title: 'Boho Çiçek',
      description: 'El çizimi boho çiçek deseni',
      ipfsHash: 'QmBohoChicekHash003',
      previewUrl: 'https://picsum.photos/seed/design3/400/400',
      salePrice: 399,
      productId: hoodie.id,
    },
    {
      title: 'Şehir Silueti',
      description: 'İstanbul gece silueti',
      ipfsHash: 'QmSehirSiluetHash004',
      previewUrl: 'https://picsum.photos/seed/design4/400/400',
      salePrice: 449,
      productId: hoodie.id,
    },
    {
      title: 'Tipografi No:1',
      description: '"Carpe Diem" el yazısı baskı',
      ipfsHash: 'QmTipografiHash005',
      previewUrl: 'https://picsum.photos/seed/design5/400/400',
      salePrice: 199,
      productId: totebag.id,
    },
    {
      title: 'Doğa Mandala',
      description: 'İnce çizgilerle mandala',
      ipfsHash: 'QmDogaMandalaHash006',
      previewUrl: 'https://picsum.photos/seed/design6/400/400',
      salePrice: 279,
      productId: totebag.id,
    },
  ]

  for (const d of designs) {
    await prisma.design.create({
      data: {
        designerId: designerUser.id,
        productId: d.productId,
        title: d.title,
        description: d.description,
        ipfsHash: d.ipfsHash,
        previewUrl: d.previewUrl,
        salePrice: d.salePrice,
        status: 'PUBLISHED',
      },
    })
  }

  console.log('✅ Seed tamamlandı!')
  console.log(`  👤 Admin:    admin@printchain.io`)
  console.log(`  🏷️  Brand:    brand@printchain.io`)
  console.log(`  🎨 Designer: designer@printchain.io`)
  console.log(`  🛒 Customer: medine@printchain.io`)
  console.log(`  🔑 Şifre (hepsi): password123`)
  console.log(`  📦 Ürün: ${3}, Tasarım: ${designs.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
