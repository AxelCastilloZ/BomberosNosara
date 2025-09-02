// src/router/router.tsx
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import App from '../App';

// ⬇️ Trae helpers del servicio unificado
import { isAuthenticated, getUserRoles } from '../service/auth';

import Home from '../pages/Home';
import DonantesPage from '../pages/DonantesPage';
import SuggestionsPage from '../pages/SuggestionsPage';
import NoticiasPage from '../pages/NoticiasPage';
import DonarPage from '../pages/DonarPage';
import AboutSection from '../components/ui/AboutUs/AboutSection';
import NuestroTrabajoPage from '../pages/NuestroTrabajoPage';
import ContactoPage from '../pages/ContactoPage';

import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboardPage from '../pages/Administrativas/AdminDashboardPage';
import AdminDonantesPage from '../pages/AdminDonantesPage';
import AdminSuggestionsPage from '../pages/AdminSuggestionsPage';
import AdminEquipoPage from '../pages/Administrativas/AdminEquipoPage';
import AdminEstadisticasPage from '../pages/Administrativas/AdminEstadisticasPage';
import AdminMaterialEducativoPage from '../pages/Administrativas/AdminMaterialEducativoPage';
import AdminUsuariosPage from '../pages/Administrativas/AdminUsuariosPage';
import AdminVehiculosPage from '../pages/Administrativas/AdminVehiculosPage';
import AdminNoticiasPage from '../pages/AdminNoticiasPage';
import AdminChatPage from '../pages/Administrativas/AdminChatPage';

import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Opcional: tu página 403
const Forbidden = () => <div className="p-6">No tenés permisos para ver esta sección.</div>;

/* =========================
   Reglas de acceso por módulo
   ========================= */
type Role = 'SUPERUSER' | 'ADMIN' | 'PERSONAL_BOMBERIL' | 'VOLUNTARIO';

const CAN = {
  donantes:     ['SUPERUSER', 'ADMIN'] as Role[],
  usuarios:     ['SUPERUSER'] as Role[], 
  equipo:       ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL'] as Role[],
  vehiculos:    ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL'] as Role[],
  estadisticas: ['SUPERUSER', 'ADMIN'] as Role[],
  material:     ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'] as Role[],
  chat:         ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'] as Role[],
  noticias:     ['SUPERUSER', 'ADMIN'] as Role[],
  sugerencias:  ['SUPERUSER', 'ADMIN'] as Role[],
  // si tenés módulo de voluntarios:
  // voluntarios:  ['VOLUNTARIO', 'ADMIN', 'SUPERUSER'] as Role[],
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

const routeTree = rootRoute.addChildren([
  // Públicas
  createRoute({ path: '/', component: Home, getParentRoute: () => rootRoute }),
  createRoute({ path: '/donantes', component: DonantesPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/sugerencias', component: SuggestionsPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/sobre-nosotros', component: AboutSection, getParentRoute: () => rootRoute }),
  createRoute({ path: '/nuestro-trabajo', component: NuestroTrabajoPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/contacto', component: ContactoPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/noticias', component: NoticiasPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/donar', component: DonarPage, getParentRoute: () => rootRoute }),

  // Auth
  createRoute({ path: '/login', component: AdminLoginPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/forgot-password', component: ForgotPasswordPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/reset-password', component: ResetPasswordPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/forbidden', component: Forbidden, getParentRoute: () => rootRoute }),

  // Panel: cualquier autenticado entra
  createRoute({
    path: '/admin',
    component: AdminDashboardPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireAuth,
  }),

  // Submódulos protegidos por roles
  createRoute({
    path: '/admin/donantes',
    component: AdminDonantesPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireRoles(CAN.donantes),
  }),
  createRoute({
    path: '/admin/sugerencias',
    component: AdminSuggestionsPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireRoles(CAN.sugerencias),
  }),
  createRoute({
    path: '/admin/noticias',
    component: AdminNoticiasPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireRoles(CAN.noticias),
  }),
  createRoute({
    path: '/admin/chat',
    component: AdminChatPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireRoles(CAN.chat),
  }),
  createRoute({
    path: '/admin/equipo',
    component: AdminEquipoPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireRoles(CAN.equipo),
  }),
  createRoute({
    path: '/admin/estadisticas',
    component: AdminEstadisticasPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireRoles(CAN.estadisticas),
  }),
  createRoute({
    path: '/admin/material-interno',
    component: AdminMaterialEducativoPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireRoles(CAN.material),
  }),
  createRoute({
    path: '/admin/usuarios',
    component: AdminUsuariosPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireRoles(CAN.usuarios),
  }),
  createRoute({
    path: '/admin/vehiculos',
    component: AdminVehiculosPage,
    getParentRoute: () => rootRoute,
    beforeLoad: requireRoles(CAN.vehiculos),
  }),
]);

export const router = createRouter({ routeTree });
