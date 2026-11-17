// Rock-Solid Production-Grade UPI Payment Processor for Amit's Barber Shop
// Supports 100% genuine ISO/IEC 18004 compliant QR Code for Google Pay, PhonePe, Paytm, BHIM
// Official Merchant UPI VPA: amitkumargazipuria@oksbi

class PaymentManager {
  constructor() {
    this.merchantVPA = "amitkumargazipuria@oksbi";
    this.merchantName = "Amit";
    this.merchantMobile = "8930440260";
  }

  // Generates genuine NPCI standard UPI Payment URI
  generateUpiLink(amount, orderId = "SALON") {
    const cleanName = encodeURIComponent(this.merchantName);
    const cleanNote = encodeURIComponent(`Salon_${orderId}`);
    
    // NPCI standard parameters
    if (amount && Number(amount) > 0) {
      const formattedAmount = Number(amount).toFixed(2);
      return `upi://pay?pa=${this.merchantVPA}&pn=${cleanName}&am=${formattedAmount}&cu=INR&tn=${cleanNote}`;
    } else {
      // Open / Any amount UPI link
      return `upi://pay?pa=${this.merchantVPA}&pn=${cleanName}&cu=INR&tn=${cleanNote}`;
    }
  }

  // Copies UPI ID to clipboard
  copyUpiId() {
    const vpa = this.merchantVPA;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(vpa).then(() => {
        this.showToast(`✓ UPI ID copied: ${vpa}`);
      }).catch(() => {
        this.copyFallback(vpa);
      });
    } else {
      this.copyFallback(vpa);
    }
  }

  copyFallback(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      this.showToast(`✓ UPI ID copied: ${text}`);
    } catch (e) {
      alert(`UPI ID: ${text}`);
    }
    document.body.removeChild(ta);
  }

  showToast(message) {
    let toast = document.getElementById("payment-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "payment-toast";
      toast.className = "fixed bottom-5 right-5 z-50 bg-emerald-500 text-stone-950 px-5 py-3 rounded-xl font-black text-xs shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 flex items-center gap-2";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
    toast.classList.remove("translate-y-2", "opacity-0");
    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
    }, 2800);
  }

  // Renders 100% genuine ISO compliant scannable QR Code into any target container
  async renderQrCode(containerId, amount, orderId = "SALON") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const upiUri = this.generateUpiLink(amount, orderId);
    const amountLabel = (amount && Number(amount) > 0) ? `₹${Number(amount).toFixed(0)}` : "Any Amount";

    // Create the card layout
    container.innerHTML = `
      <div class="relative inline-block bg-white p-3.5 rounded-2xl shadow-xl border-2 border-amber-500/60 text-center max-w-[240px] mx-auto">
        
        <!-- Target QR Display Area -->
        <div id="${containerId}-qr-view" class="w-48 h-48 mx-auto flex items-center justify-center overflow-hidden bg-white rounded-lg">
          <canvas id="${containerId}-canvas" class="w-full h-full block rounded"></canvas>
        </div>

        <!-- QR Bottom Labels -->
        <div class="mt-2 text-center border-t border-stone-200 pt-2">
          <div class="flex items-center justify-center gap-1.5 mb-1">
            <span class="text-xs">🇮🇳</span>
            <span class="text-[11px] uppercase font-black tracking-wider text-stone-900">
              BHIM UPI QR • ${amountLabel}
            </span>
          </div>
          <span class="text-[10px] text-stone-600 font-semibold block font-mono">
            ${this.merchantVPA}
          </span>
          <span class="text-[9px] text-stone-500 block mt-0.5">
            Scan with GPay, PhonePe, Paytm, or BHIM
          </span>
        </div>

      </div>
    `;

    const canvas = document.getElementById(`${containerId}-canvas`);
    const qrView = document.getElementById(`${containerId}-qr-view`);
    let rendered = false;

    // Method 1: Try Canvas via official QRCode library
    if (typeof QRCode !== "undefined" && QRCode.toCanvas && canvas) {
      try {
        await QRCode.toCanvas(canvas, upiUri, {
          width: 220,
          margin: 1,
          errorCorrectionLevel: "M",
          color: {
            dark: "#000000",
            light: "#ffffff"
          }
        });
        rendered = true;
      } catch (err) {
        console.warn("Canvas QR render failed, attempting SVG:", err);
      }
    }

    // Method 2: Try SVG rendering via official QRCode library
    if (!rendered && typeof QRCode !== "undefined" && QRCode.toString && qrView) {
      try {
        const svgMarkup = await QRCode.toString(upiUri, {
          type: "svg",
          margin: 1,
          errorCorrectionLevel: "M",
          color: {
            dark: "#000000",
            light: "#ffffff"
          }
        });
        qrView.innerHTML = svgMarkup;
        const svgElem = qrView.querySelector("svg");
        if (svgElem) {
          svgElem.style.width = "100%";
          svgElem.style.height = "100%";
          svgElem.style.display = "block";
        }
        rendered = true;
      } catch (err) {
        console.warn("SVG QR render failed, falling back to image:", err);
      }
    }

    // Method 3: Guaranteed universal fallback image
    if (!rendered && qrView) {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=4&data=${encodeURIComponent(upiUri)}`;
      qrView.innerHTML = `
        <img src="${qrApiUrl}" class="w-full h-full object-contain rounded" alt="UPI QR Code - ${this.merchantVPA}">
      `;
    }
  }
}

const paymentManager = new PaymentManager();
