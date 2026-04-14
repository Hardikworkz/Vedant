import { Suspense, lazy } from "react";
import "./App.css";

const Navbar = lazy(() =>
  import(/* webpackChunkName: "nav-shell" */ "@/components/ui/demo")
);
const Homepage = lazy(() =>
  import(/* webpackChunkName: "homepage" */ "./components/h.o.t/Homepage")
);

function App() {
  return (
    <div className="app-shell">
      <Suspense fallback={<div className="nav-loader" aria-hidden="true" />}>
        <Navbar />
      </Suspense>

      <Suspense
        fallback={
          <div className="app-loader" role="status" aria-live="polite">
            <div className="app-loader-panel">
              <p className="app-loader-kicker">House of Thrill</p>
              <h1 className="app-loader-title">Loading the experience...</h1>
            </div>
          </div>
        }
      >
        <Homepage />
      </Suspense>
    </div>
  );
}

export default App;
