import type { ContentSource } from '../../hooks/usePortfolio';
import type { Profile } from '../../types/portfolio';

const sourceLabel: Record<ContentSource, string> = {
  loading: 'Connecting to the .NET API…',
  api: 'Content served live by the ASP.NET Core API',
  fallback: 'Showing saved content (API offline)',
};

export function Footer({ profile, source }: { profile: Profile; source: ContentSource }) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with React, TypeScript and ASP.NET Core.
        </p>
        <p className="site-footer__status" data-source={source}>
          <span className="status-dot" aria-hidden="true" />
          {sourceLabel[source]}
        </p>
      </div>
    </footer>
  );
}
