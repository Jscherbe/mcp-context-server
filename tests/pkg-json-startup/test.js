import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binPath = path.resolve(__dirname, "../../bin/ulu-mcp.js");

console.log("Starting MCP Context Server (package.json config)...");
console.log("------------------------------");

const child = spawn("node", [binPath], {
  cwd: __dirname,
  stdio: ["ignore", "ignore", "inherit"] 
});

setTimeout(() => {
  console.log("------------------------------");
  console.log("Test complete. Shutting down server.");
  child.kill();
}, 2500);
