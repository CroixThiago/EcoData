import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

/**
 * Página Inicial do EcoData Enterprise.
 * 
 * Atua como ponto de entrada temporário enquanto o Dashboard completo
 * não é implementado. Demonstra o uso de componentes Shadcn/UI e
 * o sistema de temas.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <main className="flex max-w-4xl flex-col items-center gap-8 text-center">

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
            EcoData <span className="text-primary">Enterprise</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Plataforma de alta performance para gestão de dados e inteligência
            no setor de seguros. Infraestrutura, Segurança e Observabilidade.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Infraestrutura</CardTitle>
              <CardDescription>Docker, K8s & Cloud Native</CardDescription>
            </CardHeader>
            <CardContent>
              Fase 0 e 1 concluídas com sucesso. Ambiente robusto e escalável.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Auth & Compliance</CardDescription>
            </CardHeader>
            <CardContent>
              Módulos de identidade e validação rigorosa (Husky, Commitlint).
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experiência (UX)</CardTitle>
              <CardDescription>Shadcn/UI & Next.js</CardDescription>
            </CardHeader>
            <CardContent>
              Interface moderna, responsiva e acessível com suporte a temas.
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button size="lg">Acessar Dashboard</Button>
          <Button variant="outline" size="lg">Documentação</Button>
          <div className="ml-4">
            <ModeToggle />
          </div>
        </div>

      </main>
    </div>
  );
}
