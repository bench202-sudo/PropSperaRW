import React from 'react';
import { Property } from '@/types';
import { MapPinIcon, ChevronRightIcon } from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';
 
interface NeighborhoodSectionProps {
  properties: Property[];
  onSelectNeighborhood: (neighborhood: string) => void;
}
 
const neighborhoodImages: Record<string, string> = {
  'Nyarutarama': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
  'Kagugu': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
  'Rugando': 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
  'Rusororo': 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&h=600&fit=crop',
  'Kicukiro': 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop',
  'Kimihurura': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
  'Kacyiru': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
  'Gisozi': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
  'Remera': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
  'Kiyovu': 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
  'Nyamirambo': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
  'Kabeza': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
  'Kanombe': 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop',
  'Rebero': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
  'Gaculiro': 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800&h=600&fit=crop',
  'Kibagabaga': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
};
 
const NeighborhoodSection: React.FC<NeighborhoodSectionProps> = ({
  properties,
  onSelectNeighborhood,
}) => {
  const { t } = useLanguage();
 
  // Count approved listings per neighborhood, sorted by count desc
  const neighborhoodCounts = properties
    .filter(p => p.status === 'approved')
    .reduce((acc, property) => {
      const n = property.neighborhood || 'Other';
      acc[n] = (acc[n] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
 
  const allSorted = Object.entries(neighborhoodCounts)
    .filter(([n]) => n !== 'Other')
    .sort((a, b) => b[1] - a[1]);
 
  // Top 6 get photo cards; the rest get list rows
  const featured = allSorted.slice(0, 6);
  const extra = allSorted.slice(6);
 
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
 
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t('exploreNeighborhoods')}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t('exploreNeighborhoodsSubtitle')}
          </p>
        </div>
 
        {/* ── Top 6: photo cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {featured.map(([neighborhood, count]) => (
            <button
              key={neighborhood}
              onClick={() => onSelectNeighborhood(neighborhood)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden"
            >
              <img
                src={
                  neighborhoodImages[neighborhood] ||
                  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'
                }
                alt={`Properties in ${neighborhood}, Kigali`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-1 text-white/80 text-sm mb-1">
                  <MapPinIcon size={14} />
                  <span>Kigali</span>
                </div>
                <h3 className="text-white font-bold text-lg">{neighborhood}</h3>
                <p className="text-white/80 text-sm">
                  {count} {count === 1 ? t('property') : t('properties')}
                </p>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRightIcon size={18} className="text-white" />
              </div>
            </button>
          ))}
        </div>
 
        {/* ── Extra neighborhoods: simple list ───────────────────────────── */}
        {extra.length > 0 && (
          <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('moreNeighborhoods') || 'More Neighborhoods'}
              </p>
            </div>
            <ul className="divide-y divide-gray-100">
              {extra.map(([neighborhood, count]) => (
                <li key={neighborhood}>
                  <button
                    onClick={() => onSelectNeighborhood(neighborhood)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MapPinIcon size={15} className="text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                        {neighborhood}
                      </span>
                      <span className="text-xs text-gray-400">· Kigali</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 group-hover:bg-blue-100 px-2 py-0.5 rounded-full transition-colors">
                        {count} {count === 1 ? t('property') : t('properties')}
                      </span>
                      <ChevronRightIcon size={15} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
 
      </div>
    </section>
  );
};
 
export default NeighborhoodSection;
