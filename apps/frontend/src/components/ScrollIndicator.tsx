'use client'

import { ChevronDown } from "lucide-react"

export function ScrollIndicator() {
    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({
            behavior: 'smooth'
        });
    };

    return (
        <div
            className="flex flex-col items-center space-y-2 cursor-pointer group animate-fade-in opacity-70 hover:opacity-100 transition-all duration-500"
            onClick={scrollToFeatures}
        >
            <span className="text-xs font-body text-gray-500 group-hover:text-primary transition-colors duration-300">
                Discover more
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary animate-bounce transition-colors duration-300" />
        </div>
    );
}