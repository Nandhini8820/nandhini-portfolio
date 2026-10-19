import type { FamiliarWith, SkillGroup } from '../../types/portfolio';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

interface SkillsProps {
  skills: SkillGroup[];
  familiarWith: FamiliarWith;
}

export function Skills({ skills, familiarWith }: SkillsProps) {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading
          id="skills"
          title="Skills"
          intro="From the database up to the interface, plus the tests and tooling that keep releases dependable."
        />
        <div className="skills-grid">
          {skills.map((group, index) => (
            <Reveal key={group.category} className="skill-group" delay={(index % 4) * 60}>
              <h3 className="skill-group__title">{group.category}</h3>
              <ul className="skill-group__list" aria-label={`${group.category} skills`}>
                {group.items.map((item) => (
                  <li key={item} className="skill-chip">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {familiarWith.items.length > 0 ? (
          <Reveal className="familiar">
            <div className="familiar__text">
              <h3 className="familiar__title">{familiarWith.label}</h3>
              <p className="familiar__note">{familiarWith.note}</p>
            </div>
            <ul className="skill-group__list" aria-label={familiarWith.label}>
              {familiarWith.items.map((item) => (
                <li key={item} className="skill-chip skill-chip--muted">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
