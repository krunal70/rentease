"use client";

import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { mockProperties } from "@/data/mock";
import {
  Building,
  Search,
  Shield,
  MessageSquare,
  FileText,
  Users,
  ArrowRight,
  Star,
  MapPin,
  Bed,
  Bath,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Find your perfect rental with advanced filters and personalized recommendations.",
  },
  {
    icon: Shield,
    title: "Verified Listings",
    description:
      "All properties are verified to ensure quality and accurate information.",
  },
  {
    icon: MessageSquare,
    title: "Instant Messaging",
    description:
      "Connect directly with landlords and property managers in real-time.",
  },
  {
    icon: FileText,
    title: "Easy Applications",
    description:
      "Apply to multiple properties with a single, reusable application.",
  },
  {
    icon: Users,
    title: "For Everyone",
    description:
      "Whether you're a tenant, landlord, or property manager, we've got you covered.",
  },
  {
    icon: Building,
    title: "Property Management",
    description:
      "Manage listings, applications, and communications all in one place.",
  },
];

const stats = [
  { value: "10K+", label: "Properties Listed" },
  { value: "50K+", label: "Happy Tenants" },
  { value: "5K+", label: "Landlords" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  // Show 4 properties on large screens, 3 on smaller
  const featuredProperties = mockProperties.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-section relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-24 md:py-32 2xl:py-40">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          {/* Additional decorative elements for large screens */}
          <div className="hidden 2xl:block absolute top-1/4 left-10 w-20 h-20 border border-white/20 rounded-full" />
          <div className="hidden 2xl:block absolute bottom-1/4 right-16 w-32 h-32 border border-white/10 rounded-full" />
          <div className="container relative px-4 2xl:px-8">
            <div className="mx-auto max-w-3xl 2xl:max-w-4xl text-center">
              <Badge className="mb-4 2xl:mb-6 bg-white/20 text-white hover:bg-white/30 2xl:text-base 2xl:px-4 2xl:py-1.5">
                🏠 The Future of Renting
              </Badge>
              <h1 className="hero-title text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl 2xl:text-7xl">
                Find Your{" "}
                <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                  Perfect Home
                </span>
              </h1>
              <p className="hero-subtitle mt-6 text-lg text-blue-100 md:text-xl 2xl:text-2xl 2xl:mt-8 2xl:leading-relaxed">
                RentEase connects tenants with their dream rentals and empowers
                landlords with powerful management tools. Start your journey
                today.
              </p>
              <div className="mt-10 2xl:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 2xl:gap-6">
                <Link href="/properties">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 2xl:text-lg 2xl:px-8 2xl:py-6"
                  >
                    Browse Properties
                    <ArrowRight className="ml-2 h-4 w-4 2xl:h-5 2xl:w-5" />
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          {/* Decorative blobs */}
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </section>

        {/* Stats Section */}
        <section className="border-b bg-muted/40 py-12 2xl:py-16">
          <div className="container px-4 2xl:px-8">
            <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8 2xl:gap-16">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="stat-value text-3xl font-bold text-primary md:text-4xl 2xl:text-5xl">
                    {stat.value}
                  </div>
                  <div className="stat-label mt-1 text-sm text-muted-foreground 2xl:text-base 2xl:mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16 md:py-24 2xl:py-32">
          <div className="container px-4 2xl:px-8">
            <div className="mb-12 2xl:mb-16 text-center">
              <h2 className="section-title text-3xl font-bold md:text-4xl 2xl:text-5xl">
                Featured Properties
              </h2>
              <p className="section-subtitle mt-4 text-muted-foreground 2xl:text-lg 2xl:mt-6">
                Discover top-rated rentals handpicked for you
              </p>
            </div>
            <div className="property-grid grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-8">
              {featuredProperties.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`}>
                  <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 2xl:hover:-translate-y-2">
                    <div className="property-card-image relative aspect-[4/3] 2xl:aspect-[16/11] overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary 2xl:top-4 2xl:left-4">
                        {property.propertyType}
                      </Badge>
                    </div>
                    <CardContent className="p-4 2xl:p-6">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 text-sm">4.8</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        {property.address.city}, {property.address.state}
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Bed className="mr-1 h-4 w-4" />
                          {property.bedrooms} bed
                        </span>
                        <span className="flex items-center">
                          <Bath className="mr-1 h-4 w-4" />
                          {property.bathrooms} bath
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          ${property.price.toLocaleString()}
                          <span className="text-sm font-normal text-muted-foreground">
                            /mo
                          </span>
                        </span>
                        <Button variant="ghost" size="sm" className="group-hover:text-primary">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/properties">
                <Button size="lg" variant="outline">
                  View All Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/40 py-16 md:py-24 2xl:py-32">
          <div className="container px-4 2xl:px-8">
            <div className="mb-12 2xl:mb-16 text-center">
              <h2 className="section-title text-3xl font-bold md:text-4xl 2xl:text-5xl">
                Why Choose RentEase?
              </h2>
              <p className="section-subtitle mt-4 text-muted-foreground 2xl:text-lg 2xl:mt-6">
                Everything you need to find, secure, and manage your rental
              </p>
            </div>
            <div className="features-grid grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:gap-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="feature-card bg-background/80 backdrop-blur hover:shadow-md transition-shadow 2xl:hover:shadow-lg"
                  >
                    <CardContent className="p-6 2xl:p-8">
                      <div className="feature-icon flex h-12 w-12 2xl:h-16 2xl:w-16 items-center justify-center rounded-lg 2xl:rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                        <Icon className="h-6 w-6 2xl:h-8 2xl:w-8 text-white" />
                      </div>
                      <h3 className="feature-title mt-4 2xl:mt-6 font-semibold text-lg 2xl:text-xl">
                        {feature.title}
                      </h3>
                      <p className="feature-description mt-2 2xl:mt-3 text-sm 2xl:text-base text-muted-foreground 2xl:leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 2xl:py-32">
          <div className="container px-4 2xl:px-8">
            <Card className="cta-section overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 2xl:rounded-2xl">
              <CardContent className="p-8 md:p-12 2xl:p-16">
                <div className="mx-auto max-w-2xl 2xl:max-w-3xl text-center text-white">
                  <h2 className="cta-title text-3xl font-bold md:text-4xl 2xl:text-5xl">
                    Ready to Find Your New Home?
                  </h2>
                  <p className="cta-description mt-4 2xl:mt-6 text-blue-100 2xl:text-xl 2xl:leading-relaxed">
                    Join thousands of happy renters who found their perfect place
                    on RentEase. Sign up today and start your search!
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50"
                      >
                        Create Account
                      </Button>
                    </Link>
                    <Link href="/properties">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                      >
                        Browse Properties
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
