# Dependency and licence inventory

Runtime: Node 24.11.0, npm 11.6.1, PostgreSQL 18.6. Exact versions are pinned in the runtime files and npm lockfile. Registry metadata was checked on 2026-09-08. There are no runtime AI services or remote fonts.

Direct runtime packages: pg 8.23.0, sharp 0.35.4, pdf-lib 1.17.1. Direct development packages: Playwright 1.63.0, axe-core/playwright 4.13.0 and Prettier 3.9.6.

The following inventory is generated from the installed package manifests. Preserve upstream licence notices when redistributing dependencies. No proprietary project ownership or open-source licence is invented by this inventory.

| Package | Version | Licence |
|---|---|---|
| @axe-core/playwright | 4.13.0 | MPL-2.0 |
| @emnapi/runtime | 1.11.3 | MIT |
| tslib | 2.8.1 | 0BSD |
| @img/colour | 1.1.0 | MIT |
| @img/sharp-darwin-arm64 | 0.35.4 | Apache-2.0 |
| @img/sharp-darwin-x64 | 0.35.4 | Apache-2.0 |
| @img/sharp-freebsd-wasm32 | 0.35.4 | Apache-2.0 |
| @img/sharp-libvips-darwin-arm64 | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-libvips-darwin-x64 | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-arm | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-arm64 | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-ppc64 | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-riscv64 | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-s390x | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-libvips-linux-x64 | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-libvips-linuxmusl-arm64 | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-libvips-linuxmusl-x64 | 1.3.3 | LGPL-3.0-or-later |
| @img/sharp-linux-arm | 0.35.4 | Apache-2.0 |
| @img/sharp-linux-arm64 | 0.35.4 | Apache-2.0 |
| @img/sharp-linux-ppc64 | 0.35.4 | Apache-2.0 |
| @img/sharp-linux-riscv64 | 0.35.4 | Apache-2.0 |
| @img/sharp-linux-s390x | 0.35.4 | Apache-2.0 |
| @img/sharp-linux-x64 | 0.35.4 | Apache-2.0 |
| @img/sharp-linuxmusl-arm64 | 0.35.4 | Apache-2.0 |
| @img/sharp-linuxmusl-x64 | 0.35.4 | Apache-2.0 |
| @img/sharp-wasm32 | 0.35.4 | Apache-2.0 AND LGPL-3.0-or-later AND MIT |
| @img/sharp-webcontainers-wasm32 | 0.35.4 | Apache-2.0 |
| @img/sharp-win32-arm64 | 0.35.4 | Apache-2.0 AND LGPL-3.0-or-later |
| @img/sharp-win32-ia32 | 0.35.4 | Apache-2.0 AND LGPL-3.0-or-later |
| @img/sharp-win32-x64 | 0.35.4 | Apache-2.0 AND LGPL-3.0-or-later |
| @pdf-lib/standard-fonts | 1.0.0 | MIT |
| @pdf-lib/upng | 1.0.1 | MIT |
| @playwright/test | 1.63.0 | Apache-2.0 |
| axe-core | 4.13.0 | MPL-2.0 |
| detect-libc | 2.1.2 | Apache-2.0 |
| pako | 1.0.11 | (MIT AND Zlib) |
| pdf-lib | 1.17.1 | MIT |
| pg | 8.23.0 | MIT |
| pg-cloudflare | 1.4.0 | MIT |
| pg-connection-string | 2.14.0 | MIT |
| pg-int8 | 1.0.1 | ISC |
| pg-pool | 3.14.0 | MIT |
| pg-protocol | 1.16.0 | MIT |
| pg-types | 2.2.0 | MIT |
| pgpass | 1.0.5 | MIT |
| playwright | 1.63.0 | Apache-2.0 |
| playwright-core | 1.63.0 | Apache-2.0 |
| postgres-array | 2.0.0 | MIT |
| postgres-bytea | 1.0.1 | MIT |
| postgres-date | 1.0.7 | MIT |
| postgres-interval | 1.2.0 | MIT |
| prettier | 3.9.6 | MIT |
| semver | 7.8.5 | ISC |
| sharp | 0.35.4 | Apache-2.0 |
| split2 | 4.2.0 | ISC |
| tslib | 1.14.1 | 0BSD |
| xtend | 4.0.2 | MIT |

Official references used for implementation: PostgreSQL RLS/privileges (https://www.postgresql.org/docs/current/ddl-rowsecurity.html), Sharp decoding (https://sharp.pixelplumbing.com/api-constructor/), Playwright assertions (https://playwright.dev/docs/test-assertions), and OpenStreetMap tile policy (https://operations.osmfoundation.org/policies/tiles/).
