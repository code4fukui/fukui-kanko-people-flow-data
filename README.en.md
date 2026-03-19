# Fukui Tourism DX AI Camera Open Data
日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

This repository publishes aggregated data from AI cameras installed at major tourist locations in Fukui Prefecture, Japan. The data is collected and processed regularly, then provided as open data.

[Visualization App](https://code4fukui.github.io/fukui-kanko-people-flow-visualization/)
[Visualization App Source Code](https://github.com/code4fukui/fukui-kanko-people-flow-visualization)

## Installation Locations

AI cameras are installed at the following major tourist locations in Fukui Prefecture:
- Fukui Station East Entrance
- Tojinbo Shopping Street
- Rainbow Line Summit Park Parking Lot 1 and 2

## Directory Structure

- `full/`: Aggregated CSV data by location and detection target
- `monthly/`: Daily aggregated data (location, target, year, month, day)
- `daily/`: Hourly aggregated data (location, target, year, month, day, hour)
- `hourly/`: 5-minute interval data (location, target, year, month, day, hour, 5-minute slot)
- `tools/`: Deno TypeScript scripts for aggregation and processing

## Data Processing Tools

Scripts in `tools/` (run with Deno):
- `aggregate-day.deno.ts`, `aggregate-hour.deno.ts`, `aggregate5mins.deno.ts`: Aggregate raw CSV into day/hour/5-minute datasets
- `csv2sqlite.deno.ts`: Convert CSV data to SQLite database format
- `check-csv.deno.ts`: Validate CSV files
- `escape-age-data.deno.ts`, `escape-movement-data.deno.ts`: Normalize and repair age/movement fields
- `license-plate-aggregation.deno.ts`: Aggregate parking lot license plate data
- `thin-out-to-one-second-interval.deno.ts`: Thin movement data to 1-second intervals

## Data Format

CSV files include counts and attributes for detected objects (`Person`, `Face`, `LicensePlate`), including fields such as age, gender, prefecture, and movement.

## Data Availability and Limitations

### Camera Operation
- Cameras are designed to run 24 hours (except maintenance or failures)
- A value of `0` does **not** necessarily mean the camera was offline; it usually means no target was detected within the field of view

### Detection-Type Characteristics
- **Face detection** is processed 24 hours, but counts are much lower before 08:00 and after 19:00 due to lighting and environment
- In some locations (for example around Fukui Station), shutters and physical obstructions can reduce visible area outside business hours
- **Person detection** is generally more consistent for full-day analysis
- **License plate detection** is available while related devices are operating (see known issues)

### Data Characteristics
- Data reflects real visitor behavior with peak periods by business hours and tourism seasons
- 5-minute interval data is provided for high-resolution time-series analysis

### Known Issues
- Data collection started on 2024-12-20; no data exists before this date
- Full system outage: 2025-09-26 to 2025-09-28 (all locations)
- Additional intermittent outages occurred in 2025
- Rainbow Line Parking Lot 1 license-plate camera had hardware failure in early 2026; data is mostly unavailable for 2026-01 to 2026-02

## Recommended Analysis Practices

- For 24-hour people-flow analysis, prioritize **Person** over **Face**
- Interpret `0` values as “no detection in field of view” except known outage windows
- Face data is more reliable during daytime (around 08:00-18:00)
- For Rainbow Line Parking Lot 1 license-plate analysis, exclude the period 2026-01 to 2026-02

## License

MIT License © 2024 Code for FUKUI
