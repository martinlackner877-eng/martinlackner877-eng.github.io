import { Component, ChangeDetectionStrategy, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgxTurnstileModule } from 'ngx-turnstile';
import { Content } from '../content';
import { Magnetic } from '../shared/directives/magnetic.directive';

/**
 * Kontaktformular, gleiche Technik wie bisher auf et-fit.at/dev:
 * POST an mail-dev.php, Cloudflare Turnstile (Widget „/dev“), Honeypot „bot-field“.
 * Voraussetzung am Server: github.io-Origin in allowed_origins, Hostname im Turnstile-Widget.
 */
const ENDPOINT = 'https://www.et-fit.at/mail-dev.php';
const SITE_KEY = '0x4AAAAAADt2dBu0Bm_syblC';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, NgxTurnstileModule, Magnetic],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h2 id="h-k">{{ c().title }}</h2>
      <p class="sub">{{ c().sub }}</p>
      @if (state() === 'sent') {
        <p class="ok" role="status">{{ c().sent }}</p>
      } @else {
        <label for="f-name">{{ c().name }}</label>
        <input id="f-name" formControlName="name" autocomplete="name" [attr.aria-invalid]="bad('name')" [attr.aria-describedby]="bad('name') ? 'e-name' : null" />
        @if (bad('name')) { <span class="err" id="e-name">{{ c().invalidName }}</span> }
        <label for="f-mail">{{ c().email }}</label>
        <input id="f-mail" type="email" formControlName="email" autocomplete="email" [attr.aria-invalid]="bad('email')" [attr.aria-describedby]="bad('email') ? 'e-mail' : null" />
        @if (bad('email')) { <span class="err" id="e-mail">{{ c().invalidEmail }}</span> }
        <label for="f-msg">{{ c().message }}</label>
        <textarea id="f-msg" formControlName="message" [attr.aria-invalid]="bad('message')" [attr.aria-describedby]="bad('message') ? 'e-msg' : null"></textarea>
        @if (bad('message')) { <span class="err" id="e-msg">{{ c().invalidMessage }}</span> }
        <input class="hp" formControlName="botField" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <ngx-turnstile [siteKey]="siteKey" (resolved)="token.set($event)" [theme]="theme()" />
        <button class="btn" appMagnetic type="submit" [disabled]="state() === 'sending'">{{ state() === 'sending' ? c().sending : c().send }}</button>
        @if (state() === 'error') { <p class="err" role="alert">{{ c().error }}</p> }
        @if (state() === 'captcha') { <p class="err" role="alert">{{ c().captcha }}</p> }
      }
      <div class="links"><a href="https://www.instagram.com/ma3t1n.2026/">Instagram</a><a href="https://www.linkedin.com/in/martinlac">LinkedIn</a><a href="https://github.com/martinlackner877-eng">GitHub</a><a href="https://www.strava.com/athletes/190064826">Strava</a></div>
    </form>
  `,
  styles: `
    .card { background: var(--bg); border-radius: 14px; padding: clamp(24px, 3vw, 44px); width: min(560px, 100%); display: grid; gap: 12px; }
    h2 { font-size: clamp(36px, 3.6vw, 56px); margin-bottom: 8px; }
    .sub { color: var(--muted); margin-bottom: 8px; }
    label { font-size: 13px; color: var(--muted); }
    input, textarea { width: 100%; min-height: 52px; border: 0; border-radius: 8px; background: var(--surface); color: var(--ink); font: 400 17px/1.3 var(--font); padding: 12px 16px; }
    textarea { min-height: 120px; resize: vertical; }
    input:focus, textarea:focus { outline: 2px solid var(--accent); outline-offset: 0; }
    [aria-invalid="true"] { outline: 2px solid var(--accent); }
    .hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
    .btn { justify-self: start; margin-top: 8px; }
    .err { font-size: 14px; color: var(--accent); }
    .ok { font-size: clamp(20px, 1.6vw, 24px); line-height: 1.3; }
    .links { display: flex; flex-wrap: wrap; gap: 8px 20px; font-size: 15px; margin-top: 8px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactForm {
  readonly c = input.required<Content['contact']>();
  readonly theme = input<'light' | 'dark'>('dark');
  readonly shipped = output<void>();
  private readonly http = inject(HttpClient);
  readonly siteKey = SITE_KEY;
  readonly token = signal<string | null>(null);
  readonly state = signal<'idle' | 'sending' | 'sent' | 'error' | 'captcha'>('idle');
  readonly tried = signal(false);

  readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
    botField: ['']
  });

  bad(k: 'name' | 'email' | 'message'): boolean { const f = this.form.controls[k]; return f.invalid && (f.touched || this.tried()); }

  submit(): void {
    this.tried.set(true);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.value.botField) return; // Honeypot: Bots füllen es aus, still verwerfen
    const token = this.token();
    if (!token) { this.state.set('captcha'); return; }
    this.state.set('sending');
    const { name, email, message } = this.form.getRawValue();
    this.http.post(ENDPOINT, { name, email, message, 'cf-turnstile-response': token }).subscribe({
      next: () => { this.state.set('sent'); this.form.reset(); this.shipped.emit(); },
      error: () => this.state.set('error')
    });
  }
}
