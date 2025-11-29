// Key for localStorage
const STORAGE_KEY = "gym_bookings";

// Current booking state (will be saved as JSON)
const booking = {
  day: null,
  time: null,
  membership: null,
  trainer: null,
  firstName: "",
  middleName: "",
  lastName: "",
  birthDate: "", // "MM/DD/YYYY"
};

// ---------------------------------------------------------
// Utility: screen navigation
// ---------------------------------------------------------
function showStep(stepNumber) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const active = document.getElementById(`step-${stepNumber}`);
  if (active) active.classList.add("active");
}

// ---------------------------------------------------------
// STEP 1: Slot & membership selection
// ---------------------------------------------------------
const slotButtons = document.querySelectorAll(".slot-btn");
const membershipButtons = document.querySelectorAll(".membership-btn");
const step1NextBtn = document.getElementById("step1-next");

slotButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // clear previous selection
    slotButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    booking.day = btn.dataset.day;
    booking.time = btn.dataset.time;
  });
});

membershipButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    membershipButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    booking.membership = btn.dataset.membership;
  });
});

step1NextBtn.addEventListener("click", () => {
  if (!booking.day || !booking.time || !booking.membership) {
    alert("Please select a day, time, and membership type before continuing.");
    return;
  }
  showStep(2);
});

// ---------------------------------------------------------
// STEP 2: Trainer selection
// ---------------------------------------------------------
const trainerCards = document.querySelectorAll(".trainer-card");
const step2NextBtn = document.getElementById("step2-next");

trainerCards.forEach((card) => {
  card.addEventListener("click", () => {
    trainerCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    booking.trainer = card.dataset.trainer;
  });
});

step2NextBtn.addEventListener("click", () => {
  if (!booking.trainer) {
    alert("Please select a trainer.");
    return;
  }
  showStep(3);
});

// ---------------------------------------------------------
// STEP 3: Student info
// ---------------------------------------------------------
const studentForm = document.getElementById("student-form");
const firstNameInput = document.getElementById("firstName");
const middleNameInput = document.getElementById("middleName");
const lastNameInput = document.getElementById("lastName");
const birthMonthInput = document.getElementById("birthMonth");
const birthDayInput = document.getElementById("birthDay");
const birthYearInput = document.getElementById("birthYear");

studentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const first = firstNameInput.value.trim();
  const middle = middleNameInput.value.trim();
  const last = lastNameInput.value.trim();
  const mm = birthMonthInput.value.trim();
  const dd = birthDayInput.value.trim();
  const yyyy = birthYearInput.value.trim();

  if (!first || !last || !mm || !dd || !yyyy) {
    alert("Please complete all required fields.");
    return;
  }

  booking.firstName = first;
  booking.middleName = middle;
  booking.lastName = last;
  booking.birthDate = `${mm.padStart(2, "0")}/${dd.padStart(2, "0")}/${yyyy}`;

  updateSummary();
  showStep(4);
});

// ---------------------------------------------------------
// STEP 4: Summary + localStorage (JSON read/write)
// ---------------------------------------------------------
const summaryDay = document.getElementById("summary-day");
const summaryTime = document.getElementById("summary-time");
const summaryMembership = document.getElementById("summary-membership");
const summaryTrainer = document.getElementById("summary-trainer");
const summaryName = document.getElementById("summary-name");
const summaryBirthdate = document.getElementById("summary-birthdate");
const saveBookingBtn = document.getElementById("save-booking-btn");
const lastBookingCard = document.getElementById("last-booking-card");

function updateSummary() {
  summaryDay.textContent = booking.day || "-";
  summaryTime.textContent = booking.time || "-";
  summaryMembership.textContent = booking.membership || "-";
  summaryTrainer.textContent = booking.trainer || "-";

  const fullName = [booking.firstName, booking.middleName, booking.lastName]
    .filter(Boolean)
    .join(" ");
  summaryName.textContent = fullName || "-";
  summaryBirthdate.textContent = booking.birthDate || "-";
}

// Load existing bookings from localStorage and show last one
function loadBookingsFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    lastBookingCard.innerHTML = "<p>No saved booking yet.</p>";
    return;
  }

  try {
    const data = JSON.parse(saved);
    if (!Array.isArray(data) || data.length === 0) {
      lastBookingCard.innerHTML = "<p>No saved booking yet.</p>";
      return;
    }

    const last = data[data.length - 1];
    lastBookingCard.innerHTML = `
      <p><strong>Day:</strong> ${last.day}</p>
      <p><strong>Time:</strong> ${last.time}</p>
      <p><strong>Membership:</strong> ${last.membership}</p>
      <p><strong>Trainer:</strong> ${last.trainer}</p>
      <p><strong>Name:</strong> ${[last.firstName, last.middleName, last.lastName]
        .filter(Boolean)
        .join(" ")}</p>
      <p><strong>Birth Date:</strong> ${last.birthDate}</p>
      <p><strong>Saved At:</strong> ${new Date(last.savedAt).toLocaleString()}</p>
    `;
  } catch (err) {
    console.error("Error parsing bookings JSON:", err);
    lastBookingCard.innerHTML =
      "<p>Could not read saved bookings. Try saving a new one.</p>";
  }
}

saveBookingBtn.addEventListener("click", () => {
  // read current array
  let allBookings = [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      allBookings = JSON.parse(saved);
      if (!Array.isArray(allBookings)) allBookings = [];
    } catch {
      allBookings = [];
    }
  }

  // push new booking and save
  const bookingToSave = { ...booking, savedAt: new Date().toISOString() };
  allBookings.push(bookingToSave);

  // WRITE JSON to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allBookings));

  alert("Booking saved successfully to localStorage!");
  loadBookingsFromStorage();
});

// ---------------------------------------------------------
// Back buttons
// ---------------------------------------------------------
document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-back");
    showStep(target);
  });
});

// ---------------------------------------------------------
// Initial load
// ---------------------------------------------------------
showStep(1);
loadBookingsFromStorage();
