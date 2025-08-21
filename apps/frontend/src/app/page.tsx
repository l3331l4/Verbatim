import Image from "next/image";
import Link from "next/link"
import { ArrowRight, BarChart3, Repeat, Sparkles, TrendingUp } from "lucide-react"
import Spline from '@splinetool/react-spline/next';
import { Button } from "@/components/ui/button"
import { GradientBackground } from "@/components/ui/gradient-background"

export default function Home() {
  return (
    <main>
      <Spline
        scene="https://prod.spline.design/NK5tL3OEjwwjxb5y/scene.splinecode"
        className="absolute w-full h-full"
      />
      <div
        className="fixed bottom-0 right-0 w-48 h-18 rounded-lg z-0 pointer-events-none"
        style={{ backgroundColor: "#FFFAFA" }}
        aria-hidden="true"
      />
      <div className="flex min-h-screen flex-col items-center justify-center">
        <GradientBackground />
        <section className=" relative space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 overflow-hidden">
          <div className="p-8 container flex max-w-[64rem] flex-col items-center gap-4 text-center relative z-10">
            <div className="rounded-full bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary border border-primary/20">
              Introducing Verbatim
            </div>
            <div className="">
              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl gradient-text">
                AI-Powered Real-Time Transcription
              </h1>
            </div>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 glass-card p-4 rounded-lg">
              Capture every word effortlessly. Real-time speech-to-text with flexible formatting options,
              instant export and seamless transcription for meetings, interviews, and conversations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Button size="lg" className="bg-primary/90 backdrop-blur-sm" asChild>
                <Link href="#demo">
                  Try Interactive Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="glass-button" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}









// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <h1 className="text-8xl tracking-tight text-center sm:text-left">
//           Hello World!
//         </h1>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//       </footer>
//     </div>
//   );
// }
