import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const adminEmail = 'admin@alhuda.local';
  const adminPassword = 'admin123'; // Change this in production!

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample researcher user
  const researcherEmail = 'researcher@alhuda.local';
  const researcherPassword = 'researcher123';

  const researcherHashedPassword = await bcrypt.hash(researcherPassword, 10);

  const researcher = await prisma.user.upsert({
    where: { email: researcherEmail },
    update: {},
    create: {
      email: researcherEmail,
      passwordHash: researcherHashedPassword,
      name: 'Sample Researcher',
      role: 'RESEARCHER',
    },
  });

  console.log('✅ Created researcher user:', researcher.email);

  // Create sample officer user
  const officerEmail = 'officer@alhuda.local';
  const officerPassword = 'officer123';

  const officerHashedPassword = await bcrypt.hash(officerPassword, 10);

  const officer = await prisma.user.upsert({
    where: { email: officerEmail },
    update: {},
    create: {
      email: officerEmail,
      passwordHash: officerHashedPassword,
      name: 'Sample Officer',
      role: 'OFFICER',
    },
  });

  console.log('✅ Created officer user:', officer.email);

  // Create sample document
  const sampleDocument = await prisma.document.create({
    data: {
      title: 'Sample Council Document',
      fileName: 'sample-document.pdf',
      content: 'This is a sample document for testing purposes.',
      status: 'PROCESSED',
      uploadedById: researcher.id,
      processedAt: new Date(),
    },
  });

  console.log('✅ Created sample document:', sampleDocument.title);

  // Create sample chat session
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: researcher.id,
      title: 'Sample Chat Session',
      messages: {
        create: [
          {
            role: 'USER',
            content: 'What is the purpose of this document?',
          },
          {
            role: 'ASSISTANT',
            content: 'This document appears to be a sample document for testing the Al-Huda Portal system.',
          },
        ],
      },
      documents: {
        connect: { id: sampleDocument.id },
      },
    },
  });

  console.log('✅ Created sample chat session:', chatSession.id);

  // Create sample action log
  await prisma.actionLog.create({
    data: {
      userId: admin.id,
      type: 'DOCUMENT_UPLOADED',
      description: 'Sample document uploaded for testing',
      metadata: {
        documentId: sampleDocument.id,
        fileName: sampleDocument.fileName,
      },
    },
  });

  console.log('✅ Created sample action log');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\nDefault users created:');
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`  Researcher: ${researcherEmail} / ${researcherPassword}`);
  console.log(`  Officer: ${officerEmail} / ${officerPassword}`);
  console.log('\n⚠️  Remember to change these passwords in production!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

