# Fukui Prefecture Tourism DX AI Camera Open Data

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

This repository publishes aggregated open data from AI cameras installed at key tourist locations in Fukui Prefecture, Japan. Data is regularly collected, processed, and released for public use and visualization.

## Visualization

A web application is available to visualize the people flow data.

- **[Visualization App](https://code4fukui.github.io/fukui-kanko-people-flow-visualization/)**
- **[Visualization App Source Code](https://github.com/code4fukui/fukui-kanko-people-flow-visualization)**

## Camera Locations

AI cameras are installed at the following key tourist locations in Fukui Prefecture:

- Fukui Station East Entrance
- Tojinbo Cliffs
- Rainbow Line Summit Park (Parking Lot 1 & 2)

## Directory Structure

- `full/`: Complete aggregated CSV data, separated by location and detection target.
- `monthly/`: Data aggregated by day, organized by `location/target/year/month`.
- `daily/`: Data aggregated by hour, organized by `location/target/year/month/day`.
- `hourly/`: Data at 5-minute intervals, organized by `location/target/year/month/day/hour`.
- `tools/`: TypeScript scripts for data aggregation and processing (run with Deno).

## Data Processing Tools

Scripts in the `tools/` directory (run with Deno):

- `aggregate-day.deno.ts`, `aggregate-hour.deno.ts`, `aggregate5mins.deno.ts`: Aggregate raw CSV data into daily, hourly, and 5-minute intervals.
- `csv2sqlite.deno.ts`: Convert CSV data to SQLite databases.
- `check-csv.deno.ts`: Validate CSV files for errors or warnings.
- `escape-age-data.deno.ts`, `escape-movement-data.deno.ts`: Fix formatting issues in age and movement data.
- `license-plate-aggregation.deno.ts`: Aggregate license plate data from parking lots.
- `thin-out-to-one-second-interval.deno.ts`: Reduce movement data to one-second intervals.

## Data Format

CSV files contain aggregated counts and attributes for three types of detected objects:

- **`Person`**: General person detection.
- **`Face`**: Face detection with estimated attributes like age and gender.
- **`LicensePlate`**: Vehicle license plate detection with estimated prefecture of origin and vehicle type.

## Data Availability and Limitations

### General Operation

- **Camera Hours**: All cameras operate 24/7, except during maintenance or equipment failures.
- **Zero Counts**: A value of `0` in the data indicates that no objects were detected within the camera's field of view during that interval. It does not necessarily mean the camera was offline.

### Detection-Specific Notes

- **Face Detection**: Operates 24/7 but with significantly lower detection counts during early morning (before 8 AM) and late evening (after 7 PM). This is due to several factors:
  - Outdoor lighting conditions greatly affect facial recognition accuracy.
  - At Fukui Station East Entrance, security shutters are lowered outside business hours, limiting camera field of view.
  - The detection algorithm naturally has lower sensitivity in low-light conditions.
  - Actual visitor volumes are much lower during these periods.
  - Despite lower counts, the camera is still recording and processing faces.
- **Person Detection**: Available 24/7 with consistent detection capability across all hours. More reliable than Face detection for complete 24-hour analysis.
- **License Plate Detection**: Available 24/7 when the camera system is operational.

### Data Characteristics

- All detection types operate continuously 24/7 (except during maintenance or known outages).
- Face Detection shows natural variation throughout the day:
  - Very low detections: 12:00 AM - 8:00 AM (averaging <100 detections/hour at Fukui Station).
  - Peak detections: 11:00 AM - 5:00 PM (averaging >12,000 detections/hour at Fukui Station).
  - Lower detections: 7:00 PM - 11:00 PM (averaging <500 detections/hour).
- Person Detection shows more consistent 24-hour coverage with reasonable detection counts across all hours.
- The data reflects actual visitor patterns with peak activity during business hours and tourist season.
- Hourly data is provided at 5-minute intervals for detailed temporal analysis.

## Known Issues and Data Gaps

- **Data Collection Start**: Data collection began on **December 20, 2024**. No data is available prior to this date.
- **System Outage**: A complete system outage occurred at all locations from **September 26-28, 2025**.
- **Equipment Failure**: The license plate detection camera at **Rainbow Line Parking Lot 1** experienced operational issues (specific dates pending documentation).

## License

This project is licensed under the terms of the [MIT license](LICENSE).
