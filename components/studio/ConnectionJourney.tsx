export function ConnectionJourney() {
  return <div className="v3-journey" aria-label="A connected journey from first click to useful reporting">
    <svg viewBox="0 0 1200 100" fill="none" aria-hidden="true" preserveAspectRatio="none">
      <path className="v3-journey__ground" d="M150 50H1050" />
      <path className="v3-journey__trace" d="M150 50H1050" pathLength="1" />
    </svg>
    <div className="v3-journey__nodes" aria-hidden="true">{[0,1,2,3].map(index => <i key={index} />)}</div>
    <div className="v3-journey__packet" aria-hidden="true" />
    <ol>{["First click", "Clear enquiry", "Connected workflow", "Useful reporting"].map((label,index) => <li key={label}><span className="v3-mono">0{index+1}</span>{label}</li>)}</ol>
  </div>;
}
