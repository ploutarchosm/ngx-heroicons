# @pms/ngx-heroicons

[Heroicons](https://heroicons.com) delivered as **tree-shakable, compiled standalone Angular components**.

Every icon is a real AOT-compiled Angular template — there is **no `innerHTML`, no `DomSanitizer` bypass, and no runtime fetch**. You import only the icons you use, so only those land in your bundle.

- ✅ **Security** — compiled templates, CSP-safe, no `innerHTML`.
- ✅ **Performance** — renders server-side (SSR/hydration friendly), zero network requests.
- ✅ **Bundle size** — only imported icons are shipped; the rest are tree-shaken away (`"sideEffects": false`).
- ✅ **DX** — `import` the icon, drop the component in. No asset copying, no `angular.json` changes.

All four variants are included: `outline` (24px), `solid` (24px), `mini` (20px), `micro` (16px) — 1,288 icons total.

---

## Install

```bash
npm install @pms/ngx-heroicons
```

## Usage — static (recommended)

The simplest, smallest, most secure path. Import the exact icon component(s) you need:

```ts
import { Component } from '@angular/core';
import { AcademicCapOutlineIcon, BeakerSolidIcon } from '@pms/ngx-heroicons';

@Component({
  selector: 'app-demo',
  imports: [AcademicCapOutlineIcon, BeakerSolidIcon],
  template: `
    <!-- decorative: hidden from screen readers automatically -->
    <pms-academic-cap-outline-icon />

    <!-- meaningful: pass a label -> role="img" + aria-label -->
    <pms-beaker-solid-icon [size]="32" label="Lab results" />
  `,
})
export class DemoComponent {}
```

**Selector pattern:** `pms-{icon-name}-{variant}-icon`
**Class name pattern:** `{IconName}{Variant}Icon` (e.g. `Bars3MiniIcon`, `Cog6ToothSolidIcon`).

### Inputs

| Input   | Type     | Default        | Notes                                                        |
| ------- | -------- | -------------- | ------------------------------------------------------------ |
| `size`  | `number` | variant size   | Pixel width/height override (24 / 20 / 16 by variant).       |
| `label` | `string` | `undefined`    | Provide for meaningful icons; omit for decorative ones.      |

Color is inherited via `currentColor`, so styling is just CSS:

```html
<pms-academic-cap-outline-icon class="text-emerald-600 hover:text-emerald-700" />
```

## Usage — dynamic name (optional)

When the icon is only known at runtime, register the ones you need and use the `<pms-heroicon>` host. Only registered icons are referenced, so tree-shaking still holds.

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import {
  provideHeroicons,
  CheckCircleSolidIcon,
  XCircleSolidIcon,
  ClockSolidIcon,
} from '@pms/ngx-heroicons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHeroicons({
      success: CheckCircleSolidIcon,
      error: XCircleSolidIcon,
      pending: ClockSolidIcon,
    }),
  ],
};
```

```ts
import { Heroicon } from '@pms/ngx-heroicons';

@Component({
  imports: [Heroicon],
  template: `<pms-heroicon [name]="status()" [size]="20" />`,
})
export class StatusComponent {
  status = signal<'success' | 'error' | 'pending'>('pending');
}
```

`provideHeroicons()` is a multi-provider, so feature areas can register their own icons independently. An unregistered name throws in dev mode and renders nothing in production.

---

## Regenerating the icon set

Icon components are generated from the `heroicons` package by `scripts/generate-icons.mjs`. To pull in a newer Heroicons release:

```bash
npm install -D heroicons@latest
npm run generate:icons   # wired as a prebuild step too
```

Wire it into the workspace `package.json`:

```jsonc
{
  "scripts": {
    "generate:icons": "node scripts/generate-icons.mjs",
    "prebuild": "npm run generate:icons",
    "build": "ng build ngx-heroicons"
  },
  "devDependencies": {
    "heroicons": "^2.0.0"
  }
}
```

`heroicons` is a **dev** dependency only — its SVGs are compiled into components at build time and never shipped to consumers.

## Why compiled components instead of a sprite / `<use>`?

| Concern      | This library (inline compiled)      | External `<use href="file.svg#id">`             |
| ------------ | ----------------------------------- | ----------------------------------------------- |
| Security     | No `innerHTML`, CSP-clean           | Runtime fetch; same-origin only                 |
| Performance  | No requests; SSR-rendered           | One request per file/sprite; empty until loaded |
| Bundle size  | Only used icons shipped             | Whole sprite served regardless of usage         |
| DX           | `import` + use                      | Copy assets + wire paths + match origin         |

The only thing the sprite approach wins on is raw DOM node count when rendering very large numbers of icon instances — not a concern for typical apps.

## License

Library code: MIT. Icons: [Heroicons MIT license](https://github.com/tailwindlabs/heroicons/blob/master/LICENSE).
