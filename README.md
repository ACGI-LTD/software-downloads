# ACGI Software Downloads

Official downloads from ACGI LTD.

| Product | Platform | Version | Download |
| --- | --- | --- | --- |
| ACGI 360 | Windows | 1.1.1 | [Download ZIP](https://github.com/ACGI-LTD/software-downloads/releases/download/downloads/ACGI-360-Windows.zip) |
| ACGI 360 | Mac, Apple Silicon | 1.1.1 | [Download DMG](https://github.com/ACGI-LTD/software-downloads/releases/download/downloads/ACGI-360-Mac-Apple-Silicon.dmg) · [Download PKG](https://github.com/ACGI-LTD/software-downloads/releases/download/downloads/ACGI-360-Mac-Apple-Silicon.pkg) |
| ACGI 360 | Mac, Intel | 1.1.1 | [Download DMG](https://github.com/ACGI-LTD/software-downloads/releases/download/downloads/ACGI-360-Mac-Intel.dmg) · [Download PKG](https://github.com/ACGI-LTD/software-downloads/releases/download/downloads/ACGI-360-Mac-Intel.pkg) |

ACGI 360 is a panorama viewer with self-contained HTML export. On Windows, extract the ZIP and run **ACGI 360.exe**. On Mac, open the DMG and drag **ACGI 360.app** to Applications, or run the PKG installer. The Mac installers were tested on Apple Silicon and Intel GitHub-hosted Mac runners. They are not signed with an Apple Developer ID or notarized; if macOS blocks the installer or app, open System Settings → Privacy & Security and use **Open Anyway** after the first attempt.

[ACGI Software Solutions](https://www.acgi.site/software-solutions)

## Downloads and updates

The **downloads** release holds current public builds. Each product has a distinct asset name so website download links remain the same when builds are updated. Product assets are in the assets folder.

The [Mac installer workflow](.github/workflows/mac-installers.yml) runs only when started manually. It checks the pinned SHA-256 hashes of the published DMGs, tests the apps on native Apple Silicon and Intel runners, preserves and smoke-tests the DMGs, builds and tests PKG installers, and saves both formats as workflow artifacts. Its **publish** option defaults to off; turning it on replaces only the four Mac installer assets after both architectures pass. Update the pinned DMG hashes when the source downloads change.

This repository distributes compiled applications and product assets. No open-source license is granted by making these downloads available.
