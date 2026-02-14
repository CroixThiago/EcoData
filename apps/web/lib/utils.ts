import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilitário para combinação condicional de nomes de classes CSS.
 * 
 * Combina a funcionalidade do `clsx` (condicionais) com o `tailwind-merge`
 * (resolução de conflitos de classes Tailwind), garantindo que a última classe
 * sempre vença em caso de conflito.
 * 
 * @param inputs - Lista de classes ou objetos condicionais.
 * @returns String única com as classes processadas.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
