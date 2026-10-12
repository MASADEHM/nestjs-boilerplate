import { PrismaPg } from '@prisma/adapter-pg';

import { seedCountries } from './seeds/countries.seed';

import { PrismaClient } from '../src/generated/prisma';

/**
 * Development Seed Script
 *
 * Creates a single PrismaClient instance to share across all seed functions
 * This prevents "too many connections" errors by reusing the same connection pool
 */
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl === undefined) {
  throw new Error('DATABASE_URL environment variable is required');
}
const adapter = new PrismaPg({
  connectionString: databaseUrl,
});
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting development seeding...\n');

  try {
    // 1. Seed master data (countries, roles, facilities, project locations)
    // eslint-disable-next-line no-console
    console.log('📍 Step 1: Seeding master data...');
    await seedCountries(prisma);

    // eslint-disable-next-line no-console
    console.log('\n🎉 Development seeding completed successfully!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('\n❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
