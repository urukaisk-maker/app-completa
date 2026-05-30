"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react";

interface DashboardData {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiFetch<DashboardData>("/analytics/dashboard")
      .then(setData)
      .catch(console.error);
  }, []);

  const stats = data
    ? [
        { title: "Usuarios", value: String(data.totalUsers), icon: Users },
        { title: "Productos", value: String(data.totalProducts), icon: Package },
        { title: "Pedidos", value: String(data.totalOrders), icon: ShoppingCart },
        { title: "Ingresos", value: `€${data.totalRevenue.toFixed(2)}`, icon: TrendingUp },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Resumen</h2>
        <p className="text-muted-foreground">Vista general de tu negocio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
        {!data && (
          <>
            {[1,2,3,4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2"><div className="h-4 w-20 bg-muted rounded animate-pulse"/></CardHeader>
                <CardContent><div className="h-8 w-24 bg-muted rounded animate-pulse"/></CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Pedidos recientes</CardTitle>
            <CardDescription>Últimos 5 pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay pedidos aún</p>
              ) : (
                data?.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-medium">€{Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del sistema</CardTitle>
            <CardDescription>Servicios activos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "API Backend", status: "Operativo", color: "bg-green-500" },
                { name: "Base de datos", status: "Operativo", color: "bg-green-500" },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-sm">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${service.color}`} />
                    <span className="text-xs text-muted-foreground">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
