class SchemaService {
    constructor() {
        this.socket = null;
        this.listeners = [];
    }

    connect() {
        try {
            this.socket = new WebSocket('ws://localhost:8080/ws/schema');

            this.socket.onopen = () => {
                console.log('WebSocket connected to backend');
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Received from backend:', data);
                this.notifyListeners(data);
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }

    sendSchema(nodes, edges) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const schemaData = {
                type: 'SCHEMA_UPDATE',
                nodes: nodes,
                edges: edges,
                timestamp: new Date().toISOString()
            };
            this.socket.send(JSON.stringify(schemaData));
            console.log('Sent schema to backend:', schemaData);
        } else {
            console.log('WebSocket not connected, schema not sent');
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(data) {
        this.listeners.forEach(callback => callback(data));
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

export const schemaService = new SchemaService();