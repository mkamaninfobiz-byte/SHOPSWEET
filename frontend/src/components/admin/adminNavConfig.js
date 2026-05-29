import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BookOpen,
  MessageSquare,
  Link2,
  Mail,
  Settings,
} from 'lucide-react';

export const adminNavigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/dashboard/products', icon: Package },
  { name: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Customers', path: '/dashboard/customers', icon: Users },
  { name: 'About Page', path: '/dashboard/about', icon: BookOpen },
  { name: 'Testimonials', path: '/dashboard/testimonials', icon: MessageSquare },
  { name: 'Footer', path: '/dashboard/footer', icon: Link2 },
  { name: 'Contacts', path: '/dashboard/contacts', icon: Mail },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export const getAdminPageTitle = (pathname) => {
  const exact = adminNavigation.find((item) => item.path === pathname);
  if (exact) return exact.name;
  if (pathname.startsWith('/dashboard/products/')) return 'Product detail';
  return 'Admin';
};
