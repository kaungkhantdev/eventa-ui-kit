/* ============================================================
   Eventa — shared event data for the landing-page templates.
   window.EVENTA_getEvent() returns the event to render:
     • reads ?event=<slug> to pick one of the sample events
     • lets query params override text fields, so the create-event
       form can pass live-typed content straight into a preview
       (e.g. landing/aurora.html?event=tech-summit-2026&title=My%20Event)
   Every template renders the SAME object, so the text is dynamic.
   ============================================================ */
(function () {
  const EVENTS = {
    'tech-summit-2026': {
      slug: 'tech-summit-2026',
      title: 'Tech Summit 2026',
      kicker: 'The future, built in Bangkok',
      tagline: 'Two days of keynotes, workshops and deep networking with the people shaping Southeast Asia’s tech.',
      category: 'Conference',
      dateText: 'Sat–Sun, July 18–19, 2026',
      timeText: '09:00 – 18:00 · GMT+7',
      venue: 'BITEC',
      city: 'Bangkok, Thailand',
      address: '88 Bangna-Trad Rd, Bang Na, Bangkok',
      priceFrom: '฿1,250',
      seatsLeft: 88,
      capacity: 400,
      attendeesText: '1,500+ attendees',
      accent: '#1ba770',
      organizer: 'Eventa Co.',
      contactEmail: 'hello@eventa.co',
      registerUrl: '../auth/register.html',
      socials: { instagram: '#', website: '#' },
      about: 'Tech Summit 2026 brings together founders, engineers and product leaders from across Southeast Asia for two days of keynotes, hands-on workshops and a startup showcase — with plenty of Thai coffee and networking in between.',
      highlights: [
        { icon: 'mic', label: '20+ speakers' },
        { icon: 'headphones', label: 'Hands-on workshops' },
        { icon: 'sparkles', label: 'Startup showcase' },
        { icon: 'users', label: 'Networking lounge' },
      ],
      agendaTitle: 'Schedule',
      agenda: [
        { time: '09:00', title: 'Doors & coffee', desc: 'Registration, badges and morning espresso.' },
        { time: '10:00', title: 'Opening keynote', desc: 'The state of AI in Southeast Asia.' },
        { time: '13:00', title: 'Workshop tracks', desc: 'Cloud, AI and product deep-dives.' },
        { time: '16:30', title: 'Startup showcase', desc: '12 startups pitch live on the main stage.' },
        { time: '18:00', title: 'Rooftop mixer', desc: 'Drinks and networking as the sun sets.' },
      ],
      speakersTitle: 'Speakers',
      speakers: [
        { name: 'Dr. Anna Wong', role: 'Head of AI, Nimbus', initials: 'AW' },
        { name: 'Raj Patel', role: 'CTO, Fintech Labs', initials: 'RP' },
        { name: 'Mei Lin', role: 'VP Product, Skylark', initials: 'ML' },
        { name: 'Tom Becker', role: 'Founder, DevHouse', initials: 'TB' },
      ],
      ticketsTitle: 'Tickets',
      tickets: [
        { name: 'Early Bird', price: '฿1,250', note: 'Limited', featured: false, features: ['Full 2-day access', 'Workshop tracks', 'Lunch & coffee'] },
        { name: 'Standard', price: '฿1,900', note: 'Most popular', featured: true, features: ['Everything in Early Bird', 'Reserved seating', 'Rooftop mixer'] },
        { name: 'VIP', price: '฿3,500', note: 'Best value', featured: false, features: ['Everything in Standard', 'Speaker dinner', 'Front-row + swag'] },
      ],
      faqs: [
        { q: 'Where is it held?', a: 'BITEC, Bangkok — easy BTS access at Bang Na.' },
        { q: 'Can I get a refund?', a: 'Full refunds up to 14 days before the event.' },
        { q: 'Is lunch included?', a: 'Yes — lunch and all-day coffee come with every ticket.' },
      ],
    },

    'emma-liam-wedding': {
      slug: 'emma-liam-wedding',
      title: 'Emma & Liam’s Wedding',
      kicker: 'Together with their families',
      tagline: 'We’re getting married — and we’d be honoured to have you celebrate with us by the sea.',
      category: 'Wedding',
      dateText: 'Wednesday, August 20, 2026',
      timeText: '4:00 PM · Ceremony & Reception',
      venue: 'Seaside Cliffs Resort',
      city: 'Malibu, California',
      address: '27400 Pacific Coast Hwy, Malibu, CA',
      priceFrom: 'Free',
      seatsLeft: 40,
      capacity: 180,
      attendeesText: '180 guests',
      accent: '#b76e79',
      organizer: 'Emma & Liam',
      contactEmail: 'emma.liam@example.com',
      registerUrl: '../auth/register.html',
      socials: { instagram: '#', website: '#' },
      about: 'Emma and Liam met eight summers ago on a windswept pier and have been inseparable since. This August, surrounded by the people they love most, they’ll say “I do” on the cliffs above the Pacific.',
      highlights: [
        { icon: 'heart', label: 'Ceremony at 4 PM' },
        { icon: 'confetti', label: 'Cocktail hour' },
        { icon: 'music', label: 'Live band & dancing' },
        { icon: 'camera', label: 'Photo booth' },
      ],
      agendaTitle: 'Order of the day',
      agenda: [
        { time: '4:00 PM', title: 'Ceremony', desc: 'On the cliffside lawn overlooking the Pacific.' },
        { time: '5:00 PM', title: 'Cocktail hour', desc: 'Canapés and drinks on the terrace.' },
        { time: '6:30 PM', title: 'Dinner', desc: 'A seated dinner in the Grand Hall.' },
        { time: '8:00 PM', title: 'Dancing', desc: 'First dance — then the floor is yours.' },
      ],
      speakersTitle: 'The wedding party',
      speakers: [
        { name: 'Emma Hart', role: 'The Bride', initials: 'EH' },
        { name: 'Liam Cole', role: 'The Groom', initials: 'LC' },
        { name: 'Sophia Reyes', role: 'Maid of Honour', initials: 'SR' },
        { name: 'Noah Grant', role: 'Best Man', initials: 'NG' },
      ],
      ticketsTitle: 'RSVP',
      tickets: [
        { name: 'Joyfully attending', price: 'RSVP', note: '', featured: true, features: ['Ceremony', 'Cocktail hour', 'Dinner & dancing'] },
        { name: 'Ceremony only', price: 'RSVP', note: '', featured: false, features: ['Ceremony', 'Cocktail hour'] },
        { name: 'Sending love', price: '—', note: '', featured: false, features: ['Can’t make it', 'We’ll miss you'] },
      ],
      faqs: [
        { q: 'What should I wear?', a: 'Beach formal — bring a layer, it’s breezy after sunset.' },
        { q: 'Is there parking?', a: 'Valet parking is available at the resort entrance.' },
        { q: 'Can I bring a plus-one?', a: 'Plus-ones are named on your invitation and RSVP.' },
      ],
    },

    'bangkok-jazz-night': {
      slug: 'bangkok-jazz-night',
      title: 'Bangkok Jazz Night',
      kicker: 'One night. Live jazz.',
      tagline: 'An intimate evening of live jazz under the stars on the Sala Daeng rooftop.',
      category: 'Concert',
      dateText: 'Sunday, July 12, 2026',
      timeText: '7:30 PM – 11:00 PM',
      venue: 'Sala Daeng Rooftop',
      city: 'Bangkok, Thailand',
      address: 'Sala Daeng, Silom, Bangkok',
      priceFrom: '฿480',
      seatsLeft: 36,
      capacity: 240,
      attendeesText: '240 seats',
      accent: '#6d5cf5',
      organizer: 'Eventa Live',
      contactEmail: 'live@eventa.co',
      registerUrl: '../auth/register.html',
      socials: { instagram: '#', website: '#' },
      about: 'A curated evening of live jazz on an open-air rooftop — five acts, craft cocktails and skyline views, closing out with a late-night vinyl afterparty.',
      highlights: [
        { icon: 'music', label: '5 live acts' },
        { icon: 'headphones', label: 'Vinyl afterparty' },
        { icon: 'star', label: 'Rooftop views' },
        { icon: 'star2', label: 'Craft cocktails' },
      ],
      agendaTitle: 'Set times',
      agenda: [
        { time: '7:30 PM', title: 'Doors open', desc: 'A welcome drink on arrival.' },
        { time: '8:00 PM', title: 'Opening set', desc: 'The Nomad Quartet.' },
        { time: '9:15 PM', title: 'Headline', desc: 'Mala Reef, live.' },
        { time: '10:30 PM', title: 'Vinyl afterparty', desc: 'DJ sets till late.' },
      ],
      speakersTitle: 'Line-up',
      speakers: [
        { name: 'Mala Reef', role: 'Headline', initials: 'MR' },
        { name: 'The Nomad Quartet', role: 'Opening', initials: 'NQ' },
        { name: 'DJ Sunset', role: 'Afterparty', initials: 'DS' },
      ],
      ticketsTitle: 'Tickets',
      tickets: [
        { name: 'General', price: '฿480', note: '', featured: false, features: ['Standing area', 'Welcome drink'] },
        { name: 'Reserved', price: '฿890', note: 'Popular', featured: true, features: ['Reserved table', 'Welcome drink', 'Priority entry'] },
        { name: 'VIP Booth', price: '฿1,800', note: '', featured: false, features: ['Private booth', 'Bottle service', 'Meet the band'] },
      ],
      faqs: [
        { q: 'Is it seated?', a: 'Reserved and VIP are seated; General is standing.' },
        { q: 'Age limit?', a: '20+ with valid ID.' },
        { q: 'What if it rains?', a: 'The rooftop is covered — the show goes on.' },
      ],
    },
  };

  const OVERRIDABLE = ['title', 'kicker', 'tagline', 'category', 'dateText', 'timeText', 'venue', 'city', 'address', 'priceFrom', 'accent', 'organizer'];

  function getEvent() {
    const q = new URLSearchParams(location.search);
    const slug = q.get('event');
    const src = EVENTS[slug] || Object.values(EVENTS)[0];
    const ev = JSON.parse(JSON.stringify(src));
    OVERRIDABLE.forEach(k => { const v = q.get(k); if (v != null && v !== '') ev[k] = v; });
    return ev;
  }

  window.EVENTA_EVENTS = EVENTS;
  window.EVENTA_getEvent = getEvent;
})();
