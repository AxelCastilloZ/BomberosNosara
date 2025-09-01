// src/router/router.tsx (o donde tengas el router)
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import App from '../App';
import { isAdmin, isSuperUser } from '../auth/AdminAuth';

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

// 👇 nuevas páginas para el flujo de recuperación
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

const isAdminAuthenticated = () => isAdmin();

const rootRoute = createRootRoute({ component: App });

const routeTree = rootRoute.addChildren([
  // públicas
  createRoute({ path: '/', component: Home, getParentRoute: () => rootRoute }),
  createRoute({ path: '/donantes', component: DonantesPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/sugerencias', component: SuggestionsPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/sobre-nosotros', component: AboutSection, getParentRoute: () => rootRoute }),
  createRoute({ path: '/nuestro-trabajo', component: NuestroTrabajoPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/contacto', component: ContactoPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/noticias', component: NoticiasPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/donar', component: DonarPage, getParentRoute: () => rootRoute }),

  // auth
  createRoute({ path: '/login', component: AdminLoginPage, getParentRoute: () => rootRoute }),

  // 👇 agregado: recuperación de contraseña (frontend)
  createRoute({ path: '/forgot-password', component: ForgotPasswordPage, getParentRoute: () => rootRoute }),
  createRoute({ path: '/reset-password', component: ResetPasswordPage, getParentRoute: () => rootRoute }),

  // admin
  createRoute({
    path: '/admin/donantes',
    component: AdminDonantesPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isAdmin()) throw redirect({ to: '/login' }); },
  }),
  createRoute({
    path: '/admin/sugerencias',
    component: AdminSuggestionsPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isAdmin()) throw redirect({ to: '/login' }); },
  }),
  createRoute({
    path: '/admin/noticias',
    component: AdminNoticiasPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isAdmin()) throw redirect({ to: '/login' }); },
  }),
  createRoute({
    path: '/admin/chat',
    component: AdminChatPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isAdmin()) throw redirect({ to: '/login' }); },
  }),
  createRoute({
    path: '/admin/equipo',
    component: AdminEquipoPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isAdmin()) throw redirect({ to: '/login' }); },
  }),
  createRoute({
    path: '/admin/estadisticas',
    component: AdminEstadisticasPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isAdmin()) throw redirect({ to: '/login' }); },
  }),
  createRoute({
    path: '/admin/material-interno',
    component: AdminMaterialEducativoPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isAdmin()) throw redirect({ to: '/login' }); },
  }),
  createRoute({
    path: '/admin/usuarios',
    component: AdminUsuariosPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isSuperUser()) throw redirect({ to: '/login' }); },
  }),
  createRoute({
    path: '/admin/vehiculos',
    component: AdminVehiculosPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isAdmin()) throw redirect({ to: '/login' }); },
  }),
  createRoute({
    path: '/admin',
    component: AdminDashboardPage,
    getParentRoute: () => rootRoute,
    beforeLoad: () => { if (!isAdminAuthenticated()) throw redirect({ to: '/login' }); },
  }),
]);

export const router = createRouter({ routeTree });
