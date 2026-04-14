import type { Router as RemixRouter } from "@remix-run/router";
import { RouterProvider } from "react-router-dom";
import { createAppBrowserRouter } from "@/app/routes/app-router";

interface AppProps {
  readonly router?: RemixRouter;
}

const browserRouter = createAppBrowserRouter();

function App({ router = browserRouter }: AppProps) {
  return <RouterProvider router={router} />;
}

export default App;
