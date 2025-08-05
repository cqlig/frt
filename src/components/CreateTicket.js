import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';


const CreateTicket = () => {
  
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    event_name: 'La asunción de Figuras',
    quantity: 1,
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('🔄 Cambiando campo:', name, 'valor:', value);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: name === 'quantity' || name === 'price' ? Number(value) : value
      };
      if (name === 'quantity' || name === 'price') {
        const newTotal = (updated.quantity || 0) * (updated.price || 0);
        console.log('💰 Calculando total:', updated.quantity, '×', updated.price, '=', newTotal);
        setTotal(newTotal);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación adicional
    if (formData.price <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }
    if (formData.quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const sendData = { ...formData, total: (formData.quantity || 0) * (formData.price || 0) };
      console.log('📤 Enviando datos al servidor:', sendData);
      
      const response = await axios.post('/api/tickets', sendData);
      console.log('📥 Respuesta del servidor:', response.data);
      
      setTicket(response.data);
      setFormData({
        buyer_name: '',
        buyer_email: '',
        event_name: 'La asunción de Figuras',
        quantity: 1,
        price: 0
      });
      setTotal(0);
    } catch (err) {
      console.error('❌ Error al crear ticket:', err.response?.data);
      setError(err.response?.data?.error || 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };



  const downloadQROnly = async () => {
    try {
      // Crear un div temporal con el QR
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
      
      // Crear el QR en el div temporal
      const qrContainer = document.createElement('div');
      tempDiv.appendChild(qrContainer);
      
      // Usar QRCode.react para renderizar el QR
      const { default: QRCodeReact } = await import('qrcode.react');
      const qrElement = document.createElement('div');
      qrContainer.appendChild(qrElement);
      
      // Renderizar el QR usando React
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
      
      // Esperar un momento para que se renderice
      setTimeout(async () => {
        try {
          // Capturar el QR con html2canvas
          const canvas = await html2canvas(qrContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            width: 400,
            height: 400
          });
          
          // Descargar la imagen
          const link = document.createElement('a');
          link.download = `QR-${ticket.buyer_name.replace(/\s+/g, '_')}-${ticket.event_name.replace(/\s+/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
          
          // Limpiar el div temporal
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

  return (
    <div>
      <div className="form-container">
        <h2>✨ Crear Nueva Entrada</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="buyer_name">Nombre del Comprador *</label>
            <input
              type="text"
              id="buyer_name"
              name="buyer_name"
              value={formData.buyer_name}
              onChange={handleInputChange}
              required
              placeholder="Ingresa el nombre completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="buyer_email">Correo Electrónico</label>
            <input
              type="email"
              id="buyer_email"
              name="buyer_email"
              value={formData.buyer_email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="event_name" style={{fontWeight: 'bold', color: '#007bff', fontSize: '1.1rem'}}>🎉 Nombre del Evento *</label>
            <input
              type="text"
              id="event_name"
              name="event_name"
              value={formData.event_name}
              readOnly
              required
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Cantidad de Personas *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
            <small style={{color:'#555', fontSize:'0.9rem'}}>
              💡 Se crearán {formData.quantity} QRs individuales, uno para cada persona
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="price">Precio por Entrada (pesos) *</label>
            <input
              type="number"
              id="price"
              name="price"
              min="1"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            <small style={{color:'#555', fontSize:'0.9rem'}}>
              💡 El precio debe ser mayor a 0
            </small>
          </div>

          <div className="form-group">
            <label style={{fontWeight: 'bold', fontSize: '1.1rem'}}>💰 Total a Pagar:</label>
            <input
              type="text"
              value={`$${total.toLocaleString()}`}
              readOnly
              style={{ 
                backgroundColor: '#ffe066', 
                color: '#1a202c', 
                fontWeight: 'bold', 
                fontSize: '1.5rem', 
                border: '2px solid #ffd700', 
                borderRadius: '8px', 
                boxShadow: '0 2px 8px #ffd70044',
                textAlign: 'center',
                letterSpacing: '1px',
                marginTop: '6px',
                marginBottom: '2px',
                width: '100%'
              }}
            />
            <small style={{color:'#555', fontSize:'0.98rem'}}>
              {formData.quantity} personas × ${formData.price.toLocaleString()} = ${total.toLocaleString()}
            </small>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || formData.price <= 0 || formData.quantity <= 0}
          >
            {loading ? 'Creando...' : 'Crear Entrada'}
          </button>
          {(formData.price <= 0 || formData.quantity <= 0) && (
            <small style={{color:'#e53e3e', fontSize:'0.9rem', display: 'block', marginTop: '10px'}}>
              ⚠️ El precio y la cantidad deben ser mayores a 0
            </small>
          )}
        </form>

        {error && (
          <div className="result-message result-error">
            {error}
          </div>
        )}
      </div>

      {ticket && (
        <div className="ticket-container">
          <div id="ticket-to-print">
            <div className="ticket-header">
              <h2>🎫 Entrada Generada Exitosamente</h2>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>ID: {ticket.id}</p>
            </div>

            <div className="ticket-info">
              <div>
                <strong>Comprador:</strong>
                <p>{ticket.buyer_name}</p>
              </div>
              {ticket.buyer_email && (
                <div>
                  <strong>Correo:</strong>
                  <p>{ticket.buyer_email}</p>
                </div>
              )}
              <div>
                <strong>Evento:</strong>
                <p>{ticket.event_name}</p>
              </div>
              <div>
                <strong>Fecha de Creación:</strong>
                <p>{new Date(ticket.created_at).toLocaleString('es-ES')}</p>
              </div>
              {ticket.quantity && (
                <div>
                  <strong>Cantidad de Personas:</strong>
                  <p>{ticket.quantity} personas</p>
                </div>
              )}
              {ticket.price && (
                <div>
                  <strong>Precio Unitario:</strong>
                  <p>${ticket.price.toLocaleString()}</p>
                </div>
              )}
              {ticket.total && (
                <div>
                  <strong>Total Pagado:</strong>
                  <p style={{fontWeight: 'bold', color: '#38a169', fontSize: '1.1rem'}}>
                    ${ticket.total.toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <strong>Estado:</strong>
                <span className={`status-badge status-valid`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            <div className="qr-container">
              <h4 style={{marginBottom: '15px', color: '#007bff', textAlign: 'center'}}>
                📱 QR Principal Generado
              </h4>
              <p style={{textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem', color: '#718096'}}>
                Se ha creado 1 QR principal con {ticket.qr?.total_uses || 0} usos disponibles.
                <br />
                Cada persona puede usar el mismo QR al llegar al evento.
              </p>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <div style={{
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  background: '#f8f9fa',
                  maxWidth: '300px'
                }}>
                  <div style={{
                    background: '#007bff',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    marginBottom: '15px',
                    fontWeight: 'bold'
                  }}>
                    QR Principal - {ticket.qr?.total_uses || 0} Usos
                  </div>
                  <QRCode 
                    value={ticket.qr?.qr_id} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    background: '#e8f5e8',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#2d5a2d'
                  }}>
                    ✅ {ticket.qr?.uses_remaining || 0} usos disponibles
                  </div>
                </div>
              </div>
            </div>
          </div>



          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <button 
              onClick={downloadQROnly} 
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicket;