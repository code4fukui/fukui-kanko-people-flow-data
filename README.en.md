# Fukui Prefecture Tourism DX AI Camera Open Data

This repository publishes aggregated open data from AI cameras installed at key tourist locations in Fukui Prefecture, Japan. Data is regularly collected, processed, and released for public use and visualization.

[Visualization App](https://code4fukui.github.io/fukui-kanko-people-flow-visualization/)
[Visualization App Source Code](https://github.com/code4fukui/fukui-kanko-people-flow-visualization)

## Camera Locations

AI cameras are installed at key tourist locations in Fukui Prefecture:
- Fukui Station East Entrance
- Tojinbo Shopping Street
- Rainbow Line Summit Park (Parking Lot 1 & 2)

## Directory Structure

- `full/`: Aggregated CSV data per location and detection target
- `monthly/`: Data aggregated by day (daily aggregates; organized by location, target, year, month)
- `daily/`: Data aggregated by hour (hourly aggregates; organized by location, target, year, month, day)
- `hourly/`: Data at 5-minute intervals (not hourly aggregates; organized by location, target, year, month, day, hour)
- `tools/`: TypeScript scripts for data aggregation and processing (run with Deno)

## Data Processing Tools

Scripts in the `tools/` directory (run with Deno):
- `aggregate-day.deno.ts`, `aggregate-hour.deno.ts`, `aggregate5mins.deno.ts`: Aggregate raw CSV data into daily, hourly, and 5-minute intervals
- `csv2sqlite.deno.ts`: Convert CSV data to SQLite databases
- `check-csv.deno.ts`: Validate CSV files for errors or warnings
- `escape-age-data.deno.ts`, `escape-movement-data.deno.ts`: Fix formatting issues in age and movement data
- `license-plate-aggregation.deno.ts`: Aggregate license plate data from parking lots
- `thin-out-to-one-second-interval.deno.ts`: Reduce movement data to one-second intervals

## Data Format

CSV files contain aggregated counts and attributes for detected objects (Person, Face, LicensePlate), including age, gender, prefecture, and movement.

## Data Availability and Limitations

**Camera Operating Hours:**
- All cameras operate 24/7 (except during maintenance or equipment failures)
- Zero counts in the data indicate no objects detected within the camera's field of view, not necessarily that the camera was offline

**Detection-Specific Notes:**
- **Face Detection**: Operates 24/7 but with significantly lower detection counts during early morning (before 8 AM) and late evening (after 7 PM). This is due to several factors:
  - Outdoor lighting conditions greatly affect facial recognition accuracy
  - At Fukui Station East Entrance, security shutters are lowered outside business hours, limiting camera field of view
  - The detection algorithm naturally has lower sensitivity in low-light conditions
  - Actual visitor volumes are much lower during these periods
  - Despite lower counts, the camera is still recording and processing faces
- **Person Detection**: Available 24/7 with consistent detection capability across all hours. More reliable than Face detection for complete 24-hour analysis.
- **License Plate Detection**: Available 24/7 when cameras are operational (see known issues for current status)

**Data Characteristics:**
- All detection types operate continuously 24/7 (except during maintenance or known outages)
- Face Detection shows natural variation throughout the day:
  - Very low detections: 12:00 AM - 8:00 AM (averaging <100 detections/hour at Fukui Station)
  - Peak detections: 11:00 AM - 5:00 PM (averaging >12,000 detections/hour at Fukui Station)
  - Lower detections: 7:00 PM - 11:00 PM (averaging <500 detections/hour)
- Person Detection shows more consistent 24-hour coverage with reasonable detection counts across all hours
- The data reflects actual visitor patterns with peak activity during business hours and tourist season
- Hourly data is provided at 5-minute intervals for detailed temporal analysis
- **Data Collection Start**: Collection began December 20, 2024. Data prior to this date is unavailable.
- **System Outages**: 
  - September 26-28, 2025: Complete system outage across all locations
  - Various scattered outages throughout 2025
- **Equipment Failure - Rainbow Line Parking Lot 1**: License plate detection camera experienced equipment failure in early 2026. The camera system is currently undergoing repairs. License plate data from this location is mostly unavailable during January-February 2026.
- **Field of View**: Camera placement may result in portions of locations being outside the field of view, affecting detection accuracy in those areas.

**Recommendations for Data Analysis:**
- For comprehensive 24-hour people flow analysis, prioritize **Person Detection** over Face Detection, as it has more consistent 24/7 coverage
- Zero values should be interpreted as "no detections in field of view" rather than camera malfunction (except during known outage periods)
- Face Detection is suitable for daytime and afternoon analysis (approximately 8 AM - 6 PM) when detection counts are reliable
- Face detection counts are significantly lower during early morning (before 8 AM) and late evening (after 7 PM) due to reduced lighting and lower foot traffic, but the camera is still operational
- When analyzing data, account for the known outages and equipment issues mentioned above
- License plate data from Rainbow Line Parking Lot 1 should be excluded from analysis during January-February 2026
- Person Detection data is the most reliable for temporal visitor pattern analysis across all hours

## License

MIT License © 2024 Code for FUKUI
