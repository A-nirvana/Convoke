import { Phone } from "lucide-react";

interface modal {
  isOpen: boolean;
  setIsOpen: Function;
  accept: Function;
  reject: Function;
  caller?: string
}

export default function CallModal({ isOpen, setIsOpen, accept, reject, caller }: modal) {
  return (
    <div className={`fixed flex justify-center overflow-hidden items-center inset-0 transition-all duration-150 w-screen h-screen bg-[#0a0a0a11] ease-out ${isOpen ? "opacity-100 z-50" : "-z-50 opacity-0 pointer-events-none"}`}>
      <div className="bg-white rounded-md flex flex-col items-center px-8 py-4">
        <img src="/images/logo.svg" className="h-20 rounded-full border" />
        <p>{caller} is calling</p>
        <div className="flex gap-8 mt-8">
          <Phone onClick={() => {
            setIsOpen(false)
            accept()
          }}
            className="bg-green-400 animate-pulse rounded-full h-16 w-16 p-4 cursor-pointer" />
          <Phone onClick={() => {
            setIsOpen(false)
            reject()
          }}
            className="bg-red-400 animate-pulse rounded-full h-16 w-16 p-4 cursor-pointer" />
        </div>
      </div>
    </div>
  )
}