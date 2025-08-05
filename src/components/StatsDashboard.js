import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [qrStats, setQrStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsResponse, qrStatsResponse] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/qr-stats')
      ]);
      setStats(statsResponse.data);
      setQrStats(qrStatsResponse.data);
    } catch (err) {
      setError('Error al cargar estadísticas');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#e53e3e' }}>
        {error}
      </div>
    );
  }

  if (!stats || !qrStats) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', textAlign: 'center' }}>
        📊 Dashboard en Tiempo Real
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Estadísticas de Entradas */}
        <div style={{
          background: 'rgba(56, 161, 105, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(56, 161, 105, 0.3)'
        }}>
          <h4 style={{ color: '#38a169', marginBottom: '12px', fontSize: '1.1rem' }}>🎫 Entradas</h4>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p><strong>Total:</strong> {stats.total_tickets}</p>
            <p><strong>Válidas:</strong> {stats.valid_tickets}</p>
            <p><strong>Canjeadas:</strong> {stats.redeemed_tickets}</p>
          </div>
        </div>

        {/* Estadísticas de Personas */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <h4 style={{ color: '#3b82f6', marginBottom: '12px', fontSize: '1.1rem' }}>👥 Personas</h4>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p><strong>Total con QR:</strong> {stats.total_people}</p>
            <p><strong>Pendientes:</strong> {stats.pending_people}</p>
            <p><strong>Canjeadas:</strong> {stats.redeemed_people}</p>
          </div>
        </div>

        {/* Estadísticas de Fondos */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <h4 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '1.1rem' }}>💰 Fondos</h4>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p><strong>Total Ganado:</strong> ${stats.total_funds.toLocaleString()}</p>
            <p><strong>Pendiente:</strong> ${stats.pending_funds.toLocaleString()}</p>
            <p><strong>Canjeado:</strong> ${stats.redeemed_funds.toLocaleString()}</p>
          </div>
        </div>

        {/* Estadísticas de QRs */}
        <div style={{
          background: 'rgba(168, 85, 247, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(168, 85, 247, 0.3)'
        }}>
          <h4 style={{ color: '#a855f7', marginBottom: '12px', fontSize: '1.1rem' }}>📱 QRs Emitidos</h4>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p><strong>Total:</strong> {qrStats.total_qrs}</p>
            <p><strong>Válidos:</strong> {qrStats.valid_qrs}</p>
            <p><strong>Canjeados:</strong> {qrStats.redeemed_qrs}</p>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', textAlign: 'center' }}>
          📈 Progreso del Evento
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px' 
        }}>
          {/* Progreso de Personas */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.9rem' }}>Personas Canjeadas</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                {stats.redeemed_people} / {stats.total_people}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${stats.total_people > 0 ? (stats.redeemed_people / stats.total_people) * 100 : 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38a169 0%, #48bb78 100%)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Progreso de Fondos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.9rem' }}>Fondos Canjeados</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                ${stats.redeemed_funds.toLocaleString()} / ${stats.total_funds.toLocaleString()}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${stats.total_funds > 0 ? (stats.redeemed_funds / stats.total_funds) * 100 : 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '15px', 
        fontSize: '0.8rem', 
        color: '#718096',
        fontStyle: 'italic'
      }}>
        🔄 Actualizado automáticamente cada 30 segundos
      </div>
    </div>
  );
};

export default StatsDashboard; 