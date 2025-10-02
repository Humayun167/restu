import { menu_list } from "@/assets/assets";

interface MenuSectionProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const MenuSection = ({ selectedCategory, onCategorySelect }: MenuSectionProps) => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Explore Our Menu</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your
            cravings and elevate your dining experience, one delicious meal at a time.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => onCategorySelect("All")}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === "All"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          {menu_list.map((menu, index) => (
            <button
              key={index}
              onClick={() => onCategorySelect(menu.menu_name)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === menu.menu_name
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {menu.menu_name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {menu_list.map((menu, index) => (
            <div
              key={index}
              onClick={() => onCategorySelect(menu.menu_name)}
              className={`cursor-pointer group text-center p-4 rounded-lg transition-all duration-300 ${
                selectedCategory === menu.menu_name
                  ? "bg-primary/10 border-2 border-primary"
                  : "hover:bg-secondary/50"
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <img
                  src={menu.menu_image}
                  alt={menu.menu_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-foreground">{menu.menu_name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;