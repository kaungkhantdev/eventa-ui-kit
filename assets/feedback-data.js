/* ============================================================
   Eventa · Feedback data (shared by feedback.html + feedback-detail.html)
   Feedback is organised per EVENT → each event has surveys + responses.
   Numbers are mock data for the UI kit; totals are kept internally consistent:
   event.responses === sum of its surveys' responses === sum of dist[], and each
   dist[] is shaped so its weighted mean rounds to the event's stated avg.
   ============================================================ */
window.FEEDBACK = {
  events: [
    {
      slug: 'tech-summit-2026',
      name: 'Tech Summit 2026',
      date: 'Jul 16–19, 2026',
      status: 'Live',
      responses: 568,
      avg: 4.6,
      nps: 62,
      completion: 84,
      dist: [400, 120, 35, 10, 3],          // 5★ … 1★ (weighted mean ≈ avg 4.6)
      surveys: [
        { title: 'Post-event Experience', responses: 412, avg: 4.7, status: 'Live',
          questions: [
            { q: 'How would you rate the event overall?', type: 'Rating' },
            { q: 'What did you enjoy most?', type: 'Text' },
            { q: 'How did you hear about this event?', type: 'Multiple choice' },
          ] },
        { title: 'Speaker Feedback', responses: 156, avg: 4.4, status: 'Live',
          questions: [
            { q: 'Rate the overall speaker quality', type: 'Rating' },
            { q: 'Which talk stood out to you?', type: 'Text' },
            { q: 'Was the session length right?', type: 'Multiple choice' },
          ] },
      ],
      recent: [
        { who: 'Anong P.', initials: 'AP', survey: 'Post-event Experience', rating: 5, text: 'The speaker lineup was incredible, worth every baht!', date: 'Jul 18, 2026' },
        { who: 'James W.', initials: 'JW', survey: 'Post-event Experience', rating: 3, text: 'Good content overall but the BITEC wifi kept dropping during the workshops.', date: 'Jul 18, 2026' },
        { who: 'Kanya R.', initials: 'KR', survey: 'Speaker Feedback', rating: 5, text: 'The AI keynote alone was worth the ticket. More of that please.', date: 'Jul 17, 2026' },
      ],
    },
    {
      slug: 'bangkok-jazz-night',
      name: 'Bangkok Jazz Night',
      date: 'Jun 28, 2026',
      status: 'Closed',
      responses: 268,
      avg: 4.8,
      nps: 71,
      completion: 88,
      dist: [225, 33, 7, 2, 1],             // weighted mean ≈ avg 4.8
      surveys: [
        { title: 'Jazz Night Vibes', responses: 268, avg: 4.8, status: 'Closed',
          questions: [
            { q: 'How would you rate the night overall?', type: 'Rating' },
            { q: 'What was your favourite set?', type: 'Text' },
            { q: 'Would you come to the next one?', type: 'Multiple choice' },
          ] },
      ],
      recent: [
        { who: 'Somchai T.', initials: 'ST', survey: 'Jazz Night Vibes', rating: 4, text: 'Great atmosphere, though the queue for drinks got long by the second set.', date: 'Jun 29, 2026' },
        { who: 'Rachel D.', initials: 'RD', survey: 'Jazz Night Vibes', rating: 5, text: 'Magical evening — the rooftop venue was the perfect setting.', date: 'Jun 29, 2026' },
      ],
    },
    {
      slug: 'sunrise-yoga-retreat',
      name: 'Sunrise Yoga Retreat',
      date: 'Jul 20, 2026',
      status: 'Live',
      responses: 195,
      avg: 4.9,
      nps: 78,
      completion: 91,
      dist: [180, 11, 3, 1, 0],             // weighted mean ≈ avg 4.9
      surveys: [
        { title: 'Retreat Wellness Check', responses: 195, avg: 4.9, status: 'Live',
          questions: [
            { q: 'How would you rate the retreat overall?', type: 'Rating' },
            { q: 'Which session helped you most?', type: 'Text' },
            { q: 'How likely are you to book again?', type: 'Multiple choice' },
          ] },
      ],
      recent: [
        { who: 'Ploy S.', initials: 'PS', survey: 'Retreat Wellness Check', rating: 5, text: "Best retreat I've been to in Bangkok — loved the sunrise session by Lumphini Park.", date: 'Jul 20, 2026' },
      ],
    },
    {
      slug: 'ux-bangkok-meetup',
      name: 'UX Bangkok Meetup',
      date: 'Jul 9, 2026',
      status: 'Closed',
      responses: 173,
      avg: 4.6,
      nps: 58,
      completion: 80,
      dist: [122, 40, 8, 2, 1],             // weighted mean ≈ avg 4.6
      surveys: [
        { title: 'Meetup Experience', responses: 173, avg: 4.6, status: 'Closed',
          questions: [
            { q: 'How would you rate the meetup overall?', type: 'Rating' },
            { q: 'What topic should we cover next?', type: 'Text' },
            { q: 'How did you hear about this meetup?', type: 'Multiple choice' },
          ] },
      ],
      recent: [
        { who: 'Mei L.', initials: 'ML', survey: 'Meetup Experience', rating: 5, text: 'Super friendly community — learned a ton from the panel discussion.', date: 'Jul 9, 2026' },
      ],
    },
    {
      slug: 'thai-street-food-festival',
      name: 'Thai Street Food Festival',
      date: 'Aug 2, 2026',
      status: 'Draft',
      responses: 0,
      avg: null,
      nps: null,
      completion: null,
      dist: [0, 0, 0, 0, 0],
      surveys: [
        { title: 'Food Festival Pulse', responses: 0, avg: null, status: 'Draft',
          questions: [
            { q: 'How would you rate the festival overall?', type: 'Rating' },
            { q: 'Which stall was your favourite?', type: 'Text' },
            { q: 'Would you recommend it to a friend?', type: 'Multiple choice' },
          ] },
      ],
      recent: [],
    },
  ],

  /* ---- helpers ---- */
  get: function (slug) { return this.events.find(function (e) { return e.slug === slug; }) || null; },
  portfolio: function () {
    var live = this.events;
    var responses = live.reduce(function (s, e) { return s + e.responses; }, 0);
    var rated = live.filter(function (e) { return e.avg != null && e.responses; });
    var avg = rated.length
      ? rated.reduce(function (s, e) { return s + e.avg * e.responses; }, 0) / rated.reduce(function (s, e) { return s + e.responses; }, 0)
      : 0;
    var surveys = live.reduce(function (s, e) { return s + e.surveys.length; }, 0);
    var dist = [0, 0, 0, 0, 0];
    live.forEach(function (e) { e.dist.forEach(function (c, i) { dist[i] += c; }); });
    return { responses: responses, avg: avg, surveys: surveys, events: live.length, dist: dist };
  },
};
