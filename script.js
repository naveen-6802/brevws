
class InvoiceGenerator {
  constructor() {
    this.invoiceData = {
      invoiceNumber: "INV-001",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      fromName: "",
      fromEmail: "",
      fromAddress: "",
      toName: "",
      toEmail: "",
      toAddress: "",
      items: [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0, tax: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
      currency: "USD",
      notes: "",
    }

    this.currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      INR: "₹",
    }

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupBackToTop()
    this.renderItems()
    this.updatePreview()
    this.setCurrentYear()
    this.scrollToTop()
  }

  setupEventListeners() {
    // Preview button
    const previewBtn = document.getElementById("previewBtn")
    const backBtn = document.getElementById("backBtn")
    const previewModal = document.getElementById("previewModal")
    const closePreviewBtn = document.getElementById("closePreviewBtn")
    const printBtn = document.getElementById("printBtn")
    const mainContent = document.getElementById("mainContent")
    const header = document.querySelector(".header-sticky")

    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        previewModal.classList.add("active")
        mainContent.style.display = "none"
        header.style.display = "none"
        this.renderFullPreview()
      })
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        previewModal.classList.remove("active")
        mainContent.style.display = "block"
        header.style.display = "block"
      })
    }

    if (closePreviewBtn) {
      closePreviewBtn.addEventListener("click", () => {
        previewModal.classList.remove("active")
        mainContent.style.display = "block"
        header.style.display = "block"
      })
    }

    if (printBtn) {
      printBtn.addEventListener("click", () => {
        window.print()
      })
    }

    // Form inputs
    const inputs = [
      "invoiceNumber",
      "invoiceDate",
      "dueDate",
      "fromName",
      "fromEmail",
      "fromAddress",
      "toName",
      "toEmail",
      "toAddress",
      "currency",
      "notes",
    ]

    inputs.forEach((inputId) => {
      const element = document.getElementById(inputId)
      if (element) {
        element.addEventListener("input", (e) => {
          const key = inputId === "invoiceDate" ? "date" : inputId
          this.invoiceData[key] = e.target.value
          this.updatePreview()
          if (inputId === "currency") {
            this.updateCurrencyDisplay()
          }
        })
      }
    })

    // Set initial values
    const invoiceDateEl = document.getElementById("invoiceDate")
    const dueDateEl = document.getElementById("dueDate")
    if (invoiceDateEl) invoiceDateEl.value = this.invoiceData.date
    if (dueDateEl) dueDateEl.value = this.invoiceData.dueDate

    // Add item button
    const addItemBtn = document.getElementById("addItemBtn")
    if (addItemBtn) {
      addItemBtn.addEventListener("click", () => {
        this.addItem()
      })
    }
  }

  setupBackToTop() {
    const backToTopBtn = document.getElementById("backToTop")

    if (backToTopBtn) {
      window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
          backToTopBtn.classList.add("visible")
        } else {
          backToTopBtn.classList.remove("visible")
        }
      })

      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      })
    }
  }

  scrollToTop() {
    window.scrollTo(0, 0)
  }

  setCurrentYear() {
    const yearElements = document.querySelectorAll("#currentYear, .current-year")
    yearElements.forEach((element) => {
      element.textContent = new Date().getFullYear()
    })
  }

  addItem() {
    const newId = Date.now().toString()
    const newItem = {
      id: newId,
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
      tax: 0,
    }

    this.invoiceData.items.push(newItem)
    this.renderItems()
    this.updatePreview()
  }

  removeItem(id) {
    this.invoiceData.items = this.invoiceData.items.filter((item) => item.id !== id)
    if (this.invoiceData.items.length === 0) {
      this.addItem()
    }
    this.renderItems()
    this.updatePreview()
  }

  updateItem(id, field, value) {
    const item = this.invoiceData.items.find((item) => item.id === id)
    if (item) {
      item[field] = field === "description" ? value : Number.parseFloat(value) || 0

      // Calculate amount
      if (field === "quantity" || field === "rate") {
        item.amount = item.quantity * item.rate
      }

      this.updatePreview()
      this.updateCurrencyDisplay()
    }
  }

  updateCurrencyDisplay() {
    const itemsList = document.getElementById("itemsList")
    if (!itemsList) return

    this.invoiceData.items.forEach((item) => {
      const totalDisplay = itemsList.querySelector(`[data-total-for="${item.id}"]`)
      if (totalDisplay) {
        totalDisplay.textContent = `${this.currencySymbols[this.invoiceData.currency]}${this.calculateItemTotal(item).toFixed(2)}`
      }
    })
  }

  renderItems() {
    const itemsList = document.getElementById("itemsList")
    if (!itemsList) return

    itemsList.innerHTML = ""

    this.invoiceData.items.forEach((item) => {
      const itemDiv = document.createElement("div")
      itemDiv.className = "item-card"
      itemDiv.innerHTML = `
                <div class="item-row">
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" value="${item.description}" 
                               class="form-input" 
                               data-item-id="${item.id}"
                               data-field="description">
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" value="${item.quantity}" min="0" step="0.01"
                               class="form-input" 
                               data-item-id="${item.id}"
                               data-field="quantity">
                    </div>
                </div>
                <div class="item-row">
                    <div class="form-group">
                        <label>Price</label>
                        <input type="number" value="${item.rate}" min="0" step="0.01"
                               class="form-input" 
                               data-item-id="${item.id}"
                               data-field="rate">
                    </div>
                    <div class="form-group">
                        <label>Tax %</label>
                        <input type="number" value="${item.tax}" min="0" max="100" step="0.01"
                               class="form-input" 
                               data-item-id="${item.id}"
                               data-field="tax">
                    </div>
                    <div class="form-group">
                        <label>Total Amount</label>
                        <div class="total-display" data-total-for="${item.id}">
                            ${this.currencySymbols[this.invoiceData.currency]}${this.calculateItemTotal(item).toFixed(2)}
                        </div>
                    </div>
        <br/>
                    <div class="form-group">
                        <button type="button" class="delete-btn" onclick="invoiceApp.removeItem('${item.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg> Delete Item
                        </button>
                    </div>
                </div>
            `
      itemsList.appendChild(itemDiv)
    })

    const itemInputs = itemsList.querySelectorAll(".form-input[data-item-id]")
    itemInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        const itemId = e.target.getAttribute("data-item-id")
        const field = e.target.getAttribute("data-field")
        this.updateItem(itemId, field, e.target.value)
      })
    })
  }

  calculateItemTotal(item) {
    const subtotal = item.quantity * item.rate
    const taxAmount = subtotal * (item.tax / 100)
    return subtotal + taxAmount
  }

  calculateTotals() {
    let subtotal = 0
    let totalTax = 0

    this.invoiceData.items.forEach((item) => {
      const itemSubtotal = item.quantity * item.rate
      const itemTax = itemSubtotal * (item.tax / 100)
      subtotal += itemSubtotal
      totalTax += itemTax
    })

    const total = subtotal + totalTax

    return {
      subtotal: subtotal,
      tax: totalTax,
      total: total,
    }
  }

  updatePreview() {
    const totals = this.calculateTotals()
    this.invoiceData.subtotal = totals.subtotal
    this.invoiceData.tax = totals.tax
    this.invoiceData.total = totals.total

    this.renderLivePreview()
  }

  renderLivePreview() {
    const livePreview = document.getElementById("livePreview")
    if (!livePreview) return

    livePreview.innerHTML = this.generateInvoiceHTML(true)
  }

  renderFullPreview() {
    const invoicePreview = document.getElementById("invoicePreview")
    if (!invoicePreview) return

    invoicePreview.innerHTML = this.generateInvoiceHTML(false)
  }

  generateInvoiceHTML(isCompact = false) {
    const currency = this.currencySymbols[this.invoiceData.currency]
    const scaleClass = isCompact ? 'style="transform: scale(0.8); transform-origin: top left;"' : ""

    return `
            <div class="invoice-document" ${scaleClass}>
                <div class="invoice-header">
                    <div>
                        <h2 class="invoice-title">Invoice</h2>
                        <p class="invoice-subtitle">Generated by brevws.live - Professional Invoice Generator</p>
                    </div>
                    <div class="invoice-details">
                        <p><strong>Invoice #:</strong> ${this.invoiceData.invoiceNumber}</p>
                        <p><strong>Date:</strong> ${this.formatDate(this.invoiceData.date)}</p>
                        <p><strong>Due Date:</strong> ${this.formatDate(this.invoiceData.dueDate)}</p>
                    </div>
                </div>
                
                <div class="invoice-parties">
                    <div class="party-section">
                        <h3>From</h3>
                        <div class="party-info">
                            <h4>${this.invoiceData.fromName || "Your Business Name"}</h4>
                            <p>${this.invoiceData.fromEmail || "your@email.com"}</p>
                            <p>${this.invoiceData.fromAddress || "Your Business Address"}</p>
                        </div>
                    </div>
                    <div class="party-section">
                        <h3>Bill To</h3>
                        <div class="party-info">
                            <h4>${this.invoiceData.toName || "Client Name"}</h4>
                            <p>${this.invoiceData.toEmail || "client@email.com"}</p>
                            <p>${this.invoiceData.toAddress || "Client Address"}</p>
                        </div>
                    </div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Tax %</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.invoiceData.items
                          .map(
                            (item) => `
                            <tr>
                                <td>${item.description || "Item description"}</td>
                                <td>${item.quantity}</td>
                                <td>${currency}${item.rate.toFixed(2)}</td>
                                <td>${item.tax}%</td>
                                <td>${currency}${this.calculateItemTotal(item).toFixed(2)}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
                
                <div class="invoice-totals">
                    <div class="totals-section">
                        <div class="total-row subtotal">
                            <span>Subtotal:</span>
                            <span>${currency}${this.invoiceData.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="total-row tax">
                            <span>Tax:</span>
                            <span>${currency}${this.invoiceData.tax.toFixed(2)}</span>
                        </div>
                        <div class="total-row final">
                            <span>Total:</span>
                            <span>${currency}${this.invoiceData.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                ${
                  this.invoiceData.notes
                    ? `
                    <div class="invoice-notes">
                        <h4>Notes</h4>
                        <p>${this.invoiceData.notes}</p>
                    </div>
                `
                    : ""
                }
            </div>
        `
  }

  formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.invoiceApp = new InvoiceGenerator()
})

// Handle page navigation scroll to top
window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0)
})

// Scroll to top on page load for navigation pages
if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)
  })
}

//YouTube Card
      (function () {
        const card = document.querySelector(".yt-card");
        const videoId = card?.getAttribute("data-video-id") || "6UCkAPP_5Ns";
        const playBtn = document.getElementById("playBtn");
        const thumbWrap = document.getElementById("thumb");
        const titleEl = document.getElementById("videoTitle");
        const metaEl = document.getElementById("videoMeta");
        const thumbImg = document.getElementById("thumbImg");

        // Swap thumbnail for the YouTube iframe on click
        function loadPlayer() {
          if (!thumbWrap) return;
          const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
          const iframe = document.createElement("iframe");
          iframe.className = "player";
          iframe.title = titleEl?.textContent || "YouTube video player";
          iframe.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          iframe.referrerPolicy = "strict-origin-when-cross-origin";
          iframe.allowFullscreen = true;
          iframe.src = src;
          thumbWrap.replaceWith(iframe);
        }

        // Click + keyboard activation
        playBtn?.addEventListener("click", loadPlayer);
        playBtn?.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            loadPlayer();
          }
        });

        // Try to enhance title/channel via YouTube oEmbed (safe fallback in place)
        const oEmbedURL = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        fetch(oEmbedURL)
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data) => {
            if (data?.title && titleEl) {
              titleEl.textContent = data.title;
              if (thumbImg) thumbImg.alt = `Thumbnail for: ${data.title}`;
            }
            if (data?.author_name && metaEl) {
              metaEl.textContent = data.author_name;
            }
          })
          .catch(() => {
            // keep fallbacks
          });
      })();
