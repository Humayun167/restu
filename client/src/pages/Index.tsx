import { useState } from "react";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import AboutSection from "@/components/AboutSection";
import MenuSection from "@/components/MenuSection";
import FoodDisplay from "@/components/FoodDisplay";
import Footer from "@/components/Footer";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSlider />
      <AboutSection />
      <MenuSection 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <FoodDisplay selectedCategory={selectedCategory} />
      <Footer />
    </div>
  );
};

export default Index;
