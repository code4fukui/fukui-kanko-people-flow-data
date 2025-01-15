if (Deno.cwd().split("/").at(-1) !== "fukui-kanko-people-flow-data") {
  Deno.exit(1);
}
import { walk } from "jsr:@std/fs@^0.221.0";
import { parse } from "jsr:@std/csv/parse";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts";
import { Database } from "jsr:@db/sqlite@0.11";

const url = new URL(import.meta.url);
const placement = url.searchParams.get("placement");
const walkin = url.searchParams.get("walkin");

const placements = [
  "fukui-terminal",
  "tojinbo",
  "rainbow-one",
  "rainbow-two",
] as const;

const columnName = [
  "objectId",
  "objectName",
  "appered_at",
  "disappered_at",
  "movement",
  "inferred_age",
  "inferred_gender",
  "detected_prefecture",
  "detected_category",
  "detected_aiueo",
] as const;

if (placement && walkin) {
  console.log(`worker for ${placement}@${walkin}.`);

  const startedAt = new Date();
  Deno.mkdirSync(`dbs/${walkin.split("/").slice(0, -1).join("/")}`, {
    recursive: true,
  });
  const db = new Database(`dbs/${walkin}.db`);
  db.exec(`
    CREATE TABLE IF NOT EXISTS detected (
      placement_objectName_apperedAtDate_objectId TEXT PRIMARY KEY,
      placement TEXT NOT NULL,
      objectId INTEGER,
      objectName TEXT NOT NULL,
      appered_at TEXT NOT NULL DEFAULT(DATETIME('now', 'localtime')),
      disappered_at TEXT NOT NULL DEFAULT(DATETIME('now', 'localtime')),
      movement TEXT,
      inferred_age INTEGER,
      inferred_gender TEXT,
      detected_prefecture TEXT,
      detected_category INTEGER,
      detected_aiueo TEXT
    )
  `);
  const decoder = new TextDecoder();

  const results = {
    succeeded: 0,
    failed: 0,
    failedPaths: [] as string[],
  };

  for await (const file of walk(walkin)) {
    if (!file.isFile) continue;

    const csv = decoder.decode(Deno.readFileSync(file.path));
    try {
      const data: Record<
        typeof columnName[number],
        string | number
      >[] = parse(csv).map(
        (row) => {
          const obj: Record<
            typeof columnName[number],
            string | number
          > = {
            "objectId": 0,
            "objectName": "",
            "appered_at": 0,
            "disappered_at": 0,
            "movement": "",
            "inferred_age": "",
            "inferred_gender": "",
            "detected_prefecture": "",
            "detected_category": "",
            "detected_aiueo": "",
          };
          columnName.forEach((v, i) => {
            obj[v] = row[i] ?? "";
          });
          return obj;
        },
      );
      // console.log(file.path, data.length);

      data.forEach((row) => {
        const id = `${placement}#${row.objectName}#${
          String(row.appered_at).slice(0, 10)
        }#${row.objectId}`;
        const selectResult = db.prepare(`
          SELECT * FROM detected WHERE placement_objectName_apperedAtDate_objectId == '${id}'
        `).value()!;
        // console.log(`${id}\t`, selectResult);

        if (!selectResult) {
          const insert = db.prepare(`
            INSERT INTO detected
              (placement_objectName_apperedAtDate_objectId, placement, objectId, objectName, appered_at, disappered_at, movement, inferred_age, inferred_gender, detected_prefecture, detected_category, detected_aiueo)
            VALUES
              (:placement_objectName_apperedAtDate_objectId, :placement, :objectId, :objectName, :appered_at, :disappered_at, :movement, :inferred_age, :inferred_gender, :detected_prefecture, :detected_category, :detected_aiueo)
          `);
          insert.run({
            ...row,
            placement,
            placement_objectName_apperedAtDate_objectId: id,
          });
        } else {
          const existingDataApperedAt = (new Date(
            String(selectResult[columnName.indexOf("appered_at") + 2]),
          )).getTime();
          const existingDataDisapperedAt = (new Date(
            String(selectResult[columnName.indexOf("disappered_at") + 2]),
          )).getTime();
          const newDataAppperedAt = (new Date(row.appered_at)).getTime();
          const newDataDisappperedAt = (new Date(row.disappered_at)).getTime();

          const updateApperedAt = existingDataApperedAt < newDataAppperedAt
            ? String(selectResult[columnName.indexOf("appered_at") + 2])
            : row.appered_at;
          const updateDisapperedAt =
            existingDataDisapperedAt < newDataDisappperedAt
              ? row.disappered_at
              : String(selectResult[columnName.indexOf("disappered_at") + 2]);
          const updateMovement = JSON.stringify(
            existingDataApperedAt < newDataAppperedAt
              ? [
                ...JSON.parse(
                  `[${selectResult[columnName.indexOf("movement") + 2]}]`,
                ),
                ...JSON.parse(`[${String(row.movement)}]`),
              ]
              : [
                ...JSON.parse(`[${String(row.movement)}]`),
                ...JSON.parse(
                  `[${selectResult[columnName.indexOf("movement") + 2]}]`,
                ),
              ],
          );

          const update = db.prepare(`
            UPDATE detected
            SET
              appered_at = :appered_at,
              disappered_at = :disappered_at,
              movement = :movement
            WHERE placement_objectName_apperedAtDate_objectId = :placement_objectName_apperedAtDate_objectId
          `);
          update.run({
            placement_objectName_apperedAtDate_objectId: id,
            appered_at: updateApperedAt,
            disappered_at: updateDisapperedAt,
            movement: updateMovement,
          });
        }
      });

      results.succeeded++;
    } catch (error) {
      console.error(colors.brightRed(`ERROR: ${file.path}\n`), error);
      results.failed++;
      if (!results.failedPaths.includes(file.path)) {
        results.failedPaths.push(file.path);
      }
    }
  }

  const time = Date.now() - startedAt.getTime();
  console.log(
    `\n${placement} process time: ${colors.yellow(time.toString())} ms\n`,
  );
  console.log(results);

  self.close();
} else {
  placements.forEach((v) => {
    ["2024/12", "2025/01"].forEach(async (m) => {
      const monthDir = `${v}/${m}/`;
      for await (
        const dir of walk(monthDir, {
          maxDepth: 1,
          includeDirs: true,
          includeFiles: false,
          includeSymlinks: false,
        })
      ) {
        if (dir.path === monthDir) continue;
        new Worker(`${import.meta.url}?placement=${v}&walkin=${dir.path}`, {
          type: "module",
          deno: { permissions: "inherit" },
        });
      }
    });
  });
}
