import { useEffect, useMemo, useState } from 'react';

type Train = {
  id: string;
  name: string;
  type: 'Express' | 'Passenger' | 'Freight';
  speedKph: number;
  delayMin: number;
  etaMin: number;
  status: 'On time' | 'Watch' | 'At risk';
};

type Intervention = {
  target: string;
  action: string;
  impact: string;
};

type MapNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: 'station' | 'junction' | 'hub';
};

type MapLink = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  status: 'safe' | 'watch' | 'risk';
};

const baseTrains: Train[] = [
  { id: 'A', name: 'Train A', type: 'Express', speedKph: 128, delayMin: 2, etaMin: 18, status: 'Watch' },
  { id: 'B', name: 'Train B', type: 'Passenger', speedKph: 102, delayMin: 0, etaMin: 24, status: 'On time' },
  { id: 'C', name: 'Train C', type: 'Freight', speedKph: 78, delayMin: 0, etaMin: 31, status: 'On time' },
];

const mapNodes: MapNode[] = [
  { id: 'north', label: 'North Yard', x: 14, y: 22, kind: 'station' },
  { id: 'junction', label: 'Junction 12', x: 48, y: 50, kind: 'junction' },
  { id: 'city', label: 'City Central', x: 80, y: 24, kind: 'hub' },
  { id: 'freight', label: 'Freight Loop', x: 28, y: 76, kind: 'station' },
  { id: 'south', label: 'South Terminal', x: 76, y: 74, kind: 'station' },
];

const mapLinks: MapLink[] = [
  { x1: 14, y1: 22, x2: 48, y2: 50, status: 'watch' },
  { x1: 48, y1: 50, x2: 80, y2: 24, status: 'risk' },
  { x1: 48, y1: 50, x2: 28, y2: 76, status: 'safe' },
  { x1: 28, y1: 76, x2: 76, y2: 74, status: 'safe' },
  { x1: 80, y1: 24, x2: 76, y2: 74, status: 'watch' },
];

function formatMinutes(value: number) {
  return `${value.toFixed(0)} min`;
}

function scoreNetwork(trains: Train[]) {
  const maxDelay = Math.max(...trains.map((train) => train.delayMin));
  const cascadeRisk = Math.min(100, 28 + maxDelay * 18 + Math.max(0, trains[0].delayMin - 1) * 12);
  const punctuality = Math.max(62, 98 - trains.reduce((sum, train) => sum + train.delayMin * 4, 0));
  const projectedSlip = Math.round(trains.reduce((sum, train) => sum + train.delayMin * (train.type === 'Freight' ? 1.3 : 1), 0) * 1.8);

  let intervention: Intervention = {
    target: 'No intervention required',
    action: 'Hold current plan and continue monitoring',
    impact: 'Network remains stable if no new delay appears.',
  };

  if (cascadeRisk > 65) {
    intervention = {
      target: 'Train B and Train C',
      action: 'Slow Train B by 3 km/h for 5 minutes and hold Train C for 20 seconds',
      impact: 'Train A clears the junction with a buffer and the cascade is absorbed.',
    };
  } else if (cascadeRisk > 42) {
    intervention = {
      target: 'Train B',
      action: 'Reduce speed slightly before the junction',
      impact: 'Protects the buffer window and keeps the evening timetable steady.',
    };
  }

  return {
    cascadeRisk,
    punctuality,
    projectedSlip,
    intervention,
  };
}

function statusTone(status: Train['status']) {
  if (status === 'At risk') return 'alert';
  if (status === 'Watch') return 'warn';
  return 'ok';
}

function mapNodeTone(kind: MapNode['kind']) {
  if (kind === 'hub') return 'hub';
  if (kind === 'junction') return 'junction';
  return 'station';
}

function mapStatusTone(status: MapLink['status']) {
  if (status === 'risk') return 'risk';
  if (status === 'watch') return 'watch';
  return 'safe';
}

export default function App() {
  const [shockLevel, setShockLevel] = useState(2);
  const [clock, setClock] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const trains = useMemo(() => {
    return baseTrains.map((train) => {
      const liveDelay = train.id === 'A' ? shockLevel : Math.max(0, train.delayMin - clock * 0.05);
      const status: Train['status'] = liveDelay >= 3 ? 'At risk' : liveDelay >= 1 ? 'Watch' : 'On time';
      const etaMin = train.etaMin + liveDelay * (train.type === 'Freight' ? 1.2 : 0.8);

      return {
        ...train,
        delayMin: Number(liveDelay.toFixed(1)),
        etaMin: Number(etaMin.toFixed(0)),
        status,
      };
    });
  }, [clock, shockLevel]);

  const summary = useMemo(() => scoreNetwork(trains), [trains]);

  return (
    <main className="app-shell">
      <section className="status-bar card">
        <span>Chrono-Rail Control</span>
        <span>Live: 3 trains monitored</span>
        <span>Next review: 12 min</span>
      </section>

      <section className="hero card">
        <div>
          <p className="eyebrow">Chrono-Rail MVP</p>
          <h1>Prevent the cascade before it reaches the junction.</h1>
          <p className="hero-copy">
            A simple rail operations MVP: track the live network, predict delay risk, and trigger one small action
            that keeps the timetable stable.
          </p>
        </div>

        <div className="hero-panel">
          <div className="live-pill">
            <span className="dot" />
            Live control loop running
          </div>
          <div className="hero-metrics">
            <div>
              <strong>{summary.cascadeRisk}%</strong>
              <span>Cascade risk</span>
            </div>
            <div>
              <strong>{summary.punctuality}%</strong>
              <span>On-time forecast</span>
            </div>
            <div>
              <strong>{formatMinutes(summary.projectedSlip)}</strong>
              <span>Slip avoided</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mvp-strip card">
        <span>Live network map</span>
        <span>Next junction risk</span>
        <span>One recommended action</span>
      </section>

      <section className="card map-card">
        <div className="map-header">
          <div>
            <p className="section-label">Transit operations board</p>
            <h2>Live route control and junction status.</h2>
          </div>
          <div className="map-stat">
            <strong>{summary.cascadeRisk}% risk</strong>
            <span>junction watch</span>
          </div>
        </div>

        <div className="map-legend">
          <span><i className="legend-line safe" />Clear</span>
          <span><i className="legend-line watch" />Watch</span>
          <span><i className="legend-line risk" />Hold</span>
        </div>

        <div className="network-map">
          <svg className="network-lines" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
            {mapLinks.map((link) => (
              <line
                key={`${link.x1}-${link.y1}-${link.x2}-${link.y2}`}
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                className={`network-line ${mapStatusTone(link.status)}`}
              />
            ))}
          </svg>

          {mapNodes.map((node) => (
            <div
              key={node.id}
              className={`map-node ${mapNodeTone(node.kind)}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <strong>{node.label}</strong>
              <span>{node.kind}</span>
            </div>
          ))}

          <div className="train-marker marker-a" style={{ left: '36%', top: '38%' }}>
            Train A
          </div>
          <div className="train-marker marker-b" style={{ left: '55%', top: '42%' }}>
            Train B
          </div>
          <div className="train-marker marker-c" style={{ left: '38%', top: '66%' }}>
            Train C
          </div>
        </div>
      </section>

      <section className="controls card">
        <div>
          <p className="section-label">Scenario controls</p>
          <h2>Inject a delay and watch Chrono-Rail respond.</h2>
        </div>
        <div className="control-row">
          <button type="button" onClick={() => setShockLevel(2)}>
            Reset to 2 minute delay
          </button>
          <button type="button" onClick={() => setShockLevel(4)}>
            Stress the junction
          </button>
          <button type="button" onClick={() => setShockLevel(0.5)}>
            Minimal disruption
          </button>
        </div>
      </section>

      <section className="grid">
        <article className="card panel">
          <p className="section-label">Live trains</p>
          <div className="train-list">
            {trains.map((train) => (
              <div key={train.id} className="train-row">
                <div>
                  <strong>{train.name}</strong>
                  <span>{train.type}</span>
                </div>
                <div>
                  <strong>{train.speedKph} km/h</strong>
                  <span>Speed</span>
                </div>
                <div>
                  <strong>{formatMinutes(train.delayMin)}</strong>
                  <span>Delay</span>
                </div>
                <div>
                  <strong>{formatMinutes(train.etaMin)}</strong>
                  <span>ETA</span>
                </div>
                <span className={`status ${statusTone(train.status)}`}>{train.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card panel">
          <p className="section-label">Chrono forecast</p>
          <h2>Recommended intervention</h2>
          <div className="forecast-box">
            <p className="target">{summary.intervention.target}</p>
            <p>{summary.intervention.action}</p>
            <p className="impact">{summary.intervention.impact}</p>
          </div>
          <div className="timeline">
            <div>
              <span>Now</span>
              <strong>{formatMinutes(clock)}</strong>
            </div>
            <div>
              <span>Next window</span>
              <strong>18-24 min</strong>
            </div>
            <div>
              <span>Prediction horizon</span>
              <strong>1,000 futures</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
