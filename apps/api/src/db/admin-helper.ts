import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'list') {
    // List all users
    console.log('📋 Listing all users:\n');
    const allUsers = await db.select({
      email: users.email,
      name: users.name,
      role: users.role,
    }).from(users);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\nRun: pnpm run admin:create admin@crs.cz admin123');
    } else {
      allUsers.forEach((user, i) => {
        console.log(`${i + 1}. ${user.email} (${user.role}) - ${user.name}`);
      });
    }
  } else if (command === 'create') {
    // Create new admin user
    const email = args[1];
    const password = args[2];
    
    if (!email || !password) {
      console.log('❌ Usage: pnpm run admin:create <email> <password>');
      console.log('Example: pnpm run admin:create admin@crs.cz admin123');
      process.exit(1);
    }
    
    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    
    if (existing) {
      console.log(`❌ User ${email} already exists!`);
      console.log('Use "reset" command to reset password.');
      process.exit(1);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    }).returning();
    
    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${newUser.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${newUser.role}`);
  } else if (command === 'reset') {
    // Reset password for existing user
    const email = args[1];
    const password = args[2];
    
    if (!email || !password) {
      console.log('❌ Usage: pnpm run admin:reset <email> <password>');
      console.log('Example: pnpm run admin:reset admin@crs.cz newpassword123');
      process.exit(1);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [updated] = await db.update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.email, email))
      .returning();
    
    if (!updated) {
      console.log(`❌ User ${email} not found!`);
      process.exit(1);
    }
    
    console.log('✅ Password reset successfully!');
    console.log(`Email: ${updated.email}`);
    console.log(`New password: ${password}`);
  } else {
    console.log('Admin Helper Tool\n');
    console.log('Available commands:');
    console.log('  list   - List all users in database');
    console.log('  create - Create new admin user');
    console.log('  reset  - Reset password for existing user\n');
    console.log('Examples:');
    console.log('  pnpm run admin:list');
    console.log('  pnpm run admin:create admin@crs.cz admin123');
    console.log('  pnpm run admin:reset admin@crs.cz newpassword123');
  }
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
