#!/usr/bin/env node
import { runCLI } from "../lib/cli.js";

runCLI().catch(err => {
  console.error("Failed to start MCP Context Server:", err);
  process.exit(1);
});