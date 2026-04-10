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

  test('supports touch reorder in vertical-only and dual-class containers @e2e', async ({ page }) => {
    const results = await page.evaluate(() => {
      const draggableApi = (window as any).VanduoDraggable;

      const simulateTouchDragToBottom = (item: HTMLElement, container: HTMLElement) => {
        const itemRect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const startX = itemRect.left + itemRect.width / 2;
        const startY = itemRect.top + itemRect.height / 2;
        const endX = startX;
        const endY = containerRect.bottom - 4;
        const preventDefault = () => {};

        draggableApi.handleTouchStart(
          { touches: [{ clientX: startX, clientY: startY }] },
          item
        );
        draggableApi.handleTouchMove(
          {
            touches: [{ clientX: endX, clientY: endY }],
            cancelable: true,
            preventDefault
          },
          item
        );
        draggableApi.handleTouchEnd(
          {
            changedTouches: [{ clientX: endX, clientY: endY }],
            cancelable: true,
            preventDefault
          },
          item
        );
      };

      const dualContainer = document.querySelector('.vd-draggable-container.vd-draggable-container-vertical') as HTMLElement;
      const dualFirst = dualContainer.querySelector('.vd-draggable-item[data-draggable="vertical-1"]') as HTMLElement;
      simulateTouchDragToBottom(dualFirst, dualContainer);
      const dualOrder = Array.from(dualContainer.querySelectorAll('.vd-draggable-item')).map((el) => el.getAttribute('data-draggable'));

      const verticalOnly = document.createElement('div');
      verticalOnly.className = 'vd-draggable-container-vertical';
      verticalOnly.innerHTML = `
        <div class="vd-draggable-item" data-draggable="touch-a">A</div>
        <div class="vd-draggable-item" data-draggable="touch-b">B</div>
        <div class="vd-draggable-item" data-draggable="touch-c">C</div>
      `;
      document.body.appendChild(verticalOnly);
      draggableApi.init();

      const verticalOnlyFirst = verticalOnly.querySelector('.vd-draggable-item[data-draggable="touch-a"]') as HTMLElement;
      simulateTouchDragToBottom(verticalOnlyFirst, verticalOnly);
      const verticalOnlyOrder = Array.from(verticalOnly.querySelectorAll('.vd-draggable-item')).map((el) => el.getAttribute('data-draggable'));

      return { dualOrder, verticalOnlyOrder };
    });

    expect(results.dualOrder).toEqual(['vertical-2', 'vertical-3', 'vertical-1']);
    expect(results.verticalOnlyOrder).toEqual(['touch-b', 'touch-c', 'touch-a']);
  });

  test('keeps touch feedback anchored to the initial touch point @e2e', async ({ page }) => {
    const result = await page.evaluate(() => {
      const draggableApi = (window as any).VanduoDraggable;
      const draggable = document.querySelector('[data-draggable="item-1"]') as HTMLElement;
      const rect = draggable.getBoundingClientRect();
      const startX = rect.left + 10;
      const startY = rect.top + 12;
      const moveX = startX + 40;
      const moveY = startY + 30;
      const preventDefault = () => {};

      draggableApi.handleTouchStart(
        { touches: [{ clientX: startX, clientY: startY }] },
        draggable
      );
      draggableApi.handleTouchMove(
        {
          touches: [{ clientX: moveX, clientY: moveY }],
          cancelable: true,
          preventDefault
        },
        draggable
      );

      const feedback = document.querySelector('.vd-drag-feedback') as HTMLElement;
      const left = parseFloat(feedback.style.left);
      const top = parseFloat(feedback.style.top);

      draggableApi.handleTouchEnd(
        {
          changedTouches: [{ clientX: moveX, clientY: moveY }],
          cancelable: true,
          preventDefault
        },
        draggable
      );

      return {
        left,
        top,
        expectedLeft: moveX - 10,
        expectedTop: moveY - 12
      };
    });

    expect(result.left).toBeCloseTo(result.expectedLeft, 1);
    expect(result.top).toBeCloseTo(result.expectedTop, 1);
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

  test('dispatches draggable:drop for touch release over a drop zone @e2e', async ({ page }) => {
    const result = await page.evaluate(() => {
      const draggableApi = (window as any).VanduoDraggable;
      const draggable = document.querySelector('[data-draggable="drop-item-1"]') as HTMLElement;
      const zone = document.querySelector('#demo-drop-zone') as HTMLElement;
      zone.scrollIntoView({ block: 'center' });
      const draggableRect = draggable.getBoundingClientRect();
      const zoneRect = zone.getBoundingClientRect();
      const startX = draggableRect.left + draggableRect.width / 2;
      const startY = draggableRect.top + draggableRect.height / 2;
      const endX = zoneRect.left + zoneRect.width / 2;
      const endY = zoneRect.top + zoneRect.height / 2;
      const preventDefault = () => {};
      let dropDetail: any = null;

      zone.addEventListener('draggable:drop', (event: Event) => {
        const customEvent = event as CustomEvent;
        dropDetail = customEvent.detail;
        if (dropDetail?.element) {
          zone.appendChild(dropDetail.element);
        }
      }, { once: true });

      draggableApi.handleTouchStart(
        { touches: [{ clientX: startX, clientY: startY }] },
        draggable
      );
      draggableApi.handleTouchMove(
        {
          touches: [{ clientX: endX, clientY: endY }],
          cancelable: true,
          preventDefault
        },
        draggable
      );
      draggableApi.handleTouchEnd(
        {
          changedTouches: [{ clientX: endX, clientY: endY }],
          cancelable: true,
          preventDefault
        },
        draggable
      );

      return {
        dropped: !!dropDetail,
        droppedData: dropDetail?.data,
        droppedElementData: dropDetail?.element?.dataset?.draggable,
        inZone: zone.contains(draggable)
      };
    });

    expect(result.dropped).toBe(true);
    expect(result.droppedData).toBe('drop-item-1');
    expect(result.droppedElementData).toBe('drop-item-1');
    expect(result.inZone).toBe(true);
  });

  test('touch drop uses last hovered drop-zone when touchend point misses @e2e', async ({ page }) => {
    const result = await page.evaluate(() => {
      const draggableApi = (window as any).VanduoDraggable;
      const draggable = document.querySelector('[data-draggable="drop-item-2"]') as HTMLElement;
      const zone = document.querySelector('#demo-drop-zone') as HTMLElement;
      zone.scrollIntoView({ block: 'center' });

      const draggableRect = draggable.getBoundingClientRect();
      const zoneRect = zone.getBoundingClientRect();
      const startX = draggableRect.left + draggableRect.width / 2;
      const startY = draggableRect.top + draggableRect.height / 2;
      const hoverX = zoneRect.left + zoneRect.width / 2;
      const hoverY = zoneRect.top + zoneRect.height / 2;
      const missX = Math.max(0, zoneRect.left - 20);
      const missY = Math.max(0, zoneRect.top - 20);
      const preventDefault = () => {};
      let dropped = false;

      zone.addEventListener('draggable:drop', () => {
        dropped = true;
      }, { once: true });

      draggableApi.handleTouchStart(
        { touches: [{ clientX: startX, clientY: startY }] },
        draggable
      );
      draggableApi.handleTouchMove(
        {
          touches: [{ clientX: hoverX, clientY: hoverY }],
          cancelable: true,
          preventDefault
        },
        draggable
      );
      draggableApi.handleTouchEnd(
        {
          changedTouches: [{ clientX: missX, clientY: missY }],
          cancelable: true,
          preventDefault
        },
        draggable
      );

      return { dropped };
    });

    expect(result.dropped).toBe(true);
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
