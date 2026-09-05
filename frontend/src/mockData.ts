import type { Expense, Income, Goal, Subscription } from './types';

function id(): string {
  return Math.random().toString(36).slice(2, 8);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function futureDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const MOCK_EXPENSES: Expense[] = [
  { id: id(), date: daysAgo(1), desc: 'Cena en Casa Paco', amount: 42.50, proposito: 'Puntual', metodo: 'Tarjeta', motivo: 'Comida', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(1), desc: 'Alquiler Julio', amount: 850, proposito: 'Fijo', metodo: 'Transferencia', motivo: 'Vivienda', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(2), desc: 'Gasolina', amount: 65.30, proposito: 'Fijo', metodo: 'Tarjeta', motivo: 'Transporte', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(2), desc: 'Mercadona', amount: 87.20, proposito: 'Fijo', metodo: 'Tarjeta', motivo: 'Comida', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(3), desc: 'Netflix', amount: 15.99, proposito: 'Fijo', metodo: 'Online', motivo: 'Subscripcion', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(3), desc: 'Spotify', amount: 9.99, proposito: 'Fijo', metodo: 'Online', motivo: 'Subscripcion', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(4), desc: 'Vuelo a Barcelona', amount: 185, proposito: 'Viajes', metodo: 'Tarjeta', motivo: 'Transporte', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: 'Barcelona 2025', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(5), desc: 'Hotel Barcelona', amount: 340, proposito: 'Viajes', metodo: 'Tarjeta', motivo: 'Estancia', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: 'Barcelona 2025', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(5), desc: 'Cena con amigos', amount: 35, proposito: 'Puntual', metodo: 'Efectivo', motivo: 'Ocio', tipo: 'Personal', ajeno: 15, deudores: 'Ana, Luis', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 20, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(6), desc: 'Gimnasio', amount: 45, proposito: 'Nivel de Vida', metodo: 'Deposito', motivo: 'Deporte', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(7), desc: 'Compra ropa', amount: 120, proposito: 'Puntual', metodo: 'Tarjeta', motivo: 'Productos', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(8), desc: 'Farmacia', amount: 28.50, proposito: 'Fijo', metodo: 'Tarjeta', motivo: 'Farmacia', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(10), desc: 'Inversion Crypto', amount: 500, proposito: 'Inversion', metodo: 'Transferencia', motivo: 'Ahorro/Inversion', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(12), desc: 'Curso Online Python', amount: 199, proposito: 'Inversion', metodo: 'Tarjeta', motivo: 'Educacion', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(14), desc: 'Agua', amount: 28, proposito: 'Fijo', metodo: 'Deposito', motivo: 'Vivienda', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(14), desc: 'Luz', amount: 65, proposito: 'Fijo', metodo: 'Deposito', motivo: 'Vivienda', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(15), desc: 'Internet', amount: 55, proposito: 'Fijo', metodo: 'Online', motivo: 'Subscripcion', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(20), desc: 'Bus urbano', amount: 12, proposito: 'Puntual', metodo: 'Efectivo', motivo: 'Transporte', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(25), desc: 'Cine', amount: 18.50, proposito: 'Puntual', metodo: 'Tarjeta', motivo: 'Ocio', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(30), desc: 'Seguro Coche', amount: 420, proposito: 'Fijo', metodo: 'Deposito', motivo: 'Seguro', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(35), desc: 'Vuelo Japon', amount: 890, proposito: 'Viajes', metodo: 'Tarjeta', motivo: 'Transporte', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: 'Japon 2025', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(40), desc: 'Airbnb Japon', amount: 1200, proposito: 'Viajes', metodo: 'Tarjeta', motivo: 'Estancia', tipo: 'Personal', ajeno: 600, deudores: 'Carlos', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 600, viaje: 'Japon 2025', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(45), desc: 'Zara', amount: 89.90, proposito: 'Puntual', metodo: 'Tarjeta', motivo: 'Productos', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(50), desc: 'Dentista', amount: 150, proposito: 'Fijo', metodo: 'Tarjeta', motivo: 'Salud', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(60), desc: 'Inversion Indexado', amount: 1000, proposito: 'Inversion', metodo: 'Transferencia', motivo: 'Ahorro/Inversion', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(70), desc: 'Curso Fotografia', amount: 299, proposito: 'Inversion', metodo: 'Tarjeta', motivo: 'Educacion', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(90), desc: 'Gorra', amount: 25, proposito: 'Puntual', metodo: 'Efectivo', motivo: 'Productos', tipo: 'Personal', ajeno: 0, deudores: '', deudaMetodo: 'Bizum', devuelto: 'no', meCorresponde: 0, viaje: '', proyectoId: '', createdAt: new Date().toISOString() },
];

export const MOCK_INCOMES: Income[] = [
  { id: id(), date: daysAgo(1), desc: 'Nomina Julio', amount: 2800, category: 'Salario', notes: 'Empresa SL', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(2), desc: 'Freelance Web', amount: 750, category: 'Freelance', notes: 'Proyecto landing page', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(5), desc: 'Dividendos', amount: 120, category: 'Inversion', notes: 'ETFs', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(10), desc: 'Venta movil', amount: 350, category: 'Venta', notes: 'iPhone antiguo', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(15), desc: 'Reembolso Hacienda', amount: 430, category: 'Devolucion', notes: 'IRPF 2024', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(20), desc: 'Cumpleanos tia', amount: 100, category: 'Regalo', notes: '', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(32), desc: 'Nomina Junio', amount: 2800, category: 'Salario', notes: 'Empresa SL', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(35), desc: 'Freelance App', amount: 1200, category: 'Freelance', notes: 'MVP app', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(62), desc: 'Nomina Mayo', amount: 2800, category: 'Salario', notes: 'Empresa SL', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(92), desc: 'Nomina Abril', amount: 2800, category: 'Salario', notes: 'Empresa SL', createdAt: new Date().toISOString() },
  { id: id(), date: daysAgo(95), desc: 'Freelance Consultoria', amount: 2000, category: 'Freelance', notes: 'Proyecto grande', createdAt: new Date().toISOString() },
];

export const MOCK_GOALS: Goal[] = [
  { id: id(), name: 'Viaje a Japon', targetAmount: 5000, currentAmount: 2300, deadline: futureDays(180), category: 'Viaje', notes: 'Vuelos + Airbnb + gastos', createdAt: new Date().toISOString() },
  { id: id(), name: 'Fondo de Emergencia', targetAmount: 10000, currentAmount: 4500, deadline: futureDays(365), category: 'Emergencia', notes: '6 meses de gastos', createdAt: new Date().toISOString() },
  { id: id(), name: 'Curso Machine Learning', targetAmount: 1500, currentAmount: 1500, deadline: futureDays(30), category: 'Educacion', notes: 'Completado!', createdAt: new Date().toISOString() },
  { id: id(), name: 'Coche Nuevo', targetAmount: 15000, currentAmount: 3200, deadline: futureDays(730), category: 'Compra', notes: 'Ahorrando para el coche', createdAt: new Date().toISOString() },
  { id: id(), name: 'Invertir en Crypto', targetAmount: 3000, currentAmount: 1800, deadline: '', category: 'Inversion', notes: 'BTC/ETH', createdAt: new Date().toISOString() },
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: id(), name: 'Netflix', amount: 15.99, billingCycle: 'monthly', nextBilling: futureDays(12), category: 'Streaming', metodo: 'Tarjeta', active: true, notes: 'Plan Premium', createdAt: new Date().toISOString() },
  { id: id(), name: 'Spotify', amount: 9.99, billingCycle: 'monthly', nextBilling: futureDays(5), category: 'Musica', metodo: 'Tarjeta', active: true, notes: '', createdAt: new Date().toISOString() },
  { id: id(), name: 'Dropbox', amount: 119.99, billingCycle: 'yearly', nextBilling: futureDays(200), category: 'Cloud', metodo: 'Tarjeta', active: true, notes: 'Plan Familiar 2TB', createdAt: new Date().toISOString() },
  { id: id(), name: 'Gimnasio', amount: 45, billingCycle: 'monthly', nextBilling: futureDays(2), category: 'Salud', metodo: 'Deposito', active: true, notes: 'Polideportivo', createdAt: new Date().toISOString() },
  { id: id(), name: 'iCloud+', amount: 2.99, billingCycle: 'monthly', nextBilling: futureDays(20), category: 'Cloud', metodo: 'Tarjeta', active: true, notes: '50GB', createdAt: new Date().toISOString() },
  { id: id(), name: 'Amazon Prime', amount: 49.90, billingCycle: 'yearly', nextBilling: futureDays(90), category: 'Streaming', metodo: 'Tarjeta', active: true, notes: '', createdAt: new Date().toISOString() },
  { id: id(), name: 'ChatGPT Plus', amount: 22, billingCycle: 'monthly', nextBilling: futureDays(8), category: 'IA', metodo: 'Tarjeta', active: true, notes: '', createdAt: new Date().toISOString() },
  { id: id(), name: 'Seguro Coche', amount: 420, billingCycle: 'yearly', nextBilling: futureDays(340), category: 'Seguro', metodo: 'Deposito', active: true, notes: 'Mapfre', createdAt: new Date().toISOString() },
  { id: id(), name: 'Disney+', amount: 8.99, billingCycle: 'monthly', nextBilling: futureDays(45), category: 'Streaming', metodo: 'Tarjeta', active: false, notes: 'Cancelado', createdAt: new Date().toISOString() },
];
