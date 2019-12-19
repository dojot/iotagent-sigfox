import fs = require("fs");
import { Agent } from "./agent";

function main() {
  let agent = new Agent();
  agent.start();
}

main();
