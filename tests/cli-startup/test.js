import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binPath = path.resolve(__dirname, "../../bin/ulu-mcp.js");

console.log("Starting MCP Context Server...");
console.log("------------------------------");

// We spawn the CLI, inheriting 'stderr' so we can see the startup logs,
// but ignoring 'stdout' and 'stdin' since we aren't sending real MCP JSON-RPC commands.
const child = spawn("node", [binPath], {
  cwd: __dirname,
  stdio: ["ignore", "ignore", "inherit"] 
});

// Let it run for 2.5 seconds to show the logs, then kill it
setTimeout(() => {
  console.log("------------------------------");
  console.log("Test complete. Shutting down server.");
  child.kill();
}, 2500);
