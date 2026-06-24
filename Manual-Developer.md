# Manual del Developer — Kernes

> Guía técnica completa para contribuidores, mantenedores y auditores del proyecto.
> Versión: 1.0 | Fecha: 2026-05-23

---

## Tabla de contenidos

1. [Filosofía de desarrollo](#1-filosofía-de-desarrollo)
2. [Estructura del monorepo](#2-estructura-del-monorepo)
3. [Requisitos previos](#3-requisitos-previos)
4. [Configuración del entorno](#4-configuración-del-entorno)
5. [Arquitectura técnica detallada](#5-arquitectura-técnica-detallada)
6. [Desarrollo por módulo](#6-desarrollo-por-módulo)
7. [Estándares de código](#7-estándares-de-código)
8. [Testing](#8-testing)
9. [Seguridad y procesamiento de datos](#9-seguridad-y-procesamiento-de-datos)
10. [CI/CD y releases](#10-cicd-y-releases)
11. [Contribución](#11-contribución)
12. [Referencia de comandos](#12-referencia-de-comandos)
13. [FAQ técnico](#13-faq-técnico)

---

## 1. Filosofía de desarrollo

### Principios fundamentales

1. **Local-first:** El procesamiento de datos sensibles ocurre SIEMPRE en el dispositivo del usuario. El servidor es un mero coordinador.
2. **Zero-trust por defecto:** Asumimos que cualquier servidor puede ser comprometido. No envíes datos que no estés dispuesto a hacer públicos.
3. **Privacy by design:** Cada nueva funcionalidad debe pasar la evaluación de impacto en privacidad antes de ser aceptada.
4. **Código abierto radical:** Todo el código, la configuración de infraestructura y las decisiones de diseño son públicos y auditables.
5. **Usabilidad sin sacrificar seguridad:** Una herramienta de privacidad que nadie usa es inútil. Buscamos el equilibrio entre protección y facilidad de uso.

### Decisiones de arquitectura clave

| Decisión | Justificación |
|----------|--------------|
| React + TypeScript | Tipado seguro, ecosistema maduro, reutilización entre web/móvil/extensión |
| Hono.js en Cloudflare Workers | Edge computing, sin estado, privacidad de IP, cold-start cero |
| WebExtension Manifest V3 | Compatibilidad moderna con Chrome y Firefox |
| Capacitor (no RN puro) | 90% de código compartido, acceso a APIs nativas cuando se necesite |
| Procesamiento de NLP en cliente | Transformers.js via WebAssembly — datos nunca salen del navegador |
| IPFS para almacenamiento | Resistencia a censura, sin punto único de fallo |

---

## 2. Estructura del monorepo

```
kernes/
├── 📁 apps/                          # Aplicaciones desplegables
│   ├── extension/                    # Extensión WebExtension (Chrome/Firefox)
│   │   ├── src/
│   │   │   ├── background/           # Service worker (Manifest V3)
│   │   │   ├── content/              # Content scripts (injected en páginas)
│   │   │   ├── popup/                # UI del popup (React)
│   │   │   ├── options/              # Página de opciones (React)
│   │   │   ├── sentinel/             # Módulo de detección
│   │   │   ├── chaff/                # Módulo de ofuscación
│   │   │   └── shared/               # Utilidades compartidas
│   │   ├── manifest.json             # Manifest V3
│   │   └── package.json
│   │
│   ├── web/                          # Panel web (React + Vite)
│   │   ├── src/
│   │   │   ├── pages/                # Rutas principales
│   │   │   ├── components/           # Componentes React
│   │   │   ├── hooks/                # Custom hooks
│   │   │   ├── stores/               # Estado (Zustand)
│   │   │   └── lib/                  # Utilidades
│   │   └── package.json
│   │
│   └── mobile/                       # App móvil (Capacitor)
│       ├── android/                  # Proyecto Android nativo
│       ├── ios/                      # Proyecto iOS nativo
│       ├── src/                      # Código compartido con web
│       └── package.json
│
├── 📁 packages/                      # Paquetes reutilizables
│   ├── ui/                           # Componentes UI compartidos (shadcn/ui)
│   ├── crypto/                       # Wrapper de libsodium + utilidades cripto
│   ├── dids/                         # Implementación de DIDs (Ceramic)
│   ├── zk/                           # Circuitos Circom + snarkjs
│   ├── fhe/                          # Wrapper de tfhe.js
│   ├── sentinel-core/                # Lógica de detección (compartida)
│   ├── chaff-engine/                 # Motor de ofuscación (compartido)
│   ├── lexai-core/                   # Parser legal + generador de solicitudes
│   └── shared-types/                 # Tipos TypeScript compartidos
│
├── 📁 services/                      # Servicios backend
│   └── api-gateway/                  # Hono.js en Cloudflare Workers
│       ├── src/
│       │   ├── routes/               # Definición de endpoints
│       │   ├── middleware/           # Auth, rate limiting, CORS
│       │   └── handlers/             # Lógica de negocio
│       └── wrangler.toml
│
├── 📁 contracts/                     # Smart contracts Solidity
│   └── src/
│       ├── SovereignVault.sol        # Gestión de acceso a datos
│       └── GovernanceDAO.sol         # Gobernanza descentralizada
│
├── 📁 circuits/                      # Circuitos Circom para ZK-Proofs
│   ├── age_verifier.circom
│   ├── income_verifier.circom
│   └── residency_verifier.circom
│
├── 📁 docs/                          # Documentación
│   ├── architecture/
│   ├── api/
│   └── legal/
│
├── 📁 infrastructure/                # Configuración de infraestructura
│   ├── terraform/                    # IaC para Cloudflare
│   └── ipfs/                         # Scripts de nodo IPFS
│
├── package.json                      # Root workspace (PNPM)
├── pnpm-workspace.yaml               # Definición de workspaces
├── turbo.json                        # Configuración de Turborepo
├── tsconfig.base.json                # Configuración TypeScript base
└── README.md
```

---

## 3. Requisitos previos

### Software necesario

| Herramienta | Versión mínima | Propósito |
|-------------|---------------|-----------|
| Node.js | 20 LTS | Runtime JavaScript |
| pnpm | 9.x | Gestor de paquetes y workspaces |
| Git | 2.40+ | Control de versiones |
| Rust | 1.78+ | WebAssembly builds (ZK circuits) |
| Circom | 2.1.x | Compilación de circuitos ZK |
| Foundry | 1.0+ | Testing y deploy de smart contracts |
| Docker | 24+ | Entornos de desarrollo locales |

### Opcionales pero recomendados

| Herramienta | Propósito |
|-------------|-----------|
| wrangler CLI | Despliegue de Cloudflare Workers |
| cargo-generate | Templates de Rust/WASM |
| Ollama | Ejecución local de modelos NLP en desarrollo |

### Verificación de entorno

```bash
# Verificar versiones
node --version    # v20.x.x
pnpm --version    # 9.x.x
git --version     # 2.40+
rustc --version   # 1.78+
circom --version  # 2.1.x
forge --version   # 1.0+
```

---

## 4. Configuración del entorno

### 4.1 Clonar y bootstrap

```bash
# Clonar el repositorio
git clone git@github.com:kernes/kernes.git
cd kernes

# Instalar dependencias de TODOS los workspaces
pnpm install

# Compilar paquetes internos
pnpm build:packages

# Verificar instalación
pnpm check:env
```

### 4.2 Variables de entorno

Copia los archivos de ejemplo y rellena tus valores:

```bash
cp apps/web/.env.example apps/web/.env.local
cp services/api-gateway/.dev.vars.example services/api-gateway/.dev.vars
```

#### Archivo `.env.local` (web y extensión)

```env
# API
VITE_API_GATEWAY_URL=http://localhost:8787

# Ceramic / DIDs
VITE_CERAMIC_API_URL=https://ceramic-clay.3boxlabs.com
VITE_DID_PROVIDER_URL=http://localhost:8081

# IPFS
VITE_IPFS_GATEWAY=https://gateway.ipfs.io

# Opcional: Ollama para NLP local
VITE_OLLAMA_URL=http://localhost:11434

# Modo desarrollo
VITE_DEV_MODE=true
```

#### Archivo `.dev.vars` (API Gateway)

```env
# Cloudflare (solo producción, dejar vacío en dev)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=

# Servicios externos
HIBP_API_KEY=tu-api-key-de-haveibeenpwned

# Monitoreo (opcional)
SENTRY_DSN=
```

> **IMPORTANTE:** Nunca commitees archivos `.env` o `.dev.vars`. Están en `.gitignore` por defecto.

### 4.3 Instalación de hooks de Git

```bash
# Instalar hooks de pre-commit (lint + test rápidos)
pnpm prepare

# Verificar que funciona
git commit --allow-empty -m "test: hooks instalados"
```

### 4.4 Verificación final

```bash
# Ejecutar todos los checks
pnpm check:all

# Debería mostrar:
# ✓ TypeScript compilation
# ✓ ESLint
# ✓ Prettier formatting
# ✓ Unit tests (packages)
```

---

## 5. Arquitectura técnica detallada

### 5.1 Flujo de datos — Módulo Sentinel (Detección)

```
┌─────────────────────────────────────────────────────────────┐
│  PÁGINA WEB (ej: example.com)                               │
│  • Carga scripts de terceros (Google Analytics, Facebook)   │
│  • Headers de respuesta (Set-Cookie, X-Tracker)             │
│  • Intentos de fingerprinting (canvas, WebGL)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  CONTENT SCRIPT (Kernes)                                    │
│  • Intercepta DOM y network requests                        │
│  • Detecta scripts conocidos por hash/signature             │
│  • Bloquea/instrumenta llamadas a APIs de fingerprinting    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  BACKGROUND SERVICE WORKER                                  │
│  • Analiza headers HTTP de todas las requests               │
│  • Consulta base de datos local de trackers                 │
│  • Calcula score de privacidad                              │
│  • Almacena resultados en IndexedDB                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  POPUP / PANEL WEB                                          │
│  • Lee datos de IndexedDB                                   │
│  • Visualiza grafo de terceros                              │
│  • Muestra score y recomendaciones                          │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Flujo de datos — Módulo Chaff (Ofuscación)

```
┌──────────────────────────────────────────────────────────────┐
│  SCHEDULER (background worker)                               │
│  • Detecta inactividad del usuario (sin input por 5 min)    │
│  • Consulta perfil sintético generado para este usuario      │
│  • Decide: ¿navegar? ¿buscar? ¿ambos?                       │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│  MOTOR DE OFUSCACIÓN                                         │
│  • Genera lista de URLs a visitar (basado en perfil falso)   │
│  • Abre tabs invisibles (discarded/stateless)                │
│  • Navega automáticamente con delays humanos                 │
│  • Cierra tabs tras tiempo aleatorio                         │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│  DILUCIÓN DE BÚSQUEDA                                        │
│  • Genera queries coherentes con perfil sintético            │
│  • Inyecta en motor de búsqueda vía API o navegación        │
│  • Alterna entre motores (Google, Bing, Brave)               │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Flujo de datos — ZK-Proofs (SovereignVault)

```
┌──────────────────────────────────────────────────────────────┐
│  USUARIO quiere probar: "Soy mayor de 18 años"              │
│  sin revelar su fecha de birth exacta                       │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│  CIRCUITO age_verifier.circom                                │
│  • Input privado: fecha de nacimiento                        │
│  • Input público: fecha límite, timestamp actual             │
│  • Output: proof (booleano) + public signals                 │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│  snarkjs (en navegador, WebAssembly)                         │
│  • Genera proof localmente                                   │
│  • Usa proving key descargada de IPFS                        │
│  • Genera witness + proof + public signals                   │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│  VERIFICADOR (sito web o smart contract)                     │
│  • Recibe proof + public signals                             │
│  • Verifica con verification key                             │
│  • Confirma: "mayor de 18" SIN ver fecha de nacimiento      │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Diagrama de componentes — API Gateway

```
                    ┌─────────────────┐
                    │  Cloudflare CDN  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  API Gateway     │
                    │  (Hono.js)       │
                    │                  │
  ┌─────────────────┼──────────────────┼─────────────────┐
  │                 │                  │                 │
┌─▼────┐     ┌──────▼──────┐    ┌─────▼─────┐     ┌────▼────┐
│ Auth │     │ Sentinel    │    │ LexAI     │     │ Ceramic │
│ MID  │     │ Endpoints   │    │ Endpoints │     │ Proxy   │
│      │     │             │    │           │     │         │
│ DIDs │     │ - /scan     │    │ - /parse  │     │ - /did  │
│ JWT  │     │ - /trackers │    │ - /draft  │     │ - /vc   │
│ Rate │     │ - /score    │    │ - /send   │     │         │
│Limit │     └─────────────┘    └───────────┘     └─────────┘
└──────┘
```

---

## 6. Desarrollo por módulo

### 6.1 Extensión de navegador (`apps/extension`)

#### Estructura interna

```
extension/src/
├── background/
│   ├── index.ts              # Punto de entrada del service worker
│   ├── network-analyzer.ts   # Análisis de headers y requests
│   ├── tracker-db.ts         # Base de datos local de trackers
│   └── scheduler.ts          # Programador de tareas de ofuscación
├── content/
│   ├── index.ts              # Inyección en páginas web
│   ├── fingerprint-detector.ts  # Detección de fingerprinting
│   └── dom-instrument.ts     # Instrumentación del DOM
├── popup/
│   ├── App.tsx               # Componente raíz del popup
│   ├── components/
│   └── hooks/
├── sentinel/
│   ├── scanner.ts            # Lógica de escaneo
│   └── reporter.ts           # Generación de informes
├── chaff/
│   ├── profile-generator.ts  # Generador de perfiles sintéticos
│   ├── navigator.ts          # Navegación automática
│   └── search-diluter.ts     # Dilución de búsquedas
└── shared/
    ├── storage.ts            # Wrapper de IndexedDB
    ├── crypto.ts             # Utilidades criptográficas
    └── messaging.ts          # Comunicación background/content/popup
```

#### Comandos de desarrollo

```bash
# Modo desarrollo con hot-reload (popup en localhost:3000)
pnpm --filter @kernes/extension dev

# Build de producción (genera .zip para Chrome Web Store)
pnpm --filter @kernes/extension build

# Ejecutar tests de la extensión
pnpm --filter @kernes/extension test

# Lint y formato
pnpm --filter @kernes/extension lint
pnpm --filter @kernes/extension format
```

#### Cargar en modo desarrollador

**Chrome:**
1. Abre `chrome://extensions/`
2. Activa "Modo desarrollador"
3. "Cargar descomprimida" → selecciona `apps/extension/dist/`

**Firefox:**
1. Abre `about:debugging`
2. "Este Firefox" → "Cargar complemento temporal"
3. Selecciona `apps/extension/dist/manifest.json`

#### Content Scripts — Puntos clave

Los content scripts se inyectan en todas las páginas web (con restricciones). Patrones importantes:

```typescript
// content/index.ts
import { FingerprintDetector } from './fingerprint-detector';
import { DOMInstrument } from './dom-instrument';

// Solo ejecutar en frames principales (no ifraves de anuncios)
if (window.self === window.top) {
  const detector = new FingerprintDetector();
  detector.startMonitoring();

  const instrument = new DOMInstrument();
  instrument.instrumentAPIs();
}
```

**Restricciones de seguridad:**
- Los content scripts no pueden acceder a variables JS de la página directamente
- Usar `window.postMessage` para comunicación con scripts inyectados
- Aislar el DOM del content script con Shadow DOM cuando sea posible

### 6.2 Panel Web (`apps/web`)

#### Estructura

```
web/src/
├── pages/
│   ├── Dashboard.tsx         # Panel principal con score de privacidad
│   ├── SentinelPage.tsx      # Vista detallada de detección
│   ├── ChaffPage.tsx         # Configuración de ofuscación
│   ├── SovereignVault.tsx    # Gestión de DIDs y credenciales
│   ├── LexAI.tsx             # Asistencia legal
│   └── Settings.tsx          # Configuración general
├── components/
│   ├── PrivacyScore.tsx      # Componente de puntuación visual
│   ├── ThirdPartyGraph.tsx   # Grafo D3.js de terceros
│   ├── ZKProofGenerator.tsx  # UI para generar ZK-Proofs
│   └── layout/
├── hooks/
│   ├── useSentinel.ts        # Hook para datos de Sentinel
│   ├── useChaff.ts           # Hook para control de ofuscación
│   ├── useDID.ts             # Hook para gestión de DIDs
│   └── useLexAI.ts           # Hook para asistencia legal
├── stores/
│   └── useAppStore.ts        # Estado global (Zustand)
└── lib/
    ├── api.ts                # Cliente HTTP para API Gateway
    ├── crypto.ts             # Operaciones criptográficas
    └── did-resolver.ts       # Resolución de DIDs
```

#### Comandos

```bash
# Desarrollo local (Vite dev server)
pnpm --filter @kernes/web dev

# Build de producción
pnpm --filter @kernes/web build

# Preview del build
pnpm --filter @kernes/web preview

# Tests
pnpm --filter @kernes/web test
```

#### Integración con la extensión

El panel web y la extensión comparten estado a través de:
1. **IndexedDB** (misma base de datos, acceso compartido)
2. **Mensajes** (`chrome.runtime.sendMessage` / `browser.runtime.sendMessage`)

```typescript
// Ejemplo: Leer datos de Sentinel desde el panel web
import { useSentinel } from '@/hooks/useSentinel';

function Dashboard() {
  const { scanResults, isScanning, startScan } = useSentinel();

  return (
    <div>
      <PrivacyScore score={scanResults.overallScore} />
      <button onClick={startScan} disabled={isScanning}>
        {isScanning ? 'Escaneando...' : 'Escanear ahora'}
      </button>
    </div>
  );
}
```

### 6.3 API Gateway (`services/api-gateway`)

#### Endpoints principales

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| POST | `/auth/challenge` | Obtener challenge para auth DID | No |
| POST | `/auth/verify` | Verificar firma y obtener JWT | No |
| GET | `/trackers` | Lista de trackers conocidos | No |
| POST | `/sentinel/scan` | Iniciar escaneo remoto (solo para verificación adicional) | JWT |
| POST | `/lexai/parse` | Analizar política de privacidad (fallback si NLP local falla) | JWT |
| POST | `/lexai/draft` | Generar borrador de solicitud legal | JWT |
| GET | `/ceramic/*` | Proxy a Ceramic Network | JWT |

#### Desarrollo local

```bash
# Instalar wrangler globalmente si no lo tienes
pnpm add -g wrangler

# Autenticar con Cloudflare (solo necesario para deploy)
wrangler login

# Servidor de desarrollo local (simula Workers)
pnpm --filter @kernes/api-gateway dev

# El servidor estará en http://localhost:8787
```

#### Deploy a producción

```bash
# Deploy a Cloudflare Workers
pnpm --filter @kernes/api-gateway deploy

# El deploy usa wrangler.toml para configuración
```

### 6.4 Smart Contracts (`contracts/`)

#### Estructura

```
contracts/
├── src/
│   ├── SovereignVault.sol      # Gestión de acceso a datos
│   ├── GovernanceDAO.sol       # Gobernanza descentralizada
│   └── libraries/
│       └── ZKVerifier.sol      # Verificación on-chain de ZK proofs
├── test/
│   ├── SovereignVault.t.sol
│   └── GovernanceDAO.t.sol
├── script/
│   ├── Deploy.s.sol
│   └── Verify.s.sol
└── foundry.toml
```

#### Comandos

```bash
# Compilar contratos
pnpm --filter @kernes/contracts build

# Ejecutar tests (Foundry)
pnpm --filter @kernes/contracts test

# Deploy a testnet (Mumbai/Polygon)
pnpm --filter @kernes/contracts deploy:testnet

# Verificar en Polygonscan
pnpm --filter @kernes/contracts verify
```

### 6.5 Circuitos ZK (`circuits/`)

#### Compilación y setup

```bash
# Compilar circuito
pnpm --filter @kernes/zk compile:age

# Generar trusted setup (ceremony)
pnpm --filter @kernes/zk setup:age

# Generar proving/verification keys
pnpm --filter @kernes/zk keys:age

# Ejecutar tests del circuito
pnpm --filter @kernes/zk test
```

---

## 7. Estándares de código

### 7.1 TypeScript

Configuración base en `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 7.2 Estilo de código (ESLint + Prettier)

Configuración compartida en `packages/eslint-config/` y `packages/prettier-config/`.

#### Reglas clave

- **Indentación:** 2 espacios (no tabs)
- **Comillas:** simples para strings, dobles para JSX
- **Punto y coma:** siempre
- **Longitud máxima de línea:** 100 caracteres
- **Imports:** ordenados (externos → internos → relativos)

#### Ejemplo

```typescript
// ✅ Correcto
import { useEffect, useState } from 'react';

import { Button } from '@kernes/ui';
import { useSentinel } from '@/hooks/useSentinel';
import { formatScore } from '@/lib/utils';

interface DashboardProps {
  userId: string;
}

export function Dashboard({ userId }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { scan, results } = useSentinel(userId);

  useEffect(() => {
    setIsLoading(true);
    scan().finally(() => setIsLoading(false));
  }, [scan]);

  return (
    <div className="p-4">
      <h1>Privacidad: {formatScore(results.score)}</h1>
      <Button onClick={scan} disabled={isLoading}>
        Escanear
      </Button>
    </div>
  );
}

// ❌ Incorrecto
function Dashboard(props) {
  var loading = false;
  const { scan, results } = useSentinel(props.userId);

  return (
    <div>
      <h1>Score: {results.score}</h1>
      <button onClick={scan}>Scan</button>
    </div>
  );
}
```

### 7.3 Commits (Conventional Commits)

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[pie opcional]
```

#### Tipos permitidos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Cambios de formato (espacios, comas) |
| `refactor` | Refactorización de código |
| `perf` | Mejora de rendimiento |
| `test` | Añadir o corregir tests |
| `chore` | Tareas de mantenimiento |
| `security` | Fix de seguridad |
| `privacy` | Mejora relacionada con privacidad |

#### Alcances comunes

`sentinel`, `chaff`, `lexai`, `sovereign`, `crypto`, `ui`, `extension`, `web`, `mobile`, `api`, `contracts`

#### Ejemplos

```
feat(sentinel): añadir detector de canvas fingerprinting

fix(chaff): corregir leak de memoria en scheduler de navegación

security(crypto): rotar clave de firma de releases (CVE-2026-XXXX)

privacy(lexai): ejecutar parser de políticas localmente en vez de API
```

---

## 8. Testing

### 8.1 Estrategia de testing

| Tipo | Herramienta | Cobertura objetivo |
|------|-------------|-------------------|
| Unit tests | Vitest | 80%+ de lógica de negocio |
| Integration tests | Vitest + MSW | Flujos entre componentes |
| E2E (web) | Playwright | Caminos críticos de usuario |
| E2E (extensión) | Puppeteer + extensión cargada | Flujos de extensión |
| Smart contracts | Foundry | 100% de branches |
| Circuitos ZK | Circom tester | Todos los circuitos |

### 8.2 Ejecutar tests

```bash
# Todos los tests
pnpm test

# Tests de un paquete específico
pnpm --filter @kernes/sentinel-core test

# Tests con coverage
pnpm test:coverage

# Tests E2E (requiere build previo)
pnpm build
pnpm test:e2e

# Tests de contratos
pnpm --filter @kernes/contracts test

# Tests de circuitos ZK
pnpm --filter @kernes/zk test
```

### 8.3 Mock de APIs externas

Usamos MSW (Mock Service Worker) para tests:

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.pwnedpasswords.com/range/*', () => {
    return HttpResponse.text('1E4C9B93F3F0682250B6CF8331B7EE68FD8:5\n');
  }),

  http.get('https://haveibeenpwned.com/api/v3/breachedaccount/*', () => {
    return HttpResponse.json([
      { Name: 'Adobe', BreachDate: '2013-10-04' },
    ]);
  }),
];
```

---

## 9. Seguridad y procesamiento de datos

### 9.1 Principios de procesamiento de datos

**Regla de oro:** Kernes nunca procesa datos personales en servidores centralizados.

| Dato | Dónde se procesa | Cómo se almacena |
|------|-----------------|-----------------|
| Historial de navegación | Extensión (local) | IndexedDB cifrada (clave local) |
| Resultados de escaneo | Extensión (local) | IndexedDB cifrada |
| Credenciales DID | Navegador/móvil | localStorage/Keychain (clave del SO) |
| ZK-Proofs | Navegador (WASM) | No se almacenan (generación on-demand) |
| Solicitudes legales | Navegador (local) | IndexedDB cifrada |
| Políticas de privacidad parseadas | Navegador (Transformers.js) | Solo resultado del análisis |

### 9.2 Checklist de seguridad para nuevas funcionalidades

Antes de mergear cualquier PR, verificar:

- [ ] ¿Se procesan datos personales en el servidor? Si es sí → RECHAZAR
- [ ] ¿Se envían datos a terceros sin consentimiento explícito?
- [ ] ¿Los datos locales están cifrados con clave del usuario?
- [ ] ¿Se generan logs que puedan contener PII?
- [ ] ¿La funcionalidad tiene tests de seguridad?
- [ ] ¿Se actualizó la documentación de privacidad?

### 9.3 Reporte de vulnerabilidades

Si descubres una vulnerabilidad de seguridad:

1. **NO abras un issue público**
2. Envía un email a: `security@kernes.org`
3. Incluye:
   - Descripción detallada
   - Pasos para reproducir
   - Impacto estimado
   - Posible mitigación (si la conoces)
4. Usa nuestra clave PGP para cifrar el email (disponible en `/security/pgp-key.asc`)
5. Respuesta esperada en 48 horas

---

## 10. CI/CD y releases

### 10.1 Pipeline de CI (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm format:check

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [sentinel-core, chaff-engine, lexai-core, crypto, dids]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm --filter @kernes/${{ matrix.package }} test

  e2e:
    runs-on: ubuntu-latest
    needs: [lint-and-format, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test:e2e

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm audit --audit-level moderate
      - run: pnpm install -g better-npm-audit
      - run: better-npm-audit audit
```

### 10.2 Releases

Los releases siguen [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

MAJOR: Cambios incompatibles en API o protocolos
MINOR: Nuevas funcionalidades, compatibles hacia atrás
PATCH: Fixes de bugs y mejoras de seguridad
```

#### Proceso de release

```bash
# 1. Asegurar que main está limpio
git checkout main
git pull origin main

# 2. Ejecutar checks finales
pnpm check:all

# 3. Crear tag de release
pnpm version minor  # o major / patch

# 4. El CI automáticamente:
#    - Construye todos los paquetes
#    - Firma los artefactos con Ed25519
#    - Sube la extensión a Chrome Web Store y Firefox Add-ons
#    - Despliega el panel web
#    - Publica el release en GitHub con changelog
```

#### Firma de releases

Todos los artefactos de release están firmados criptográficamente:

```bash
# Verificar firma de un artefacto
minisign -Vm kernes-extension-v1.2.3.zip -p kernes-release.pub

# La clave pública está disponible en:
# - El repositorio: /security/release-key.pub
# - El sitio web: https://kernes.org/security/release-key.pub
# - Múltiples keyservers: keys.openpgp.org, keyserver.ubuntu.com
```

---

## 11. Contribución

### 11.1 Cómo contribuir

1. **Lee el código de conducta:** `./CODE_OF_CONDUCT.md`
2. **Busca issues existentes** o abre uno nuevo para discutir tu contribución
3. **Fork y branch:** Crea una rama desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/tu-funcionalidad
   ```
4. **Desarrolla:** Sigue los estándares de código y añade tests
5. **Commit:** Usa [Conventional Commits](#73-commits-conventional-commits)
6. **Push y PR:** Abre un Pull Request a `develop` con:
   - Descripción clara del cambio
   - Referencia a issues relacionados
   - Screenshots si hay cambios visuales
   - Checklist de seguridad completado

### 11.2 Requisitos de PR

- [ ] Tests añadidos o actualizados
- [ ] Documentación actualizada
- [ ] `pnpm check:all` pasa sin errores
- [ ] Evaluación de impacto en privacidad completada
- [ ] Al menos 1 revisión de código aprobada
- [ ] Para cambios criptográficos: revisión de 2 mantenedores de seguridad

### 11.3 Áreas donde necesitamos ayuda

| Área | Nivel | Descripción |
|------|-------|-------------|
| Criptografía (ZK/FHE) | Avanzado | Optimización de circuitos, WASM |
| NLP local | Avanzado | Fine-tuning de modelos para análisis legal |
| Extensiones de navegador | Intermedio | Manifest V3, content scripts |
| UI/UX | Intermedio | Componentes accesibles, diseño inclusivo |
| Documentación | Todos | Traducciones, tutoriales, guías |
| Testing | Todos | Tests unitarios, E2E, seguridad |
| Traducciones | Todos | I18n de interfaz y documentación |

---

## 12. Referencia de comandos

### Comandos globales (desde raíz)

```bash
# Instalación y build
pnpm install              # Instalar todas las dependencias
pnpm build               # Build de TODOS los paquetes
pnpm build:packages      # Build solo de packages/ (no apps)
pnpm dev                 # Modo desarrollo de todas las apps

# Testing
pnpm test                # Ejecutar TODOS los tests
pnpm test:coverage       # Tests con reporte de cobertura
pnpm test:e2e            # Tests end-to-end (requiere build previo)
pnpm test:contracts      # Tests de smart contracts

# Calidad de código
pnpm lint                # ESLint en todo el monorepo
pnpm lint:fix            # ESLint con auto-fix
pnpm format              # Prettier en todo el monorepo
pnpm format:check        # Verificar formato sin modificar
pnpm check:all           # Lint + Format + Test + TypeScript

# Utilidades
pnpm clean               # Limpiar builds y cachés
pnpm typecheck           # TypeScript check en todo el monorepo
pnpm changeset           # Crear un changeset para release
```

### Comandos por workspace

```bash
# Sintaxis: pnpm --filter <workspace> <comando>

# Extensión
pnpm --filter @kernes/extension dev
pnpm --filter @kernes/extension build
pnpm --filter @kernes/extension test
pnpm --filter @kernes/extension lint

# Panel web
pnpm --filter @kernes/web dev
pnpm --filter @kernes/web build
pnpm --filter @kernes/web preview

# API Gateway
pnpm --filter @kernes/api-gateway dev      # Wrangler local
pnpm --filter @kernes/api-gateway deploy   # Deploy a Cloudflare

# Smart contracts
pnpm --filter @kernes/contracts build
pnpm --filter @kernes/contracts test
pnpm --filter @kernes/contracts deploy:testnet
pnpm --filter @kernes/contracts verify

# Circuitos ZK
pnpm --filter @kernes/zk compile:age
pnpm --filter @kernes/zk setup:age
pnpm --filter @kernes/zk test
```

### Comandos de utilidad

```bash
# Generar componente UI con shadcn
pnpm ui:add button dialog dropdown-menu

# Actualizar dependencias
pnpm update -r            # Todas las deps
pnpm update -r --latest   # A última versión

# Auditar seguridad
pnpm audit
pnpm audit --fix

# Ver árbol de dependencias
pnpm why <paquete>
```

---

## 13. FAQ técnico

### General

**P: ¿Por qué PNPM en vez de npm o yarn?**
R: PNPM tiene mejor manejo de monorepos (workspaces nativo), ahorro de disco (hard links) y es más rápido. Su lockfile también es más determinista.

**P: ¿Por qué Turborepo?**
R: Cache inteligente de builds. Si no cambias un paquete, no se recompila. En CI acelera los builds 3-5x.

**P: ¿Puedo usar npm o yarn en mi fork?**
R: Técnicamente sí, pero no damos soporte. La configuración de CI y scripts asume PNPM.

### Extensión

**P: ¿Por qué Manifest V3 y no V2?**
R: Chrome ya no acepta extensiones V2 en la Chrome Web Store. Aunque V3 tiene limitaciones (service workers en vez de background pages), es el estándar actual.

**P: ¿La extensión funciona en Safari?**
R: Safari requiere conversiones adicionales (WebExtension API parcialmente soportada). Es un objetivo para Fase 3.

**P: ¿Cómo debuggeo el service worker?**
R: En Chrome: `chrome://extensions/` → "Fondo de página" en la tarjeta de Kernes → DevTools. El service worker se duerme tras 30s de inactividad; usa `chrome.runtime.connect()` para mantenerlo vivo durante debug.

### Criptografía

**P: ¿Por qué libsodium y no Web Crypto API nativa?**
R: libsodium proporciona una API más segura por diseño (evita errores comunes como nonces repetidos) y tiene mejor soporte para ed25519, x25519 y secretbox.

**P: ¿Los ZK-Proofs son lentos en móvil?**
R: Sí, la generación de proofs puede tardar 5-30 segundos en móvil dependiendo del circuito. Por eso son operaciones puntuales, no continuas. Estamos optimizando con WASM SIMD.

**P: ¿Qué pasa si pierdo mi DID?**
R: Los DIDs se derivan de una seedphrase (BIP39). Al configurar Kernes por primera vez se te muestra una frase de recuperación de 12 palabras. Guárdala offline.

### Legal/Etica

**P: ¿Es legal usar Kernes?**
R: El software en sí es legal en la mayoría de jurisdicciones. Las funciones de ofuscación podrían violar Términos de Servicio de algunas plataformas. Kernes muestra advertencias claras y permite whitelistear sitios.

**P: ¿Puede usarse para actividades ilegales?**
R: Cualquier herramienta de privacidad puede usarse con fines buenos y malos. Kernes incluye un Código de Uso Aceptable y la ofuscación no está diseñada para evadir investigaciones legítimas con orden judicial.

**P: ¿Cómo reporto un uso indebido del código?**
R: Envía un email a ethics@kernes.org. El Consejo de Ética revisará el caso.

### Contribución

**P: ¿Necesito firmar un CLA (Contributor License Agreement)?**
R: No. Al contribuir aceptas que tu código se licencie bajo las mismas licencias del proyecto (AGPLv3/GPLv3). No requerimos asignación de copyright.

**P: ¿Puedo contribuir anónimamente?**
R: Sí. Aceptamos contribuciones vía patches por email o pull requests desde cuentas anónimas. Los commits deben estar firmados con PGP.

**P: ¿Hay recompensas por encontrar bugs?**
R: Sí. Tenemos un programa de bug bounty (ver /security/BUG-BOUNTY.md). Los pagos se hacen en XMR o BTC para preservar la privacidad del investigador.

---

## Recursos adicionales

- [Whitepaper técnico](https://docs.kernes.org/whitepaper)
- [Documentación de APIs](https://docs.kernes.org/api)
- [Guía de contribución](https://github.com/kernes/kernes/blob/main/CONTRIBUTING.md)
- [Código de conducta](https://github.com/kernes/kernes/blob/main/CODE_OF_CONDUCT.md)
- [Política de seguridad](https://github.com/kernes/kernes/blob/main/SECURITY.md)
- [Bug Bounty](https://github.com/kernes/kernes/blob/main/security/BUG-BOUNTY.md)

---

## Contacto del equipo de desarrollo

- **Email técnico:** dev@kernes.org
- **Chat:** Matrix (#kernes-dev:matrix.org)
- **Foro:** [forum.kernes.org/c/dev](https://forum.kernes.org/c/dev)

---

*Este manual se actualiza con cada release. Última actualización: 2026-05-23*
*Licencia: CC BY-SA 4.0*
