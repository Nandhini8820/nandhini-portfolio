interface SectionHeadingProps {
  id: string;
  title: string;
  intro?: string;
}

/** Section title that receives focus after in-page navigation (see scrollToSection). */
export function SectionHeading({ id, title, intro }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <h2 id={`${id}-title`} className="section-heading__title" data-section-heading tabIndex={-1}>
        {title}
      </h2>
      {intro ? <p className="section-heading__intro">{intro}</p> : null}
    </div>
  );
}
