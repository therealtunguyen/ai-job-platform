import FeatureJob from "@/components/Landing/FeatureJob";
import FeatureWeb from "@/components/Landing/FeatureWeb";
import Footer from "@/components/Landing/Footer";
import Header from "@/components/Landing/Header";
import Hero from "@/components/Landing/Hero";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <FeatureJob />
      <FeatureWeb />
      <Footer />
    </div>
  );
};

export default LandingPage;
