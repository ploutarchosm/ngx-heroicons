import { InjectionToken, Provider, Type } from '@angular/core';
import { HeroiconBase } from './ngx-heroicons-base';

/** A map of string keys to icon components, used by the dynamic `<pms-heroicon>` host. */
export type HeroiconRegistry = Record<string, Type<HeroiconBase>>;

/**
 * Multi-provider token. Each `provideHeroicons()` call contributes one map;
 * the host merges them, so different features can register their own icons
 * independently.
 */
export const HEROICONS = new InjectionToken<HeroiconRegistry[]>('NGX_HEROICONS');

/**
 * Register icons for use with the dynamic `<pms-heroicon name="...">` host.
 *
 * Only the icons you pass here are referenced, so unused icons are still
 * tree-shaken out of your bundle.
 *
 * @example
 * ```ts
 * import { AcademicCapOutlineIcon, BeakerSolidIcon } from '@pms/ngx-heroicons';
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideHeroicons({
 *       'academic-cap': AcademicCapOutlineIcon,
 *       'beaker': BeakerSolidIcon,
 *     }),
 *   ],
 * });
 * ```
 */
export function provideHeroicons(icons: HeroiconRegistry): Provider {
  return { provide: HEROICONS, useValue: icons, multi: true };
}