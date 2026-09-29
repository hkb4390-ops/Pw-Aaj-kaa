
(function() {
    // 1. Create the Bear Image
    const bear = document.createElement('img');
    // Points to the root directory where your GitHub main page index is
    bear.src = '/brunoPeekingBottom-cropped.gif'; 
    bear.id = 'bruno-peeking-bear';
    document.body.appendChild(bear);

    // 2. Inject the CSS Styles dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        #bruno-peeking-bear {
            position: fixed;
            bottom: -150px; /* Hidden below the screen initially */
            width: 85px; /* Perfect small icon size */
            z-index: 999999; /* Stays on top of everything */
            transition: bottom 0.6s cubic-bezier(0.2, 1.2, 0.3, 1.2); /* Bouncy pop-up animation */
            pointer-events: none; /* Prevents the bear from blocking your clicks */
        }
        #bruno-peeking-bear.peeking {
            bottom: 0px; /* Pops up to touch the bottom edge */
        }
    `;
    document.head.appendChild(style);

    // 3. The Randomizer Engine
    function triggerPeek() {
        // Calculate a random horizontal position across the screen
        const maxLeft = window.innerWidth - 85; // Screen width minus bear width
        const randomLeft = Math.floor(Math.random() * maxLeft);
        bear.style.left = randomLeft + 'px';

        // Pop up!
        bear.classList.add('peeking');

        // Stay up for 2.5 seconds, then slide back down
        setTimeout(() => {
            bear.classList.remove('peeking');
            
            // Schedule the next random appearance (Between 15 to 45 seconds)
            const nextDelay = Math.floor(Math.random() * 30000) + 15000;
            setTimeout(triggerPeek, nextDelay);
        }, 4000);
    }

    // Start the very first peek 5 seconds after the page loads
    setTimeout(triggerPeek, 5000);
})();

