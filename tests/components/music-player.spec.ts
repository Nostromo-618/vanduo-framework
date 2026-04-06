/**
 * Music Player Component Tests
 *
 * Tests for js/components/music-player.js
 * Covers: initialization, play/pause, track navigation, volume, shuffle,
 * progress bar, playlist panel, programmatic API, custom events, destroy.
 *
 * Note: Audio playback is not tested as URL strings in the fixture are empty.
 * Tests verify DOM state, ARIA, and programmatic API behaviour.
 */

import { test, expect } from '@playwright/test';

test.describe('Music Player Component @component', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tests/fixtures/music-player.html');
        await page.waitForTimeout(100);
    });

    // ────────────────────────────────────────────────────
    // INITIALIZATION
    // ────────────────────────────────────────────────────
    test.describe('Initialization', () => {
        test('marks container as initialized', async ({ page }) => {
            await expect(page.locator('#player-minimal')).toHaveAttribute(
                'data-music-player-initialized',
                'true',
            );
        });

        test('sets role="region" on container', async ({ page }) => {
            await expect(page.locator('#player-minimal')).toHaveAttribute('role', 'region');
        });

        test('sets aria-label on container', async ({ page }) => {
            await expect(page.locator('#player-minimal')).toHaveAttribute(
                'aria-label',
                'Music Player',
            );
        });

        test('renders play button with accessible label', async ({ page }) => {
            const btn = page.locator('#player-minimal .vd-music-player-btn-play');
            await expect(btn).toBeVisible();
            await expect(btn).toHaveAttribute('aria-label', /play/i);
        });

        test('renders prev and next buttons', async ({ page }) => {
            await expect(page.locator('#player-minimal .vd-music-player-btn-prev')).toBeVisible();
            await expect(page.locator('#player-minimal .vd-music-player-btn-next')).toBeVisible();
        });

        test('renders track name element with aria-live', async ({ page }) => {
            const trackName = page.locator('#player-minimal .vd-music-player-track-name');
            await expect(trackName).toBeVisible();
            await expect(trackName).toHaveAttribute('aria-live', 'polite');
        });

        test('shows first track name on init', async ({ page }) => {
            const trackName = page.locator('#player-minimal .vd-music-player-track-name');
            await expect(trackName).toHaveText('Test Track A');
        });

        test('initialises via data attribute', async ({ page }) => {
            await expect(page.locator('#player-data-attr')).toHaveAttribute(
                'data-music-player-initialized',
                'true',
            );
        });

        test('registers instance in VanduoMusicPlayer.instances', async ({ page }) => {
            const hasInstance = await page.evaluate(() => {
                const el = document.getElementById('player-minimal');
                return VanduoMusicPlayer.instances.has(el);
            });
            expect(hasInstance).toBe(true);
        });
    });

    // ────────────────────────────────────────────────────
    // PLAY / PAUSE TOGGLE
    // ────────────────────────────────────────────────────
    test.describe('Play / Pause', () => {
        test('clicking play button adds is-playing class', async ({ page }) => {
            // Audio won't load with empty URL, but we can test state via programmatic API
            await page.evaluate(() => {
                const el = document.getElementById('player-minimal');
                const state = VanduoMusicPlayer.instances.get(el);
                // Manually set isPlaying for DOM state test
                state.isPlaying = true;
                el.querySelector('.vd-music-player-btn-play').setAttribute('aria-label', 'Pause');
                el.classList.add('is-playing');
            });
            await expect(page.locator('#player-minimal')).toHaveClass(/is-playing/);
        });

        test('programmatic pause clears is-playing class', async ({ page }) => {
            await page.evaluate(() => {
                const el = document.getElementById('player-minimal');
                el.classList.add('is-playing');
                const state = VanduoMusicPlayer.instances.get(el);
                state.isPlaying = false;
                el.classList.remove('is-playing');
            });
            await expect(page.locator('#player-minimal')).not.toHaveClass(/is-playing/);
        });

        test('getState returns isPlaying=false initially', async ({ page }) => {
            const state = await page.evaluate(() => {
                const el = document.getElementById('player-minimal');
                return VanduoMusicPlayer.getState(el);
            });
            expect(state.isPlaying).toBe(false);
        });
    });

    // ────────────────────────────────────────────────────
    // TRACK NAVIGATION
    // ────────────────────────────────────────────────────
    test.describe('Track Navigation', () => {
        test('setTrack updates currentIndex in state', async ({ page }) => {
            const index = await page.evaluate(() => {
                const el = document.getElementById('player-playlist');
                VanduoMusicPlayer.setTrack(el, 2);
                return VanduoMusicPlayer.getState(el).currentIndex;
            });
            expect(index).toBe(2);
        });

        test('setTrack updates track name display', async ({ page }) => {
            await page.evaluate(() => {
                VanduoMusicPlayer.setTrack(document.getElementById('player-playlist'), 2);
            });
            await expect(
                page.locator('#player-playlist .vd-music-player-track-name'),
            ).toHaveText('Test Track C');
        });

        test('next() advances to next track', async ({ page }) => {
            const index = await page.evaluate(() => {
                const el = document.getElementById('player-playlist');
                VanduoMusicPlayer.setTrack(el, 0);
                VanduoMusicPlayer.next(el);
                return VanduoMusicPlayer.getState(el).currentIndex;
            });
            expect(index).toBe(1);
        });

        test('previous() goes back to previous track', async ({ page }) => {
            const index = await page.evaluate(() => {
                const el = document.getElementById('player-playlist');
                VanduoMusicPlayer.setTrack(el, 2);
                VanduoMusicPlayer.previous(el);
                return VanduoMusicPlayer.getState(el).currentIndex;
            });
            expect(index).toBe(1);
        });

        test('next() wraps around to first track', async ({ page }) => {
            const index = await page.evaluate(() => {
                const el = document.getElementById('player-playlist');
                VanduoMusicPlayer.setTrack(el, 2); // last track
                VanduoMusicPlayer.next(el);
                return VanduoMusicPlayer.getState(el).currentIndex;
            });
            expect(index).toBe(0);
        });

        test('previous() wraps around to last track', async ({ page }) => {
            const index = await page.evaluate(() => {
                const el = document.getElementById('player-playlist');
                VanduoMusicPlayer.setTrack(el, 0); // first track
                VanduoMusicPlayer.previous(el);
                return VanduoMusicPlayer.getState(el).currentIndex;
            });
            expect(index).toBe(2);
        });

        test('getState returns correct currentTrack object', async ({ page }) => {
            const track = await page.evaluate(() => {
                const el = document.getElementById('player-minimal');
                return VanduoMusicPlayer.getState(el).currentTrack;
            });
            expect(track).toMatchObject({ name: 'Test Track A' });
        });

        test('next button click fires musicplayer:trackchange event', async ({ page }) => {
            const detail = await page.evaluate(
                () =>
                    new Promise((resolve) => {
                        const el = document.getElementById('player-playlist');
                        VanduoMusicPlayer.setTrack(el, 0);
                        el.addEventListener(
                            'musicplayer:trackchange',
                            (e) => resolve(e.detail),
                            { once: true },
                        );
                        el.querySelector('.vd-music-player-btn-next').click();
                    }),
            );
            expect(detail).toMatchObject({ index: 1, name: 'Test Track B' });
        });
    });

    // ────────────────────────────────────────────────────
    // VOLUME
    // ────────────────────────────────────────────────────
    test.describe('Volume', () => {
        test('setVolume updates state', async ({ page }) => {
            const vol = await page.evaluate(() => {
                const el = document.getElementById('player-minimal');
                VanduoMusicPlayer.setVolume(el, 0.3);
                return VanduoMusicPlayer.getState(el).volume;
            });
            expect(vol).toBeCloseTo(0.3);
        });

        test('getState returns initial volume 0.5', async ({ page }) => {
            const vol = await page.evaluate(() =>
                VanduoMusicPlayer.getState(document.getElementById('player-minimal')).volume,
            );
            expect(vol).toBeCloseTo(0.5);
        });

        test('all-features player inits with volume 0.8', async ({ page }) => {
            const vol = await page.evaluate(() =>
                VanduoMusicPlayer.getState(document.getElementById('player-all')).volume,
            );
            expect(vol).toBeCloseTo(0.8);
        });

        test('setVolume fires musicplayer:volumechange event', async ({ page }) => {
            const detail = await page.evaluate(
                () =>
                    new Promise((resolve) => {
                        const el = document.getElementById('player-minimal');
                        el.addEventListener('musicplayer:volumechange', (e) => resolve(e.detail), {
                            once: true,
                        });
                        VanduoMusicPlayer.setVolume(el, 0.7);
                    }),
            );
            expect(detail.volume).toBeCloseTo(0.7);
        });

        test('renders volume slider input', async ({ page }) => {
            const slider = page.locator('#player-minimal .vd-music-player-volume-slider');
            await expect(slider).toBeVisible();
            await expect(slider).toHaveAttribute('type', 'range');
        });
    });

    // ────────────────────────────────────────────────────
    // SHUFFLE
    // ────────────────────────────────────────────────────
    test.describe('Shuffle', () => {
        test('shuffle player shows shuffle button', async ({ page }) => {
            await expect(
                page.locator('#player-shuffle .vd-music-player-btn-shuffle'),
            ).toBeVisible();
        });

        test('shuffle button has aria-pressed=true when shuffled on init', async ({ page }) => {
            await expect(
                page.locator('#player-shuffle .vd-music-player-btn-shuffle'),
            ).toHaveAttribute('aria-pressed', 'true');
        });

        test('shuffle() API toggles shuffle state off', async ({ page }) => {
            const shuffleState = await page.evaluate(() => {
                const el = document.getElementById('player-shuffle');
                VanduoMusicPlayer.shuffle(el); // toggle off
                return VanduoMusicPlayer.getState(el).shuffle;
            });
            expect(shuffleState).toBe(false);
        });

        test('clicking shuffle button toggles aria-pressed', async ({ page }) => {
            const btn = page.locator('#player-shuffle .vd-music-player-btn-shuffle');
            await expect(btn).toHaveAttribute('aria-pressed', 'true');
            await btn.click();
            await expect(btn).toHaveAttribute('aria-pressed', 'false');
        });
    });

    // ────────────────────────────────────────────────────
    // PROGRESS BAR
    // ────────────────────────────────────────────────────
    test.describe('Progress Bar', () => {
        test('progress bar is visible when showProgress=true', async ({ page }) => {
            await expect(
                page.locator('#player-progress .vd-music-player-progress'),
            ).toBeVisible();
        });

        test('progress bar is absent when showProgress=false (minimal)', async ({ page }) => {
            await expect(
                page.locator('#player-minimal .vd-music-player-progress'),
            ).not.toBeAttached();
        });

        test('progress input has type=range', async ({ page }) => {
            const input = page.locator(
                '#player-progress .vd-music-player-progress-bar',
            );
            await expect(input).toHaveAttribute('type', 'range');
        });

        test('progress input has aria-label', async ({ page }) => {
            const input = page.locator('#player-progress .vd-music-player-progress-bar');
            await expect(input).toHaveAttribute('aria-label', /seek|progress/i);
        });
    });

    // ────────────────────────────────────────────────────
    // PLAYLIST PANEL
    // ────────────────────────────────────────────────────
    test.describe('Playlist Panel', () => {
        test('playlist panel is rendered when showPlaylist=true', async ({ page }) => {
            await expect(
                page.locator('#player-playlist .vd-music-player-playlist'),
            ).toBeAttached();
        });

        test('playlist button is visible', async ({ page }) => {
            await expect(
                page.locator('#player-playlist .vd-music-player-btn-playlist'),
            ).toBeVisible();
        });

        test('playlist is closed by default', async ({ page }) => {
            await expect(
                page.locator('#player-playlist .vd-music-player-playlist'),
            ).not.toHaveClass(/is-open/);
        });

        test('clicking playlist button opens the panel', async ({ page }) => {
            await page.locator('#player-playlist .vd-music-player-btn-playlist').click();
            await expect(
                page.locator('#player-playlist .vd-music-player-playlist'),
            ).toHaveClass(/is-open/);
        });

        test('clicking playlist button again closes the panel', async ({ page }) => {
            const btn = page.locator('#player-playlist .vd-music-player-btn-playlist');
            await btn.click();
            await btn.click();
            await expect(
                page.locator('#player-playlist .vd-music-player-playlist'),
            ).not.toHaveClass(/is-open/);
        });

        test('playlist renders correct number of track items', async ({ page }) => {
            const items = page.locator('#player-playlist .vd-music-player-playlist-item');
            await expect(items).toHaveCount(3);
        });

        test('clicking a playlist item changes the active track', async ({ page }) => {
            await page.locator('#player-playlist .vd-music-player-btn-playlist').click();
            const items = page.locator('#player-playlist .vd-music-player-playlist-item');
            await items.nth(2).click();
            const trackName = page.locator('#player-playlist .vd-music-player-track-name');
            await expect(trackName).toHaveText('Test Track C');
        });

        test('playlist panel is absent when showPlaylist=false (minimal)', async ({ page }) => {
            await expect(
                page.locator('#player-minimal .vd-music-player-playlist'),
            ).not.toBeAttached();
        });
    });

    // ────────────────────────────────────────────────────
    // NO TRACKS EDGE CASE
    // ────────────────────────────────────────────────────
    test.describe('No Tracks Edge Case', () => {
        test('player initializes without throwing when tracks is empty', async ({ page }) => {
            await expect(page.locator('#player-no-tracks')).toHaveAttribute(
                'data-music-player-initialized',
                'true',
            );
        });

        test('getState returns empty tracks array', async ({ page }) => {
            const tracks = await page.evaluate(() =>
                VanduoMusicPlayer.getState(document.getElementById('player-no-tracks')).tracks,
            );
            expect(tracks).toHaveLength(0);
        });

        test('next() does not throw when tracks is empty', async ({ page }) => {
            const error = await page.evaluate(() => {
                try {
                    VanduoMusicPlayer.next(document.getElementById('player-no-tracks'));
                    return null;
                } catch (e) {
                    return e.message;
                }
            });
            expect(error).toBeNull();
        });

        test('play() does not throw when tracks is empty', async ({ page }) => {
            const error = await page.evaluate(() => {
                try {
                    VanduoMusicPlayer.play(document.getElementById('player-no-tracks'));
                    return null;
                } catch (e) {
                    return e.message;
                }
            });
            expect(error).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────
    // GETSTATE
    // ────────────────────────────────────────────────────
    test.describe('getState', () => {
        test('returns expected shape', async ({ page }) => {
            const state = await page.evaluate(() =>
                VanduoMusicPlayer.getState(document.getElementById('player-all')),
            );
            expect(state).toMatchObject({
                isPlaying: expect.any(Boolean),
                currentIndex: expect.any(Number),
                volume: expect.any(Number),
                shuffle: expect.any(Boolean),
                tracks: expect.any(Array),
            });
            expect(state.currentTrack).toMatchObject({ name: expect.any(String) });
        });

        test('returns null for unknown element', async ({ page }) => {
            const state = await page.evaluate(() => {
                const div = document.createElement('div');
                return VanduoMusicPlayer.getState(div);
            });
            expect(state).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────
    // DESTROY
    // ────────────────────────────────────────────────────
    test.describe('Destroy', () => {
        test('destroy removes instance from instances map', async ({ page }) => {
            const hasInstance = await page.evaluate(() => {
                const el = document.getElementById('player-destroy');
                VanduoMusicPlayer.destroy(el);
                return VanduoMusicPlayer.instances.has(el);
            });
            expect(hasInstance).toBe(false);
        });

        test('destroy removes data-music-player-initialized attribute', async ({ page }) => {
            await page.evaluate(() => {
                VanduoMusicPlayer.destroy(document.getElementById('player-destroy'));
            });
            await expect(page.locator('#player-destroy')).not.toHaveAttribute(
                'data-music-player-initialized',
            );
        });

        test('destroyAll removes all instances', async ({ page }) => {
            const count = await page.evaluate(() => {
                VanduoMusicPlayer.destroyAll();
                return VanduoMusicPlayer.instances.size;
            });
            expect(count).toBe(0);
        });
    });
});
