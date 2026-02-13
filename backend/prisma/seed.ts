import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ─── CATEGORIES ───────────────────────────────────────────
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { name: 'Eletricista' },
      update: {},
      create: { name: 'Eletricista', icon: '⚡' },
    }),
    prisma.serviceCategory.upsert({
      where: { name: 'Encanador' },
      update: {},
      create: { name: 'Encanador', icon: '🔧' },
    }),
    prisma.serviceCategory.upsert({
      where: { name: 'Pintor' },
      update: {},
      create: { name: 'Pintor', icon: '🎨' },
    }),
    prisma.serviceCategory.upsert({
      where: { name: 'Diarista' },
      update: {},
      create: { name: 'Diarista', icon: '🧹' },
    }),
    prisma.serviceCategory.upsert({
      where: { name: 'Montador' },
      update: {},
      create: { name: 'Montador', icon: '🪛' },
    }),
  ]);

  // ─── SUBCATEGORIES ────────────────────────────────────────
  const subcategories = await Promise.all([
    prisma.serviceSubcategory.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Instalação elétrica', icon: '💡', categoryId: categories[0].id },
    }),
    prisma.serviceSubcategory.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Reparo hidráulico', icon: '🚿', categoryId: categories[1].id },
    }),
    prisma.serviceSubcategory.upsert({
      where: { id: 3 },
      update: {},
      create: { name: 'Pintura residencial', icon: '🏠', categoryId: categories[2].id },
    }),
    prisma.serviceSubcategory.upsert({
      where: { id: 4 },
      update: {},
      create: { name: 'Limpeza residencial', icon: '🏡', categoryId: categories[3].id },
    }),
    prisma.serviceSubcategory.upsert({
      where: { id: 5 },
      update: {},
      create: { name: 'Montagem de móveis', icon: '🪑', categoryId: categories[4].id },
    }),
  ]);

  // ─── 10 PROFESSIONALS ────────────────────────────────────
  const hashedPassword = await bcrypt.hash('123456', 10);

  const professionals = [
    { name: 'Carlos Silva', email: 'carlos@pronto.com', categoryIdx: 0, city: 'São Paulo', rating: 4.9, bio: 'Eletricista certificado com 10 anos de experiência', servicePrice: 120 },
    { name: 'Ana Oliveira', email: 'ana@pronto.com', categoryIdx: 1, city: 'São Paulo', rating: 4.8, bio: 'Encanadora profissional, atendimento rápido', servicePrice: 100 },
    { name: 'Pedro Santos', email: 'pedro@pronto.com', categoryIdx: 2, city: 'Rio de Janeiro', rating: 4.7, bio: 'Pintor especializado em acabamento fino', servicePrice: 150 },
    { name: 'Maria Costa', email: 'maria@pronto.com', categoryIdx: 3, city: 'São Paulo', rating: 5.0, bio: 'Diarista pontual e organizada', servicePrice: 180 },
    { name: 'João Ferreira', email: 'joao@pronto.com', categoryIdx: 4, city: 'Belo Horizonte', rating: 4.6, bio: 'Montador experiente em todas as marcas', servicePrice: 90 },
    { name: 'Fernanda Lima', email: 'fernanda@pronto.com', categoryIdx: 0, city: 'São Paulo', rating: 4.5, bio: 'Especialista em quadros elétricos', servicePrice: 130 },
    { name: 'Rafael Mendes', email: 'rafael@pronto.com', categoryIdx: 1, city: 'Curitiba', rating: 4.4, bio: 'Encanador com foco em manutenção preventiva', servicePrice: 110 },
    { name: 'Camila Alves', email: 'camila@pronto.com', categoryIdx: 2, city: 'São Paulo', rating: 4.9, bio: 'Pintora com portfólio de +200 projetos', servicePrice: 160 },
    { name: 'Lucas Rocha', email: 'lucas@pronto.com', categoryIdx: 3, city: 'Rio de Janeiro', rating: 4.3, bio: 'Diarista com referências comprovadas', servicePrice: 170 },
    { name: 'Juliana Souza', email: 'juliana@pronto.com', categoryIdx: 4, city: 'São Paulo', rating: 4.8, bio: 'Montadora especializada em cozinhas planejadas', servicePrice: 95 },
  ];

  for (const p of professionals) {
    await prisma.professional.upsert({
      where: { email: p.email },
      update: {},
      create: {
        name: p.name,
        email: p.email,
        password: hashedPassword,
        phoneNumber: '+55 11 99999-' + String(Math.floor(1000 + Math.random() * 9000)),
        bio: p.bio,
        city: p.city,
        rating: p.rating,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        completedServices: Math.floor(Math.random() * 200) + 20,
        responseTime: Math.floor(Math.random() * 30) + 5,
        verified: true,
        isActive: true,
        servicePrice: p.servicePrice,
        categoryId: categories[p.categoryIdx].id,
      },
    });
  }

  console.log('Seed completed: 5 categories, 5 subcategories, 10 professionals');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
