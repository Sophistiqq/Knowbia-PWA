<script lang="ts">
  let serverIp = ""; // IP address input
  let serverFrontendPort = "5173"; // Port where the desktop app's frontend is served
  let showIframe = false; // Tracks if the iframe should be shown

  // Function to handle connecting to the specified IP
  function connectToIp() {
    if (serverIp) {
      showIframe = true; // Show the iframe when an IP is entered
    }
  }
</script>

<div class="container">
  {#if !showIframe}
    <h1>Connect to Local App</h1>
    <input type="text" bind:value={serverIp} placeholder="Enter WebSocket Server IP" />
    <button on:click={connectToIp}>Connect</button>
  {:else}
    <!-- If the IP is entered, load it in an iframe -->
    <h1>Connected to Local Network</h1>
    <div class="iframe-container">
      <iframe
        src={`http://${serverIp}:${serverFrontendPort}`}
        title="Offline Mode"
        width="100%"
        height="100%"
        frameborder="0"
      ></iframe>
    </div>
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
