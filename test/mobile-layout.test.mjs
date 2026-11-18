import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// iOS Safari collapsed the Mars base "Base design" dialog to its title bar when
// the dialog had a fit-content height and its body used flex: 1 (a 0% basis).
for (const file of ['../dist/outpost-designer.css', '../dist/world/outpost-designer.css']) {
  test(`base design dialog keeps its body visible on phones (${file.slice(8)})`, async () => {
    const css = await readFile(new URL(file, import.meta.url), 'utf8');
    assert.match(css, /\[data-kind=design\] #panelBody \{ flex: 1 1 auto; min-height: 0; \}/);
    assert.match(css, /@media \(max-width: 670px\)[^{]*\{\s*\.mission-dialog\.setup-dialog\[data-kind=design\] \{ height: calc\(100vh - 24px\); height: calc\(100svh - 24px\); \}/);
  });
}
