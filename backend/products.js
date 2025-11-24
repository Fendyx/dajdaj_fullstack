const products = [
  {
    id: '1',
    name: { en: 'Male Bodybuilder', pl: 'Kulturysta męski' },
    price: 49,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/RegularBodyBuilder_withBox.png',
    category: 'male',
    description: {
      en: 'Perfect for celebrating victories and achievements',
      pl: 'Idealny do świętowania zwycięstw i osiągnięć'
    },
    descriptionProductPage: {
      en: 'Detailed info: this male bodybuilder figurine is perfect for fitness enthusiasts and collectors.',
      pl: 'Szczegółowe info: ta figuryna kulturysty jest idealna dla miłośników fitness i kolekcjonerów.'
    },
    isNew: true,
    isPopular: true,
    link: '/products/male-bodybuilder',
    phrases: {
      en: [
        "Power is in your hands",
        "Built for champions",
        "Strength defines you",
        "Lift, live, repeat",
        "Own your limits"
      ],
      pl: [
        "Siła jest w twoich rękach",
        "Stworzony dla mistrzów",
        "Siła cię definiuje",
        "Podnoś, żyj, powtarzaj",
        "Pokonaj swoje granice"
      ]
    }
  },
  {
    id: '2',
    name: { en: 'Beer Edition', pl: 'Edycja "Piwko"' },
    price: 45,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewPiwoEdycja_withBox.png',
    category: 'male',
    description: {
      en: 'Bench press lying, drink sitting',
      pl: 'Wyciskam na leżąco, piję na siedząco'
    },
    descriptionProductPage: {
      en: 'This special Beer Edition figurine is fun and quirky, perfect for beer lovers and gym enthusiasts alike.',
      pl: 'Ta specjalna figuryna Edycja Piwko jest zabawna i nietypowa, idealna dla miłośników piwa i fitness.'
    },
    isNew: true,
    link: '/products/beer-edition',
    phrases: {
      en: [
        "Cheers to strength",
        "Train hard, sip easy",
        "Beer and gains unite",
        "Work out, chill out",
        "Sip after the set"
      ],
      pl: [
        "Na zdrowie i siłę",
        "Trenuj ciężko, pij lekko",
        "Piwo i progres razem",
        "Ćwicz i relaksuj się",
        "Łyk po serii"
      ]
    }
  },
  {
    id: '3',
    name: { en: 'Trust the Bulk', pl: 'Zaufaj masie' },
    price: 52,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewTrustedTheBulk.png',
    category: 'male',
    description: {
      en: 'For those who inspire with their dedication',
      pl: 'Dla tych, którzy inspirują swoją determinacją'
    },
    descriptionProductPage: {
      en: 'Ideal figurine for bodybuilders who love progress and dedication, showcasing the bulk mode spirit.',
      pl: 'Idealna figuryna dla kulturystów kochających progres i determinację, pokazująca ducha trybu masy.'
    },
    isPopular: true,
    link: '/products/trust-bulk',
    phrases: {
      en: [
        "Bulk mode on",
        "Size matters",
        "Eat big, lift big",
        "Massive progress ahead",
        "Grow stronger daily"
      ],
      pl: [
        "Tryb masy włączony",
        "Rozmiar ma znaczenie",
        "Jedz dużo, podnoś dużo",
        "Wielki progres przed tobą",
        "Rośnij silniejszy każdego dnia"
      ]
    }
  },
  {
    id: '4',
    name: { en: 'Never Skip Leg Day', pl: 'Nigdy nie pomijaj dnia nóg' },
    price: 47,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewNeverSkipLegDay.png',
    category: 'male',
    description: {
      en: 'Celebrating comeback stories and resilience',
      pl: 'Świętując powroty i wytrwałość'
    },
    descriptionProductPage: {
      en: 'This figurine celebrates leg day dedication and perseverance, perfect for gym warriors.',
      pl: 'Ta figuryna celebruje poświęcenie na dzień nóg i wytrwałość, idealna dla wojowników siłowni.'
    },
    link: '/products/never-skip-legs',
    phrases: {
      en: [
        "Legs never lie",
        "Power from the ground",
        "Squat like a queen",
        "Strong legs, strong life",
        "Leg day every day"
      ],
      pl: [
        "Nogi nigdy nie kłamią",
        "Siła od ziemi",
        "Przysiady jak królowa",
        "Silne nogi, silne życie",
        "Dzień nóg codziennie"
      ]
    }
  },
  {
    id: '5',
    name: { en: 'Pink Female', pl: 'Różowa Figuryna' },
    price: 50,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/pinkHair_web.png',
    category: 'female',
    description: {
      en: 'For protectors and role models',
      pl: 'Dla opiekunów i wzorów do naśladowania'
    },
    descriptionProductPage: {
      en: 'A stylish pink female figurine, symbolizing courage, grace, and empowerment for everyone.',
      pl: 'Stylowa różowa figuryna kobieca, symbolizująca odwagę, grację i wzmocnienie dla wszystkich.'
    },
    link: '/products/female-pink',
    phrases: {
      en: [
        "Stay bold, stay pink",
        "Power with grace",
        "Strength in style",
        "Fearless and feminine",
        "Strong, stylish, unstoppable"
      ],
      pl: [
        "Bądź odważna, bądź różowa",
        "Siła z gracją",
        "Siła w stylu",
        "Nieustraszona i kobieca",
        "Silna, stylowa, nie do zatrzymania"
      ]
    }
  },
  {
    id: '6',
    name: { en: 'The Empress', pl: 'Cesarzowa' },
    price: 48,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/brunetteHair_web.png',
    category: 'female',
    description: {
      en: 'Celebrating leadership and grace under pressure',
      pl: 'Świętując przywództwo i grację pod presją'
    },
    descriptionProductPage: {
      en: 'Elegant brunette figurine representing leadership, power, and poise for ambitious collectors.',
      pl: 'Elegancka figuryna brunetki reprezentująca przywództwo, siłę i spokój dla ambitnych kolekcjonerów.'
    },
    link: '/products/female-brunette',
    phrases: {
      en: [
        "Rule your world",
        "Lead with strength",
        "Grace and power combined",
        "Your throne awaits",
        "Empowered and unstoppable"
      ],
      pl: [
        "Rządź swoim światem",
        "Prowadź z siłą",
        "Gracja i siła razem",
        "Twój tron czeka",
        "Wzmocniona i nie do zatrzymania"
      ]
    }
  },
  {
    id: '7',
    name: { en: 'The Legend', pl: 'Legenda' },
    price: 55,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/blondHair_web.jpg',
    category: 'female',
    description: {
      en: 'For those who leave lasting impressions',
      pl: 'Dla tych, którzy zostawiają trwałe wrażenia'
    },
    descriptionProductPage: {
      en: 'Blonde figurine for legends who inspire and leave a lasting mark, perfect for collectors.',
      pl: 'Blond figuryna dla legend, które inspirują i zostawiają trwały ślad, idealna dla kolekcjonerów.'
    },
    isPopular: true,
    link: '/products/female-blond',
    phrases: {
      en: [
        "Legends never die",
        "Be the story",
        "Unstoppable legacy",
        "Greatness is yours",
        "Write your legend"
      ],
      pl: [
        "Legendy nigdy nie umierają",
        "Bądź historią",
        "Niepowstrzymane dziedzictwo",
        "Wielkość jest twoja",
        "Napisz swoją legendę"
      ]
    }
  },
  {
    id: '8',
    name: { en: 'The Inspiration', pl: 'Inspiracja' },
    price: 46,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    category: 'female',
    description: {
      en: 'Perfect for motivators and dream chasers',
      pl: 'Idealna dla motywatorów i marzycieli'
    },
    descriptionProductPage: {
      en: 'A figurine for dreamers and motivators, inspiring greatness and ambition every day.',
      pl: 'Figuryna dla marzycieli i motywatorów, inspirująca wielkość i ambicję każdego dnia.'
    },
    link: '/products/special-girl',
    phrases: {
      en: [
        "Inspire greatness daily",
        "Dream big, act bigger",
        "Fuel their ambition",
        "Chase dreams relentlessly",
        "Be the spark"
      ],
      pl: [
        "Inspiruj wielkość codziennie",
        "Marz wielko, działaj większy",
        "Napędzaj ich ambicję",
        "Gon za marzeniami bez wytchnienia",
        "Bądź iskrą"
      ]
    }
  },
/*----------------------------------------------------------------------------------*/
  {
    id: '9',
    name: { en: 'Headphone stand', pl: 'Stojak na słuchawki' },
    price: 46,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    category: 'female',
    description: {
      en: 'Perfect for headphones',
      pl: 'Perfect for headphones'
    },
    descriptionProductPage: {
      en: 'Easy solution to find a place for your headphones.',
      pl: 'Easy solution to find a place for your headphones.'
    },
    link: '/products/headphone-stand',
    phrases: {
      en: [
        "Power is in your hands",
      ],
      pl: [
        "Siła jest w twoich rękach",
      ]
    }
  },
  {
    id: '10',
    name: { en: 'Desk Cable Organizer', pl: 'Desk Cable Organizer' },
    price: 46,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    category: 'female',
    description: {
      en: 'Desk Cable Organizer',
      pl: 'Desk Cable Organizer'
    },
    descriptionProductPage: {
      en: 'Easy solution to find a place for your cables.',
      pl: 'Easy solution to find a place for your cables.'
    },
    link: '/products/desk-cable-organizer',
    phrases: {
      en: [
        "Power is in your hands",
      ],
      pl: [
        "Siła jest w twoich rękach",
      ]
    }
  },
  {
    id: '11',
    name: { en: 'Cable Winder Cable Organizer', pl: 'Cable Winder Cable Organizer' },
    price: 46,
    image: 'https://s.alicdn.com/@sc04/kf/Hfc335c526ba64e38853834acdc16e1f4h.jpg_960x960q80.jpg',
    category: 'female',
    description: {
      en: 'Cable Organizer for Wire',
      pl: 'Cable Organizer for Wire'
    },
    descriptionProductPage: {
      en: 'Easy solution to find a headphone cleaning.',
      pl: 'Easy solution to find a headphone cleaning.'
    },
    link: '/products/headphone-cleaning-kit',
    phrases: {
      en: [
        "Power is in your hands",
      ],
      pl: [
        "Siła jest w twoich rękach",
      ]
    }
  },
  {
    id: '12',
    name: { en: 'Hand warmer', pl: 'Hand Warmer' },
    price: 46,
    image: 'https://s.alicdn.com/@sc04/kf/H098929b57fa14c30aa18cc03b10dcf48S.jpg',
    category: 'female',
    description: {
      en: 'Kemei Nose Hair Trimmer',
      pl: 'Kemei Nose Hair Trimmer'
    },
    descriptionProductPage: {
      en: 'Kemei Nose Hair Trimmer',
      pl: 'Kemei Nose Hair Trimmer'
    },
    link: '/products/kemei-nose-hair-trimmer',
    phrases: {
      en: [
        "Power is in your hands",
      ],
      pl: [
        "Siła jest w twoich rękach",
      ]
    }
  },
  /*----------------------------------------------------------------------------------*/
  {
    id: '13',
    name: { en: '1PC DIY Gift For Boyfriends', pl: '1PC DIY Gift For Boyfriends' },
    price: 46,
    image: 'https://ae-pic-a1.aliexpress-media.com/kf/S7b5bd0b3be29425e8ab4e7446ae3f179g.jpg_960x960q75.jpg_.avif',
    category: 'female',
    description: {
      en: '1PC DIY Gift For Boyfriends',
      pl: '1PC DIY Gift For Boyfriends'
    },
    descriptionProductPage: {
      en: '1PC DIY Gift For Boyfriends',
      pl: '1PC DIY Gift For Boyfriends'
    },
    link: '/products/diy',
    phrases: {
      en: [
        "Power is in your hands",
      ],
      pl: [
        "Siła jest w twoich rękach",
      ]
    }
  },
  {
    id: '14',
    name: { en: 'Professional Drone', pl: 'Professional Drone' },
    price: 46,
    image: 'https://ae-pic-a1.aliexpress-media.com/kf/S9057f3fa99c84371b768d2b4df70c32b6.jpg_960x960q75.jpg_.avif',
    category: 'female',
    description: {
      en: 'Professional Drone',
      pl: 'Professional Drone'
    },
    descriptionProductPage: {
      en: 'Professional Drone',
      pl: 'Professional Drone'
    },
    link: '/products/drone',
    phrases: {
      en: [
        "Power is in your hands",
      ],
      pl: [
        "Siła jest w twoich rękach",
      ]
    }
  },
  {
    id: '15',
    name: { en: 'Lego Buggati Car', pl: 'Lego Buggati Car' },
    price: 46,
    image: 'https://s.alicdn.com/@sc04/kf/H9fe00ed20c4a41398c727686d600309cY.jpg',
    category: 'female',
    description: {
      en: 'Lego Buggati Car',
      pl: 'Lego Buggati Car'
    },
    descriptionProductPage: {
      en: 'Lego Buggati Car',
      pl: 'Lego Buggati Car'
    },
    link: '/products/ring',
    phrases: {
      en: [
        "Power is in your hands",
      ],
      pl: [
        "Siła jest w twoich rękach",
      ]
    }
  },
  {
    id: '16',
    name: { en: 'Metal Fidget Spinner', pl: 'Metal Fidget Spinner' },
    price: 46,
    image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sfeaf235917304a8580a8f8b8e72b7e2fo.jpg_960x960q75.jpg_.avif',
    category: 'female',
    description: {
      en: 'Metal Fidget Spinner',
      pl: 'Metal Fidget Spinner'
    },
    descriptionProductPage: {
      en: 'Metal Fidget Spinner',
      pl: 'Metal Fidget Spinner'
    },
    link: '/products/metal-fidget-spinner',
    phrases: {
      en: [
        "Poawer is in your hands",
      ],
      pl: [
        "Siła jest w twoich rękach",
      ]
    }
  }
];

module.exports = products;
