import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-brand">LagStore</span>
        <span className="footer-note">Periferice gaming · Plata la livrare</span>
        <span className="footer-note">© {new Date().getFullYear()} LagStore</span>
      </div>
    </footer>
  );
}
