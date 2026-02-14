"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Provedor de Temas (ThemeProvider).
 * 
 * Envolve a aplicação para fornecer o contexto de tema (claro/escuro)
 * utilizando a biblioteca next-themes. Isso evita o "flash" de conteúdo
 * incorreto durante o carregamento (FOUC) e gerencia a persistência.
 * 
 * @param props - Propriedades passadas para o componente (children, etc).
 * @returns O componente Provider configurado.
 */
export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
