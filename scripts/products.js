'use strict';

const sectionContainer = document.querySelector('.section--shop');
const shopNav = document.querySelector('.shop__nav');
const shopCategories = document.querySelector('.shop__categories');
const productsContainer = document.querySelector('.products');

(async function initializeProducts() {
  try {
    const productArr = await fetch(
      'https://demo34107.appliances.dev.rwsgateway.com/FRONT-END-DEV-PRODUCT-TEST?test_api_key=DBWOSJJBZCQSIJMYKNGEYSRTPFIAVOPVBVGUSUJPFRSHKGWVWB'
    );
    const productData = await productArr.json();

    createDisplayCategories(productData);
    createDisplayProducts(productData);
    createFilters();
    initializeModal();
  } catch (err) {
    console.error(err.message);
    sectionContainer.insertAdjacentHTML(
      'beforeend',
      `<h1 class="text-center">We're sorry, there was an error loading products. Please refresh the page to try again.</h1>`
    );
  }
})();

function createDisplayProducts(products) {
  productsContainer.innerHTML = '';
  products.forEach(product => {
    const truncatedTitle = truncTitle(product.title);
    const formattedPrice = formatPrice(product.price.toString());
    // keep tabindex on parent item only so it can be adjusted when sorting
    const html = `
      <article class="product" tabindex="0" data-category="${product.category}" data-price="${formattedPrice}">
        <a href="#" tabindex="-1"><img class="product__img" src="${product.image}" alt="${truncatedTitle}"/></a>
        <div class="product__data">
          <p class="product__category">${product.category}</p>
          <a href="#" tabindex="-1"><h3 class="product__name" title="${product.title}">${truncatedTitle}</h3></a>
          <p class="product__price">$${formattedPrice}</p>
          <button class="btn btn--primary product__btn" tabindex="-1" title="See Details - ${truncatedTitle}" data-image="${product.image}" data-description="${product.description}">See Details</button>
        </div>
      </article>
    `;
    productsContainer.insertAdjacentHTML('beforeend', html);
    productsContainer.style.opacity = 1;
  });
  // end load-in spinner once products are loaded
  document.querySelector('body').classList.remove('loading');
}

function createDisplayCategories(products) {
  const categories = products.map(product => product.category);
  const categoriesUnique = new Set(categories);
  categoriesUnique.forEach(category => {
    const html = `
      <li class="shop__category">
        <button class="btn btn--filter" data-filter="${category}">${category}</button>
      </li>
    `;
    shopCategories.insertAdjacentHTML('beforeend', html);
    shopNav.style.opacity = 1;
  });
}

function createFilters() {
  const filterBtns = document.querySelectorAll('.btn--filter');
  filterBtns.forEach(btn =>
    btn.addEventListener('click', function () {
      document.querySelector('.btn--primary').classList.remove('btn--primary');
      this.classList.add('btn--primary');
      const filter = this.getAttribute('data-filter');
      let toShow, toHide;
      if (filter !== 'all') {
        toShow = document.querySelectorAll(
          `.product[data-category='${filter}']`
        );
        toHide = document.querySelectorAll(
          `.product:not([data-category='${filter}'])`
        );
      } else {
        toShow = document.querySelectorAll(`.product`);
      }
      filterUI(toShow, toHide);
    })
  );
}

function filterUI(show, hide = []) {
  hide.forEach(item => item.classList.add('hide'));
  show.forEach(item => item.classList.remove('hide'));
}

function sortProducts(sortValue) {
  const products = [...document.querySelectorAll('.product')];
  const sortedProducts =
    sortValue === 0 // 0 is low-to-high, 1 is high-to-low
      ? products.sort((a, b) => a.dataset.price - b.dataset.price)
      : products.sort((a, b) => b.dataset.price - a.dataset.price);
  sortedProducts.forEach((product, i) => {
    product.style.order = i;
    product.tabIndex = i + 1;
  });
}

// listen for sort
document.querySelector('.sort__select').addEventListener('change', function () {
  sortProducts(+this.options[this.selectedIndex].value);
});

// adds trailing zeros to price when needed
function formatPrice(price) {
  const decimal = price.split('.')[1];
  const length = decimal && decimal.length > 2 ? dec.length : 2;
  return Number(price).toFixed(length);
}

// keep product titles consistent in length
function truncTitle(title) {
  const maxChars = 50;
  return title.length > maxChars ? `${title.substring(0, maxChars)}...` : title;
}

// configure 'return to top' button
const toTopBtn = document.querySelector('.toTop');
window.onscroll = function () {
  document.body.scrollTop > 500 || document.documentElement.scrollTop > 500
    ? (toTopBtn.style.display = 'flex')
    : (toTopBtn.style.display = 'none');
};

toTopBtn.addEventListener('click', function () {
  document.body.scrollTop = 0; // safari
  document.documentElement.scrollTop = 0; // chrome, firefox, and Opera
});

// modal for product details
function initializeModal() {
  const productBtns = document.querySelectorAll('.product__btn');
  const modal = document.querySelector('.modal');
  const modalClose = document.querySelector('.modal__close');
  const modalDescription = document.querySelector('.modal__description');

  [modal, modalClose].forEach(el => {
    el.addEventListener('click', function () {
      modal.classList.remove('active');
    });
  });

  productBtns.forEach(btn =>
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      modalDescription.innerHTML = '';
      const html = `
      <img class="modal__image" src="${this.getAttribute('data-image')}">
      <p class="modal__text">${this.getAttribute('data-description')}</p>`;
      modalDescription.insertAdjacentHTML('beforeend', html);
      modal.classList.add('active');
    })
  );
}
