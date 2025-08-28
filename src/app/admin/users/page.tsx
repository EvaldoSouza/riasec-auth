import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllUsers } from '@/services/userServices';
import { UserList } from './userList';     // We will create this next
import { columns } from './columns';         // We will create this next

/**
 * The main server-side page for the User Management feature.
 */
export default async function ManageUsersPage() {
  // 1. Security: Ensure only admins (APLICADOR role) can access this page.
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  // 2. Data Fetching: Get all user data on the server.
  const users = await getAllUsers();

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
              Visualize e gerencie todos os usuários da plataforma.
          </p>
      </div>
      
      {/* 3. Rendering: Pass the server-fetched data to the client component.
        This component will be responsible for the interactive data table.
        Note: We don't have a "Create User" button, as users self-register.
      */}
      <UserList columns={columns} data={users} />
    </div>
  );
}