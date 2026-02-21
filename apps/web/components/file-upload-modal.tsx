"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Schema {
    id: string;
    name: string;
    slug: string;
}

export function FileUploadModal({ children }: { children: React.ReactNode }) {
    const [file, setFile] = React.useState<File | null>(null);
    const [schemaId, setSchemaId] = React.useState<string>("");
    const [schemas, setSchemas] = React.useState<Schema[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [status, setStatus] = React.useState<"idle" | "uploading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = React.useState("");
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            fetch("/api/schemas")
                .then(res => res.json())
                .then(data => setSchemas(data.schemas || []))
                .catch(err => console.error("Erro ao carregar schemas:", err));
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus("idle");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setStatus("uploading");
        setErrorMessage("");

        const formData = new FormData();
        formData.append("file", file);
        if (schemaId) formData.append("schemaId", schemaId);

        try {
            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao enviar arquivo");
            }

            setStatus("success");
            // Opcional: recarregar a página ou atualizar a lista após 2s
            setTimeout(() => {
                setOpen(false);
                window.location.reload();
            }, 1500);

        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error("Upload error:", err);
            setStatus("error");
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setFile(null);
                setSchemaId("");
                setStatus("idle");
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Documento</DialogTitle>
                    <DialogDescription>
                        Faça o upload de um documento para extração de dados soberana.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="file">Arquivo (PDF, JPG, PNG)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="file"
                                type="file"
                                className="cursor-pointer"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>
                        {file && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <File className="h-3 w-3" /> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="schema">Schema de Inteligência (Opcional)</Label>
                        <select
                            id="schema"
                            title="Selecione um schema de extração"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={schemaId}
                            onChange={(e) => setSchemaId(e.target.value)}
                        >
                            <option value="">Detecção Automática</option>
                            {schemas.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {status === "success" && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 text-green-500 text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            Documento enviado e processado com sucesso!
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errorMessage}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={handleUpload}
                        disabled={!file || loading || status === "success"}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando OCR...
                            </>
                        ) : status === "success" ? (
                            "Concluído"
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Iniciar Upload
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
