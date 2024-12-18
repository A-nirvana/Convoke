import { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, useNavigate } from "@remix-run/react";
import { createEmptyContact } from "~/data";
import { useAuthStore } from "store";
import { Loader } from "lucide-react";
import Sidebar from "~/components/Sidebar";
import NoChat from "~/components/NoChat";
import { useEffect } from "react";

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};


export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    return json({ q });
  } catch (error: any) {
    if (error.response?.status === 401) {
      return redirect("/login");
    }
    throw new Response("Something went wrong", { status: 500 });
  }
};

export default function Index() {
  const { authUser, isCheckingAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCheckingAuth && !authUser)
      navigate("/login");
  }, [isCheckingAuth, authUser])

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <main className="flex">
      <Sidebar />
      <NoChat />
    </main>
  );
}
