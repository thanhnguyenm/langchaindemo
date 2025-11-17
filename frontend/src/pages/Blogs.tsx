import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "10 Must-Have Tech Gadgets for 2024",
    excerpt: "Discover the latest technology trends and gadgets that are revolutionizing how we work and live.",
    author: "Sarah Johnson",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop"
  },
  {
    id: 2,
    title: "Sustainable Fashion: A Complete Guide",
    excerpt: "Learn how to build a sustainable wardrobe without compromising on style or breaking the bank.",
    author: "Michael Chen",
    date: "2024-01-12",
    readTime: "7 min read",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=250&fit=crop"
  },
  {
    id: 3,
    title: "Home Organization Hacks That Actually Work",
    excerpt: "Transform your living space with these practical and affordable organization solutions.",
    author: "Emily Davis",
    date: "2024-01-10",
    readTime: "4 min read",
    category: "Home & Garden",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop"
  },
  {
    id: 4,
    title: "The Ultimate Fitness Equipment Buying Guide",
    excerpt: "Everything you need to know before investing in home fitness equipment for your workout routine.",
    author: "David Wilson",
    date: "2024-01-08",
    readTime: "6 min read",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop"
  },
  {
    id: 5,
    title: "Beauty Trends to Watch This Season",
    excerpt: "Stay ahead of the curve with the latest beauty trends and product recommendations from industry experts.",
    author: "Lisa Martinez",
    date: "2024-01-05",
    readTime: "3 min read",
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=250&fit=crop"
  },
  {
    id: 6,
    title: "Car Maintenance Tips for Every Season",
    excerpt: "Keep your vehicle running smoothly year-round with these essential maintenance tips and tricks.",
    author: "Robert Taylor",
    date: "2024-01-03",
    readTime: "8 min read",
    category: "Automotive",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop"
  }
];

export default function Blogs() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Our Blog</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest trends, tips, and insights from our experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readTime}
                  </div>
                </div>
                <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}