"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, ImagePlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct, getCategories, uploadProductImage } from "@/lib/api";
import { Category } from "@/types/catalog";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<{ file: File; preview: string }[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    isActive: true,
  });
  const [variants, setVariants] = useState<{ sku: string; size: string; color: string; stock: string; priceAdjustment: string }[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    addFiles(files);
  }, []);

  function addFiles(files: File[]) {
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviewFiles((prev) => [...prev, ...newPreviews]);
  }

  function removePreview(index: number) {
    setPreviewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const product = await createProduct({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        categoryId: form.categoryId,
        isActive: form.isActive,
        variants: variants
          .filter((v) => v.sku.trim() !== "")
          .map((v) => ({
            sku: v.sku,
            size: v.size || undefined,
            color: v.color || undefined,
            stock: parseInt(v.stock, 10) || 0,
            priceAdjustment: parseFloat(v.priceAdjustment) || 0,
          })),
      });

      for (let i = 0; i < previewFiles.length; i++) {
        await uploadProductImage(product.id, previewFiles[i].file, i);
      }

      router.push("/dashboard/products");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nuevo producto</h2>
          <p className="text-muted-foreground">Completa los datos del producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Información general</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (€)</Label>
                <Input id="price" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="active" checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label htmlFor="active">Producto activo</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Variantes (talla / color)</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { sku: "", size: "", color: "", stock: "", priceAdjustment: "0" }])}>
              + Añadir variante
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay variantes. Añade tallas o colores si el producto las tiene.</p>
            )}
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-6 gap-3 items-end border p-3 rounded-md">
                <div className="space-y-1">
                  <Label className="text-xs">SKU</Label>
                  <Input value={v.sku} onChange={(e) => { const copy = [...variants]; copy[i].sku = e.target.value; setVariants(copy); }} placeholder="SKU" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Talla</Label>
                  <Input value={v.size} onChange={(e) => { const copy = [...variants]; copy[i].size = e.target.value; setVariants(copy); }} placeholder="Ej: M" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <Input value={v.color} onChange={(e) => { const copy = [...variants]; copy[i].color = e.target.value; setVariants(copy); }} placeholder="Ej: Rojo" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Stock</Label>
                  <Input type="number" min="0" value={v.stock} onChange={(e) => { const copy = [...variants]; copy[i].stock = e.target.value; setVariants(copy); }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ajuste precio (€)</Label>
                  <Input type="number" step="0.01" value={v.priceAdjustment} onChange={(e) => { const copy = [...variants]; copy[i].priceAdjustment = e.target.value; setVariants(copy); }} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Imágenes</CardTitle></CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Arrastra imágenes aquí o haz clic para seleccionar</p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
              />
            </div>

            {previewFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {previewFiles.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden border">
                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Crear producto"}</Button>
          <Link href="/dashboard/products"><Button type="button" variant="outline">Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
