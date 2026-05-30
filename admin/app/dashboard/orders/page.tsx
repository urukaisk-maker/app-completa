"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pedidos</h2>
        <p className="text-muted-foreground">Gestiona los pedidos de los clientes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de pedidos</CardTitle>
          <CardDescription>Próximamente: seguimiento de estados y pagos</CardDescription>
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
