import { parseArgs } from "jsr:@std/cli/parse-args";

const { path } = parseArgs(Deno.args);
console.log(`processing ${path}`);

const decoder = new TextDecoder();
const oldData = decoder.decode(Deno.readFileSync(path)).split("\n");
const faceLines = oldData.filter((line) => line.includes("Face")).length;
console.log(`${path} has ${faceLines} detected face line`);

if (faceLines === 0) Deno.exit(0);

let newData = "";
oldData.forEach((line) => {
  if (line.includes("Face")) {
    const commas: number[] = [];
    let position = line.indexOf(",");

    while (position !== -1) {
      commas.push(position);
      position = line.indexOf(",", position + 1);
    }
    const newLine = 
      line.slice(0, (commas.at(-6) ?? 0) + 1) +
      '"' +
      line.slice((commas.at(-6) ?? 0) + 1, commas.at(-4)) +
      '"' +
      line.slice((commas.at(-4) ?? 0));
    newData += newLine + "\n"
  } else {
    newData += line + "\n";
  }
});

Deno.writeTextFileSync(path, newData)
