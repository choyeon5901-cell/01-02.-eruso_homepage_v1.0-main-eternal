from pathlib import Path
t = Path(r"C:\Users\user\AppData\Local\Temp\eruso-restored.html").read_text(encoding="utf-8", errors="replace")
print("lines", t.count("\n"))
print("hero", "hero-video" in t)
print("popup_hidden", 'id="popup-container" hidden' in t)
print("has_1850_popup", "width: 1850px" in t)
