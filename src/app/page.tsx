import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OurStory from "@/components/OurStory";
import Details from "@/components/Details";
import Footer from "@/components/Footer";
import Sticker from "@/components/Sticker";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-12 overflow-x-hidden">
        <Hero />
        <OurStory />
        <Details />
        {/* Decorative break */}
        <div className="py-12 flex justify-center">
          <Sticker
            src="/assets/sparkle.svg"
            width={200}
            height={200}
            className="w-48 h-48"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
