# MÓDULO: fase_4_y_5_testing_y_despliegue (Calidad, Lanzamiento y Cosecha)

## 1. Objetivo del Módulo
Validar que las piezas del software funcionen como se prometió (Fase 4) y ejecutar el pase a producción de manera segura (Fase 5). El objetivo supremo de este módulo es la **"Cosecha Exponencial"**: extraer el conocimiento, los módulos de código y las configuraciones exitosas de este proyecto para guardarlos en la Bóveda y usarlos en el futuro.

## 2. Flujo de Trabajo: Fase 4 (Testing y Calidad)
* **Testing Automatizado por UI:** El sistema recupera automáticamente los Criterios de Aceptación (BDD) redactados en la Fase 1 y los renderiza como una lista de Casos de Prueba interactiva (Checklist). 
* **Gestión de Bugs Integrada:** Si el usuario marca un caso como "Falló", se abre un modal rápido. Al confirmar, el sistema **crea automáticamente un Ticket de Bug** en el tablero Kanban (Fase 3), le adjunta el contexto del BDD que falló y lo pone al tope de la prioridad. Cero fricción, cero cambio de contexto.

## 3. Flujo de Trabajo: Fase 5 (Despliegue y Cosecha)
* **Checklist de Lanzamiento:** Lista de verificación final (Variables de entorno, migraciones de base de datos, dominios apuntados).
* **Extracción a la Bóveda (El Cierre Exponencial):** Al marcar el proyecto como "Completado/Lanzado", se lanza un Wizard (Asistente) que le pregunta al usuario qué partes del proyecto quiere guardar.
  * *¿Guardar el Stack Tecnológico (Fase 2)?* Se guarda en `vault.saved_stacks`.
  * *¿Guardar Plantilla de Formularios?* Se guarda en `vault.form_templates`.
  * *¿Guardar Prompt de CI/CD?* Queda en la biblioteca personal.

## 4. Retroalimentación (El Beneficio Activo)
* **La Bola de Nieve:** El usuario visualiza cómo su "Bóveda" se llena de herramientas propias. Entiende que el tiempo invertido en documentar este proyecto le va a ahorrar semanas en el próximo.
* **Micro-Copy Educativo (Tono Mentor Argentino):** * *Al fallar un Test:* "Si falló, no te calientes. Escribí qué pasó y tocá 'Reportar Bug'. Te lo mando directo al Sprint de la Fase 3 con todo el contexto para que lo arregles mañana."
  * *En la Cosecha (Fase 5):* "¡Felicitaciones por el deploy! 🎉 ¿Qué parte de este sistema te quedó de diez? Guardala en la Bóveda así en el próximo proyecto la sacás de taquito y no arrancás de cero."

## 5. Reglas Estrictas para la IA (Generación de Código Frontend)
* **UI de Testing:** La interfaz de Casos de Prueba debe ser extremadamente limpia (estilo lista de tareas), permitiendo navegación rápida con el teclado (Tab, Enter, Espacio) para marcar "Pasó/Falló" sin usar el mouse constantemente.
* **Límite de Componentes:** Separar la lógica en `<TestingChecklist />`, `<BugReporterModal />`, `<DeployWizard />` y `<VaultExtractor />`. Ningún archivo debe superar las 250 líneas.
* **Integración de Base de Datos (IA):** Al crear un Bug, la IA debe hacer un `INSERT` en la tabla `agile.tickets` asignando correctamente el `tenant_id` y el `project_id`. Al extraer a la Bóveda, debe empaquetar la configuración en un objeto `JSONB` e insertarlo en el esquema `vault`.