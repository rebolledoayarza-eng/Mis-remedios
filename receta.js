// ─────────────────────────────────────────────────────────────
//  RECETA — este es el único archivo que hay que tocar para
//  cambiar remedios, dosis, horarios o la fecha de inicio.
// ─────────────────────────────────────────────────────────────
//  n     nombre del remedio
//  d     dosis y forma de uso
//  h     horas del día en que se da (0 a 23)
//  days  cuántos días dura
//  o     (opcional) orden cuando se dan varios juntos, p. ej. los nasales
// ─────────────────────────────────────────────────────────────
window.RECETA = {
  paciente: 'Amparo',
  origen: 'Receta Clínica Alemana · 21 nov 2026',
  // Primera toma (año-mes-díaThora:minuto). Se puede cambiar después en "Ajustes".
  inicio: '2026-11-21T21:00',
  remedios: [
    { id: 'ster', n: 'Sterimar',             d: '2 puff · nasal',             h: [1, 5, 9, 13, 17, 21], days: 30, o: 1 },
    { id: 'ilia', n: 'Iliadin',              d: '2 puff · nasal',             h: [9, 21],               days: 5,  o: 2 },
    { id: 'rino', n: 'Rinobanedif ungüento', d: '1 aplicación · nasal',       h: [9, 21],               days: 30, o: 3 },
    { id: 'cefa', n: 'Cefadroxilo 500 mg',   d: '1 cápsula · oral',           h: [1, 13],               days: 14 },
    { id: 'actr', n: 'Actron 600 mg',        d: '1 cápsula · oral (ibuprofeno)', h: [1, 9, 17],         days: 5 },
    { id: 'para', n: 'Paracetamol 1000 mg',  d: '1 sobre granulado · oral',   h: [1, 9, 17],            days: 7 },
    { id: 'nexi', n: 'Nexium 40 mg',         d: '1 comprimido · en ayunas',   h: [8],                   days: 14 },
    { id: 'plex', n: 'Plexus',               d: '1 comprimido · oral',        h: [10, 22],              days: 14 },
    { id: 'pred', n: 'Prednisona 20 mg',     d: '1 comprimido · oral',        h: [10, 22],              days: 5 },
    { id: 'pere', n: 'Perenteryl',           d: '1 sobre · oral',             h: [10, 22],              days: 14 }
  ]
};
