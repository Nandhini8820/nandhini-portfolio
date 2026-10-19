import type { ReactNode } from 'react';
import type { Experience as ExperienceItem } from '../../types/portfolio';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

/** Emphasizes the real figures already in the text, such as "20+", so achievements are easy to scan. */
export function emphasizeFigures(text: string): ReactNode[] {
  return text.split(/(\d+\+)/g).map((part, index) =>
    /^\d+\+$/.test(part) ? (
      <strong key={index} className="figure">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export function Experience({ experience }: { experience: ExperienceItem[] }) {
  return (
    <section id="experience" className="section section--tinted" aria-labelledby="experience-title">
      <div className="container">
        <SectionHeading id="experience" title="Experience" />
        <ol className="timeline">
          {experience.map((job, index) => (
            <Reveal as="li" key={job.id} className={`timeline__item ${index === 0 ? 'timeline__item--current' : ''}`}>
              <span className="timeline__node" aria-hidden="true" />
              <div className="timeline__meta">
                <p className="timeline__dates">
                  {job.start} – {job.end}
                </p>
                <p className="timeline__location">{job.location}</p>
              </div>
              <div className="timeline__body">
                <h3 className="timeline__company">{job.company}</h3>
                <p className="timeline__role">{job.role}</p>
                <ul className="timeline__highlights">
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{emphasizeFigures(highlight)}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
