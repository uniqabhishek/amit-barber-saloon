// Customer Reviews and Ratings System for Barber Salon Shop
const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    author: "Amit",
    role: "Regular Gentleman Client",
    rating: 5,
    date: "Yesterday",
    service: "Keratin Treatment & Beard Smoothening",
    comment: "Outstanding experience! The keratin treatment completely transformed my hair—it's super soft, smooth and manageable now. Amit's beard smoothing technique with hot towels is top-notch. Highly recommended to everyone!",
    verified: true
  },
  {
    id: "rev-2",
    author: "Vikram Sharma",
    role: "Local Resident",
    rating: 5,
    date: "3 days ago",
    service: "Skin Fade & Razor Shave",
    comment: "The vintage barbershop vibe is authentic and relaxing. Great hygiene, sharp razor lines, and they strictly honor the booked appointment time without unnecessary waiting.",
    verified: true
  },
  {
    id: "rev-3",
    author: "Rahul Verma",
    role: "Corporate Executive",
    rating: 5,
    date: "1 week ago",
    service: "The Amit Master Combo Package",
    comment: "Booked online via PhonePe. Got my appointment confirmation time immediately. The head massage relieved all my work stress. Best salon in town!",
    verified: true
  },
  {
    id: "rev-4",
    author: "Deepak Saini",
    role: "Grooming Enthusiast",
    rating: 4.8,
    date: "2 weeks ago",
    service: "Beard Shaping & D-Tan Facial",
    comment: "Loved the Ayurvedic D-Tan facial and beard oil smoothing. Very professional staff and reasonable prices. Will visit again next Sunday.",
    verified: true
  }
];

class ReviewManager {
  constructor() {
    this.storageKey = "amit_saloon_reviews_v1";
    this.reviews = this.loadReviews();
  }

  loadReviews() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    return [...INITIAL_REVIEWS];
  }

  saveReviews() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reviews));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  getStats() {
    if (this.reviews.length === 0) return { average: 5.0, count: 0, stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = (total / this.reviews.length).toFixed(1);
    const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.reviews.forEach(r => {
      const rounded = Math.round(r.rating);
      if (stars[rounded] !== undefined) stars[rounded]++;
    });
    return {
      average: parseFloat(avg),
      count: this.reviews.length,
      stars
    };
  }

  addReview(author, rating, service, comment) {
    const newRev = {
      id: "rev-" + Date.now(),
      author: author || "Amit",
      role: "Verified Customer",
      rating: Number(rating) || 5,
      date: "Just now",
      service: service || "Hair Cut & Styling",
      comment: comment || "Great service and great atmosphere!",
      verified: true
    };
    this.reviews.unshift(newRev);
    this.saveReviews();
    return newRev;
  }
}

const reviewManager = new ReviewManager();
