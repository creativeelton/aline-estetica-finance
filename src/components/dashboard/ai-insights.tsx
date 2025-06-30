"use client";

import { useState } from "react";
import { getSpendingInsights } from "@/ai/flows/spending-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/data";
import { Loader2, Wand2 } from "lucide-react";

export function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setInsight("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const expenseDescription = formData.get("description") as string;
    const expenseCategory = formData.get("category") as string;
    const expenseValue = parseFloat(formData.get("amount") as string);

    if (!expenseDescription || !expenseCategory || isNaN(expenseValue)) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const result = await getSpendingInsights({
        expenseDescription,
        expenseCategory,
        expenseValue,
      });
      setInsight(result.spendingInsight);
    } catch (e) {
      setError("Ocorreu um erro ao gerar o insight.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Wand2 className="text-primary" />
            Insights com IA
        </CardTitle>
        <CardDescription>
          Analise uma despesa para receber um insight financeiro gerado por inteligência artificial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descrição da Despesa</Label>
            <Input id="description" name="description" placeholder="Ex: Compra de luvas" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select name="category">
                <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                    {categories.filter(c => c !== 'Serviço de Estética' && c !== 'Venda de Produto').map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input id="amount" name="amount" type="number" step="0.01" placeholder="Ex: 80,00" />
          </div>
          <div className="md:col-start-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Gerar Insight
            </Button>
          </div>
        </form>
        {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
        {insight && (
          <div className="mt-4 rounded-lg border bg-muted p-4">
            <p className="text-sm text-muted-foreground">{insight}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
