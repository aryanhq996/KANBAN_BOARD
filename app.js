const STATUSES = ["todo", "in-progress", "done"];

const defaultCards = [
  { id: "1", title: "Plan project", description: "Define goals and scope", status: "todo" },
  { id: "2", title: "Design layout", description: "Sketch the board UI", status: "todo" },
  { id: "3", title: "Build HTML structure", description: "Create columns and card slots", status: "in-progress" },
  { id: "4", title: "Ship v1", description: "Deploy the kanban board", status: "done" },
];

let cards = loadCards();
let draggedCardId = null;

function loadCards() {
  const saved = localStorage.getItem("kanban-cards");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [...defaultCards];
    }
  }
  return [...defaultCards];
}

function saveCards() {
  localStorage.setItem("kanban-cards", JSON.stringify(cards));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function updateCounts() {
  STATUSES.forEach((status) => {
    const count = cards.filter((c) => c.status === status).length;
    const el = document.querySelector(`[data-count-for="${status}"]`);
    if (el) el.textContent = count;
  });
}

function createCardElement(card) {
  const el = document.createElement("article");
  el.className = "card";
  el.draggable = true;
  el.dataset.id = card.id;

  el.innerHTML = `
    <div class="card-title">${escapeHtml(card.title)}</div>
    <div class="card-desc">${escapeHtml(card.description)}</div>
    <div class="card-actions">
      <button class="delete-btn" type="button" aria-label="Delete card">Delete</button>
    </div>
  `;

  el.addEventListener("dragstart", onDragStart);
  el.addEventListener("dragend", onDragEnd);

  el.querySelector(".delete-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    deleteCard(card.id);
  });

  return el;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function render() {
  STATUSES.forEach((status) => {
    const container = document.querySelector(`.cards[data-status="${status}"]`);
    container.innerHTML = "";

    cards
      .filter((c) => c.status === status)
      .forEach((card) => {
        container.appendChild(createCardElement(card));
      });
  });

  updateCounts();
}

function addCard(status) {
  const title = prompt("Card title:");
  if (!title || !title.trim()) return;

  const description = prompt("Description (optional):") || "";

  cards.push({
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    status,
  });

  saveCards();
  render();
}

function deleteCard(id) {
  if (!confirm("Delete this card?")) return;
  cards = cards.filter((c) => c.id !== id);
  saveCards();
  render();
}

function moveCard(id, newStatus) {
  const card = cards.find((c) => c.id === id);
  if (card) {
    card.status = newStatus;
    saveCards();
    render();
  }
}

function onDragStart(e) {
  draggedCardId = e.currentTarget.dataset.id;
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", draggedCardId);
}

function onDragEnd(e) {
  e.currentTarget.classList.remove("dragging");
  draggedCardId = null;
  document.querySelectorAll(".cards").forEach((col) => {
    col.classList.remove("drag-over");
  });
}

function setupDropZones() {
  document.querySelectorAll(".cards").forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", (e) => {
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove("drag-over");
      }
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over");

      const id = e.dataTransfer.getData("text/plain") || draggedCardId;
      const newStatus = zone.dataset.status;
      if (id && newStatus) {
        moveCard(id, newStatus);
      }
    });
  });
}

function setupAddButtons() {
  document.querySelectorAll(".add-card-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      addCard(btn.dataset.status);
    });
  });
}

render();
setupDropZones();
setupAddButtons();
