import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OurStory from "@/components/OurStory";
import Details from "@/components/Details";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-24 overflow-x-hidden">
        <Hero />
        <OurStory />
        <Details />
        {/* Decorative break */}
        <div className="py-12 flex justify-center gap-12 opacity-30">
          <Image
            src="/assets/heart.svg"
            alt=""
            width={128}
            height={128}
            className="w-32 h-32"
          />
          <Image
            src="/assets/star.svg"
            alt=""
            width={160}
            height={160}
            className="w-40 h-40"
          />
          <Image
            src="/assets/heart.svg"
            alt=""
            width={128}
            height={128}
            className="w-32 h-32"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
