"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UserWithApplicationCount } from "@/services/userServices";
import { updateUserRole, toggleUserStatus } from "@/actions/userActions"; 
import { toast } from "sonner"; // Using Sonner for toasts (recommended)

import { 
  MoreHorizontal, 
  Shield, 
  UserX, 
  UserCheck, 
  Loader2, 
  FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Role } from "@prisma/client";

interface UserRowActionsProps {
  user: UserWithApplicationCount;
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(user.role as Role);
  const [isPending, startTransition] = useTransition();

  const handleRoleUpdate = () => {
    startTransition(async () => {
      const result = await updateUserRole(user.id, selectedRole);
      if (result.success) {
        toast.success(result.message);
        setIsRoleDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleStatusToggle = () => {
    startTransition(async () => {
      const result = await toggleUserStatus(user.id, user.isActive);
      if (result.success) {
        toast.success(result.message);
        setIsStatusDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      {/* 1. Main Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${user.id}/results`} className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              Ver Resultados
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={() => setIsRoleDialogOpen(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Alterar Permissão
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onSelect={() => setIsStatusDialogOpen(true)}
            className={user.isActive ? "text-red-600 focus:text-red-600" : "text-green-600 focus:text-green-600"}
          >
            {user.isActive ? (
              <>
                <UserX className="mr-2 h-4 w-4" /> Desativar Acesso
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" /> Reativar Acesso
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 2. Dialog: Change Role */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Permissão</DialogTitle>
            <DialogDescription>
              Defina o nível de acesso para <b>{user.name}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select 
              value={selectedRole} 
              onValueChange={(val) => setSelectedRole(val as Role)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLIENTE">Cliente (Padrão)</SelectItem>
                <SelectItem value="APLICADOR">Aplicador (Admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleRoleUpdate} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Alert Dialog: Deactivate/Activate */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isActive ? 'Desativar Usuário?' : 'Reativar Usuário?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.isActive 
                ? 'O usuário perderá o acesso à plataforma imediatamente. O histórico de dados será mantido.'
                : 'O usuário poderá fazer login novamente na plataforma.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); 
                handleStatusToggle();
              }}
              className={user.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user.isActive ? 'Sim, Desativar' : 'Sim, Reativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}