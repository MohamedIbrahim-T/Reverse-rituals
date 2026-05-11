import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Grid, List } from 'lucide-react';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${API_URL}/api/products`);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const productOrder = [
    'alchemy-combo',
    'alchemy-water',
    'neem-comb',
    'scalp-massager',
    'rosemary-comb-combo',
    'rosemary-massager-combo',
    'comb-massager-combo'
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const indexA = productOrder.indexOf(a._id);
    const indexB = productOrder.indexOf(b._id);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#064e3b] mb-4">
            The <span className="italic text-[#c5a059]">Collection</span>
          </h1>
          <p className="text-[#064e3b]/50 max-w-xl mx-auto">
            Discover our curated selection of botanical concentrates designed to restore and renew.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#064e3b]/30" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-full border border-[#064e3b]/10 bg-white focus:outline-none focus:border-[#c5a059] text-[#064e3b] placeholder-[#064e3b]/30"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#064e3b]/40 text-sm">{filteredProducts.length} products</span>
            <div className="flex gap-2 border border-[#064e3b]/10 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-[#064e3b] text-white' : 'text-[#064e3b]/40 hover:text-[#064e3b]'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-[#064e3b] text-white' : 'text-[#064e3b]/40 hover:text-[#064e3b]'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(n => (
              <div key={n} className="h-[400px] bg-white rounded-3xl animate-pulse border border-[#064e3b]/5"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#064e3b]/40 text-lg">No products found matching your search.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stockStatus === 'out_of_stock' || product.countInStock === 0;
              return (
                <div key={product._id} className={`flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border border-[#064e3b]/5 ${isOutOfStock ? 'opacity-75' : ''}`}>
                  <div className="md:w-1/3 aspect-square md:aspect-auto relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    {isOutOfStock && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-serif font-medium text-[#064e3b] mb-2">{product.name}</h3>
                    <p className="text-[#064e3b]/50 mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-serif italic text-[#c5a059]">₹{product.price}</span>
                      <button 
                        disabled={isOutOfStock}
                        className={`px-6 py-3 rounded-full font-medium transition-colors ${
                          isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#064e3b] text-white hover:bg-[#c5a059]'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
