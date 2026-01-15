/**
 * Action Complete Page JavaScript
 */
(function () {
    window.closeWindow = function () {
        // Try to close the window
        window.close();

        // If not closed (page still visible after 0.5s)
        setTimeout(function () {
            if (!window.closed) {
                // Return if there is browser history
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // Go to homepage if no history
                    if (typeof musashiVars !== 'undefined' && musashiVars.homeUrl) {
                        window.location.href = musashiVars.homeUrl;
                    }
                }
            }
        }, 500);
    };
})();
