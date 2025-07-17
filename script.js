// script.js

const header = document.querySelector("header");
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll <= 0) {
    header.classList.remove("hide");
    header.classList.remove("transparent");
    return;
  }

  if (currentScroll > lastScroll) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
    header.classList.add("transparent");
  }
  lastScroll = currentScroll;
});

// API CONFIG
const apiBase = "https://suitmedia-backend.suitdev.com/api/ideas";
let currentPage = 1;
let itemsPerPage = 10;
let sortOrder = "-published_at"; // newest by default

const ideasGrid = document.getElementById("ideas-grid");
const paginationDiv = document.querySelector(".pagination");
const itemsPerPageSelect = document.getElementById("items-per-page");
const sortBySelect = document.getElementById("sort-by");
const infoText = document.querySelector(".filter p");

async function fetchIdeas() {
  const params = new URLSearchParams();
  params.append("page[number]", currentPage);
  params.append("page[size]", itemsPerPage);
  params.append("append[]", "small_image");
  params.append("append[]", "medium_image");
  params.append("sort", sortOrder);

  const url = `${apiBase}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    renderIdeas(data.data);
    renderPagination(data.meta);
    updateInfoText(data.meta);
  } catch (err) {
    console.error("Fetch failed:", err);
    ideasGrid.innerHTML = `<p style="color:red">Gagal memuat data dari API. (${err.message})</p>`;
  }
}

function renderIdeas(items) {
  ideasGrid.innerHTML = "";
  items.forEach((item) => {
    const title = item.title;
    const imageUrl =
      item.medium_image?.url ||
      item.small_image?.url ||
      "https://dummyimage.com/600x400/cccccc/000000&text=No+Image";
    const date = new Date(item.published_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const card = document.createElement("div");
    card.className = "idea-card";
    card.innerHTML = `
      <img src="${imageUrl}" alt="Idea Image" loading="lazy" />
      <h2>${title}</h2>
      <p>${date}</p>
    `;
    ideasGrid.appendChild(card);
  });
}

function renderPagination(meta) {
  paginationDiv.innerHTML = "";
  const { current_page, total_pages } = meta;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.disabled = current_page === 1;
  prevBtn.onclick = () => {
    currentPage--;
    fetchIdeas();
  };
  paginationDiv.appendChild(prevBtn);

  for (let i = 1; i <= total_pages; i++) {
    if (i === 1 || i === total_pages || Math.abs(i - current_page) <= 1) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === current_page) btn.disabled = true;
      btn.onclick = () => {
        currentPage = i;
        fetchIdeas();
      };
      paginationDiv.appendChild(btn);
    } else if (
      (i === 2 && current_page > 3) ||
      (i === total_pages - 1 && current_page < total_pages - 2)
    ) {
      const span = document.createElement("span");
      span.textContent = "...";
      paginationDiv.appendChild(span);
    }
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = current_page === total_pages;
  nextBtn.onclick = () => {
    currentPage++;
    fetchIdeas();
  };
  paginationDiv.appendChild(nextBtn);
}

function updateInfoText(meta) {
  const from = meta.from;
  const to = meta.to;
  const total = meta.total;
  infoText.textContent = `Showing ${from} - ${to} of ${total}`;
}

itemsPerPageSelect.addEventListener("change", (e) => {
  itemsPerPage = parseInt(e.target.value);
  currentPage = 1;
  fetchIdeas();
});

sortBySelect.addEventListener("change", (e) => {
  sortOrder = e.target.value === "newest" ? "-published_at" : "published_at";
  currentPage = 1;
  fetchIdeas();
});

// Initial Fetch
fetchIdeas();
