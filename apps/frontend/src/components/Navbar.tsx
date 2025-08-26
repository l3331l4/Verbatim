"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ConfirmLeaveModal from "@/components/ui/ConfirmLeaveModal"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Create", href: "/create" },
]

function smoothScrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [pendingHash, setPendingHash] = useState<string | null>(null)
  const [pendingNav, setPendingNav] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const isMeetingPage = pathname.startsWith("/meeting/")

  useEffect(() => {
    if (pathname === "/") {
      const hash = window.location.hash
      if (hash === "#features") setActiveItem("Features")
      else if (hash === "#workflow") setActiveItem("Workflow")
      else setActiveItem("Home")
    } else if (pathname === "/create") {
      setActiveItem("Create")
    } else {
      setActiveItem(null)
    }
  }, [pathname])

  useEffect(() => {
    if (pathname === "/" && (window.location.hash || pendingHash)) {
      const id = (pendingHash ?? window.location.hash).replace("#", "")
      if (id) {
        setTimeout(() => smoothScrollToId(id), 50)
      }
      setPendingHash(null)
    }
  }, [pathname, pendingHash])

  useEffect(() => {
    const onHashChange = () => {
      const id = window.location.hash.replace("#", "")
      if (id) smoothScrollToId(id)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  const doNavigate = (href: string, label: string) => {
    setActiveItem(label)

    if (href === "/") {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/", { scroll: false })
    }
    return
  }

    if (href.startsWith("#")) {
      const id = href.slice(1)
      if (pathname === "/") {
        smoothScrollToId(id)
      } else {
        setPendingHash(href)
        router.push(`/${href}`, { scroll: false })
      }
      return
    }

    router.push(href)
  }

  const handleNav = (item: typeof navItems[number]) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (isMeetingPage) {
      setPendingNav(item.href)
      setShowConfirm(true)
    } else {
      doNavigate(item.href, item.label)
    }
  }

  const confirmLeave = () => {
    setShowConfirm(false)
    if (pendingNav) {
      const navItem = navItems.find((n) => n.href === pendingNav)
      doNavigate(pendingNav, navItem?.label ?? "")
      setPendingNav(null)
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full px-6 py-4 z-50 hidden sm:block">
        <div className="flex justify-center">
          <div className="glass-card bg-black/15 backdrop-blur-md rounded-full px-2 py-1 scale-85">
            <ul className="flex items-center">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={handleNav(item)}
                    className={`
                      relative px-4 py-2 font-medium transition-all duration-500 ease-out
                      ${activeItem === item.label
                        ? "text-base gradient-text font-body"
                        : "text-base text-muted-foreground/80 font-body hover:text-muted-foreground hover:bg-white/15 rounded-full"}
                    `}
                  >
                    {activeItem === item.label && (
                      <div className="absolute inset-0 bg-white blur-xl -z-10 rounded-full transition-all duration-800 animate-in fade-in zoom-in-50" />
                    )}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
      <ConfirmLeaveModal open={showConfirm} onConfirm={confirmLeave} onCancel={() => setShowConfirm(false)} />
    </>
  )
}
