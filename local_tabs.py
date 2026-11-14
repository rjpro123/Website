import re

for p in ['index.html', 'services.html', 'gallery.html', 'staff.html', 'thanks.html']:
    s = open(r'D:/Website/' + p, encoding='utf-8').read()
    tabs = re.findall(r'class="tab[^"]*"[^>]*>([^<]+)<', s)
    print(p + ': ' + ' | '.join(tabs))