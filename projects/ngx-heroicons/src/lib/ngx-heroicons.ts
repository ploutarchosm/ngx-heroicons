import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Type,
  computed,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import { HeroiconBase } from './ngx-heroicons-base';
import { HEROICONS, HeroiconRegistry } from './ngx-heroicons-provide';

/**
 * Dynamic host for cases where the icon name is only known at runtime
 * (e.g. `[name]="row.statusIcon"`).
 *
 * It renders a registered icon component via `NgComponentOutlet`, so there is
 * still no `innerHTML` and unregistered icons are never bundled. For the simple
 * static case, prefer importing the icon component directly
 * (`<pms-academic-cap-outline-icon />`).
 */
@Component({
  selector: 'pms-ngx-heroicon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  template: `
    @if (component(); as cmp) {
      <ng-container [ngComponentOutlet]="cmp" [ngComponentOutletInputs]="inputs()" />
    }
  `,
})
export class Heroicon {
  private readonly registry: HeroiconRegistry = Object.assign(
    {},
    ...(inject(HEROICONS, { optional: true }) ?? []),
  );

  /** The registry key of the icon to render. */
  readonly name = input.required<string>();
  /** Optional pixel size override, forwarded to the icon. */
  readonly size = input<number>();
  /** Optional accessible label, forwarded to the icon. */
  readonly label = input<string>();

  protected readonly component = computed<Type<HeroiconBase> | null>(() => {
    const cmp = this.registry[this.name()];
    if (!cmp) {
      if (isDevMode()) {
        throw new Error(
          `[ngx-heroicons] Icon "${this.name()}" is not registered. ` +
            `Add it with provideHeroicons({ '${this.name()}': <IconComponent> }).`,
        );
      }
      return null;
    }
    return cmp;
  });

  protected readonly inputs = computed(() => ({
    size: this.size(),
    label: this.label(),
  }));
}