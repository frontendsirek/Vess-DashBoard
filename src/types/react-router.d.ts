import type { AppRouteHandle } from '@/types/route-handle'

declare module 'react-router-dom' {
  interface RouteHandle extends AppRouteHandle {}
}
