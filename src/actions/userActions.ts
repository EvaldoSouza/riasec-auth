'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth'; // Adjust path to your auth helper
import { Role } from '@prisma/client';

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await auth();

  // Security Gate: Only Admins can change roles
  if (session?.user?.role !== 'APLICADOR') {
    return { success: false, message: 'Não autorizado' };
  }

  try {
    console.log(newRole);
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    revalidatePath('/admin/users');
    return { success: true, message: 'Permissão atualizada com sucesso.' };
  } catch (error) {
    console.log(error);
    return { success: false, message: 'Erro ao atualizar permissão.' };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const session = await auth();

  if (session?.user?.role !== 'APLICADOR') {
    return { success: false, message: 'Não autorizado' };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !currentStatus },
    });
    revalidatePath('/admin/users');
    return { 
      success: true, 
      message: !currentStatus ? 'Usuário reativado.' : 'Usuário desativado.' 
    };
  } catch (error) {
    return { success: false, message: 'Erro ao alterar status.' };
  }
}