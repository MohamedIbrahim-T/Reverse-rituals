import React from 'react';
import { Leaf, FlaskConical, Globe, Award, Target, Heart, Check, Droplets, Sparkles, Users } from 'lucide-react';
import ReviewSection from '../components/ReviewSection';
import AboutSection from '../components/AboutSection';

const AboutPage = () => {
  return (
    <div className="bg-[#fdfbf7]  pt-10 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-5">
        <div className="text-center mb-16">
          <p className="text-[#c5a059] font-medium uppercase tracking-widest text-sm mb-4">Our Story</p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#064e3b]">
            Restoring Hair <span className="italic text-[#c5a059]">Naturally</span>
          </h1>
          <p className="text-[#064e3b]/60 max-w-2xl mx-auto mt-6 text-lg">
            Rooted in Ayurvedic tradition, powered by nature, proven by results.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-lg">
              <img
                src={new URL('../assets/sadiq.JPG', import.meta.url).href}
                alt="R. Sadiq Basha - Founder"
                className="w-full h-full object-cover"
              />
            </div>

          </div>

          <div>
            <p className="text-[#c5a059] font-medium uppercase tracking-widest text-sm mb-4">Founder</p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#064e3b] mb-6">
              R. Sadiq Basha
            </h2>
            <div className="space-y-6 text-[#064e3b]/80 leading-relaxed font-medium">
              <p className="text-xl md:text-2xl font-serif text-[#064e3b] leading-tight italic">
                Our brand was born from personal experience and a deep belief in the power of natural hair care.
              </p>

              <p>
                Our journey began with a simple goal — to solve common hair concerns like hair fall, dandruff, etc. After struggling with these common concerns, we began experimenting with traditional herbal remedies.
              </p>

              <p>
                With consistent use, we experienced a visible transformation — stronger roots, reduced hair fall, and healthier growth. Every product is now thoughtfully crafted, tested, and used personally to ensure it delivers visible and consistent results.
              </p>

              <p>
                We believe in combining the power of nature with the right formulations to promote healthy, strong, and beautiful hair. At our core, we stand for honesty, transparency, quality, and results you can truly see and feel.
              </p>
            </div>
          </div>
        </div>
      </section>
      <AboutSection />
      {/* Why Choose Us */}
      <section className="bg-white py-20 mb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#c5a059] font-medium uppercase tracking-widest text-sm mb-4">Why Reverse Rituals</p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#064e3b]">What Makes Us Different</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets size={28} className="text-[#c5a059]" />
              </div>
              <h3 className="text-lg font-medium text-[#064e3b] mb-2">No Water Dilution</h3>
              <p className="text-[#064e3b]/50 text-sm">
                Our products are concentrated—maximum benefits in every drop.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf size={28} className="text-[#c5a059]" />
              </div>
              <h3 className="text-lg font-medium text-[#064e3b] mb-2">100% Natural</h3>
              <p className="text-[#064e3b]/50 text-sm">
                No sulfates, no parabens, no harsh chemicals. Just pure herbs.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical size={28} className="text-[#c5a059]" />
              </div>
              <h3 className="text-lg font-medium text-[#064e3b] mb-2">Ayurvedic Formula</h3>
              <p className="text-[#064e3b]/50 text-sm">
                Based on centuries-old Ayurvedic recipes for hair health.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-[#c5a059]" />
              </div>
              <h3 className="text-lg font-medium text-[#064e3b] mb-2">Visible Results</h3>
              <p className="text-[#064e3b]/50 text-sm">
                Most customers see improvements within 2-3 weeks of use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target size={28} className="text-[#c5a059]" />
            </div>
            <h3 className="text-xl font-medium text-[#064e3b] mb-3">Our Mission</h3>
            <p className="text-[#064e3b]/50 leading-relaxed">
              To provide effective, natural hair care solutions that address root causes rather than just symptoms—helping everyone achieve their best hair health.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Leaf size={28} className="text-[#c5a059]" />
            </div>
            <h3 className="text-xl font-medium text-[#064e3b] mb-3">Our Approach</h3>
            <p className="text-[#064e3b]/50 leading-relaxed">
              Combining ancient Ayurvedic herbs with modern extraction methods for maximum potency. Every ingredient is carefully sourced and tested.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={28} className="text-[#c5a059]" />
            </div>
            <h3 className="text-xl font-medium text-[#064e3b] mb-3">Our Promise</h3>
            <p className="text-[#064e3b]/50 leading-relaxed">
              Every product is crafted with integrity, transparency, and a genuine commitment to your hair health. No empty promises—just real results.
            </p>
          </div>
        </div>
      </section>

      {/* Product Benefits */}
      <section className="bg-[#064e3b] py-20 mb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-white mb-4">Our Product Benefits</h2>
            <p className="text-white/60">What you can expect from our products</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Reduces hair fall and strengthens roots",
              "Promotes new hair growth",
              "Controls dandruff and scalp issues",
              "Improves hair thickness and volume",
              "Adds natural shine and luster",
              "Conditions and nourishes hair",
              "Prevents premature greying",
              "Improves scalp blood circulation"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg text-white">
                <Check size={20} className="text-[#c5a059]" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewSection />
      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="p-12 bg-[#064e3b] rounded-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
            Ready to Transform Your Hair?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Join thousands of others who have discovered the power of natural, Ayurvedic hair care. Start your journey to healthier hair today.
          </p>
          <a
            href="/shop"
            className="inline-block px-8 py-4 bg-[#c5a059] text-white rounded-full font-medium hover:bg-[#b08d4a] transition-colors"
          >
            Explore Products
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;