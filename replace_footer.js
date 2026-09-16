const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.html')) {
            const filepath = path.join(dir, file);
            let content = fs.readFileSync(filepath, 'utf8');
            
            // 1. Remove Berikan Feedback button
            content = content.replace(/<a href="feedback\.html"[^>]*>.*?Berikan Feedback.*?<\/a>/g, '');
            
            // 2. Remove mailto link
            content = content.replace(/<a href="mailto:yudimade979@gmail\.com"[^>]*>.*?yudimade979@gmail\.com.*?<\/a>/g, '');
            
            // 3. Add Feedback next to Bebas Malware
            const feedbackLink = '<a href="feedback.html" class="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer mr-4"><span class="material-symbols-outlined text-[16px]">rate_review</span>Feedback</a>';
            
            // pattern 1: span>span>shield + Bebas Malware
            const target1 = '<span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-tertiary">shield</span>Bebas Malware</span>';
            if (content.includes(target1) && !content.includes(feedbackLink + target1)) {
                content = content.replace(target1, feedbackLink + target1);
            }
            
            // pattern 2: div>span>verified_user + Bebas Malware (with newlines sometimes)
            const target2 = '<div class="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant"><span class="material-symbols-outlined text-tertiary-container text-body-lg">verified_user</span><span>Bebas Malware</span></div>';
            if (content.includes(target2) && !content.includes(feedbackLink + target2)) {
                content = content.replace(target2, feedbackLink + target2);
            }
            // For spaces/newlines formatted:
            const target2Regex = /<div class="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">\s*<span class="material-symbols-outlined text-tertiary-container text-body-lg">verified_user<\/span>\s*<span>Bebas Malware<\/span>\s*<\/div>/g;
            if (target2Regex.test(content) && !content.includes(feedbackLink)) {
                 content = content.replace(target2Regex, match => feedbackLink + match);
            }

            const target3 = '<span class="flex items-center gap-1"><span class="material-symbols-outlined text-tertiary-container text-[16px]">check_circle</span> Bebas Malware</span>';
            if (content.includes(target3) && !content.includes(feedbackLink + target3)) {
                content = content.replace(target3, feedbackLink + target3);
            }

            fs.writeFileSync(filepath, content, 'utf8');
            console.log('Processed', filepath);
        }
    }
}

replaceInDir('client');
