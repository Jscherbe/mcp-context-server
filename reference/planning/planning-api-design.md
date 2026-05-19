# API Design: `@ulu/mcp-knowledge-base`

This document defines the public API, extensibility model, and the required data schema for the `@ulu/mcp-knowledge-base` package.

## 1. Core Philosophy
The package acts as a "Server Builder". It does not extract data itself; it expects a structured JSON artifact (the `KnowledgeDefinition`) and automatically exposes that data via standard Model Context Protocol (MCP) tools and resources.

## 2. The Data Schema (`KnowledgeDefinition`)

The server consumes a structured JSON object. The user is responsible for writing scripts (adapters) that transform their project's documentation, code comments, and design tokens into this format.

```typescript
interface KnowledgeDefinition {
  // Metadata about the knowledge base
  meta: {
    name: string;
    version: string;
    description?: string;
  };
  
  // Static textual resources (Rules, Conventions, Architecture)
  // Exposed via MCP Resources (e.g., `kb://resources/architecture`)
  resources: Array<{
    id: string; // e.g., 'architecture', 'conventions'
    title: string;
    content: string; // Markdown content
  }>;

  // Searchable, specific entities (Components, Modules, Functions)
  // Exposed via MCP Tools (e.g., `get_entity`)
  entities: Array<{
    type: string; // e.g., 'component', 'function', 'class'
    name: string; // e.g., 'accordion', 'Button'
    description: string;
    // Optional snippets depending on the entity type
    snippets?: {
      html?: string;
      js?: string;
      scss?: string;
      usage?: string;
    };
    // API signature or properties
    api?: string; 
    // Specific configuration options (e.g., SCSS variables)
    config?: Record<string, any>; 
  }>;

  // Design Tokens or global variables (Colors, Spacing, Typography scales)
  // Exposed via MCP Tools (e.g., `get_design_tokens`)
  tokens: Array<{
    category: string; // e.g., 'spacing', 'colors'
    items: Array<{
      name: string; // e.g., 'spacing-large', 'primary-blue'
      value: string;
      description?: string;
    }>;
  }>;
}
```

## 3. Public API (Server Implementation)

Users will import the main class to instantiate their server.

### Instantiation

```javascript
import { KnowledgeBaseServer } from '@ulu/mcp-knowledge-base';
import myProjectData from './dist/mcp-data.json'; // The generated KnowledgeDefinition

const server = new KnowledgeBaseServer({
  definition: myProjectData,
  serverName: 'my-project-mcp',
  serverVersion: '1.0.0'
});
```

### Generated MCP Capabilities
By default, passing the definition automatically wires up:

**Resources:**
*   `kb://resources/{id}`: Returns the static content defined in `definition.resources`.

**Tools:**
*   `list_entity_types()`: Returns available types (e.g., ['component', 'function']).
*   `list_entities(type)`: Returns names and descriptions of entities for a specific type.
*   `get_entity(name, type)`: Returns the full comprehensive object (snippets, config, api) for an entity.
*   `list_token_categories()`: Returns available token categories.
*   `get_tokens(category)`: Returns the tokens for a specific category.

### Extensibility

Users can add custom tools or resources that the default schema doesn't cover.

```javascript
// Adding a custom tool
server.addTool({
  name: 'get_jira_ticket',
  description: 'Fetches Jira ticket context for a component',
  inputSchema: { ... }, // JSON Schema
  handler: async (args) => {
    // Custom logic here
    return {
      content: [{ type: "text", text: "..." }]
    };
  }
});

// Adding a custom resource
server.addResource({
  uri: 'kb://custom/live-status',
  name: 'Live Build Status',
  handler: async () => { ... }
});
```

### Starting the Server

```javascript
// Start the stdio transport (standard for local AI agents)
server.start();
```