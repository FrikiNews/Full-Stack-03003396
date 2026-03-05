import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const fallbackImage = 'https://placehold.co/320x220/e7f1f6/2f5f78?text=Medicamento';

function MedicineTable({
  medicines,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCart,
  promotionsById = {},
  scrollable = false,
  gridRef,
  emptyTitle = 'Sin productos',
  emptyMessage = 'No hay medicamentos para mostrar.'
}) {
  const internalGridRef = useRef(null);
  const hintTimeoutRef = useRef(null);
  const wheelLockRef = useRef(false);
  const wheelUnlockTimeoutRef = useRef(null);
  const [overscrollActive, setOverscrollActive] = useState(false);

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      if (wheelUnlockTimeoutRef.current) {
        clearTimeout(wheelUnlockTimeoutRef.current);
      }
    };
  }, []);

  function setGridElement(element) {
    internalGridRef.current = element;
    if (gridRef && typeof gridRef === 'object') {
      gridRef.current = element;
    }
  }

  function triggerOverscrollHint() {
    if (!scrollable) return;
    setOverscrollActive((previous) => (previous ? previous : true));

    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }

    hintTimeoutRef.current = setTimeout(() => {
      setOverscrollActive(false);
    }, 260);
  }

  function handleWheel(event) {
    if (!scrollable || !internalGridRef.current) return;

    const element = internalGridRef.current;
    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (dominantDelta === 0) return;

    if (wheelLockRef.current) {
      event.preventDefault();
      return;
    }

    const sampleCard = element.querySelector('.product-card:not(.scroll-hint-card)');
    const cardWidth = sampleCard ? sampleCard.getBoundingClientRect().width : 225;
    const computedStyles = window.getComputedStyle(element);
    const gapValue = parseFloat(computedStyles.columnGap || computedStyles.gap || '0') || 0;
    const jumpDistance = (cardWidth + gapValue) * 2;
    const direction = dominantDelta > 0 ? 1 : -1;

    element.scrollBy({ left: jumpDistance * direction, behavior: 'smooth' });
    event.preventDefault();

    wheelLockRef.current = true;
    wheelUnlockTimeoutRef.current = setTimeout(() => {
      wheelLockRef.current = false;
    }, 180);

    const maxScrollLeft = element.scrollWidth - element.clientWidth - 1;
    const tryingToScrollRight = direction > 0;

    if (element.scrollLeft >= maxScrollLeft && tryingToScrollRight) {
      triggerOverscrollHint();
    }
  }

  function handleTouchMove() {
    if (!scrollable || !internalGridRef.current) return;

    const element = internalGridRef.current;
    const maxScrollLeft = element.scrollWidth - element.clientWidth - 1;
    if (element.scrollLeft >= maxScrollLeft) {
      triggerOverscrollHint();
    }
  }

  function handleKeyDown(event) {
    if (!scrollable || !internalGridRef.current) return;

    const element = internalGridRef.current;
    const sampleCard = element.querySelector('.product-card:not(.scroll-hint-card)');
    const cardWidth = sampleCard ? sampleCard.getBoundingClientRect().width : 225;
    const computedStyles = window.getComputedStyle(element);
    const gapValue = parseFloat(computedStyles.columnGap || computedStyles.gap || '0') || 0;
    const jumpDistance = (cardWidth + gapValue) * 2;

    if (event.key === 'ArrowRight') {
      element.scrollBy({ left: jumpDistance, behavior: 'smooth' });
      event.preventDefault();
    }

    if (event.key === 'ArrowLeft') {
      element.scrollBy({ left: -jumpDistance, behavior: 'smooth' });
      event.preventDefault();
    }
  }

  return (
    <div className={`${scrollable ? 'product-grid-shell' : ''} ${overscrollActive ? 'overscroll-active' : ''}`}>
      <div
        className={`product-grid ${scrollable ? 'product-grid-scroll' : ''}`}
        ref={setGridElement}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onKeyDown={handleKeyDown}
        tabIndex={scrollable ? 0 : -1}
        aria-label={scrollable ? 'Carrusel de productos' : undefined}
      >
        {scrollable && <article className="product-card scroll-hint-card scroll-hint-card-start" aria-hidden="true" />}

        {medicines.map((medicine) => {
          const promotion = promotionsById[medicine._id];

          return (
          <article className="product-card" key={medicine._id}>
            <button
              className="card-plus-btn"
              onClick={() => onAddToCart(medicine)}
              aria-label={`Agregar ${medicine.name} al carrito`}
            >
              +
            </button>

            <span className={`product-badge ${promotion ? 'product-badge-offer' : ''}`}>
              {promotion ? `-${promotion.discountPercent}%` : 'Farmacia'}
            </span>

            <Link className="product-image-link" to={`/medicines/${medicine._id}`}>
              <div className="product-image" aria-hidden="true">
                <img
                  src={medicine.imageUrl || fallbackImage}
                  alt={medicine.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />
              </div>
            </Link>

            <h4 className="product-name">{medicine.name}</h4>
            <p className="product-category">{medicine.category}</p>
            {promotion ? (
              <div className="product-price-stack">
                <p className="product-price-original">${promotion.originalPrice.toFixed(2)}</p>
                <p className="product-price-discount">Descuento {promotion.discountPercent}%</p>
                <p className="product-price">${promotion.discountedPrice.toFixed(2)}</p>
              </div>
            ) : (
              <p className="product-price">${medicine.price.toFixed(2)}</p>
            )}
            <p className="product-stock">Stock: {medicine.stock}</p>

            <div className="product-actions">
              {isAdmin && (
                <>
                  <button className="secondary" onClick={() => onEdit(medicine)}>
                    Editar
                  </button>
                  <button className="danger" onClick={() => onDelete(medicine._id)}>
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </article>
          );
        })}

        {scrollable && (
          <article className="product-card scroll-hint-card" aria-hidden="true">
            <div className="scroll-hint-inner">
              <span className="scroll-hint-arrow">→</span>
              <p className="scroll-hint-text">Desliza para ver más</p>
            </div>
          </article>
        )}
      </div>
      {medicines.length === 0 && (
        <div className="empty-state" role="status" aria-live="polite">
          <h4>{emptyTitle}</h4>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

export default MedicineTable;
