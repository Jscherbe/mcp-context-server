import path from "node:path";
import { pathToFileURL } from "node:url";
import { cosmiconfig } from "cosmiconfig";
import { ContextServer } from "./server.js";

/**
 * Locates the local configuration file, dynamically loads the requested 
 * ULU providers, and starts the context server over stdio.
 * 
 * @returns {Promise<void>}
 */
export async function runCLI() {
  const explorer = cosmiconfig("ulu-mcp");
  const result = await explorer.search();

  if (!result || !result.config) {
    throw new Error(`Configuration not found. Please create a ulu-mcp.config.js file or add an "ulu-mcp" property to your package.json.`);
  }

  const config = result.config;

  if (!config.providers || !Array.isArray(config.providers)) {
    throw new Error("Invalid configuration: 'providers' must be an array.");
  }

  const loadedProviders = [];

  for (const providerConfig of config.providers) {
    if (typeof providerConfig === "string") {
      try {
        let importUrl;
        
        // Check if the string is a local path
        if (providerConfig.startsWith(".") || providerConfig.startsWith("/")) {
          const resolvedPath = path.resolve(path.dirname(result.filepath), providerConfig);
          importUrl = pathToFileURL(resolvedPath).href;
        } else {
          // We expect module providers to expose their data at '[package-name]/ulu-mcp-provider'
          importUrl = `${providerConfig}/ulu-mcp-provider`;
        }

        // We use import attributes to safely load JSON.
        const providerModule = await import(importUrl, { with: { type: "json" } });
        const provider = providerModule.default || providerModule;
        loadedProviders.push(provider);
      } catch (e) {
        console.error(`Warning: Failed to load provider from '${providerConfig}'.`, e.message);
      }
    } else if (typeof providerConfig === "object" && providerConfig !== null) {
      loadedProviders.push(providerConfig);
    } else {
      console.error(`Warning: Invalid provider entry type '${typeof providerConfig}'. Providers must be strings or objects.`);
    }
  }

  const server = new ContextServer({
    serverName: "ulu-mcp-context",
    providers: loadedProviders
  });

  await server.start();
}
