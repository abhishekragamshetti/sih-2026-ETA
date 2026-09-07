import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Bell, CalendarDays, Check, ChevronDown, ChevronRight, CircleDot, Clock3, Gauge, LocateFixed, LogOut, MapPin, Moon, Radio, Search, ShieldCheck, Sparkles, Sun, TrainFront, Wifi } from "lucide-react";

type Station = { code: string; name: string; city: string; lat: number; lon: number; sequence: number; scheduledArrival: string; scheduledDeparture: string; platform?: string };
  type Snapshot = { train: { number: string; name: string; zone: string; route: Station[]; color: string }; position: { lat: number; lon: number; speed: number; status: string; delayMinutes: number; lastReportedStation: string; nextStation: string; progress: number; updatedAt: string }; prediction: { confidence: "high" | "medium" | "low"; confidenceMinutes: number; trend: string; rows: { station: Station; predictedArrival: string; predictedDeparture: string; delayMinutes: number; isPassed: boolean }[]; explanation: string[]; generatedAt: string } };
type Location = { state: string; district: string; stations: { code: string; name: string }[] };

const API = "https://sih-2026-eta-production.up.railway.app";
const DEMO_EMAIL = "passenger@railpulse.in";
const DEMO_PASSWORD = "railpulse";
const stateDistricts: Location[] = [
  { state: "Maharashtra", district: "Mumbai Suburban", stations: [{ code: "MMCT", name: "Mumbai Central" }, { code: "BVI", name: "Borivali" }] },
  { state: "Gujarat", district: "Vadodara", stations: [{ code: "BRC", name: "Vadodara Jn" }] },
  { state: "Rajasthan", district: "Kota", stations: [{ code: "KOTA", name: "Kota Jn" }] },
  { state: "Delhi", district: "New Delhi", stations: [{ code: "NDLS", name: "New Delhi" }] },
  { state: "West Bengal", district: "Kolkata", stations: [{ code: "HWH", name: "Howrah Jn" }] },
  { state: "Jharkhand", district: "Asansol", stations: [{ code: "ASN", name: "Asansol Jn" }] },
  { state: "Bihar", district: "Gaya", stations: [{ code: "GAYA", name: "Gaya Jn" }] },
  { state: "Uttar Pradesh", district: "Mughalsarai", stations: [{ code: "DDU", name: "Pt. DD Upadhyaya" }] },
  { state: "Karnataka", district: "Bengaluru Urban", stations: [{ code: "SBC", name: "KSR Bengaluru" }] },
  { state: "Andhra Pradesh", district: "Sri Sathya Sai", stations: [{ code: "DMM", name: "Dharmavaram" }] },
  { state: "Telangana", district: "Hyderabad", stations: [{ code: "SC", name: "Secunderabad" }] },
  { state: "Madhya Pradesh", district: "Bhopal", stations: [{ code: "BPL", name: "Bhopal Jn" }] }
];

function App() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("railpulse-auth") === "true");
  const [screen, setScreen] = useState<"landing" | "login" | "signup">("landing");
  const [dark, setDark] = useState(() => localStorage.getItem("railpulse-theme") === "dark");
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("railpulse-theme", dark ? "dark" : "light"); }, [dark]);
  const enterDashboard = () => { sessionStorage.setItem("railpulse-auth", "true"); setAuthenticated(true); };
  if (!authenticated) {
    if (screen === "login") return <LoginScreen onLogin={enterDashboard} onSignUp={() => setScreen("signup")} onBack={() => setScreen("landing")} />;
    if (screen === "signup") return <SignUpScreen onLogin={enterDashboard} onBack={() => setScreen("landing")} />;
    return <LandingScreen onLogin={() => setScreen("login")} onSignUp={() => setScreen("signup")} />;
  }
  return <Dashboard dark={dark} setDark={setDark} onLogout={() => { sessionStorage.removeItem("railpulse-auth"); setAuthenticated(false); }} />;
}

function LandingScreen({ onLogin, onSignUp }: { onLogin: () => void; onSignUp: () => void }) {
  return <div className="landing-shell"><header className="landing-nav"><button className="brand landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-mark"><TrainFront size={20} /></span> RAIL<span>PULSE</span></button><nav><a href="#how-it-works">How it works</a><a href="#signals">Live signals</a><a href="#trust">Trust layer</a></nav><div className="landing-actions"><button className="text-button" onClick={onLogin}>Sign in</button><button className="outline-button" onClick={onSignUp}>Create account <ArrowUpRight size={15} /></button></div></header><main className="landing-main"><section className="landing-hero"><div className="hero-copy"><p className="eyebrow"><span className="live-dot" /> BUILT FOR THE JOURNEY AHEAD</p><h1>Know your train.<br /><em>Own your time.</em></h1><p className="hero-lede">RailPulse turns live rail movement into a clear, calm view of your journey, from first signal to final station.</p><div className="hero-actions"><button className="primary-button" onClick={onSignUp}>Start tracking free <ArrowUpRight size={17} /></button><button className="hero-link" onClick={onLogin}>Explore the dashboard <ChevronRight size={16} /></button></div><div className="hero-proof"><span><ShieldCheck size={16} /> Private by default</span><span><Wifi size={16} /> Live network signals</span></div></div><div className="hero-console"><div className="console-top"><span><i className="console-live" /> Network pulse</span><span>09:42:18 IST</span></div><div className="console-route"><div className="console-station"><strong>12951</strong><span>Mumbai Central</span></div><div className="console-line"><i /><span>ON THE MOVE</span><i /></div><div className="console-station right"><strong>06:20</strong><span>New Delhi ETA</span></div></div><div className="console-metrics"><div><small>Current delay</small><strong className="green-text">+04 min</strong></div><div><small>Next station</small><strong>Ratlam Jn</strong></div><div><small>Confidence</small><strong>High <span className="confidence-bar"><i /><i /><i /></span></strong></div></div><div className="console-chart"><span className="chart-label">CORRIDOR TELEMETRY</span><svg viewBox="0 0 400 90" preserveAspectRatio="none"><path d="M0 72 C40 60 50 68 80 47 S125 58 150 39 S195 47 220 31 S264 45 290 22 S340 34 400 12" /><path className="chart-fill" d="M0 72 C40 60 50 68 80 47 S125 58 150 39 S195 47 220 31 S264 45 290 22 S340 34 400 12 V90 H0 Z" /></svg></div></div></section><section className="signal-strip" id="signals"><div><Sparkles size={18} /><strong>One calm view for every moving part.</strong></div><span>Live positions · Predictive ETAs · Clear explanations</span></section><section className="landing-features" id="how-it-works"><div className="section-intro"><p className="eyebrow">THE RAILPULSE METHOD</p><h2>Less waiting.<br /><em>More knowing.</em></h2></div><div className="feature-grid"><div className="feature-item"><span className="feature-number">01</span><MapPin size={21} /><h3>Find your corridor</h3><p>Filter by state, district, station, or train and get to the signal that matters.</p></div><div className="feature-item"><span className="feature-number">02</span><Radio size={21} /><h3>Read the movement</h3><p>See live position, speed, delay, and route progress without the noise.</p></div><div className="feature-item"><span className="feature-number">03</span><Gauge size={21} /><h3>Plan with confidence</h3><p>Station-wise ETAs and plain-language reasons make the next decision easier.</p></div></div></section><section className="trust-band" id="trust"><div><p className="eyebrow">DESIGNED AROUND SIGNAL, NOT STATIC TIMETABLES</p><h2>Your journey has a pulse.<br /><em>We help you hear it.</em></h2></div><div className="trust-stat"><strong>98.4%</strong><span>network signal health</span></div><div className="trust-stat"><strong>04s</strong><span>simulated refresh cycle</span></div></section></main><footer className="landing-footer"><span>RAILPULSE / PASSENGER INTELLIGENCE</span><span>Phase 01 · Built for Indian Railways</span></footer></div>;
}

function LoginScreen({ onLogin, onSignUp, onBack }: { onLogin: () => void; onSignUp: () => void; onBack: () => void }) {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => { event.preventDefault(); const savedEmail = localStorage.getItem("railpulse-user-email"); if ((email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) || (email.trim().toLowerCase() === savedEmail && password)) onLogin(); else setError("Those details do not match this demo account."); };
  return <div className="login-shell"><div className="login-art"><button className="back-link" onClick={onBack}><ChevronRight size={14} className="back-arrow" /> Back to RailPulse</button><div className="login-brand"><span className="brand-mark"><TrainFront size={20} /></span> RAIL<span>PULSE</span></div><div className="art-copy"><p className="eyebrow">REAL-TIME RAIL INTELLIGENCE</p><h1>Make every<br /><em>minute count.</em></h1><p>Arrive with clarity. RailPulse turns live movement into a calmer journey for every passenger.</p></div><div className="art-route"><span className="route-line" /><div><b>12951</b><small>Mumbai Central</small></div><ChevronRight /><div><b>06:20</b><small>New Delhi ETA</small></div></div><span className="art-stamp">PHASE 01 / LIVE</span></div><div className="login-panel"><div className="panel-top"><span className="panel-kicker">PASSENGER PORTAL</span><span className="secure"><CircleDot size={11} /> Secure access</span></div><div className="login-heading"><h2>Welcome back.</h2><p>Sign in to see your journey in motion.</p></div><form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">Enter RailPulse <ChevronRight size={17} /></button></form><div className="demo-note"><span>DEMO ACCESS</span><p><b>{DEMO_EMAIL}</b><br />Password: <b>{DEMO_PASSWORD}</b></p></div><button className="switch-auth" onClick={onSignUp}>New to RailPulse? <strong>Create an account</strong></button><div className="login-footer"><span>Indian Railways prototype</span><span>v0.1.0</span></div></div></div>;
}

function SignUpScreen({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !email.includes("@") || password.length < 6) { setError("Add your name, a valid email, and a password of 6+ characters."); return; } localStorage.setItem("railpulse-user-name", name.trim()); localStorage.setItem("railpulse-user-email", email.trim().toLowerCase()); onLogin(); };
  return <div className="signup-shell"><div className="signup-aside"><button className="back-link dark-back" onClick={onBack}><ChevronRight size={14} className="back-arrow" /> Back to RailPulse</button><div><span className="signup-kicker">YOUR SIGNAL, YOUR VIEW</span><h1>Make the<br /><em>journey yours.</em></h1><p>Create a lightweight RailPulse profile and keep your watch points close at hand.</p></div><div className="signup-benefits"><span><Check size={15} /> Personal journey workspace</span><span><Check size={15} /> Live train signal updates</span><span><Check size={15} /> No payment required</span></div></div><div className="signup-panel"><div className="panel-top"><span className="panel-kicker">CREATE YOUR PROFILE</span><span className="secure"><ShieldCheck size={12} /> Local demo access</span></div><div className="login-heading"><h2>Start tracking.</h2><p>Your dashboard is ready when you are.</p></div><form onSubmit={submit}><label>Your name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Aarav Kapoor" /></label><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" /></label><label>Create password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="6 characters minimum" /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">Open my dashboard <ArrowUpRight size={17} /></button></form><button className="switch-auth" onClick={onBack}>Already have access? <strong>Sign in</strong></button><p className="signup-privacy"><ShieldCheck size={14} /> Your profile stays in this browser for this prototype.</p></div></div>;
}

function Dashboard({ dark, setDark, onLogout }: { dark: boolean; setDark: (value: boolean) => void; onLogout: () => void }) {
  const [trains, setTrains] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState("12951");
  const [search, setSearch] = useState("");
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState("All states");
  const [district, setDistrict] = useState("All districts");
  const [station, setStation] = useState("All stations");
  const [travelDate, setTravelDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeWindow, setTimeWindow] = useState("All day");
  const [dataError, setDataError] = useState("");
  const [showPredictionDetails, setShowPredictionDetails] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<string[]>([]);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const previousTrains = useRef<Snapshot[]>([]);
  const selectedTrain = trains.find((item) => item.train.number === selected) ?? trains[0];
  useEffect(() => { if (!selectedTrain) return; const savedAlerts = JSON.parse(localStorage.getItem("railpulse-alerts") ?? "[]" ) as string[];setAlertEnabled(savedAlerts.includes(selectedTrain.train.number)); }, [selectedTrain]);
  const toggleTrainAlert = () => {
  if (!selectedTrain) return;

  const savedAlerts = JSON.parse(
    localStorage.getItem("railpulse-alerts") ?? "[]"
  ) as string[];

  const trainNumber = selectedTrain.train.number;

  const updatedAlerts = savedAlerts.includes(trainNumber)
    ? savedAlerts.filter((number) => number !== trainNumber)
    : [...savedAlerts, trainNumber];

  localStorage.setItem(
    "railpulse-alerts",
    JSON.stringify(updatedAlerts)
  );

  setAlertEnabled(updatedAlerts.includes(trainNumber));
};
  const districts = useMemo(() => state === "All states" ? stateDistricts : stateDistricts.filter((item) => item.state === state), [state]);
  const stations = useMemo(() => districts.flatMap((item) => item.stations), [districts]);

  const filteredTrains = useMemo(() => trains.filter((item) => {
    const matchesText = !search || `${item.train.number} ${item.train.name} ${item.train.route.map((stop) => stop.name).join(" ")}`.toLowerCase().includes(search.toLowerCase());
    const matchesStation = station === "All stations" || item.train.route.some((stop) => stop.code === station);
    const matchesTime = timeWindow === "All day" || item.train.route.some((stop) => { const hour = Number(stop.scheduledArrival.split(":")[0]); return timeWindow === "Morning" ? hour >= 5 && hour < 12 : timeWindow === "Afternoon" ? hour >= 12 && hour < 18 : hour >= 18 || hour < 5; });
    return matchesText && matchesStation && matchesTime;
  }), [trains, search, station, timeWindow]);

 useEffect(() => {
  fetch(`${API}/api/trains`)
    .then(async (response) => {
      const payload = await response.json() as Snapshot[] | { error?: string };

      if (!response.ok || !Array.isArray(payload)) {
        throw new Error(
          (payload as { error?: string }).error ?? "Train data unavailable"
        );
      }

      setTrains(payload);
      setDataError("");
    })
    .catch((error: unknown) =>
      setDataError(
        error instanceof Error
          ? error.message
          : "Train data unavailable"
      )
    );

  const socket = new WebSocket(
    "wss://sih-2026-eta-production.up.railway.app/ws"
  );

  socket.onopen = () => setConnected(true);

  socket.onclose = () => setConnected(false);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as {
      type?: string;
      payload?: Snapshot[] | string;
    };

    if (message.type === "snapshot" && Array.isArray(message.payload)) {
      const newTrains = message.payload;
      const oldTrains = previousTrains.current;

      const savedAlerts = JSON.parse(
        localStorage.getItem("railpulse-alerts") ?? "[]"
      ) as string[];

      const newAlerts: string[] = [];

      newTrains.forEach((newSnapshot) => {
        const oldSnapshot = oldTrains.find(
          (item) => item.train.number === newSnapshot.train.number
        );

        if (!oldSnapshot) return;

        const trainNumber = newSnapshot.train.number;
        const trainName = newSnapshot.train.name;

        if (!savedAlerts.includes(trainNumber)) return;

        const oldDelay = oldSnapshot.position.delayMinutes;
        const newDelay = newSnapshot.position.delayMinutes;

        const oldSpeed = oldSnapshot.position.speed;
        const newSpeed = newSnapshot.position.speed;

        if (newDelay >= oldDelay + 2) {
          newAlerts.push(
            `${trainNumber} · ${trainName}: delay increased to ${newDelay} min`
          );
        }

        if (newDelay <= oldDelay - 2 && oldDelay > 0) {
          newAlerts.push(
            `${trainNumber} · ${trainName}: delay recovering to ${newDelay} min`
          );
        }

        if (newSpeed <= oldSpeed - 20) {
          newAlerts.push(
            `${trainNumber} · ${trainName}: speed reduced to ${Math.round(
              newSpeed
            )} km/h`
          );
        }
      });

      if (newAlerts.length > 0) {
  console.log("RailPulse alerts:", newAlerts);

  setLiveAlerts((currentAlerts) =>
    [...newAlerts, ...currentAlerts].slice(0, 8)
  );
      }

previousTrains.current = newTrains;

      setTrains(newTrains);
      setDataError("");
    } else if (message.type === "error") {
      setDataError(String(message.payload ?? "Train data unavailable"));
    }
  };

  return () => socket.close();
}, []);
  useEffect(() => { if (filteredTrains.length && !filteredTrains.some((item) => item.train.number === selected)) setSelected(filteredTrains[0].train.number); }, [filteredTrains, selected]);
  if (!selectedTrain) return <div className="boot"><div className="boot-panel"><TrainFront size={28} /><h2>RailPulse is ready</h2><p>{dataError || "Waiting for train telemetry..."}</p><small>Start MySQL with the configured credentials, then refresh this page.</small></div></div>;
  const { train, position, prediction } = selectedTrain;
  const lastUpdated = new Date(position.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return <div className="app-shell dashboard-shell"><header className="topbar"><div className="brand"><span className="brand-mark"><TrainFront size={20} /></span><span>RAIL<span>PULSE</span></span></div><div className="live-chip"><span className="pulse-dot" /> Live network <strong>{connected ? "Connected" : "Offline"}</strong></div><div className="top-actions"><button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? <Sun size={16} /> : <Moon size={16} />}<span>{dark ? "Light" : "Dark"}</span></button><button className="icon-button" aria-label="Notifications" onClick={() => setShowNotifications(true)} > <Bell size={18} /> <i /></button><div className="avatar">AK</div><button className="logout-button" onClick={onLogout} aria-label="Log out"><LogOut size={16} /></button></div></header><main><section className="home-hero"><div><p className="eyebrow">YOUR JOURNEY CONTROL / {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</p><h1>Where are you<br /><em>headed?</em></h1><p className="lede">Set your watch point. We will keep the signal moving with you.</p></div><div className="network-status"><Radio size={18} /><span><b>Network pulse</b><small>3 corridors reporting live</small></span><strong>98.4%</strong></div></section><section className="journey-bar"><div className="bar-heading"><MapPin size={18} /><div><b>Watch a location</b><small>Filter the network around your journey</small></div></div><Select label="State" value={state} options={["All states", ...Array.from(new Set(stateDistricts.map((item) => item.state)))]} onChange={(value) => { setState(value); setDistrict("All districts"); setStation("All stations"); }} /><Select label="District" value={district} options={["All districts", ...Array.from(new Set(districts.map((item) => item.district)))]} onChange={(value) => { setDistrict(value); setStation("All stations"); }} /><Select label="Railway station" value={station} options={["All stations", ...stations.filter((item, index) => stations.findIndex((candidate) => candidate.code === item.code) === index).map((item) => item.code)]} labels={Object.fromEntries(stations.map((item) => [item.code, item.name]))} onChange={setStation} /></section><section className="filter-strip"><div className="filter-title"><CalendarDays size={16} /><span>TRIP WINDOW</span></div><label className="date-input"><input type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} /><span>{new Date(`${travelDate}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</span></label><div className="time-pills">{["All day", "Morning", "Afternoon", "Evening"].map((option) => <button key={option} className={timeWindow === option ? "selected" : ""} onClick={() => setTimeWindow(option)}>{option}</button>)}</div><label className="train-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search train, route or station" /></label><span className="result-count">{filteredTrains.length} trains in view</span></section><section className="workspace"><aside className="train-sidebar"><div className="section-label"><span>LIVE TRAINS</span><b>{filteredTrains.length.toString().padStart(2, "0")}</b></div><div className="train-list">{filteredTrains.map((item) => <button className={`train-item ${item.train.number === selected ? "active" : ""}`} key={item.train.number} onClick={() => setSelected(item.train.number)}><span className="train-line" style={{ background: item.train.color }} /><span className="train-copy"><strong>{item.train.number} · {item.train.name}</strong><small>{item.train.route[0].city} <ChevronRight size={11} /> {item.train.route[item.train.route.length - 1]?.city}</small></span><span className={`mini-delay ${item.position.delayMinutes > 8 ? "warm" : ""}`}>+{item.position.delayMinutes}m</span></button>)}</div><div className="sidebar-footer"><span className="weather-orb">◒</span><span><b>Weather layer</b><small>Clear · 28°C · 12 km/h</small></span><ChevronRight size={16} /></div></aside><div className="detail"><div className="detail-head"><div><div className="route-tag"><span style={{ background: train.color }} /> {train.zone} corridor</div><h2>{train.number} <span>{train.name}</span></h2><p>{train.route[0].name} <ChevronRight size={14} /> {train.route[train.route.length - 1]?.name}</p></div><button className={`alert-button ${alertEnabled ? "active" : ""}`} onClick={toggleTrainAlert} aria-pressed={alertEnabled} > <Bell size={16} /> {alertEnabled ? "Alerts on" : "Get alerts"} </button></div><div className="metrics"><Metric icon={<Clock3 />} label="Current delay" value={`${position.delayMinutes} min`} accent={position.delayMinutes > 8 ? "amber" : "green"} detail={prediction.trend} /><Metric icon={<LocateFixed />} label="Next station" value={train.route.find((item) => item.code === position.nextStation)?.name ?? "Terminating"} detail={`Passing ${position.lastReportedStation}`} /><Metric icon={<Gauge />} label="Speed now" value={`${Math.round(position.speed)} km/h`} detail="Section average 82 km/h" /><Metric icon={<CircleDot />} label="ETA confidence" value={prediction.confidence} accent={prediction.confidence === "high" ? "green" : "amber"} detail={`± ${prediction.confidenceMinutes} minutes`} /></div><div className="map-card"><div className="map-header"><div><span className="card-kicker">LIVE ROUTE</span><strong>Corridor telemetry</strong></div><span className="updated"><Wifi size={13} /> Updated {lastUpdated}</span></div><RouteMap train={train} position={position} passedCount={prediction.rows.filter((row) => row.isPassed).length} /></div><div className="lower-grid"><div className="eta-card"><div className="card-title"><div><span className="card-kicker">UPCOMING STOPS</span><strong>Station-wise ETA</strong></div><span className="confidence-pill">{prediction.confidence} confidence</span></div><div className="eta-table"><div className="table-row table-head"><span>Station</span><span>Scheduled</span><span>Predicted</span><span>Platform</span></div>{prediction.rows.map((row) => <div className={`table-row ${row.isPassed ? "passed" : ""}`} key={row.station.code}><span><b>{row.station.name}</b><small>{row.station.code} · {row.isPassed ? "Passed" : "Upcoming"}</small></span><span>{row.station.scheduledArrival}</span><span className={row.delayMinutes > 0 ? "late" : "on-time"}>{row.predictedArrival} <small>+{row.delayMinutes}m</small></span><span>{row.station.platform ?? "--"}</span></div>)}</div></div><div className="why-card"><div className="card-title"><div><span className="card-kicker">SIGNAL EXPLAINED</span><strong>Why is it late?</strong></div><span className="trend">↗ {prediction.trend}</span></div><p className="why-intro">Our baseline model weighs movement, timetable recovery, and corridor conditions every four seconds.</p><div className="reasons">{prediction.explanation.map((reason, index) => <div className="reason" key={reason}><span>{String(index + 1).padStart(2, "0")}</span><p>{reason}</p></div>)}</div><button className="details-link" onClick={() => setShowPredictionDetails(true)} > View prediction details <ChevronRight size={14} /></button></div></div></div></section></main> {showPredictionDetails && ( <PredictionDetails train={train} position={position} prediction={prediction} onClose={() => setShowPredictionDetails(false)} />)} {showNotifications && ( <NotificationsPanel trains={trains}  liveAlerts={liveAlerts} onClose={() => setShowNotifications(false)} />)}<footer><span>RAILPULSE / OPERATIONS SYSTEM</span><span><i className="footer-dot" /> Simulated telemetry · Phase 1</span></footer></div>;
}

function Select({ label, value, options, labels = {}, onChange }: { label: string; value: string; options: string[]; labels?: Record<string, string>; onChange: (value: string) => void }) { return <label className="location-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select><ChevronDown size={14} /></label>; }
function Metric({ icon, label, value, detail, accent }: { icon: ReactNode; label: string; value: string; detail: string; accent?: string }) { return <div className="metric"><span className="metric-icon">{icon}</span><small>{label}</small><strong className={accent}>{value}</strong><span className="metric-detail">{detail}</span></div>; }
function RouteMap({ train, position, passedCount }: { train: Snapshot["train"]; position: Snapshot["position"]; passedCount: number }) { const points = train.route.map((station, index) => `${14 + index * (72 / Math.max(1, train.route.length - 1))},${58 - index * 7}`).join(" "); const activeIndex = Math.min(train.route.length - 1, passedCount); const activeX = 14 + activeIndex * (72 / Math.max(1, train.route.length - 1)); const activeY = 58 - activeIndex * 7 - position.progress * 7; return <div className="route-visual"><div className="map-grid" /><svg viewBox="0 0 100 70" preserveAspectRatio="none"><polyline className="route-base" points={points} /><polyline className="route-passed" points={`14,58 ${activeX},${activeY}`} />{train.route.map((station, index) => <g key={station.code}><circle className={index < passedCount ? "station passed" : "station"} cx={14 + index * (72 / Math.max(1, train.route.length - 1))} cy={58 - index * 7} r="1.6" /><text x={14 + index * (72 / Math.max(1, train.route.length - 1))} y={68 - index * 7}>{station.code}</text></g>)}<circle className="train-marker" cx={activeX} cy={activeY} r="2.8" /><circle className="train-ring" cx={activeX} cy={activeY} r="5" /></svg><div className="map-legend"><span><i className="legend-live" /> Live train</span><span><i className="legend-passed" /> Passed</span><span><i className="legend-upcoming" /> Upcoming</span></div><div className="map-callout" style={{ left: `${activeX}%`, top: `${activeY}%` }}><b>{position.speed.toFixed(0)} km/h</b><small>{position.lastReportedStation}</small></div></div>; }
function PredictionDetails({
  train,
  position,
  prediction,
  onClose
}: {
  train: Snapshot["train"];
  position: Snapshot["position"];
  prediction: Snapshot["prediction"];
  onClose: () => void;
}) {
  return (
    <div className="prediction-overlay" onClick={onClose}>
      <div
        className="prediction-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="prediction-panel-header">
          <div>
            <span className="card-kicker">PREDICTION DETAILS</span>
            <h2>{train.number} · {train.name}</h2>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close prediction details"
          >
            ×
          </button>
        </div>

        <div className="prediction-summary">
          <div>
            <small>Current delay</small>
            <strong>+{position.delayMinutes} min</strong>
          </div>

          <div>
            <small>Current speed</small>
            <strong>{Math.round(position.speed)} km/h</strong>
          </div>

          <div>
            <small>Confidence</small>
            <strong>{prediction.confidence}</strong>
          </div>

          <div>
            <small>Prediction range</small>
            <strong>± {prediction.confidenceMinutes} min</strong>
          </div>
        </div>

        <div className="prediction-info">
          <div>
            <span>Trend</span>
            <strong>{prediction.trend}</strong>
          </div>

          <div>
            <span>Last reported</span>
            <strong>{position.lastReportedStation}</strong>
          </div>

          <div>
            <span>Next station</span>
            <strong>
              {train.route.find(
                (item) => item.code === position.nextStation
              )?.name ?? "Terminating"}
            </strong>
          </div>
        </div>

        <div className="prediction-reasons">
          <span className="card-kicker">WHY THIS PREDICTION</span>

          {prediction.explanation.map((reason, index) => (
            <div className="reason" key={reason}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{reason}</p>
            </div>
          ))}
        </div>

        <div className="prediction-stops">
          <span className="card-kicker">STATION FORECAST</span>

          {prediction.rows.map((row) => (
            <div
              className={`prediction-stop ${row.isPassed ? "passed" : ""}`}
              key={row.station.code}
            >
              <div>
                <strong>{row.station.name}</strong>
                <small>{row.station.code}</small>
              </div>

              <div>
                <small>Scheduled</small>
                <strong>{row.station.scheduledArrival}</strong>
              </div>

              <div>
                <small>Predicted</small>
                <strong>{row.predictedArrival}</strong>
              </div>

              <div>
                <small>Delay</small>
                <strong>+{row.delayMinutes}m</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="prediction-generated">
          Generated{" "}
          {new Date(prediction.generatedAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
function NotificationsPanel({
  trains,
  liveAlerts,
  onClose
}: {
  trains: Snapshot[];
  liveAlerts: string[];
  onClose: () => void;
}) {
  const notifications = trains
    .flatMap((snapshot) => {
      const items: {
        trainNumber: string;
        trainName: string;
        message: string;
        type: "delay" | "speed" | "live";
      }[] = [];

      if (snapshot.position.delayMinutes > 0) {
        items.push({
          trainNumber: snapshot.train.number,
          trainName: snapshot.train.name,
          message: `Running ${snapshot.position.delayMinutes} min late`,
          type: "delay"
        });
      }

      if (snapshot.position.speed < 60) {
        items.push({
          trainNumber: snapshot.train.number,
          trainName: snapshot.train.name,
          message: `Reduced speed: ${Math.round(snapshot.position.speed)} km/h`,
          type: "speed"
        });
      }

      return items;
    })
    .slice(0, 8);

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div
        className="notification-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="notification-header">
          <div>
            <span className="card-kicker">LIVE NOTIFICATIONS</span>
            <h2>Network alerts</h2>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close notifications"
          >
            ×
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="notification-empty">
            <Bell size={22} />
            <strong>No active alerts</strong>
            <span>
              All currently monitored trains are operating without delay
              alerts.
            </span>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification, index) => (
              <div
                className="notification-item"
                key={`${notification.trainNumber}-${notification.type}-${index}`}
              >
                <span className={`notification-dot ${notification.type}`} />

                <div>
                  <strong>
                    {notification.trainNumber} · {notification.trainName}
                  </strong>
                  <p>{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="notification-footer">
          <span>
            Based on current live train telemetry
          </span>
        </div>
      </div>
    </div>
  );
}
export default App;
