import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import { AppShell } from '@/components/app/AppShell';
import { useAuthStore } from '@/features/auth';
import {
  type OrdersTableSearch,
  parseCommonSearch,
  parseStringParam,
  type ProductsTableSearch,
} from '@/lib/tableSearch';
import { CategoriesPage } from '@/pages/CategoriesPage.page';
import { DashboardPage } from '@/pages/DashboardPage.page';
import { LoginPage } from '@/pages/LoginPage.page';
import { OrderDetailPage } from '@/pages/OrderDetailPage.page';
import { OrderNewPage } from '@/pages/OrderNewPage.page';
import { OrdersPage } from '@/pages/OrdersPage.page';
import { ProductFormPage } from '@/pages/ProductFormPage.page';
import { ProductsPage } from '@/pages/ProductsPage.page';

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
  validateSearch: parseCommonSearch,
  component: CategoriesPage,
});

const productsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products',
  validateSearch: (search): ProductsTableSearch => ({
    ...parseCommonSearch(search),
    category: parseStringParam(search, 'category'),
    active: parseStringParam(search, 'active'),
  }),
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
  validateSearch: (search): OrdersTableSearch => ({
    ...parseCommonSearch(search),
    status: parseStringParam(search, 'status'),
  }),
  component: OrdersPage,
});

const orderNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/orders/new',
  component: OrderNewPage,
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
    orderNewRoute,
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
