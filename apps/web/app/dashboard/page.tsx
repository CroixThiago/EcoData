"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Shield, Activity, Bell, Search, Settings, Plus } from "lucide-react";
import Link from "next/link";
import { FileUploadModal } from "@/components/file-upload-modal";

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-8">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold tracking-tight">EcoData <span className="text-primary italic">Brain</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">Início</Link>
                        <Link href="/dashboard" className="text-sm font-medium text-primary">Dashboard</Link>
                        <Link href="/docs" className="text-sm font-medium transition-colors hover:text-primary">Docs</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" asChild><Link href="/"><Settings className="h-5 w-5" /></Link></Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 space-y-8 p-8 pt-6 container">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Painel de Controle</h2>
                    <div className="flex items-center space-x-2">
                        <FileUploadModal>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Upload
                            </Button>
                        </FileUploadModal>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documentos Processados</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,284</div>
                            <p className="text-xs text-muted-foreground">+12% desde o último mês</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Extrações IA</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">45,231</div>
                            <p className="text-xs text-muted-foreground">+201 hoje</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Integridade da Rede</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">99.9%</div>
                            <p className="text-xs text-muted-foreground">Soberano e Ativo</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                            <Bell className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2</div>
                            <p className="text-xs text-muted-foreground">Requer atenção imediata</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Últimos Documentos</CardTitle>
                            <CardDescription>Ultimos 5 documentos processados pelo pipeline.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Arquivo</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Confiança</TableHead>
                                        <TableHead className="text-right">Data</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">apolice_v3.pdf</TableCell>
                                        <TableCell><span className="text-green-500 font-semibold">Concluído</span></TableCell>
                                        <TableCell>98.2%</TableCell>
                                        <TableCell className="text-right">Hoje, 14:23</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">rg_cliente_01.jpg</TableCell>
                                        <TableCell><span className="text-green-500 font-semibold">Concluído</span></TableCell>
                                        <TableCell>95.5%</TableCell>
                                        <TableCell className="text-right">Hoje, 12:10</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">cnh_frontal.png</TableCell>
                                        <TableCell><span className="text-blue-500 font-semibold">Processando</span></TableCell>
                                        <TableCell>--</TableCell>
                                        <TableCell className="text-right">Hoje, 11:55</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Insights da IA</CardTitle>
                            <CardDescription>Tendências detectadas nos últimos 7 dias.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md border p-3 bg-muted/20">
                                <p className="text-sm font-medium">Eficiência de Extração</p>
                                <p className="text-xs text-muted-foreground">A precisão do modelo Tesseract v4 aumentou 3% após novo treinamento de OCR.</p>
                            </div>
                            <div className="rounded-md border p-3 bg-muted/20">
                                <p className="text-sm font-medium">Anomalia Detectada</p>
                                <p className="text-xs text-muted-foreground">3 tentativas de upload de arquivos corrompidos foram bloqueadas na última hora.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
