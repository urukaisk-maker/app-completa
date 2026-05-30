"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react";

const stats = [
  { title: "Usuarios", value: "1,234", icon: Users, change: "+12%" },
  { title: "Productos", value: "856", icon: Package, change: "+5%" },
  { title: "Pedidos", value: "432", icon: ShoppingCart, change: "+18%" },
  { title: "Ingresos", value: "€12.4k", icon: TrendingUp, change: "+23%" },
];

export default function DashboardPage() {
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
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">{stat.change}</span> vs mes anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Últimas acciones en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nuevo usuario registrado", user: "Manuel Carrasco", time: "Hace 2 min" },
                { action: "Pedido completado", user: "#1234", time: "Hace 15 min" },
                { action: "Producto actualizado", user: "iPhone 15 Pro", time: "Hace 1 h" },
                { action: "Usuario suspendido", user: "john@example.com", time: "Hace 3 h" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
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
                { name: "Redis Cache", status: "Operativo", color: "bg-green-500" },
                { name: "RabbitMQ", status: "Operativo", color: "bg-green-500" },
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
