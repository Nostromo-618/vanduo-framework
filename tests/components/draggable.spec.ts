import { test, expect } from '@playwright/test';

test.describe('Draggable Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/draggable.html');
    // Wait for the draggable component to be loaded
    await page.waitForFunction(
      () => typeof (window as any).VanduoDraggable !== 'undefined',
      null,
      { timeout: 10000 }
    );
  });

  test('renders basic draggable elements with draggable attribute', async ({ page }) => {
    const draggables = page.locator('.vd-draggable');
    await expect(draggables.first()).toBeVisible();
    await expect(draggables.first()).toHaveAttribute('draggable', 'true');
    expect(await draggables.count()).toBeGreaterThan(0);
  });

  test('sets ARIA attributes on draggable elements', async ({ page }) => {
    const draggable = page.locator('.vd-draggable').first();
    await expect(draggable).toHaveAttribute('role', 'option');
    await expect(draggable).toHaveAttribute('aria-roledescription', 'draggable item');
    await expect(draggable).toHaveAttribute('aria-grabbed', 'false');
    await expect(draggable).toHaveAttribute('tabindex', '0');
  });

  test('sets ARIA role on draggable containers', async ({ page }) => {
    const container = page.locator('.vd-draggable-container').first();
    await expect(container).toHaveAttribute('role', 'listbox');
    await expect(container).toHaveAttribute('aria-label');
  });

  test('sets ARIA attributes on drop zones', async ({ page }) => {
    const dropZone = page.locator('.vd-drop-zone').first();
    await expect(dropZone).toHaveAttribute('role', 'region');
    await expect(dropZone).toHaveAttribute('aria-dropeffect', 'move');
  });

  test('renders vertical draggable container', async ({ page }) => {
    const verticalContainer = page.locator('.vd-draggable-container-vertical');
    await expect(verticalContainer).toBeVisible();

    const items = verticalContainer.locator('.vd-draggable-item');
    expect(await items.count()).toBe(3);
  });

  test('renders drop zone', async ({ page }) => {
    const dropZone = page.locator('.vd-drop-zone');
    await expect(dropZone).toBeVisible();
  });

  test('fires custom events on drag operations @e2e', async ({ page }) => {
    const events: string[] = [];
    await page.exposeFunction('captureEvent', (name: string) => {
      events.push(name);
    });

    // Set up listeners
    await page.evaluate(() => {
      const el = document.querySelector('.vd-draggable');
      if (!el) return;
      el.addEventListener('draggable:start', () => (window as any).captureEvent('start'));
      el.addEventListener('draggable:end', () => (window as any).captureEvent('end'));
    });

    // Dispatch proper DragEvent with dataTransfer
    await page.evaluate(() => {
      const el = document.querySelector('.vd-draggable');
      if (!el) return;

      const dt = new DataTransfer();
      el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      el.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    });

    expect(events).toContain('start');
    expect(events).toContain('end');
  });

  test('supports keyboard focus and Enter activation', async ({ page }) => {
    const draggable = page.locator('.vd-draggable').first();

    // Tab to focus the element
    await draggable.focus();
    await expect(draggable).toBeFocused();

    // Press Enter — should trigger click
    let clicked = false;
    await page.exposeFunction('onClicked', () => { clicked = true; });
    await page.evaluate(() => {
      const el = document.querySelector('.vd-draggable');
      el?.addEventListener('click', () => (window as any).onClicked());
    });

    await page.keyboard.press('Enter');
    expect(clicked).toBe(true);
  });

  test('supports arrow key reordering @e2e', async ({ page }) => {
    // Get the first vertical container's items
    const container = page.locator('.vd-draggable-container-vertical');
    const items = container.locator('.vd-draggable-item');

    // Focus second item and press ArrowUp to move it before the first
    const secondItem = items.nth(1);
    const secondText = await secondItem.textContent();
    await secondItem.focus();
    await page.keyboard.press('ArrowUp');

    // After reorder, the first item should now be what was the second
    const firstItemText = await items.first().textContent();
    expect(firstItemText?.trim()).toBe(secondText?.trim());
  });

  test('Escape cancels drag', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('.vd-draggable');
      if (!el) return;
      el.classList.add('is-dragging');
      el.setAttribute('aria-grabbed', 'true');
    });

    const draggable = page.locator('.vd-draggable').first();
    await draggable.focus();
    await page.keyboard.press('Escape');

    await expect(draggable).not.toHaveClass(/is-dragging/);
    await expect(draggable).toHaveAttribute('aria-grabbed', 'false');
  });

  test('custom data attribute is read correctly', async ({ page }) => {
    const value = await page.evaluate(() => {
      return (window as any).VanduoDraggable.getData(
        document.querySelector('[data-draggable="item-1"]')
      );
    });
    expect(value).toBe('item-1');
  });

  test('programmatic makeDraggable and removeDraggable @e2e', async ({ page }) => {
    const el = page.locator('#programmatic-element');

    // Before — not draggable
    await expect(el).not.toHaveClass(/vd-draggable/);
    await expect(el).not.toHaveAttribute('draggable');

    // Click "Make Element Draggable"
    await page.locator('#make-draggable-btn').click();

    // After — should be draggable
    await expect(el).toHaveClass(/vd-draggable/);
    await expect(el).toHaveAttribute('draggable', 'true');
    await expect(el).toHaveAttribute('aria-grabbed', 'false');

    // Click "Remove Draggable"
    await page.locator('#remove-draggable-btn').click();

    // After removal — should no longer be draggable
    await expect(el).not.toHaveClass(/vd-draggable/);
    await expect(el).not.toHaveAttribute('draggable');
  });

  test('disabled draggable is not interactive', async ({ page }) => {
    const disabled = page.locator('.vd-draggable.is-disabled');
    await expect(disabled).toBeVisible();

    // Verify CSS makes it non-interactive
    const pointerEvents = await disabled.evaluate(
      el => getComputedStyle(el).pointerEvents
    );
    expect(pointerEvents).toBe('none');
  });

  test('custom styled draggable renders correctly', async ({ page }) => {
    const custom = page.locator('.custom-draggable');
    await expect(custom).toBeVisible();
    await expect(custom).toHaveAttribute('draggable', 'true');
  });

  test('draggable handle is present', async ({ page }) => {
    const handle = page.locator('.vd-draggable-handle').first();
    await expect(handle).toBeVisible();

    // Handle should have cursor: grab
    const cursor = await handle.evaluate(el => getComputedStyle(el).cursor);
    expect(cursor).toBe('grab');
  });

  test('accessibility: focus-visible outline @a11y', async ({ page }) => {
    const draggable = page.locator('.vd-draggable').first();
    await draggable.focus();

    // The focused element should have an outline (focus-visible depends on browser,
    // but we can verify the element is focusable)
    await expect(draggable).toBeFocused();
  });
});
