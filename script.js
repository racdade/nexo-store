(() => {
  'use strict';

  const eur = (n) => 'S/ ' + n.toFixed(2);

  const state = {
    route: 'home',
    size: 'M',
    pay: 'Tarjeta',
    faq: null,
    cart: [
      { name: 'Heavy Hoodie Archive', price: 79.9, size: 'M', qty: 1 },
      { name: 'Cap Logo Mono', price: 24.9, size: 'Única', qty: 1 }
    ]
  };

  const HOODIE = { name: 'Heavy Hoodie Archive', price: 79.9 };

  function addToCart(name, price, size) {
    const i = state.cart.findIndex((l) => l.name === name && l.size === size);
    if (i > -1) {
      state.cart[i].qty += 1;
    } else {
      state.cart.push({ name, price, size, qty: 1 });
    }
  }

  function bumpQty(i, delta) {
    const line = state.cart[i];
    if (!line) return;
    line.qty += delta;
    if (line.qty < 1) state.cart.splice(i, 1);
  }

  function removeLine(i) {
    state.cart.splice(i, 1);
  }

  function totals() {
    const sub = state.cart.reduce((a, l) => a + l.price * l.qty, 0);
    const disc = sub * 0.2;
    const ship = sub >= 60 || sub === 0 ? 0 : 4.9;
    const total = Math.max(0, sub - disc + ship);
    return { sub, disc, ship, total };
  }

  function goto(route) {
    state.route = route;
    render();
    window.scrollTo(0, 0);
  }

  // ---------- Countdown (ends at 23:59:59 local time) ----------
  function updateCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let d = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
    const pad = (n) => String(n).padStart(2, '0');
    el.textContent = pad(Math.floor(d / 3600)) + ':' + pad(Math.floor(d / 60) % 60) + ':' + pad(d % 60);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---------- Views ----------
  function showView(route) {
    document.querySelectorAll('.view').forEach((el) => {
      el.hidden = el.getAttribute('data-view') !== route;
    });
  }

  function renderCartCount() {
    const count = state.cart.reduce((a, l) => a + l.qty, 0);
    const el = document.getElementById('cart-count');
    if (el) el.textContent = String(count);
  }

  function renderCartPage() {
    const wrap = document.getElementById('cart-items');
    if (!wrap) return;
    wrap.innerHTML = '';

    if (state.cart.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'cart-empty';
      empty.innerHTML = `
        <div class="cart-empty-title">Tu carrito está vacío</div>
        <button class="cart-empty-btn" type="button" data-nav="home">Ver colección</button>
      `;
      wrap.appendChild(empty);
    } else {
      state.cart.forEach((line, i) => {
        const row = document.createElement('div');
        row.className = 'cart-line';
        row.innerHTML = `
          <div class="cart-thumb"></div>
          <div>
            <div class="cart-name">${line.name}</div>
            <div class="cart-size">Talla ${line.size}</div>
            <div class="qty-control">
              <button class="qty-btn" type="button" data-dec="${i}">–</button>
              <span class="qty-value">${line.qty}</span>
              <button class="qty-btn" type="button" data-inc="${i}">+</button>
              <button class="remove-btn" type="button" data-del="${i}">Quitar</button>
            </div>
          </div>
          <div class="cart-line-total">${eur(line.price * line.qty)}</div>
        `;
        wrap.appendChild(row);
      });
    }

    const t = totals();
    setText('cart-subtotal', eur(t.sub));
    setText('cart-shipping', t.ship === 0 ? 'Gratis' : eur(t.ship));
    setText('cart-discount', '– ' + eur(t.disc));
    setText('cart-total', eur(t.total));
  }

  function renderCheckoutPage() {
    const wrap = document.getElementById('order-lines');
    if (!wrap) return;
    wrap.innerHTML = '';
    state.cart.forEach((line) => {
      const row = document.createElement('div');
      row.className = 'order-line';
      row.innerHTML = `<span>${line.qty} × ${line.name}</span><span>${eur(line.price * line.qty)}</span>`;
      wrap.appendChild(row);
    });

    const t = totals();
    setText('checkout-shipping', t.ship === 0 ? 'Gratis' : eur(t.ship));
    setText('checkout-discount', '– ' + eur(t.disc));
    setText('checkout-total', eur(t.total));
    setText('place-order-total', eur(t.total));
    setText('pay-selected', state.pay);

    document.querySelectorAll('.pay-btn').forEach((btn) => {
      btn.classList.toggle('pay-btn-active', btn.getAttribute('data-pay') === state.pay);
    });
  }

  function renderProductPage() {
    setText('size-selected', state.size);
    document.querySelectorAll('.size-btn').forEach((btn) => {
      btn.classList.toggle('size-btn-active', btn.getAttribute('data-size') === state.size);
    });
    const addBtn = document.getElementById('add-from-product');
    if (addBtn) addBtn.textContent = 'Añadir al carrito · ' + eur(HOODIE.price);
  }

  function renderFaq() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const idx = parseInt(item.getAttribute('data-faq'), 10);
      const open = state.faq === idx;
      item.classList.toggle('open', open);
      const mark = item.querySelector('.faq-toggle');
      if (mark) mark.textContent = open ? '–' : '+';
    });
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function render() {
    showView(state.route);
    renderCartCount();
    if (state.route === 'cart') renderCartPage();
    if (state.route === 'checkout') renderCheckoutPage();
    if (state.route === 'product') renderProductPage();
    renderFaq();
  }

  // ---------- Event delegation ----------
  document.addEventListener('click', (e) => {
    const navEl = e.target.closest('[data-nav]');
    if (navEl) {
      goto(navEl.getAttribute('data-nav'));
      return;
    }

    const addEl = e.target.closest('[data-add]');
    if (addEl) {
      e.stopPropagation();
      addToCart(addEl.getAttribute('data-add'), parseFloat(addEl.getAttribute('data-price')), 'M');
      goto('cart');
      return;
    }

    const sizeEl = e.target.closest('[data-size]');
    if (sizeEl) {
      state.size = sizeEl.getAttribute('data-size');
      renderProductPage();
      return;
    }

    const payEl = e.target.closest('[data-pay]');
    if (payEl) {
      state.pay = payEl.getAttribute('data-pay');
      renderCheckoutPage();
      return;
    }

    const faqEl = e.target.closest('[data-faq]');
    if (faqEl) {
      const idx = parseInt(faqEl.getAttribute('data-faq'), 10);
      state.faq = state.faq === idx ? null : idx;
      renderFaq();
      return;
    }

    const incEl = e.target.closest('[data-inc]');
    if (incEl) {
      bumpQty(parseInt(incEl.getAttribute('data-inc'), 10), 1);
      renderCartPage();
      renderCartCount();
      return;
    }

    const decEl = e.target.closest('[data-dec]');
    if (decEl) {
      bumpQty(parseInt(decEl.getAttribute('data-dec'), 10), -1);
      renderCartPage();
      renderCartCount();
      return;
    }

    const delEl = e.target.closest('[data-del]');
    if (delEl) {
      removeLine(parseInt(delEl.getAttribute('data-del'), 10));
      renderCartPage();
      renderCartCount();
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const navEl = e.target.closest('[data-nav][role="button"]');
    if (!navEl) return;
    e.preventDefault();
    goto(navEl.getAttribute('data-nav'));
  });

  document.getElementById('add-from-product').addEventListener('click', () => {
    addToCart(HOODIE.name, HOODIE.price, state.size);
    goto('cart');
  });

  document.getElementById('buy-now').addEventListener('click', () => {
    addToCart(HOODIE.name, HOODIE.price, state.size);
    goto('checkout');
  });

  document.getElementById('place-order').addEventListener('click', () => {
    goto('done');
  });

  document.getElementById('newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    alert('¡Gracias! Te hemos enviado el código -20% a ' + input.value);
    e.target.reset();
  });

  render();
})();
