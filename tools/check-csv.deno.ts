import { walk } from "jsr:@std/fs@^0.221.0";
import { parse } from "jsr:@std/csv/parse";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts";
import { wait } from "jsr:@denosaurs/wait";

export interface CheckResult {
  safe: number;
  warn: number;
  warnPaths: string[];
  error: number;
  errorPaths: string[];
}

export const checkCSV = async (): Promise<CheckResult> => {
  const spinner = wait("checking CSVs").start();
  const decoder = new TextDecoder();

  const result: CheckResult = {
    safe: 0,
    warn: 0,
    warnPaths: [] as string[],
    error: 0,
    errorPaths: [] as string[],
  };

  const placements = [
    "fukui-terminal",
    "tojinbo",
    "rainbow-one",
    "rainbow-two",
  ];

  for (const placement of placements) {
    for await (const file of walk(`./${placement}`)) {
      spinner.text = file.path;
      if (
        !file.isFile
      ) continue;

      const csvStr = decoder.decode(Deno.readFileSync(file.path));
      try {
        const data = parse(csvStr);
        const dataCount = data.reduce((sum, row) => sum += row.length, 0)
        if (Number.isInteger(dataCount / data.length)) {
          result.safe++;
          continue;
        }
        result.warn++;
        result.warnPaths.push(file.path);
      } catch (error) {
        result.error++;
        result.errorPaths.push(file.path);
        console.warn(
          `${colors.brightYellow("WARN:")} ${
            colors.underline(colors.yellow(file.path))
          } is broken!\n`,
          error
        );
      }
    }
  }
  spinner.succeed("check Done!");

  return result;
};

if (import.meta.main) {
  console.log(await checkCSV());
}
