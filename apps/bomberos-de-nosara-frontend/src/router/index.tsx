// src/router/router.tsx
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import App from '../App';
import AboutSection from '../components/ui/AboutUs/AboutSection';
import AdminDonantesPage from '../pages/AdminDonantesPage';
import AdminLoginPage from '../pages/AdminLoginPage';

// Auth helpers
import { isAuthenticated, getUserRoles } from '../service/auth';

// Públicas
import Home from '../pages/Home';
import DonantesPage from '../pages/DonantesPage';
import Home from '../pages/Home';
import SuggestionsPage from '../pages/SuggestionsPage';
import NoticiasPage from '../pages/NoticiasPage';
import DonarPage from '../pages/DonarPage';
import NuestroTrabajoPage from '../pages/NuestroTrabajoPage';
import ContactoPage from '../pages/ContactoPage';

// Auth pages
import AdminLoginPage from '../pages/AdminLoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Admin pages
import AdminDashboardPage from '../pages/Administrativas/AdminDashboardPage';
import AdminSuggestionsPage from '../pages/AdminSuggestionsPage';
import AdminChatPage from '../pages/Administrativas/AdminChatPage';
import AdminEstadisticasPage from '../pages/Administrativas/AdminEstadisticasPage';
import AdminMaterialEducativoPage from '../pages/Administrativas/AdminMaterialEducativoPage';
import AdminUsuariosPage from '../pages/Administrativas/AdminUsuariosPage';
import AdminVehiculosPage from '../pages/Administrativas/AdminVehiculosPage';
// ⚠️ No tocar estos por ahora
// import AdminEquipoPage from '../pages/Administrativas/AdminEquipoPage';
// import AdminNoticiasPage from '../pages/AdminNoticiasPage';

// Layout con sidebar
import AdminLayout from '../components/ui/Layout/AdiminLayout';
import AdminEquipoPage from '../pages/Administrativas/AdminEquipoPage';
import AdminNoticiasPage from '../pages/AdminNoticiasPage';

const Forbidden = () => <div className="p-6">No tenés permisos para ver esta sección.</div>;

/* =========================
   Reglas de acceso por módulo
   ========================= */
type Role = 'SUPERUSER' | 'ADMIN' | 'PERSONAL_BOMBERIL' | 'VOLUNTARIO';

const CAN = {
  donantes:     ['SUPERUSER', 'ADMIN'] as Role[],
  usuarios:     ['SUPERUSER'] as Role[],
   equipo:    ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL'] as Role[], // (sin tocar)
  vehiculos:    ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL'] as Role[],
  estadisticas: ['SUPERUSER', 'ADMIN'] as Role[],
  material:     ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'] as Role[],
  chat:         ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'] as Role[],
   noticias:  ['SUPERUSER', 'ADMIN'] as Role[], // (sin tocar)
  sugerencias:  ['SUPERUSER', 'ADMIN'] as Role[],
};

function hasAnyRole(userRoles: string[], allowed: Role[]) {
  const set = new Set(userRoles);
  return allowed.some((r) => set.has(r));
}

/* =========================
   Guards
   ========================= */
function requireAuth() {
  if (!isAuthenticated()) throw redirect({ to: '/login' });
}

function requireRoles(allowed: Role[]) {
  return () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' });
    const roles = getUserRoles();
    if (!hasAnyRole(roles, allowed)) throw redirect({ to: '/forbidden' });
  };
}

/* =========================
   Rutas
   ========================= */
const rootRoute = createRootRoute({ component: App });

// --- Rutas públicas ---
const publicRoutes = [
  createRoute({ path: '/', component: Home, getParentRoute: () => rootRoute }),
  createRoute({ path: '/donantes', component: DonantesPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/sugerencias', component: SuggestionsPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/sobre-nosotros', component: AboutSection, getParentRoute: () => rootRoute }),
  createRoute({ path: '/nuestro-trabajo', component: NuestroTrabajoPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/contacto', component: ContactoPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/noticias', component: NoticiasPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/donar', component: DonarPage, getParentRoute: () => rootRoute }),
];

// --- Auth / estado ---
const authRoutes = [
  createRoute({ path: '/login', component: AdminLoginPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/forgot-password', component: ForgotPasswordPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/reset-password', component: ResetPasswordPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/forbidden', component: Forbidden, getParentRoute: () => rootRoute }),
];

// --- Layout /admin con sidebar ---
const adminLayoutRoute = createRoute({
  path: '/admin',
  component: AdminLayout,
  getParentRoute: () => rootRoute,
  beforeLoad: requireAuth,
});

// --- Hijos del layout /admin (rutas relativas) ---
const adminChildren = [
  // index de /admin
  createRoute({
    path: '/', // index
    component: AdminDashboardPage,
    getParentRoute: () => adminLayoutRoute,
  }),

  createRoute({
    path: 'donantes',
    component: AdminDonantesPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.donantes),
  }),
  createRoute({
    path: 'sugerencias',
    component: AdminSuggestionsPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.sugerencias),
  }),
  createRoute({
    path: 'chat',
    component: AdminChatPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.chat),
  }),
  createRoute({
    path: 'vehiculos',
    component: AdminVehiculosPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.vehiculos),
  }),
  createRoute({
    path: 'estadisticas',
    component: AdminEstadisticasPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.estadisticas),
  }),
  createRoute({
    path: 'material-interno',
    component: AdminMaterialEducativoPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.material),
  }),
  createRoute({
    path: 'usuarios',
    component: AdminUsuariosPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.usuarios),
  }),

 
   createRoute({ path: 'equipo', component: AdminEquipoPage, getParentRoute: () => adminLayoutRoute, beforeLoad: requireRoles(CAN.equipo) }),
   createRoute({ path: 'noticias', component: AdminNoticiasPage, getParentRoute: () => adminLayoutRoute, beforeLoad: requireRoles(CAN.noticias) }),
];


adminLayoutRoute.addChildren(adminChildren);

const routeTree = rootRoute.addChildren([
  ...publicRoutes,
  ...authRoutes,
  adminLayoutRoute,
]);

export const router = createRouter({ routeTree });
