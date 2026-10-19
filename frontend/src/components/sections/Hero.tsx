import { scrollToSection } from '../../lib/navigation';
import type { Highlight, Profile } from '../../types/portfolio';
import { Icon } from '../ui/Icon';
import { RotatingText } from '../ui/RotatingText';

interface HeroProps {
  profile: Profile;
  highlight: Highlight;
}

export function Hero({ profile, highlight }: HeroProps) {
  return (
    <section id="home" className="hero" aria-labelledby="home-title">
      <div className="container hero__inner">
        <div className="hero__heading">
          <p className="hero__role">
            {profile.title}, {profile.location.split(',')[0]}
          </p>
          <h1 id="home-title" className="hero__name" data-section-heading tabIndex={-1}>
            {profile.name}
          </h1>
          <p className="hero__rotating">
            I build <RotatingText items={profile.focusAreas} />
          </p>
        </div>

        <div className="hero__text">
          <p className="hero__lead">{profile.headline}</p>
          <p className="hero__summary">{profile.summary}</p>

          <div className="hero__actions">
            <a className="button button--primary" href={`mailto:${profile.email}`}>
              <Icon name="mail" />
              Email me
            </a>
            <a className="button button--secondary" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              <Icon name="linkedin" />
              LinkedIn
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <a
              className="button button--ghost"
              href="#projects"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection('projects');
              }}
            >
              See my projects
            </a>
          </div>
        </div>

        <figure className="migration" aria-label={`${highlight.from} to ${highlight.to}`}>
          <div className="migration__track">
            <div className="migration__box migration__box--before">
              <span className="migration__label">Before</span>
              <span className="migration__value">{highlight.from}</span>
            </div>
            <svg className="migration__arrow" viewBox="0 0 24 64" aria-hidden="true" focusable="false">
              <path d="M12 2v56M4 50l8 8 8-8" />
            </svg>
            <div className="migration__box migration__box--after">
              <span className="migration__label">After</span>
              <span className="migration__value">{highlight.to}</span>
            </div>
          </div>
          <figcaption className="migration__caption">{highlight.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
