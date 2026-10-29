const productForm = document.getElementById("productForm");
const nameInput = document.getElementById("nameInput");
const categoryInput = document.getElementById("categoryInput");
const priceInput = document.getElementById("priceInput");
const quantityInput = document.getElementById("quantityInput");
const submitBtn = document.getElementById("submitBtn");
const productList = document.getElementById("productList");
const emptyState = document.getElementById("emptyState");
const statCount = document.getElementById("statCount");
const statValue = document.getElementById("statValue");
const searchInput = document.getElementById("searchInput");
const categoryNav = document.getElementById("categoryNav");

const STORAGE_KEY = "products";
let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editIndex = null; // null = add mode, number = update mode
let selectedCategory = "all";

// ----- persistence -----

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ----- render -----

function render() {
  productList.innerHTML = "";

  const term = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  products.forEach((product, index) => {
    if (term !== "" && !product.name.toLowerCase().includes(term)) return;
    if (selectedCategory !== "all" && product.category !== selectedCategory) return;
    visibleCount++;

    const li = document.createElement("li");

    const nameSpan = document.createElement("span");
    nameSpan.className = "p-name";
    nameSpan.textContent = product.name;

    const categorySpan = document.createElement("span");
    categorySpan.className = "p-category";
    categorySpan.textContent = product.category;

    const priceSpan = document.createElement("span");
    priceSpan.className = "p-price";
    priceSpan.textContent = product.price;

    const qtySpan = document.createElement("span");
    qtySpan.className = "p-qty";
    qtySpan.textContent = product.quantity;

    const actions = document.createElement("div");
    actions.className = "row-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn";
    editBtn.type = "button";
    editBtn.textContent = "✎";
    editBtn.addEventListener("click", () => startEdit(index));

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn delete";
    delBtn.type = "button";
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", () => deleteProduct(index, li));

    actions.append(editBtn, delBtn);
    li.append(nameSpan, categorySpan, priceSpan, qtySpan, actions);
    productList.appendChild(li);
  });

  updateStats();
  emptyState.classList.toggle("visible", visibleCount === 0);
  emptyState.textContent = term !== "" ? "مفيش منتجات مطابقة للبحث" : "لسه مفيش منتجات مضافة";
}

function updateStats() {
  statCount.textContent = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  statValue.textContent = totalValue;
}

searchInput.addEventListener("input", render);

categoryNav.addEventListener("click", (e) => {
  const item = e.target.closest(".category-item");
  if (!item) return;

  categoryNav.querySelector(".active").classList.remove("active");
  item.classList.add("active");
  selectedCategory = item.dataset.category;
  render();
});

// ----- create / update -----

productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const product = {
    name: nameInput.value.trim(),
    category: categoryInput.value,
    price: Number(priceInput.value),
    quantity: Number(quantityInput.value),
  };

  if (product.name === "" || product.category === "") return;

  if (editIndex === null) {
    products.push(product);
  } else {
    products[editIndex] = product;
    exitEditMode();
  }

  saveProducts();
  render();
  productForm.reset();
  nameInput.focus();
});

function startEdit(index) {
  const product = products[index];
  nameInput.value = product.name;
  categoryInput.value = product.category;
  priceInput.value = product.price;
  quantityInput.value = product.quantity;

  editIndex = index;
  submitBtn.textContent = "تحديث المنتج";
  submitBtn.classList.add("editing");
  nameInput.focus();
}

function exitEditMode() {
  editIndex = null;
  submitBtn.textContent = "إضافة المنتج";
  submitBtn.classList.remove("editing");
}

// ----- delete -----

function deleteProduct(index, li) {
  li.classList.add("removing");
  li.addEventListener("transitionend", () => {
    products.splice(index, 1);
    saveProducts();
    render();
    if (editIndex === index) {
      exitEditMode();
      productForm.reset();
    }
  }, { once: true });
}

// ----- init -----

render();
