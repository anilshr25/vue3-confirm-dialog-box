class Event {
    constructor() {
        this.events = {};
    }

    on(eventName, fn) {
        if (typeof fn !== 'function') {
            throw new Error('Event listener must be a function');
        }
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    }

    off(eventName, fn) {
        if (this.events[eventName]) {
            if (!fn) {
                // Remove all listeners for this event
                delete this.events[eventName];
                return;
            }
            
            const index = this.events[eventName].indexOf(fn);
            if (index > -1) {
                this.events[eventName].splice(index, 1);
                
                // Clean up empty arrays
                if (this.events[eventName].length === 0) {
                    delete this.events[eventName];
                }
            }
        }
    }

    emit(eventName, data) {
        if (this.events[eventName]) {
            // Create a copy to avoid issues if listeners are removed during iteration
            const listeners = [...this.events[eventName]];
            listeners.forEach(fn => {
                try {
                    fn(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }

    // Clean up all events (useful for testing or cleanup)
    removeAllListeners() {
        this.events = {};
    }
}

export default new Event();