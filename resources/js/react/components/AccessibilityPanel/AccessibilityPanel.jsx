import { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../i18n/useTranslation';
import './AccessibilityPanel.css';

/**
 * AccessibilityPanel
 * 
 * Componente de panel flotante de accesibilidad e idioma.
 * 
 * Características:
 * - Botón flotante fijo en esquina inferior derecha
 * - Panel lateral deslizable (slide-in desde la derecha)
 * - Controles de accesibilidad (tamaño texto, contraste, etc.)
 * - Selector de idioma
 * - Accesible con teclado (Escape para cerrar)
 * - Manejo de focus para accesibilidad
 * - ARIA labels y roles
 */
const AccessibilityPanel = () => {
  // Estados y hooks
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  
  // Contextos
  const {
    fontSize,
    highContrast,
    underlineLinks,
    grayscale,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleUnderlineLinks,
    toggleGrayscale,
    resetSettings
  } = useAccessibility();
  
  const { language, changeLanguage } = useLanguage();

  // Referencias para manejo de focus
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const firstFocusableRef = useRef(null);

  /**
   * Abrir el panel
   */
  const openPanel = () => {
    setIsOpen(true);
  };

  /**
   * Cerrar el panel
   */
  const closePanel = () => {
    setIsOpen(false);
    // Devolver el focus al botón flotante al cerrar
    buttonRef.current?.focus();
  };

  /**
   * Alternar panel (abrir/cerrar)
   */
  const togglePanel = () => {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  };

  /**
   * Efecto: Cerrar panel con tecla Escape
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closePanel();
      }
    };

    // Agregar listener solo si el panel está abierto
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    // Cleanup: remover listener
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  /**
   * Efecto: Mover focus al panel cuando se abre
   */
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  /**
   * Efecto: Trap focus dentro del panel cuando está abierto
   * (opcional, mejora la accesibilidad)
   */
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;

      const focusableElements = panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Si Shift + Tab en el primer elemento, mover al último
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } 
      // Si Tab en el último elemento, mover al primero
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  /**
   * Renderizar badge de estado (activo/inactivo)
   */
  const renderStatusBadge = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? t('active') : t('inactive')}
      </span>
    );
  };

  /**
   * Obtener label del tamaño de fuente actual
   */
  const getFontSizeLabel = () => {
    if (fontSize === 'normal') return t('fontSizeNormal');
    if (fontSize === 'large') return t('fontSizeLarge');
    if (fontSize === 'extra-large') return t('fontSizeExtraLarge');
    return fontSize;
  };

  return (
    <>
      {/* Botón flotante fijo en esquina inferior derecha */}
      <button
        ref={buttonRef}
        className="accessibility-floating-button"
        onClick={togglePanel}
        aria-label={t('openAccessibilityPanel')}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        title={t('accessibility')}
      >
        {/* Icono de accesibilidad (persona con círculo) */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="8" r="2" />
          <path d="M12 14v6M8 18l4-4 4 4" />
        </svg>
      </button>

      {/* Overlay (fondo oscuro) cuando el panel está abierto */}
      {isOpen && (
        <div 
          className="accessibility-overlay"
          onClick={closePanel}
          aria-hidden="true"
        />
      )}

      {/* Panel lateral */}
      <aside
        ref={panelRef}
        id="accessibility-panel"
        className={`accessibility-panel ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-panel-title"
      >
        {/* Encabezado del panel */}
        <header className="panel-header">
          <h2 id="accessibility-panel-title" className="panel-title">
            {t('accessibilityOptions')}
          </h2>
          <button
            className="panel-close-button"
            onClick={closePanel}
            aria-label={t('closePanel')}
            title={t('closePanel')}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Contenido del panel */}
        <div className="panel-content">
          
          {/* Sección: Tamaño de texto */}
          <section className="panel-section">
            <h3 className="section-title">{t('fontSizeDescription')}</h3>
            <div className="font-size-controls">
              <div className="font-size-display">
                <span className="current-size-label">{getFontSizeLabel()}</span>
              </div>
              <div className="font-size-buttons">
                <button
                  ref={firstFocusableRef}
                  className="control-button"
                  onClick={decreaseFontSize}
                  disabled={fontSize === 'normal'}
                  aria-label={t('decreaseFontSize')}
                  title={t('decreaseFontSize')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <text x="2" y="20" fontSize="20" fontWeight="bold">A-</text>
                  </svg>
                  <span>{t('decreaseFontSize')}</span>
                </button>
                <button
                  className="control-button"
                  onClick={increaseFontSize}
                  disabled={fontSize === 'extra-large'}
                  aria-label={t('increaseFontSize')}
                  title={t('increaseFontSize')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <text x="2" y="20" fontSize="20" fontWeight="bold">A+</text>
                  </svg>
                  <span>{t('increaseFontSize')}</span>
                </button>
              </div>
            </div>
          </section>

          <hr className="panel-divider" />

          {/* Sección: Alto contraste */}
          <section className="panel-section">
            <button
              className={`toggle-option ${highContrast ? 'active' : ''}`}
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              title={t('highContrastDescription')}
            >
              <div className="option-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v20" />
                </svg>
                <span className="option-label">{t('highContrast')}</span>
              </div>
              {renderStatusBadge(highContrast)}
            </button>
          </section>

          <hr className="panel-divider" />

          {/* Sección: Subrayar enlaces */}
          <section className="panel-section">
            <button
              className={`toggle-option ${underlineLinks ? 'active' : ''}`}
              onClick={toggleUnderlineLinks}
              aria-pressed={underlineLinks}
              title={t('underlineLinksDescription')}
            >
              <div className="option-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
                  <line x1="4" y1="21" x2="20" y2="21" />
                </svg>
                <span className="option-label">{t('underlineLinks')}</span>
              </div>
              {renderStatusBadge(underlineLinks)}
            </button>
          </section>

          <hr className="panel-divider" />

          {/* Sección: Escala de grises */}
          <section className="panel-section">
            <button
              className={`toggle-option ${grayscale ? 'active' : ''}`}
              onClick={toggleGrayscale}
              aria-pressed={grayscale}
              title={t('grayscaleDescription')}
            >
              <div className="option-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <span className="option-label">{t('grayscale')}</span>
              </div>
              {renderStatusBadge(grayscale)}
            </button>
          </section>

          <hr className="panel-divider" />

          {/* Sección: Selector de idioma */}
          <section className="panel-section">
            <h3 className="section-title">{t('language')}</h3>
            <div className="language-selector">
              <button
                className={`language-button ${language === 'es' ? 'active' : ''}`}
                onClick={() => changeLanguage('es')}
                aria-pressed={language === 'es'}
                aria-label={t('spanish')}
              >
                🇪🇸 {t('spanish')}
              </button>
              <button
                className={`language-button ${language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
                aria-pressed={language === 'en'}
                aria-label={t('english')}
              >
                🇬🇧 {t('english')}
              </button>
            </div>
          </section>

          <hr className="panel-divider" />

          {/* Botón: Restablecer configuración */}
          <section className="panel-section">
            <button
              className="reset-button"
              onClick={resetSettings}
              aria-label={t('resetSettings')}
              title={t('resetDescription')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              <span>{t('resetSettings')}</span>
            </button>
          </section>

        </div>
      </aside>
    </>
  );
};

export default AccessibilityPanel;
