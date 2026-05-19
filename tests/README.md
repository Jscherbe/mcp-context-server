# Testing the MCP Server with Gemini CLI

This guide explains how to connect your local Gemini CLI instance to the `@ulu/frontend` MCP Knowledge Base sandbox to verify its effectiveness.

## 1. Create a Test Project

1. Open a new terminal.
2. Create a temporary, empty directory to serve as your "real-world" test project and navigate into it.
   ```bash
   mkdir ~/Desktop/ulu-test-project
   cd ~/Desktop/ulu-test-project
   ```

## 2. Configure Gemini CLI (Project-Specific)

You need to tell the Gemini CLI running in your test project how to connect to the sandbox MCP server. You can do this by creating a local `.gemini/config.json` file inside your test project directory.

```bash
mkdir .gemini
```

Create a `.gemini/config.json` file and add the following configuration. **Ensure the path points to the absolute location of the sandbox script.**

```json
{
  "mcp": {
    "servers": {
      "ulu-frontend": {
        "command": "node",
        "args": [
          "/Users/joe/Projects/Personal/Github/frontend/mcp-server/sandbox.js"
        ]
      }
    }
  }
}
```

## 3. Start a Test Session

Launch Gemini CLI from inside `~/Desktop/ulu-test-project`.

## 4. The Test Prompts

Once Gemini CLI is running and connected to the `ulu-frontend` MCP server, try sending a series of prompts to test the different API tiers.

### Test A: The Builder API (Markup Generation)
Ask the AI to build a page layout using specific components. This tests if it successfully discovers and utilizes the `ulu_get_snippets` tool.

**Prompt:**
> "I need to build a simple landing page. Please write the HTML for a page that includes a 'Basic Hero' section at the top, followed by a 'Standard Card Grid' containing three cards. Use the `@ulu/frontend` components."

**Expected Behavior:** 
Gemini should recognize it has the `@ulu/frontend` tools, optionally call `ulu_list_components` to see what's available, and then call `ulu_get_snippets` for `hero` and `card-grid` (and potentially `card`). It should then output clean HTML using the classes exactly as they appear in our colocated `.demo.html` files.

### Test B: The Styling API (SCSS Configuration)
Ask the AI to configure or theme a component globally. This tests if it successfully utilizes the `ulu_get_configuration` tool.

**Prompt:**
> "How do I globally configure the 'button' component in SCSS so that its border-radius is 0 and its padding is 1rem 2rem? Please show me the exact SCSS code."

**Expected Behavior:**
Gemini should call `ulu_get_configuration` for `button` to read its `$config` map. It should then output SCSS code that correctly uses the `@include ulu.component-button-set(...)` mixin with the correct property names.

### Test C: In-Depth API (Reference)
Ask a specific technical question about the library's internal API.

**Prompt:**
> "Can you look up the SCSS documentation for the 'color' module and tell me what parameters the 'get' function accepts?"

**Expected Behavior:**
Gemini should call `ulu_get_reference` for `color` and correctly parse the raw AST output to explain the function signature.

## 4. Evaluate the Results
If the AI successfully completes these tasks without hallucinating non-existent classes (like Tailwind utility classes) or guessing configuration properties, the Agnostic Tiered architecture and the distributed provider model are a resounding success! 

If it struggles, we may need to adjust the descriptions of the tools in `mcp-server/src/server.js` to give it better hints on how to query the data.
