# Change Log

All notable changes to the "package-update-notify" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.2.0] - 2025-05-30

### Changed

- **BREAKING CHANGE**: Changed detection mechanism from extracting time strings in JS files to calculating SHA256 hash of HTML content
- Improved type safety: `timer` type changed to `ReturnType<typeof setInterval>` for better cross-platform compatibility
- Improved type safety: `hasError` now uses `Set<string>` generic type
- Improved type safety: `formatTime()` now accepts `Date` instead of `string`
- Added backward compatibility: automatically detects and migrates old version data (time strings) without false update notifications
- Updated state storage: now stores SHA256 hash and ISO timestamp separately
- Simplified README documentation

## [0.1.4] - 2025-01-22

### Added

- Add logo

### Changed

- update README.md
- The error message is displayed only once.

## [0.1.3] - 2025-01-03

### Fixed

- Date is single number.

## [0.1.2] - 2024-12-24

### Added

- Add language config.

## [0.1.1] - 2024-12-23

### Fixed

- Show the message on the title, not a button.