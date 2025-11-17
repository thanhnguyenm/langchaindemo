import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Discover Our Story
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch how we're revolutionizing the shopping experience with quality products 
            and exceptional customer service.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
            {!isPlaying ? (
              <>
                {/* Video Thumbnail */}
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop"
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Button
                    size="lg"
                    className="w-20 h-20 rounded-full bg-white/90 hover:bg-white text-gray-900 hover:text-gray-900 shadow-lg transition-all duration-300 hover:scale-110"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>

                {/* Video Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Behind the Scenes: EcomStore Experience
                  </h3>
                  <p className="text-white/90 text-sm">
                    Learn about our commitment to quality and customer satisfaction
                  </p>
                </div>
              </>
            ) : (
              /* Embedded Video */
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="EcomStore Video"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* Video Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1000+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}