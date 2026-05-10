import { z } from 'zod';

export const erdColumnSchema = z.object({
    nombre: z.string().min(1, "El nombre de la columna es obligatorio"),
    tipo: z.string().min(1, "El tipo de dato es obligatorio"),
    pk: z.boolean().optional(),
    fk: z.boolean().optional(),
    nullable: z.boolean().optional()
});

export const erdTableSchema = z.object({
    id: z.string().optional().default(() => crypto.randomUUID()),
    nombre: z.string().min(1, "El nombre de la tabla es obligatorio"),
    descripcion: z.string().optional(),
    columnas: z.array(erdColumnSchema)
});

export const erdSchema = z.array(erdTableSchema);

export const backlogTicketSchema = z.object({
    id: z.string().optional().default(() => crypto.randomUUID()),
    titulo: z.string().min(1, "El título es obligatorio"),
    descripcion: z.string().optional(),
    tipo: z.enum(['bug', 'feature', 'task']).default('task'),
    prioridad: z.enum(['baja', 'media', 'alta', 'critica']).default('media'),
    puntos: z.number().optional()
});

export const backlogSchema = z.array(backlogTicketSchema);

export type ErdTable = z.infer<typeof erdTableSchema>;
export type BacklogTicket = z.infer<typeof backlogTicketSchema>;
