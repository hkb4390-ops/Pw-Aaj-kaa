// core.js - Cloudflare Distributed Stealth Engine (Auto-Failover)
window.ParchamCore = async function(actionKey, params = {}, method = 'GET', payloadBody = null) {
    
    // 🚀 THE VAULT NETWORK: All your active Cloudflare proxy nodes
    const VAULT_NODES = [
        "/api/data"
        
        
    ];

    // Retrieve the last known working node from the student's browser (defaults to node 0)
    let activeNodeIndex = parseInt(localStorage.getItem('pw_active_vault_node')) || 0;

    // Loop through the network. If one fails, try the next, up to the total number of nodes.
    for (let attempts = 0; attempts < VAULT_NODES.length; attempts++) {
        
        // Calculate the current node to try (wrapping around if it hits the end of the list)
        let currentNodeIndex = (activeNodeIndex + attempts) % VAULT_NODES.length;
        let VAULT_URL = VAULT_NODES[currentNodeIndex];

        try {
            const response = await fetch(VAULT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: actionKey,
                    params: params,
                    method: method,
                    payload: payloadBody
                })
            });
            
            // 🚨 CLOUDFLARE LIMIT CATCHER
            // If the node hits the 100k limit, it throws a 405 or 500 error.
            if (!response.ok) {
                console.warn(`[Vault Engine] Node ${currentNodeIndex} limit reached or failed. Switching to backup...`);
                continue; // Skip to the next node in the loop
            }

            const text = await response.text();
            
            // 🚨 BLANK/HTML RESPONSE CATCHER
            // If Cloudflare returns a blank string or HTML error page instead of JSON
            if (!text || text.trim() === '' || !text.startsWith('{')) {
                console.warn(`[Vault Engine] Node ${currentNodeIndex} returned invalid data. Switching to backup...`);
                continue; 
            }

            const data = JSON.parse(text);

            // ✅ SUCCESS: Save this specific node as the active one so future clicks are instant!
            if (attempts > 0) {
                localStorage.setItem('pw_active_vault_node', currentNodeIndex);
                console.log(`[Vault Engine] Successfully rerouted and locked to Node ${currentNodeIndex}.`);
            }
            
            return data;

        } catch (error) {
            // 🚨 NETWORK ERROR CATCHER (If a page is deleted or DNS fails)
            console.warn(`[Vault Engine] Node ${currentNodeIndex} is completely offline. Switching...`);
            continue; 
        }
    }

    // If the loop finishes and ALL nodes failed:
    console.error("CRITICAL: All Vault Nodes are offline or limits exceeded. 300,000 requests burned.");
    return null;
};
