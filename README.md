# Kernes

> **Privacidad por diseño, soberanía por defecto.**
>
> Una infraestructura de código abierto para la contravigilancia digital, diseñada para devolver a los ciudadanos el control sobre sus datos frente a plataformas de vigilancia masiva como Palantir.

---

## Qué es Kernes

Kernes es una suite de herramientas de código abierto que combina **detección de vigilancia**, **ofuscación activa de datos**, **identidad descentralizada** y **asistencia legal automatizada** en una única plataforma accesible.

No es un VPN. No es un bloqueador de anuncios. Es una **infraestructura de contrapoder digital** que:

- **Detecta** si tus datos están siendo recolectados por sistemas de vigilancia.
- **Ofusca** tu perfil real con datos sintéticos que contaminan los algoritmos de tracking.
- **Empodera** tu identidad digital con criptografía de última generación (DIDs, ZK-Proofs, FHE).
- **Asiste** en el ejercicio de tus derechos digitales (GDPR, CCPA, LGPD).

---

## Por qué existe

Las plataformas de análisis masivo integran datos personales de múltiples fuentes —gobiernos, corporaciones, redes sociales, geolocalización— sin consentimiento real ni transparencia. Construyen perfiles detallados de ciudadanos que pueden usarse para vigilancia predictiva, discriminación algorítmica y control social.

Kernes nace como respuesta técnica y ética a este panorama: **si no podemos evitar que recolecten datos, podemos hacer que los datos que recogen sean inútiles.**

---

## Características principales

### Sentinel — Detección y Auditoría

- Escaneo de filtraciones de datos (integración con Have I Been Pwned)
- Mapa interactivo de terceros que reciben tus datos al navegar
- Análisis de fingerprinting de navegador (canvas, WebGL, audio)
- Índice de "salud de privacidad" por sitio web

### Chaff — Ofuscación y Contravigilancia

- Navegación sintética automática durante periodos de inactividad
- Dilución de búsquedas con queries aleatorias coherentes
- Generador de identidades descartables (alias, teléfonos virtuales)
- Ofuscación de geolocalización vía relays descentralizados

### SovereignVault — Soberanía de Datos

- Identificadores Descentralizados (DIDs) autocustodiados
- Credenciales verificables con presentación selectiva
- Pruebas de Conocimiento Cero (ZK-Proofs) para verificación privada
- Cifrado homomórfico para cómputo sobre datos sin revelarlos

### LexAI — Asistencia Legal

- Parser automático de políticas de privacidad (semáforo de riesgos)
- Generador de solicitudes GDPR/CCPA/LGPD en múltiples idiomas
- Alertas de cambios en términos de servicio
- Registro cifrado de solicitudes legales enviadas

---

## Arquitectura

Kernes sigue una arquitectura **local-first y descentralizada**:

- **Extensión de navegador** (WebExtension API) para detección y ofuscación en tiempo real.
- **App móvil** (Capacitor + React) para protección en dispositivos iOS/Android.
- **Panel web** (React + TypeScript) para visualización y configuración.
- **API Gateway** (Hono.js en Cloudflare Workers) sin estado, sin logs de IP.
- **Almacenamiento** local cifrado (IndexedDB) + IPFS para datos no sensibles.
- **Identidad** gestionada por DIDs ( Ceramic Network) sin base de datos centralizada de usuarios.

```
Usuario → Extensión/App → Procesamiento local (NLP, ZK, FHE)
                                    ↓
                            IPFS / SovereignVault
                                    ↓
                         API Gateway (edge, stateless)
```

Todo el procesamiento sensible (análisis de hábitos, generación de pruebas ZK, parseo de documentos) ocurre **en el dispositivo del usuario**. Los servidores nunca ven datos en claro.

---

## Instalación

### Extensión de navegador

- **Chrome / Edge:** [Chrome Web Store](https://chrome.google.com/webstore) *(próximamente)*
- **Firefox:** [Firefox Add-ons](https://addons.mozilla.org) *(próximamente)*
- **Desarrollo:** Clona este repo y carga la extensión en modo desarrollador desde `apps/extension/`

### App móvil

- **F-Droid:** *(recomendado, próximamente)*
- **Google Play:** *(próximamente)*
- **iOS (TestFlight):** *(próximamente)*

### Panel web

Accede a [https://app.kernes.org](https://app.kernes.org) *(próximamente)* o ejecuta localmente:

```bash
git clone https://github.com/kernes/kernes.git
cd kernes/apps/web
pnpm install
pnpm dev
```

---

## Uso rápido

### 1. Primer escaneo

Abre la extensión tras instalarla. Kernes analizará automáticamente:
- Si tu correo aparece en filtraciones conocidas
- Qué sitios que visitas comparten datos con terceros
- Qué tan identificable es tu navegador mediante fingerprinting

### 2. Activar ofuscación

En el panel de control, ajusta el nivel de protección:
- **Bajo:** Detección pasiva, sin ofuscación.
- **Medio:** Navegación sintética moderada + dilución de búsquedas.
- **Paranóico:** Ofuscación máxima, identidades descartables, relays activos.

### 3. Ejercer tus derechos

En LexAI, selecciona una empresa y el tipo de solicitud:
- Acceso a tus datos (GDPR Art. 15)
- Rectificación (GDPR Art. 16)
- Eliminación / Derecho al olvido (GDPR Art. 17)
- Oposición al procesamiento (GDPR Art. 21)

Kernes redacta la solicitud, la firma y la envía al DPO correspondiente.

### 4. Identidad soberana

En SovereignVault, crea tu primer DID:
- Emite credenciales verificables (edad, residencia, membresías)
- Presenta solo los atributos necesarios usando ZK-Proofs
- Define quién puede acceder a qué datos y por cuánto tiempo

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Extensión | WebExtension API (Manifest V3), React |
| Móvil | Capacitor, React |
| Backend | Hono.js, Cloudflare Workers |
| Criptografía | libsodium-wrappers, snarkjs (ZK), tfhe.js (FHE) |
| Identidad | Ceramic Network, W3C DIDs |
| Almacenamiento | IndexedDB (local), IPFS/Filecoin (descentralizado) |
| NLP | Transformers.js (ejecución local en navegador) |

---

## Roadmap

| Fase | Periodo | Entregable principal |
|------|---------|---------------------|
| **0: Cimentación** | Meses 1-3 | Whitepaper, infraestructura base, comunidad inicial |
| **1: MVP** | Meses 4-7 | Extensión + panel web con Sentinel y LexAI básico |
| **2: Ofuscación + Móvil** | Meses 8-12 | Módulo Chaff, app móvil, LexAI completo |
| **3: Soberanía criptográfica** | Meses 13-18 | DIDs, ZK-Proofs, FHE, SovereignVault |
| **4: Descentralización** | Meses 19-24 | Red comunitaria, DAO, SDK público |

Ver [Todo.md](./Todo.md) para el desglose detallado de tareas.

---

## Gobernanza y Financiación

### Código abierto

- **Licencia servidor:** AGPLv3
- **Licencia extensiones/apps:** GPLv3
- Todo el código, financiación y decisiones son transparentes y auditables.

### Modelo de sostenibilidad

| Fuente | % Objetivo |
|--------|-----------|
| Donaciones comunitarias | 40% |
| Grants de privacidad (EFF, Ethereum Foundation, NLnet) | 30% |
| Servicios premium éticos (orgs, auditorías) | 20% |
| Merchandising y hardware | 10% |

**Prohibido:** VC tradicional, tokens especulativos, venta de datos, publicidad personalizada.

### Gobernanza

- **DAO de Privacidad:** Contribuidores reciben Soulbound Tokens de gobernanza (no transferibles).
- **Consejo de Ética externo:** Académicos y activistas con poder de veto sobre funcionalidades potencialmente dañinas.

---

## Seguridad del propio sistema

Kernes aplica las mismas medidas que recomienda:

- Zero-trust architecture: los servidores edge no tienen estado ni retienen logs de IP.
- Procesamiento local-first: NLP, ZK-Proofs y FHE ocurren en tu dispositivo.
- Sin base de datos centralizada de usuarios: autenticación por DIDs o passkeys (WebAuthn).
- Builds reproducibles y firmadas criptográficamente (Ed25519).
- Auditorías de seguridad formales por terceros (Trail of Bits, OpenZeppelin).

Reporta vulnerabilidades de forma responsable: security@kernes.org (PGP key disponible).

---

## Contribuir

¡Las contribuciones son bienvenidas! Consulta nuestro [Manual del Developer](./Manual-Developer.md) para:

- Configurar el entorno de desarrollo
- Entender la arquitectura del monorepo
- Estándares de código y revisiones
- Cómo proponer nuevas funcionalidades

### Cómo empezar rápido

```bash
# Clonar el monorepo
git clone https://github.com/kernes/kernes.git
cd kernes

# Instalar dependencias
pnpm install

# Iniciar todos los servicios en desarrollo
pnpm dev

# O iniciar solo la extensión
pnpm --filter @kernes/extension dev

# O iniciar solo el panel web
pnpm --filter @kernes/web dev
```

### Canales de comunicación

- **Discusiones:** GitHub Discussions
- **Chat:** Matrix (#kernes:matrix.org)
- **Foro:** [forum.kernes.org](https://forum.kernes.org)
- **Email:** dev@kernes.org

---

## Documentación

- [Manual del Developer](./Manual-Developer.md) — Guía técnica completa
- [Todo.md](./Todo.md) — Roadmap y tareas detalladas
- [Whitepaper técnico](https://docs.kernes.org/whitepaper) *(próximamente)*
- [Documentación de APIs](https://docs.kernes.org/api) *(próximamente)*

---

## Aviso legal

Kernes es una herramienta de soberanía digital diseñada para ejercer derechos legítimos de privacidad. El uso del software es responsabilidad del usuario final. El proyecto:

- No promueve la evasión de investigaciones legítimas con orden judicial.
- No está diseñado para dañar infraestructuras críticas ni sistemas de salud legítimos.
- Incluye advertencias claras sobre el uso de funciones de ofuscación que puedan afectar servicios legítimos.

Consulta nuestro [Código de Conducta](./CODE_OF_CONDUCT.md) y [Política de Uso Aceptable](./ACCEPTABLE_USE.md).

---

## Licencia

Este proyecto está licenciado bajo:

- **Servidor y APIs:** [GNU Affero General Public License v3.0](./LICENSE-AGPL)
- **Extensiones, apps y frontend:** [GNU General Public License v3.0](./LICENSE-GPL)
- **Documentación:** [Creative Commons BY-SA 4.0](./LICENSE-CC)

---

## Reconocimientos

Kernes se inspira en y agradece al ecosistema de privacidad y software libre:

- EFF y su trabajo en Privacy Badger, Certbot y defensa digital
- Proyecto Tor y la red de anonimato
- Nym Technologies por las mixnets descentralizadas
- Protocol Labs por IPFS y Filecoin
- La comunidad de Circom/snarkjs por las pruebas de conocimiento cero
-Todos los contribuidores de código abierto que hacen posible la resistencia digital

---

<p align="center">
  <strong>Privacidad es un derecho humano. Defiéndelo.</strong>
</p>

<p align="center">
  <a href="https://kernes.org">Web</a> •
  <a href="https://docs.kernes.org">Docs</a> •
  <a href="https://matrix.to/#/#kernes:matrix.org">Matrix</a> •
  <a href="https://opencollective.com/kernes">Donar</a>
</p>
