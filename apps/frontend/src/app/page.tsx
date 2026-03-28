import { Header } from '@/components/Header'
import Link from 'next/link'

const CATEGORIES = [
  { name: 'T-Shirt', icon: '👕', href: '/discover?category=T-Shirt' },
  { name: 'Hoodie', icon: '🧥', href: '/discover?category=Hoodie' },
  { name: 'Aksesuar', icon: '👜', href: '/discover?category=Aksesuar' },
  { name: 'Kap & Şapka', icon: '🧢', href: '/discover?category=Kap' },
  { name: 'Kupa', icon: '☕', href: '/discover?category=Kupa' },
  { name: 'Çanta', icon: '🎒', href: '/discover?category=Canta' },
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Markalar ürün şablonu yükler',
    desc: 'Koton, LCWaikiki gibi markalar boş ürünlerini platforma ekler ve taban fiyatını belirler.',
    icon: '🏷️',
  },
  {
    step: '2',
    title: 'Tasarımcılar tasarımlarını yükler',
    desc: 'Tasarımcılar istediği markanın ürününü seçer, tasarımını yükler ve satış fiyatını belirler. Ön ödeme yok.',
    icon: '🎨',
  },
  {
    step: '3',
    title: 'Müşteriler alışveriş yapar',
    desc: 'Benzersiz tasarımları keşfedip MetaMask ile Monad Testnet üzerinden güvenli ödeme yapar.',
    icon: '🛒',
  },
  {
    step: '4',
    title: 'Otomatik ödeme dağıtımı',
    desc: 'Satış gerçekleşince kargo ve vergi düşüldükten sonra kalan tutar tasarımcıya otomatik ödenir.',
    icon: '💸',
  },
]

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Monad Testnet üzerinde çalışıyor
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Tasarımını Yükle,<br />
            <span className="text-red-400">Dünya Satsın</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Markalar, tasarımcılar ve müşterileri blockchain üzerinde buluşturan Türkiye&apos;nin ilk Web3 print-on-demand platformu.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/discover" className="px-8 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 text-lg">
              Tasarımları Keşfet
            </Link>
            <Link href="/register" className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-full font-semibold hover:bg-white/20 text-lg border border-white/20">
              Tasarımcı Ol — Ücretsiz
            </Link>
          </div>
          <div className="mt-12 flex justify-center gap-12 text-center">
            {[['500+', 'Tasarım'], ['50+', 'Tasarımcı'], ['10+', 'Marka'], ['Monad', 'Testnet']].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex-shrink-0 flex flex-col items-center gap-2 px-6 py-4 bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition group"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Redbubble&apos;ın gücü, blockchain&apos;in güvencesi ile — markalar, tasarımcılar ve müşteriler için.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                {item.icon}
              </div>
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For each role */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Senin için ne var?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: '🏷️ Marka',
                color: 'blue',
                title: 'Ürünlerini platforma ekle',
                items: ['Boş ürün şablonlarını yükle', 'Taban fiyatını belirle', 'Tasarımcılar senin ürününü tasarlasın', 'Her satıştan pay al', 'Gerçek zamanlı analitik'],
                cta: 'Marka Olarak Katıl',
                href: '/register?role=BRAND',
              },
              {
                role: '🎨 Tasarımcı',
                color: 'red',
                title: 'Tasarla, kazan',
                items: ['Binlerce marka ürünü arasından seç', 'Tasarımını yükle — ücretsiz', 'Kendi satış fiyatını belirle', 'Otomatik cüzdan ödemesi', 'Sınırsız ürün'],
                cta: 'Tasarımcı Ol',
                href: '/register?role=DESIGNER',
              },
              {
                role: '🛒 Müşteri',
                color: 'green',
                title: 'Benzersiz tasarımlar keşfet',
                items: ['Binlerce özgün tasarım', 'Markalı kaliteli ürünler', 'MetaMask ile güvenli ödeme', 'Monad Testnet', 'Tasarımcıyı doğrudan destekle'],
                cta: 'Alışverişe Başla',
                href: '/discover',
              },
            ].map((card) => (
              <div key={card.role} className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition">
                <p className="text-2xl mb-3">{card.role}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
                <ul className="space-y-2 mb-6">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <Link href={card.href} className="block text-center px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600">
                  {card.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gray-900 text-white py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Hemen başla, ücretsiz</h2>
          <p className="text-gray-400 mb-8">Tasarımcı, marka ya da müşteri olarak katıl. Monad Testnet üzerinde blockchain gücüyle.</p>
          <Link href="/register" className="inline-block px-8 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 text-lg">
            Ücretsiz Üye Ol
          </Link>
        </div>
      </section>
    </>
  )
}
