import { Card } from "@/components/ui/card";
import BlurTextSimple from "./BlurTextSimple";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import food1 from "@/assets/food_1.png";
import food15 from "@/assets/food_15.png";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-6">
              <BlurTextSimple
                text="About us"
                delay={100}
                animateBy="words"
                direction="top"
                className="text-primary font-medium tracking-wider uppercase text-sm mb-4"
              />
              <BlurTextSimple
                text="We invite you to visit our restaurant"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-4xl md:text-5xl font-bold text-foreground leading-tight"
              />
            </div>
            
            <div className="space-y-6 text-foreground/80 leading-relaxed">
              <BlurTextSimple
                text="Assumenda possimus eaque illo iste, autem. Porro eveniet, autem ipsam vitae amet repellat repudiandae tenetur, quod corrupti consectetur cum? Repudiandae dignissimos fugiat sit nam."
                delay={50}
                animateBy="words"
                direction="bottom"
                className="text-justify text-[1.1rem] leading-[1.7]"
              />
              <BlurTextSimple
                text="Tempore aspernatur quae repudiandae dolorem, beatae dolorum, praesentium itaque et quam quaerat. Cumque, consequatur!"
                delay={60}
                animateBy="words"
                direction="bottom"
                className="text-justify text-[1.1rem] leading-[1.7]"
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">
              <Card className="p-6 bg-background border-border">
                <h3 className="text-2xl font-bold text-primary mb-2">150+</h3>
                <p className="text-foreground/60">Daily Orders</p>
              </Card>
              <Card className="p-6 bg-background border-border">
                <h3 className="text-2xl font-bold text-primary mb-2">50+</h3>
                <p className="text-foreground/60">Menu Items</p>
              </Card>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card className="aspect-square bg-muted overflow-hidden">
                  <img 
                    src={heroSlide1} 
                    alt="Restaurant Interior" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Card>
                <Card className="aspect-[4/3] bg-muted overflow-hidden">
                  <img 
                    src={food1} 
                    alt="Delicious Food" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Card>
              </div>
              <div className="space-y-4 pt-8">
                <Card className="aspect-[4/3] bg-muted overflow-hidden">
                  <img 
                    src={food15} 
                    alt="Signature Dish" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Card>
                <Card className="aspect-square bg-muted overflow-hidden">
                  <img 
                    src={heroSlide2} 
                    alt="Dining Experience" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Card>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;