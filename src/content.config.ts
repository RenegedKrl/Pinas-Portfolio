import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Ficha fixa de projeto (ver plano 6c)
const projetos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projetos' }),
  schema: z.object({
    titulo: z.string(),
    categoria: z.array(z.enum(['Site', 'Landing', 'Tráfego', 'Design'])),
    nicho: z.string(),
    ano: z.number(),
    link: z.string().url().optional(),
    capa: z.string().optional(),
    descricao: z.string(),
    galeria: z.array(z.object({ src: z.string(), legenda: z.string() })).default([]), // prints das seções do site
    etapas: z.array(z.object({ titulo: z.string(), texto: z.string(), imagem: z.string().optional() })).default([]),
    resultado: z.string().optional(),
    destaque: z.boolean().default(false),
    ordem: z.number().default(99),
    publico: z.boolean().default(false), // só aparece com autorização do cliente
  }),
});

export const collections = { projetos };
