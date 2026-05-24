const LoadingState = ({ text = 'Memuat data...', compact = false }) => (
  <div className={`loading-luxury ${compact ? 'loading-luxury-compact' : ''}`}>
    <div className="loading-luxury-content">
      <div className="loading-constellation" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="loading-luxury-spinner" />
      <div className="loading-luxury-text">{text}</div>
      <div className="loading-luxury-bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
);

export default LoadingState;
