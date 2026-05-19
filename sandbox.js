import { ContextServer } from "./lib/server.js";
import frontendProvider from "../dist/mcp/index.js";

const server = new ContextServer({
  providers: [frontendProvider],
  serverName: "mcp-knowledge-base-sandbox",
});

server.start().catch(console.error);
