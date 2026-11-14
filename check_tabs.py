import urllib.request
import re

for p in ['index.html', 'services.html', 'gallery.html', 'staff.html', 'thanks.html']:
    try:
        r = urllib.request.urlopen('https://rjpro123.github.io/Website/' + p)
        c = r.read().decode()
        tabs = re.findall(r'class="tab[^"]*"[^>]*>([^<]+)<', c)
        print(p + ': ' + ' | '.join(tabs))
    except Exception as e:
        print(p + ': ERROR ' + str(e))