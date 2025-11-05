import { prisma } from './prismaClient';

/**
 * Seed script to populate the database with predefined accounts.
 * This script creates the 5 predefined accounts (acct1-acct5) that are
 * supported by the external Meta Ads API.
 * 
 * The script is idempotent: it uses upsert to avoid duplicates.
 */
async function main() {
  console.log('🌱 Starting database seed...');

  const predefinedAccounts = [
    { id: 'acct1', name: 'Account 1' },
    { id: 'acct2', name: 'Account 2' },
    { id: 'acct3', name: 'Account 3' },
    { id: 'acct4', name: 'Account 4' },
    { id: 'acct5', name: 'Account 5' },
  ];

  console.log(`📝 Seeding ${predefinedAccounts.length} predefined accounts...`);

  // Use transaction to ensure atomicity
  const results = await prisma.$transaction(
    async (tx) => {
      return Promise.all(
        predefinedAccounts.map((account) =>
          tx.account.upsert({
            where: { id: account.id },
            update: {
              name: account.name,
              updatedAt: new Date(),
            },
            create: {
              id: account.id,
              name: account.name,
            },
          })
        )
      );
    },
    {
      maxWait: 5000,
      timeout: 10000,
    }
  );

  console.log(`✅ Successfully seeded ${results.length} accounts:`);
  results.forEach((account) => {
    console.log(`   - ${account.id}: ${account.name}`);
  });

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

