// Upgraded Application Controller for Barber Salon Shop
// Featuring:
// 1. Overlap Prevention & Free Timing vs Booked Slot Manager
// 2. Custom Haircut & Pricing Customization
// 3. Exact UPI ID: amitkumargazipuria@oksbi & Real QR Code
// 4. Clean, Simple, Easy-to-Explore Filter Tabs & Live Search

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

let bookingState = {
  selectedServices: [],
  selectedStylist: "Amit (Master Barber & Stylist)",
  selectedDate: getFormattedDate(0),
  selectedTime: "04:30 PM",
  customerName: "Amit",
  customerPhone: "8930440260",
  customerEmail: "amitkumargazipuria@oksbi",
  customerNotes: "",
  paymentMethod: "offline_cash",
  totalAmount: 0,
  totalDurationMin: 0,
  currentCategoryFilter: "ALL",
  searchQuery: "",
  showOnlyFreeSlots: false
};

// All Salon Time Slots (Every 30 mins from 9:00 AM to 9:00 PM)
const ALL_DAY_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM"
];

function initApp() {
  seedSampleBookingsIfEmpty();
  renderDateSelector();
  renderServices();
  renderTimeSlots();
  renderReviewsList();
  renderRatingStats();
  updateBookingSummary();
  setupEventListeners();
  loadBookingsBadge();
}

// ----------------------------------------------------
// SEED REALISTIC INITIAL BOOKINGS TO SHOW OVERLAP PROTECTION
// ----------------------------------------------------
function seedSampleBookingsIfEmpty() {
  try {
    const existing = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
    if (existing.length === 0) {
      const today = getFormattedDate(0);
      const samples = [
        {
          bookingId: "AMIT-INIT-101",
          customerName: "Rahul Sharma",
          customerPhone: "9876543210",
          stylist: "Amit (Master Barber & Stylist)",
          date: today,
          time: "11:00 AM",
          durationMin: 60,
          services: [{ name: "Skin Fade", price: 150 }, { name: "Beard Smoothening", price: 150 }],
          totalAmount: 300,
          paymentMethod: "Online (GPay)",
          paymentStatus: "PAID_SUCCESS"
        },
        {
          bookingId: "AMIT-INIT-102",
          customerName: "Vikram Malhotra",
          customerPhone: "9123456780",
          stylist: "Amit (Master Barber & Stylist)",
          date: today,
          time: "02:00 PM",
          durationMin: 60,
          services: [{ name: "Keratin Smoothening", price: 999 }],
          totalAmount: 999,
          paymentMethod: "Pay at Salon",
          paymentStatus: "PENDING_CASH"
        }
      ];
      localStorage.setItem("amit_saloon_bookings", JSON.stringify(samples));
    }
  } catch (e) {
    console.error(e);
  }
}

// ----------------------------------------------------
// DATE HELPERS
// ----------------------------------------------------
function getFormattedDate(dayOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayName = dayOffset === 0 ? "Today" : dayOffset === 1 ? "Tomorrow" : days[d.getDay()];
  return `${dayName}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function renderDateSelector() {
  const dateContainer = document.getElementById("date-slots-container");
  if (!dateContainer) return;

  dateContainer.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const dateStr = getFormattedDate(i);
    const isSelected = dateStr === bookingState.selectedDate;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `date-btn px-4 py-3 rounded-xl text-xs font-semibold border transition-all text-center flex-1 min-w-[105px] ${
      isSelected 
        ? "bg-amber-600 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-600/30 scale-105" 
        : "bg-[#18110e] text-amber-100 border-[#422d21] hover:border-amber-500/50"
    }`;
    btn.innerHTML = `<span class="block text-sm font-bold">${dateStr.split(",")[0]}</span><span class="text-[11px] opacity-80">${dateStr.split(",")[1]}</span>`;
    btn.onclick = () => {
      bookingState.selectedDate = dateStr;
      renderDateSelector();
      renderTimeSlots();
      updateAppointmentPreview();
    };
    dateContainer.appendChild(btn);
  }
}

// ----------------------------------------------------
// OVERLAPPING TIME & FREE TIMING SLOT MANAGER
// ----------------------------------------------------
function convertTimeToMinutes(timeStr) {
  // e.g. "04:30 PM" -> 16 * 60 + 30 = 990
  const [timePart, modifier] = timeStr.trim().split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getExistingBookingsForDate(dateStr) {
  try {
    const list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
    return list.filter(b => b.date === dateStr);
  } catch (e) {
    return [];
  }
}

// Check if a slot overlaps with any existing booking
function checkSlotAvailability(timeSlotStr, dateStr, durationMin = 30) {
  const slotStart = convertTimeToMinutes(timeSlotStr);
  const slotEnd = slotStart + durationMin;
  const bookings = getExistingBookingsForDate(dateStr);

  for (const b of bookings) {
    const bStart = convertTimeToMinutes(b.time);
    const bDuration = b.durationMin || 30;
    const bEnd = bStart + bDuration;

    // Check overlap: start1 < end2 and start2 < end1
    if (slotStart < bEnd && bStart < slotEnd) {
      return {
        available: false,
        bookedBy: b.customerName,
        bookingId: b.bookingId,
        bookedTime: b.time,
        serviceNames: (b.services || []).map(s => s.name).join(", ")
      };
    }
  }
  return { available: true };
}

function renderTimeSlots() {
  const container = document.getElementById("time-slots-container");
  const freeCounterEl = document.getElementById("free-slots-counter");
  if (!container) return;

  container.innerHTML = "";
  const dateBookings = getExistingBookingsForDate(bookingState.selectedDate);

  let freeCount = 0;
  let bookedCount = 0;

  ALL_DAY_SLOTS.forEach(timeStr => {
    // Check if slot is free for the selected duration
    const reqDuration = bookingState.totalDurationMin > 0 ? bookingState.totalDurationMin : 30;
    const slotInfo = checkSlotAvailability(timeStr, bookingState.selectedDate, reqDuration);
    
    if (slotInfo.available) {
      freeCount++;
    } else {
      bookedCount++;
    }

    if (bookingState.showOnlyFreeSlots && !slotInfo.available) {
      return; // Skip booked slots if filter is on
    }

    const isSelected = timeStr === bookingState.selectedTime && slotInfo.available;

    const btn = document.createElement("button");
    btn.type = "button";

    if (!slotInfo.available) {
      // Overlapping / Booked Slot (Disabled)
      btn.className = "time-btn p-2.5 rounded-xl text-xs border transition-all flex flex-col items-center justify-center bg-red-950/40 text-red-300/80 border-red-900/60 cursor-not-allowed opacity-80 relative group";
      btn.innerHTML = `
        <span class="font-bold line-through text-[11px]">${timeStr}</span>
        <span class="text-[9px] text-red-400 font-bold flex items-center gap-1 mt-0.5">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Booked
        </span>
        <!-- Hover tooltip -->
        <span class="absolute bottom-full mb-1 hidden group-hover:block bg-stone-900 text-stone-200 text-[10px] p-2 rounded-lg border border-red-800 shadow-xl w-36 text-center z-20">
          Booked by <b>${slotInfo.bookedBy}</b> at ${slotInfo.bookedTime}
        </span>
      `;
      btn.onclick = () => {
        alert(`⚠️ Overlap Notice: The ${timeStr} slot on ${bookingState.selectedDate} is already booked by ${slotInfo.bookedBy}. Please select an open green slot!`);
      };
    } else if (isSelected) {
      // Selected Free Slot
      btn.className = "time-btn p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center bg-amber-500 text-stone-950 border-amber-300 shadow-lg shadow-amber-500/30 scale-105";
      btn.innerHTML = `
        <span class="text-[12px]">${timeStr}</span>
        <span class="text-[9px] text-stone-950 font-black uppercase flex items-center gap-1 mt-0.5">
          ✓ Selected
        </span>
      `;
    } else {
      // Free Available Slot
      btn.className = "time-btn p-2.5 rounded-xl text-xs font-medium border transition-all flex flex-col items-center justify-center bg-[#18110e] text-emerald-300 border-[#2f4032] hover:border-emerald-500 hover:bg-[#1a2b1e]";
      btn.innerHTML = `
        <span class="text-[11px] font-semibold text-stone-200">${timeStr}</span>
        <span class="text-[9px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Free
        </span>
      `;
      btn.onclick = () => {
        bookingState.selectedTime = timeStr;
        renderTimeSlots();
        updateAppointmentPreview();
      };
    }

    container.appendChild(btn);
  });

  if (freeCounterEl) {
    freeCounterEl.innerHTML = `
      <span class="text-emerald-400 font-bold">🟢 ${freeCount} Free Slots</span>
      <span class="mx-1.5 text-stone-600">|</span>
      <span class="text-red-400 font-bold">🔴 ${bookedCount} Booked Slots</span>
    `;
  }
}

function toggleShowOnlyFreeSlots() {
  bookingState.showOnlyFreeSlots = !bookingState.showOnlyFreeSlots;
  const toggleBtn = document.getElementById("toggle-free-slots-btn");
  if (toggleBtn) {
    toggleBtn.textContent = bookingState.showOnlyFreeSlots ? "Show All Slots" : "Show Free Slots Only";
    toggleBtn.className = bookingState.showOnlyFreeSlots
      ? "text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold transition shadow"
      : "text-xs px-3 py-1.5 rounded-lg bg-[#251b14] text-stone-300 border border-[#422d21] hover:text-white transition";
  }
  renderTimeSlots();
}

// ----------------------------------------------------
// SERVICES CATALOG, LIVE SEARCH & CATEGORY FILTERING
// ----------------------------------------------------
function filterServicesByCategory(catName) {
  bookingState.currentCategoryFilter = catName;
  document.querySelectorAll(".cat-filter-btn").forEach(b => {
    b.className = "cat-filter-btn px-4 py-2 rounded-xl text-xs font-bold border transition whitespace-nowrap bg-[#18110e] text-stone-300 border-[#422d21] hover:border-amber-500/50";
  });
  const activeBtn = document.getElementById(`filter-btn-${catName.replace(/[^a-zA-Z0-9]/g, "")}`);
  if (activeBtn) {
    activeBtn.className = "cat-filter-btn px-4 py-2 rounded-xl text-xs font-bold border transition whitespace-nowrap bg-amber-600 text-stone-950 border-amber-400 shadow-md shadow-amber-600/30";
  }
  renderServices();
}

function handleServiceSearch(input) {
  bookingState.searchQuery = input.value.trim().toLowerCase();
  renderServices();
}

function renderServices() {
  const container = document.getElementById("services-catalog-container");
  if (!container) return;

  container.innerHTML = "";
  const allCategories = serviceCatalogManager.services;

  let totalRendered = 0;

  allCategories.forEach((cat, catIdx) => {
    // Filter by Category
    if (bookingState.currentCategoryFilter !== "ALL" && cat.category !== bookingState.currentCategoryFilter) {
      return;
    }

    // Filter items by search query
    const filteredItems = cat.items.filter(item => {
      if (!bookingState.searchQuery) return true;
      const q = bookingState.searchQuery;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.nameHi && item.nameHi.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q) ||
        String(item.price).includes(q)
      );
    });

    if (filteredItems.length === 0) return;
    totalRendered += filteredItems.length;

    const catCard = document.createElement("div");
    catCard.className = "vintage-card rounded-2xl p-5 sm:p-6 mb-6";

    catCard.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#422d21] pb-3 mb-4 gap-2">
        <div class="flex items-center gap-3">
          <span class="text-2xl">${cat.icon}</span>
          <div>
            <h3 class="font-serif-vintage text-lg md:text-xl font-bold text-amber-100 flex items-center gap-2">
              ${cat.category}
              <span class="text-xs font-normal text-amber-300/70">(${cat.categoryHi || ""})</span>
            </h3>
            <p class="text-xs text-stone-400">Click any card to add/remove from your appointment</p>
          </div>
        </div>
        <button onclick="openCustomServiceModal('${cat.category}')" class="text-xs px-3 py-1.5 rounded-xl bg-[#2b1f18] border border-amber-600/40 text-amber-300 hover:bg-amber-600 hover:text-stone-950 transition font-bold flex items-center gap-1.5 self-start sm:self-auto">
          <span>➕ Add Custom Service / Price</span>
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5" id="cat-items-${catIdx}">
      </div>
    `;

    container.appendChild(catCard);

    const itemsContainer = document.getElementById(`cat-items-${catIdx}`);

    filteredItems.forEach(item => {
      // Preselect 2 popular items on first load if cart empty
      if (bookingState.selectedServices.length === 0 && (item.id === "hair-trendy" || item.id === "beard-smooth")) {
        bookingState.selectedServices.push(item);
      }

      const isChecked = bookingState.selectedServices.some(s => s.id === item.id);

      const itemCard = document.createElement("div");
      itemCard.id = `card-service-${item.id}`;
      itemCard.className = `p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
        isChecked 
          ? "bg-[#2d1e16] border-amber-500/80 shadow-lg shadow-amber-950/50" 
          : "bg-[#18110e] border-[#422d21] hover:border-amber-500/40"
      }`;

      itemCard.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-start gap-2.5">
              <input type="checkbox" id="check-${item.id}" ${isChecked ? "checked" : ""} class="accent-amber-500 w-4 h-4 rounded mt-0.5 cursor-pointer pointer-events-none">
              <div>
                <label for="check-${item.id}" class="text-sm font-bold text-amber-100 cursor-pointer block leading-tight">${item.name}</label>
                ${item.nameHi ? `<span class="text-[11px] text-amber-400/80 block mt-0.5">${item.nameHi}</span>` : ""}
              </div>
            </div>
            ${item.tag ? `<span class="text-[9px] bg-red-950 text-red-300 border border-red-700/60 px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0">${item.tag}</span>` : ""}
          </div>
          <p class="text-xs text-stone-400 mb-3 ml-6 leading-relaxed">${item.description}</p>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-[#422d21]/60 text-xs ml-6">
          <span class="text-amber-400 font-semibold flex items-center gap-1">
            ⏱ ${item.duration}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-amber-300 font-black text-sm bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/40">
              ₹${item.price}
            </span>
            <button onclick="promptEditServicePrice('${item.id}', ${item.price}, event)" title="Customize Price" class="text-[10px] text-stone-400 hover:text-amber-300 p-1 rounded bg-[#251b14] border border-[#422d21]">
              ✏️
            </button>
          </div>
        </div>
      `;

      itemCard.onclick = (e) => {
        // Prevent trigger if clicking edit price button
        if (e.target.closest("button")) return;
        toggleService(item);
      };

      itemsContainer.appendChild(itemCard);
    });
  });

  if (totalRendered === 0) {
    container.innerHTML = `
      <div class="vintage-card p-12 text-center rounded-2xl border border-[#422d21]">
        <span class="text-3xl block mb-2">🔍</span>
        <h4 class="font-bold text-amber-200 text-base">No services found for "${bookingState.searchQuery}"</h4>
        <p class="text-xs text-stone-400 mt-1">Try another search or click below to add a custom haircut / service!</p>
        <button onclick="openCustomServiceModal('Hair Cutting & Styling')" class="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs">
          + Add This as a Custom Haircut
        </button>
      </div>
    `;
  }

  updateBookingSummary();
}

function toggleService(item) {
  const index = bookingState.selectedServices.findIndex(s => s.id === item.id);
  const card = document.getElementById(`card-service-${item.id}`);
  const checkbox = document.getElementById(`check-${item.id}`);

  if (index > -1) {
    bookingState.selectedServices.splice(index, 1);
    if (card) {
      card.className = "p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group bg-[#18110e] border-[#422d21] hover:border-amber-500/40";
    }
    if (checkbox) checkbox.checked = false;
  } else {
    bookingState.selectedServices.push(item);
    if (card) {
      card.className = "p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group bg-[#2d1e16] border-amber-500/80 shadow-lg shadow-amber-950/50";
    }
    if (checkbox) checkbox.checked = true;
  }

  updateBookingSummary();
  renderTimeSlots(); // Re-check slots since duration may have changed
}

// ----------------------------------------------------
// CUSTOMIZE PRICING & NEW HAIRCUTS MODAL
// ----------------------------------------------------
function openCustomServiceModal(defaultCategory = "Hair Cutting & Styling") {
  const modal = document.getElementById("custom-service-modal");
  const catSelect = document.getElementById("custom-service-cat");
  if (catSelect) catSelect.value = defaultCategory;
  if (modal) modal.classList.remove("hidden");
}

function closeCustomServiceModal() {
  const modal = document.getElementById("custom-service-modal");
  if (modal) modal.classList.add("hidden");
}

function handleAddCustomServiceSubmit(e) {
  if (e) e.preventDefault();

  const name = document.getElementById("custom-service-name").value.trim();
  const nameHi = document.getElementById("custom-service-name-hi").value.trim();
  const category = document.getElementById("custom-service-cat").value;
  const price = document.getElementById("custom-service-price").value;
  const duration = document.getElementById("custom-service-duration").value;
  const desc = document.getElementById("custom-service-desc").value.trim();

  if (!name || !price) {
    alert("Please enter service name and price!");
    return;
  }

  const newItem = serviceCatalogManager.addCustomService(category, name, nameHi, price, duration, desc);
  
  // Automatically select it into cart
  bookingState.selectedServices.push(newItem);

  closeCustomServiceModal();
  renderServices();
  updateBookingSummary();

  paymentManager.showToast(`Custom service "${name}" added at ₹${price}!`);
}

function promptEditServicePrice(serviceId, currentPrice, event) {
  if (event) event.stopPropagation();
  const input = prompt(`Customize Price in ₹ for this service:`, currentPrice);
  if (input !== null && !isNaN(input) && parseInt(input) > 0) {
    const updated = serviceCatalogManager.updateServicePrice(serviceId, parseInt(input));
    if (updated) {
      // Update price in current selection if already selected
      const selectedItem = bookingState.selectedServices.find(s => s.id === serviceId);
      if (selectedItem) {
        selectedItem.price = updated.price;
      }
      renderServices();
      updateBookingSummary();
      paymentManager.showToast(`Price updated to ₹${updated.price}`);
    }
  }
}

// ----------------------------------------------------
// BOOKING SUMMARY & TIME DETAILS UPDATE
// ----------------------------------------------------
function updateBookingSummary() {
  const countEl = document.getElementById("selected-services-count");
  const listEl = document.getElementById("selected-services-list");
  const totalEl = document.getElementById("selected-total-price");
  const durationEl = document.getElementById("selected-total-duration");
  const payModalTotal = document.getElementById("modal-pay-amount");

  let total = 0;
  let totalMin = 0;

  if (listEl) listEl.innerHTML = "";

  if (bookingState.selectedServices.length === 0) {
    if (listEl) {
      listEl.innerHTML = `<li class="text-amber-200/50 text-xs italic py-2">No service selected yet. Click any service card above to choose!</li>`;
    }
  } else {
    bookingState.selectedServices.forEach(s => {
      total += s.price;
      const min = s.durationMin || parseInt(s.duration) || 20;
      totalMin += min;

      if (listEl) {
        const li = document.createElement("li");
        li.className = "flex items-center justify-between text-xs py-1.5 border-b border-[#422d21]/40 text-amber-100";
        li.innerHTML = `
          <div class="flex items-center gap-1.5">
            <button onclick="toggleService(${JSON.stringify(s).replace(/"/g, '&quot;')})" title="Remove" class="text-red-400 hover:text-red-300 font-bold mr-1">✕</button>
            <span>${s.name}</span>
          </div>
          <span class="font-bold text-amber-300">₹${s.price}</span>
        `;
        listEl.appendChild(li);
      }
    });
  }

  bookingState.totalAmount = total;
  bookingState.totalDurationMin = totalMin;

  if (countEl) countEl.textContent = `${bookingState.selectedServices.length} Selected`;
  if (totalEl) totalEl.textContent = `₹${total}`;
  if (durationEl) durationEl.textContent = `${totalMin} min`;
  if (payModalTotal) payModalTotal.textContent = `₹${total}`;

  // Update Mobile App Floating Cart Pill
  const mobilePill = document.getElementById("mobile-floating-cart-pill");
  const mobilePillCount = document.getElementById("mobile-pill-count");
  const mobilePillPrice = document.getElementById("mobile-pill-price");

  if (mobilePill) {
    if (bookingState.selectedServices.length > 0) {
      mobilePill.classList.remove("hidden");
      if (mobilePillCount) mobilePillCount.textContent = `${bookingState.selectedServices.length} Selected`;
      if (mobilePillPrice) mobilePillPrice.innerHTML = `Total: <b class="text-white text-xs font-serif-vintage">₹${total}</b> (${totalMin} min)`;
    } else {
      mobilePill.classList.add("hidden");
    }
  }

  updateAppointmentPreview();
}

function updateAppointmentPreview() {
  const arrivalTimeEl = document.getElementById("preview-arrival-time");
  const arrivalNoticeEl = document.getElementById("preview-arrival-notice");

  if (!arrivalTimeEl) return;

  const slot = bookingState.selectedTime;
  arrivalTimeEl.textContent = `${bookingState.selectedDate} at ${slot}`;
  
  if (arrivalNoticeEl) {
    arrivalNoticeEl.innerHTML = `
      📍 <b>Confirmed Shop Arrival:</b> Please reach <b>Barber Salon Shop</b> exactly <b>10 minutes before ${slot}</b>.
    `;
  }
}

// ----------------------------------------------------
// SOUND CHIME
// ----------------------------------------------------
function playConfirmationChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + idx * 0.1);
      osc.stop(audioCtx.currentTime + idx * 0.1 + 0.5);
    });
  } catch (e) {}
}

// ----------------------------------------------------
// BOOKING SUBMISSION & OVERLAP CHECK
// ----------------------------------------------------
function handleBookingSubmit(e) {
  if (e) e.preventDefault();

  if (bookingState.selectedServices.length === 0) {
    alert("Please select at least one service before proceeding with your appointment!");
    return;
  }

  // Check if slot is still free before booking
  const reqDuration = bookingState.totalDurationMin > 0 ? bookingState.totalDurationMin : 30;
  const slotCheck = checkSlotAvailability(bookingState.selectedTime, bookingState.selectedDate, reqDuration);
  if (!slotCheck.available) {
    alert(`⚠️ Cannot Book: The slot ${bookingState.selectedTime} on ${bookingState.selectedDate} has just been booked by ${slotCheck.bookedBy}. Please select another free slot!`);
    renderTimeSlots();
    return;
  }

  // Read customer form inputs
  const nameInput = document.getElementById("cust-name");
  const phoneInput = document.getElementById("cust-phone");
  const emailInput = document.getElementById("cust-email");
  const notesInput = document.getElementById("cust-notes");
  const stylistInput = document.getElementById("cust-stylist");
  const paymentSelect = document.querySelector('input[name="payment_choice"]:checked');

  bookingState.customerName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Amit";
  bookingState.customerPhone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : "8930440260";
  bookingState.customerEmail = emailInput ? emailInput.value.trim() : "amitkumargazipuria@oksbi";
  bookingState.customerNotes = notesInput ? notesInput.value.trim() : "";
  if (stylistInput) bookingState.selectedStylist = stylistInput.value;
  if (paymentSelect) bookingState.paymentMethod = paymentSelect.value;

  const isOnline = bookingState.paymentMethod !== "offline_cash";

  if (isOnline) {
    openOnlinePaymentModal();
  } else {
    finalizeBooking("Offline (Pay Cash at Salon Counter)", "PENDING_CASH");
  }
}

function openOnlinePaymentModal() {
  const modal = document.getElementById("online-payment-modal");
  const amountEl = document.getElementById("modal-pay-amount");
  const upiIdDisplay = document.getElementById("modal-upi-id-text");

  if (amountEl) amountEl.textContent = `₹${bookingState.totalAmount}`;
  if (upiIdDisplay) upiIdDisplay.textContent = paymentManager.merchantVPA;

  const dummyOrderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
  paymentManager.renderQrCode("modal-qr-container", bookingState.totalAmount, dummyOrderId);

  // Set deep links
  const upiUri = paymentManager.generateUpiLink(bookingState.totalAmount, dummyOrderId);
  const payGpayBtn = document.getElementById("btn-pay-gpay");
  const payPhonepeBtn = document.getElementById("btn-pay-phonepe");
  const payPaytmBtn = document.getElementById("btn-pay-paytm");

  if (payGpayBtn) payGpayBtn.href = upiUri;
  if (payPhonepeBtn) payPhonepeBtn.href = upiUri;
  if (payPaytmBtn) payPaytmBtn.href = upiUri;

  if (modal) modal.classList.remove("hidden");
}

function closeOnlinePaymentModal() {
  const modal = document.getElementById("online-payment-modal");
  if (modal) modal.classList.add("hidden");
}

function simulatePlatformPay(platformName) {
  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="animate-spin inline-block mr-1">⚙️</span> Connecting...`;
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
    closeOnlinePaymentModal();
    finalizeBooking(`Online (${platformName} • UPI: amitkumargazipuria@oksbi)`, "PAID_SUCCESS");
  }, 1000);
}

function handleUtrSubmit() {
  const utrInput = document.getElementById("input-utr-number");
  const utr = utrInput ? utrInput.value.trim() : "";
  if (!utr) {
    alert("Please enter your 12-digit UPI Reference / UTR Number from your payment app!");
    return;
  }
  closeOnlinePaymentModal();
  finalizeBooking(`Online UPI Paid (UTR: ${utr})`, "PAID_SUCCESS");
}

function finalizeBooking(paymentLabel, paymentStatus) {
  playConfirmationChime();

  const bookingId = "AMIT-SLOT-" + Math.floor(100000 + Math.random() * 900000);
  const bookingRecord = {
    bookingId,
    timestamp: new Date().toISOString(),
    customerName: bookingState.customerName,
    customerPhone: bookingState.customerPhone,
    customerEmail: bookingState.customerEmail,
    stylist: bookingState.selectedStylist,
    date: bookingState.selectedDate,
    time: bookingState.selectedTime,
    services: bookingState.selectedServices,
    totalAmount: bookingState.totalAmount,
    durationMin: bookingState.totalDurationMin,
    paymentMethod: paymentLabel,
    paymentStatus: paymentStatus
  };

  // Save to localStorage so future bookings for this slot are blocked (prevent overlapping)
  saveBookingToHistory(bookingRecord);
  loadBookingsBadge();
  renderTimeSlots(); // Update slot status to mark this slot booked

  renderReceiptModal(bookingRecord);
}

function saveBookingToHistory(record) {
  try {
    const list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
    list.unshift(record);
    localStorage.setItem("amit_saloon_bookings", JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

function loadBookingsBadge() {
  try {
    const list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
    const badge = document.getElementById("staff-bookings-count");
    if (badge) badge.textContent = list.length;
  } catch (e) {}
}

function renderReceiptModal(record) {
  const modal = document.getElementById("receipt-modal");
  const container = document.getElementById("receipt-content-container");

  const servicesHtml = record.services.map(s => `
    <div class="flex justify-between py-1 border-b border-dashed border-stone-300 text-xs">
      <span class="font-medium text-stone-800">${s.name} (${s.duration || s.durationMin + ' min'})</span>
      <span class="font-bold text-stone-900">₹${s.price}</span>
    </div>
  `).join("");

  const statusBadge = record.paymentStatus === "PAID_SUCCESS"
    ? `<span class="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold">✓ ONLINE PAID (amitkumargazipuria@oksbi)</span>`
    : `<span class="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold">⏳ PAY CASH AT SALON COUNTER</span>`;

  container.innerHTML = `
    <div class="ticket-receipt p-6 md:p-8" id="printable-receipt">
      
      <div class="text-center pb-4 border-b-2 border-stone-300">
        <div class="w-12 h-12 rounded-full border-2 border-amber-700 bg-amber-950 text-amber-200 flex items-center justify-center text-xl mx-auto mb-2 shadow">
          💈
        </div>
        <h3 class="font-serif-vintage text-2xl font-black tracking-tight text-stone-900">
          BARBER SALON SHOP
        </h3>
        <p class="text-[11px] text-stone-600 uppercase tracking-widest font-semibold">
          Luxury Hair, Beard Grooming & Keratin Spa
        </p>
        <p class="text-xs text-stone-500 mt-1">
          UPI ID: <b class="text-amber-800">amitkumargazipuria@oksbi</b> • 📞 <a href="tel:8930440260" class="text-amber-800 font-bold underline">8930440260</a> (Amit)
        </p>
      </div>

      <!-- EXACT TIME DETAILS CALLOUT -->
      <div class="my-4 p-4 rounded-xl bg-amber-50 border-2 border-amber-500 text-center space-y-1 shadow-sm">
        <span class="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
          ⏰ YOUR CONFIRMED SHOP ARRIVAL TIME
        </span>
        <div class="text-xl md:text-2xl font-black text-amber-950 font-serif-vintage">
          ${record.date} @ ${record.time}
        </div>
        <div class="text-xs text-amber-900 font-semibold">
          ⚠️ Please arrive at the salon <b>10 minutes before (${record.time})</b>. Your chair is strictly reserved!
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs py-3 border-b border-stone-200">
        <div>
          <span class="text-stone-500 text-[10px] uppercase font-bold block">Token / Order ID</span>
          <span class="font-mono font-bold text-stone-900 text-sm">${record.bookingId}</span>
        </div>
        <div>
          <span class="text-stone-500 text-[10px] uppercase font-bold block">Customer Name</span>
          <span class="font-bold text-stone-900 text-sm">${record.customerName}</span>
        </div>
        <div>
          <span class="text-stone-500 text-[10px] uppercase font-bold block">Contact Mobile</span>
          <span class="font-bold text-stone-900">${record.customerPhone}</span>
        </div>
        <div>
          <span class="text-stone-500 text-[10px] uppercase font-bold block">Master Stylist</span>
          <span class="font-bold text-amber-900">${record.stylist}</span>
        </div>
      </div>

      <div class="py-3">
        <span class="text-stone-500 text-[10px] uppercase font-bold block mb-2">Booked Services</span>
        <div class="space-y-1">
          ${servicesHtml}
        </div>
      </div>

      <div class="ticket-divider"></div>

      <div class="flex items-center justify-between py-2 text-sm">
        <div>
          <span class="text-stone-500 text-xs block font-semibold">Total Amount</span>
          <span class="text-xs text-stone-600 font-medium">Estimated Duration: ${record.durationMin} min</span>
        </div>
        <div class="text-right">
          <span class="text-2xl font-black text-stone-900 font-serif-vintage">₹${record.totalAmount}</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-stone-200">
        <div>
          <span class="text-[11px] text-stone-500 block">Payment Mode: <b>${record.paymentMethod}</b></span>
        </div>
        <div>
          ${statusBadge}
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-dashed border-stone-300 text-center text-xs text-stone-600">
        <p class="font-semibold text-stone-800">💈 Shop Location: Main Market Road (Near Clock Tower)</p>
        <p class="text-[11px] text-stone-500 mt-1">Website Developed by <b>Amit</b> | Mobile: <b>8930440260</b></p>
      </div>

    </div>

    <div class="flex flex-wrap items-center justify-center gap-3 mt-6">
      <button onclick="window.print()" class="px-5 py-2.5 bg-stone-900 text-amber-100 hover:bg-stone-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow">
        🖨️ Print / Save Appointment Slip
      </button>

      <a href="https://wa.me/918930440260?text=${encodeURIComponent(`Hello Amit, I have booked a slot at Barber Salon Shop!\nToken: ${record.bookingId}\nName: ${record.customerName}\nTime: ${record.date} at ${record.time}\nTotal: ₹${record.totalAmount}\nUPI ID: amitkumargazipuria@oksbi`)}" target="_blank" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow">
        📱 WhatsApp Confirmation
      </a>

      <button onclick="closeReceiptModal()" class="px-5 py-2.5 bg-stone-700 hover:bg-stone-600 text-white rounded-xl text-xs font-semibold">
        Close Window
      </button>
    </div>
  `;

  if (modal) modal.classList.remove("hidden");
}

function closeReceiptModal() {
  const modal = document.getElementById("receipt-modal");
  if (modal) modal.classList.add("hidden");
}

// ----------------------------------------------------
// RATINGS & REVIEWS
// ----------------------------------------------------
let currentStarSelection = 5;

function setReviewStar(stars) {
  currentStarSelection = stars;
  document.querySelectorAll(".star-picker-btn").forEach((btn, idx) => {
    if (idx < stars) {
      btn.textContent = "★";
      btn.className = "star-picker-btn text-2xl text-amber-400 hover:scale-125 transition cursor-pointer";
    } else {
      btn.textContent = "☆";
      btn.className = "star-picker-btn text-2xl text-stone-600 hover:scale-125 transition cursor-pointer";
    }
  });
  const label = document.getElementById("star-rating-label");
  if (label) label.textContent = `${stars} Star${stars > 1 ? "s" : ""} (Excellent)`;
}

function handleReviewSubmit(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("rev-author");
  const serviceInput = document.getElementById("rev-service");
  const commentInput = document.getElementById("rev-comment");

  const author = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Amit";
  const service = serviceInput ? serviceInput.value : "Keratin Smoothening & Beard Spa";
  const comment = commentInput && commentInput.value.trim() ? commentInput.value.trim() : "Awesome haircut and beard smoothing! Great salon.";

  reviewManager.addReview(author, currentStarSelection, service, comment);

  if (commentInput) commentInput.value = "";

  renderReviewsList();
  renderRatingStats();

  paymentManager.showToast(`Thank you, ${author}! Your ${currentStarSelection}★ review is published.`);
}

function renderReviewsList() {
  const container = document.getElementById("reviews-grid-container");
  if (!container) return;

  container.innerHTML = "";
  const reviews = reviewManager.reviews;

  reviews.forEach(r => {
    const card = document.createElement("div");
    card.className = "vintage-card rounded-2xl p-5 border border-[#422d21] space-y-3 relative overflow-hidden";
    
    let starsStr = "";
    for (let i = 1; i <= 5; i++) {
      starsStr += i <= Math.round(r.rating) ? "★" : "☆";
    }

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-300 font-bold text-sm">
            ${r.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 class="font-bold text-amber-100 text-sm flex items-center gap-1.5">
              ${r.author}
              ${r.verified ? `<span class="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded font-semibold">✓ Verified</span>` : ""}
            </h4>
            <span class="text-[11px] text-amber-200/50">${r.role} • ${r.date}</span>
          </div>
        </div>
        <span class="text-amber-400 text-sm tracking-wider">${starsStr}</span>
      </div>

      <div class="text-xs bg-[#18110e] px-2.5 py-1 rounded-lg border border-[#422d21]/60 text-amber-300/80 inline-block">
        ✂ Service: <b>${r.service}</b>
      </div>

      <p class="text-xs text-amber-100/80 leading-relaxed italic">
        "${r.comment}"
      </p>
    `;

    container.appendChild(card);
  });
}

function renderRatingStats() {
  const stats = reviewManager.getStats();
  const avgEl = document.getElementById("rating-stat-avg");
  const countEl = document.getElementById("rating-stat-count");

  if (avgEl) avgEl.textContent = stats.average;
  if (countEl) countEl.textContent = `Based on ${stats.count} verified customer reviews`;
}

// ----------------------------------------------------
// SALON STAFF / OWNER PORTAL
// ----------------------------------------------------
function openStaffBookingsModal() {
  const modal = document.getElementById("staff-modal");
  const container = document.getElementById("staff-bookings-table-body");
  
  try {
    const list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
    if (list.length === 0) {
      container.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-amber-200/50 text-xs">No appointments booked yet.</td></tr>`;
    } else {
      container.innerHTML = list.map((b, idx) => `
        <tr class="border-b border-[#422d21]/50 text-xs text-amber-100 hover:bg-[#251b14]/50">
          <td class="py-3 px-2 font-mono text-amber-300 font-bold">${b.bookingId}</td>
          <td class="py-3 px-2 font-semibold text-white">${b.customerName}<br><span class="text-[10px] text-amber-200/60">📞 ${b.customerPhone}</span></td>
          <td class="py-3 px-2 text-amber-200">${b.date}<br><span class="font-bold text-amber-400">${b.time}</span></td>
          <td class="py-3 px-2">${(b.services || []).map(s => s.name).join(", ")}</td>
          <td class="py-3 px-2 font-bold text-white">₹${b.totalAmount}</td>
          <td class="py-3 px-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              b.paymentStatus === 'PAID_SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }">${b.paymentMethod}</span>
          </td>
          <td class="py-3 px-2">
            <button onclick="cancelBooking('${b.bookingId}')" class="text-[10px] bg-red-950 text-red-300 hover:bg-red-800 px-2 py-1 rounded border border-red-700">Cancel</button>
          </td>
        </tr>
      `).join("");
    }
  } catch (e) {
    console.error(e);
  }

  if (modal) modal.classList.remove("hidden");
}

function closeStaffBookingsModal() {
  const modal = document.getElementById("staff-modal");
  if (modal) modal.classList.add("hidden");
}

function cancelBooking(bookingId) {
  if (confirm(`Are you sure you want to cancel booking ${bookingId} and free up its time slot?`)) {
    try {
      let list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
      list = list.filter(b => b.bookingId !== bookingId);
      localStorage.setItem("amit_saloon_bookings", JSON.stringify(list));
      loadBookingsBadge();
      renderTimeSlots();
      openStaffBookingsModal();
      paymentManager.showToast(`Booking ${bookingId} cancelled. Slot is now free!`);
    } catch (e) {}
  }
}

// ----------------------------------------------------
// PORTAL SWITCHER & OWNER / CUSTOMER CONTROL
// ----------------------------------------------------
let currentPortal = 'customer';
let ownerState = {
  activeFilter: 'ALL',
  searchQuery: ''
};

function switchPortal(portalName) {
  currentPortal = portalName;
  const customerView = document.getElementById("customer-portal-view");
  const ownerView = document.getElementById("owner-portal-view");
  const btnCustomer = document.getElementById("btn-portal-customer");
  const btnOwner = document.getElementById("btn-portal-owner");
  const mobileNavCustomer = document.getElementById("mobile-nav-customer-tabs");
  const mobileNavOwner = document.getElementById("mobile-nav-owner-tabs");

  if (portalName === 'owner') {
    if (customerView) customerView.classList.add("hidden");
    if (ownerView) ownerView.classList.remove("hidden");

    if (btnCustomer) {
      btnCustomer.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 portal-switch-inactive";
    }
    if (btnOwner) {
      btnOwner.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 portal-switch-active";
    }

    if (mobileNavCustomer) mobileNavCustomer.classList.add("hidden");
    if (mobileNavOwner) mobileNavOwner.classList.remove("hidden");

    renderOwnerDashboard();
    initOwnerSlotSelects();
    paymentManager.showToast("Logged into Owner Portal (Amit)");
  } else {
    if (customerView) customerView.classList.remove("hidden");
    if (ownerView) ownerView.classList.add("hidden");

    if (btnCustomer) {
      btnCustomer.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 portal-switch-active";
    }
    if (btnOwner) {
      btnOwner.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 portal-switch-inactive";
    }

    if (mobileNavCustomer) mobileNavCustomer.classList.remove("hidden");
    if (mobileNavOwner) mobileNavOwner.classList.add("hidden");

    renderTimeSlots();
    renderServices();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initOwnerSlotSelects() {
  const daySelect = document.getElementById("owner-block-day");
  const timeSelect = document.getElementById("owner-block-time");
  if (!daySelect || !timeSelect) return;

  daySelect.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const dStr = getFormattedDate(i);
    const opt = document.createElement("option");
    opt.value = dStr;
    opt.textContent = dStr;
    daySelect.appendChild(opt);
  }

  timeSelect.innerHTML = "";
  ALL_DAY_SLOTS.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    timeSelect.appendChild(opt);
  });
}

function setOwnerFilter(filter) {
  ownerState.activeFilter = filter;
  ['ALL', 'TODAY', 'UPCOMING', 'PAID', 'CASH_PENDING'].forEach(f => {
    const btn = document.getElementById(`owner-filter-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = "px-3.5 py-1.5 rounded-xl font-bold bg-amber-600 text-stone-950 border border-amber-400 shadow";
      } else {
        btn.className = "px-3.5 py-1.5 rounded-xl font-semibold bg-[#18110e] text-stone-300 border border-[#422d21] hover:border-amber-500/40";
      }
    }
  });
  renderOwnerDashboard();
}

function handleOwnerSearch(input) {
  ownerState.searchQuery = input.value.trim().toLowerCase();
  renderOwnerDashboard();
}

function renderOwnerDashboard() {
  const tableBody = document.getElementById("owner-bookings-table-body");
  const mobileCards = document.getElementById("owner-bookings-mobile-cards");

  const statTodayCount = document.getElementById("owner-stat-today-count");
  const statUpcomingCount = document.getElementById("owner-stat-upcoming-count");
  const statTotalRev = document.getElementById("owner-stat-total-revenue");
  const statOnlinePaid = document.getElementById("owner-stat-online-paid");
  const statCashPending = document.getElementById("owner-stat-cash-pending");

  const list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
  const todayStr = getFormattedDate(0);

  // Compute Metrics
  let todayCount = 0;
  let totalRevenue = 0;
  let onlinePaidAmount = 0;
  let cashPendingAmount = 0;

  list.forEach(b => {
    totalRevenue += Number(b.totalAmount) || 0;
    if (b.date && b.date.includes(todayStr.split(",")[0])) {
      todayCount++;
    }
    if (b.paymentStatus === 'PAID_SUCCESS') {
      onlinePaidAmount += Number(b.totalAmount) || 0;
    } else {
      cashPendingAmount += Number(b.totalAmount) || 0;
    }
  });

  if (statTodayCount) statTodayCount.textContent = todayCount;
  if (statUpcomingCount) statUpcomingCount.textContent = list.length;
  if (statTotalRev) statTotalRev.textContent = `₹${totalRevenue}`;
  if (statOnlinePaid) statOnlinePaid.textContent = `₹${onlinePaidAmount}`;
  if (statCashPending) statCashPending.textContent = `₹${cashPendingAmount}`;

  // Filter List
  const filtered = list.filter(b => {
    // 1. Search Query
    if (ownerState.searchQuery) {
      const q = ownerState.searchQuery;
      const matchName = b.customerName && b.customerName.toLowerCase().includes(q);
      const matchPhone = b.customerPhone && b.customerPhone.includes(q);
      const matchId = b.bookingId && b.bookingId.toLowerCase().includes(q);
      const matchDate = b.date && b.date.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchId && !matchDate) return false;
    }

    // 2. Active Tab Filter
    if (ownerState.activeFilter === 'TODAY') {
      return b.date && b.date.includes(todayStr.split(",")[0]);
    }
    if (ownerState.activeFilter === 'UPCOMING') {
      return !(b.date && b.date.includes(todayStr.split(",")[0]));
    }
    if (ownerState.activeFilter === 'PAID') {
      return b.paymentStatus === 'PAID_SUCCESS';
    }
    if (ownerState.activeFilter === 'CASH_PENDING') {
      return b.paymentStatus !== 'PAID_SUCCESS';
    }
    return true;
  });

  // Render Table (Desktop)
  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-stone-500 text-xs">No bookings found matching filter.</td></tr>`;
    } else {
      tableBody.innerHTML = filtered.map(b => {
        const isPaid = b.paymentStatus === 'PAID_SUCCESS';
        const cleanPhone = b.customerPhone ? b.customerPhone.replace(/[^0-9]/g, "") : "8930440260";
        const serviceNames = (b.services || []).map(s => s.name).join(", ");

        return `
          <tr class="border-b border-[#422d21]/60 text-xs text-stone-200 hover:bg-[#22160f]/60 transition">
            <td class="py-3 px-3">
              <span class="font-mono text-amber-300 font-bold block">${b.bookingId}</span>
              <span class="text-[10px] text-stone-400">${b.date}</span>
            </td>
            <td class="py-3 px-3">
              <b class="text-white text-sm block">${b.customerName}</b>
              <div class="flex items-center gap-2 mt-0.5">
                <a href="tel:${cleanPhone}" class="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 font-bold">
                  📞 ${cleanPhone}
                </a>
                <a href="https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${b.customerName}, regarding your appointment at Barber Salon Shop on ${b.date} at ${b.time}`)}" target="_blank" class="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.2 rounded font-bold hover:bg-emerald-900">
                  💬 WhatsApp
                </a>
              </div>
            </td>
            <td class="py-3 px-3">
              <span class="font-bold text-amber-400 block">${b.time}</span>
              <span class="text-[10px] text-stone-400">${b.stylist || 'Amit'}</span>
            </td>
            <td class="py-3 px-3 max-w-xs">
              <p class="truncate text-stone-300" title="${serviceNames}">${serviceNames}</p>
              <span class="text-[10px] text-stone-500">Duration: ${b.durationMin || 30} min</span>
            </td>
            <td class="py-3 px-3">
              <span class="font-serif-vintage font-bold text-white text-sm">₹${b.totalAmount}</span>
            </td>
            <td class="py-3 px-3">
              ${isPaid 
                ? `<span class="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold block text-center">✓ PAID (UPI)</span>`
                : `<span class="bg-amber-950 text-amber-300 border border-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold block text-center">⏳ CASH PENDING</span>`
              }
            </td>
            <td class="py-3 px-3 text-right">
              <div class="flex items-center justify-end gap-1.5">
                ${!isPaid ? `
                  <button onclick="markBookingAsPaid('${b.bookingId}')" title="Collect Cash" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition">
                    ✓ Paid
                  </button>
                ` : ''}
                <button onclick="printBookingFromOwner('${b.bookingId}')" title="Print Slip" class="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[10px] transition">
                  🖨️
                </button>
                <button onclick="cancelBookingByOwner('${b.bookingId}')" title="Cancel Booking & Free Slot" class="px-2 py-1 bg-red-950 hover:bg-red-800 text-red-300 rounded-lg text-[10px] border border-red-800 transition">
                  ✕
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  // Render Mobile Cards
  if (mobileCards) {
    if (filtered.length === 0) {
      mobileCards.innerHTML = `<div class="p-6 text-center text-stone-500 text-xs bg-[#18110e] rounded-xl border border-[#422d21]">No bookings found.</div>`;
    } else {
      mobileCards.innerHTML = filtered.map(b => {
        const isPaid = b.paymentStatus === 'PAID_SUCCESS';
        const cleanPhone = b.customerPhone ? b.customerPhone.replace(/[^0-9]/g, "") : "8930440260";
        const serviceNames = (b.services || []).map(s => s.name).join(", ");

        return `
          <div class="vintage-card p-4 rounded-2xl border border-[#422d21] space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <span class="font-mono text-amber-400 font-bold text-xs">${b.bookingId}</span>
                <h4 class="text-white font-bold text-sm mt-0.5">${b.customerName}</h4>
              </div>
              <div>
                ${isPaid 
                  ? `<span class="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">✓ PAID</span>`
                  : `<span class="bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">⏳ CASH PENDING</span>`
                }
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs bg-[#18110e] p-2.5 rounded-xl border border-[#422d21]/60">
              <div>
                <span class="text-stone-500 text-[10px] block">Appointment:</span>
                <b class="text-amber-300">${b.date} @ ${b.time}</b>
              </div>
              <div>
                <span class="text-stone-500 text-[10px] block">Total Amount:</span>
                <b class="text-white font-serif-vintage text-sm">₹${b.totalAmount}</b>
              </div>
            </div>

            <div class="text-xs text-stone-300">
              <span class="text-stone-500 text-[10px] block">Services:</span>
              <p class="text-[11px] leading-snug">${serviceNames}</p>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-[#422d21] text-xs">
              <div class="flex items-center gap-2">
                <a href="tel:${cleanPhone}" class="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1">
                  📞 Call
                </a>
                <a href="https://wa.me/91${cleanPhone}" target="_blank" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1">
                  💬 Chat
                </a>
              </div>
              <div class="flex items-center gap-1.5">
                ${!isPaid ? `
                  <button onclick="markBookingAsPaid('${b.bookingId}')" class="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs">
                    Mark Paid
                  </button>
                ` : ''}
                <button onclick="cancelBookingByOwner('${b.bookingId}')" class="px-2.5 py-1.5 bg-red-950 text-red-300 border border-red-800 rounded-lg text-xs">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }
  }
}

function markBookingAsPaid(bookingId) {
  try {
    let list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
    const item = list.find(b => b.bookingId === bookingId);
    if (item) {
      item.paymentStatus = 'PAID_SUCCESS';
      item.paymentMethod = 'Offline (Cash Collected at Counter)';
      localStorage.setItem("amit_saloon_bookings", JSON.stringify(list));
      renderOwnerDashboard();
      paymentManager.showToast(`Booking ${bookingId} marked as PAID!`);
    }
  } catch (e) {
    console.error(e);
  }
}

function cancelBookingByOwner(bookingId) {
  if (confirm(`Cancel booking ${bookingId}? This will free up the slot for other customers.`)) {
    try {
      let list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
      list = list.filter(b => b.bookingId !== bookingId);
      localStorage.setItem("amit_saloon_bookings", JSON.stringify(list));
      loadBookingsBadge();
      renderOwnerDashboard();
      paymentManager.showToast(`Booking ${bookingId} cancelled. Slot is now available.`);
    } catch (e) {
      console.error(e);
    }
  }
}

function printBookingFromOwner(bookingId) {
  try {
    const list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
    const item = list.find(b => b.bookingId === bookingId);
    if (item) {
      renderReceiptModal(item);
    }
  } catch (e) {}
}

function handleOwnerBlockSlotSubmit() {
  const day = document.getElementById("owner-block-day").value;
  const time = document.getElementById("owner-block-time").value;
  const reason = document.getElementById("owner-block-reason").value.trim() || "Reserved by Amit (Salon Owner)";

  const blockRecord = {
    bookingId: "BLOCKED-" + Math.floor(1000 + Math.random() * 9000),
    timestamp: new Date().toISOString(),
    customerName: reason,
    customerPhone: "8930440260",
    customerEmail: "amitkumargazipuria@oksbi",
    stylist: "Amit (Master Barber & Stylist)",
    date: day,
    time: time,
    durationMin: 30,
    services: [{ name: reason, price: 0 }],
    totalAmount: 0,
    paymentMethod: "Owner Reserved",
    paymentStatus: "PAID_SUCCESS"
  };

  saveBookingToHistory(blockRecord);
  renderOwnerDashboard();
  paymentManager.showToast(`Slot ${time} on ${day} blocked successfully!`);
}

// ----------------------------------------------------
// CUSTOMER BOOKING LOOKUP TRACKER
// ----------------------------------------------------
function openCustomerLookupModal() {
  const modal = document.getElementById("customer-lookup-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeCustomerLookupModal() {
  const modal = document.getElementById("customer-lookup-modal");
  if (modal) modal.classList.add("hidden");
}

function handleCustomerLookupSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("lookup-query-input").value.trim().toLowerCase();
  const resultsContainer = document.getElementById("lookup-results-container");

  if (!input) {
    alert("Please enter your mobile number or token number!");
    return;
  }

  const list = JSON.parse(localStorage.getItem("amit_saloon_bookings") || "[]");
  const matches = list.filter(b => {
    const mPhone = b.customerPhone && b.customerPhone.includes(input);
    const mId = b.bookingId && b.bookingId.toLowerCase().includes(input);
    const mName = b.customerName && b.customerName.toLowerCase().includes(input);
    return mPhone || mId || mName;
  });

  if (matches.length === 0) {
    resultsContainer.innerHTML = `
      <div class="p-5 text-center text-stone-400 text-xs bg-[#18110e] rounded-xl border border-[#422d21]">
        No appointments found for "${input}". Please check the phone number or place a new booking!
      </div>
    `;
  } else {
    resultsContainer.innerHTML = matches.map(b => `
      <div class="vintage-card p-4 rounded-xl border border-amber-600/40 space-y-2.5 text-xs mb-3">
        <div class="flex items-center justify-between">
          <span class="font-mono text-amber-300 font-bold">${b.bookingId}</span>
          <span class="text-[10px] px-2 py-0.5 rounded font-bold ${
            b.paymentStatus === 'PAID_SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
          }">${b.paymentStatus === 'PAID_SUCCESS' ? '✓ Online Paid' : '⏳ Pay at Salon'}</span>
        </div>
        <div class="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-200">
          ⏰ <b>Confirmed Arrival Time:</b> ${b.date} at <b>${b.time}</b><br>
          <span class="text-[11px] text-stone-300">Please arrive 10 min early at Barber Salon Shop!</span>
        </div>
        <div class="flex justify-between items-center text-stone-300 text-[11px]">
          <span>Services: ${(b.services || []).map(s => s.name).join(", ")}</span>
          <b class="text-white font-serif-vintage text-sm">₹${b.totalAmount}</b>
        </div>
        <div class="pt-2 flex justify-end gap-2 border-t border-[#422d21]">
          <button onclick="renderReceiptModal(${JSON.stringify(b).replace(/"/g, '&quot;')})" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs">
            View / Print Full Slip
          </button>
        </div>
      </div>
    `).join("");
  }
}

// ----------------------------------------------------
// EVENT LISTENERS SETUP
// ----------------------------------------------------
function setupEventListeners() {
  const bookingForm = document.getElementById("appointment-booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmit);
  }

  const reviewForm = document.getElementById("review-submission-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", handleReviewSubmit);
  }

  const customServiceForm = document.getElementById("custom-service-form");
  if (customServiceForm) {
    customServiceForm.addEventListener("submit", handleAddCustomServiceSubmit);
  }

  const lookupForm = document.getElementById("customer-lookup-form");
  if (lookupForm) {
    lookupForm.addEventListener("submit", handleCustomerLookupSubmit);
  }
}
