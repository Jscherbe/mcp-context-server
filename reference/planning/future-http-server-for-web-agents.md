# Future Planning: HTTP Server for Web Agents

## Goal
To allow web-based AI agents (or environments without a local `node_modules` installation) to query ULU library data over an HTTP connection using the Model Context Protocol (MCP) or a RESTful wrapper.

## The Challenge
The current `@ulu/mcp-context-server` architecture relies heavily on local installation: the `cli.js` loads provider data directly from the user's `node_modules` to ensure strict version alignment with the developer's project. A centralized HTTP server lacks this local context.

## Proposed Architecture for an HTTP Server

1. **Centralized Hosting:** Create a separate, lightweight project (e.g., hosted on Vercel, Render, or a free-tier Node server).
2. **Data Sourcing (The "Registry"):**
   - The HTTP server will need an automated script (likely a GitHub Action or a cron job) to periodically fetch the latest `ulu-mcp-provider` data from NPM for all supported ULU packages.
   - Alternatively, it could accept a `version` parameter in the request and dynamically fetch the raw `data.json` from `unpkg` or `jsdelivr`.
3. **Core Reusability:**
   - The HTTP server will import the core logic from `@ulu/mcp-context-server` rather than rewriting it.
   - It will bypass `cli.js` completely. Instead, it will instantiate the `ContextServer` programmatically, injecting the network-fetched provider data into the `providers` array.
4. **Transport Layer:**
   - The current `ContextServer` defaults to `StdioServerTransport` (standard input/output), which is ideal for CLIs.
   - For the HTTP Server, we must be able to swap out the transport layer to use HTTP/SSE (Server-Sent Events), which is supported by the `@modelcontextprotocol/sdk`.

## Library Refactoring Considerations

To ensure `@ulu/mcp-context-server` is ready to support this future use case, we must maintain a decoupled architecture within the library itself:

### 1. Export the Core Engine
We must ensure that the core `ContextServer` class is exported cleanly from the main entry point (e.g., `index.js`). Consumers building an HTTP server will not use the CLI binary; they will consume the library programmatically:

```javascript
import { ContextServer } from '@ulu/mcp-context-server';
```

### 2. Decouple the Transport Layer
Currently, the `start()` method in `lib/server.js` hardcodes the `StdioServerTransport`.

```javascript
  async start() {
    const transport = new StdioServerTransport(); // Hardcoded!
    await this.server.connect(transport);
    console.error(`${this.serverName} running on stdio`);
  }
```

**Required Change:** We should refactor the `ContextServer` constructor or the `start()` method to accept a custom transport instance as an argument, while falling back to `stdio` if none is provided.

```javascript
  async start(customTransport) {
    const transport = customTransport || new StdioServerTransport();
    await this.server.connect(transport);
  }
```

### 3. Expose Types and Schemas
If we eventually use `zod` to strictly validate incoming provider data (ensuring library authors don't pass malformed JSON), we should export those Zod schemas. This allows the HTTP server to validate data fetched from third-party CDNs before injecting it into the server.