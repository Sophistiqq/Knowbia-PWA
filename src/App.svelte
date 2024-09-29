<script lang="ts">
  let serverIp = "10.0.23.245"; // Default IP address of the desktop app
  let serverFrontendPort = "5173"; // Port where the desktop app's frontend is served
  let isConnectedToLocalNetwork = false; // Tracks if the app is connected to the local network
  let localNetworkRegex = /^10\.0\./; // Regex pattern for checking if IP is in the local network range
  let offlineUrl = `http://${serverIp}:${serverFrontendPort}`; // URL of the offline local network app

  // Function to check if the app is connected to the local network
  function checkLocalNetwork() {
    const hostname = window.location.hostname;

    // If hostname matches local network (10.0.x.x), load the iframe
    if (localNetworkRegex.test(hostname)) {
      isConnectedToLocalNetwork = true;
    } else {
      isConnectedToLocalNetwork = false;
    }
  }

  // Call the check function on load
  checkLocalNetwork();
</script>

<div class="container">
  <!-- Display based on whether the user is connected to the local network or not -->
  {#if isConnectedToLocalNetwork}
    <h1>Connected to Local Network</h1>
    <p>Loading app...</p>

    <!-- Automatically load the iframe if connected to the local network -->
    <div class="iframe-container">
      <iframe
        src={offlineUrl}
        title="Offline Mode"
        width="100%"
        height="100%"
        frameborder="0"
      ></iframe>
    </div>
  {:else}
    <h1>Offline Mode</h1>
    <p>You are not connected to the local network.</p>
  {/if}
</div>

<style>
  .container {
    padding: 2rem;
    font-family: Arial, sans-serif;
  }

  .iframe-container {
    width: 100%;
    height: 80vh; /* Adjust this height as needed */
    margin-top: 1rem;
  }

  iframe {
    border: none;
  }
</style>
