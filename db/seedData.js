'use strict';

/**
 * Default Seed Data for Cloutgency CMS
 * Pre-populated with the exact live content, assets, and metadata from the website.
 */

const defaultSeed = {
  // ── Global Site & SEO Settings ─────────────────────────────────────────────
  seo: {
    siteName: 'Cloutgency',
    siteUrl: process.env.SITE_URL || 'https://cloutgency.com',
    defaultTitle: 'Creative Agency in Chennai — Grow Your Brand Now | Cloutgency',
    defaultDescription: "Cloutgency is Chennai's leading creative agency for branding & digital marketing. The branding agency in Chennai businesses trust. Build yours today.",
    defaultOgImage: '/images/og-image.jpg',
    twitterCard: 'summary_large_image',
    twitterHandle: '@cloutgency',
    gtmId: 'GTM-XXXXXXX',
    gaId: 'G-9P586QVTT9',
    metaPixelId: '',
    phone: '+91 74184 85333',
    email: 'info@cloutgency.com',
    instagram: 'https://www.instagram.com/cloutgency?igsh=eGUyNGxwNTkybHll',
    linkedin: 'https://www.linkedin.com/company/cloutgency/',
    address: 'Chennai, Tamil Nadu, India',
    pages: {
      '/': {
        title: 'Creative Agency in Chennai — Grow Your Brand Now | Cloutgency',
        description: "Cloutgency is Chennai's leading creative agency for branding & digital marketing. The branding agency in Chennai businesses trust. Build yours today.",
        canonical: 'https://cloutgency.com/',
        ogTitle: 'Creative Agency in Chennai — Grow Your Brand Now | Cloutgency',
        ogDescription: "Cloutgency is Chennai's leading creative agency for branding & digital marketing. The branding agency in Chennai businesses trust. Build yours today.",
        ogImage: '/images/og-image.jpg',
        keywords: 'creative agency, branding agency chennai, digital marketing chennai, gen z agency'
      },
      '/about-us': {
        title: 'About Us — Who We Are | Cloutgency',
        description: "Learn about Cloutgency — Chennai's leading creative agency. Our team, our story, and our mission to make brands impossible to ignore.",
        canonical: 'https://cloutgency.com/about-us',
        ogTitle: 'About Us — Who We Are | Cloutgency',
        ogDescription: "Learn about Cloutgency — Chennai's leading creative agency. Our team, our story, and our mission to make brands impossible to ignore.",
        ogImage: '/images/og-image.jpg',
        keywords: 'about cloutgency, agency team, brand philosophy chennai'
      },
      '/our-services': {
        title: 'Our Services — Branding, Digital Marketing & More | Cloutgency',
        description: "Explore Cloutgency's full range of creative services: branding, digital marketing, content creation, performance marketing, web design, and SEO.",
        canonical: 'https://cloutgency.com/our-services',
        ogTitle: 'Our Services — Branding, Digital Marketing & More | Cloutgency',
        ogDescription: "Explore Cloutgency's full range of creative services: branding, digital marketing, content creation, performance marketing, web design, and SEO.",
        ogImage: '/images/og-image.jpg',
        keywords: 'branding services, performance marketing, social media marketing, web development'
      },
      '/our-works': {
        title: 'Our Work — Portfolio & Case Studies | Cloutgency',
        description: "See Cloutgency's portfolio — real results for real brands. Branding, campaigns, content, and web projects that made an impact.",
        canonical: 'https://cloutgency.com/our-works',
        ogTitle: 'Our Work — Portfolio & Case Studies | Cloutgency',
        ogDescription: "See Cloutgency's portfolio — real results for real brands. Branding, campaigns, content, and web projects that made an impact.",
        ogImage: '/images/og-image.jpg',
        keywords: 'cloutgency portfolio, case studies, client campaigns'
      },
      '/contact-us': {
        title: 'Contact Us — Get in Touch | Cloutgency',
        description: "Ready to grow your brand? Get in touch with Cloutgency — Chennai's leading creative agency. Let's build something great together.",
        canonical: 'https://cloutgency.com/contact-us',
        ogTitle: 'Contact Us — Get in Touch | Cloutgency',
        ogDescription: "Ready to grow your brand? Get in touch with Cloutgency — Chennai's leading creative agency. Let's build something great together.",
        ogImage: '/images/og-image.jpg',
        keywords: 'contact cloutgency, hire creative agency, chennai marketing agency'
      },
      '/careers': {
        title: 'Careers — Join Our Team | Cloutgency',
        description: 'Join the Cloutgency team! We are always looking for talented creatives, marketers, and developers. See our open positions.',
        canonical: 'https://cloutgency.com/careers',
        ogTitle: 'Careers — Join Our Team | Cloutgency',
        ogDescription: 'Join the Cloutgency team! We are always looking for talented creatives, marketers, and developers. See our open positions.',
        ogImage: '/images/og-image.jpg',
        keywords: 'careers at cloutgency, marketing jobs chennai, internship chennai'
      },
      '/blog': {
        title: 'Blog — Insights, Tips & Stories | Cloutgency',
        description: 'Cloutgency blog — insights, tips, and stories about branding, digital marketing, content creation, and building brands that Gen Z loves.',
        canonical: 'https://cloutgency.com/blog',
        ogTitle: 'Blog — Insights, Tips & Stories | Cloutgency',
        ogDescription: 'Cloutgency blog — insights, tips, and stories about branding, digital marketing, content creation, and building brands that Gen Z loves.',
        ogImage: '/images/og-image.jpg',
        keywords: 'marketing blog, branding insights, creative trends'
      }
    }
  },

  // ── Page Sections Content (Editable Section-by-Section) ────────────────────
  pages: {
    home: {
      hero: {
        headingLine1: 'Your brand is invisible to anyone',
        headingLine2: 'Under 30',
        subtitleLink: "We're here to fix that.",
        subtitleUrl: '/contact-us',
        tagline: "Cloutgency is built for one job - making consumer brands impossible to ignore by the generation that actually decides what's relevant.",
        starImage: '/images/Astrix_1440.png',
        floatingVideo: '/videos/Cloutgency-Ad-Reeel-1-1_mp4.mp4',
        floatingPoster: '/videos/Cloutgency-Ad-Reeel-1-1_poster.0000000.jpg',
        scrollHintText: 'Scroll to explore'
      },
      expandVideo: {
        videoUrl: '/videos/website_6-resize_mp4.mp4',
        posterUrl: '/videos/website_6-resize_poster.0000000.jpg',
        badgeText: 'SHOWREEL 2026'
      },
      clients: {
        badge: 'TRUSTED BY INNOVATORS',
        heading: 'Our Clients',
        description: 'Powering high-growth consumer brands with unforgettable digital presence.',
        logos: [
          { name: 'Naturals', image: '/images/Naturals_4.png' },
          { name: 'DRA Homes', image: '/images/DRA_4.png' },
          { name: 'Dr. B', image: '/images/Dr-B_1.png' },
          { name: 'Chaitanya', image: '/images/Chaitanya_3.png' },
          { name: 'Raj Paris', image: '/images/Raj-paris.png' },
          { name: 'KKIX Customs', image: '/images/KKIX_3.png' },
          { name: 'Soft Serve', image: '/images/Soft-Serve_2.png' },
          { name: 'Sreerosh', image: '/images/Sreerosh-pro.png' },
          { name: 'BBCL', image: '/images/BBCL_2.png' },
          { name: 'Cherrinet', image: '/images/Cherrinet.png' },
          { name: 'Arihant', image: '/images/Arihant.png' }
        ]
      },
      servicesOverview: {
        badge: 'WHAT WE DO',
        heading: 'Our Services',
        subheading: 'Engineered for Cultural Resonance and High ROI',
        items: [
          { title: 'BRANDING', desc: 'Crafting unforgettable visual identities, logos, voice and design systems.', link: '/our-services' },
          { title: 'Digital Marketing', desc: 'Omnichannel storytelling, organic buzz, and high-engagement content.', link: '/our-services' },
          { title: 'Content Creation', desc: 'Cinematic ad reels, 3D motion, viral video formats and production.', link: '/our-services' },
          { title: 'Performance Marketing', desc: 'Laser-targeted ads with optimized customer acquisition costs and scalable ROAS.', link: '/our-services' },
          { title: 'Web Design', desc: 'Stunning, fluid, high-converting interactive web experiences built to impress.', link: '/our-services' }
        ]
      },
      metrics: {
        heading: "DON'T TAKE OUR WORD FOR IT.",
        stat1Value: '50',
        stat1Suffix: '+',
        stat1Label: 'Brands Elevated',
        stat2Value: '12',
        stat2Suffix: 'M+',
        stat2Label: 'Impressions Generated',
        stat3Value: '98',
        stat3Suffix: '%',
        stat3Label: 'Client Retention Rate',
        stat4Value: '4',
        stat4Suffix: '.9',
        stat4Label: 'Average Rating'
      },
      newsletter: {
        heading: 'STAY AHE@D',
        description: 'Get the insights, ideas, and cultural shifts that matter to consumer brands, before everyone else catches on. Sign up and unlock a Free discovery call with the Cloutgency team.',
        buttonText: '→'
      }
    },

    about: {
      hero: {
        title: 'Making Brands Impossible to Ignore',
        subtitle: 'About Cloutgency',
        description: 'We are a next-generation creative and growth agency headquartered in Chennai, focused on transforming ambitious brands into cultural icons.'
      },
      mission: {
        heading: 'Why We Exist',
        text: 'The playbook for consumer brands has changed. Attention spans are shorter, aesthetics matter more, and legacy advertising fails to connect with Gen Z and millennial buyers. We build cultural relevance directly into your brand DNA.'
      },
      values: [
        { title: 'Obsession with Aesthetics', desc: 'Every visual, interaction, and frame must feel world-class and effortless.' },
        { title: 'Cultural Grounding', desc: 'We do not just chase algorithms; we create trends that resonate locally and globally.' },
        { title: 'Measurable Impact', desc: 'Creative excellence paired with ruthless ROI and business growth.' }
      ]
    },

    services: {
      hero: {
        title: 'Capabilities & Solutions',
        subtitle: 'Our Services',
        description: 'End-to-end creative direction, performance marketing, and digital experiences tailored for market leaders.'
      }
    },

    contact: {
      hero: {
        title: "Let's Build Something Unforgettable",
        subtitle: 'Contact Us',
        description: 'Ready to elevate your brand presence? Fill out the brief or reach out to us directly.'
      },
      info: {
        phone: '+91 74184 85333',
        email: 'info@cloutgency.com',
        location: 'Chennai, Tamil Nadu, India',
        replyTime: 'Usually reply within 4 hours'
      }
    }
  },

  // ── Services Collection ────────────────────────────────────────────────────
  services: [
    {
      id: 1,
      title: 'Branding & Identity',
      slug: 'branding',
      category: 'Creative',
      shortDesc: 'Crafting brand identities that turn casual onlookers into loyal advocates.',
      fullDesc: 'We develop brand architecture, typography, colour systems, logos, guidelines, and tone-of-voice that ensure your brand commands attention in any market.',
      image: '/images/1_2.png',
      tags: ['Brand Identity', 'Logo Design', 'Design Systems', 'Guidelines'],
      sortOrder: 1,
      isActive: true
    },
    {
      id: 2,
      title: 'Digital Marketing & Social',
      slug: 'digital-marketing',
      category: 'Marketing',
      shortDesc: 'Content strategies that dominate social feeds and build vibrant communities.',
      fullDesc: 'From viral short-form reels to omnichannel campaigns, we craft narratives that make people stop scrolling and start talking.',
      image: '/images/2_2.png',
      tags: ['Social Media', 'Community', 'Influencer Marketing', 'Viral Reels'],
      sortOrder: 2,
      isActive: true
    },
    {
      id: 3,
      title: 'Content & Video Production',
      slug: 'content-creation',
      category: 'Production',
      shortDesc: 'Studio-grade video production, 3D motion graphics, and editorial content.',
      fullDesc: 'Our in-house production team produces high-impact visuals, lifestyle photography, and commercial-grade video assets built for the modern consumer.',
      image: '/images/3_2.png',
      tags: ['Video Ads', '3D Motion', 'Photography', 'Commercials'],
      sortOrder: 3,
      isActive: true
    },
    {
      id: 4,
      title: 'Performance Marketing',
      slug: 'performance-marketing',
      category: 'Growth',
      shortDesc: 'Data-driven paid media campaigns engineered for scalable customer acquisition.',
      fullDesc: 'Laser-focused paid advertising across Meta, Google, YouTube, and programmatic channels with real-time conversion rate and ROAS optimization.',
      image: '/images/4_2.png',
      tags: ['Meta Ads', 'Google Ads', 'CAC Optimization', 'ROAS Growth'],
      sortOrder: 4,
      isActive: true
    },
    {
      id: 5,
      title: 'Web Design & Interactive Experiences',
      slug: 'web-design',
      category: 'Technology',
      shortDesc: 'Cutting-edge digital web applications with fluid micro-interactions and high conversion.',
      fullDesc: 'Bespoke web applications built for speed, cinematic animations, SEO authority, and responsive performance across all viewports.',
      image: '/images/5_1.png',
      tags: ['Custom Web Apps', 'Webflow', 'UI/UX Design', 'Full Stack Development'],
      sortOrder: 5,
      isActive: true
    }
  ],

  // ── Works / Portfolio Collection ───────────────────────────────────────────
  works: [
    {
      id: 1,
      client: 'Super Chennai',
      title: 'Grew SuperChennai hit 1.2M followers',
      highlightText: '1.2M',
      category: 'lifestyle',
      tags: ['Social Media', 'E-commerce'],
      shortDesc: 'Built a city-scale community from the ground up - across Instagram, YouTube, and beyond.',
      image: '/images/4.webp',
      videoUrl: '/videos/superchennai_website_2_mp4.mp4',
      link: 'case-study/super-chennai.html',
      sortOrder: 1,
      showOnHome: true,
      isActive: true
    },
    {
      id: 2,
      client: 'Dr.B',
      title: 'Grew Dr B to 60K Followers',
      highlightText: '60K',
      category: 'HPC',
      tags: ['Web', 'Videography', 'Healthcare'],
      shortDesc: 'Built a strong Instagram presence from zero through consistent content and community growth.',
      image: '/images/6_2.png',
      videoUrl: '/videos/dr.b-website_combine_loop_mp4.mp4',
      link: 'case-study/dr-b.html',
      sortOrder: 2,
      showOnHome: true,
      isActive: true
    },
    {
      id: 3,
      client: 'DRA',
      title: 'Scaled DRA 7x Across Social Platforms',
      highlightText: '7x',
      category: 'real-estate',
      tags: ['Social Media', 'Real Estate'],
      shortDesc: 'Grew Instagram from 7K to 50K and YouTube from 2K to 20K through strategic content.',
      image: '/images/dra-p-1080.png',
      videoUrl: '/videos/DRA-websites_3-1_mp4.mp4',
      link: 'case-study/dra.html',
      sortOrder: 3,
      showOnHome: true,
      isActive: true
    },
    {
      id: 4,
      client: 'NATURALS',
      title: 'Brought Naturals Customer First Campaigns to Life Offline',
      highlightText: 'First Campaigns',
      category: 'lifestyle',
      tags: ['Social Media', 'Beauty & Personal Care'],
      shortDesc: 'Executed campaign concepts, ad film shoots, and model shoots to strengthen brand visibility.',
      image: '/images/9.webp',
      videoUrl: '/videos/naturals_1-1_mp4.mp4',
      link: 'case-study/naturals.html',
      sortOrder: 4,
      showOnHome: true,
      isActive: true
    },
    {
      id: 5,
      client: 'Soft Serve',
      title: 'Transformed Soft Serve Into a Local Buzz',
      highlightText: 'Local Buzz',
      category: 'restaurant',
      tags: ['Social Media', 'Packaging', 'Restaurant'],
      shortDesc: 'Delivered 360° branding, footfall-driven campaigns, and viral social content.',
      image: '/images/16.webp',
      videoUrl: '/videos/softserve-website-1_mp4.mp4',
      link: 'case-study/soft-serve.html',
      sortOrder: 5,
      featured: false,
      showOnHome: true,
      isActive: true
    },
    {
      id: 6,
      client: 'kkix',
      title: 'Built KKIX Customs From Idea To Cult Brand',
      highlightText: 'Cult Brand',
      category: 'lifestyle',
      tags: ['Full Product Design', 'E-commerce'],
      shortDesc: 'Designed The Products, Crafted The Identity, And Grew A 10K-Strong Community Loved By Celebrities And Enthusiasts.',
      image: '/images/2.webp',
      videoUrl: '/videos/KKIX_Customs_1_hqjhgc-1_mp4.mp4',
      link: 'case-study/kkix.html',
      sortOrder: 6,
      showOnHome: false,
      isActive: true
    },
    {
      id: 7,
      client: 'Cha Wellness',
      title: 'Scaled CHA Wellness Sales 4x',
      highlightText: '4x',
      category: 'fnb',
      tags: ['Full Product Design', 'E-commerce'],
      shortDesc: 'Built the brand from scratch with 360° marketing, branding, and a conversion-focused website.',
      image: '/images/1.webp',
      videoUrl: '',
      link: 'case-study/cha-wellness.html',
      sortOrder: 7,
      showOnHome: false,
      isActive: true
    },
    {
      id: 8,
      client: 'Everealth',
      title: 'Launched Everealth With A Strong Foundation',
      highlightText: 'Strong Foundation',
      category: 'HPC',
      tags: ['Full Product Design', 'E-commerce'],
      shortDesc: 'Crafted The Brand Identity, Packaging, And Website To Give The Brand A Head Start From Day One.',
      image: '/images/5.webp',
      videoUrl: '/videos/Everealth-motion_mp4.mp4',
      link: 'case-study/everealth.html',
      sortOrder: 8,
      showOnHome: true,
      isActive: true
    },
    {
      id: 9,
      client: 'Chaitanya',
      title: 'Grew Chaitanya From 800 To 6K',
      highlightText: '6K',
      category: 'real-estate',
      tags: ['Social Media', 'E-commerce'],
      shortDesc: "Scaled The Brand's Social Presence Nearly 8x In Just Three Months Through Focused Content Strategy",
      image: '/images/3.webp',
      videoUrl: '',
      link: '#',
      sortOrder: 9,
      showOnHome: false,
      isActive: true
    },
    {
      id: 10,
      client: 'BBCL Homes',
      title: "Reduced BBCL's Cost Per Lead By 35%",
      highlightText: '35%',
      category: 'real-estate',
      tags: ['Social Media', 'Marketing', 'Real Estate'],
      shortDesc: 'Optimized The Digital Funnel Through Performance Marketing, Content, And Web Experience To Improve Lead Acquisition Efficiency.',
      image: '/images/8.webp',
      videoUrl: '',
      link: '#',
      sortOrder: 10,
      showOnHome: false,
      isActive: true
    },
    {
      id: 11,
      client: 'Decorgeous',
      title: 'Grew Decorgeous from 72 to 19K Followers',
      highlightText: '19K',
      category: 'fnb',
      tags: ['Web', 'Luxury Furniture'],
      shortDesc: 'Expanded social presence rapidly with content-driven growth over a three-month period.',
      image: '/images/13.webp',
      videoUrl: '',
      link: 'case-study/decorgeous.html',
      sortOrder: 11,
      showOnHome: false,
      isActive: true
    },
    {
      id: 12,
      client: 'Aave Derm',
      title: 'Built Aave Derm from Brand to Shelf',
      highlightText: 'Brand to Shelf',
      category: 'lifestyle',
      tags: ['Social Media', 'Branding'],
      shortDesc: 'Developed branding, product packaging, and social presence to establish a strong launch identity.',
      image: '/images/Aavederm-thumb.png',
      videoUrl: '',
      link: '#',
      sortOrder: 12,
      showOnHome: false,
      isActive: true
    },
    {
      id: 13,
      client: 'Reboot',
      title: 'Introduced Reboot Podcasts to 10K Organic Followers',
      highlightText: '10K',
      category: 'HPC',
      tags: ['Social Media', 'Healthcare'],
      shortDesc: 'Grew a new Instagram account from zero with Health-centric content and community building organically.',
      image: '/images/10.webp',
      videoUrl: '',
      link: '#',
      sortOrder: 13,
      showOnHome: false,
      isActive: true
    },
    {
      id: 14,
      client: 'K Resorts',
      title: 'Boosted K-Resort Bookings by 22%',
      highlightText: '22%',
      category: 'lifestyle',
      tags: ['Web', 'Videography', 'Hospitality'],
      shortDesc: 'Delivered 360° social marketing, website optimization, and high-ranking SEO campaigns.',
      image: '/images/7.webp',
      videoUrl: '',
      link: '#',
      sortOrder: 14,
      showOnHome: false,
      isActive: true
    },
    {
      id: 15,
      client: 'Magic Box',
      title: 'Built Experiences That Extended Beyond The Product',
      highlightText: 'Extended Beyond',
      category: 'fnb',
      tags: ['Social Media', 'Gifting'],
      shortDesc: 'Delivered 360° social marketing, website optimization, and high-ranking SEO campaigns.',
      image: '/images/14.webp',
      videoUrl: '',
      link: '#',
      sortOrder: 15,
      showOnHome: false,
      isActive: true
    },
    {
      id: 16,
      client: 'Sui Circle',
      title: 'Redefined SUI Circle with 360° Branding',
      highlightText: '360°',
      category: 'lifestyle',
      tags: ['Social Media', 'Lifestyle'],
      shortDesc: 'Refreshed the brand identity and social presence to create a stronger market perception.',
      image: '/images/18.webp',
      videoUrl: '',
      link: '#',
      sortOrder: 16,
      isActive: true
    }
  ],

  // ── Case Studies Collection ────────────────────────────────────────────────
  caseStudies: [
    {
      id: 1,
      title: 'Scaling D2C Wellness with Cultural Branding',
      slug: 'cha-wellness',
      client: 'Cha Wellness',
      category: 'Branding & Social',
      summary: 'How we revitalized an organic matcha brand to capture Gen Z beverage enthusiasts in metropolitan hubs.',
      coverImage: '/images/Cha_3.png',
      metrics: { reach: '+340%', engagement: '6.8%', roas: '4.2x' },
      content: 'Detailed breakdown of the strategy, production, and rollout of the Cha Wellness visual refresh.',
      isPublished: true
    },
    {
      id: 2,
      title: 'Modernizing Premium Real Estate Campaigns',
      slug: 'bbcl-homes',
      client: 'BBCL Homes',
      category: 'Performance & Web',
      summary: 'Generating over 1,200 high-intent homeowner leads in 90 days through cinematic interactive landing pages.',
      coverImage: '/images/BBCL_2.png',
      metrics: { leads: '1,200+', cacReduction: '-32%', salesValue: '₹48 Cr' },
      content: 'A comprehensive study on performance marketing architecture for premium gated villa projects.',
      isPublished: true
    },
    {
      id: 3,
      title: 'Redefining Medical Aesthetics in South India',
      slug: 'dr-b-clinic',
      client: 'Dr. B Clinic',
      category: 'Rebranding & Video',
      summary: 'De-stigmatizing aesthetic treatments with sleek educational storytelling and doctor-led reels.',
      coverImage: '/images/Dr-B_1.png',
      metrics: { followers: '+85K', bookingRate: '+190%', viewCount: '4.5M' },
      content: 'How transparent video production and minimalist identity boosted patient trust and clinic appointments.',
      isPublished: true
    }
  ],

  // ── Blogs Collection ───────────────────────────────────────────────────────
  blogs: [
    {
      id: 1,
      title: 'Rajparis × Cloutgency: Building a Real Estate Brand That Speaks to Chennai With Confidence',
      slug: 'rajparis-x-cloutgency',
      author: 'Cloutgency',
      readTime: '2 min read',
      publishedAt: '2026-09-08',
      excerpt: 'There is a version of a real estate brand that builds excellent properties and lets the work speak for itself.And then there is the version that builds excellent properties and makes sure the right people hear about it, in the right way, in every room that matters.',
      coverImage: '/images/main-slide-16.9.jpg',
      tags: ['Marketing', 'Performance'],
      content: '',
      isPublished: true
    },
    {
      id: 2,
      title: 'Super Chennai × Cloutgency: How We Turned a Cultural Festival Into a City Wide Movement',
      slug: 'super-chennai-x-cloutgency',
      author: 'Cloutgency',
      readTime: '2 min read',
      publishedAt: '2026-08-12',
      excerpt: 'Some clients have a budget. Some have a mission.When Cloutgency first sat down with SuperChennai, there were zero followers and one big idea - that Chennai deserved its own voice on the internet. A year later, 1.2 million people agreed.',
      coverImage: '/images/kow-sheek.png',
      tags: ['Lifestyle', 'Case study'],
      content: '',
      isPublished: true
    },
    {
      id: 3,
      title: 'DR. B × Cloutgency: How 2 Years of Trust Built Chennai\'s Most Recognised Skin Brand',
      slug: 'drb-x-cloutgency',
      author: 'Cloutgency',
      readTime: '3 min read',
      publishedAt: '2026-07-24',
      excerpt: 'Some partnerships are projects.Some are something else entirely.When Cloutgency first sat down with Dr. Bhairavi Senthil, the dermatologist, the expert, the face and force behind what would become one of Chennai\'s most.............',
      coverImage: '/images/Dr.-B---Blog---hero-image---web.jpg.jpeg',
      tags: ['Healthcare', 'Case study'],
      content: '',
      isPublished: true
    },
    {
      id: 4,
      title: 'The Psychology of Colour in Branding: Why Your Brand Colour Is Either Making or Losing You Money?',
      slug: 'psychology-of-colour-in-branding',
      author: 'Cloutgency',
      readTime: '3 min read',
      publishedAt: '2026-07-10',
      excerpt: 'Colour psychology drives every buying decision. Discover what your brand colour says and how to fix it. By Cloutgency, Chennai\'s branding agency.',
      coverImage: '/images/Hero_1.jpg',
      tags: ['Branding', 'Psychology'],
      content: '',
      isPublished: true
    },
    {
      id: 5,
      title: 'Branding vs Digital Marketing: Which One Actually Grows Your Business?',
      slug: 'branding-vs-digital-marketing',
      author: 'Cloutgency',
      readTime: '2 min read',
      publishedAt: '2026-06-10',
      excerpt: 'Branding vs digital marketing is not a choice,it is a sequence. Branding before marketing is the correct order because branding defines who you are, what you stand for, and why anyone should care. Digital marketing then amplifies that message to the right audience.',
      coverImage: '/images/Hero.jpg',
      tags: ['Branding', 'Marketing'],
      content: '',
      isPublished: true
    },
    {
      id: 6,
      title: 'How to Choose the Right Creative Agency for Your Brand Strategy',
      slug: 'how-to-choose-a-creative-agency-for-brand-strategy',
      author: 'Cloutgency',
      readTime: '2 min read',
      publishedAt: '2026-05-10',
      excerpt: 'The right agency asks sharp questions before presenting solutions, has proven experience in your industry, and offers strategic thinking alongside creative execution.',
      coverImage: '/images/1_12.png',
      tags: ['Strategy', 'Branding'],
      content: '',
      isPublished: true
    }
  ],

  // ── Team Members Collection ────────────────────────────────────────────────
  team: [
    {
      id: 1,
      name: 'Naresh',
      role: 'Creative Director & Founder',
      bio: 'Visionary brand architect leading creative direction, digital narrative, and tech-driven campaigns.',
      image: '/images/Flower.svg',
      linkedinUrl: 'https://www.linkedin.com/company/cloutgency/',
      sortOrder: 1,
      isActive: true
    },
    {
      id: 2,
      name: 'Arun',
      role: 'Lead Performance Strategist',
      bio: 'Data scientist turned growth marketer specializing in high-ROAS ad campaigns and conversion optimization.',
      image: '/images/Flower.svg',
      linkedinUrl: 'https://www.linkedin.com/company/cloutgency/',
      sortOrder: 2,
      isActive: true
    },
    {
      id: 3,
      name: 'Priya',
      role: 'Head of Visual Identity',
      bio: 'Crafting luxury design systems, bespoke typography, and unforgettable art direction.',
      image: '/images/Flower.svg',
      linkedinUrl: 'https://www.linkedin.com/company/cloutgency/',
      sortOrder: 3,
      isActive: true
    }
  ],

  // Customer Stories videos (Content Collections → Testimonials). page = 'home' or 'about'
  testimonials: [
    {
      "id": 1,
      "page": "home",
      "name": "Ranjeeth Rathod",
      "role": "MD - DRA Homes, Superchennai",
      "text": "Cloutgency understands what Gen-Z & Gen Alpha audience want, they bring fresh and vibrant ideas to life.",
      "video": "/videos/testimonials/optimized/dra-ranjeeth-coloured-1.web.mp4",
      "poster": "/videos/testimonials/dra-ranjeeth-coloured-1.jpg",
      "sortOrder": 1,
      "isActive": true
    },
    {
      "id": 2,
      "page": "home",
      "name": "Dr. Bhairavi Senthil",
      "role": "Founder - DR.B 360 DERMATOLOGY EXPERIENTIAL CENTER",
      "text": "Cloutgency delivered exactly what I envisioned for my clinic - creative, sharp, receptive. Two years in, and I've found family in this team",
      "video": "/videos/testimonials/optimized/dr-b-testimonial.web.mp4",
      "poster": "/videos/testimonials/dr-b-testimonial.jpg",
      "sortOrder": 2,
      "isActive": true
    },
    {
      "id": 3,
      "page": "home",
      "name": "Anush Rajasekaran",
      "role": "Co-Founder - Soft Serve.co",
      "text": "Cloutgency is doing a phenomenal job in the marketing game, their team of fresh & talented minds are easy to work with.",
      "video": "/videos/testimonials/optimized/soft-serve-testimony.web.mp4",
      "poster": "/videos/testimonials/soft-serve-testimony.jpg",
      "sortOrder": 3,
      "isActive": true
    },
    {
      "id": 4,
      "page": "home",
      "name": "Rajparis",
      "role": "Client testimonial",
      "text": "",
      "video": "/videos/testimonials/optimized/rajparis-testimonial-updated-version.web.mp4",
      "poster": "/videos/testimonials/rajparis-testimonial-updated-version.jpg",
      "sortOrder": 4,
      "isActive": true
    },
    {
      "id": 5,
      "page": "home",
      "name": "Murali",
      "role": "Client testimonial",
      "text": "",
      "video": "/videos/testimonials/optimized/murali-testimonial-final.web.mp4",
      "poster": "/videos/testimonials/murali-testimonial-final.jpg",
      "sortOrder": 5,
      "isActive": true
    },
    {
      "id": 6,
      "page": "home",
      "name": "Anantha",
      "role": "Client testimonial",
      "text": "",
      "video": "/videos/testimonials/optimized/anantha-testimonial.web.mp4",
      "poster": "/videos/testimonials/anantha-testimonial.jpg",
      "sortOrder": 6,
      "isActive": true
    },
    {
      "id": 7,
      "page": "home",
      "name": "Manoj Vasudevan",
      "role": "Head of Sales & Marketing - DRA Homes",
      "text": "Clout team made an exceptional job in scaling our social media presence in a very short time, it's been a fun & exciting journey with them.",
      "video": "/videos/testimonials/optimized/dra-x-cloutgency-v1.web.mp4",
      "poster": "/videos/testimonials/dra-x-cloutgency-v1.jpg",
      "sortOrder": 7,
      "isActive": true
    },
    {
      "id": 8,
      "page": "about",
      "name": "Ranjith Rathod",
      "role": "MD - DRA Homes, Superchennai",
      "text": "Cloutgency understands what Gen-Z & Gen Alpha audience want, they bring fresh and vibrant ideas to life.",
      "video": "https://res.cloudinary.com/dlbbpz98x/video/upload/v1792994877/DRA_Ranjeeth_coloured_1.mp4_krk5hn.mp4",
      "poster": "",
      "sortOrder": 1,
      "isActive": true
    },
    {
      "id": 9,
      "page": "about",
      "name": "Dr. Bhairavi Senthil",
      "role": "Founder - DR.B 360 DERMATOLOGY EXPERIENTIAL CENTER",
      "text": "Cloutgency delivered exactly what I envisioned for my clinic - creative, sharp, receptive. Two years in, and I've found family in this team",
      "video": "https://res.cloudinary.com/dlbbpz98x/video/upload/v1792992781/Dr.B_tesitimonial_i5ds8e.mp4",
      "poster": "",
      "sortOrder": 2,
      "isActive": true
    },
    {
      "id": 10,
      "page": "about",
      "name": "Anush Rajasekaran",
      "role": "Co-Founder - Soft Serve.co",
      "text": "Cloutgency is doing a phenomenal job in the marketing game, their team of fresh & talented minds are easy to work with.",
      "video": "https://res.cloudinary.com/dlbbpz98x/video/upload/v1791349109/Soft_Serve_Testimony_jjpitp.mp4",
      "poster": "",
      "sortOrder": 3,
      "isActive": true
    },
    {
      "id": 11,
      "page": "about",
      "name": "Manoj Vasudevan",
      "role": "Head of Sales & Marketing - DRA Homes",
      "text": "Clout team made an exceptional job in scaling our social media presence in a very short time, it's been a fun & exciting journey with them.",
      "video": "https://res.cloudinary.com/dlbbpz98x/video/upload/v1791349132/dra_x_cloutgency_v1_jlmlsp.mp4",
      "poster": "",
      "sortOrder": 4,
      "isActive": true
    }
  ]
};

module.exports = defaultSeed;
