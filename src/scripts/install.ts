let deferredPrompt: any;

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Optionally, show a custom install button
    showInstallPrompt();
  });
}

async function showInstallPrompt() {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;
  }
}


export { setupInstallPrompt, showInstallPrompt, deferredPrompt } 
