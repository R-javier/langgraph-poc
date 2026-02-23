# 🦜🔗 LangGraph POC — TypeScript

POC mínima que demuestra **LangGraph orquestando un flujo simple** (`START → process → END`) con un LLM.

> **Objetivo de la semana:** Probar el concepto con Groq (sin bloqueos de cuota) y mostrar avance real. El grafo es proveedor-agnóstico: solo cambia la clase del LLM.

---

## 🧱 Stack

| Pieza | Paquete |
|---|---|
| Grafo de estado | `@langchain/langgraph` + `@langchain/core` |
| LLM | `@langchain/groq` — modelo `llama-3.3-70b-versatile` (configurable) |
| Runtime | Node.js + TypeScript ESM (`NodeNext`) |
| Ejecución TS | `tsx` (sin loaders experimentales) |

---

## 📁 Estructura

```
langgraph-poc/
├── src/
│   └── index.ts        # Grafo mínimo + nodo process + invocación CLI
├── .env                # Variables de entorno (no commitear)
├── .env.example        # Plantilla
├── .gitignore
├── package.json        # Scripts dev / build / start con tsx
└── tsconfig.json       # ESM NodeNext
```

---

## ⚙️ Requisitos

- **Node.js** ≥ 18
- Cuenta en [Groq Console](https://console.groq.com/keys) (gratis) para obtener tu API key

---

## 📦 Instalación

```bash
# 1. Clonar el repo
git clone https://github.com/R-javier/langgraph-poc.git
cd langgraph-poc

# 2. Instalar dependencias
npm install
```

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz (al lado de `package.json`).  
`GROQ_API_KEY` es obligatoria; las demás son opcionales y tienen defaults.

```ini
# Obligatoria
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Opcionales
GROQ_MODEL=llama-3.3-70b-versatile   # default: llama-3.3-70b-versatile
TEMPERATURE=0                          # default: 0
```

> Obtén tu key en → https://console.groq.com/keys  
> **Nunca subas el archivo `.env` real al repositorio.**

---

## ▶️ Ejecución

### Modo desarrollo (tsx — sin build)

```bash
npm run dev -- "¿Qué es LangGraph?"
```

### Build + Run

```bash
npm run build
npm start -- "Dame un ejemplo en una frase"
```

La salida en consola muestra el modelo y temperatura usados, seguido de la respuesta:

```
(model=llama-3.3-70b-versatile, temperature=0)

IA: LangGraph es una librería para construir aplicaciones con grafos de estado...
```

✅

---

## ¿Qué hace esta POC?

1. **Estado mínimo** con `messages` (historial de mensajes).
2. **Un solo nodo `process`** que:
   - Toma el último `HumanMessage`, o usa `"Hola, ¿qué es LangGraph?"` como prompt por defecto si no se pasa ninguno.
   - Llama al LLM (`ChatGroq`).
   - Devuelve la respuesta como `AIMessage`.
   - Si el LLM falla, captura el error y lo devuelve como `AIMessage` en lugar de romper el proceso.
3. **Grafo** `START → process → END` usando la Graph API canónica de LangGraph:
   - `StateGraph` → `addNode` → `addEdge` → `.compile()` → `.invoke()`

---

## 🔄 Cambiar de proveedor

El grafo no depende del proveedor. Para usar OpenAI en lugar de Groq, basta con:

```ts
// Antes (Groq)
import { ChatGroq } from "@langchain/groq";
const llm = new ChatGroq({ model: "llama-3.3-70b-versatile" });

// Después (OpenAI)
import { ChatOpenAI } from "@langchain/openai";
const llm = new ChatOpenAI({ model: "gpt-4o-mini" });
```

El resto del grafo queda intacto. ✅

---

## 📜 Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev -- "query"` | Ejecuta con `tsx` (sin build, ideal para desarrollo) |
| `npm run build`          | Compila TypeScript a `dist/`                          |
| `npm start -- "query"`   | Ejecuta el build compilado                            |


