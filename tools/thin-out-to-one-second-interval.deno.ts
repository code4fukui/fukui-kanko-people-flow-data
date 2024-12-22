import { parseArgs } from "jsr:@std/cli/parse-args";
import { parse } from "jsr:@std/csv";

type Box = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
type Movement = {
  box: Box;
  time: number;
};

const isMovementData = (v: object): v is Movement => {
  return Object.keys(v).includes("box") && Object.keys(v).includes("time");
};
const columnNames = [
  "objectID",
  "objectName",
  "appered_at",
  "disappred_at",
  "movement",
  "inferred_age",
  "inferred_gender",
  "detected_prefecture",
  "detected_category",
  "detected_aiueo",
] as const;

const { path } = parseArgs(Deno.args);
console.log(`processing ${path}`);
const oldSize = (await Deno.stat(path)).size;

const decoder = new TextDecoder();
const raw = decoder.decode(Deno.readFileSync(path));
const data = parse(raw, { columns: columnNames });

const oldData = data.map(
  (row) => ({
    ...row,
    movement: JSON.parse(`[${row.movement}]`) as Array<Movement | Box>,
  }),
);

const newData = oldData.map((row) => {
  let threshold = (new Date(row.appered_at)).getTime();
  const newMovement: Movement[] = row.movement.map((v, i) => {
    if (!isMovementData(v)) {
      return { box: v, time: (new Date(row.appered_at)).getTime() };
    } else return v;
  });
  const filtered = newMovement.filter((v) => isMovementData(v)).filter(
    (v, i) => {
      if (i === 0 || v.time > threshold + 1000) {
        threshold = v.time;
        return true;
      } else return false;
    },
  );

  return {
    ...row,
    movement: filtered,
  };
});

const newRaw = newData.map((row) =>
  Object.values(row).map((v) => {
    if (typeof v === "object") {
      const str = JSON.stringify(v);
      const res = `"${str.slice(1, str.length - 1).replaceAll('"', '""')}"`;
      return res;
    } else return v.toString();
  }).join(",")
).join("\n");

Deno.writeTextFileSync(path, newRaw);
const newSize = (await Deno.stat(path)).size;

console.log(
  `Done. ${oldSize} -> ${newSize} (reduced by ${
    100 - Math.round(newSize / oldSize * 100)
  }%)`,
);
