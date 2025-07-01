"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { categories, paymentMethods, addTransaction } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { generateInsightForExpense } from "@/app/lancamentos/actions";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/auth-context";


const formSchema = z.object({
  type: z.enum(["income", "expense"], { required_error: "Tipo é obrigatório." }),
  date: z.date({ required_error: "Data é obrigatória." }),
  amount: z.coerce.number().positive({ message: "Valor deve ser positivo." }),
  category: z.string().min(1, "Categoria é obrigatória."),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória."),
  description: z.string().min(1, "Descrição é obrigatória."),
});

export function NewTransactionForm() {
    const { toast } = useToast();
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            type: undefined,
            date: undefined,
            amount: undefined,
            category: "",
            paymentMethod: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Erro de Autenticação",
                description: "Usuário não encontrado. Tente fazer login novamente.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const newTransactionData = {
                ...values,
                userId: user.uid,
                date: values.date.toISOString(),
            };

            // Step 1: Add transaction on the client. Firebase auth is handled by the SDK.
            const newTransaction = await addTransaction(newTransactionData);

            toast({
                title: "Sucesso!",
                description: "Lançamento adicionado.",
            });
            
            form.reset();
            router.refresh(); // Revalidates data for all pages to show the new transaction

            // Step 2: If it's an expense, call the server action to get an AI insight.
            if (newTransaction.type === 'expense') {
                const insightResult = await generateInsightForExpense({
                    expenseDescription: newTransaction.description,
                    expenseCategory: newTransaction.category,
                    expenseValue: newTransaction.amount,
                });
                
                if (insightResult.insight) {
                    toast({
                        title: "💡 Insight da IA",
                        description: insightResult.insight,
                        duration: 8000,
                    });
                }
            }

        } catch (error) {
            console.error("Firebase save error:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha ao salvar a transação no banco de dados.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(
                        !field.value && "text-muted-foreground",
                        field.value === 'income' && 'bg-emerald-100/50 dark:bg-emerald-900/30 border-emerald-500/50',
                        field.value === 'expense' && 'bg-rose-100/50 dark:bg-rose-900/30 border-rose-500/50'
                    )}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Lançamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="0,00" {...field} value={field.value ?? ""} step="0.01" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione a forma de pagamento" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {paymentMethods.map(method => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Ex: Pagamento do aluguel de Maio" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Adicionar Lançamento
        </Button>
      </form>
    </Form>
  );
}
