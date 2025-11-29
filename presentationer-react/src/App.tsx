import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CodePresenter from './components/CodePresenter';
import DemoCode from './components/DemoCode';
import IMThreadGenerator from './components/IMThreadGenerator';
import Sessions from './components/Sessions';
import './App.css';

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Presentationer Helper</h1>
      <p>Tools to help you create better presentations.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/sessions" style={{ fontSize: '18px', color: '#646cff', textDecoration: 'none' }}>
          Manage Sessions
        </Link>
        <br />
        <Link to="/code-presenter" style={{ fontSize: '18px', color: '#646cff', textDecoration: 'none' }}>
          Go to Code Presenter (Golang)
        </Link>
        <br />
        <Link to="/demo" style={{ fontSize: '18px', color: '#646cff', textDecoration: 'none' }}>
          Go to Demo Highlight
        </Link>
        <br />
        <Link to="/im-thread" style={{ fontSize: '18px', color: '#646cff', textDecoration: 'none' }}>
          Go to IM Thread Generator
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
          <Link to="/sessions">Sessions</Link>
          <Link to="/code-presenter">Code Presenter</Link>
          <Link to="/demo">Demo</Link>
          <Link to="/im-thread">IM Thread</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/code-presenter" element={<CodePresenter />} />
          <Route path="/demo" element={<DemoCode />} />
          <Route path="/im-thread" element={<IMThreadGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
