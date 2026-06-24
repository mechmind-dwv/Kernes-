# Manual: Crear Proyecto Kernes en Termux (Android) y Subir a GitHub

> Guia paso a paso para crear la carpeta raiz del proyecto, todos los archivos
> iniciales, configurar Git y subir el repositorio a GitHub — todo desde tu
> telefono Android usando Termux.
>
> Tiempo estimado: 30-45 minutos

---

## Tabla de contenidos

1. [Instalar Termux y dependencias](#1-instalar-termux-y-dependencias)
2. [Crear carpeta raiz del proyecto](#2-crear-carpeta-raiz-del-proyecto)
3. [Crear todos los archivos iniciales](#3-crear-todos-los-archivos-iniciales)
4. [Inicializar Git](#4-inicializar-git)
5. [Crear repositorio en GitHub](#5-crear-repositorio-en-github)
6. [Subir archivos a GitHub](#6-subir-archivos-a-github)
7. [Verificar y proximos pasos](#7-verificar-y-proximos-pasos)

---

## 1. Instalar Termux y dependencias

### 1.1 Instalar Termux

Desde tu telefono Android:

1. Abre **F-Droid** (recomendado) o Google Play Store
2. Busca **Termux** (com.termux)
3. Instala la aplicacion
4. Abre Termux

> **Nota:** La version de F-Droid es mas actualizada y estable.
> Descarga F-Droid desde: https://f-droid.org

### 1.2 Actualizar paquetes de Termux

Al abrir Termux por primera vez, ejecuta:

```bash
pkg update && pkg upgrade -y
```

Esto actualiza la lista de paquetes y los instala. Puede tardar varios minutos.

### 1.3 Instalar paquetes necesarios

```bash
# Instalar Git, Node.js, Vim/Nano y curl
pkg install -y git nodejs vim nano curl openssh gh
```

| Paquete | Para que sirve |
|---------|---------------|
| `git` | Control de versiones |
| `nodejs` | Runtime JavaScript (para futuro desarrollo) |
| `vim` | Editor de texto avanzado |
| `nano` | Editor de texto simple (mas facil para principiantes) |
| `curl` | Descargar archivos de internet |
| `openssh` | Conexion SSH segura con GitHub |
| `gh` | CLI oficial de GitHub (crear repos, PRs, etc.) |

### 1.4 Verificar instalacion

```bash
git --version
node --version
gh --version
```

Deberias ver las versiones instaladas. Si falta alguna, repite el paso 1.3.

---

## 2. Crear carpeta raiz del proyecto

### 2.1 Crear estructura de directorios

```bash
# Crear carpeta principal del proyecto
mkdir -p ~/kernes

# Entrar a la carpeta
cd ~/kernes

# Crear subcarpetas del monorepo (estructura profesional)
mkdir -p apps/{extension,web,mobile}
mkdir -p packages/{ui,crypto,dids,zk,fhe,sentinel-core,chaff-engine,lexai-core,shared-types}
mkdir -p services/api-gateway
mkdir -p contracts/src
mkdir -p circuits
mkdir -p docs/{architecture,api,legal}
mkdir -p infrastructure/{terraform,ipfs}
mkdir -p security
```

### 2.2 Verificar estructura

```bash
# Ver la estructura de carpetas
tree ~/kernes
```

Deberias ver algo asi:

```
/data/data/com.termux/files/home/kernes/
├── apps/
│   ├── extension/
│   ├── mobile/
│   └── web/
├── circuits/
├── contracts/
│   └── src/
├── docs/
│   ├── api/
│   ├── architecture/
│   └── legal/
├── infrastructure/
│   ├── ipfs/
│   └── terraform/
├── packages/
│   ├── chaff-engine/
│   ├── crypto/
│   ├── dids/
│   ├── fhe/
│   ├── lexai-core/
│   ├── sentinel-core/
│   ├── shared-types/
│   ├── ui/
│   └── zk/
├── security/
└── services/
    └── api-gateway/
```

---

## 3. Crear todos los archivos iniciales

Vamos a crear todos los archivos base del proyecto. Puedes usar `nano` o `vim`.
Para principiantes, recomiendo `nano`.

### 3.1 README.md

```bash
nano ~/kernes/README.md
```

Pega el contenido completo del archivo README.md que tienes. Para pegar en Termux:
- Manten presionado en la pantalla → "Paste"

Guardar en nano:
- `Ctrl + O` (guardar)
- `Enter` (confirmar)
- `Ctrl + X` (salir)

### 3.2 Todo.md

```bash
nano ~/kernes/Todo.md
```

Pega el contenido del archivo Todo.md.

### 3.3 Manual-Developer.md

```bash
nano ~/kernes/Manual-Developer.md
```

Pega el contenido del Manual del Developer.

### 3.4 LICENSE

```bash
nano ~/kernes/LICENSE
```

Pega el contenido del archivo LICENSE.

### 3.5 .env.example

```bash
nano ~/kernes/.env.example
```

Pega el contenido del archivo .env.example.

### 3.6 .env.local

```bash
nano ~/kernes/.env.local
```

Contenido:

```env
# Kernes - Variables de Entorno Local
# NO subir a GitHub - esta en .gitignore

VITE_API_GATEWAY_URL=http://localhost:8787
VITE_CERAMIC_API_URL=https://ceramic-clay.3boxlabs.com
VITE_DID_PROVIDER_URL=http://localhost:8081
VITE_IPFS_GATEWAY=https://gateway.ipfs.io
VITE_OLLAMA_URL=http://localhost:11434
VITE_DEV_MODE=true
VITE_CHAFF_DISABLED=false
VITE_ENABLE_SENTINEL=true
VITE_ENABLE_CHAFF=true
VITE_ENABLE_LEXAI=true
VITE_ENABLE_SOVEREIGN_VAULT=false
VITE_ENABLE_ZK_PROOFS=false
```

### 3.7 .dev.vars.example

```bash
nano ~/kernes/.dev.vars.example
```

Pega el contenido del archivo .dev.vars.example.

### 3.8 .gitignore

```bash
nano ~/kernes/.gitignore
```

Contenido:

```gitignore
# ============================================================================
# KERNES - .gitignore
# ============================================================================

# ---------------------------------------------------------------------------
# Dependencias
# ---------------------------------------------------------------------------
node_modules/
.pnpm-store/
.yarn/
package-lock.json
yarn.lock

# ---------------------------------------------------------------------------
# Builds y outputs
# ---------------------------------------------------------------------------
dist/
build/
out/
.next/
*.tsbuildinfo
.turbo/

# ---------------------------------------------------------------------------
# Variables de entorno (NUNCA subir)
# ---------------------------------------------------------------------------
.env
.env.local
.env.*.local
.dev.vars
*.pem
*.key

# ---------------------------------------------------------------------------
# Logs
# ---------------------------------------------------------------------------
*.log
logs/
.npm-debug.log*
.pnpm-debug.log*

# ---------------------------------------------------------------------------
# Sistema operativo
# ---------------------------------------------------------------------------
.DS_Store
Thumbs.db
*.swp
*.swo
*~

# ---------------------------------------------------------------------------
# IDEs y editores
# ---------------------------------------------------------------------------
.vscode/
.idea/
*.sublime-*

# ---------------------------------------------------------------------------
# Testing
# ---------------------------------------------------------------------------
coverage/
.nyc_output/

# ---------------------------------------------------------------------------
# Extensiones de navegador
# ---------------------------------------------------------------------------
*.zip
*.crx
*.xpi
web-ext-artifacts/

# ---------------------------------------------------------------------------
# Smart contracts
# ---------------------------------------------------------------------------
cache/
out/
broadcast/

# ---------------------------------------------------------------------------
# ZK Circuits
# ---------------------------------------------------------------------------
*.ptau
*.zkey
*.r1cs
*.wasm
witness.wtns
proof.json
public.json

# ---------------------------------------------------------------------------
# Mobile / Capacitor
# ---------------------------------------------------------------------------
android/app/build/
ios/App/build/
```

### 3.9 package.json (raiz)

```bash
nano ~/kernes/package.json
```

Contenido:

```json
{
  "name": "kernes",
  "version": "0.1.0",
  "private": true,
  "description": "Infraestructura de codigo abierto para la contravigilancia digital y soberania de datos",
  "author": "Kernes Contributors",
  "license": "SEE LICENSE IN LICENSE",
  "homepage": "https://github.com/tu-usuario/kernes#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tu-usuario/kernes.git"
  },
  "bugs": {
    "url": "https://github.com/tu-usuario/kernes/issues"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "turbo run build",
    "build:packages": "turbo run build --filter=./packages/*",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "check:all": "pnpm lint && pnpm format:check && pnpm typecheck && pnpm test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules .turbo",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "husky": "^9.0.0",
    "prettier": "^3.2.0",
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ]
}
```

> **IMPORTANTE:** Reemplaza `tu-usuario` con tu nombre de usuario de GitHub.

### 3.10 pnpm-workspace.yaml

```bash
nano ~/kernes/pnpm-workspace.yaml
```

Contenido:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "services/*"
```

### 3.11 turbo.json

```bash
nano ~/kernes/turbo.json
```

Contenido:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "lint:fix": {},
    "typecheck": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 3.12 tsconfig.base.json

```bash
nano ~/kernes/tsconfig.base.json
```

Contenido:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
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
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

### 3.13 CODE_OF_CONDUCT.md

```bash
nano ~/kernes/CODE_OF_CONDUCT.md
```

Contenido:

```markdown
# Codigo de Conducta

## Nuestro compromiso

Nos comprometemos a hacer de la participacion en nuestro proyecto una
experiencia libre de acoso para todos, independientemente de la edad,
tamano corporal, discapacidad visible o invisible, etnicidad,
caracteristicas sexuales, identidad y expresion de genero, nivel de
experiencia, educacion, nivel socioeconomico, nacionalidad, apariencia
personal, raza, religion, o identidad y orientacion sexual.

## Nuestros estandares

Ejemplos de comportamiento que contribuyen a crear un ambiente positivo:

* Usar lenguaje acogedor e inclusivo
* Respetar diferentes puntos de vista y experiencias
* Aceptar criticas constructivas con gracia
* Centrarse en lo que es mejor para la comunidad
* Mostrar empatia hacia otros miembros de la comunidad

Ejemplos de comportamiento inaceptable:

* Uso de lenguaje o imagenes sexualizadas
* Trolling, comentarios insultantes/despectivos, ataques personales o politicos
* Acoso publico o privado
* Publicar informacion privada de otros sin permiso explicito
* Conducta que razonablemente podria considerarse inapropiada

## Aplicacion

Los casos de comportamiento abusivo, acosador o inaceptable pueden ser
reportados contactando al equipo del proyecto en conduct@kernes.org.
Todas las quejas seran revisadas e investigadas de manera justa.

## Atribucion

Este Codigo de Conducta esta adaptado del Contributor Covenant,
version 2.1, disponible en https://www.contributor-covenant.org
```

### 3.14 CONTRIBUTING.md

```bash
nano ~/kernes/CONTRIBUTING.md
```

Contenido:

```markdown
# Como Contribuir a Kernes

Gracias por tu interes en contribuir a Kernes. Este documento te guia
a traves del proceso.

## Requisitos previos

- Node.js 20+
- pnpm 9+
- Git

## Pasos para contribuir

1. **Fork el repositorio** en GitHub
2. **Clona tu fork** localmente
3. **Crea una rama** desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/tu-funcionalidad
   ```
4. **Haz tus cambios** siguiendo los estandares del proyecto
5. **Commit** usando Conventional Commits:
   ```
   feat(sentinel): anadir detector de canvas fingerprinting
   ```
6. **Push** a tu fork:
   ```bash
   git push origin feat/tu-funcionalidad
   ```
7. **Abre un Pull Request** a la rama `develop`

## Estilo de codigo

- TypeScript strict mode
- 2 espacios de indentacion
- Comillas simples para strings, dobles para JSX
- Punto y coma obligatorio
- Maximo 100 caracteres por linea

## Tests

Asegurate de que tus cambios pasen todos los tests:
```bash
pnpm test
```

## Reportar bugs

Usa GitHub Issues con el template de bug report.

## Preguntas

Unete a nuestro chat en Matrix: #kernes:matrix.org
```

### 3.15 SECURITY.md

```bash
nano ~/kernes/SECURITY.md
```

Contenido:

```markdown
# Politica de Seguridad

## Versiones soportadas

| Version | Soportada          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reportar vulnerabilidades

Si descubres una vulnerabilidad de seguridad en Kernes:

1. **NO abras un issue publico**
2. Envianos un email a: security@kernes.org
3. Cifra tu mensaje usando nuestra clave PGP (disponible en /security/pgp-key.asc)
4. Incluye:
   - Descripcion detallada de la vulnerabilidad
   - Pasos para reproducir
   - Impacto estimado
   - Posible solucion (si la conoces)

## Respuesta esperada

- Confirmacion de recepcion en 48 horas
- Evaluacion inicial en 7 dias
- Correccion y release en 30-90 dias (dependiendo de la gravedad)
- Creditos publicos al descubridor (si desea)

## Bug Bounty

Ofrecemos recompensas por vulnerabilidades validas:
- Critica: $2000 (USD en XMR/BTC)
- Alta: $1000
- Media: $500
- Baja: $100

Ver /security/BUG-BOUNTY.md para detalles.

## Medidas de seguridad del proyecto

- Builds reproducibles y firmados con Ed25519
- Auditorias de seguridad por terceros cada 6 meses
- Procesamiento local-first: datos nunca en servidores
- Zero-trust architecture
- Dependencias auditadas automaticamente
```

---

## 4. Inicializar Git

### 4.1 Configurar Git globalmente (primera vez)

```bash
# Configurar tu nombre y email (usados en los commits)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@example.com"

# Configurar la rama principal como 'main'
git config --global init.defaultBranch main

# Verificar configuracion
git config --list
```

### 4.2 Inicializar repositorio

```bash
# Ir a la carpeta del proyecto
cd ~/kernes

# Inicializar Git
git init
```

Deberias ver: `Initialized empty Git repository in /data/data/com.termux/files/home/kernes/.git/`

### 4.3 Crear .env y .dev.vars reales (locales, NO en Git)

```bash
# Copiar los archivos de ejemplo
# Estos archivos NO se subiran a Git gracias a .gitignore
cp ~/kernes/.env.example ~/kernes/.env.local
cp ~/kernes/.dev.vars.example ~/kernes/.dev.vars
```

### 4.4 Hacer el primer commit

```bash
# Anadir TODOS los archivos al staging area
git add .

# Verificar que archivos se van a commitear
git status
```

Deberias ver todos los archivos en verde (staged), excepto:
- `.env.local` (ignorado por .gitignore)
- `.dev.vars` (ignorado por .gitignore)

```bash
# Crear el primer commit
git commit -m "feat: inicializacion del proyecto Kernes

- Estructura completa del monorepo
- Archivos base: README, Todo, Manual Developer, LICENSE
- Configuracion: .env.example, .dev.vars.example, .gitignore
- Documentacion: CODE_OF_CONDUCT, CONTRIBUTING, SECURITY
- Stack: React + TypeScript + Tailwind + Hono.js + Ceramic + IPFS"
```

### 4.5 Verificar el commit

```bash
# Ver historial de commits
git log --oneline
```

Deberias ver algo como:
```
abc1234 feat: inicializacion del proyecto Kernes
```

---

## 5. Crear repositorio en GitHub

### Opcion A: Usando GitHub CLI (gh) — RECOMENDADO

#### 5.1 Autenticar con GitHub

```bash
# Iniciar sesion en GitHub
git auth login
```

Sigue las instrucciones en pantalla:
1. Selecciona **GitHub.com**
2. Selecciona **HTTPS** o **SSH** (HTTPS es mas facil en Termux)
3. Selecciona **Login with a web browser**
4. Copia el codigo de un solo uso
5. Termux abrira el navegador (o copia la URL manualmente)
6. Pega el codigo en la pagina de GitHub
7. Autoriza la aplicacion

Verificacion:
```bash
gh auth status
```

#### 5.2 Crear el repositorio

```bash
# Crear repo publico
git repo create kernes --public --source=. --push

# O crear repo privado
git repo create kernes --private --source=. --push
```

Esto crea el repositorio en tu cuenta de GitHub y sube los archivos.

### Opcion B: Crear manualmente en GitHub.com

#### 5.1 Crear repositorio en la web

1. Abre el navegador de tu telefono
2. Ve a https://github.com/new
3. En **Repository name** escribe: `kernes`
4. Selecciona **Public** o **Private**
5. NO marques "Add a README file" (ya lo tenemos)
6. NO marques "Add .gitignore" (ya lo tenemos)
7. NO marques "Choose a license" (ya lo tenemos)
8. Click en **Create repository**

#### 5.2 Conectar y subir

GitHub te mostrara instrucciones. En Termux ejecuta:

```bash
# Ir al proyecto
cd ~/kernes

# Anadir el remoto (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/kernes.git

# Verificar remoto
git remote -v

# Subir archivos
git branch -M main
git push -u origin main
```

Se te pedira tu usuario y token de GitHub (no uses password, usa Personal Access Token).

---

## 6. Subir archivos a GitHub

### 6.1 Subida inicial (ya hecha si usaste Opcion A)

Si usaste la Opcion B, la subida se hizo en el paso anterior con `git push`.

### 6.2 Verificar en GitHub

Abre tu navegador y ve a:
```
https://github.com/TU-USUARIO/kernes
```

Deberias ver todos los archivos:
- README.md
- Todo.md
- Manual-Developer.md
- LICENSE
- .env.example
- .dev.vars.example
- .gitignore
- package.json
- pnpm-workspace.yaml
- turbo.json
- tsconfig.base.json
- CODE_OF_CONDUCT.md
- CONTRIBUTING.md
- SECURITY.md
- Y todas las carpetas del monorepo

### 6.3 Archivos que NO deben estar en GitHub (verificar)

Asegurate de que estos archivos NO aparezcan en el repositorio:
- .env.local
- .dev.vars
- node_modules/

Si aparecen, corrigelo:
```bash
cd ~/kernes
echo ".env.local" >> .gitignore
echo ".dev.vars" >> .gitignore
git rm --cached .env.local 2>/dev/null
git rm --cached .dev.vars 2>/dev/null
git rm -r --cached node_modules 2>/dev/null
git add .gitignore
git commit -m "fix: eliminar archivos sensibles del tracking"
git push origin main
```

---

## 7. Verificar y proximos pasos

### 7.1 Checklist de verificacion

```bash
# Verificar estructura completa
cd ~/kernes && find . -maxdepth 3 -not -path './.git/*' -not -path './node_modules/*' | sort

# Verificar estado de Git
git status

# Verificar commits
git log --oneline

# Verificar remotos
git remote -v
```

### 7.2 Comandos utiles para el dia a dia

```bash
# Ver cambios pendientes
git status

# Anadir cambios especificos
git add README.md

# Commit
git commit -m "docs: actualizar README con instrucciones de instalacion"

# Subir cambios
git push origin main

# Ver historial
git log --oneline -10

# Crear y cambiar a nueva rama
git checkout -b feat/nueva-funcionalidad

# Cambiar entre ramas
git checkout main

# Traer cambios del remoto
git pull origin main
```

### 7.3 Proximos pasos del proyecto

Una vez creado el repositorio, el roadmap tecnico es:

1. **Fase 0 (ahora):** Configurar CI/CD con GitHub Actions
2. **Fase 1:** Desarrollar la extension de navegador (Sentinel)
3. **Fase 2:** Implementar ofuscacion activa (Chaff) y app movil
4. **Fase 3:** Integrar DIDs, ZK-Proofs y cifrado homomorfico
5. **Fase 4:** Descentralizacion completa con red comunitaria

### 7.4 Recursos utiles

| Recurso | URL |
|---------|-----|
| Repositorio | https://github.com/TU-USUARIO/kernes |
| Documentacion | https://docs.kernes.org |
| Chat (Matrix) | #kernes:matrix.org |
| GitHub CLI docs | https://cli.github.com/manual |
| Git cheat sheet | https://education.github.com/git-cheat-sheet-education.pdf |

---

## Solucion de problemas

### Error: "git: command not found"
```bash
pkg install git -y
```

### Error: "gh: command not found"
```bash
pkg install gh -y
```

### Error: "Permission denied" al hacer push
```bash
# Usa HTTPS en vez de SSH
git remote set-url origin https://github.com/TU-USUARIO/kernes.git

# O genera una SSH key
ssh-keygen -t ed25519 -C "tu-email@example.com"
# Anade la key publica a GitHub: Settings > SSH Keys
```

### Error: "failed to push some refs"
```bash
# Trae cambios primero
git pull origin main --rebase
git push origin main
```

### Pega no funciona en Termux
```bash
# Activa el acceso al portapapeles
termux-setup-storage

# Alternativa: usa el menu de Termux (manten presionado)
```

---

<p align="center">
  <strong>Proyecto creado con exito en Termux</strong><br>
  <em>Privacidad es un derecho humano. Defiendelo.</em>
</p>
