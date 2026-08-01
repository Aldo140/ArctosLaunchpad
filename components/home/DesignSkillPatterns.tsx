export function DesignSkillPatterns() {
  return (
    <>
      <div className="design-skill-patterns__panel design-skill-patterns__panel--sky">
        <div className="uiverse-midnight-sky" aria-hidden="true">
          <div className="sky-canvas" />
          <div className="stars stars-1" />
          <div className="stars stars-2" />
          <div className="stars stars-3" />
          <div className="meteor m1" />
          <div className="meteor m2" />
          <div className="meteor m3" />
          <div className="moon" />
        </div>
      </div>

      <div className="design-skill-patterns__panel design-skill-patterns__panel--browser">
        <div className="skill-browser" aria-hidden="true">
          <div className="skill-browser__tabs-head">
            <div className="skill-browser__tab-open">
              <span className="skill-browser__tab-label">DESIGN</span>
              <span className="skill-browser__close-tab">×</span>
              <div className="skill-browser__rounded-l">
                <span className="skill-browser__mask-round" />
              </div>
              <div className="skill-browser__rounded-r">
                <span className="skill-browser__mask-round" />
              </div>
            </div>
            <div className="skill-browser__window-opt">
              <button
                className="skill-browser__window-close"
                type="button"
                aria-label="Close tab"
              />
            </div>
          </div>
          <div className="skill-browser__head-browser">
            <input
              type="text"
              value="arctoslaunchpad.com"
              readOnly
              aria-label="Browser address"
            />
            <button type="button" disabled aria-label="Refresh">
              ↻
            </button>
            <span className="skill-browser__star" aria-hidden="true">
              ★
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
