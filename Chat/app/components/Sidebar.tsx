import { Form, NavLink, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import { useChatStore } from "store";

export default function Sidebar() {
      const q = null
      const navigation = useNavigation();
      const submit = useSubmit();
      const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q");
      const {dms, setSelectedUser, isDmsLoading} = useChatStore();

    return(
        <div id="sidebar">
        <h1>Remix Contacts</h1>
        <div>
          <Form id="search-form" role="search" onChange={(e) => {
            const isFirstSearch = q === null;
            submit(e.currentTarget, {
              replace: !isFirstSearch,
            });
          }}>
            <input
              id="q"
              aria-label="Search contacts"
              className={searching ? "loading" : ""}
              defaultValue={q || ""}
              placeholder="Search"
              type="search"
              name="q"
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav className={`min-h-[80vh] ${isDmsLoading ? "opacity-50" : ""}`}>
          {dms.length ? (
            <ul>
              {dms.map((contact) => (
                <li key={contact._id}>
                  <NavLink onClick={() => setSelectedUser(contact)}
                    className={({ isActive, isPending }) =>
                      isActive
                        ? "active"
                        : isPending
                          ? "pending"
                          : ""
                    }
                    to={`/chat/${contact._id}`}
                  >
                    {contact.name ? (
                      <div className="flex items-center gap-4">
                        <img src={contact.profilePic} alt="prof" className="max-h-10 rounded-full w-auto"/><p>{contact.name}</p>
                      </div>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {/* {contact.favorite ? (
                      <span>★</span>
                    ) : null} */}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
    )
}