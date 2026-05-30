"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
        <p className="text-muted-foreground">Gestiona los usuarios de la plataforma</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios</CardTitle>
          <CardDescription>Próximamente: tabla con filtros y paginación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            Módulo en desarrollo — integración con API NestJS pendiente
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
