# @ulu/mcp-context-server

A lightweight engine (powered by the Model Context Protocol) designed to bridge the gap between AI agents and complex frontend library ecosystems.

**Table of Contents:**
- [The Problem](#the-problem)
- [The Solution](#the-solution)
  - [1. Task-Driven Context (TDC)](#1-task-driven-context-tdc)
  - [2. Distributed Provider Model](#2-distributed-provider-model)
- [Usage for End Users](#usage-for-end-users)
  - [1. Installation](#1-installation)
  - [2. Configuration](#2-configuration)
  - [3. Connect your AI Agent](#3-connect-your-ai-agent)
- [Usage for Advanced Users (Programmatic)](#usage-for-advanced-users-programmatic)
- [Building a Provider (For Library Authors)](#building-a-provider-for-library-authors)
  - [1. Build-Time Generation](#1-build-time-generation)
  - [2. Package Export](#2-package-export)


## The Problem

Exposing a large UI library to an AI agent is challenging. Throwing raw source code or unstructured Markdown at an LLM quickly overwhelms its context window, leading to hallucinations and degraded performance. For humans, we build regular documentation (HTML websites). For AI, we need **Task-Driven Context**.

Furthermore, building a monolithic AI server for multiple libraries creates versioning nightmares (e.g., the server expects Vue 3 syntax, but the developer installed a Vue 2 version of your library).

## The Solution

`@ulu/mcp-context-server` solves these issues through two core architectural principles:

### 1. Task-Driven Context (TDC)
The core innovation of this engine is forcing libraries to categorize their documentation into distinct tiers based on **AI Intent (Tasks)**. This prevents the AI from reading a massive AST when it simply wants to copy-paste a button component.

Providers map their data into these task tiers, and the Server automatically registers them as dynamically prefixed tools (e.g., `ulu_get_snippets`):

*   **Builder Tier (`get_snippets`):** Used when the AI's task is *writing UI code*. High signal, low noise. Returns copy-pasteable HTML or Vue variations.
*   **Configuration Tier (`get_configuration`):** Used when the AI's task is *altering themes or component state*. Returns a concise list of SCSS `$config` maps, CSS variables, or component props.
*   **Conceptual Tier (`get_guides`):** Used when the AI's task is *understanding architecture*. Returns overarching library knowledge and installation instructions.
*   **In-Depth Reference Tier (`get_reference`):** Used only as a last resort when the AI's task is *deep debugging*. Returns the full, raw AST.

### 2. Distributed Provider Model
This package is incredibly lightweight. It knows *nothing* about parsing SCSS, JavaScript, or Vue. 

Instead, the UI libraries themselves (`@ulu/frontend`, `@ulu/frontend-vue`) parse their own code during their build step. They map their data into our standardized Task-Driven schema and ship it via a specific `ulu-mcp-provider` export subpath inside their NPM package. Because the AI documentation ships *with* the NPM package, the AI is guaranteed to read documentation that exactly matches the code the developer has installed locally.

---

## Usage for End Users

This is the recommended approach for developers building applications with ULU UI libraries.

### 1. Installation

Install the server as a dev dependency in your project:

```bash
npm install -D @ulu/mcp-context-server
```

### 2. Configuration

You can configure the server either by creating a `ulu-mcp.config.js` file at the root of your project or by adding an `"ulu-mcp"` property to your `package.json`.

**Option A: `ulu-mcp.config.js`**

```javascript
export default {
  providers: [
    "@ulu/frontend",
    "@ulu/frontend-vue"
  ]
};
```

**Option B: `package.json`**

```json
{
  "ulu-mcp": {
    "providers": [
      "@ulu/frontend",
      "@ulu/frontend-vue"
    ]
  }
}
```

*Behind the scenes, the CLI loads your configuration and dynamically attempts to import the `[package-name]/ulu-mcp-provider` subpath.*

### 3. Connect your AI Agent

Point your AI's MCP configuration (e.g., Gemini CLI, Claude Desktop, Cursor) to the local CLI binary using `npx`:

```json
{
  "mcp": {
    "servers": {
      "ulu-context": {
        "command": "npx",
        "args": ["ulu-mcp"]
      }
    }
  }
}
```

---

## Usage for Advanced Users (Programmatic)

For custom servers, advanced tooling, or HTTP hosting, you can instantiate the server manually, pass in the provider objects, and provide a custom transport layer. 

The `providers` array accepts any standard JavaScript object that conforms to the Task-Driven schema, regardless of how it was generated or imported.

```javascript
import { ContextServer } from "@ulu/mcp-context-server";
// Import provider data (can be JSON, a JS module, or dynamically fetched)
import vanillaProvider from "@ulu/frontend/ulu-mcp-provider" with { type: "json" };
import myCustomProvider from "./my-custom-provider.js";

const server = new ContextServer({
  serverName: "my-custom-context-server",
  providers: [
    vanillaProvider,
    myCustomProvider
  ]
});

// Starts the server (defaults to StdioServerTransport)
server.start();
```

---

## Building a Provider (For Library Authors)

This package is designed to be open-ended. **Any UI library, design system, or frontend framework** can implement the Task-Driven schema to provide perfect AI context for their users.

To become a provider, you must expose a **pure JSON** object that conforms to the schema. While the programmatic API accepts any JS object, exporting a pure JSON file ensures that your documentation can be easily fetched over a network by future HTTP-based web agents without requiring a JavaScript runtime.

### 1. Build-Time Generation

During your library's build step, output an `mcp-data.json` file containing the necessary metadata (`name`, `prefix`) alongside the required `snippets`, `configuration`, `reference`, and `guides` objects.

```json
{
  "name": "@my-org/my-ui-library",
  "prefix": "my_ui",
  "snippets": { ... },
  "configuration": { ... }
}
```

### 2. Package Export

Your `package.json` must map the `"exports"` field to expose this specific JSON file via the `"./ulu-mcp-provider"` subpath:

```json
{
  "name": "@my-org/my-ui-library",
  "exports": {
    ".": "./dist/index.js",
    "./ulu-mcp-provider": "./dist/mcp-data.json"
  }
}
```