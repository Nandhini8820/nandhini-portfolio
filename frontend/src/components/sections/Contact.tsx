import type { Profile } from '../../types/portfolio';
import { Icon } from '../ui/Icon';
import { SectionHeading } from '../ui/SectionHeading';
import { ContactForm, type ContactDraft } from './ContactForm';

interface ContactProps {
  profile: Profile;
  draft: ContactDraft | null;
}

export function Contact({ profile, draft }: ContactProps) {
  const phoneHref = profile.phone && profile.phoneVisibleOnSite ? `tel:${profile.phone.replace(/[^\d+]/g, '')}` : null;

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container contact__inner">
        <div className="contact__intro">
          <SectionHeading id="contact" title="Contact" />
          <p className="contact__headline">Let’s build something.</p>
          <p className="contact__text">
            I’m interested in senior full stack roles working with .NET and React, legacy modernization and AI-assisted
            engineering. Send a message here or reach me directly.
          </p>
          <ul className="contact__links">
            <li>
              <a href={`mailto:${profile.email}`} className="contact-link">
                <Icon name="mail" />
                {profile.email}
              </a>
            </li>
            <li>
              <a href={profile.linkedin} className="contact-link" target="_blank" rel="noopener noreferrer">
                <Icon name="linkedin" />
                LinkedIn profile<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
            {phoneHref ? (
              <li>
                <a href={phoneHref} className="contact-link">
                  <Icon name="phone" />
                  {profile.phone}
                </a>
              </li>
            ) : null}
            {profile.github ? (
              <li>
                <a href={profile.github} className="contact-link" target="_blank" rel="noopener noreferrer">
                  <Icon name="github" />
                  GitHub<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="contact__form-panel">
          <ContactForm email={profile.email} draft={draft} />
        </div>
      </div>
    </section>
  );
}
