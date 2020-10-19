#!/bin/python3
"""
Copy the path info of all svg files in a directory into a single
file for quick and easy import in svelte project. Importing directly
rather than using src tags or url in css solves performance issues
in Firefox when a lot of items are loaded and it sends a http request
for each image even though it's the same image.

Meant to be used inside a svelte component which wraps the svg element,
although it can be easily modified to be used directly (although this
option provides more options for customization).

For example:
```
# Icon.svelte
<svg>
    <slot />
</svg>
```

```
# MyComponent.svelte
<script lang="ts">
    import icons from "../src/global/template_icons.ts";
</script>
<Icon>
    {@html icons["my_icon"]}
</Icon>
```
"""
import sys
import json
import re
from pathlib import Path

if len(sys.argv) <= 1:
    print("usage: svg_to_ts <svg_dir> [out_file]")
    sys.exit(1)

p = Path(sys.argv[1])
if not p.exists() and not p.is_dir():
    print(str(p) + " is not a folder.")

out = Path('./src/global/template_icons.ts')
if len(sys.argv) >= 3:
    out = Path(sys.argv[2])

with out.open('w') as out_file:
    images = {}
    out_file.write('export default ')
    r = re.compile(r'.*<!DOCTYPE[^>]*>(.*)$', re.MULTILINE | re.IGNORECASE | re.DOTALL)
    for svg in p.glob('*.svg'):
        with svg.open('r') as in_file:
            print(f"Processing {svg.stem}...")
            contents = in_file.read().strip()
            contents = r.sub(r'\1', contents)
            images[svg.stem] = contents
    json.dump(images, out_file, indent=4)
print(f"Finished outputting parsed files to {out}")
