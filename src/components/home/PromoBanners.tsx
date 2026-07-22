import { Link } from 'react-router-dom';
import banner_prommo_one from '../../assets/banner-promo-one.png';
import banner_prommo_three from '../../assets/banner-promo-three.png';
import banner_prommo_two from '../../assets/banner-promo-two.png';

interface PromoItem {
  id: number;
  title: string;
  subtitle: string;
  href: string;
  bgColor: string;
  image: string;
}

const PROMOS: PromoItem[] = [
  {
    id: 1,
    title: 'Điện thoại chính hãng',
    subtitle: 'Giảm đến 30%',
    href: '/products?category=dien-thoai',
    bgColor: 'bg-gradient-to-r from-rose-50 to-rose-100',
    image: banner_prommo_one,
  },
  {
    id: 2,
    title: 'Laptop deal sốc',
    subtitle: 'Giảm đến 40%',
    href: '/products?category=laptop',
    bgColor: 'bg-gradient-to-r from-sky-50 to-sky-100',
    image: banner_prommo_two,
  },
  {
    id: 3,
    title: 'Phụ kiện giá tốt',
    subtitle: 'Giảm đến 20%',
    href: '/products?category=phu-kien',
    bgColor: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
    image: banner_prommo_three,
  },
];

export function PromoBanners() {
  return (
    <section className="">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROMOS.map((promo) => (
            <Link
              key={promo.id}
              to={promo.href}
              className={`group relative overflow-hidden rounded-lg ${promo.bgColor} h-40 flex items-center`}
            >
              {/* Text Content */}
              <div className="relative z-10 p-5 max-w-[60%]">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{promo.title}</h3>
                <p className="text-base text-gray-700 mt-1 mb-3 font-bold">{promo.subtitle}</p>
                <span className="inline-flex items-center text-sm font-semibold text-gray-500 group-hover:text-primary transition-colors">
                  Xem ngay
                </span>
              </div>

              {/* Image */}
              <div className="absolute right-0 top-0 bottom-0 w-[40%] flex items-center justify-center">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PromoBanners;
