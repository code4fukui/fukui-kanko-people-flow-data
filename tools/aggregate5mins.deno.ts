if (Deno.cwd().split("/").at(-1) !== "fukui-kanko-people-flow-data") {
  Deno.exit(1);
}
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts";
import { existsSync } from "jsr:@std/fs@^0.221.0";
import { Database } from "jsr:@db/sqlite@0.11";
import { walk } from "jsr:@std/fs@^0.221.0";

const placements = [
  "fukui-terminal",
  "tojinbo",
  "rainbow-one",
  "rainbow-two",
] as const;
const isPlacement = (v: string): v is typeof placements[number] =>
  (["fukui-terminal", "tojinbo", "rainbow-one", "rainbow-two"] as const)
    .includes(
      v as
        | "fukui-terminal"
        | "tojinbo"
        | "rainbow-one"
        | "rainbow-two",
    );

const url = new URL(import.meta.url);
const dbPath = url.searchParams.get("dbpath");
const placementObjectClasses = {
  "fukui-terminal": {
    fullname: "fukui-station-east-entrance",
    objectClasses: ["Person", "Face"],
  },
  "tojinbo": {
    fullname: "tojinbo-shotaro",
    objectClasses: ["Person", "Face"],
  },
  "rainbow-one": {
    fullname: "rainbow-line-parking-lot-1-gate",
    objectClasses: ["LicensePlate", "Face"],
  },
  "rainbow-two": {
    fullname: "rainbow-line-parking-lot-2-gate",
    objectClasses: ["LicensePlate", "Face"],
  },
};

type SelectFromTable = {
  placement: "fukui-terminal" | "tojinbo" | "rainbow-one" | "rainbow-two";
  objectId: number;
  objectName: "Person" | "Face" | "LicensePlate";
  appered_at: string;
  disappered_at: string;
  movement: string;
  inferred_age?: number | string;
  inferred_gender?: string;
  detected_prefecture?: string;
  detected_category?: number | string;
  detected_aiueo?: string;
};

interface AggregatedDataBase {
  placement:
    | "fukui-station-east-entrance"
    | "tojinbo-shotaro"
    | "rainbow-line-parking-lot-1-gate"
    | "rainbow-line-parking-lot-2-gate"
    | "office";
  "object class": "Person" | "Face" | "LicensePlate";
  "aggregate from": string;
  "aggregate to": string;
  "total count": number;
}
type AggregatedDataRow = AggregatedDataBase & Record<string, string | number>;

const genders = ["male", "female", "other"] as const;
const ageRanges = [
  "range00to05",
  "range06to12",
  "range13to17",
  "range18to24",
  "range25to34",
  "range35to44",
  "range45to54",
  "range55to64",
  "range65over",
] as const;
const prefectures = [
  "Hokkaido",
  "Aomori",
  "Iwate",
  "Miyagi",
  "Akita",
  "Yamagata",
  "Fukushima",
  "Ibaraki",
  "Tochigi",
  "Gunma",
  "Saitama",
  "Chiba",
  "Tokyo",
  "Kanagawa",
  "Niigata",
  "Toyama",
  "Ishikawa",
  "Fukui",
  "Yamanashi",
  "Nagano",
  "Gifu",
  "Shizuoka",
  "Aichi",
  "Mie",
  "Shiga",
  "Kyoto",
  "Osaka",
  "Hyogo",
  "Nara",
  "Wakayama",
  "Tottori",
  "Shimane",
  "Okayama",
  "Hiroshima",
  "Yamaguchi",
  "Tokushima",
  "Kagawa",
  "Ehime",
  "Kochi",
  "Fukuoka",
  "Saga",
  "Nagasaki",
  "Kumamoto",
  "Oita",
  "Miyazaki",
  "Kagoshima",
  "Okinawa",
  "Other",
] as const;
const carCategories = [
  "PassengerCars",
  "CommercialVehicle",
  "RentACar",
  "Other",
] as const;

const areaToPrefecture = (area: string): typeof prefectures[number] => {
  switch (area) {
    case "札幌":
    case "函館":
    case "旭川":
    case "室蘭":
    case "苫小牧":
    case "北見":
    case "釧路":
    case "知床":
    case "帯広":
      return "Hokkaido";
    case "青森":
    case "弘前":
    case "八戸":
      return "Aomori";
    case "岩手":
    case "盛岡":
    case "平泉":
      return "Iwate";
    case "宮城":
    case "仙台":
      return "Miyagi";
    case "秋田":
      return "Akita";
    case "山形":
    case "庄内":
      return "Yamagata";
    case "福島":
    case "会津":
    case "郡山":
    case "白河":
    case "いわき":
      return "Fukushima";
    case "新潟":
    case "長岡":
    case "上越":
      return "Niigata";
    case "水戸":
    case "土浦":
    case "つくば":
      return "Ibaraki";
    case "宇都宮":
    case "那須":
    case "とちぎ":
      return "Tochigi";
    case "群馬":
    case "高崎":
    case "前橋":
      return "Gunma";
    case "山梨":
      return "Yamanashi";
    case "長野":
    case "松本":
    case "諏訪":
      return "Nagano";
    case "千葉":
    case "成田":
    case "野田":
    case "柏":
    case "松戸":
    case "習志野":
    case "船橋":
    case "市川":
    case "袖ヶ浦":
    case "市原":
      return "Chiba";
    case "大宮":
    case "川口":
    case "熊谷":
    case "春日部":
    case "越谷":
    case "所沢":
    case "川越":
      return "Saitama";
    case "品川":
    case "世田谷":
    case "足立":
    case "江東":
    case "葛飾":
    case "練馬":
    case "杉並":
    case "板橋":
    case "多摩":
    case "八王子":
      return "Tokyo";
    case "横浜":
    case "川崎":
    case "相模":
    case "湘南":
      return "Kanagawa";
    case "名古屋":
    case "三河":
    case "岡崎":
    case "豊田":
    case "尾張小牧":
    case "一宮":
    case "春日井":
    case "豊橋":
      return "Aichi";
    case "静岡":
    case "沼津":
    case "伊豆":
    case "富士山":
    case "浜松":
      return "Shizuoka";
    case "岐阜":
    case "飛騨":
      return "Gifu";
    case "三重":
    case "鈴鹿":
    case "四日市":
    case "伊勢志摩":
      return "Mie";
    case "富山":
      return "Toyama";
    case "石川":
    case "金沢":
      return "Ishikawa";
    case "福井":
      return "Fukui";
    case "大阪":
    case "なにわ":
    case "和泉":
    case "堺":
      return "Osaka";
    case "京都":
      return "Kyoto";
    case "奈良":
    case "飛鳥":
      return "Nara";
    case "滋賀":
      return "Shiga";
    case "和歌山":
      return "Wakayama";
    case "神戸":
    case "姫路":
      return "Hyogo";
    case "広島":
    case "福山":
      return "Hiroshima";
    case "鳥取":
      return "Tottori";
    case "島根":
    case "出雲":
      return "Shimane";
    case "岡山":
    case "倉敷":
      return "Okayama";
    case "山口":
    case "下関":
      return "Yamaguchi";
    case "徳島":
      return "Tokushima";
    case "香川":
    case "高松":
      return "Kagawa";
    case "愛媛":
      return "Ehime";
    case "高知":
      return "Kochi";
    case "福岡":
    case "北九州":
    case "筑豊":
    case "久留米":
      return "Fukuoka";
    case "佐賀":
      return "Saga";
    case "長崎":
    case "佐世保":
      return "Nagasaki";
    case "熊本":
      return "Kumamoto";
    case "大分":
      return "Oita";
    case "宮崎":
      return "Miyazaki";
    case "鹿児島":
    case "奄美":
      return "Kagoshima";
    case "沖縄":
      return "Okinawa";
    default:
      return "Other";
  }
};

const kanaToCategory = (kana: string): typeof carCategories[number] => {
  if (
    "さすせそたちつてとなにぬねのはふふほまみむめもやゆららりるろ".includes(
      kana,
    )
  ) {
    return "PassengerCars";
  } else if ("あいうえかきくけこを".includes(kana)) {
    return "CommercialVehicle";
  } else if ("れわ".includes(kana)) {
    return "RentACar";
  } else {
    return "Other";
  }
};

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

/** ******************************************
 *                  main
 * ******************************************/
if (dbPath) {
  console.log(`worker for ${dbPath}.`);

  const [_, placement, year, month, dayDB] = dbPath.split("/");
  if (!isPlacement(placement)) throw new Error("invalid placement value");
  const decoder = new TextDecoder();
  const db = new Database(dbPath, { readonly: true });
  const selectApperedBetweenFromTo = db.prepare(`
  SELECT * FROM detected
  WHERE
    placement == :placement AND
    objectName == :objectName AND
    appered_at BETWEEN :from AND :to
  `);

  const startedAt = new Date();

  const limitDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(dayDB.split(".").at(0)) + 1,
  );
  for (
    const fromDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(dayDB.split(".").at(0)),
    );
    fromDate.getTime() < limitDate.getTime();
    fromDate.setMinutes(fromDate.getMinutes() + 5)
  ) {
    const toDate = new Date(fromDate.getTime() + 5 * 60 * 1000);
    console.log(
      `\n${placement} 集計範囲: ` +
        colors.bgGreen(`${date2String(fromDate)} ~ ${date2String(toDate)}`),
    );

    for (const objectClass of placementObjectClasses[placement].objectClasses) {
      /** SQLite へのクエリ結果 */
      const selectResult = selectApperedBetweenFromTo.all({
        placement,
        objectName: objectClass,
        from: date2String(fromDate),
        to: date2String(new Date(toDate.getTime() - 1)),
      }) as SelectFromTable[];

      let detailCounts: Record<string, Record<string, number>> | undefined =
        undefined;
      if (objectClass !== "Person") {
        const obj: Record<string, Record<string, number>> = {};
        const isFace = objectClass === "Face";
        const fKeys = isFace ? genders : prefectures;
        const sKeys = isFace ? ageRanges : carCategories;

        for (const fkey of [...fKeys, isFace ? "other" : "Other"]) {
          obj[fkey] = {};
          for (
            const sKey of isFace
              ? sKeys
              : [...sKeys, isFace ? "other" : "Other"]
          ) {
            obj[fkey][sKey] = 0;
          }
        }

        if (isFace) {
          selectResult.forEach((item) => {
            if (!item.inferred_age || !item.inferred_gender) return;
            const gender =
              ["male", "female"].includes(String(item.inferred_gender))
                ? String(item.inferred_gender)
                : "other";
            switch (item.inferred_age) {
              case "0,5":
                obj[gender].range00to05++;
                return;
              case "6,12":
                obj[gender].range06to12++;
                return;
              case "13,17":
                obj[gender].range13to17++;
                return;
              case "18,24":
                obj[gender].range18to24++;
                return;
              case "25,34":
                obj[gender].range25to34++;
                return;
              case "35,44":
                obj[gender].range35to44++;
                return;
              case "45,54":
                obj[gender].range45to54++;
                return;
              case "55,64":
                obj[gender].range55to64++;
                return;
              default:
                obj[gender].range65over++;
                return;
            }
          });
        } else {
          selectResult.forEach((item) => {
            if (!item.detected_prefecture || !item.detected_aiueo) return;
            obj[areaToPrefecture(item.detected_prefecture)][
              kanaToCategory(item.detected_aiueo)
            ]++;
          });
        }
        detailCounts = obj;
      }

      let fileHeader =
        "placement,object class,aggregate from,aggregate to,total count";
      let row = `${placementObjectClasses[placement].fullname},${objectClass},${
        date2String(fromDate)
      },${date2String(toDate)},${selectResult.length}`;
      if (objectClass === "Face") {
        if (!detailCounts) continue;
        genders.forEach((gender) => {
          ageRanges.forEach((ageRange) => {
            fileHeader += `,${gender} ${ageRange}`;
            row += `,${detailCounts[gender][ageRange]}`;
          });
        });
      } else if (objectClass === "LicensePlate") {
        if (!detailCounts) continue;
        prefectures.forEach((prefecture) => {
          carCategories.forEach((carCategory) => {
            fileHeader += `,${prefecture} ${carCategory}`;
            row += `,${detailCounts[prefecture][carCategory]}`;
          });
        });
      }

      const csvPath = `./hourly/${
        placementObjectClasses[placement].fullname
      }/${objectClass}/${fromDate.getFullYear()}/${
        (
          fromDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")
      }/${
        fromDate
          .getDate()
          .toString()
          .padStart(2, "0")
      }/${fromDate.getFullYear()}-${
        (fromDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")
      }-${fromDate.getDate().toString().padStart(2, "0")}-${
        fromDate
          .getHours()
          .toString()
          .padStart(2, "0")
      }.csv`;

      if (existsSync(csvPath)) {
        const existingData = decoder.decode(Deno.readFileSync(csvPath));
        if (existingData.split("\n").at(0) !== fileHeader) {
          Deno.writeTextFileSync(csvPath, `${fileHeader}\n${row}`);
        } else {
          if (existingData.split("\n").length < 13) {
            Deno.writeTextFileSync(csvPath, `${existingData}\n${row}`);
          }
        }
      } else {
        Deno.mkdirSync(csvPath.split("/").slice(0, -1).join("/"), {
          recursive: true,
        });
        Deno.writeTextFileSync(csvPath, `${fileHeader}\n${row}`);
      }
    }
  }

  const time = Date.now() - startedAt.getTime();
  console.log(
    `\n${placement} process time: ${colors.yellow(time.toString())} ms\n`,
  );

  self.close();
} else {
  for await (
    const dbPath of walk("dbs", {
      exts: [".db"],
      match: [/.*2025\/01\/15/],
    })
  ) {
    new Worker(`${import.meta.url}?dbpath=${dbPath.path}`, {
      type: "module",
      deno: { permissions: "inherit" },
    });
  }
}
