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

  const hashedPassword = await bcrypt.hash('123456', 10);

  // ─── CATEGORIES (mesmas do frontend) ────────────────────
  const categoryData = [
    { name: 'Emergência', icon: 'Siren' },
    { name: 'Casa e manutenção', icon: 'House' },
    { name: 'Tecnologia', icon: 'Monitor' },
    { name: 'Beleza e bem-estar', icon: 'Scissors' },
    { name: 'Aulas e educação', icon: 'GraduationCap' },
    { name: 'Automotivo', icon: 'Car' },
    { name: 'Eventos', icon: 'PartyPopper' },
    { name: 'Limpeza', icon: 'Sparkles' },
  ];

  const categories: Record<string, { id: number }> = {};
  for (const cat of categoryData) {
    categories[cat.name] = await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon },
      create: { name: cat.name, icon: cat.icon },
    });
  }

  // ─── PROFESSIONALS (2-3 por categoria) ──────────────────
  const professionals = [
    // Emergência
    { name: 'Carlos Silva', email: 'carlos@pronto.com', category: 'Emergência', city: 'São Paulo', rating: 4.9, bio: 'Eletricista 24h, atendimento emergencial rápido', servicePrice: 150, phone: '11 99901-1001' },
    { name: 'Roberto Dias', email: 'roberto@pronto.com', category: 'Emergência', city: 'São Paulo', rating: 4.7, bio: 'Encanador emergencial, desentupimento e vazamentos', servicePrice: 130, phone: '11 99901-1002' },

    // Casa e manutenção
    { name: 'Ana Oliveira', email: 'ana@pronto.com', category: 'Casa e manutenção', city: 'São Paulo', rating: 4.8, bio: 'Pintora profissional com acabamento impecável', servicePrice: 120, phone: '11 99902-2001' },
    { name: 'Pedro Santos', email: 'pedro@pronto.com', category: 'Casa e manutenção', city: 'Rio de Janeiro', rating: 4.7, bio: 'Pedreiro especializado em reformas residenciais', servicePrice: 180, phone: '21 99902-2002' },
    { name: 'Marcos Pereira', email: 'marcos@pronto.com', category: 'Casa e manutenção', city: 'São Paulo', rating: 4.5, bio: 'Jardineiro paisagista com 8 anos de experiência', servicePrice: 100, phone: '11 99902-2003' },

    // Tecnologia
    { name: 'Lucas Rocha', email: 'lucas@pronto.com', category: 'Tecnologia', city: 'São Paulo', rating: 4.9, bio: 'Técnico em informática e redes, reparo de celulares', servicePrice: 80, phone: '11 99903-3001' },
    { name: 'Fernanda Lima', email: 'fernanda@pronto.com', category: 'Tecnologia', city: 'Curitiba', rating: 4.6, bio: 'Especialista em computadores e notebooks', servicePrice: 100, phone: '41 99903-3002' },

    // Beleza e bem-estar
    { name: 'Camila Alves', email: 'camila@pronto.com', category: 'Beleza e bem-estar', city: 'São Paulo', rating: 5.0, bio: 'Cabeleireira e maquiadora profissional', servicePrice: 90, phone: '11 99904-4001' },
    { name: 'Juliana Souza', email: 'juliana@pronto.com', category: 'Beleza e bem-estar', city: 'São Paulo', rating: 4.8, bio: 'Manicure e pedicure com esmaltação em gel', servicePrice: 60, phone: '11 99904-4002' },
    { name: 'Patrícia Nunes', email: 'patricia@pronto.com', category: 'Beleza e bem-estar', city: 'Rio de Janeiro', rating: 4.7, bio: 'Massoterapeuta relaxante e terapêutica', servicePrice: 110, phone: '21 99904-4003' },

    // Aulas e educação
    { name: 'Rafael Mendes', email: 'rafael@pronto.com', category: 'Aulas e educação', city: 'São Paulo', rating: 4.8, bio: 'Professor de inglês com vivência no exterior', servicePrice: 70, phone: '11 99905-5001' },
    { name: 'Beatriz Gomes', email: 'beatriz@pronto.com', category: 'Aulas e educação', city: 'Belo Horizonte', rating: 4.9, bio: 'Professora particular de matemática e física', servicePrice: 65, phone: '31 99905-5002' },

    // Automotivo
    { name: 'João Ferreira', email: 'joao@pronto.com', category: 'Automotivo', city: 'São Paulo', rating: 4.6, bio: 'Mecânico automotivo com 15 anos de experiência', servicePrice: 140, phone: '11 99906-6001' },
    { name: 'Diego Martins', email: 'diego@pronto.com', category: 'Automotivo', city: 'São Paulo', rating: 4.4, bio: 'Guincho e socorro mecânico 24h', servicePrice: 200, phone: '11 99906-6002' },

    // Eventos
    { name: 'Thiago Barros', email: 'thiago@pronto.com', category: 'Eventos', city: 'São Paulo', rating: 4.9, bio: 'Fotógrafo profissional para eventos e casamentos', servicePrice: 250, phone: '11 99907-7001' },
    { name: 'Amanda Reis', email: 'amanda@pronto.com', category: 'Eventos', city: 'Rio de Janeiro', rating: 4.7, bio: 'DJ para festas, casamentos e eventos corporativos', servicePrice: 300, phone: '21 99907-7002' },

    // Limpeza
    { name: 'Maria Costa', email: 'maria@pronto.com', category: 'Limpeza', city: 'São Paulo', rating: 5.0, bio: 'Diarista pontual e organizada, referências comprovadas', servicePrice: 180, phone: '11 99908-8001' },
    { name: 'Sandra Vieira', email: 'sandra@pronto.com', category: 'Limpeza', city: 'São Paulo', rating: 4.6, bio: 'Especialista em limpeza pós-obra', servicePrice: 200, phone: '11 99908-8002' },
  ];

  for (const p of professionals) {
    await prisma.professional.upsert({
      where: { email: p.email },
      update: {
        categoryId: categories[p.category].id,
        name: p.name,
        bio: p.bio,
        city: p.city,
        rating: p.rating,
        servicePrice: p.servicePrice,
      },
      create: {
        name: p.name,
        email: p.email,
        password: hashedPassword,
        phoneNumber: `+55 ${p.phone}`,
        bio: p.bio,
        city: p.city,
        rating: p.rating,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        completedServices: Math.floor(Math.random() * 200) + 20,
        responseTime: Math.floor(Math.random() * 30) + 5,
        verified: true,
        isActive: true,
        servicePrice: p.servicePrice,
        categoryId: categories[p.category].id,
      },
    });
  }

  console.log(`Seed completed: ${categoryData.length} categories, ${professionals.length} professionals`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
