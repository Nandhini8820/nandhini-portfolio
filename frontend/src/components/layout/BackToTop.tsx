import { scrollToSection } from '../../lib/navigation';
import { Icon } from '../ui/Icon';

export function BackToTop({ visible }: { visible: boolean }) {
  return (
    <button
      type="button"
      className={`back-to-top ${visible ? 'back-to-top--visible' : ''}`}
      onClick={() => scrollToSection('home')}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <Icon name="arrowUp" />
    </button>
  );
}
