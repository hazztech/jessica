import { Link } from '../lib/router.jsx';
import './Button.css';

/**
 * <Button>Label</Button>                       → <button>
 * <Button to="/shop">Shop now</Button>         → internal link
 * variant: primary | secondary | ghost | light   size: sm | md | lg
 */
export default function Button({ to, variant = 'primary', size = 'md', full = false, className = '', children, ...rest }) {
  const cls = `btn btn--${variant} btn--${size} ${full ? 'btn--full' : ''} ${className}`.trim();
  if (to) {
    return <Link to={to} className={cls} {...rest}>{children}</Link>;
  }
  return <button type="button" className={cls} {...rest}>{children}</button>;
}
