import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
      theme: "light",
      style: {
        background: "#ffffff",
        color: "#064e3b",
        borderRadius: "10px",
        border: "1px solid #e5e7eb"
      }
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl flex flex-col h-full"
    >
      <Link
        to={`/product/${product._id}`}
        className="relative block aspect-[5/4.5] overflow-hidden bg-[#fdfbf7]"
      >
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-bold text-[#064e3b] mb-1 group-hover:text-[#c5a059] transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xl font-black text-[#064e3b]">₹{product.price}</span>
          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
            <>
              <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
              <span className="text-xs bg-[#c5a059] text-white px-1.5 py-0.5 rounded-full">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>

        <div className="mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="w-full py-3 rounded-2xl bg-[#064e3b] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#c5a059] transition-colors cursor-pointer"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;