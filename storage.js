

function saveToDevice (key, value) {
    localStorage.setItem(key, value)
}

function readFromDevice (key) {
    try {
        const serializedValue = localStorage.getItem(key);

        if (serializedValue === null) {
                return null;
        }
            
        return serializedValue;
    } catch {
        return null;
    }
}