export async function checkStoryViewport(page, { width, height }) {
  const result = await page.locator('html').evaluate(root => {
    const bounds = element => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom };
    };
    const visible = element => {
      const closed = element.closest('details:not([open])');
      return element.getClientRects().length && getComputedStyle(element).visibility === 'visible'
        && (!closed || !!element.closest('summary'));
    };
    const main = root.querySelector('#game');
    const canvas = root.querySelector('#scene');
    const boxes = selector => [...main.querySelectorAll(selector)].filter(visible).map(bounds);
    const selectorBox = selector => {
      const element = main.querySelector(selector);
      return element && visible(element) ? bounds(element) : null;
    };
    return {
      movement: selectorBox('#touchControls'),
      movementButtons: boxes('#touchControls button'),
      objective: selectorBox('#objective'),
      action: selectorBox('#interactButton'),
      captions: selectorBox('#subtitle'),
      scene: main.dataset.scene,
      overflow: root.scrollWidth - root.clientWidth,
      ports: boxes('.training-port'),
      controls: boxes('button, summary, a'),
      badges: boxes('.truth-badge'),
      cpuMs: Number(canvas.dataset.frameMs) || null,
      frameIntervalMs: Number(canvas.dataset.frameIntervalMs) || null,
      legacyPuzzle: !!main.querySelector('section.puzzle'),
      deviceText: [...main.querySelectorAll('.device-target:not(.plugged)')].map(element => element.textContent.trim()),
    };
  });
  if (result.overflow > 0) throw Error('Horizontal overflow: ' + JSON.stringify(result));
  const badControls = result.controls.filter(box => box.width < 44 || box.height < 44
    || box.x < -.5 || box.y < -.5 || box.right > width + .5 || box.bottom > height + .5);
  if (badControls.length) throw Error('Small or clipped story control: ' + JSON.stringify(badControls));
  const moving = ['walk', 'clean', 'return', 'shelter', 'rover'].includes(result.scene);
  if (moving !== !!result.movement || (moving && result.movementButtons.length !== 4)) {
    throw Error('Wrong movement controls in ' + result.scene);
  }
  const overlaps = (a, b) => b && a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;
  if (moving && [result.objective, result.action, result.captions].some(box => overlaps(result.movement, box))) {
    throw Error('Movement pad overlaps the objective, action or captions');
  }
  if (result.badges.some(box => box.height >= 40)) throw Error('Oversized science badge');
  if (result.legacyPuzzle) throw Error('Old translucent quiz must be removed');
  if (result.scene === 'power' && result.deviceText.some(Boolean)) throw Error('Unconnected devices must use pictures, tooltips and accessible names');
  if (result.cpuMs !== null && result.cpuMs >= 50) throw Error('Average drawing CPU time exceeds 50ms');
  return result;
}
