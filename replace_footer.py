import glob
import re

feedback_link = '<a href="feedback.html" class="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer mr-4"><span class="material-symbols-outlined text-[16px]">rate_review</span>Feedback</a>'

files = glob.glob('client/*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove existing ones to prevent duplicates
    content = content.replace(feedback_link, '')
    
    # login.html and home.html have different patterns for Bebas Malware.
    # Pattern 1: home.html
    content = re.sub(r'(<span[^>]*>verified_user</span>\s*<span>Bebas Malware</span>)', feedback_link + r'\1', content)
    # Pattern 2: login.html
    content = re.sub(r'(<span[^>]*>shield</span>(?:<span[^>]*>)?Bebas Malware</span>)', feedback_link + r'\1', content)
    content = re.sub(r'(<span[^>]*>school</span>(?:<span[^>]*>)?Bebas Malware</span>)', feedback_link + r'\1', content)
    # Pattern 3: register.html
    content = re.sub(r'(<span[^>]*>check_circle</span> Bebas Malware</span>)', feedback_link + r'\1', content)
    
    # Ensure Berikan Feedback is gone:
    content = re.sub(r'<a href="feedback\.html"[^>]*>.*?Berikan Feedback.*?</a>', '', content, flags=re.DOTALL)
    # Ensure yudimade979@gmail.com is gone:
    content = re.sub(r'<a href="mailto:yudimade979@gmail\.com"[^>]*>.*?yudimade979@gmail\.com.*?</a>', '', content, flags=re.DOTALL)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        print('Processed', f)
