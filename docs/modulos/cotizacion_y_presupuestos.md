# MÓDULO: cotizacion_y_presupuestos (El Cierre Comercial)

## 1. Objetivo del Módulo
Automatizar la creación de propuestas comerciales y presupuestos. El módulo debe extraer el alcance técnico del proyecto (Fase 1), traducirlo a un lenguaje comprensible para el cliente, y empaquetarlo en una plantilla profesional bajo múltiples perfiles de marca (Multi-Brand).

## 2. Gestión de Perfiles de Empresa (Multi-Brand)
* **Tabla `billing_profiles` (Nueva en esquema `core` o `crm`):** * Permite crear múltiples identidades comerciales (Ej: Perfil "AppyStudios" vs. Perfil "Freelance Personal").
  * **Datos almacenados:** Nombre de empresa, Logo (URL), Colores de marca, Redes Sociales, Datos de contacto (Email, Teléfono, Web), y Condiciones de pago por defecto.

## 3. Flujo de Trabajo: El Generador de Presupuestos
El flujo se activa mediante el botón **"Generar Presupuesto"** dentro de un Proyecto (idealmente tras la Fase 1):

* **Paso 1: Selección de Perfil.** El modal arranca preguntando qué perfil comercial vas a usar para que traiga el logo y los colores.
* **Paso 2: Importación y Traducción Inteligente.** El sistema lee la tabla `epics` y `stories` (Fase 1). 
  * *Uso de IA (Semantic Kernel/ML.NET):* Traduce títulos técnicos (Ej: "Implementar JWT Auth con RLS") a ítems comerciales (Ej: "Sistema de Autenticación y Seguridad de Usuarios").
* **Paso 3: Edición de Ítems (Toggle).** Una lista donde el usuario puede apagar/prender qué módulos incluye en este presupuesto, ajustar el texto, agregar comentarios explicativos a cada ítem y definir el precio individual.
* **Paso 4: Finanzas y Condiciones.** * Selector de Moneda (USD, ARS, etc.).
  * Calculadora de totales automática.
  * Formas de pago dinámicas: Anticipo (cálculo de %), cantidad de cuotas, métodos (Transferencia, Cripto, etc.).
* **Paso 5: Emisión.** Genera el output final para enviarle al cliente.

## 4. Outputs Soportados
* **PDF Profesional:** Generado al vuelo, con el diseño de la plantilla, el logo y la paleta de colores del perfil seleccionado.
* **Enlace Web (Integrado al Link Mágico):** El presupuesto se puede habilitar como una pestaña más dentro del Portal del Cliente (Link Mágico), donde el cliente puede entrar, verlo interactivo y darle un botón de "Aprobar Presupuesto".

## 5. Retroalimentación y Tono de Voz (UX)
* **Micro-Copy Educativo (Mentor Argentino):**
  * *Al traducir ítems:* "Te pasé los tickets técnicos a idioma cliente para que no se maree. Pegale una leída y ajustá los precios."
  * *Al calcular anticipo:* "Si ponés un anticipo del 50%, son $X. ¡Asegurá el arranque!"
* **Prevención de Errores:** Si el usuario no seleccionó forma de pago, el sistema avisa suavemente: "Che, te olvidaste de poner cómo te van a pagar. ¡No dejemos la plata en el aire!"

## 6. Reglas Estrictas para la IA (Generación de Código)
* **Generación de PDF:** Utilizar librerías modernas y compatibles con el stack, como `@react-pdf/renderer` en el frontend, para asegurar que el diseño no se rompa al exportar. NO usar trucos sucios como imprimir la ventana del navegador.
* **Límite de Componentes:** El modal es complejo, debe dividirse estrictamente en: `<QuoteWizardModal />`, `<ProfileSelector />`, `<ScopeTranslatorList />` y `<FinanceCalculator />`.
* **Cálculos Financieros:** Todo cálculo de moneda, porcentajes y totales debe realizarse en funciones puras o Custom Hooks, evitando problemas de precisión de punto flotante.