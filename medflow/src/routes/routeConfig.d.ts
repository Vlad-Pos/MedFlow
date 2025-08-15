import { BackgroundType } from '../components/layout/RouteLayout'

export interface RouteConfig {
  path: string
  component: string
  background: BackgroundType
  showNavbar: boolean
  showPageTransition: boolean
  containerClass?: string
  isPrivate?: boolean
}

export declare const routes: RouteConfig[]
export declare const routeComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>>>

export default routes
