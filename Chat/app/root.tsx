import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation
} from "@remix-run/react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import tailwindStyles from "~/tailwind.css?url"
import styles from "./app.css?url"
import { useAuthStore } from "store/useAuthStore";
import { useEffect } from "react";
import { useChatStore } from "store";

export const meta: MetaFunction = () => {
  return [
    { title: "Chat | Convoke" }
  ]
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: styles },
];


export default function App() {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
  const {getDms, getUsers, getRequests} = useChatStore();
  const navigation = useNavigation()
  useEffect(() => {
    checkAuth()
    console.log("checkAuth")
  }, [checkAuth])

  useEffect(() => {
    if (authUser)
    {
      getDms();
      getUsers();
      getRequests();
    }
  }, [getDms, authUser, getUsers, getRequests])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div
          className={
            (navigation.state === "loading" || isCheckingAuth) ? "loading" : ""
          }
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <ToastContainer position='top-center' limit={3}/>
      </body>
    </html>
  );
}


