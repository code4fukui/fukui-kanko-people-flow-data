# Fukui Prefecture Tourism DX AI Camera Open Data

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

This repository publishes aggregated open data from AI cameras installed at key tourist locations in Fukui Prefecture, Japan. The data is regularly collected, processed, and released for public use and visualization.

## Visualization

A web application is available to visualize the people flow data.

- **[Visualization App](https://code4fukui.github.io/fukui-kanko-people-flow-visualization/)**
- **[Visualization App Source Code](https://github.com/code4fukui/fukui-kanko-people-flow-visualization)**

## About the Data

### Camera Locations

AI cameras are installed at the following key tourist locations in Fukui Prefecture:

- Fukui Station East Entrance
- Tojinbo Shopping Street
- Rainbow Line Summit Park (Parking Lot 1 & 2)

### Data Structure

The data is organized into directories based on the aggregation interval:

- `full/`: Complete aggregated CSV data, separated by location and detection target.
- `monthly/`: Data aggregated by day, organized by `location/target/year/month`.
- `daily/`: Data aggregated by hour, organized by `location/target/year/month/day`.
- `hourly/`: Data at 5-minute intervals, organized by `location/target/year/month/day/hour`.

### Data Format

The CSV files contain aggregated counts and attributes for three types of detected objects:

- **`Person`**: General person detection.
- **`Face`**: Face detection with estimated attributes like age and gender.
- **`LicensePlate`**: Vehicle license plate detection with estimated prefecture of origin and vehicle type.

## Data Availability and Limitations

Please consider the following points when analyzing the data.

### General Operation

- **Camera Hours**: All cameras operate 24/7, except during maintenance or equipment failures.
- **Zero Counts**: A value of `0` in the data indicates that no objects were detected within the camera's field of view during that interval. It does not necessarily mean the camera was offline.

### Detection-Specific Notes

- **Person Detection**: Provides the most consistent and reliable data for 24-hour people flow analysis.
- **Face Detection**: While operational 24/7, detection counts are significantly lower during early morning (before 8 AM) and late evening (after 7 PM). This is due to a combination of factors, including low-light conditions, reduced foot traffic, and physical obstructions (e.g., security shutters at Fukui Station). This data is most reliable for daytime analysis (approx. 8 AM to 6 PM).
- **License Plate Detection**: Available 24/7 when the camera system is operational.

### Known Issues and Data Gaps

- **Data Collection Start**: Data collection began on **December 20, 2024**. No data is available prior to this date.
- **System Outage**: A complete system outage occurred at all locations from **September 26-28, 2025**.
- **Equipment Failure**: The license plate detection camera at **Rainbow Line Parking Lot 1** experienced an equipment failure in early 2026. Data from this camera is mostly unavailable for **January-February 2026** and should be excluded from analysis for that period.

## Data Processing Tools

The `tools/` directory contains TypeScript scripts for processing and aggregating the raw data. These scripts are designed to be run with the [Deno runtime](https://deno.land/).

- `aggregate-day.deno.ts`, `aggregate-hour.deno.ts`, `aggregate5mins.deno.ts`: Aggregate raw data into daily, hourly, and 5-minute intervals.
- `csv2sqlite.deno.ts`: Convert CSV data files into SQLite databases.
- `check-csv.deno.ts`: Validate the format and integrity of CSV files.
- `license-plate-aggregation.deno.ts`: Aggregate license plate data.
- `escape-*.deno.ts`, `thin-out-*.deno.ts`: Utility scripts for cleaning and optimizing data.

## License

MIT License © 2024 Code for FUKUI