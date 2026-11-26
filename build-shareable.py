import base64
import os
import subprocess
import tempfile

root = "/Users/yangwutu/Documents/antigravity work/intelligence-explosion"
with open(os.path.join(root, "index.html"), "r", encoding="utf-8") as f:
    html = f.read()
with open(os.path.join(root, "styles.css"), "r", encoding="utf-8") as f:
    css = f.read()
with open(os.path.join(root, "bundle.js"), "r", encoding="utf-8") as f:
    js = f.read()

assets = [
    "astrolabe-recursion.jpg",
    "foundry-autopoiesis.jpg",
    "neural-exocortex.jpg",
    "dyson-matrioshka.jpg",
    "cosmic-bootloader.jpg",
]

with tempfile.TemporaryDirectory() as tmp:
    for name in assets:
        src = os.path.join(root, "assets", name)
        dst = os.path.join(tmp, name)
        subprocess.run(
            ["sips", "-Z", "1600", "-s", "format", "jpeg", "-s", "formatOptions", "78", src, "--out", dst],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        with open(dst, "rb") as imgf:
            b64 = base64.b64encode(imgf.read()).decode("ascii")
        html = html.replace(f"./assets/{name}", f"data:image/jpeg;base64,{b64}")

html = html.replace('<link rel="stylesheet" href="./styles.css" />', "<style>\n" + css + "\n</style>")
html = html.replace('<script defer src="./bundle.js"></script>', "<script>\n" + js + "\n</script>")

out_path = os.path.join(root, "EVENT-HORIZON-Shareable.html")
with open(out_path, "w", encoding="utf-8") as out:
    out.write(html)

leftovers = html.count("./assets/") + html.count("./styles.css") + html.count("./bundle.js")
print(
    f"Created {out_path} ({os.path.getsize(out_path) / (1024*1024):.2f} MB) | leftovers={leftovers} | scripts={html.count('<script>')}/{html.count('</script>')}"
)
