import { Component, computed, signal, WritableSignal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

interface Language {
  code: string;
  label: string;
  name: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent {
  // Languages as a signal
  languages: Signal<Language[]> = signal([
    { code: 'pt', label: '🇵🇹', name: 'Português' },
    { code: 'en', label: '🇬🇧', name: 'English' },
    { code: 'fr', label: '🇫🇷', name: 'Français' }
  ]);

  // Current language as a writable signal
  currentLang: WritableSignal<string> = signal('pt');

  // Computed signals for current language details
  currentLanguageData: Signal<Language | undefined> = computed(() => {
    const current = this.currentLang();
    return this.languages().find(lang => lang.code === current);
  });

  currentLanguageName: Signal<string> = computed(() => {
    return this.currentLanguageData()?.name || 'Português';
  });

  currentLanguageFlag: Signal<string> = computed(() => {
    return this.currentLanguageData()?.label || '🇵🇹';
  });

  constructor(private translate: TranslateService) {
    // Initialize current language from translate service
    const initialLang = this.translate.currentLang || this.translate.getDefaultLang() || 'pt';
    this.currentLang.set(initialLang);
    
    // Listen to language changes
    this.translate.onLangChange.subscribe(event => {
      this.currentLang.set(event.lang);
    });
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    console.log(`🌍 Language switched to: ${lang}`);
  }

  // Helper method to check if a language is currently active
  isActive(langCode: string): boolean {
    return this.currentLang() === langCode;
  }
}
