#!/usr/bin/env -S deno run --allow-read --allow-write

import { parseArgs } from "jsr:@std/cli/parse-args";
const { path } = parseArgs(Deno.args);
console.log(`processing ${path}`);

const decoder = new TextDecoder();
const data = decoder.decode(Deno.readFileSync(path)).replaceAll('"', '""');
let parsable = "";
for (const line of data.split("\n")) {
  const open = line.indexOf("{");
  const close = line.lastIndexOf("}") + 1;
  parsable += line.slice(0, open) + '"' + line.slice(open, close) + '"' +
    line.slice(close) + "\n";
}

Deno.writeTextFileSync(path, parsable);
