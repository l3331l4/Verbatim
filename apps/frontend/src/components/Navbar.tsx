"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Create", href: "/create" },
]

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const [activeItem, setActiveItem] = useState("Home")

    const handleNav = (item: typeof navItems[number]) => (e: React.MouseEvent) => {
        e.preventDefault()
        setActiveItem(item.label)

        if (item.href === "/") {
            router.push("/")
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
        }

        if (item.href.startsWith("#")) {
            if (pathname === "/") {
                const id = item.href.replace("#", "")
                const element = document.getElementById(id)
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                }
            } else {
                router.push("/")
                setTimeout(() => {
                    const scrollToSection = () => {
                        const element = document.getElementById(item.href.replace("#", ""))
                        if (element) {
                            element.scrollIntoView({ behavior: "smooth" })
                        }
                    }
                    let tries = 0
                    const interval = setInterval(() => {
                        scrollToSection()
                        tries++
                        if (tries > 10) clearInterval(interval)
                    }, 100)
                }, 400)
            }
            return
        }
        router.push(item.href)
    }

    return (
        <nav className="fixed top-0 left-0 w-full px-6 py-4 z-50 overflow-visible hidden sm:block">
            <div className="flex flex-wrap items-center justify-center">
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
                                            : "text-base text-muted-foreground/80 font-body hover:text-muted-foreground hover:bg-white/10 rounded-full"
                                        }
                  `}
                                >
                                    {activeItem === item.label && (
                                        <div className="absolute inset-0 bg-white blur-xl scale-[1] -z-10 rounded-full transition-all duration-800 ease-out animate-in fade-in zoom-in-50" />
                                    )}
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    )
}