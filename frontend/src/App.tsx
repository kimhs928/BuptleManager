import ComponentGallery from './pages/ComponentGallery'
import { LoginRoute } from './pages/login/LoginRoute'
import type { LoginView } from './pages/login/LoginRoute'

const loginViews: LoginView[] = ['login', 'network', 'denied']

/** 임시 진입점: /, /?view=network, /?view=denied, /?gallery */
export default function App() {
  const params = new URLSearchParams(window.location.search)
  if (params.has('gallery')) return <ComponentGallery />
  const view = params.get('view')
  const initialView = loginViews.find((v) => v === view) ?? 'login'
  return <LoginRoute initialView={initialView} />
}
