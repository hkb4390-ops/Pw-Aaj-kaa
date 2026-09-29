// gatekeeper.js - Aggressive Multi-Platform Security Enforcer
(function() {
    const path = window.location.pathname.toLowerCase();
    
    // Ignore verification and admin routes to prevent infinite loops
    if (path.includes('verify.html') || path.includes('generate.html') || path.includes('admin.html')) return;

    // Detect target portal from URL
    let currentPlatform = 'pw';
    if (path.includes('/nt')) currentPlatform = 'nt';
    else if (path.includes('/mj')) currentPlatform = 'mj';

    // Core Security Engine
    async function enforceSecurity() {
        // System OFF global override check (Fixed to 5 minutes to prevent flickering)
        if (localStorage.getItem('pw_system_off') === 'true') {
            const offTime = parseInt(localStorage.getItem('pw_system_off_time') || 0);
            if (Date.now() - offTime < 300000) return; // 5-minute cache
        }

        // Target platform-specific storage keys
        const keyStorageName = `${currentPlatform}_access_key`;
        const expStorageName = `${currentPlatform}_key_expires`;

        const key = localStorage.getItem(keyStorageName);
        const expires = parseInt(localStorage.getItem(expStorageName)) || 0;
        const now = Date.now();
        let isAccessValid = true;

        try {
            const res = await fetch('https://studyparcham.in/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify_key', key: key || 'integrity_check', platform: currentPlatform })
            });
            const data = await res.json();

            if (data.system_off) {
                localStorage.setItem('pw_system_off', 'true');
                localStorage.setItem('pw_system_off_time', Date.now().toString());
                return; // Exits safely without rendering lock screen
            } else {
                localStorage.removeItem('pw_system_off');
            }

            if (!data.success) isAccessValid = false;
        } catch (e) {
            // Fallback to local memory if offline
            if (!key || expires < now) isAccessValid = false;
        }

        if (!isAccessValid) {
            renderLockScreen(currentPlatform);
        } else {
            handleReminders(expires, now, currentPlatform);
        }
    }

    // Render Premium Lockdown UI
    function renderLockScreen(platform) {
        if (document.body) document.body.innerHTML = '';
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = () => window.history.pushState(null, "", window.location.href);

        const platformLabels = { 'pw': 'Physics Wallah', 'nt': 'Nexttoppers', 'mj': 'MissionJeet' };
        const pLabel = platformLabels[platform];

        document.documentElement.innerHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Authentication Required | StudyParcham</title>
                <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body { margin: 0; font-family: 'Poppins', sans-serif; background: #f4f7f6; color: #475569; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                    .lock-card { background: #ffffff; border-radius: 16px; padding: 50px 40px; width: 90%; max-width: 480px; text-align: center; box-shadow: 0 20px 40px rgba(15, 43, 91, 0.08); border-top: 5px solid #d4af37; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                    .logo { height: 65px; margin-bottom: 25px; animation: float 4s ease-in-out infinite; }
                    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                    h2 { margin: 0 0 12px 0; font-weight: 600; font-size: 1.85rem; font-family: 'Lora', serif; color: #0f172a; line-height: 1.3; }
                    p { font-size: 0.95rem; line-height: 1.6; margin-bottom: 35px; color: #475569; }
                    .btn-gen { background: linear-gradient(135deg, #d4af37, #b8962e); color: #ffffff; border: none; padding: 16px; width: 100%; border-radius: 8px; font-weight: 600; font-size: 1.05rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2); }
                    .btn-gen:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(212, 175, 55, 0.3); }
                    .tag { display: inline-block; background: rgba(15, 43, 91, 0.1); color: #0f2b5b; padding: 5px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; margin-bottom: 15px; text-transform: uppercase; border: 1px solid rgba(15,43,91,0.2); }
                </style>
            </head>
            <body>
                <div class="lock-card">
                    <img src="https://i.ibb.co/rRCw6GWG/IMG-20260326-114528-656.png" class="logo" alt="StudyParcham Logo">
                    <div class="tag">Portal: ${pLabel}</div>
                    <h2>Session Authentication Required</h2>
                    <p>To ensure a secure learning environment, please generate your free access pass specific to the <strong>${pLabel}</strong> academic portal.</p>
                    <a href="/generate.html?platform=${platform}" class="btn-gen">
                        <i class="fas fa-shield-alt"></i> Proceed to Authentication
                    </a>
                </div>
            </body>
            </html>
        `;
    }

    // Dynamic Expiry Reminders
    function handleReminders(expires, now, platform) {
        const hoursLeft = (expires - now) / (60 * 60 * 1000);
        let notificationObj = null;

        const reminderKey = `pw_reminded_${platform}`; 

        if (hoursLeft <= 1 && !localStorage.getItem(`${reminderKey}_1`)) {
            notificationObj = { title: `Critical Expiry (/${platform.toUpperCase()})`, message: `Your access pass for this portal will expire in less than 1 hour.`, icon: "fa-exclamation-triangle", color: "#ef4444" };
            localStorage.setItem(`${reminderKey}_1`, 'true');
        } else if (hoursLeft <= 12 && hoursLeft > 1 && !localStorage.getItem(`${reminderKey}_12`)) {
            notificationObj = { title: `Expiry Notice (/${platform.toUpperCase()})`, message: `Your access key for this portal is valid for less than 12 hours.`, icon: "fa-clock", color: "#d4af37" };
            localStorage.setItem(`${reminderKey}_12`, 'true');
        } else if (hoursLeft <= 24 && hoursLeft > 12 && !localStorage.getItem(`${reminderKey}_24`)) {
            notificationObj = { title: `Extension Available`, message: `Your cooldown period has concluded. You may generate a new key for this portal.`, icon: "fa-check-circle", color: "#10b981" };
            localStorage.setItem(`${reminderKey}_24`, 'true');
        }

        if (notificationObj) {
            document.addEventListener('DOMContentLoaded', () => {
                const toast = document.createElement('div');
                toast.style.cssText = `position: fixed; top: 25px; right: 25px; z-index: 999999; background: #ffffff; border-left: 5px solid ${notificationObj.color}; border-radius: 8px; padding: 20px 25px; width: 90%; max-width: 420px; box-shadow: 0 15px 35px rgba(15, 43, 91, 0.15); font-family: 'Poppins', sans-serif; color: #0f172a; display: flex; flex-direction: column; gap: 12px; animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1);`;
                
                const style = document.createElement('style');
                style.innerHTML = `@keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
                document.head.appendChild(style);

                toast.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas ${notificationObj.icon}" style="font-size: 1.5rem; color: ${notificationObj.color};"></i>
                        <span style="font-weight: 600; font-size: 1.05rem; font-family: 'Lora', serif;">${notificationObj.title}</span>
                    </div>
                    <div style="font-size: 0.9rem; line-height: 1.6; color: #475569;">${notificationObj.message}</div>
                    <div style="display: flex; gap: 12px; margin-top: 5px;">
                        <button onclick="window.location.href='/generate.html?platform=${platform}'" style="background: #0f2b5b; color: #ffffff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 500; cursor: pointer; transition: 0.3s; flex: 1; font-family: 'Poppins', sans-serif;">Renew Access</button>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; color: #475569; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 6px; font-weight: 500; cursor: pointer; transition: 0.3s; font-family: 'Poppins', sans-serif;">Dismiss</button>
                    </div>
                `;
                document.body.appendChild(toast);
            });
        }
    }

    // --- AGGRESSIVE EVENT LISTENERS ---
    enforceSecurity();

    // Fire when page is restored from Back/Forward Cache
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) enforceSecurity();
    });

    // Fire whenever the user switches back to this tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') enforceSecurity();
    });

})();
