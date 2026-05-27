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
    throw new Error("Invalid configuration: 'providers' must be an array of package names.");
  }

  const loadedProviders = [];

  // Dynamically import the providers from node_modules
  for (const packageName of config.providers) {
    try {
      // We expect providers to expose their data at '[package-name]/ulu-mcp-provider'
      // We use import attributes to safely load JSON.
      const providerModule = await import(`${packageName}/ulu-mcp-provider`, { with: { type: "json" } });
      const provider = providerModule.default || providerModule;
      loadedProviders.push(provider);
    } catch (e) {
      console.error(`Warning: Failed to load provider '${packageName}'. Ensure it is installed.`, e.message);
    }
  }

  const server = new ContextServer({
    serverName: "ulu-mcp-context",
    providers: loadedProviders
  });

  await server.start();
}
