# CLI Startup Test

This directory contains a standalone test to verify that the `ulu-mcp` CLI starts correctly, resolves the `ulu-mcp.config.js` file, and successfully loads the `@ulu/frontend` provider using the `ulu-mcp-provider` export subpath.

## How to Run

1. Open your terminal.
2. Navigate to the root of the `mcp-context-server` repository.
3. Ensure you have run `npm install @ulu/frontend --no-save` at the root so the provider is available.
4. Execute the test script:

```bash
node tests/cli-startup/test.js
```

## Expected Output

You should see the server boot up, successfully parse the config, and output the new ready messages to `stderr` before automatically shutting down:

```text
Starting MCP Context Server...
------------------------------

🚀 [ulu-mcp-context] is ready and listening on stdio.
📦 Loaded Providers: @ulu/frontend

------------------------------
Test complete. Shutting down server.
```