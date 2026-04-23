export interface Tech {
    id: string;
    nombre: string;
    categoriaPrincipal: string; // La "Capa"
    categoriaSecundaria: string; // El "Tipo"
    urlDocumentacion?: string;
    colorHex?: string;
}

export interface Template {
    id: string;
    nombre: string;
    descripcion?: string;
    tecnologiasIdsJson: any;
}

export const MAIN_CATEGORIES = [
    '🖥️ Frontend', 
    '⚙️ Backend', 
    '🗄️ Base de Datos', 
    '☁️ Infra & DevOps', 
    '🧪 Testing & QA', 
    '📱 Mobile', 
    '🎨 Diseño & UI'
];

export const SECONDARY_CATEGORIES = [
    'Lenguaje', 'Framework', 'Librería', 'Motor DB', 'Extensión / ORM', 'Plataforma / Herramienta'
];
