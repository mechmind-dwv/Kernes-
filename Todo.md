# Kernes - Lista de Tareas y Roadmap

> Proyecto de contravigilancia digital y soberanía de datos.
> Fecha de inicio: 2026-05-23 | Estado: Fase 0 - Cimentación

---

## Leyenda

- [ ] Pendiente
- [/] En progreso
- [x] Completado
- [!] Bloqueado / Con impedimento
- [?] En evaluación / Requiere decisión

---

## FASE 0: Cimentación (Meses 1-3)

### Fundación Legal y Organizativa

- [ ] Redactar estatutos de asociación sin ánimo de lucro (ONG de protección digital)
- [ ] Registrar dominio principal y mirrors (.org, .onion, .eth)
- [ ] Abrir cuentas bancarias/ethéreas para financiación transparente
- [ ] Definir código de conducta del proyecto (Contributor Covenant adaptado)
- [ ] Crear cuentas oficiales: GitHub Org, GitLab mirror, Mastodon, X/Twitter
- [ ] Diseñar identidad visual: logo, paleta de colores, assets para redes

### Infraestructura Técnica Base

- [ ] Provisionar repositorio monorepo (PNPM workspaces + Turborepo)
- [ ] Configurar CI/CD: GitHub Actions (lint, test, build, sign)
- [ ] Desplegar primera instancia de API Gateway en Cloudflare Workers (Hono.js)
- [ ] Configurar IPFS node para almacenamiento descentralizado de documentación
- [ ] Implementar sistema de firmas de releases (Ed25519 + reproducible builds)
- [ ] Setup de monitoreo básico: uptime, métricas agregadas (sin PII)

### Documentación Fundacional

- [ ] Redactar whitepaper técnico (especificación criptográfica)
- [ ] Redactar whitepaper de gobernanza (DAO, financiación, ética)
- [ ] Crear sitio web estático inicial (landing + blog + docs)
- [ ] Traducir documentación base a inglés, catalán y euskera
- [ ] Publicar política de privacidad del propio proyecto (dogfooding)

### Auditoría y Revisión Externa

- [?] Contactar 3 firmas de auditoría para revisión de arquitectura de diseño
- [ ] Recibir y procesar feedback de auditoría de diseño
- [ ] Publicar reporte de auditoría de diseño (transparente)

---

## FASE 1: MVP - Extensión y Detección (Meses 4-7)

### Módulo Sentinel (Detección y Auditoría)

#### Core de Extensión

- [ ] Scaffold de extensión WebExtension Manifest V3 (Chrome + Firefox)
- [ ] Implementar content script para interceptación pasiva de headers HTTP
- [ ] Crear base de datos local de trackers y brokers de datos conocidos
- [ ] Implementar detector de fingerprinting (canvas, WebGL, fonts, AudioContext)
- [ ] Desarrollar visualización de grafo de terceros (D3.js dentro de popup)
- [ ] Sistema de puntuación de "salud de privacidad" por sitio web

#### Escáner de Exposición

- [ ] Integración con API de Have I Been Pwned (k-anonimity)
- [ ] Desarrollar verificación de filtraciones locales (sin enviar datos al servidor)
- [ ] Implementar alertas proactivas de nuevas filtraciones detectadas
- [ ] Crear historial de exposición con timeline visual

#### Panel Web

- [ ] Dashboard principal con índice de privacidad global del usuario
- [ ] Vista detallada por sitio web (qué datos comparte, con quién)
- [ ] Configuración de preferencias y whitelist/blacklist de dominios
- [ ] Exportación de informes en PDF (para uso legal/evidencia)

#### Parser de Políticas de Privacidad v1

- [ ] Dataset de entrenamiento: 500 políticas de privacidad etiquetadas
- [ ] Implementar reglas heurísticas básicas (keywords de riesgo)
- [ ] Clasificación simple: rojo/amarillo/verde por sitio
- [ ] Cache local de análisis para no re-procesar

### Infraestructura Fase 1

- [ ] Endpoints de API Gateway para autenticación (DIDs iniciales)
- [ ] Sistema de actualización de base de datos de trackers vía IPFS
- [ ] Métricas de uso anonimizadas (contadores, sin identificación)

### Comunidad y Lanzamiento

- [ ] Publicar extensión en Chrome Web Store (con política de privacidad clara)
- [ ] Publicar extensión en Firefox Add-ons
- [ ] Escribir post de lanzamiento en Hacker News / Product Hunt
- [ ] Presentar en conferencias: CCC, RightsCon, Bootstrap DIY
- [ ] Recopilar feedback de primeros 100 usuarios beta

---

## FASE 2: Ofuscación Activa y Móvil (Meses 8-12)

### Módulo Chaff (Ofuscación y Contravigilancia)

#### Navegación Sintética

- [ ] Motor de generación de comportamiento de navegación falso
- [ ] Implementar tabs invisibles con navegación autónoma (en horarios de inactividad)
- [ ] Sistema de perfiles sintéticos (intereses opuestos o neutros al usuario real)
- [ ] Algoritmo de scheduling: cuándo y cuánto navegar sintéticamente
- [ ] Detección de inactividad del usuario para no interferir

#### Dilución de Búsqueda

- [ ] Integración con motores de búsqueda (Google, Bing, Brave Search)
- [ ] Generador de queries de búsqueda coherentes pero aleatorias
- [ ] Sistema de inyección periódica de búsquedas diluyentes
- [ ] Métrica de "entropía de perfil" (qué tan difícil es identificar al usuario real)

#### Ofuscación de Identidad

- [ ] Integración con servicios de alias: SimpleLogin, AnonAddy, Firefox Relay
- [ ] Generador de identidades descartables (nombre, email, teléfono virtual)
- [ ] Gestor de múltiples perfiles de identidad por contexto
- [ ] Sistema de relays descentralizados para ofuscación de IP (integración Nym mixnet)

### App Móvil

- [ ] Scaffold con Capacitor + React (iOS y Android)
- [ ] Portar módulo Sentinel a móvil (detección de trackers en apps)
- [ ] Implementar VPN local para filtrado de trackers a nivel de red
- [ ] Sincronización de configuraciones entre dispositivos (QR + WireGuard)
- [ ] Notificaciones push para alertas de privacidad
- [ ] Publicar en F-Droid (prioridad) y Google Play Store

### Módulo LexAI v1 (Asistencia Legal)

- [ ] Formulario guiado para solicitudes GDPR (acceso, rectificación, eliminación)
- [ ] Formulario guiado para solicitudes CCPA
- [ ] Generador de plantillas de email en múltiples idiomas
- [ ] Base de datos de contactos DPO (Data Protection Officers) de empresas comunes
- [ ] Sistema de recordatorios de plazos legales (30 días GDPR, 45 días CCPA)
- [ ] Registro local cifrado de solicitudes y respuestas

### Lanzamiento Fase 2

- [ ] Campaña de crowdfunding en Open Collective
- [ ] Partnership con organizaciones de derechos digitales (EFF, Access Now, Xnet)
- [ ] Primer grant aplicado: Filecoin Foundation o Ethereum Foundation

---

## FASE 3: Soberanía Criptográfica (Meses 13-18)

### Módulo SovereignVault

#### Identidad Descentralizada

- [ ] Implementación de DIDs según estándar W3C
- [ ] Integración con Ceramic Network / ComposeDB
- [ ] Sistema de resolución de DIDs descentralizada
- [ ] UI para gestionar múltiples DIDs por contexto (trabajo, personal, salud)

#### Credenciales Verificables

- [ ] Emisión de credenciales auto-firmadas (edad, residencia, membresía)
- [ ] Verificación de credenciales de terceros (integración con emisores europeos)
- [ ] Sistema de presentación selectiva (revelar solo lo necesario)

#### Pruebas de Conocimiento Cero (ZK-Proofs)

- [ ] Implementar circuitos Circom para verificación de atributos comunes
- [ ] Integrar snarkjs para generación y verificación en navegador
- [ ] Casos de uso: probar mayoría de edad sin revelar fecha exacta
- [ ] Casos de uso: probar ingreso mínimo sin revelar cantidad exacta
- [ ] Casos de uso: probar residencia sin revelar dirección exacta

#### Cifrado Homomórfico (FHE)

- [ ] Integrar tfhe.js para operaciones FHE en el navegador
- [ ] Implementar demostración de concepto: encuesta privada
- [ ] Implementar demostración de concepto: computación sobre datos médicos
- [ ] Optimizaciones de rendimiento para dispositivos móviles

#### Consentimiento Programable

- [ ] Smart contracts en Polygon para gestión de acceso a datos
- [ ] UI para definir quién puede ver qué dato, por cuánto tiempo
- [ ] Sistema de revocación de consentimiento en un click
- [ ] Auditoría on-chain de accesos a datos (transparencia)

### Infraestructura Fase 3

- [ ] Nodo propio de IPFS para almacenamiento de credenciales
- [ ] Red de relays WireGuard para sincronización segura entre dispositivos
- [ ] Backup cifrado y fragmentado (Shamir's Secret Sharing)

---

## FASE 4: Descentralización y Autonomía (Meses 19-24)

### Red Comunitaria

- [ ] Protocolo para operadores de nodos comunitarios
- [ ] Sistema de reputación para operadores de infraestructura
- [ ] Migración progresiva de Cloudflare Workers a red de operadores
- [ ] CDN descentralizada para actualizaciones de extensiones (IPFS)

### Gobernanza DAO

- [ ] Desplegar contratos de gobernanza DAO
- [ ] Sistema de votación on-chain (snapshot + execution)
- [ ] Distribución de Soulbound Tokens de gobernanza a contribuidores
- [ ] Primeras votaciones comunitarias sobre roadmap y gastos

### SDK y Extensibilidad

- [ ] Publicar SDK de Kernes para desarrolladores de terceros
- [ ] Sistema de plugins/módulos para extender funcionalidad
- [ ] Marketplace descentralizado de plugins auditados
- [ ] Documentación completa de APIs y protocolos

### Madurez y Sostenibilidad

- [ ] Auditoría de seguridad formal completa (Trail of Bits u OpenZeppelin)
- [ ] Certificación de cumplimiento GDPR/CCPA del propio sistema
- [ ] Establecer fondo de reserva para 2 años de operación
- [ ] Plan de sucesión: cómo continuar el proyecto sin los fundadores originales

---

## BACKLOG CONTINUO (Sin fecha específica)

### Mejoras Técnicas

- [ ] Implementar GANs para generar comportamiento sintético indistinguible
- [ ] Soporte para verifiable credentials con eIDAS 2.0 (EUDI Wallet)
- [ ] Integración con sistemas de identidad soberana de otros continentes
- [ ] Optimización de rendimiento de ZK-proofs en WebAssembly
- [ ] Implementar post-quantum cryptography (algoritmos resistentes a cuántica)
- [ ] Soporte para hardware keys (YubiKey, SoloKeys) en autenticación

### Internacionalización

- [ ] Traducir interfaz a 10+ idiomas (prioridad: FR, DE, IT, PT, NL, AR, JA, KO)
- [ ] Adaptar LexAI a regulaciones locales: LGPD (Brasil), POPIA (Sudáfrica), PIPEDA (Canadá)
- [ ] Partnerships con organizaciones locales de derechos digitales

### Comunidad y Educación

- [ ] Crear curso online gratuito: "Soberanía Digital 101"
- [ ] Organizar conferencia anual: "Kernes Summit"
- [ ] Programa de embajadores estudiantiles en universidades
- [ ] Kit de prensa y recursos para periodistas

---

## DECISIONES PENDIENTES

- [?] **Blockchain L2:** ¿Polygon o Arbitrum para smart contracts?
- [?] **NLP local:** ¿Transformers.js con modelos locales o integración con Ollama?
- [?] **Financiación:** ¿Aplicar a VC éticos ( tipo Calm Company) o mantener 100% comunidad?
- [?] **Geolocalización:** ¿Implementar nuestro propio mixnet o integrar con Nym/Tor?
- [?] **Móvil nativo:** ¿Capacitor es suficiente o necesitamos React Native puro para ciertas funciones?

---

## MÉTRICAS DE ÉXITO POR FASE

| Fase | Métrica Objetivo |
|------|-----------------|
| Fase 1 | 1,000 usuarios activos semanales, 50 contribuidores GitHub |
| Fase 2 | 10,000 usuarios activos, $50K recaudados en crowdfunding |
| Fase 3 | 50,000 usuarios activos, 10 partnerships institucionales |
| Fase 4 | 200,000 usuarios activos, gobernanza DAO autónoma |

---

*Última actualización: 2026-05-23*
*Mantenido por: Equipo de Coordinación de Kernes*
*Licencia: CC BY-SA 4.0*
