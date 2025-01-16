if (Deno.cwd().split("/").at(-1) !== "fukui-kanko-people-flow-data") {
  Deno.exit(1);
}
import { walk } from "jsr:@std/fs@^0.221.0";
import { parse, stringify } from "jsr:@std/csv";

const walkin = (new URL(import.meta.url)).searchParams.get("walkin");

/**
 * Dateを YYYY-MM-DD HH:mm:SS の形式の **string**に変換する
 */
const date2String = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${
    date
      .getDate()
      .toString()
      .padStart(2, "0")
  } ${date.getHours().toString().padStart(2, "0")}:${
    date
      .getMinutes()
      .toString()
      .padStart(2, "0")
  }:${date.getSeconds().toString().padStart(2, "0")}`;

const columnFixed = [
  "placement",
  "object class",
  "aggregate from",
  "aggregate to",
];

if (!walkin) {
  for await (
    const dir of walk("hourly", {
      includeFiles: false,
      match: [/.*2025\/01\/15/],
    })
  ) {
    new Worker(`${import.meta.url}?walkin=${dir.path}`, {
      type: "module",
      deno: { permissions: "inherit" },
    });
  }
} else {
  const decoder = new TextDecoder();
  const dailyData = [];
  for await (
    const file of walk(walkin, {
      exts: [".csv"],
      skip: [/.*\/2024\/12\/23\/.*/],
    })
  ) {
    const [_hourly, placement, objectClass, year, month, day, name] = file.path
      .split("/");
    const hour = name.split("-").at(-1)?.split(".").at(0);
    const csvStr = decoder.decode(Deno.readFileSync(file.path));
    const hourlyData = parse(csvStr, { skipFirstRow: true });
    const hourRow = {
      placement,
      "object class": objectClass,
      "aggregate from": date2String(
        new Date(Number(year), Number(month) - 1, Number(day), Number(hour)),
      ),
      "aggregate to": date2String(
        new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour) + 1,
        ),
      ),
      ...hourlyData.reduce((sum, row) => {
        Object.entries(row).forEach(([k, v]) => {
          if (columnFixed.includes(k)) return;
          sum[k] = String(sum[k] ? Number(sum[k]) + Number(v) : Number(v));
        });
        return sum;
      }, {}),
    };
    dailyData.push(hourRow);
  }

  if (dailyData.length > 0) {
    dailyData.sort((a, b) =>
      (new Date(a["aggregate from"])).getTime() -
      (new Date(b["aggregate from"])).getTime()
    );

    const dir = walkin.replace("hourly", "daily").split("/").slice(0, -1).join(
      "/",
    ) + "";
    Deno.mkdir(dir, { recursive: true });
    const name = walkin.split("/").slice(3, 6).join("-") + ".csv";
    const dailyCSVStr = stringify(dailyData, {
      columns: Object.keys(dailyData[0]),
    });
    Deno.writeTextFileSync(`${dir}/${name}`, dailyCSVStr);
  }
  self.close();
}
