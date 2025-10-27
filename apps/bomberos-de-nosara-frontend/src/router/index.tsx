import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import App from '../App';

// Auth helpers
import { isAuthenticated, getUserRoles } from '../service/auth';
import { RoleEnum } from '../types/role.enum';

// Públicas
import Home from '../pages/Home';
import DonantesPage from '../pages/DonantesPage';
import SuggestionsPage from '../pages/SuggestionsPage';
import NoticiasPage from '../pages/NoticiasPage';
import DonarPage from '../pages/DonarPage';
import AboutSection from '../components/ui/AboutUs/AboutSection';
import NuestroTrabajoPage from '../pages/NuestroTrabajoPage';
import ContactoPage from '../pages/ContactoPage';

// Auth pages
import AdminLoginPage from '../pages/AdminLoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Admin pages
import AdminDashboardPage from '../pages/Administrativas/AdminDashboardPage';
import AdminDonantesPage from '../pages/AdminDonantesPage';
import AdminSuggestionsPage from '../pages/AdminSuggestionsPage';
import AdminChatPage from '../pages/Administrativas/AdminChatPage';
import AdminEstadisticasPage from '../pages/Administrativas/AdminEstadisticasPage';
import AdminMaterialEducativoPage from '../pages/Administrativas/AdminMaterialEducativoPage'; // CRUD
import AdminUsuariosPage from '../pages/Administrativas/AdminUsuariosPage';
import AdminVehiculosPage from '../pages/Administrativas/AdminVehiculosPage';
import AdminEquipoPage from '../pages/Administrativas/AdminEquipoPage';
import AdminNoticiasPage from '../pages/AdminNoticiasPage';
import MaterialPublicPage from '../pages/Administrativas/MaterialPublicPage'; // Solo ver/descargar

// Layout con sidebar
import AdminLayout from '../components/ui/Layout/AdiminLayout';
import AdminVoluntariosPage from '../pages/Administrativas/AdminVoluntariosPage';
import VoluntariosPage from '../pages/Administrativas/VoluntariosPage';

const Forbidden = () => <div className="p-6">No tenés permisos para ver esta sección.</div>;

/* =========================
   Reglas de acceso por módulo
   ========================= */
const CAN = {
  donantes:         [RoleEnum.SUPERUSER, RoleEnum.ADMIN],
  usuarios:         [RoleEnum.SUPERUSER],
  equipo:           [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL],
  vehiculos:        [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL],
  estadisticas:     [RoleEnum.SUPERUSER, RoleEnum.ADMIN],
  materialCRUD:     [RoleEnum.SUPERUSER, RoleEnum.ADMIN],
  materialPublic:   [RoleEnum.PERSONAL_BOMBERIL, RoleEnum.VOLUNTARIO],
  chat:             [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL, RoleEnum.VOLUNTARIO],
  noticias:         [RoleEnum.SUPERUSER, RoleEnum.ADMIN],
  sugerencias:      [RoleEnum.SUPERUSER, RoleEnum.ADMIN],
  voluntarios:      [RoleEnum.VOLUNTARIO],
  AdminVoluntarios: [RoleEnum.SUPERUSER, RoleEnum.ADMIN],
};

/* =========================
   Helpers
   ========================= */
function hasAnyRole(userRoles: RoleEnum[], allowed: RoleEnum[]) {
  return allowed.some((r) => userRoles.includes(r));
}

/* =========================
   Guards
   ========================= */
function requireAuth() {
  if (!isAuthenticated()) {
    throw redirect({ to: '/login' });
  }
}

function requireRoles(allowed: RoleEnum[]) {
  return () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' });
    }

    const roles = getUserRoles();
    const hasAccess = hasAnyRole(roles, allowed);

    if (!hasAccess) {
      throw redirect({ to: '/forbidden' });
    }
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

// --- Hijos del layout /admin ---
const adminChildren = [
  createRoute({
    path: '/',
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

  //  Material Educativo: CRUD vs Público
  createRoute({
    path: 'material-interno',
    component: AdminMaterialEducativoPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.materialCRUD),
  }),
  createRoute({
    path: 'material-voluntarios',
    component: MaterialPublicPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.materialPublic),
  }),

  createRoute({
    path: 'usuarios',
    component: AdminUsuariosPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.usuarios),
  }),
  createRoute({
    path: 'equipo',
    component: AdminEquipoPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.equipo),
  }),
  createRoute({
    path: 'noticias',
    component: AdminNoticiasPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.noticias),
  }),
  createRoute({
    path: 'voluntarios',
    component: AdminVoluntariosPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.AdminVoluntarios),
  }),
  createRoute({
    path: 'registro-horas',
    component: VoluntariosPage,
    getParentRoute: () => adminLayoutRoute,
    beforeLoad: requireRoles(CAN.voluntarios),
  }),
];

adminLayoutRoute.addChildren(adminChildren);

const routeTree = rootRoute.addChildren([
  ...publicRoutes,
  ...authRoutes,
  adminLayoutRoute,
]);

export const router = createRouter({ routeTree });
