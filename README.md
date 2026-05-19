# @ulu/mcp-context-server

A lightweight engine (powered by the Model Context Protocol) designed to bridge the gap between AI agents and complex frontend library ecosystems.

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

Create a `ulu-mcp.config.js` file at the root of your project. Provide an array of the ULU packages you have installed.

```javascript
export default {
  providers: [
    "@ulu/frontend",
    "@ulu/frontend-vue"
  ]
};
```
*Behind the scenes, the CLI dynamically attempts to import the `@ulu/frontend/ulu-mcp-provider` subpath.*

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

```javascript
import { ContextServer } from "@ulu/mcp-context-server";
// Import the provider data directly via the semantic subpath
import vanillaProvider from "@ulu/frontend/ulu-mcp-provider";

const server = new ContextServer({
  serverName: "my-custom-context-server",
  providers: [
    vanillaProvider
  ]
});

// Starts the server (defaults to StdioServerTransport)
server.start();
```

---

## Building a Provider (For Library Authors)

If you are creating a new package within the ULU ecosystem, you must expose an object that conforms to the Task-Driven schema.

### 1. Package Export

Your `package.json` must map the `"exports"` field to expose a specific `"./ulu-mcp-provider"` subpath:

```json
{
  "name": "@ulu/my-new-library",
  "exports": {
    ".": "./dist/index.js",
    "./ulu-mcp-provider": "./dist/mcp-data.json"
  }
}
```

### 2. Provider Schema

To prevent bloating this runtime engine, the build-time parsing utilities (SassDoc/JSDoc) are maintained in separate dual-purpose documentation generators. Use those tools during your library's build step to output a JSON object containing the required `snippets`, `configuration`, `reference`, and `guides` objects.