<script lang="ts">
  import { DarkMode } from "flowbite-svelte";
  let serverIp = ""; // IP address input
  let serverFrontendPort: number; // Port where the desktop app's frontend is served
  let showIframe = false; // Tracks if the iframe should be shown

  // Function to handle connecting to the specified IP
  function connectToIp() {
    if (serverIp) {
      showIframe = true; // Show the iframe when an IP is entered
    }
  }

  function presetsHandler(ip: string, port: number) {
    serverIp = ip;
    serverFrontendPort = port;
  }
</script>

<DarkMode class="fixed top-2 left-2">Toggle</DarkMode>

<div class="container">
  {#if !showIframe}
    <h1>Connect to Server</h1>
    <input
      type="text"
      bind:value={serverIp}
      placeholder="Enter WebSocket Server IP"
      class="input-ip"
    />
    <input
      type="number"
      bind:value={serverFrontendPort}
      placeholder="Enter Frontend Port"
      class="input-ip"
    />
    <button on:click={connectToIp} id="connect-button">Connect</button>
    <div class="recommended-ip-buttons">
      <h3>Recommended IP's</h3>
      <button on:click={() => presetsHandler("10.0.23.245", 5173)}
        >10.0.23.245</button
      >
      <button on:click={() => presetsHandler("192.168.0.1", 5173)}
        >192.168.0.1</button
      >
    </div>
  {:else}
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100svh;
    gap: 1rem;
    & h1 {
      font-size: 2rem;
    }
  }

  .recommended-ip-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    backdrop-filter: blur(5px);
    padding: 1rem;
    margin-top: 2rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }
  .iframe-container {
    width: 100vw;
    height: 100vh;
  }
  #connect-button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: var(--secondary);
    border: none;
    cursor: pointer;
    transition: background-color 0.1s;
    &:active {
      background-color: var(--accent);
    }
  }

  iframe {
    border: none;
  }

  .input-ip {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: var(--background);
    border: 1px solid var(--border);
  }
</style>
