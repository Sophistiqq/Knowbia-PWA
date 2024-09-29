<script lang="ts">
  let serverIp = "10.0.23.245"; // Default IP address (desktop app)
  let serverFrontendPort = "5173"; // Frontend port for the offline mode (pseudo offline mode)
  let connectionStatus = "Not connected"; // Default status

  // Check if the app is in Offline Mode
  let isOfflineMode = false;

  // Function to open Offline Mode (pseudo)
  function openOfflineMode() {
    isOfflineMode = true;
    window.location.href = `http://${serverIp}:${serverFrontendPort}`;
  }
</script>

<div class="container">
  <h1>Student Assessment App</h1>

  <!-- Display protocol and server IP -->
  <div class="display-server-info">
    <p>Frontend Server IP: {serverIp}</p>
    <p>Frontend Server Port: {serverFrontendPort}</p>
  </div>

  <!-- Option to open offline mode -->
  <button on:click={openOfflineMode}>Open Offline Mode</button>
  <p class="status">{connectionStatus}</p>

  <!-- Check if we're in offline mode and show instructions -->
  {#if isOfflineMode}
    <p>You are now operating in Offline Mode. Redirecting to local frontend...</p>
  {:else}
    <p>Click the button above to access the local network frontend and start the assessment.</p>
  {/if}
</div>

<style>
  .container {
    padding: 2rem;
    font-family: Arial, sans-serif;
  }

  .status {
    font-weight: bold;
    color: green;
  }

  .display-server-info {
    margin-bottom: 1rem;
  }
</style>
