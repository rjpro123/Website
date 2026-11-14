import pathlib
import re

# ---------- 1. CSS ----------
p = pathlib.Path(r"D:\Website\styles.css")
s = p.read_text(encoding="utf-8")

if ".soonbanner" not in s:
    css = """
/* ---------- Opening soon banner ---------- */
.soonbanner{
  position:relative;z-index:10;
  background:#08180E;border-bottom:1px solid rgba(99,192,132,.28);
  padding:10px max(18px,env(safe-area-inset-left)) 10px max(18px,env(safe-area-inset-right));
  display:flex;align-items:center;justify-content:center;gap:10px;
}
.soondot{
  width:7px;height:7px;border-radius:50%;flex:none;
  background:var(--euc-bright);box-shadow:0 0 10px var(--euc-glow);
  animation:soondot 2.2s ease-in-out infinite;
}
@keyframes soondot{0%,100%{opacity:1}50%{opacity:.35}}
.soontext{
  margin:0;font-family:var(--head);font-size:.7rem;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;color:#8FD9A6;
}
.soontext b{color:#D6F5DC}
@media (max-width:640px){
  .soonbanner{padding:8px 14px;gap:8px}
  .soontext{font-size:.62rem;letter-spacing:.1em}
}
"""
    s = s.rstrip() + "\n" + css
    p.write_text(s, encoding="utf-8")
    print("styles.css: opening soon banner added")
else:
    print("styles.css: banner already present")

print("braces:", s.count("{"), "/", s.count("}"))

# ---------- 2. HTML on all pages ----------
files = ["index.html", "services.html", "gallery.html", "staff.html", "thanks.html"]
banner_html = """<div class="soonbanner">
  <span class="soondot" aria-hidden="true"></span>
  <p class="soontext"><b>Opening soon</b>&nbsp;&middot;&nbsp;Quote bookings open shortly</p>
</div>

"""

for name in files:
    fp = pathlib.Path(r"D:\Website") / name
    t = fp.read_text(encoding="utf-8")

    if "soonbanner" in t:
        print(name + ": banner already present")
        continue

    # Insert right after <body>
    t = t.replace("<body>", "<body>\n\n" + banner_html.rstrip(), 1)

    # Bump asset version
    t = re.sub(r"\?v=\d+", "?v=59", t)

    fp.write_text(t, encoding="utf-8")
    print(name + ": banner inserted, v=59")

# ---------- 3. Verify ----------
print("\nVerify:")
for name in files:
    c = (pathlib.Path(r"D:\Website") / name).read_text(encoding="utf-8")
    print("  " + name + ": banner=" + str("soonbanner" in c) + " v59=" + str("?v=59" in c))
