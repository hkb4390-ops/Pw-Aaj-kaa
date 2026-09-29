
(function() {
    function initTelegramPopup() {
        // 1. Check if the 24-hour reminder is still active
        const lockTime = localStorage.getItem('tg_remind_time');
        if (lockTime && Date.now() < parseInt(lockTime)) {
            return; // Exit if 24 hours haven't passed
        }

        // Prevent double injection if script runs twice
        if (document.getElementById('tg-overlay')) return;

        // 2. Inject CSS
        const style = document.createElement('style');
        style.innerHTML = `
            #tg-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px); z-index: 9999999; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; font-family: sans-serif; }
            #tg-box { background: #13131a; padding: 30px 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); text-align: center; position: relative; width: 90%; max-width: 340px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); transform: translateY(20px); transition: transform 0.3s ease; }
            #tg-close { position: absolute; top: 12px; right: 16px; color: #888; cursor: pointer; font-size: 24px; font-weight: bold; background: none; border: none; padding: 0; line-height: 1; transition: color 0.2s; }
            #tg-close:hover { color: #fff; }
            #tg-join-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: #2AABEE; color: #fff; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 20px 0 12px; transition: background 0.2s, transform 0.1s; }
            #tg-join-btn:hover { background: #2298d6; }
            #tg-join-btn:active { transform: scale(0.97); }
            #tg-remind-btn { background: none; border: none; color: #64748b; font-size: 12px; cursor: pointer; padding: 5px; font-weight: 500; transition: color 0.2s; }
            #tg-remind-btn:hover { color: #94a3b8; text-decoration: underline; }
        `;
        document.head.appendChild(style);

        // 3. Create DOM Elements
        const overlay = document.createElement('div');
        overlay.id = 'tg-overlay';

        const box = document.createElement('div');
        box.id = 'tg-box';
        
        box.innerHTML = `
            <button id="tg-close">&times;</button>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 10px;">
                <path d="M21 5L2 12.5L9 14.5M21 5L18.5 20L9 14.5M21 5L9 14.5M9 14.5V19.5L13.5 15.5" stroke="#2AABEE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h2 style="margin: 0 0 8px; color: #fff; font-size: 20px; font-weight: 700;">Join Telegram</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.4;">Get the latest updates of Website, and instant notifications directly to your phone, Must join this. 💕</p>
            <a href="https://t.me/+KPdefsHsq5VkODBl" target="_blank" id="tg-join-btn">
                Join Now 💞
            </a>
            <button id="tg-remind-btn">Remind me later</button>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // 4. Fade-In Animation
        setTimeout(() => {
            overlay.style.opacity = '1';
            box.style.transform = 'translateY(0)';
        }, 100);

        // 5. Button Logic
        function closePopup() {
            overlay.style.opacity = '0';
            box.style.transform = 'translateY(10px)';
            setTimeout(() => overlay.remove(), 300);
        }

        document.getElementById('tg-close').onclick = closePopup;

        document.getElementById('tg-remind-btn').onclick = function() {
            const nextTime = Date.now() + 3600000; // 1 hours in milliseconds
            localStorage.setItem('tg_remind_time', nextTime);
            closePopup();
        };
    }

    // This guarantees the script waits for your HTML to load before drawing the popup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTelegramPopup);
    } else {
        initTelegramPopup();
    }
})();
