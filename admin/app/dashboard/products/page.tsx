"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Productos</h2>
        <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo</CardTitle>
          <CardDescription>Próximamente: CRUD de productos con imágenes</CardDescription>
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
