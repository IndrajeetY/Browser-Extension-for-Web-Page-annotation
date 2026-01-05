let toolbar = null;
let savedRange = null;
let activeEdit = null;

console.log("Web Text Editor loaded");

/* =========================
   SELECTION HANDLING
========================= */
document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();

  if (!selection || selection.toString().trim() === "") {
    removeToolbar();
    savedRange = null;
    activeEdit = null;
    return;
  }

  if (!selection.rangeCount) return;

  savedRange = selection.getRangeAt(0).cloneRange();
  const rect = savedRange.getBoundingClientRect();
  showToolbar(rect);
});

/* =========================
   TOOLBAR UI
========================= */
function showToolbar(rect) {
  if (!rect || rect.width === 0) return;

  removeToolbar();

  toolbar = document.createElement("div");
  toolbar.className = "editor-toolbar";

  toolbar.innerHTML = `
    <button data-action="bold"><b>B</b></button>
    <button data-action="strike"><s>S</s></button>
    <button data-action="highlight">🖍</button>
    <button data-action="undo">⟲</button>
    <button data-action="redo">⟳</button>
    <button data-action="delete">✖</button>
  `;

  toolbar.style.top = `${window.scrollY + rect.bottom + 8}px`;
  toolbar.style.left = `${window.scrollX + rect.right}px`;

  toolbar.addEventListener("mousedown", e => e.preventDefault());

  toolbar.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      handleAction(btn.dataset.action);
    });
  });

  document.body.appendChild(toolbar);
}

/* =========================
   ACTION HANDLER
========================= */
function handleAction(action) {
  if (action === "undo" && activeEdit) undoEdit(activeEdit);
  else if (action === "redo" && activeEdit) redoEdit(activeEdit);
  else if (action === "delete" && activeEdit) deleteEdit(activeEdit);
  else applyStyle(action);
}

/* =========================
   APPLY STYLE
========================= */
function applyStyle(type) {
  if (!savedRange) return;

  const span = document.createElement("span");
  span.className = "web-edit";
  span.dataset.type = type;
  span.dataset.state = "applied";

  if (type === "bold") span.style.fontWeight = "bold";
  if (type === "strike") span.style.textDecoration = "line-through";
  if (type === "highlight") span.style.backgroundColor = "yellow";

  span.appendChild(savedRange.extractContents());
  savedRange.insertNode(span);

  span.addEventListener("click", e => {
    e.stopPropagation();
    selectEdit(span);
  });

  clearSelection();
}

/* =========================
   SELECT EXISTING EDIT
========================= */
function selectEdit(span) {
  activeEdit = span;

  const range = document.createRange();
  range.selectNodeContents(span);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const rect = span.getBoundingClientRect();
  showToolbar(rect);
}

/* =========================
   UNDO / REDO / DELETE
========================= */
function undoEdit(span) {
  if (span.dataset.state === "undone") return;

  span.dataset.state = "undone";
  span.style.fontWeight = "normal";
  span.style.textDecoration = "none";
  span.style.backgroundColor = "transparent";
}

function redoEdit(span) {
  if (span.dataset.state === "applied") return;

  span.dataset.state = "applied";

  if (span.dataset.type === "bold") span.style.fontWeight = "bold";
  if (span.dataset.type === "strike") span.style.textDecoration = "line-through";
  if (span.dataset.type === "highlight") span.style.backgroundColor = "yellow";
}

function deleteEdit(span) {
  span.replaceWith(...span.childNodes);
  activeEdit = null;
  removeToolbar();
}

/* =========================
   HELPERS
========================= */
function clearSelection() {
  removeToolbar();
  window.getSelection().removeAllRanges();
  savedRange = null;
  activeEdit = null;
}

function removeToolbar() {
  if (toolbar) {
    toolbar.remove();
    toolbar = null;
  }
}
