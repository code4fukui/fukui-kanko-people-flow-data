# Fukui Tourism DX AI Camera Open Data
日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

This repository publishes aggregated open data from AI cameras installed at major tourist locations in Fukui Prefecture, Japan.

[Visualization App](https://code4fukui.github.io/fukui-kanko-people-flow-visualization/)
[Visualization App Source Code](https://github.com/code4fukui/fukui-kanko-people-flow-visualization)

## Read This First

- Full technical documentation (English): [README.en.md](README.en.md)
- Full technical documentation (Japanese): [README.ja.md](README.ja.md)

## Important Data Caveats

- `0` counts usually mean “no detection in field of view”, not necessarily camera offline
- Face detection is less reliable before 08:00 and after 19:00
- For 24-hour analysis, use `Person` data as the primary signal
- Known outage periods and hardware issues are documented in [README.en.md](README.en.md) and [README.ja.md](README.ja.md)

## License

MIT License © 2024 Code for FUKUI
