import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { Shield } from "lucide-react";

/**
 * Página Inicial do EcoData Enterprise.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <main className="flex max-w-4xl flex-col items-center gap-8 text-center">

        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
            EcoData <span className="text-primary italic">Enterprise</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Plataforma soberana para gestão de dados e inteligência
            no setor de seguros. Infraestrutura, Segurança e Observabilidade.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/docs#infra" className="transition-transform hover:scale-105">
            <Card className="cursor-pointer h-full hover:border-primary">
              <CardHeader>
                <CardTitle>Infraestrutura</CardTitle>
                <CardDescription>Docker, K8s & Cloud Native</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Fase 0 e 1 concluídas com sucesso. Ambiente robusto e escalável.
              </CardContent>
            </Card>
          </Link>

          <Link href="/docs#security" className="transition-transform hover:scale-105">
            <Card className="cursor-pointer h-full hover:border-primary">
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Auth & Compliance</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Módulos de identidade e validação rigorosa com auditoria imutável.
              </CardContent>
            </Card>
          </Link>

          <Link href="/docs#ux" className="transition-transform hover:scale-105">
            <Card className="cursor-pointer h-full hover:border-primary">
              <CardHeader>
                <CardTitle>Experiência (UX)</CardTitle>
                <CardDescription>Shadcn/UI & Next.js</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                Interface moderna, responsiva e acessível com suporte a temas.
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/dashboard">Acessar Dashboard</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/docs">Documentação</Link>
          </Button>
          <div className="ml-4">
            <ModeToggle />
          </div>
        </div>

      </main>
    </div>
  );
}
