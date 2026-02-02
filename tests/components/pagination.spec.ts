/**
 * Pagination Component Tests
 *
 * Tests for js/components/pagination.js
 * Covers: initialization, page navigation, dynamic rendering, events
 */

import { test, expect } from '@playwright/test';

test.describe('Pagination Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/pagination.html');
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes pagination components', async ({ page }) => {
      const paginations = page.locator('.pagination[data-pagination]');
      await expect(paginations).toHaveCount(6);
    });

    test('renders pagination items', async ({ page }) => {
      const items = page.locator('#basic-pagination .pagination-item');
      // Should have prev + page numbers + next (at least 3)
      const count = await items.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('renders previous button', async ({ page }) => {
      const prevButton = page.locator('#basic-pagination .pagination-prev');
      await expect(prevButton).toHaveCount(1);
    });

    test('renders next button', async ({ page }) => {
      const nextButton = page.locator('#basic-pagination .pagination-next');
      await expect(nextButton).toHaveCount(1);
    });

    test('previous button is disabled on first page', async ({ page }) => {
      const prevButton = page.locator('#basic-pagination .pagination-prev');
      await expect(prevButton).toHaveClass(/disabled/);
    });

    test('next button is enabled when not on last page', async ({ page }) => {
      const nextButton = page.locator('#basic-pagination .pagination-next');
      await expect(nextButton).not.toHaveClass(/disabled/);
    });
  });

  test.describe('Page Navigation', () => {
    test('clicking page number changes active page', async ({ page }) => {
      const page3 = page.locator('#basic-pagination .pagination-item[data-page="3"]');
      
      await page3.click();

      await expect(page3).toHaveClass(/active/);
    });

    test('clicking next button increments page', async ({ page }) => {
      const nextButton = page.locator('#basic-pagination .pagination-next');
      
      await nextButton.click();

      const activePage = page.locator('#basic-pagination .pagination-item.active');
      await expect(activePage).toHaveAttribute('data-page', '2');
    });

    test('previous button becomes enabled after navigating forward', async ({ page }) => {
      const nextButton = page.locator('#basic-pagination .pagination-next');
      await nextButton.click();

      const prevButton = page.locator('#basic-pagination .pagination-prev');
      await expect(prevButton).not.toHaveClass(/disabled/);
    });

    test('next button is disabled on last page', async ({ page }) => {
      const lastPagePagination = page.locator('#last-page');
      const nextButton = lastPagePagination.locator('.pagination-next');
      
      await expect(nextButton).toHaveClass(/disabled/);
    });
  });

  test.describe('Ellipsis Rendering', () => {
    test('shows ellipsis for many pages', async ({ page }) => {
      const manyPagesPagination = page.locator('#many-pages');
      const ellipsis = manyPagesPagination.locator('.pagination-ellipsis');
      
      // Should have at least one ellipsis
      const count = await ellipsis.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('does not show ellipsis for few pages', async ({ page }) => {
      const fewPagesPagination = page.locator('#few-pages');
      const ellipsis = fewPagesPagination.locator('.pagination-ellipsis');
      
      await expect(ellipsis).toHaveCount(0);
    });
  });

  test.describe('Active Page State', () => {
    test('active page has correct class', async ({ page }) => {
      const activePage = page.locator('#basic-pagination .pagination-item.active');
      await expect(activePage).toHaveCount(1);
      await expect(activePage).toHaveAttribute('data-page', '1');
    });

    test('active page link has aria-label', async ({ page }) => {
      const activePage = page.locator('#basic-pagination .pagination-item.active');
      const link = activePage.locator('.pagination-link');
      
      await expect(link).toHaveAttribute('aria-label', /Page 1/i);
    });

    test('disabled item cannot be clicked', async ({ page }) => {
      const prevButton = page.locator('#basic-pagination .pagination-prev');
      
      // Clicking disabled prev should not change page
      await prevButton.click();

      const activePage = page.locator('#basic-pagination .pagination-item.active');
      await expect(activePage).toHaveAttribute('data-page', '1');
    });
  });

  test.describe('Events', () => {
    test('dispatches pagination:change event', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).pageChangeEvent = null;
        document.addEventListener('pagination:change', (e: any) => {
          (window as any).pageChangeEvent = e.detail;
        });
      });

      await page.locator('#basic-pagination .pagination-item[data-page="3"]').click();

      const eventDetail = await page.evaluate(() => (window as any).pageChangeEvent);
      expect(eventDetail).not.toBeNull();
      expect(eventDetail.page).toBe(3);
    });
  });

  test.describe('Programmatic API', () => {
    test('VanduoPagination is exposed globally', async ({ page }) => {
      const exists = await page.evaluate(() => typeof (window as any).VanduoPagination !== 'undefined');
      expect(exists).toBe(true);
    });

    test('has expected API methods', async ({ page }) => {
      const methods = await page.evaluate(() => {
        const pg = (window as any).VanduoPagination;
        return {
          init: typeof pg.init,
          initPagination: typeof pg.initPagination,
          render: typeof pg.render,
          goToPage: typeof pg.goToPage,
          prevPage: typeof pg.prevPage,
          nextPage: typeof pg.nextPage,
          update: typeof pg.update,
          calculatePages: typeof pg.calculatePages,
          destroy: typeof pg.destroy,
          destroyAll: typeof pg.destroyAll
        };
      });

      expect(methods.init).toBe('function');
      expect(methods.initPagination).toBe('function');
      expect(methods.render).toBe('function');
      expect(methods.goToPage).toBe('function');
      expect(methods.prevPage).toBe('function');
      expect(methods.nextPage).toBe('function');
      expect(methods.update).toBe('function');
      expect(methods.calculatePages).toBe('function');
      expect(methods.destroy).toBe('function');
      expect(methods.destroyAll).toBe('function');
    });

    test('goToPage programmatically changes page', async ({ page }) => {
      await page.click('#go-to-page-3');

      const apiPagination = page.locator('#api-pagination');
      const activePage = apiPagination.locator('.pagination-item.active');
      
      await expect(activePage).toHaveAttribute('data-page', '3');
    });

    test('prevPage navigates to previous page', async ({ page }) => {
      // First go to page 3
      await page.click('#go-to-page-3');
      
      // Then click prev
      await page.click('#prev-page');

      const apiPagination = page.locator('#api-pagination');
      const activePage = apiPagination.locator('.pagination-item.active');
      
      await expect(activePage).toHaveAttribute('data-page', '2');
    });

    test('nextPage navigates to next page', async ({ page }) => {
      await page.click('#next-page');

      const apiPagination = page.locator('#api-pagination');
      const activePage = apiPagination.locator('.pagination-item.active');
      
      await expect(activePage).toHaveAttribute('data-page', '2');
    });

    test('update changes total pages', async ({ page }) => {
      await page.click('#update-total');

      const apiPagination = page.locator('#api-pagination');
      
      // Check that totalPages data attribute was updated
      await expect(apiPagination).toHaveAttribute('data-total-pages', '20');
    });

    test('calculatePages returns correct page array', async ({ page }) => {
      const pages = await page.evaluate(() => {
        return (window as any).VanduoPagination.calculatePages(5, 20, 7);
      });

      expect(Array.isArray(pages)).toBe(true);
      expect(pages.length).toBeGreaterThan(0);
      // Middle page 5 of 20 should have ellipses on both sides
      expect(pages).toContain(1);
      expect(pages).toContain(20);
    });
  });

  test.describe('Accessibility', () => {
    test('pagination has aria-label on nav', async ({ page }) => {
      const nav = page.locator('nav[aria-label="Basic pagination"]');
      await expect(nav).toHaveCount(1);
    });

    test('page links have aria-label', async ({ page }) => {
      const pageLink = page.locator('#basic-pagination .pagination-item[data-page="2"] .pagination-link');
      await expect(pageLink).toHaveAttribute('aria-label', /Page 2/i);
    });

    test('previous button has aria-label', async ({ page }) => {
      const prevLink = page.locator('#basic-pagination .pagination-prev .pagination-link');
      await expect(prevLink).toHaveAttribute('aria-label', /Previous/i);
    });

    test('next button has aria-label', async ({ page }) => {
      const nextLink = page.locator('#basic-pagination .pagination-next .pagination-link');
      await expect(nextLink).toHaveAttribute('aria-label', /Next/i);
    });
  });
});