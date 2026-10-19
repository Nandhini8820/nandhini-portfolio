import type { Education as EducationItem, Recognition as RecognitionItem } from '../../types/portfolio';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export function Recognition({ items }: { items: RecognitionItem[] }) {
  return (
    <section id="recognition" className="section section--compact" aria-labelledby="recognition-title">
      <div className="container">
        <SectionHeading id="recognition" title="Recognition" />
        <div className="award-list">
          {items.map((item) => (
            <Reveal key={item.title} className="award">
              <svg className="award__icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                <circle cx="24" cy="19" r="12" />
                <path d="M17 29l-4 14 11-6 11 6-4-14" />
              </svg>
              <div>
                <h3 className="award__title">{item.title}</h3>
                <p className="award__description">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Education({ items }: { items: EducationItem[] }) {
  return (
    <section id="education" className="section section--compact section--tinted" aria-labelledby="education-title">
      <div className="container">
        <SectionHeading id="education" title="Education" />
        {items.map((item) => (
          <Reveal key={item.institution} className="education">
            <div className="education__main">
              <h3 className="education__degree">{item.degree}</h3>
              <p className="education__institution">
                {item.institution}, {item.location}
              </p>
            </div>
            <dl className="education__facts">
              <div>
                <dt>Dates</dt>
                <dd>
                  {item.start} – {item.end}
                </dd>
              </div>
              <div>
                <dt>Result</dt>
                <dd>{item.grade}</dd>
              </div>
            </dl>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
