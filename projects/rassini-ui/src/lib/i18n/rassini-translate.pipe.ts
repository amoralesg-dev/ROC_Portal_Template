import { Pipe, PipeTransform, inject } from '@angular/core';
import { RassiniI18nService } from './rassini-i18n.service';

@Pipe({
  name: 'ruiTranslate',
  standalone: true,
  pure: false
})
export class RassiniTranslatePipe implements PipeTransform {
  private readonly i18n = inject(RassiniI18nService);

  transform(key: string, defaultValue?: string): string {
    return this.i18n.translate(key, defaultValue);
  }
}
