"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ConfirmLeaveModal from "@/components/ui/ConfirmLeaveModal";

const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Create", href: "/create" },
]

function getInitialActiveItem(pathname: string): string | null {
    if (pathname === "/create") return "Create"
    if (pathname === "/") {
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        if (hash === "#features") return "Features";
        if (hash === "#workflow") return "Workflow";
        return "Home";
    }
    if (pathname.startsWith("/meeting/")) return null
    return null
}

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const [activeItem, setActiveItem] = useState<string | null>(() => getInitialActiveItem(pathname))

    const [pendingNav, setPendingNav] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const isMeetingPage = pathname.startsWith("/meeting/");

    useEffect(() => {
        if (pathname === "/") {
            const hash = typeof window !== "undefined" ? window.location.hash : "";
            if (hash === "#features" && activeItem !== "Features") {
                setActiveItem("Features");
            } else if (hash === "#workflow" && activeItem !== "Workflow") {
                setActiveItem("Workflow");
            } else if (!hash && activeItem !== "Home" && activeItem !== "Features" && activeItem !== "Workflow") {
                setActiveItem("Home");
            }
        } else if (pathname === "/create") {
            setActiveItem("Create");
        } else if (pathname.startsWith("/meeting/")) {
            setActiveItem(null);
        } else {
            setActiveItem(null);
        }
    }, [pathname]);
    const doNavigate = (href: string, label: string) => {
        setActiveItem(label);

        if (href === "/") {
            router.push("/");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        if (href.startsWith("#")) {
            if (pathname === "/") {
                const id = href.replace("#", "");
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                router.push("/");
                setTimeout(() => {
                    const scrollToSection = () => {
                        const element = document.getElementById(href.replace("#", ""));
                        if (element) {
                            element.scrollIntoView({ behavior: "smooth" });
                        }
                    };
                    let tries = 0;
                    const interval = setInterval(() => {
                        scrollToSection();
                        tries++;
                        if (tries > 10) clearInterval(interval);
                    }, 100);
                }, 400);
            }
            return;
        }
        router.push(href);
    };

    const handleNav = (item: typeof navItems[number]) => (e: React.MouseEvent) => {
        if (isMeetingPage) {
            e.preventDefault();
            setPendingNav(item.href);
            setShowConfirm(true);
            return;
        }
        e.preventDefault();
        doNavigate(item.href, item.label);
    };

    const confirmLeave = () => {
        setShowConfirm(false);
        if (pendingNav) {
            const navItem = navItems.find(item => item.href === pendingNav);
            doNavigate(pendingNav, navItem?.label ?? "");
            setPendingNav(null);
        }
    };

    const cancelLeave = () => {
        setShowConfirm(false);
        setPendingNav(null);
    };

    return (
        <>
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
                                                : "text-base text-muted-foreground/80 font-body hover:text-muted-foreground hover:bg-white/15 rounded-full"
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
            <ConfirmLeaveModal open={showConfirm} onConfirm={confirmLeave} onCancel={cancelLeave} />
        </>
    )
}