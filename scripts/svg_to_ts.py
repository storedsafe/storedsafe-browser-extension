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

if len(sys.argv) <= 2:
    print("usage: svg_to_ts <svg_dir> <out_file>")
    sys.exit(1)

p_in = Path(sys.argv[1])
if not p_in.exists() and not p_in.is_dir():
    print(str(p_in) + " is not a folder.")

p_out = Path(sys.argv[2])
if not p_out.exists() and not p_out.is_dir():
    print(str(p_out) + " is not a folder.")

with p_out.open('w') as out_file:
    images = {}
    out_file.write('export default ')
    r = re.compile(r'.*<!DOCTYPE[^>]*>(.*)$', re.MULTILINE | re.IGNORECASE | re.DOTALL)
    for svg in p_in.glob('*.svg'):
        with svg.open('r') as in_file:
            print(f"Processing {svg.stem}...")
            contents = in_file.read().strip()
            contents = r.sub(r'\1', contents)
            images[svg.stem] = contents
    json.dump(images, out_file, indent=4)
print(f"Finished outputting parsed files to {p_out}")
