import Ornament from './Ornament.jsx';

export default function SectionHead({ id, title, children }) {
  return (
    <header className="section-head">
      <h2 id={id}>{title}</h2>
      <Ornament className="section-head__ornament" />
      {children && <p>{children}</p>}
    </header>
  );
}
