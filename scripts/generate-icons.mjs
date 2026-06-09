#!/usr/bin/env node
/**
 * generate-icons.mjs
 *
 * Reads the SVGs shipped by the `heroicons` npm package and emits one
 * standalone, AOT-compiled Angular component per icon (no innerHTML), plus
 * per-variant and root barrel files.
 *
 * Run it whenever you bump the `heroicons` dependency:
 *   node scripts/generate-icons.mjs
 *
 * It is wired into the library `prebuild` script in package.json.
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SELECTOR_PREFIX = 'pms';
const OUT_DIR = join(process.cwd(), 'projects/ngx-heroicons/src/lib/icons');

/** Maps our public variant name -> heroicons source folder + intrinsic size. */
const VARIANTS = [
  { name: 'outline', dir: '24/outline', size: 24 },
  { name: 'solid', dir: '24/solid', size: 24 },
  { name: 'mini', dir: '20/solid', size: 20 },
  { name: 'micro', dir: '16/solid', size: 16 },
];

// Attributes we never want copied onto the rendered <svg>.
const DROP_ATTRS = new Set(['xmlns', 'width', 'height', 'class', 'aria-hidden', 'data-slot', 'focusable']);
// Presentation attributes we keep (order is normalised below).
const KEEP_ORDER = ['viewBox', 'fill', 'stroke', 'stroke-width'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Locate the installed `heroicons` package root. */
function heroiconsRoot() {
  // package.json is at the package root.
  return dirname(require.resolve('heroicons/package.json'));
}

/** kebab-case -> PascalCase. e.g. "academic-cap" -> "AcademicCap", "bars-3" -> "Bars3". */
function pascalCase(kebab) {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** Parse a raw heroicons SVG into { attrs: Map, inner: string }. */
function parseSvg(raw) {
  const open = raw.match(/<svg\b([^>]*)>/);
  if (!open) throw new Error('No <svg> tag found');
  const inner = raw.slice(open.index + open[0].length, raw.lastIndexOf('</svg>')).trim();

  const attrs = new Map();
  const attrRe = /([:\w-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = attrRe.exec(open[1])) !== null) {
    if (!DROP_ATTRS.has(m[1])) attrs.set(m[1], m[2]);
  }
  return { attrs, inner };
}

/** Build the static portion of the <svg> opening tag from kept presentation attrs. */
function staticAttrs(attrs) {
  const parts = [];
  for (const key of KEEP_ORDER) {
    if (attrs.has(key)) parts.push(`      ${key}="${attrs.get(key)}"`);
  }
  // Anything kept that we didn't explicitly order (future-proofing).
  for (const [key, val] of attrs) {
    if (!KEEP_ORDER.includes(key)) parts.push(`      ${key}="${val}"`);
  }
  return parts.join('\n');
}

/** Generate the component source for one icon. */
function componentSource(icon) {
  const { className, selector, naturalSize, attrs, inner } = icon;
  return `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroiconBase } from '../../ngx-heroicons-base';

@Component({
  selector: '${selector}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<svg
      [attr.width]="dimension()"
      [attr.height]="dimension()"
      [attr.role]="role()"
      [attr.aria-label]="label() ?? null"
      [attr.aria-hidden]="ariaHidden()"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
${staticAttrs(attrs)}>
      ${inner}
    </svg>\`,
})
export class ${className} extends HeroiconBase {
  protected readonly naturalSize = ${naturalSize};
}
`;
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

function run() {
  const root = heroiconsRoot();
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const rootBarrel = [];
  let total = 0;

  for (const variant of VARIANTS) {
    const srcDir = join(root, variant.dir);
    const outDir = join(OUT_DIR, variant.name);
    mkdirSync(outDir, { recursive: true });

    const files = readdirSync(srcDir).filter((f) => f.endsWith('.svg')).sort();
    const variantBarrel = [];

    for (const file of files) {
      const iconName = file.replace(/\.svg$/, '');
      const className = `${pascalCase(iconName)}${pascalCase(variant.name)}Icon`;
      const selector = `${SELECTOR_PREFIX}-${iconName}-${variant.name}-icon`;
      const { attrs, inner } = parseSvg(readFileSync(join(srcDir, file), 'utf8'));

      writeFileSync(
        join(outDir, `${iconName}.icon.ts`),
        componentSource({ className, selector, naturalSize: variant.size, attrs, inner }),
      );
      variantBarrel.push(`export * from './${iconName}.icon';`);
      total++;
    }

    writeFileSync(join(outDir, 'index.ts'), variantBarrel.join('\n') + '\n');
    rootBarrel.push(`export * from './${variant.name}';`);
  }

  writeFileSync(join(OUT_DIR, 'index.ts'), rootBarrel.join('\n') + '\n');
  console.log(`Generated ${total} icon components across ${VARIANTS.length} variants.`);
}

run();
