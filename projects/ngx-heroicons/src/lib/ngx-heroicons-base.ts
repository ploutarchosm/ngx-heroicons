import { Directive, computed, input } from '@angular/core';

/**
 * Shared logic for every generated Heroicon component.
 *
 * Generated components extend this class, set `naturalSize`, and provide the
 * compiled SVG template. No `innerHTML` is used anywhere — every icon is a
 * fully AOT-compiled Angular template, which keeps the rendering CSP-safe and
 * free of `DomSanitizer` bypasses.
 */
@Directive()
export abstract class HeroiconBase {
  /**
   * The icon's intrinsic pixel size for its variant
   * (24 for outline/solid, 20 for mini, 16 for micro).
   * Set by each generated subclass.
   */
  protected abstract readonly naturalSize: number;

  /** Optional pixel size override. Falls back to the icon's natural size. */
  readonly size = input<number>();

  /**
   * Accessible label. When provided, the icon is exposed to assistive tech as
   * an image (`role="img"` + `aria-label`). When omitted, the icon is treated
   * as decorative and hidden from screen readers (`aria-hidden="true"`).
   */
  readonly label = input<string>();

  protected readonly dimension = computed(() => this.size() ?? this.naturalSize);
  protected readonly role = computed<string | null>(() => (this.label() ? 'img' : null));
  protected readonly ariaHidden = computed<string | null>(() =>
    this.label() ? null : 'true',
  );
}