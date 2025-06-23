// deno run --allow-net --allow-write main.ts
import { format, parse } from "https://deno.land/std@0.138.0/datetime/mod.ts";

const PLACEMENTS = {
"rainbow-line-parking-lot-1-gate": {
    text: "レインボーライン 第一駐車場",
    targetObjects: ["Face", "LicensePlate"] as const as ObjectClass[],
},
"rainbow-line-parking-lot-2-gate": {
    text: "レインボーライン 第二駐車場",
    targetObjects: ["Face", "LicensePlate"] as const as ObjectClass[],
},
} as const;
type Placement = keyof typeof PLACEMENTS;

const OBJECT_CLASS = {
LicensePlate: "ナンバープレート",
} as const;
type ObjectClass = keyof typeof OBJECT_CLASS;

type AggregatedDataBase = {
placement: Placement;
"object class": ObjectClass;
"aggregate from": string;
"aggregate to": string;
"total count": number;
};

type AggregatedData = AggregatedDataBase & Record<string, string | number>;

const placement = "rainbow-line-parking-lot-2-gate";
const objectClass = "LicensePlate";
const date = {
from: new Date("2025-6-1"),
to: new Date("2025-6-19"),
};
const toDate = new Date(date.to);
toDate.setDate(toDate.getDate() + 1);

try {
let rawData = Object.values((await (await fetch(`https://ktxs4d484a.execute-api.ap-northeast-3.amazonaws.com/prod/?placement=${placement}&objectClass=${objectClass}&dateFrom=${date.from.getTime()}&dateTo=${toDate.getTime() - 1}&likelihoodThreshold=0.75&matchingAttributes=2`)).json() as {message: string, body: Record<string, AggregatedData>}).body);

console.log(rawData);

const csvData = convertToCSV(rawData);

// CSVファイルに保存
const filename = `license_plate_data_${format(date.from, "yyyyMMdd")}_to_${format(date.to, "yyyyMMdd")}.csv`;
Deno.writeTextFileSync(`./${filename}`, csvData);
console.log(`データをCSVファイルに保存しました: ./${filename}`);

} catch (e) {
console.log(`API error: ${e.message}`);
Deno.exit();
}

// CSVに変換する関数
function convertToCSV(data: AggregatedData[]): string {
    if (data.length === 0) return "";

    const csvHeader = "placement,object class,aggregate from,aggregate to,total count,Hokkaido PassengerCars,Hokkaido CommercialVehicle,Hokkaido RentACar,Hokkaido Other,Aomori PassengerCars,Aomori CommercialVehicle,Aomori RentACar,Aomori Other,Iwate PassengerCars,Iwate CommercialVehicle,Iwate RentACar,Iwate Other,Miyagi PassengerCars,Miyagi CommercialVehicle,Miyagi RentACar,Miyagi Other,Akita PassengerCars,Akita CommercialVehicle,Akita RentACar,Akita Other,Yamagata PassengerCars,Yamagata CommercialVehicle,Yamagata RentACar,Yamagata Other,Fukushima PassengerCars,Fukushima CommercialVehicle,Fukushima RentACar,Fukushima Other,Ibaraki PassengerCars,Ibaraki CommercialVehicle,Ibaraki RentACar,Ibaraki Other,Tochigi PassengerCars,Tochigi CommercialVehicle,Tochigi RentACar,Tochigi Other,Gunma PassengerCars,Gunma CommercialVehicle,Gunma RentACar,Gunma Other,Saitama PassengerCars,Saitama CommercialVehicle,Saitama RentACar,Saitama Other,Chiba PassengerCars,Chiba CommercialVehicle,Chiba RentACar,Chiba Other,Tokyo PassengerCars,Tokyo CommercialVehicle,Tokyo RentACar,Tokyo Other,Kanagawa PassengerCars,Kanagawa CommercialVehicle,Kanagawa RentACar,Kanagawa Other,Niigata PassengerCars,Niigata CommercialVehicle,Niigata RentACar,Niigata Other,Toyama PassengerCars,Toyama CommercialVehicle,Toyama RentACar,Toyama Other,Ishikawa PassengerCars,Ishikawa CommercialVehicle,Ishikawa RentACar,Ishikawa Other,Fukui PassengerCars,Fukui CommercialVehicle,Fukui RentACar,Fukui Other,Yamanashi PassengerCars,Yamanashi CommercialVehicle,Yamanashi RentACar,Yamanashi Other,Nagano PassengerCars,Nagano CommercialVehicle,Nagano RentACar,Nagano Other,Gifu PassengerCars,Gifu CommercialVehicle,Gifu RentACar,Gifu Other,Shizuoka PassengerCars,Shizuoka CommercialVehicle,Shizuoka RentACar,Shizuoka Other,Aichi PassengerCars,Aichi CommercialVehicle,Aichi RentACar,Aichi Other,Mie PassengerCars,Mie CommercialVehicle,Mie RentACar,Mie Other,Shiga PassengerCars,Shiga CommercialVehicle,Shiga RentACar,Shiga Other,Kyoto PassengerCars,Kyoto CommercialVehicle,Kyoto RentACar,Kyoto Other,Osaka PassengerCars,Osaka CommercialVehicle,Osaka RentACar,Osaka Other,Hyogo PassengerCars,Hyogo CommercialVehicle,Hyogo RentACar,Hyogo Other,Nara PassengerCars,Nara CommercialVehicle,Nara RentACar,Nara Other,Wakayama PassengerCars,Wakayama CommercialVehicle,Wakayama RentACar,Wakayama Other,Tottori PassengerCars,Tottori CommercialVehicle,Tottori RentACar,Tottori Other,Shimane PassengerCars,Shimane CommercialVehicle,Shimane RentACar,Shimane Other,Okayama PassengerCars,Okayama CommercialVehicle,Okayama RentACar,Okayama Other,Hiroshima PassengerCars,Hiroshima CommercialVehicle,Hiroshima RentACar,Hiroshima Other,Yamaguchi PassengerCars,Yamaguchi CommercialVehicle,Yamaguchi RentACar,Yamaguchi Other,Tokushima PassengerCars,Tokushima CommercialVehicle,Tokushima RentACar,Tokushima Other,Kagawa PassengerCars,Kagawa CommercialVehicle,Kagawa RentACar,Kagawa Other,Ehime PassengerCars,Ehime CommercialVehicle,Ehime RentACar,Ehime Other,Kochi PassengerCars,Kochi CommercialVehicle,Kochi RentACar,Kochi Other,Fukuoka PassengerCars,Fukuoka CommercialVehicle,Fukuoka RentACar,Fukuoka Other,Saga PassengerCars,Saga CommercialVehicle,Saga RentACar,Saga Other,Nagasaki PassengerCars,Nagasaki CommercialVehicle,Nagasaki RentACar,Nagasaki Other,Kumamoto PassengerCars,Kumamoto CommercialVehicle,Kumamoto RentACar,Kumamoto Other,Oita PassengerCars,Oita CommercialVehicle,Oita RentACar,Oita Other,Miyazaki PassengerCars,Miyazaki CommercialVehicle,Miyazaki RentACar,Miyazaki Other,Kagoshima PassengerCars,Kagoshima CommercialVehicle,Kagoshima RentACar,Kagoshima Other,Okinawa PassengerCars,Okinawa CommercialVehicle,Okinawa RentACar,Okinawa Other,Other PassengerCars,Other CommercialVehicle,Other RentACar,Other Other";

    let csvContent = csvHeader + "\n";

    // 都道府県と車両種別のリスト（ヘッダーのフィールド順に合わせるため）
    const headerFields = csvHeader.split(",");
    const prefectureFields = headerFields.slice(5); // 最初の5フィールド以降が都道府県データ

    // データ行の追加
    data.forEach(record => {
        // 基本情報
        let row = `${record.placement},${record["object class"]},${record["aggregate from"]},${record["aggregate to"]},${record["total count"]}`;
        
        // 都道府県ごとの車両種別データを追加（ヘッダーの順序に合わせる）
        prefectureFields.forEach(field => {
        row += `,${record[field] || 0}`;
        });
        
        csvContent += row + "\n";
    });

    return csvContent;
}