<script lang="ts">
  let socket: WebSocket;
  let receivedAssessment: {
    title: any;
    description: any;
    questions: any;
  } | null = null;
  let connectionStatus = "Connecting...";
  let serverIp = "10.0.23.245"; // Default IP address
  let serverPort = "8080"; // WebSocket port

  // Check if the IP address is on a local network
  function isLocalIp(ip: string): boolean {
    const localIPRegex = /^(10\.|192\.168\.)/; // Local IP address ranges
    return localIPRegex.test(ip);
  }

  // Dynamically determine WebSocket protocol based on IP
  function getWebSocketProtocol(): string {
    if (isLocalIp(serverIp)) {
      return "ws"; // Force ws for local IPs
    }
    return window.location.protocol === "https:" ? "wss" : "ws";
  }

  // Connect to the WebSocket server
  function connectWebSocket() {
    const protocol = getWebSocketProtocol();
    // Create WebSocket connection
    socket = new WebSocket(`${protocol}://${serverIp}:${serverPort}`);

    socket.onopen = () => {
      connectionStatus = "Connected";
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      try {
        const assessment = JSON.parse(event.data);
        receivedAssessment = assessment;
        console.log("Received assessment:", assessment);
      } catch (error) {
        console.error("Failed to parse message:", event.data);
      }
    };

    socket.onclose = () => {
      connectionStatus = "Disconnected";
      console.log("Disconnected from WebSocket server");
    };

    socket.onerror = (error) => {
      connectionStatus = "Error occurred";
      console.error("WebSocket error:", error);
    };
  }
</script>

<div class="container">
  <div class="display-protocol-and-ip-address">
    <p>WebSocket Protocol: {getWebSocketProtocol()}</p>
    <p>WebSocket Server IP: {serverIp}</p>
  </div>
  <h1>Student WebSocket Client</h1>
  <input type="text" bind:value={serverIp} placeholder="Enter WebSocket Server IP" />
  <button on:click={connectWebSocket}>Connect</button>
  <p class="status">{connectionStatus}</p>

  {#if receivedAssessment}
    <h2>Assessment Received:</h2>
    <h3>{receivedAssessment.title}</h3>
    <p>{@html receivedAssessment.description}</p>

    <ul>
      {#each receivedAssessment.questions as question (question.id)}
        <li><strong>{question.type}</strong>: {question.content}</li>
      {/each}
    </ul>
  {:else}
    <p>No assessment received yet.</p>
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

  .disconnected {
    color: red;
  }
</style>
