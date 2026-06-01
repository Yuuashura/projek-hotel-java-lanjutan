import qrisImg from '../../assets/qris.png';

const BcaLogo = () => (
  <svg width="46" height="26" viewBox="0 0 46 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="46" height="26" rx="4" fill="#0A387E" />
    <path d="M 6 12 Q 9 8.5, 12 12 T 18 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M 6 16 Q 9 12.5, 12 16 T 18 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <text x="31" y="16.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="10" fill="white" letterSpacing="0.2">BCA</text>
  </svg>
);

const BriLogo = () => (
  <svg width="46" height="26" viewBox="0 0 46 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="46" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <rect x="4" y="5" width="13" height="16" rx="1.5" fill="#00529C" />
    <path d="M 7 13 Q 10.5 9.5, 14 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <circle cx="10.5" cy="15" r="1.2" fill="#F37021" />
    <text x="31" y="17.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" fill="#00529C" letterSpacing="0.1">BRI</text>
  </svg>
);

const BniLogo = () => (
  <svg width="46" height="26" viewBox="0 0 46 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="46" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <circle cx="10" cy="13" r="5.5" fill="#E05C1C" />
    <text x="10" y="15" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="6.5" fill="white" textAnchor="middle">46</text>
    <text x="27" y="17.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" fill="#005E6A" letterSpacing="-0.5">BNI</text>
  </svg>
);

const QrisLogo = () => (
  <svg width="46" height="26" viewBox="0 0 46 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="46" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <text x="23" y="17" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle" letterSpacing="-0.5">
      <tspan fill="#009FB7">Q</tspan>
      <tspan fill="#E51C24">R</tspan>
      <tspan fill="#F58220">I</tspan>
      <tspan fill="#0F3B7A">S</tspan>
    </text>
  </svg>
);

export const PAYMENT_METHODS = [
  { id: 'Transfer Bank BCA', label: 'Transfer Bank BCA', info: 'No. Rek: 1234567890 a.n. PT NgiNep Corp', logo: <BcaLogo /> },
  { id: 'Transfer Bank BRI', label: 'Transfer Bank BRI', info: 'No. Rek: 0987654321 a.n. PT NgiNep Corp', logo: <BriLogo /> },
  { id: 'Transfer Bank BNI', label: 'Transfer Bank BNI', info: 'No. Rek: 1122334455 a.n. PT NgiNep Corp', logo: <BniLogo /> },
  { id: 'QRIS', label: 'QRIS', info: 'Scan QR code di bawah untuk melakukan pembayaran', logo: <QrisLogo /> },
];

export { qrisImg };
