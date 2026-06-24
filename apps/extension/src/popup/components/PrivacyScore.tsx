/**
 * PrivacyScore — Componente de Score Circular
 * Muestra el score de privacidad como un anillo circular animado.
 */

interface Props {
  score: number;
  grade: string;
  color: string;
  isScanning: boolean;
  onScan: () => void;
  message: string;
}

export function PrivacyScore({ score, grade, color, isScanning, onScan, message }: Props) {
  const size = 140;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Anillo circular */}
      <div
        style={{ position: 'relative', cursor: 'pointer' }}
        onClick={onScan}
        title="Clic para re-escanear"
      >
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Fondo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e1e2e"
            strokeWidth={stroke}
          />
          {/* Progreso */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{
              transition: 'stroke-dasharray 0.6s ease',
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>

        {/* Texto central */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          {isScanning ? (
            <div style={{ color: '#94a3b8', fontSize: 12 }}>
              <div style={{ animation: 'spin 1s linear infinite', fontSize: 20 }}>⟳</div>
              <div style={{ fontSize: 10, marginTop: 4 }}>Escaneando</div>
            </div>
          ) : (
            <>
              <div style={{ color: '#f8fafc', fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
                {score}
              </div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                /100 · Grado {grade}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mensaje */}
      <p
        style={{
          color: '#94a3b8',
          fontSize: 11,
          textAlign: 'center',
          marginTop: 10,
          lineHeight: 1.4,
          padding: '0 20px',
          minHeight: 30,
        }}
      >
        {isScanning ? 'Analizando headers, scripts y fingerprinting...' : message}
      </p>
    </div>
  );
}
