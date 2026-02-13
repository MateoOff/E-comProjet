import { FormProduct } from "../components/FormProduct";
// src/pages/SellProduct.jsx
export default function SellProduct() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Bienvenue sur Mon Shop !
      </h1>
      <FormProduct />
      <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
        Une fois publié, votre produit apparaîtra dans la boutique.
      </p>
    </div>
  );
}
