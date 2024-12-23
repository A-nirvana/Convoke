import { NavLink, useNavigate } from "@remix-run/react";
import { Check, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuthStore, useChatStore } from "store";

export default function Sidebar() {
  const { dms, setSelectedUser, isDmsLoading, isSearching, requests, users, createDm, acceptDm, rejectDm } = useChatStore();
  const {authUser} = useAuthStore();
  const [search, setSearch] = useState("");
  const [add, setAdd] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [uSearch, setUSearch] = useState("");
  const navigate = useNavigate();

  const srcDms = dms.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="sidebar">
      <div id="bottombar"className="flex justify-between w-full items-center">
        <div className="flex items-center gap-2">
          <img src={authUser?.profilePic} alt="profile pic" className="h-[8vh] rounded-full" />
          <div>
            <p className="font-semibold">{authUser?.name.split(" ")[0]}</p>
            <p className="text-sm">Online</p>
          </div>
        </div>
        <div className="hover:bg-[#ccc] p-1 rounded-xl duration-200">
          <button className="hover:rotate-180 duration-700" onClick={()=>navigate("/@me")}><Settings/></button>
        </div>
      </div>
      <div>
        <form id="search-form" role="search" onChange={(e) => {
          const formData = new FormData(e.currentTarget);
          setSearch(formData.get("q") as string)
        }}>
          <input
            id="q"
            aria-label="Search contacts"
            className={isSearching ? "loading" : ""}
            defaultValue={""}
            placeholder="Search"
            type="search"
            name="q"
          />
          <div id="search-spinner" aria-hidden hidden={!isSearching} />
        </form>
        <div className={`relative`}>
          <button id="add" style={{ borderRadius: "100%", padding: "0.5rem" }} onClick={() => {
            setAdd(!add);
            setUSearch("");
          }}><Plus /></button>
          {add ?
            <div className={`absolute flex flex-col items-center gap-4 z-50 duration-300 top-0 left-full min-h-32 h-max w-max p-4 border-2 border-[#aaa] bg-white -mt-4 ml-4 rounded-xl`}>
              <input
                id="userSrc"
                aria-label="Search People"
                className={isSearching ? "loading" : ""}
                value={uSearch}
                placeholder="Search for new friends"
                type="search"
                name="userSrc"
                onChange={(e) => { setUSearch(e.target.value) }}
              />
              {(users.length) ? (
                <ul className="w-full">
                  {users.map((contact) => {
                    const userExists = dms.some((dm) => dm._id === contact._id); // Check if the user exists in dms
                    return (
                      <li key={contact._id}>
                        <div className="flex w-full justify-between items-center">
                          <div className="flex items-center gap-4">
                            <img
                              src={contact.profilePic}
                              alt="prof"
                              className="max-h-10 rounded-full w-auto"
                            />
                            <p>{contact.name}</p>
                          </div>
                          <button className="p-2 rounded-full border border-blue-500 bg-blue-500 text-white"
                            onClick={() => {
                              if (userExists) toast.info("User already in DMs")
                              else createDm(contact._id)
                            }}
                          >
                            {userExists ? <Check /> : <Plus />}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>
                  {uSearch.length > 2 ? <i>No Such User found</i> : <i>Type 3 or more letters</i>}
                </p>
              )}
            </div> : <></>}
        </div>
      </div>
      <nav className={`min-h-[80vh] ${isDmsLoading ? "opacity-50" : ""}`}>
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-lg font-semibold">Messages</p>
            <button className="underline text-[#3992ff]" onClick={() => {
              setReqOpen(!reqOpen)
            }}>Requests{requests.length ? `(${requests.length})` : ""}</button>
          </div>
            {reqOpen && <div className={`w-full flex flex-col items-center gap-4 min-h-16 duration-700 h-max border-b-2 border-[#aaa] mt-4`}>
              {(requests.length) ? (
                <ul className="w-full">
                  {requests.map((contact) => {
                    return (
                      <li key={contact._id}>
                        <div className="flex w-full justify-between items-center">
                          <div className="flex items-center gap-4">
                            <img
                              src={contact.profilePic}
                              alt="prof"
                              className="max-h-10 rounded-full w-auto"
                            />
                            <p>{contact.name}</p>
                          </div>
                          <div className="flex gap-2">  
                          <button className="p-2 rounded-xl border border-blue-500 bg-blue-500 text-white"
                            onClick={() => acceptDm(contact._id)}
                          >Accept</button>
                          <button className="p-2 rounded-xl border border-red-500 bg-red-500 text-white"
                            onClick={() => rejectDm(contact._id)}
                          >Reject</button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>
                  <i>No Requests Pending</i>
                </p>
              )}
            </div>}
        </div>
        {srcDms.length ? (
          <ul className="duration-700">
            {srcDms.map((contact) => (
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
                      <img src={contact.profilePic} alt="prof" className="max-h-10 rounded-full w-auto" /><p>{contact.name}</p>
                    </div>
                  ) : (
                    <i>No Name</i>
                  )}
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