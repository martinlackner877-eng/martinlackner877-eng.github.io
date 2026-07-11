import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MotionService } from '../../../core/motion.service';
import { TransitionService } from '../../../core/transition.service';
import { PROJECTS, MORE_PROJECTS, Project } from '../../../data/portfolio.data';
import { Magnetic } from '../../../shared/directives/magnetic.directive';
import { Tilt } from '../../../shared/directives/tilt.directive';
import { Scramble } from '../../../shared/directives/scramble.directive';
import { TextReveal } from '../../../shared/directives/text-reveal.directive';

/**
 * Kapitel 03 — „Beweis": Projekt-Showcase. Die Visual-Karte neigt sich
 * zur Maus (Tilt + Spotlight), Parallax-Ebenen über data-speed,
 * der Case-CTA führt choreografiert auf die Detailseite.
 */
@Component({
  selector: 'app-work-section',
  imports: [Magnetic, Tilt, Scramble, TextReveal],
  templateUrl: './work.html',
  styleUrl: './work.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkSection {
  private motion = inject(MotionService);
  private transition = inject(TransitionService);

  readonly projects = PROJECTS;
  readonly moreProjects = MORE_PROJECTS;

  openCase(project: Project): void {
    if (!project.case) return;
    void this.transition.navigate('/work/' + project.slug);
  }

  goContact(event: Event): void {
    event.preventDefault();
    this.motion.scrollTo('#contact');
  }
}
