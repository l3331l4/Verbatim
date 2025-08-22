import Image from "next/image";
import Link from "next/link"
import { Sparkles, ArrowRight, AudioLines, SquareMenu, Download, } from "lucide-react"
import Spline from '@splinetool/react-spline/next';
import { Button } from "@/components/ui/button"
import { ScrollIndicator } from "@/components/ScrollIndicator"
import { SmoothScrollButton } from "@/components/SmoothScrollButton"


export default function Home() {
  return (
    <div className="relative w-full h-screen">
      {/* Spline canvas and bottom-right overlay */}
      <Spline
        scene="https://prod.spline.design/NK5tL3OEjwwjxb5y/scene.splinecode"
        className="absolute w-full h-full z-0 opacity-0 animate-fade-in"
      />
      <div
        className="absolute bottom-0 right-0 w-48 h-18 rounded-lg z-10 pointer-events-none"
        style={{ backgroundColor: "#FFFAFA" }}
        aria-hidden="true"
      />

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center">
        <section className="relative space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 overflow-hidden">
          <div className="p-8 container flex max-w-[64rem] flex-col items-center gap-4 text-center relative z-10">
            <div className="rounded-full bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 font-body">
              <Sparkles className="inline-block mr-0.5 size-5 pb-1" />Introducing Verbatim
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl gradient-text font-medium leading-[1.2]">
              AI-Powered Real-Time Transcription
            </h1>
            <p className="font-body max-w-[42rem] leading-normal text-muted-foreground sm:text-lg sm:leading-8 p-4 rounded-xl glass-card backdrop-blur-sm shadow-none">
              Capture every word effortlessly. Real-time speech-to-text with flexible formatting options,
              instant export and seamless transcription for meetings, interviews, and conversations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 font-body">
              <Button size="lg" className="bg-primary/90 backdrop-blur-sm rounded-2xl text-white opacity-90 hover:opacity-80" asChild>
                <Link href="create">
                  Start a Meeting <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <SmoothScrollButton
                targetId="features"
                size="lg"
                variant="outline"
                className="glass-button rounded-xl cursor-pointer"
              >
                Learn More
              </SmoothScrollButton>
            </div>
          </div>
        </section>
        <div className="py-16">
          <ScrollIndicator />
        </div>
        {/* Features */}
        <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24 relative">

          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
            <div className="absolute top-1/3 left-1/6 w-64 h-64 bg-gradient-to-br from-primary/80 via-purple-400 to-transparent rounded-full blur-3xl opacity-35"></div>
            <div className="absolute bottom-1/2 right-1/5 w-48 h-48 bg-gradient-to-tl from-blue-400 via-primary to-transparent rounded-full blur-2xl opacity-25"></div>
          </div>


          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.3] sm:text-3xl md:text-6xl gradient-text font-medium">
              Transcribe. Format. Share.
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7 font-body">
              Verbatim helps you capture, structure, and share conversations in real time.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {/* Feature cards */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                <AudioLines className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 pt-6">
                <h3 className="font-bold font-heading">Real-Time Transcription</h3>
                <p className="font-body text-sm text-muted-foreground">
                  Turn your speech into text instantly so nothing gets lost in meetings, interviews, or conversations.
                </p>
              </div>
            </div>
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                <SquareMenu className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 pt-6">
                <h3 className="font-bold font-heading">Flexible Formatting</h3>
                <p className="font-body text-sm text-muted-foreground">
                  Choose between paragraph style for easy reading, or line-by-line with timestamps for more structured transcripts.
                </p>
              </div>
            </div>
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 pt-6">
                <h3 className="font-bold font-heading">Instant Export & Sharing</h3>
                <p className="font-body text-sm text-muted-foreground">
                  Copy, download, or share your transcripts right away. Perfect for collaboration or later review.
                </p>
              </div>
            </div>
          </div>
        </section>


        <section id="workflow" className="container space-y-8 py-12 md:py-16 lg:py-24 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
            <div className="absolute top-1/4 left-1/5 w-72 h-72 bg-gradient-to-br from-purple-400 via-indigo-500 to-transparent rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-1/7 right-1/6 w-56 h-56 bg-gradient-to-tl from-sky-400 via-indigo-500/80 to-transparent rounded-full blur-2xl opacity-25"></div>
            <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-indigo-400/60 via-purple-400 to-transparent rounded-full blur-xl opacity-30"></div>
          </div>


          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl gradient-text font-medium">
              How It Works
            </h2>
            <p className="font-body max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Start a meeting and see your conversations transcribed in real time. From creation to sharing, here’s the simple workflow.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 text-center">
            <div className="glass-card p-6">
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xl">Create a Meeting</h3>
                <p className="font-body text-muted-foreground">Give your meeting a title and start a session to begin capturing your conversation.</p>
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xl">Join & Speak</h3>
                <p className="font-body text-muted-foreground">Speak freely while Verbatim transcribes everything in real time. Share a link so others can watch the transcript update live.</p>
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xl">Format Your Transcript</h3>
                <p className="font-body text-muted-foreground">Choose paragraph style for line-by-line with timestamps for more structured transcripts.</p>
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xl">Export & Share</h3>
                <p className="font-body text-muted-foreground">Copy, download, or share your transcripts instantly for collaboration or review.</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="create">
              <Button size="lg" className="bg-primary/90 text-lg backdrop-blur-sm rounded-2xl text-white opacity-90 hover:opacity-80">
                {/* font-body bg-primary/90 backdrop-blur-sm px-8 rounded-2xl py-3 text-lg font-semibold text-white opacity-90 hover:opacity-80 */}
                Start a Meeting <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

      </main>
      <footer className="border-t border-white/10 py-6 md:py-0 backdrop-blur-md bg-white/5">
        <div className="flex w-full mx-auto items-center justify-between px-6 md:h-24">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 text-primary" />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Verbatim. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
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
