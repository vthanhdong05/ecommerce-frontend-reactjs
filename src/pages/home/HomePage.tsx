import {
  FeaturedCategories,
  FeaturedProducts,
  HeroBanner,
  PromoBanners,
  ServiceFeatures,
} from '../../components/home';
import { usePageTitle } from '../../hooks';

export default function HomePage() {
  usePageTitle('Trang chủ');

  return (
    <div className="container mx-auto px-4 py space-y-2 bg-gray-50">
      <HeroBanner autoPlay={true} autoPlayInterval={5000} />
      <ServiceFeatures />
      <FeaturedCategories />
      <PromoBanners />
      <FeaturedProducts />
    </div>
  );
}
