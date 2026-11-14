import time, urllib.request, subprocess

cred = "protocol=https`nhost=github.com`n`n"
token_result = subprocess.run(["git", "credential", "fill"], input=cred, capture_output=True, text=True, cwd="D:/Website")
token_line = [l for l in token_result.stdout.splitlines() if l.startswith("password=")]
if token_line:
    token = token_line[0].replace("password=", "")
    h = {"Authorization": "Bearer " + token, "Accept": "application/vnd.github+json"}
    for i in range(1, 13):
        time.sleep(15)
        try:
            url = "https://api.github.com/repos/rjpro123/Website/pages/builds/latest"
            req = urllib.request.Request(url, headers=h)
            b = urllib.request.urlopen(req, timeout=20)
            r = urllib.request.urlopen("https://rjpro123.github.io/Website/staff.html", timeout=20)
            content = r.read().decode("utf-8")
            if "Founder" in content:
                print(f"deployed on try {i}")
                break
        except Exception as e:
            pass
else:
    print("no token found")