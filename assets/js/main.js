document.addEventListener("DOMContentLoaded", async () => {
  // Force scroll to top on page load/refresh
  if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  const categoryLinks = document.querySelectorAll(".category-list a");
  const searchInput = document.querySelector(".search-container input");
  const searchButton = document.querySelector(".search-button");
  const brandsGrid = document.getElementById("brandsGrid");
  const modal = document.getElementById("proofModal");
  const modalClose = modal.querySelector(".modal-close");

  let currentCategory = "all";
  let searchQuery = "";
  let products = [];

  // Load products from data.js
  try {
    products = window.productsData || [];
  } catch (error) {
    console.error("Error loading products:", error);
    products = [];
  }

  // Function to create brand card HTML
  function createBrandCard(product) {
    return `
            <div class="brand-card" data-category="${product.category.toLowerCase()}">
                <div class="brand-name">${product.name}</div>
                <img src="assets/images/products/${product.image
                  .split("/")
                  .pop()}" alt="${product.name}" class="brand-image" loading="lazy">
                <div class="brand-info">
                    <button class="proof">Proof</button>
                </div>
            </div>
        `;
  }

  // Function to update brands counter
  function updateBrandsCounter() {
    const counter = document.querySelector(".counter");
    if (counter && products) {
      counter.textContent = products.length;
    }
  }

  // Memoize filtered products for better performance
  const memoizedProducts = new Map();
  
  // Function to filter and display products
  function filterAndDisplayProducts() {
    const cacheKey = `${currentCategory}-${searchQuery}`;
    if (memoizedProducts.has(cacheKey)) {
      renderProducts(memoizedProducts.get(cacheKey));
      return;
    }

    const brandOrder = [
      "Amazon",
      "Google",
      "HP",
      "Carrefour",
      "Puma",
      "Barclays",
      "Victoria's Secret",
      "AXA",
      "Wix.com",
      "Teva",
      "Sabra Hummus",
      "Moroccanoil",
      "Ahava",
      "SodaStream",
      "Eden Springs",
      "Elite Foods",
      "Medjool Dates",
      "Scarlett Johansson",
      "Coca-Cola", // Adding Coca-Cola at the end since it wasn't in the original list
    ];

    const filteredProducts = products.filter((product) => {
      const matchesCategory =
        currentCategory === "all" ||
        product.category.toLowerCase() === currentCategory;
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sort products according to the specified order
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const indexA = brandOrder.indexOf(a.name);
      const indexB = brandOrder.indexOf(b.name);

      // If both products are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one product is in the order list, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither product is in the order list, maintain their original order
      return 0;
    });

    brandsGrid.innerHTML = sortedProducts.map(createBrandCard).join("");
    updateBrandsCounter(); // Update counter after filtering

    // Add click handlers to buttons
    document.querySelectorAll(".brand-card").forEach((card) => {
      const proofBtn = card.querySelector("button.proof");

      proofBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const product = sortedProducts.find((p) => {
          const cardImage = card.querySelector("img");
          return cardImage && cardImage.alt === p.name;
        });
        if (product) {
          showProofModal(product);
        }
      });
    });
  }

  // Modal functionality
  function showProofModal(product) {
    const modal = document.getElementById("proofModal");

    // Reset modal content before showing
    modal.querySelector(".modal-content").style.opacity = "0";
    modal.querySelector(".modal-content").style.transform = "translateY(20px)";

    // Set content dynamically
    modal.querySelector(".product-title").textContent = product.name;
    modal.querySelector(".product-owner").textContent = product.description;
    modal.querySelector(".company-name").textContent = "";
    modal.querySelector(".proof-text").textContent = product.proof;

    const logoImg = modal.querySelector(".product-logo img");
    logoImg.src = `assets/images/products/${product.image.split("/").pop()}`;
    logoImg.alt = product.name;
    logoImg.onerror = () => {
      logoImg.style.opacity = "0.5";
      logoImg.style.filter = "grayscale(1)";
    };

    // Show modal with fade in
    modal.classList.add("show");

    // Trigger animation after a small delay
    setTimeout(() => {
      modal.querySelector(".modal-content").style.opacity = "1";
      modal.querySelector(".modal-content").style.transform = "translateY(0)";
    }, 50);

    // Event handlers
    const closeBtn = modal.querySelector(".close-action");
    const modalClose = modal.querySelector(".modal-close");
    const sourceBtn = modal.querySelector(".source-action");

    function closeModal() {
      modal.querySelector(".modal-content").style.opacity = "0";
      modal.querySelector(".modal-content").style.transform =
        "translateY(20px)";
      setTimeout(() => {
        modal.classList.remove("show");
      }, 300);
    }

    closeBtn.onclick = closeModal;
    modalClose.onclick = closeModal;

    // Update source button behavior
    sourceBtn.onclick = () => {
      // Format brand name for URL (lowercase, remove spaces, special characters)
      const brandUrlName = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .replace(/\s+/g, "");
      window.open(
        `https://boycott.thewitness.news/target/${brandUrlName}`,
        "_blank"
      );
    };

    // Close on outside click
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    // Close on escape key
    document.addEventListener("keydown", function escapeHandler(e) {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escapeHandler);
      }
    });
  }

  // Function to scroll to brands section with smooth behavior
  function scrollToBrands() {
    const brandsSection = document.querySelector(".brands");
    if (brandsSection) {
      window.scrollTo({
        top: brandsSection.offsetTop - 100,
        behavior: "smooth",
      });
    }
  }

  // Function to scroll to top smoothly
  function scrollToTop(e) {
    if (e) {
      e.preventDefault();
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Add scroll to top functionality for logo click
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", scrollToTop);
  }

  // Prevent default anchor behavior and use smooth scroll only for non-category links
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (
      link &&
      link.getAttribute("href") === "#" &&
      !link.closest(".category-list")
    ) {
      e.preventDefault();
      scrollToTop();
    }
  });

  // Scroll to top functionality
  const scrollToTopBtn = document.getElementById("scrollToTop");

  function handleScroll() {
    if (window.scrollY > 400) {
      scrollToTopBtn.classList.add("visible");
    } else {
      scrollToTopBtn.classList.remove("visible");
    }
  }

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", handleScroll);

  // Initial load - ensure data is loaded
  if (products.length > 0) {
    filterAndDisplayProducts();
    updateBrandsCounter();
  } else {
    // Wait for data to be loaded
    window.addEventListener("load", () => {
      if (products.length > 0) {
        filterAndDisplayProducts();
        updateBrandsCounter();
      }
    });
  }

  // Modified category click handler
  categoryLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // Stop event from bubbling up
      categoryLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      currentCategory = link.textContent.toLowerCase();
      filterAndDisplayProducts();
      scrollToBrands(); // Always scroll to brands when category is clicked
    });
  });

  // Modified search handler
  function handleSearch() {
    searchQuery = searchInput.value.trim();
    filterAndDisplayProducts();
    if (searchQuery !== "") {
      scrollToBrands();
    }
  }

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  searchInput.addEventListener("input", handleSearch);
  searchButton?.addEventListener("click", handleSearch);

  // Theme switcher
  const themeToggle = document.querySelector(".theme-toggle");
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.dataset.theme = savedTheme;

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme;
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
  });

  // Contact button functionality
  const contactBtn = document.querySelector(".contact-btn");
  const contactSuggestBtn = document.querySelector(".contact-suggest-btn");
  const feedbackModal = document.getElementById("feedbackModal");
  const feedbackText = document.getElementById("feedbackText");

  function showFeedbackModal() {
    feedbackModal.classList.add("show");
    setTimeout(() => {
      feedbackModal.querySelector(".modal-content").style.opacity = "1";
      feedbackModal.querySelector(".modal-content").style.transform =
        "translateY(0)";
    }, 50);
  }

  function closeFeedbackModal() {
    feedbackModal.querySelector(".modal-content").style.opacity = "0";
    feedbackModal.querySelector(".modal-content").style.transform =
      "translateY(20px)";
    setTimeout(() => {
      feedbackModal.classList.remove("show");
      feedbackText.value = ""; // Clear the textarea
    }, 300);
  }

  // Event listeners for feedback modal
  contactBtn.addEventListener("click", showFeedbackModal);
  contactSuggestBtn.addEventListener("click", showFeedbackModal);

  feedbackModal.addEventListener("click", (e) => {
    if (e.target === feedbackModal) {
      closeFeedbackModal();
    }
  });

  // Handle form submission
  const feedbackForm = document.getElementById("feedbackForm");
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const feedback = feedbackText.value.trim();

    if (feedback) {
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedback }),
        });

        const data = await response.json();

        if (data.success) {
          // Show success message
          const successMessage = document.createElement("div");
          successMessage.className = "feedback-success";
          successMessage.textContent = "Thank you for your feedback!";

          const form = feedbackModal.querySelector(".feedback-form");
          form.innerHTML = ""; // Clear the form
          form.appendChild(successMessage);
          successMessage.classList.add("show");

          // Close and reset modal after delay
          setTimeout(() => {
            closeFeedbackModal();
            setTimeout(() => {
              form.innerHTML = `
                <form id="feedbackForm">
                    <textarea id="feedbackText" name="feedback" placeholder="Write your feedback or suggest new brands here..." rows="6" required></textarea>
                    <div class="modal-actions">
                        <button type="button" class="close-action">Cancel</button>
                        <button type="submit" class="send-action">Send Feedback</button>
                    </div>
                </form>
              `;
              // Reattach event listener to new form
              document
                .getElementById("feedbackForm")
                .addEventListener("submit", arguments.callee);
            }, 300);
          }, 2000);
        } else {
          throw new Error(data.error || "Failed to send feedback");
        }
      } catch (error) {
        // Show error message
        const errorMessage = document.createElement("div");
        errorMessage.className = "feedback-error";
        errorMessage.textContent =
          "Failed to send feedback. Please try again later.";

        const form = feedbackModal.querySelector(".feedback-form");
        form.insertBefore(errorMessage, form.firstChild);

        // Remove error message after 3 seconds
        setTimeout(() => {
          errorMessage.remove();
        }, 3000);
      }
    }
  });

  feedbackModal
    .querySelector(".modal-close")
    .addEventListener("click", closeFeedbackModal);
  feedbackModal
    .querySelector(".close-action")
    .addEventListener("click", closeFeedbackModal);

  // Add escape key handler for feedback modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && feedbackModal.classList.contains("show")) {
      closeFeedbackModal();
    }
  });

  // Remove the default mailto behavior
  if (contactBtn) {
    contactBtn.removeEventListener("click", () => {
      window.location.href = "mailto:contact@boycott.com";
    });
  }

  // Remove the default mailto behavior for suggest button
  document
    .querySelector(".contact-suggest-btn")
    ?.removeEventListener("click", () => {
      window.location.href = "mailto:contact@boycott.com";
    });
});

function updateThemeToggle(theme) {
  const sunIcon = document.querySelector(".theme-toggle .sun");
  const moonIcon = document.querySelector(".theme-toggle .moon");

  if (theme === "dark") {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
}

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/boycott-tn/assets/js/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful");
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}
