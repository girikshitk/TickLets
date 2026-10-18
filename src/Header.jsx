export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4.5C4 3.67 4.67 3 5.5 3h13c.83 0 1.5.67 1.5 1.5v15a1 1 0 0 1-1.6.8L12 16l-6.4 4.3A1 1 0 0 1 4 19.5v-15Z"
              fill="currentColor"
              opacity="0.9"
            />
          </svg>
        </span>
        <span className="brand-name">FELIFORM</span>
        <span className="brand-tag">3D Studio</span>
      </div>
      <nav className="nav-links">
        <a href="#collection">Collection</a>
        <a href="#studio">Studio</a>
        <a href="#about">About</a>
      </nav>
    </header>
  );
}
