import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { box, button, muted } from './styles.js';

export interface TicketQRProps {
  token: string;
  /** Texto bajo el QR: butaca o tipo de pase. */
  label: string;
  /** Nombre del fichero al descargar. */
  filename?: string;
}

/** QR de una entrada, con botón para descargarlo como PNG. */
export function TicketQR({ token, label, filename = 'entrada.png' }: TicketQRProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(token, { width: 280, margin: 1 }).then(setSrc);
  }, [token]);

  return (
    <figure style={{ ...box, display: 'inline-block', textAlign: 'center', margin: 8 }} data-telon="ticket-qr">
      {src ? <img src={src} width={200} height={200} alt={`QR de ${label}`} style={{ background: '#fff', padding: 8, borderRadius: 8 }} /> : <div style={{ width: 200, height: 200 }} />}
      <figcaption>
        <strong>{label}</strong>
        <div style={muted}>{filename.replace(/\.png$/, '')}</div>
        {src && (
          <a href={src} download={filename} style={{ ...button, display: 'inline-block', marginTop: 8, textDecoration: 'none' }}>
            Descargar
          </a>
        )}
      </figcaption>
    </figure>
  );
}
