const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.html')) {
            const filepath = path.join(dir, file);
            let content = fs.readFileSync(filepath, 'utf8');
            
            // We want to add Feedback link right before Bebas Malware container.
            const feedbackLink = '<a href="feedback.html" class="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer mr-4"><span class="material-symbols-outlined text-[16px]">rate_review</span>Feedback</a>';
            
            // For home.html, leaderboard.html, materi.html, feedback.html, profile.html
            const targetHome = '<div class="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant"><span class="material-symbols-outlined text-tertiary-container text-body-lg">verified_user</span><span>Bebas Malware</span></div>';
            if (content.includes(targetHome) && !content.includes(feedbackLink + targetHome)) {
                content = content.replace(targetHome, feedbackLink + targetHome);
            }
            
            // Try with whitespace if first fails
            const targetHomeRegex = /<div class="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">\s*<span class="material-symbols-outlined text-tertiary-container text-body-lg">verified_user<\/span>\s*<span>Bebas Malware<\/span>\s*<\/div>/g;
            if (targetHomeRegex.test(content) && !content.includes(feedbackLink)) {
                content = content.replace(targetHomeRegex, match => feedbackLink + match);
            }
            
            // For login.html
            const targetLogin = '<span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-tertiary">shield</span>Bebas Malware</span>';
            if (content.includes(targetLogin) && !content.includes(feedbackLink + targetLogin)) {
                content = content.replace(targetLogin, feedbackLink + targetLogin);
            }

            // For register.html
            const targetRegister = '<span class="flex items-center gap-1"><span class="material-symbols-outlined text-tertiary-container text-[16px]">check_circle</span> Bebas Malware</span>';
            if (content.includes(targetRegister) && !content.includes(feedbackLink + targetRegister)) {
                content = content.replace(targetRegister, feedbackLink + targetRegister);
            }

            fs.writeFileSync(filepath, content, 'utf8');
            console.log('Processed', filepath);
        }
    }
}

replaceInDir('client');
