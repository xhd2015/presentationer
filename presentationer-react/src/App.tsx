import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CodePresenterEditorPreview from './components/CodePresenterEditorPreview';
import DemoCode from './components/DemoCode';
import IMThreadGenerator from './components/IMThreadGenerator';
import { SessionsLayout } from './components/sessions/SessionsLayout';
import { SessionDetailLayout } from './components/sessions/SessionDetailLayout';
import { PageDetail } from './components/sessions/PageDetail';
import { RedirectToFirstPage } from './components/sessions/RedirectToFirstPage';
import { SessionSettingsPage } from './components/sessions/SessionSettingsPage';
import { SessionProvider } from './context/SessionContext';
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
      <SessionProvider>
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
            <Route path="/sessions" element={<SessionsLayout />}>
              <Route index element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888', flex: 1 }}>Select a session to start</div>} />
              <Route path=":sessionName" element={<SessionDetailLayout />}>
                <Route index element={<RedirectToFirstPage />} />
                <Route path="pages/:pageTitle" element={<PageDetail />} />
                <Route path="settings" element={<SessionSettingsPage />} />
              </Route>
            </Route>
            <Route path="/code-presenter" element={<CodePresenterEditorPreview />} />
            <Route path="/demo" element={<DemoCode />} />
            <Route path="/im-thread" element={<IMThreadGenerator />} />
          </Routes>
        </div>
      </SessionProvider>
    </Router>
  );
}

export default App;
