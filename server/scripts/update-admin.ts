import { prisma } from '../src/config/database';

async function updateToAdmin() {
  try {
    // Update the user to admin role
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@fastpass.com' },
      data: { role: 'ADMIN' }
    });

    console.log('User updated to admin successfully:');
    console.log('Email:', updatedUser.email);
    console.log('Role:', updatedUser.role);
  } catch (error) {
    console.error('Error updating user to admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateToAdmin(); 