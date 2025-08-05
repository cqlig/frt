import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import CreateTicket from './components/CreateTicket';
import TicketList from './components/TicketList';
import TicketScanner from './components/TicketScanner';
import TicketViewer from './components/TicketViewer';
import StatsDashboard from './components/StatsDashboard';
import API_BASE_URL from './config';

// API base URL
axios.defaults.baseURL = API_BASE_URL;

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="nav">
      <Link 
        to="/" 
        className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
      >
        Crear Entrada
      </Link>
      <Link 
        to="/tickets" 
        className={`nav-button ${location.pathname === '/tickets' ? 'active' : ''}`}
      >
        Ver Entradas
      </Link>
      <Link 
        to="/scanner" 
        className={`nav-button ${location.pathname === '/scanner' ? 'active' : ''}`}
      >
        Escanear Entrada
      </Link>
      <Link 
        to="/dashboard" 
        className={`nav-button ${location.pathname === '/dashboard' ? 'active' : ''}`}
      >
        📊 Dashboard
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>🎫 La asunción de Figuras</h1>
          <p>Sistema de gestión de entradas</p>
        </header>
        
        <div className="container">
          <Navigation />
          
          <Routes>
            <Route path="/" element={<CreateTicket />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/scanner" element={<TicketScanner />} />
            <Route path="/ticket/:id" element={<TicketViewer />} />
            <Route path="/dashboard" element={<StatsDashboard />} />
          </Routes>
        </div>

        <footer className="footer">
          <p>Desarrollado con ❤️ para la gestión eficiente de eventos</p>
          <p className="author">Creado por Octavio Morales</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;