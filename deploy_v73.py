import subprocess

subprocess.run(['git', 'add', '-A'], cwd='D:/Website')
subprocess.run(['git', 'commit', '-q', '-m', 'Manual opens in photo viewer on card click, pages as gallery tiles'], cwd='D:/Website')
subprocess.run(['git', 'push', 'origin', 'main'], cwd='D:/Website')
print('deployed')