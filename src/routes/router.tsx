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
import { OrderEditPage } from '@/pages/OrderEditPage.page';
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
  staticData: {
    breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Categories' }],
  },
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
  staticData: {
    breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Products' }],
  },
  component: ProductsPage,
});

const productNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products/new',
  staticData: {
    breadcrumb: [
      { label: 'Home', to: '/' },
      { label: 'Products', to: '/products' },
      { label: 'New product' },
    ],
  },
  component: ProductFormPage,
});

const productEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products/$productId',
  staticData: {
    breadcrumb: [
      { label: 'Home', to: '/' },
      { label: 'Products', to: '/products' },
      { label: 'Edit product' },
    ],
  },
  component: ProductFormPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/orders',
  validateSearch: (search): OrdersTableSearch => ({
    ...parseCommonSearch(search),
    status: parseStringParam(search, 'status'),
  }),
  staticData: {
    breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Orders' }],
  },
  component: OrdersPage,
});

const orderNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/orders/new',
  staticData: {
    breadcrumb: [
      { label: 'Home', to: '/' },
      { label: 'Orders', to: '/orders' },
      { label: 'New order' },
    ],
  },
  component: OrderNewPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/orders/$orderId',
  staticData: {
    breadcrumb: [
      { label: 'Home', to: '/' },
      { label: 'Orders', to: '/orders' },
      { label: 'Order details' },
    ],
  },
  component: OrderDetailPage,
});

const orderEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/orders/$orderId/edit',
  staticData: {
    breadcrumb: [
      { label: 'Home', to: '/' },
      { label: 'Orders', to: '/orders' },
      { label: 'Edit order' },
    ],
  },
  component: OrderEditPage,
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
    orderEditRoute,
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
