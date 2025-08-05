import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tickets');
      setTickets(response.data);
      setFilteredTickets(response.data);
    } catch (err) {
      setError('Error al cargar las entradas');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    let filtered = tickets;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(ticket => 
        ticket.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'valid') {
        filtered = filtered.filter(ticket => ticket.status === 'Válido');
      } else if (statusFilter === 'redeemed') {
        filtered = filtered.filter(ticket => ticket.status === 'Canjeado');
      }
    }

    setFilteredTickets(filtered);
  }, [searchTerm, tickets, statusFilter]);

  const deleteTicket = async (ticketId) => {
    try {
      await axios.delete(`/api/tickets/${ticketId}`);
      setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));
      setShowDeleteConfirm(null);
      if (selectedTicket && selectedTicket.id === ticketId) setSelectedTicket(null);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Error al eliminar el ticket');
    }
  };

  const downloadQROnly = async (ticket) => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.padding = '40px';
      tempDiv.style.width = '400px';
      tempDiv.style.height = '400px';
      tempDiv.style.display = 'flex';
      tempDiv.style.alignItems = 'center';
      tempDiv.style.justifyContent = 'center';

      document.body.appendChild(tempDiv);

      const qrContainer = document.createElement('div');
      tempDiv.appendChild(qrContainer);

      const { default: QRCodeReact } = await import('qrcode.react');
      const qrElement = document.createElement('div');
      qrContainer.appendChild(qrElement);

      const React = await import('react');
      const ReactDOM = await import('react-dom');

      ReactDOM.render(
        React.createElement(QRCodeReact, {
          value: ticket.id,
          size: 320,
          level: 'H',
          includeMargin: true,
          bgColor: '#ffffff',
          fgColor: '#000000'
        }),
        qrElement
      );

      setTimeout(async () => {
        try {
          const canvas = await html2canvas(qrContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            width: 400,
            height: 400
          });

          const link = document.createElement('a');
          link.download = `QR-${ticket.buyer_name.replace(/\s+/g, '_')}-${ticket.event_name.replace(/\s+/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();

          document.body.removeChild(tempDiv);
        } catch (error) {
          console.error('Error capturing QR:', error);
          document.body.removeChild(tempDiv);
          alert('Error al capturar el QR. Por favor intenta nuevamente.');
        }
      }, 200);

    } catch (error) {
      console.error('Error downloading QR:', error);
      alert('Error al descargar el QR. Por favor intenta nuevamente.');
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Válido' ? 'status-valid' : 'status-redeemed';
  };

  if (loading) {
    return (
      <div className="form-container">
        <h2>Lista de Entradas</h2>
        <p>Cargando entradas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-container">
        <h2>Lista de Entradas</h2>
        <div className="result-message result-error">
          {error}
        </div>
      </div>
    );
  }



  // Función para exportar a Excel con totales
  const exportToExcel = () => {
    const data = filteredTickets.map(ticket => ({
      ID: ticket.id,
      Comprador: ticket.buyer_name,
      Email: ticket.buyer_email,
      Evento: ticket.event_name,
      Cantidad: ticket.quantity,
      'Precio Unitario': ticket.price,
      Total: ticket.total,
      Estado: ticket.status,
      'Fecha de Creación': ticket.created_at ? new Date(ticket.created_at).toLocaleString('es-ES') : ''
    }));

    // Agregar fila de totales
    const totalRow = {
      ID: 'TOTALES',
      Comprador: '',
      Email: '',
      Evento: '',
      Cantidad: filteredTickets.reduce((sum, t) => sum + (t.quantity || 0), 0),
      'Precio Unitario': '',
      Total: filteredTickets.reduce((sum, t) => sum + (t.total || 0), 0),
      Estado: '',
      'Fecha de Creación': ''
    };
    data.push(totalRow);

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entradas');
    XLSX.writeFile(workbook, 'EntradasVendidas.xlsx');
  };

  return (
    <div>
      {/* Panel de Estadísticas */}


      <div className="form-container">
        <button
          onClick={exportToExcel}
          style={{
            background: 'linear-gradient(90deg, #38a169 0%, #48bb78 100%)',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 24px',
            marginBottom: '15px',
            fontSize: '1rem',
            cursor: 'pointer',
            float: 'right'
          }}
        >
          ⬇️ Exportar a Excel
        </button>
        <h2>📋 Lista de Entradas ({filteredTickets.length} de {tickets.length})</h2>

        <div style={{ marginBottom: '30px' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="search">🔍 Buscar Entradas</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, evento, correo o ID..."
              className="scanner-input"
              style={{ marginBottom: '0' }}
            />
          </div>

          <div className="form-group">
            <label>📊 Filtrar por Estado</label>
            <div className="filter-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              <button 
                onClick={() => setStatusFilter('all')}
                className={`nav-button ${statusFilter === 'all' ? 'active' : ''}`}
                style={{ 
                  background: statusFilter === 'all' ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.2)',
                  minWidth: 'fit-content',
                  padding: '12px 20px'
                }}
              >
                📋 Todos ({tickets.length})
              </button>
              <button 
                onClick={() => setStatusFilter('valid')}
                className={`nav-button ${statusFilter === 'valid' ? 'active' : ''}`}
                style={{ 
                  background: statusFilter === 'valid' ? 'var(--success-gradient)' : 'rgba(255, 255, 255, 0.2)',
                  minWidth: 'fit-content',
                  padding: '12px 20px'
                }}
              >
                ✅ Válidos ({tickets.filter(t => t.status === 'Válido').length})
              </button>
              <button 
                onClick={() => setStatusFilter('redeemed')}
                className={`nav-button ${statusFilter === 'redeemed' ? 'active' : ''}`}
                style={{ 
                  background: statusFilter === 'redeemed' ? 'var(--danger-gradient)' : 'rgba(255, 255, 255, 0.2)',
                  minWidth: 'fit-content',
                  padding: '12px 20px'
                }}
              >
                🎫 Canjeados ({tickets.filter(t => t.status === 'Canjeado').length})
              </button>
            </div>
          </div>
        </div>

        {tickets.length === 0 ? (
          <p>No hay entradas creadas aún. <Link to="/">Crea la primera entrada</Link></p>
        ) : filteredTickets.length === 0 ? (
          <p>No se encontraron entradas que coincidan con tu búsqueda.</p>
        ) : (
          <div className="tickets-list">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <h3>{ticket.buyer_name}</h3>
                <p><strong>Evento:</strong> {ticket.event_name}</p>
                {ticket.buyer_email && (
                  <p><strong>Correo:</strong> {ticket.buyer_email}</p>
                )}
                <p><strong>ID:</strong> {ticket.id}</p>
                <p><strong>Creado:</strong> {new Date(ticket.created_at).toLocaleString('es-ES')}</p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '15px' }}>
                  <Link to={`/ticket/${ticket.id}`} className="nav-button" style={{ background: 'var(--primary-gradient)', flex: '1', minWidth: '120px' }}>
                    👁️ Ver Detalles
                  </Link>
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="nav-button"
                    style={{ background: 'var(--success-gradient)', flex: '1', minWidth: '120px' }}
                  >
                    📄 Descargar
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(ticket)}
                    className="nav-button"
                    style={{ background: 'var(--danger-gradient)', minWidth: '100px' }}
                    title="Eliminar ticket"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>📄 Descargar Entrada</h3>

            <div id={`ticket-${selectedTicket.id}`} style={{ marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h4>🎫 {selectedTicket.event_name}</h4>
                <p><strong>Comprador:</strong> {selectedTicket.buyer_name}</p>
                {selectedTicket.buyer_email && (
                  <p><strong>Correo:</strong> {selectedTicket.buyer_email}</p>
                )}
                <p><strong>ID:</strong> {selectedTicket.id}</p>
                <p><strong>Estado:</strong> {selectedTicket.status}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <QRCode 
                  value={selectedTicket.id} 
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => downloadQROnly(selectedTicket)}
                className="print-button"
                style={{ 
                  background: 'var(--primary-gradient)',
                  minWidth: '200px',
                  height: '45px',
                  fontSize: '1rem',
                  padding: '0 25px',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}
              >
                📱 Descargar QR
              </button>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="nav-button"
                style={{ 
                  background: 'var(--danger-gradient)',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '20px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#e53e3e' }}>⚠️ Confirmar Eliminación</h3>
            <p style={{ marginBottom: '20px', fontSize: '1rem' }}>
              ¿Estás seguro de que quieres eliminar la entrada de <strong>{showDeleteConfirm.buyer_name}</strong>?
            </p>
            <p style={{ marginBottom: '25px', fontSize: '0.9rem', color: '#718096' }}>
              Esta acción no se puede deshacer y eliminará todos los QRs asociados.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => deleteTicket(showDeleteConfirm.id)}
                className="nav-button"
                style={{ 
                  background: 'var(--danger-gradient)',
                  minWidth: '120px'
                }}
              >
                🗑️ Eliminar
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="nav-button"
                style={{ 
                  background: 'var(--secondary-gradient)',
                  minWidth: '120px'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;