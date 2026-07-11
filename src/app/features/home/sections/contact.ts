import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CONTACT } from '../../../data/portfolio.data';
import { Magnetic } from '../../../shared/directives/magnetic.directive';
import { Scramble } from '../../../shared/directives/scramble.directive';
import { TextReveal } from '../../../shared/directives/text-reveal.directive';
import { Marquee } from '../../../shared/components/marquee';

/**
 * Kapitel 06 — „Kontakt": Riesige Headline rollt char-weise ein,
 * die E-Mail ist ein übergroßer magnetischer Pill-Button,
 * darunter ein ruhiges Verfügbarkeits-Band.
 */
@Component({
  selector: 'app-contact-section',
  imports: [Magnetic, Scramble, TextReveal, Marquee],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSection {
  readonly contact = CONTACT;
  readonly availability = ['Offen für neue Projekte', 'Security × Code × AI × Design', 'Kärnten · Österreich'];
}
