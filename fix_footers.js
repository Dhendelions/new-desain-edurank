const fs = require('fs');
const path = require('path');

const files = ['home.html', 'leaderboard.html', 'profile.html', 'materi.html', 'feedback.html', 'login.html', 'register.html'];
const clientDir = path.join(__dirname, 'client');

files.forEach(file => {
  const filePath = path.join(clientDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Different files have different footer structures based on my previous edits.
    // Let's just find "rate_review" which is inside the feedback link I added.
    
    // For standard footers (home, profile, leaderboard, materi, feedback)
    content = content.replace(
      /<a href="feedback\.html" class="flex items-center gap-space-xs font-label-md text-label-md[^>]*>\s*<span class="material-symbols-outlined text-primary text-body-lg">rate_review<\/span>\s*<span>Feedback<\/span>\s*<\/a>/,
      '<a href="feedback.html" class="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg transition-colors font-bold text-sm"><span class="material-symbols-outlined text-[18px]">rate_review</span><span>Berikan Feedback</span></a>'
    );
    
    // For login/register footers
    content = content.replace(
      /<a href="feedback\.html" class="flex items-center gap-1\.5 text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors font-semibold"><span class="material-symbols-outlined text-\[16px\] text-primary">rate_review<\/span>Feedback<\/a>/,
      '<a href="feedback.html" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg transition-colors font-bold text-xs"><span class="material-symbols-outlined text-[16px]">rate_review</span>Berikan Feedback</a>'
    );
    
    // Make sure login/register has the feedback to the LEFT of bebas malware
    // Currently in login/register I put it: <div class="flex items-center gap-4"> FEEDBACK COPYRIGHT </div>
    // Let's move it next to Bebas Malware.
    if (file === 'login.html' || file === 'register.html') {
       // Just find the block containing Bebas Malware and insert Feedback before it if needed.
       // Actually I will manually do replace_file_content for login and register to be safe.
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
});
