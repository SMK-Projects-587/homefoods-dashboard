import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import { AppShell } from '@/components/app/AppShell';
import { RouteLoadingFallback } from '@/components/app/RouteLoadingFallback';
import { useAuthStore } from '@/features/auth';
import {
  type OrdersTableSearch,
  parseCommonSearch,
  parseStringParam,
  type ProductsTableSearch,
} from '@/lib/tableSearch';

// Every page is its own chunk (see lazyRouteComponent below) rather than one
// eagerly-imported bundle — this is a staff dashboard meant to be opened on
// a phone on the shop floor, so first-load JS size over a mobile connection
// matters. `defaultPreload: 'intent'` (below) fetches a page's chunk on
// hover/focus of its Link, so in practice most navigations never show
// `RouteLoadingFallback` at all.

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
  component: lazyRouteComponent(
    () => import('@/pages/LoginPage.page'),
    'LoginPage',
  ),
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
  component: lazyRouteComponent(
    () => import('@/pages/DashboardPage.page'),
    'DashboardPage',
  ),
});

const categoriesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/categories',
  validateSearch: parseCommonSearch,
  staticData: {
    breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Categories' }],
  },
  component: lazyRouteComponent(
    () => import('@/pages/CategoriesPage.page'),
    'CategoriesPage',
  ),
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
  component: lazyRouteComponent(
    () => import('@/pages/ProductsPage.page'),
    'ProductsPage',
  ),
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
  component: lazyRouteComponent(
    () => import('@/pages/ProductFormPage.page'),
    'ProductFormPage',
  ),
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
  component: lazyRouteComponent(
    () => import('@/pages/ProductFormPage.page'),
    'ProductFormPage',
  ),
});

const ordersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/orders',
  validateSearch: (search): OrdersTableSearch => ({
    ...parseCommonSearch(search),
    status: parseStringParam(search, 'status'),
    dateFrom: parseStringParam(search, 'dateFrom'),
    dateTo: parseStringParam(search, 'dateTo'),
  }),
  staticData: {
    breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Orders' }],
  },
  component: lazyRouteComponent(
    () => import('@/pages/OrdersPage.page'),
    'OrdersPage',
  ),
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
  component: lazyRouteComponent(
    () => import('@/pages/OrderNewPage.page'),
    'OrderNewPage',
  ),
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
  component: lazyRouteComponent(
    () => import('@/pages/OrderDetailPage.page'),
    'OrderDetailPage',
  ),
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
  component: lazyRouteComponent(
    () => import('@/pages/OrderEditPage.page'),
    'OrderEditPage',
  ),
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
  defaultPendingComponent: RouteLoadingFallback,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
