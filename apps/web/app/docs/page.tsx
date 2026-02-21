"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Server, Layout, ChevronRight, Book, Code } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-8">
                    <div className="flex items-center gap-2">
                        <Book className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold tracking-tight">EcoData <span className="text-primary">Docs</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">Início</Link>
                        <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">Dashboard</Link>
                        <Link href="/docs" className="text-sm font-medium text-primary">Docs</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="https://github.com/CroixThiago/EcoData" target="_blank">
                                <Code className="mr-2 h-4 w-4" /> GitHub
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Sidebar */}
                <aside className="hidden md:block space-y-4">
                    <div className="space-y-1">
                        <h3 className="font-semibold px-2 pb-2">Introdução</h3>
                        <Button variant="ghost" className="w-full justify-start text-primary" size="sm">Visão Geral</Button>
                        <Button variant="ghost" className="w-full justify-start" size="sm">Arquitetura</Button>
                        <Button variant="ghost" className="w-full justify-start" size="sm">Guia Rápido</Button>
                    </div>
                    <div className="space-y-1 pt-4">
                        <h3 className="font-semibold px-2 pb-2">Componentes</h3>
                        <Button variant="ghost" className="w-full justify-start" size="sm">Infraestrutura</Button>
                        <Button variant="ghost" className="w-full justify-start" size="sm">Segurança</Button>
                        <Button variant="ghost" className="w-full justify-start" size="sm">Experiência (UX)</Button>
                    </div>
                </aside>

                {/* Content */}
                <main className="md:col-span-3 space-y-12">
                    <section id="header" className="space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Documentação Técnica</h1>
                        <p className="text-xl text-muted-foreground">
                            Tudo o que você precisa saber sobre a fundação soberana do EcoData Enterprise.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Section 1: Infra */}
                        <Card id="infra">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Server className="h-5 w-5 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fases 0 e 1</span>
                                </div>
                                <CardTitle>Infraestrutura Soberana</CardTitle>
                                <CardDescription>Docker, Kubernetes e Estratégia Cloud Native.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    O EcoData utiliza uma stack conteinerizada com Docker Compose para desenvolvimento e arquitetura escalável para produção.
                                    Implementamos serviços de alto desempenho como PostgreSQL, Redis e Qdrant para busca vetorial.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Multi-stage Docker Builds</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Orquestração com Traefik</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Monitoramento com Prometheus & Grafana</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Section 2: Security */}
                        <Card id="security">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conformidade e Proteção</span>
                                </div>
                                <CardTitle>Segurança & Compliance</CardTitle>
                                <CardDescription>Autenticação rigorosa e Auditoria Imutável.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Segurança não é uma característica, é o nosso alicerce. Utilizamos Prisma 7 com triggers SQL para garantir auditoria imutável (INSERT-only) no nível do banco de dados.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Auth com JWT & Bcrypt</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> RBAC (Role Based Access Control)</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Pre-commit hooks com Husky & Commitlint</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Section 3: UX */}
                        <Card id="ux">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Layout className="h-5 w-5 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interface Premium</span>
                                </div>
                                <CardTitle>Experiência do Usuário (UX)</CardTitle>
                                <CardDescription>Design System baseado em Shadcn/UI e Tailwind.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Uma interface moderna que prioriza o foco e a produtividade. Suporte nativo a Dark Mode e componentes acessíveis certificados pela Radix UI.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Next.js 16 para máxima performance</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Micro-animações com Framer Motion</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Tipografia otimizada (Inter/Outfit)</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
