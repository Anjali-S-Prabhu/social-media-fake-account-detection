import './AtomLoader.css';

export default function AtomLoader() {
  return (
    <div className="loader">
      <div className="loader-orbits">
        <div className="loader-orbits__electron"></div>
        <div className="loader-orbits__electron"></div>
        <div className="loader-orbits__electron"></div>
      </div>
    </div>
  );
}
