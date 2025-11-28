import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CodePresenter from './components/CodePresenter';
import DemoCode from './components/DemoCode';
import './App.css';

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Presentationer Helper</h1>
      <p>Tools to help you create better presentations.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/code-presenter" style={{ fontSize: '18px', color: '#646cff', textDecoration: 'none' }}>
          Go to Code Presenter (Golang)
        </Link>
        <br />
        <Link to="/demo" style={{ fontSize: '18px', color: '#646cff', textDecoration: 'none' }}>
          Go to Demo Highlight
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-center" />
        <nav style={{ padding: '10px 20px', borderBottom: '1px solid #eee', display: 'flex', gap: '20px' }}>
          <Link to="/">Home</Link>
          <Link to="/code-presenter">Code Presenter</Link>
          <Link to="/demo">Demo</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/code-presenter" element={<CodePresenter />} />
          <Route path="/demo" element={<DemoCode />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
