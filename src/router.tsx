import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import AppShell from '@/components/layout/app-shell';
import { useAuthStore } from '@/features/auth';
import CategoriesPage from '@/pages/categories-page';
import DashboardPage from '@/pages/dashboard-page';
import LoginPage from '@/pages/login-page';
import OrderDetailPage from '@/pages/order-detail-page';
import OrdersPage from '@/pages/orders-page';
import ProductFormPage from '@/pages/product-form-page';
import ProductsPage from '@/pages/products-page';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: () => {
    if (useAuthStore.getState().session) {
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage,
});

const authenticatedRoute = createRoute({
  id: '_authenticated',
  getParentRoute: () => rootRoute,
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().session) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: DashboardPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/categories',
  component: CategoriesPage,
});

const productsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products',
  component: ProductsPage,
});

const productNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products/new',
  component: ProductFormPage,
});

const productEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products/$productId',
  component: ProductFormPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/orders',
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/orders/$orderId',
  component: OrderDetailPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    indexRoute,
    categoriesRoute,
    productsRoute,
    productNewRoute,
    productEditRoute,
    ordersRoute,
    orderDetailRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
