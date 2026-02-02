/**
 * Type declarations for Vanduo framework global objects
 */

declare global {
  interface Window {
    VanduoNavbar: {
      init: () => void;
      initNavbar: (navbar: HTMLElement) => void;
      toggleMenu: (navbar: HTMLElement, toggle: HTMLElement, menu: HTMLElement, overlay: HTMLElement | null) => void;
      openMenu: (navbar: HTMLElement, toggle: HTMLElement, menu: HTMLElement, overlay: HTMLElement | null) => void;
      closeMenu: (navbar: HTMLElement, toggle: HTMLElement, menu: HTMLElement, overlay: HTMLElement | null) => void;
      destroy: (navbar: HTMLElement) => void;
      destroyAll: () => void;
      getBreakpoint: () => number;
      createOverlay: (navbar: HTMLElement) => HTMLElement;
    };

    VanduoPagination: {
      init: () => void;
      initPagination: (pagination: HTMLElement) => void;
      render: (pagination: HTMLElement, options: { totalPages: number; currentPage: number; maxVisible: number }) => void;
      goToPage: (pagination: HTMLElement, page: number) => void;
      prevPage: (pagination: HTMLElement) => void;
      nextPage: (pagination: HTMLElement) => void;
      update: (pagination: HTMLElement | string, options: { totalPages?: number; currentPage?: number; maxVisible?: number }) => void;
      calculatePages: (currentPage: number, totalPages: number, maxVisible: number) => (number | string)[];
      destroy: (pagination: HTMLElement) => void;
      destroyAll: () => void;
    };

    VanduoSidenav: {
      init: () => void;
      initSidenav: (sidenav: HTMLElement) => void;
      open: (sidenav: HTMLElement | string) => void;
      close: (sidenav: HTMLElement | string) => void;
      toggle: (sidenav: HTMLElement | string) => void;
      handlePushVariant: (sidenav: HTMLElement, isOpen: boolean) => void;
      handleResize: () => void;
      createOverlay: (sidenav: HTMLElement) => HTMLElement;
      destroy: (sidenav: HTMLElement) => void;
      destroyAll: () => void;
    };

    CodeSnippet: {
      init: () => void;
      initSnippet: (snippet: HTMLElement) => void;
      expand: (snippet: HTMLElement | string) => void;
      collapse: (snippet: HTMLElement | string) => void;
      showLang: (snippet: HTMLElement | string, lang: string) => void;
      copyCode: (snippet: HTMLElement, copyBtn: HTMLElement) => Promise<void>;
      highlightHtml: (html: string) => string;
      highlightCss: (css: string) => string;
      highlightJs: (js: string) => string;
    };

    FontSwitcher: {
      init: () => void;
      getPreference: () => string;
      setPreference: (fontKey: string) => void;
      applyFont: () => void;
      renderUI: () => void;
      updateUI: () => void;
      getCurrentFont: () => string;
      getFontData: (fontKey: string) => { name: string; family: string } | null;
      fonts: Record<string, { name: string; family: string }>;
    };

    Vanduo: {
      components: {
        themeSwitcher?: {
          init: () => void;
          getPreference: () => string;
          setPreference: (pref: string) => void;
          applyTheme: () => void;
          listenForSystemChanges: () => void;
          renderUI: () => void;
          updateUI: () => void;
        };
        select?: {
          destroy: (select: HTMLSelectElement) => void;
        };
      };
      register: (name: string, component: unknown) => void;
    };
  }
}

export {};
