import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import MedicineTable from '../components/MedicineTable';
import MedicineForm from '../components/MedicineForm';

const categoryDefaults = [
  'Analgésico',
  'Antiinflamatorio',
  'Antibiótico',
  'Antialérgico',
  'Antihistamínico',
  'Respiratorio',
  'Gastrointestinal',
  'Cardiovascular',
  'Vitaminas',
  'Suplemento',
  'Dermatológico',
  'Antifúngico',
  'Antiparasitario'
];

const searchExamples = [
  'Ibuprofeno',
  'Paracetamol',
  'Amoxicilina',
  'Omeprazol',
  'Loratadina',
  'Vitamina C'
];

function SearchIcon({ className = 'ui-icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className = 'ui-icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20C4.9 16.7 7.9 15 12 15C16.1 15 19.1 16.7 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon({ className = 'ui-icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 4H5L7 16H18L21 8H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ChevronDownIcon({ className = 'ui-icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardPage({ user, onLogout }) {
  const PAGE_LIMIT = 60;
  const SECTION_MAX_PRODUCTS = 20;
  const PROMOTION_POOL_SIZE = 20;
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartNotice, setCartNotice] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardholder: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [error, setError] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const cartNoticeTimeoutRef = useRef(null);
  const editorFormRef = useRef(null);
  const bestSellersRef = useRef(null);
  const recommendedRef = useRef(null);
  const offersRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const accountTypeLabel = isAdmin ? 'Admin' : 'Consumidor';

  async function fetchMedicines(nextPage = page, nextSearch = appliedSearch, nextCategory = category) {
    try {
      setError('');
      const response = await api.listMedicines({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: nextSearch,
        category: nextCategory
      });
      setMedicines(response.data);
      setPagination(response.pagination);
    } catch (fetchError) {
      setError(fetchError.message);
    }
  }

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    return () => {
      if (cartNoticeTimeoutRef.current) {
        clearTimeout(cartNoticeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [cartOpen]);

  useEffect(() => {
    function centerCarousel(ref) {
      if (!ref.current) return;
      const container = ref.current;
      const centeredLeft = Math.max((container.scrollWidth - container.clientWidth) / 2, 0);
      container.scrollLeft = centeredLeft;
    }

    const rafId = requestAnimationFrame(() => {
      centerCarousel(bestSellersRef);
      centerCarousel(recommendedRef);
      centerCarousel(offersRef);
    });

    function handleResize() {
      centerCarousel(bestSellersRef);
      centerCarousel(recommendedRef);
      centerCarousel(offersRef);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [medicines, sortBy, category]);

  useEffect(() => {
    if (selectedMedicine && inventoryOpen && editorFormRef.current) {
      const headerOffset = 96;
      const formTop = editorFormRef.current.getBoundingClientRect().top + window.scrollY;
      const targetTop = Math.max(formTop - headerOffset, 0);
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  }, [selectedMedicine, inventoryOpen]);

  async function handleSearch(event) {
    event.preventDefault();
    const submittedSearch = search.trim();
    setAppliedSearch(submittedSearch);
    setPage(1);
    await fetchMedicines(1, submittedSearch, category);
    setSearch('');
    setSearchFocused(false);
  }

  async function handleSubmitMedicine(payload) {
    if (selectedMedicine) {
      await api.updateMedicine(selectedMedicine._id, payload);
      setSelectedMedicine(null);
    } else {
      await api.createMedicine(payload);
    }

    await fetchMedicines(page, appliedSearch, category);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('¿Eliminar medicamento?');
    if (!confirmed) return;

    await api.deleteMedicine(id);
    await fetchMedicines(page, appliedSearch, category);
  }

  const sortedMedicines = useMemo(() => {
    return [...medicines].sort((firstMedicine, secondMedicine) => {
      if (sortBy === 'price') {
        return firstMedicine.price - secondMedicine.price;
      }

      if (sortBy === 'stock') {
        return secondMedicine.stock - firstMedicine.stock;
      }

      return firstMedicine.name.localeCompare(secondMedicine.name);
    });
  }, [medicines, sortBy]);

  function handleToggleInventory() {
    if (!isAdmin) return;
    setInventoryOpen((previous) => {
      const nextValue = !previous;
      if (!nextValue) {
        setSelectedMedicine(null);
      }
      return nextValue;
    });
    setAccountMenuOpen(false);
  }

  function handleAddToCart(medicine) {
    const promotion = promotionsById[medicine._id];
    const unitPrice = promotion ? promotion.discountedPrice : medicine.price;

    setCartItems((previousItems) => {
      const existingItem = previousItems.find((item) => item.id === medicine._id);

      if (existingItem) {
        return previousItems.map((item) =>
          item.id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...previousItems,
        {
          id: medicine._id,
          name: medicine.name,
          price: unitPrice,
          quantity: 1
        }
      ];
    });

    setCartNotice(`Se agregó ${medicine.name} al carrito`);
    if (cartNoticeTimeoutRef.current) {
      clearTimeout(cartNoticeTimeoutRef.current);
    }

    cartNoticeTimeoutRef.current = setTimeout(() => {
      setCartNotice('');
    }, 1800);
  }

  function handlePaymentChange(event) {
    const { name, value } = event.target;
    if (paymentError) {
      setPaymentError('');
    }

    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      const grouped = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      setPaymentData((previous) => ({ ...previous, cardNumber: grouped }));
      return;
    }

    if (name === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      setPaymentData((previous) => ({ ...previous, expiry: formatted }));
      return;
    }

    if (name === 'cvv') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      setPaymentData((previous) => ({ ...previous, cvv: digits }));
      return;
    }

    setPaymentData((previous) => ({ ...previous, [name]: value }));
  }

  function resetPaymentForm() {
    setPaymentData({
      cardholder: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    });
  }

  function closeCartDrawer() {
    setCartOpen(false);
    setPaymentError('');
  }

  function validatePaymentData() {
    const cardNumberDigits = paymentData.cardNumber.replace(/\s/g, '');
    const cvvDigits = paymentData.cvv.replace(/\s/g, '');
    const expiryValue = paymentData.expiry.trim();

    if (!paymentData.cardholder.trim() || !cardNumberDigits || !paymentData.expiry.trim() || !cvvDigits) {
      return 'Completa todos los campos de pago.';
    }

    if (!/^\d{16}$/.test(cardNumberDigits)) {
      return 'La tarjeta debe tener 16 dígitos.';
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryValue)) {
      return 'La fecha debe tener formato MM/AA.';
    }

    const [monthText, yearText] = expiryValue.split('/');
    const month = Number(monthText);
    const year = Number(yearText);

    if (month < 1 || month > 12) {
      return 'El mes de vencimiento debe estar entre 01 y 12.';
    }

    const today = new Date();
    const currentYear = today.getFullYear() % 100;
    const currentMonth = today.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'La tarjeta está vencida. Revisa la fecha.';
    }

    if (!/^\d{3,4}$/.test(cvvDigits)) {
      return 'El CVV debe tener 3 o 4 dígitos.';
    }

    return '';
  }

  function handleCheckout(event) {
    event.preventDefault();

    if (cartItems.length === 0) {
      setPaymentError('No hay productos en el carrito.');
      return;
    }

    const validationMessage = validatePaymentData();
    if (validationMessage) {
      setPaymentError(validationMessage);
      return;
    }

    setPaymentError('');
    setCartItems([]);
    resetPaymentForm();
    closeCartDrawer();
    setCartNotice('Pago realizado con éxito. ¡Gracias por tu compra!');

    if (cartNoticeTimeoutRef.current) {
      clearTimeout(cartNoticeTimeoutRef.current);
    }

    cartNoticeTimeoutRef.current = setTimeout(() => {
      setCartNotice('');
    }, 2200);
  }

  const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);
  const cartSubtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const { promotedMedicinesPool, promotionsById, promotedIds } = useMemo(() => {
    const promotionCandidates = [...sortedMedicines].sort((firstMedicine, secondMedicine) =>
      firstMedicine.name.localeCompare(secondMedicine.name)
    );
    const promotedPool = promotionCandidates.slice(0, PROMOTION_POOL_SIZE);
    const promotionsMap = promotedPool.reduce((accumulator, medicine) => {
      const seed = medicine._id
        .toString()
        .split('')
        .reduce((total, character) => total + character.charCodeAt(0), 0);
      const discountOptions = [10, 15, 20, 25, 30, 35];
      const discountPercent = discountOptions[seed % discountOptions.length];
      const discountedPrice = Number((medicine.price * (1 - discountPercent / 100)).toFixed(2));

      accumulator[medicine._id] = {
        discountPercent,
        originalPrice: medicine.price,
        discountedPrice
      };
      return accumulator;
    }, {});

    return {
      promotedMedicinesPool: promotedPool,
      promotionsById: promotionsMap,
      promotedIds: new Set(promotedPool.map((medicine) => medicine._id))
    };
  }, [PROMOTION_POOL_SIZE, sortedMedicines]);

  const { bestSellers, recommendedMedicines, offersMedicines } = useMemo(() => {
    const bestSellersPool = sortedMedicines
      .filter((medicine) => !promotedIds.has(medicine._id))
      .sort((firstMedicine, secondMedicine) => firstMedicine.stock - secondMedicine.stock);
    const selectedBestSellers = bestSellersPool.slice(0, SECTION_MAX_PRODUCTS);

    const bestSellerIds = new Set(selectedBestSellers.map((medicine) => medicine._id));
    const recommendedPool = sortedMedicines.filter(
      (medicine) => !promotedIds.has(medicine._id) && !bestSellerIds.has(medicine._id)
    );

    return {
      bestSellers: selectedBestSellers,
      recommendedMedicines: recommendedPool.slice(0, SECTION_MAX_PRODUCTS),
      offersMedicines: promotedMedicinesPool.slice(0, SECTION_MAX_PRODUCTS)
    };
  }, [SECTION_MAX_PRODUCTS, promotedIds, promotedMedicinesPool, sortedMedicines]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set([...categoryDefaults, ...medicines.map((medicine) => medicine.category).filter(Boolean)]))
      .sort((firstCategory, secondCategory) => firstCategory.localeCompare(secondCategory));
  }, [medicines]);

  const medicineNameSuggestions = useMemo(() => {
    return Array.from(
      new Set(
        medicines
          .map((medicine) => medicine.name)
          .filter(Boolean)
          .map((name) => name.replace(/\s\d+mg.*$/i, '').trim())
      )
    );
  }, [medicines]);

  const allSuggestions = useMemo(() => {
    return Array.from(new Set([...searchExamples, ...medicineNameSuggestions]));
  }, [medicineNameSuggestions]);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredSuggestions = allSuggestions
    .filter((item) => item.toLowerCase().includes(normalizedSearch))
    .slice(0, 8);
  const visibleSuggestions = normalizedSearch ? filteredSuggestions : allSuggestions.slice(0, 8);

  async function handleSuggestionSelect(suggestion) {
    setSearch(suggestion);
    setAppliedSearch(suggestion);
    setPage(1);
    await fetchMedicines(1, suggestion, category);
    setSearch('');
    setSearchFocused(false);
  }

  async function handleCategoryChange(event) {
    const nextCategory = event.target.value;
    setCategory(nextCategory);
    setSearch('');
    setAppliedSearch('');
    setPage(1);
    await fetchMedicines(1, '', nextCategory);
  }

  async function handleGoHomeCatalog() {
    setSearch('');
    setAppliedSearch('');
    setCategory('');
    setPage(1);
    await fetchMedicines(1, '', '');
  }

  const hasActiveSearch = appliedSearch.trim().length > 0;
  const hasActiveCategory = category.trim().length > 0;
  const showListMode = hasActiveSearch || hasActiveCategory || (isAdmin && inventoryOpen);
  const listModePromotions = showListMode ? {} : promotionsById;

  return (
    <div className="store-page">
      <header className="store-topcard">
        <div className="topcard-content">
          <button type="button" className="topcard-brand topcard-brand-btn" onClick={handleGoHomeCatalog}>
            Live in Plants
          </button>

          <form className="top-search" onSubmit={handleSearch}>
            <div className="top-search-wrap">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                placeholder="Busca un medicamento (ej. Ibuprofeno)"
                aria-label="Buscar medicamento"
              />
              {searchFocused && visibleSuggestions.length > 0 && (
                <div className="search-suggestions" role="listbox" aria-label="Sugerencias de búsqueda">
                  {visibleSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="search-suggestion-item"
                      onMouseDown={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <button type="submit" className="search-icon-btn" aria-label="Buscar">
                <SearchIcon className="ui-icon" />
              </button>
            </div>
          </form>

          <div className="top-actions">
            <div className="account-wrapper">
              <button
                className="account-btn"
                onClick={() => setAccountMenuOpen((previous) => !previous)}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-controls="account-menu"
              >
                <span className="account-btn-content">
                  <UserIcon className="ui-icon" />
                  <span>{accountTypeLabel}</span>
                  <ChevronDownIcon className="ui-icon icon-sm" />
                </span>
              </button>
              {accountMenuOpen && (
                <div className="account-menu" id="account-menu" role="menu">
                  {isAdmin ? (
                    <button onClick={handleToggleInventory} role="menuitem">
                      {inventoryOpen ? 'Cerrar inventario' : 'Inventario'}
                    </button>
                  ) : (
                    <span className="account-note">Usuario empleado</span>
                  )}
                  <button className="danger" onClick={onLogout} role="menuitem">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {cartNotice && (
          <div className="cart-notice" role="status" aria-live="polite">
            <span className="cart-notice-icon">
              <CartIcon className="ui-icon" />
            </span>
            <div className="cart-notice-content">
              <strong className="cart-notice-title">Producto agregado</strong>
              <span className="cart-notice-text">{cartNotice}</span>
            </div>
          </div>
        )}

        <section className="card controls-row">
          <div className="control-group">
            <label htmlFor="sortBy">Ordenar por</label>
            <select id="sortBy" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name">Nombre</option>
              <option value="price">Precio</option>
              <option value="stock">Stock</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">Todas</option>
              {categoryOptions.map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </option>
              ))}
            </select>
          </div>
        </section>

        {error && (
          <p className="error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        {isAdmin && inventoryOpen && (
          <div ref={editorFormRef}>
            <MedicineForm
              onSubmit={handleSubmitMedicine}
              selectedMedicine={selectedMedicine}
              onCancel={() => setSelectedMedicine(null)}
            />
          </div>
        )}

        {showListMode ? (
          <section className="products-section">
            <div className="products-section-head">
              <h3 className="products-section-title">
                {hasActiveSearch
                  ? 'Resultados de búsqueda'
                  : hasActiveCategory
                    ? `Categoría: ${category}`
                    : 'Inventario de productos'}
              </h3>
            </div>
            <MedicineTable
              medicines={sortedMedicines}
              isAdmin={isAdmin && inventoryOpen}
              onEdit={(medicine) => setSelectedMedicine(medicine)}
              onDelete={handleDelete}
              onAddToCart={handleAddToCart}
              promotionsById={listModePromotions}
              emptyTitle={hasActiveSearch ? 'Sin resultados' : 'Sin productos'}
              emptyMessage={
                hasActiveSearch || hasActiveCategory
                  ? 'No encontramos coincidencias para los filtros seleccionados. Prueba con otra búsqueda o categoría.'
                  : 'No hay productos para mostrar en este momento.'
              }
            />
          </section>
        ) : (
          <>
            <section className="products-section">
              <div className="products-section-head">
                <h3 className="products-section-title">Más vendidos</h3>
              </div>
              <MedicineTable
                medicines={bestSellers}
                isAdmin={isAdmin && inventoryOpen}
                onEdit={(medicine) => setSelectedMedicine(medicine)}
                onDelete={handleDelete}
                onAddToCart={handleAddToCart}
                promotionsById={promotionsById}
                scrollable
                gridRef={bestSellersRef}
              />
            </section>

            <section className="products-section">
              <div className="products-section-head">
                <h3 className="products-section-title">Recomendados</h3>
              </div>
              <MedicineTable
                medicines={recommendedMedicines}
                isAdmin={isAdmin && inventoryOpen}
                onEdit={(medicine) => setSelectedMedicine(medicine)}
                onDelete={handleDelete}
                onAddToCart={handleAddToCart}
                promotionsById={promotionsById}
                scrollable
                gridRef={recommendedRef}
              />
            </section>

            <section className="products-section">
              <div className="products-section-head">
                <h3 className="products-section-title">Ofertas</h3>
              </div>
              <MedicineTable
                medicines={offersMedicines}
                isAdmin={isAdmin && inventoryOpen}
                onEdit={(medicine) => setSelectedMedicine(medicine)}
                onDelete={handleDelete}
                onAddToCart={handleAddToCart}
                promotionsById={promotionsById}
                scrollable
                gridRef={offersRef}
              />
            </section>
          </>
        )}
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div>
            <h3 className="footer-brand">Live in Plants</h3>
            <p className="footer-text">
              Cuidamos tu salud con medicamentos y productos de bienestar al mejor precio.
            </p>
            <div className="payment-row">
              <span className="payment-pill">Mercado Pago</span>
              <span className="payment-pill">VISA</span>
              <span className="payment-pill">Mastercard</span>
            </div>
          </div>

          <div>
            <h4>Sobre nosotros</h4>
            <ul>
              <li>Nosotros</li>
              <li>Políticas de devolución</li>
              <li>Aviso de privacidad</li>
              <li>Términos y condiciones</li>
            </ul>
          </div>

          <div>
            <h4>Información</h4>
            <ul>
              <li>Guías de información</li>
              <li>Preguntas frecuentes</li>
              <li>Facturación</li>
              <li>Soporte y ayuda</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Copyright © 2026 Live in Plants. Todos los derechos reservados.</span>
          <span>Síguenos: Instagram · TikTok · YouTube · LinkedIn</span>
        </div>
      </footer>

      <div className="floating-cart-wrapper">
        <button
          className="floating-cart-btn"
          onClick={() => setCartOpen((previous) => !previous)}
          aria-label="Carrito"
          aria-expanded={cartOpen}
          aria-controls="cart-drawer"
        >
          <CartIcon className="ui-icon cart-icon-lg" />
          <span className="cart-count">{cartCount}</span>
        </button>
      </div>

      {cartOpen && <button type="button" className="cart-drawer-overlay" onClick={closeCartDrawer} aria-label="Cerrar carrito" />}

      <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`} id="cart-drawer" aria-hidden={!cartOpen}>
        <div className="cart-drawer-header">
          <h3>Carrito y pago</h3>
          <button type="button" className="cart-drawer-close" onClick={closeCartDrawer}>
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          <h4>Resumen</h4>
          {cartItems.length === 0 && <p className="account-note">Tu carrito está vacío</p>}
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item-row">
              <span>{item.name}</span>
              <span>
                x{item.quantity} · ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="cart-total-row">
            <strong>Total</strong>
            <strong>${cartSubtotal.toFixed(2)}</strong>
          </div>

          <form className="cart-payment-form" onSubmit={handleCheckout}>
            <h4>Datos de pago</h4>
            <input
              name="cardholder"
              value={paymentData.cardholder}
              onChange={handlePaymentChange}
              placeholder="Nombre en la tarjeta"
              aria-label="Nombre en la tarjeta"
              autoComplete="cc-name"
              maxLength={60}
            />
            <input
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handlePaymentChange}
              placeholder="Número de tarjeta (16 dígitos)"
              aria-label="Número de tarjeta"
              autoComplete="cc-number"
              inputMode="numeric"
              maxLength={19}
            />
            <div className="cart-payment-row">
              <input
                name="expiry"
                value={paymentData.expiry}
                onChange={handlePaymentChange}
                placeholder="MM/AA"
                aria-label="Fecha de vencimiento"
                autoComplete="cc-exp"
                inputMode="numeric"
                maxLength={5}
              />
              <input
                name="cvv"
                value={paymentData.cvv}
                onChange={handlePaymentChange}
                placeholder="CVV"
                aria-label="CVV"
                autoComplete="cc-csc"
                inputMode="numeric"
                maxLength={4}
              />
            </div>

            {paymentError && (
              <p className="error cart-payment-error" role="alert" aria-live="assertive">
                {paymentError}
              </p>
            )}

            <button type="submit" disabled={cartItems.length === 0}>
              Pagar ahora
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}

export default DashboardPage;
